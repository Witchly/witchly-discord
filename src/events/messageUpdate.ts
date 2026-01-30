import { Events, Message, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { getLogChannel } from '../utils/modUtils';

const event: BotEvent = {
  name: Events.MessageUpdate,
  execute: async (oldMessage: Message, newMessage: Message) => {
    if (oldMessage.partial || newMessage.partial || oldMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Embed updates

    const channel = await getLogChannel(newMessage.guild!);
    if (!channel) return;

    const embed = createEmbed(
      'Message Edited',
      `**User:** ${newMessage.author.tag} (${newMessage.author.id})\n**Channel:** ${newMessage.channel.toString()}\n\n**Before:**\n${oldMessage.content}\n\n**After:**\n${newMessage.content}`,
      config.colors.warning
    );

    await channel.send({ embeds: [embed] });
  },
};

export default event;
