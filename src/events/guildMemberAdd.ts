import { Events, GuildMember, TextChannel, User as DiscordUser } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { getLogChannel } from '../utils/modUtils';
import { inviteCache, updateGuildInvites } from '../utils/inviteCache';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    // 1. Invite Tracking
    const cachedInvites = inviteCache.get(member.guild.id);
    const currentInvites = await member.guild.invites.fetch();
    
    let inviter: DiscordUser | null = null;
    let inviteUses = 0;

    if (cachedInvites) {
      const usedInvite = currentInvites.find(i => {
        const prevUses = cachedInvites.get(i.code) || 0;
        return (i.uses || 0) > prevUses;
      });

      if (usedInvite && usedInvite.inviter) {
        inviter = usedInvite.inviter;
      }
    }

    // Update Cache
    await updateGuildInvites(member.guild);

    // 2. Database Record
    if (inviter) {
      // Ensure inviter exists in DB
      await prisma.user.upsert({
        where: { id: inviter.id },
        update: {},
        create: { id: inviter.id }
      });

      // Record new user with inviter
      await prisma.user.upsert({
        where: { id: member.id },
        update: { inviterId: inviter.id },
        create: { id: member.id, inviterId: inviter.id }
      });

      // Get inviter's stats
      const inviteeCount = await prisma.user.count({
        where: { inviterId: inviter.id }
      });
      inviteUses = inviteeCount;
    } else {
      // Ensure user exists even if no inviter found
      await prisma.user.upsert({
        where: { id: member.id },
        update: {},
        create: { id: member.id }
      });
    }

    // 3. Auto Role
    const roleId = '1459184035489382430';
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role).catch(err => logger.error(`Failed to assign role: ${err}`));
    }

    // 4. Welcome Message
    const guildConfig = await prisma.guildConfig.findUnique({ where: { id: member.guild.id } });
    let channelId: string | undefined = guildConfig?.welcomeChannelId || config.welcomeChannelId;
    
    if (!channelId) {
      const c = member.guild.channels.cache.find(ch => ch.name.includes('welcome') && ch.isTextBased());
      channelId = c?.id;
    }

    if (channelId) {
      const channel = member.guild.channels.cache.get(channelId) as TextChannel;
      if (channel) {
        let welcomeDesc = `Welcome ${member.toString()} to **Witchly.host**!\n\nMake sure to read the rules and check out <#${member.guild.channels.cache.find(c => c.name.includes('info'))?.id || 'channels'}>.`;
        
        if (inviter) {
          welcomeDesc += `\n\n**Invited By:** ${inviter.toString()}\n**Total Invites:** ${inviteUses}`;
        }

        const embed = createEmbed(
          'Welcome to Witchly!',
          welcomeDesc,
          config.colors.primary
        )
        .setThumbnail(member.user.displayAvatarURL());

        await channel.send({ embeds: [embed] }).catch(err => logger.error(`Welcome message error: ${err}`));
      }
    }

    // 5. Log Join
    const logChannel = await getLogChannel(member.guild);
    if (logChannel) {
      const logEmbed = createEmbed(
        'Member Joined',
        `**User:** ${member.toString()} (${member.user.tag})\n**ID:** ${member.id}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>${inviter ? `\n**Invited By:** ${inviter.tag} (${inviter.id})` : ''}`,
        config.colors.success
      ).setThumbnail(member.user.displayAvatarURL());
      
      await logChannel.send({ embeds: [logEmbed] }).catch(err => logger.error(`Log join error: ${err}`));
    }
  },
};

export default event;
