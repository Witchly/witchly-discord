import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { getLogChannel } from '../utils/modUtils';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    // 1. Auto Role
    const roleId = '1459184035489382430';
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      await member.roles.add(role).catch(err => logger.error(`Failed to assign role: ${err}`));
    }

    // 2. Welcome Message
    // Check DB for channel or use config
    const guildConfig = await prisma.guildConfig.findUnique({ where: { id: member.guild.id } });
    let channelId: string | undefined = guildConfig?.welcomeChannelId || config.welcomeChannelId;
    
    // Fallback search
    if (!channelId) {
      const c = member.guild.channels.cache.find(ch => ch.name.includes('welcome') && ch.isTextBased());
      channelId = c?.id;
    }

    if (channelId) {
      const channel = member.guild.channels.cache.get(channelId) as TextChannel;
      if (channel) {
        const embed = createEmbed(
          'Welcome to Witchly!',
          `Welcome ${member.toString()} to **Witchly.host**!\n\nMake sure to read the rules and check out <#${member.guild.channels.cache.find(c => c.name.includes('info'))?.id || 'channels'}>.`,
          config.colors.primary
        )
        .setThumbnail(member.user.displayAvatarURL());

        await channel.send({ embeds: [embed] });
      }
    }

    // 3. Log Join
    const logChannel = await getLogChannel(member.guild);
    if (logChannel) {
      const logEmbed = createEmbed(
        'Member Joined',
        `**User:** ${member.toString()} (${member.user.tag})\n**ID:** ${member.id}\n**Account Created:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`,
        config.colors.success
      ).setThumbnail(member.user.displayAvatarURL());
      
      await logChannel.send({ embeds: [logEmbed] });
    }
  },
};

export default event;
