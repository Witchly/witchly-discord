import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
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
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
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
