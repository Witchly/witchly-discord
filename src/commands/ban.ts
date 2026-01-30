import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { logAction, notifyUser } from '../utils/modUtils';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server.')
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for the ban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ embeds: [createErrorEmbed('User not found in this server.')], ephemeral: true });
      return;
    }

    if (!member.bannable) {
      await interaction.reply({ embeds: [createErrorEmbed('I cannot ban this user (they might have higher roles).')], ephemeral: true });
      return;
    }

    // Notify User
    const dmSent = await notifyUser(user, 'Banned', interaction.guild!.name, reason, interaction.user.tag);

    // Perform Ban
    await member.ban({ reason: `${reason} (By ${interaction.user.tag})` });

    // Log
    await logAction(interaction.guild!, 'Ban', user, interaction.user, reason);

    await interaction.reply({ embeds: [createSuccessEmbed(`**${user.tag}** has been banned.${dmSent ? ' (DM Sent)' : ' (DM Failed)'}\nReason: ${reason}`)] });
  }
};

export default command;
