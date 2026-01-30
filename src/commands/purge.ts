import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { createSuccessEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes a number of messages.')
    .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount', true);

    if (amount < 1 || amount > 100) {
      await interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
      return;
    }

    const channel = interaction.channel;
    if (channel?.isTextBased() && !channel.isDMBased()) {
      await channel.bulkDelete(amount, true);
      await interaction.reply({ embeds: [createSuccessEmbed(`Deleted ${amount} messages.`)], ephemeral: true });
    }
  }
};

export default command;
