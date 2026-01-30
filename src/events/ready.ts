import { Events } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.success(`Ready! Logged in as ${client.user.tag}`);
  },
};

export default event;
