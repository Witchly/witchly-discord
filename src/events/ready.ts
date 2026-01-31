import { Events, ActivityType, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';
import { updateGuildInvites } from '../utils/inviteCache';
import { config } from '../utils/config';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    logger.success(`Ready! Logged in as ${client.user.tag}`);

    // Initialize Invite Cache
    for (const guild of client.guilds.cache.values()) {
      await updateGuildInvites(guild);
    }

    const activities = [
      { name: 'Minecraft', type: ActivityType.Playing },
      { name: 'Hytale', type: ActivityType.Playing },
      { name: 'Palworld', type: ActivityType.Playing },
      { name: 'Rust', type: ActivityType.Playing },
      { name: 'Minecraft', type: ActivityType.Streaming, url: 'https://twitch.tv/witchlyhost' },
      { name: 'Palworld', type: ActivityType.Streaming, url: 'https://twitch.tv/witchlyhost' },
      { name: 'Rust', type: ActivityType.Streaming, url: 'https://twitch.tv/witchlyhost' },
      { name: 'Hytale', type: ActivityType.Streaming, url: 'https://twitch.tv/witchlyhost' },
    ];

    let index = 0;

    client.user.setStatus('dnd');

    setInterval(() => {
      const activity = activities[index];
      client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
      index = (index + 1) % activities.length;
    }, 15000);

    // Auto-Bump Reminder (Every 120 minutes)
    const sendBumpReminder = async () => {
      try {
        const channel = await client.channels.fetch(config.bumpChannelId);
        if (channel && channel instanceof TextChannel) {
          await channel.send('@everyone **Time to bump!** Please use `/bump` to keep Witchly at the top of Disboard.');
          logger.info('Sent bump reminder to the promotion channel.');
        }
      } catch (error) {
        logger.error(`Failed to send bump reminder: ${error}`);
      }
    };

    // Send initial reminder and start interval
    sendBumpReminder();
    setInterval(sendBumpReminder, 120 * 60 * 1000);
  },
};

export default event;
