import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { config } from './utils/config';
import { logger } from './utils/logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

// Load handlers
(async () => {
  loadEvents(client);
  await loadCommands(client);
  
  client.login(config.token).catch((err) => {
    logger.error(`Login failed: ${err}`);
  });
})();

export default client;
