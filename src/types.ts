import { ChatInputCommandInteraction, SlashCommandBuilder, Client } from 'discord.js';

export interface Command {
  data: any; // Using any to support all Builder variants (SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, etc.)
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotEvent {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
}
