import { Events, Message, TextChannel, AuditLogEvent } from 'discord.js';
import { BotEvent } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import { getLogChannel } from '../utils/modUtils';

const event: BotEvent = {
  name: Events.MessageDelete,
  execute: async (message: Message) => {
    // If we have the author and it's a bot, ignore. If author is null (partial), proceed.
    if (message.author?.bot) return;

    const channel = await getLogChannel(message.guild!);
    if (!channel) return;

    let executor = null;
    let targetUser = message.author; // May be null if partial

    try {
      const fetchedLogs = await message.guild!.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete,
      });
      const deletionLog = fetchedLogs.entries.first();

      // Check if log entry is recent (within 5s) and matches channel
      if (
        deletionLog &&
        deletionLog.target &&
        // @ts-ignore - 'extra' exists on MessageDelete type
        deletionLog.extra.channel.id === message.channel.id &&
        (Date.now() - deletionLog.createdTimestamp) < 5000
      ) {
        // If we didn't know the author (partial), or if it matches, use the log details
        if (!targetUser || targetUser.id === deletionLog.target.id) {
           executor = deletionLog.executor;
           if (!targetUser) targetUser = deletionLog.target as any; // Cast to User
        }
      }
    } catch (e) {
      console.error('Failed to fetch audit logs for delete:', e);
    }

    const deleteType = executor 
      ? `Deleted by **${executor.tag}**` 
      : 'Self-deleted (or unknown)';

    const userTag = targetUser ? `${targetUser.tag} (${targetUser.id})` : 'Unknown User (Uncached)';
    const msgContent = message.content ? message.content : '*[Content Unavailable - Message Uncached]*';

    const embed = createEmbed(
      'Message Deleted',
      `**User:** ${userTag}\n**Channel:** ${message.channel.toString()}\n**Action:** ${deleteType}\n\n**Content:**\n${msgContent}`,
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
