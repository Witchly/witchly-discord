import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { logAction, notifyUser } from '../utils/modUtils';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeouts a user.')
    .addUserOption(option => option.setName('user').setDescription('The user to timeout').setRequired(true))
    .addIntegerOption(option => option.setName('duration').setDescription('Duration in minutes').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for timeout').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const duration = interaction.options.getInteger('duration', true);
    const reason = interaction.options.getString('reason', true);
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    if (!member) {
      await interaction.reply({ embeds: [createErrorEmbed('User not found.')], ephemeral: true });
      return;
    }

    if (!member.moderatable) {
      await interaction.reply({ embeds: [createErrorEmbed('I cannot timeout this user.')], ephemeral: true });
      return;
    }

    const dmSent = await notifyUser(user, `Timed out (${duration}m)`, interaction.guild!.name, reason, interaction.user.tag);

    await member.timeout(duration * 60 * 1000, `${reason} (By ${interaction.user.tag})`);
    await logAction(interaction.guild!, `Timeout (${duration}m)`, user, interaction.user, reason);

    await interaction.reply({ embeds: [createSuccessEmbed(`**${user.tag}** has been timed out for ${duration} minutes.${dmSent ? ' (DM Sent)' : ' (DM Failed)'}
Reason: ${reason}`)] });
  }
};

export default command;
