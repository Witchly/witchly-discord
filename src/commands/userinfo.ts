import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Displays information about a user.')
    .addUserOption(option => option.setName('user').setDescription('The user')),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild?.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle(`User Info: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .setColor(config.colors.primary)
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Created At', value: user.createdAt.toDateString(), inline: true },
        { name: 'Joined At', value: member?.joinedAt?.toDateString() || 'N/A', inline: true },
        { name: 'Roles', value: member?.roles.cache.map(r => r.toString()).join(' ') || 'None' }
      );

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
