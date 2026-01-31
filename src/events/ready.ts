import { Events, ActivityType } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';
import { updateGuildInvites } from '../utils/inviteCache';

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
  },
};

export default event;
