import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

const event: BotEvent = {
  name: Events.GuildMemberAdd,
  execute: async (member: GuildMember) => {
    // 1. Auto Role
    const role = member.guild.roles.cache.find(r => r.name === 'Member');
    if (role) {
      await member.roles.add(role).catch(err => logger.error(`Failed to assign role: ${err}`));
    }

    // 2. Welcome Message
    // Check DB for channel
    const guildConfig = await prisma.guildConfig.findUnique({ where: { id: member.guild.id } });
    let channelId = guildConfig?.welcomeChannelId;
    
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
  },
};

export default event;
