import { Events, GuildMember, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { getLogChannel } from '../utils/modUtils';

const event: BotEvent = {
  name: Events.GuildMemberRemove,
  execute: async (member: GuildMember) => {
    const logChannel = await getLogChannel(member.guild);
    if (logChannel) {
      const logEmbed = createEmbed(
        'Member Left',
        `**User:** ${member.toString()} (${member.user.tag})\n**ID:** ${member.id}\n**Joined At:** <t:${Math.floor((member.joinedTimestamp || Date.now()) / 1000)}:R>`,
        config.colors.error
      ).setThumbnail(member.user.displayAvatarURL());
      
      await logChannel.send({ embeds: [logEmbed] });
    }
  },
};

export default event;
