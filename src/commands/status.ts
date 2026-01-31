import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { Command } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';
import axios from 'axios';

const checkService = async (url: string, name: string) => {
  const start = Date.now();
  try {
    await axios.get(url, { timeout: 5000 });
    const ping = Date.now() - start;
    return `🟢 **${name}**: Online (${ping}ms)`;
  } catch (error) {
    return `🔴 **${name}**: Offline`;
  }
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the status of Witchly services.'),
  
  async execute(interaction) {
    await interaction.deferReply();

    const results = await Promise.all([
      checkService('https://witchly.host', 'Website'),
      checkService('https://panel.witchly.host', 'Panel'),
      checkService('https://billing.witchly.host', 'Billing'),
    ]);

    const embed = createEmbed(
      'System Status',
      results.join('\n'),
      config.colors.primary
    );

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Detailed Status Page')
          .setStyle(ButtonStyle.Link)
          .setURL('https://status.witchly.host') 
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};

export default command;
