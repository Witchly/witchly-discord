import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Command } from '../types';
import { createEmbed } from '../utils/embeds';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Sends the ticket panel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const embed = createEmbed(
      'Support Tickets',
      'Click the button below to open a support ticket.\n\nOur team will assist you shortly.',
      config.colors.primary
    );

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Open Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🎫')
      );

    const channel = interaction.channel;
    if (channel?.isTextBased() && !channel.isDMBased()) {
      await (channel as TextChannel).send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'Panel sent!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Cannot send panel in this channel.', ephemeral: true });
    }
  }
};

export default command;
