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

    // Auto-Bump Reminder/Execution (Every 120 minutes)
    setInterval(async () => {
      try {
        const channel = await client.channels.fetch(config.bumpChannelId);
        if (channel && channel instanceof TextChannel) {
          await channel.send('/bump');
          logger.info('Sent /bump message to the promotion channel.');

          // Wait for Disboard response (Bot ID: 302050872383242240)
          const collector = channel.createMessageCollector({
            filter: (m) => m.author.id === '302050872383242240',
            time: 15000,
            max: 1,
          });

          collector.on('end', (collected) => {
            if (collected.size === 0) {
              channel.send(`⚠️ **Auto-Bump failed or was ignored by Disboard.**\nSince I'm a bot, Disboard might ignore my text commands. Please bump manually using \`/bump\`.`);
              logger.warn('Auto-bump confirmation not received from Disboard.');
            } else {
              logger.success('Auto-bump confirmed by Disboard bot.');
            }
          });
        }
      } catch (error) {
        logger.error(`Failed to send auto-bump: ${error}`);
      }
    }, 120 * 60 * 1000);
  },
};

export default event;
