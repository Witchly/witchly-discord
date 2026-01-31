import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { config } from '../utils/config';
import { prisma } from '../utils/prisma';
import { createEmbed } from '../utils/embeds';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Shows invite stats for a user')
    .addUserOption(opt => opt.setName('user').setDescription('The user to check')),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    const userData = await prisma.user.findUnique({
      where: { id: targetUser.id },
      include: {
        inviter: true,
        _count: {
          select: { invitees: true }
        }
      }
    });

    const totalInvites = userData?._count.invitees || 0;
    const inviterMention = userData?.inviter ? `<@${userData.inviterId}>` : 'Unknown/None';

    const embed = createEmbed(
      'Invite Stats',
      `**User:** ${targetUser.toString()}\n**Invited By:** ${inviterMention}\n**Total Invites:** ${totalInvites}`,
      config.colors.primary
    ).setThumbnail(targetUser.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
