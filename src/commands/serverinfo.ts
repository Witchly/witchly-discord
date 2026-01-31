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
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Created At', value: guild.createdAt.toDateString(), inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true },
        { name: 'Channels', value: `Total: ${guild.channels.cache.size} | Text: ${guild.channels.cache.filter(c => c.isTextBased()).size} | Voice: ${guild.channels.cache.filter(c => c.isVoiceBased()).size}`, inline: false },
        { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
        { name: 'Emojis', value: guild.emojis.cache.size.toString(), inline: true },
        { name: 'Stickers', value: guild.stickers.cache.size.toString(), inline: true },
      );

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 1024 })!);
    }

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
