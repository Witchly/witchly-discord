import { SlashCommandBuilder } from 'discord.js';
import { Command } from '../types';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';
import { createEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows the top 10 inviters'),
  
  async execute(interaction) {
    const topInviters = await prisma.user.findMany({
      where: {
        invitees: { some: {} }
      },
      select: {
        id: true,
        _count: {
          select: { invitees: true }
        }
      },
      orderBy: {
        invitees: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const embed = createEmbed(
      '🏆 Invite Leaderboard',
      topInviters.length > 0 
        ? topInviters.map((u, i) => `**${i + 1}.** <@${u.id}> — ${u._count.invitees} invites`).join('\n')
        : 'No invites tracked yet.',
      config.colors.primary
    );

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
