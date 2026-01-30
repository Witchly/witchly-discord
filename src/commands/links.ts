import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('links')
    .setDescription('Get useful links for Witchly.'),
  
  async execute(interaction) {
    const embed = createEmbed('Witchly Links', 'Here are the official links:', config.colors.primary);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder().setLabel('Website').setStyle(ButtonStyle.Link).setURL(config.links.website),
        new ButtonBuilder().setLabel('Panel').setStyle(ButtonStyle.Link).setURL(config.links.panel),
        new ButtonBuilder().setLabel('Billing').setStyle(ButtonStyle.Link).setURL(config.links.billing),
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};

export default command;
