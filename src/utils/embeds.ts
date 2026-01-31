import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { config } from './config';

export const createEmbed = (title: string, description: string, color: ColorResolvable = config.colors.primary as ColorResolvable) => {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp()
    .setFooter({ text: 'Witchly.host', iconURL: config.links.logo });
};

export const createSuccessEmbed = (description: string) => createEmbed('Success', description, config.colors.success as ColorResolvable);
export const createErrorEmbed = (description: string) => createEmbed('Error', description, config.colors.error as ColorResolvable);
export const createWarningEmbed = (description: string) => createEmbed('Warning', description, config.colors.warning as ColorResolvable);
