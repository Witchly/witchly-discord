import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { logAction, notifyUser } from '../utils/modUtils';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server.')
    .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason for the kick').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ embeds: [createErrorEmbed('User not found in this server.')], ephemeral: true });
      return;
    }

    if (!member.kickable) {
      await interaction.reply({ embeds: [createErrorEmbed('I cannot kick this user.')], ephemeral: true });
      return;
    }

    const dmSent = await notifyUser(user, 'Kicked', interaction.guild!.name, reason, interaction.user.tag);

    await member.kick(`${reason} (By ${interaction.user.tag})`);
    await logAction(interaction.guild!, 'Kick', user, interaction.user, reason);

    await interaction.reply({ embeds: [createSuccessEmbed(`**${user.tag}** has been kicked.${dmSent ? ' (DM Sent)' : ' (DM Failed)'}
Reason: ${reason}`)] });
  }
};

export default command;
