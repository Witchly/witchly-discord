import { Guild, User, EmbedBuilder, TextChannel, Colors } from 'discord.js';
import { prisma } from './prisma';
import { config } from './config';
import { logger } from './logger';
import { createEmbed } from './embeds';

export async function getLogChannel(guild: Guild) {
  const guildConfig = await prisma.guildConfig.findUnique({ where: { id: guild.id } });
  
  if (guildConfig?.logChannelId) {
    const channel = guild.channels.cache.get(guildConfig.logChannelId);
    if (channel?.isTextBased()) return channel as TextChannel;
  }

  // Use the specific moderation log channel from config
  const configChannel = guild.channels.cache.get(config.moderationLogChannelId);
  if (configChannel?.isTextBased()) return configChannel as TextChannel;

  // Final fallback
  return guild.channels.cache.find(c => c.name === 'witchly-logs' && c.isTextBased()) as TextChannel | undefined;
}

export async function logAction(
  guild: Guild,
  action: string,
  target: User,
  moderator: User,
  reason: string
) {
  const channel = await getLogChannel(guild);
  if (!channel) return;

  const embed = createEmbed(
    `Moderation: ${action}`,
    `**Target:** ${target.tag} (${target.id})\n**Moderator:** ${moderator.tag} (${moderator.id})\n**Reason:** ${reason}`,
    config.colors.error
  );

  await channel.send({ embeds: [embed] });
}

export async function notifyUser(
  target: User,
  action: string,
  guildName: string,
  reason: string,
  moderatorTag: string
) {
  try {
    const embed = new EmbedBuilder()
      .setTitle(`You have been ${action} from ${guildName}`)
      .setDescription(`**Reason:** ${reason}\n**Moderator:** ${moderatorTag}`)
      .setColor(Colors.Red)
      .setTimestamp();
    
    await target.send({ embeds: [embed] });
    return true;
  } catch (error) {
    return false; // DMs closed
  }
}
