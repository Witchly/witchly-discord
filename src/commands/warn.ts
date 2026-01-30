import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Command } from '../types';
import { logAction, notifyUser } from '../utils/modUtils';
import { createSuccessEmbed, createErrorEmbed } from '../utils/embeds';
import { prisma } from '../utils/prisma';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warns a user.')
    .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for warn').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    // Ensure user exists in DB
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: { id: user.id },
    });

    // Create Warn
    await prisma.warn.create({
      data: {
        userId: user.id,
        reason: reason,
        moderatorId: interaction.user.id,
      }
    });

    const dmSent = await notifyUser(user, 'Warned', interaction.guild!.name, reason, interaction.user.tag);
    await logAction(interaction.guild!, 'Warn', user, interaction.user, reason);

    await interaction.reply({ embeds: [createSuccessEmbed(`**${user.tag}** has been warned.${dmSent ? ' (DM Sent)' : ' (DM Failed)'}
Reason: ${reason}`)] });
  }
};

export default command;
