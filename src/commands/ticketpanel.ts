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
      'Witchly.host Support',
      '**Need assistance?**\nClick the button below to open a support ticket.\n\n**🛑 STOP & READ BEFORE OPENING:**\nMost questions are already answered in our Knowledge Base. Please check there first to save time!\n\n🔗 **[Read the Documentation](https://docs.witchly.host)**\n\n**If you still need help:**\n• You will be asked to provide a **Valid Reason** for your ticket.\n• "Hi" or "Help me" are NOT valid reasons.\n• Please describe your issue clearly so our team can assist you faster.',
      config.colors.primary
    ).setImage(config.links.banner);

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
