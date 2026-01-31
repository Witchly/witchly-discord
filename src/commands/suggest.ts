import { SlashCommandBuilder, TextChannel } from 'discord.js';
import { Command } from '../types';
import { createEmbed, createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion for Witchly.')
    .addStringOption(option => option.setName('suggestion').setDescription('Your suggestion').setRequired(true)),
  
  async execute(interaction) {
    const suggestion = interaction.options.getString('suggestion', true);

    // 1. Restriction Check
    const allowedChannelId = '1459196151432740949';
    if (interaction.channelId !== allowedChannelId) {
      await interaction.reply({ 
        embeds: [createErrorEmbed(`You can only use this command in <#${allowedChannelId}>.`)], 
        ephemeral: true 
      });
      return;
    }
    
    // 2. Target Channel
    const targetChannelId = '1466752405936017616';
    const channel = interaction.guild?.channels.cache.get(targetChannelId) as TextChannel;

    if (!channel) {
      await interaction.reply({ embeds: [createErrorEmbed('Suggestions channel configuration error. Please contact an admin.')], ephemeral: true });
      return;
    }

    const embed = createEmbed(
      'New Suggestion',
      `${suggestion}\n\n**Submitted by:** ${interaction.user.toString()}`,
      config.colors.primary
    ).setThumbnail(interaction.user.displayAvatarURL());

    const message = await channel.send({ content: `Suggestion by ${interaction.user.toString()}`, embeds: [embed] });
    await message.react('✅');
    await message.react('❌');

    await interaction.reply({ embeds: [createSuccessEmbed(`Suggestion posted in <#${targetChannelId}>!`)], ephemeral: true });
  }
};

export default command;
