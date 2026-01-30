import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';
import { BotEvent } from '../types';
import { logger } from '../utils/logger';

export const loadEvents = (client: Client) => {
  const eventsPath = path.join(__dirname, '../events');
  
  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath);
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event: BotEvent = require(filePath).default;
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    logger.info(`Loaded event: ${event.name}`);
  }
};
