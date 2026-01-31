import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { createEmbed, createErrorEmbed } from '../utils/embeds';
import { docIndexer } from '../utils/docIndexer';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('docs')
    .setDescription('Search the Witchly Knowledge Base.')
    .addStringOption(option => option.setName('query').setDescription('What are you looking for?').setRequired(true)),
  
  async execute(interaction) {
    const query = interaction.options.getString('query', true);
    
    await interaction.deferReply();
    await docIndexer.fetchDocs(); // Ensure cache is warm

    const results = docIndexer.search(query);

    if (results.length === 0) {
      await interaction.editReply({ embeds: [createErrorEmbed('No documentation found for that query.')] });
      return;
    }

    const topResults = results.slice(0, 5);
    const description = topResults.map(r => `• [**${r.title}**](${r.url})`).join('\n');

    const embed = createEmbed(
      `Docs Search: "${query}"`, 
      description,
      config.colors.primary
    );

    await interaction.editReply({ embeds: [embed] });
  }
};

export default command;
