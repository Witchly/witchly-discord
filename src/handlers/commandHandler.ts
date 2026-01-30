import fs from 'fs';
import path from 'path';
import { Client, REST, Routes, Collection } from 'discord.js';
import { Command } from '../types';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

export const commands = new Collection<string, Command>();

export const loadCommands = async (client: Client) => {
  const commandsPath = path.join(__dirname, '../commands');
  
  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  const commandsToRegister = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command: Command = require(filePath).default;

    if ('data' in command && 'execute' in command) {
      commands.set(command.data.name, command);
      commandsToRegister.push(command.data.toJSON());
      logger.info(`Loaded command: ${command.data.name}`);
    } else {
      logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  // Deploy commands
  const rest = new REST({ version: '10' }).setToken(config.token);

  try {
    logger.info('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commandsToRegister },
    );

    logger.success('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error(`Failed to reload commands: ${error}`);
  }
};
