import { Events, Message, TextChannel, AuditLogEvent } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { getLogChannel } from '../utils/modUtils';

const event: BotEvent = {
  name: Events.MessageDelete,
  execute: async (message: Message) => {
    if (message.partial || message.author?.bot) return;

    const channel = await getLogChannel(message.guild!);
    if (!channel) return;

    const embed = createEmbed(
      'Message Deleted',
      `**User:** ${message.author.tag} (${message.author.id})\n**Channel:** ${message.channel.toString()}\n**Content:**\n${message.content}`,
      config.colors.error
    );

    await channel.send({ embeds: [embed] });
  },
};

export default event;
