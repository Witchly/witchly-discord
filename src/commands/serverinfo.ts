import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import { Command } from '../types';
import { config } from '../utils/config';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about the server.'),
  
  async execute(interaction) {
    const guild = interaction.guild!;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL() || '')
      .setColor(config.colors.primary)
      .addFields(
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Created At', value: guild.createdAt.toDateString(), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
