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

    let executor = null;
    try {
      const fetchedLogs = await message.guild!.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete,
      });
      const deletionLog = fetchedLogs.entries.first();

      // Check if log entry is recent (within 5s) and matches target/channel
      if (
        deletionLog &&
        deletionLog.target &&
        deletionLog.target.id === message.author.id &&
        // @ts-ignore - 'extra' exists on MessageDelete type
        deletionLog.extra.channel.id === message.channel.id &&
        (Date.now() - deletionLog.createdTimestamp) < 5000
      ) {
        executor = deletionLog.executor;
      }
    } catch (e) {
      console.error('Failed to fetch audit logs for delete:', e);
    }

    const deleteType = executor 
      ? `Deleted by **${executor.tag}**` 
      : 'Self-deleted (or unknown)';

    const embed = createEmbed(
      'Message Deleted',
      `**User:** ${message.author.tag} (${message.author.id})\n**Channel:** ${message.channel.toString()}\n**Action:** ${deleteType}\n\n**Content:**\n${message.content || '*[No Content/Image]*'}`,
      config.colors.error
    );

    if (executor) {
      embed.setFooter({ text: `Deleted by ${executor.tag}`, iconURL: executor.displayAvatarURL() });
    } else {
      embed.setFooter({ text: 'Self-deleted or invalid audit log match' });
    }

    await channel.send({ embeds: [embed] });
  },
};

export default event;
