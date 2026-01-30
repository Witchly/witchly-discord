import { Events, ChatInputCommandInteraction, Interaction, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { BotEvent } from '../types';
import { commands } from '../handlers/commandHandler';
import { logger } from '../utils/logger';
import { createErrorEmbed, createEmbed } from '../utils/embeds';
import { prisma } from '../utils/prisma';
import { config } from '../utils/config';

const event: BotEvent = {
  name: Events.InteractionCreate,
  execute: async (interaction: Interaction) => {
    // Chat Commands
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        logger.error(`Error executing ${interaction.commandName}: ${error}`);
        const reply = { embeds: [createErrorEmbed('An error occurred.')], ephemeral: true };
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      const { customId } = interaction;

      if (customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });

        // Check if user has open ticket
        const existingTicket = await prisma.ticket.findFirst({
          where: { userId: interaction.user.id, status: 'OPEN' }
        });

        if (existingTicket) {
          // Check if channel still exists
          const channel = interaction.guild?.channels.cache.get(existingTicket.channelId);
          if (channel) {
            await interaction.editReply(`You already have an open ticket: ${channel.toString()}`);
            return;
          } else {
            // Cleanup ghost ticket
            await prisma.ticket.update({ where: { id: existingTicket.id }, data: { status: 'CLOSED' } });
          }
        }

        // Create Channel
        const channelName = `ticket-${interaction.user.username}`;
        const channel = await interaction.guild?.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            // Allow bot
            {
              id: config.clientId,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
            }
          ],
        });

        if (!channel) {
          await interaction.editReply('Failed to create ticket channel.');
          return;
        }

        // DB Entry
        await prisma.user.upsert({ where: { id: interaction.user.id }, update: {}, create: { id: interaction.user.id } });
        await prisma.ticket.create({
          data: {
            userId: interaction.user.id,
            channelId: channel.id,
            status: 'OPEN'
          }
        });

        // Send Controls
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
            new ButtonBuilder().setCustomId('transcript_ticket').setLabel('Transcript').setStyle(ButtonStyle.Secondary).setEmoji('📄')
          );
        
        const welcomeEmbed = createEmbed(
          'Ticket Created',
          `Hello ${interaction.user.toString()}, support will be with you shortly.\n\nClick 🔒 to close this ticket.`, 
          config.colors.primary
        );

        await channel.send({ content: `${interaction.user.toString()}`, embeds: [welcomeEmbed], components: [row] });
        await interaction.editReply(`Ticket created: ${channel.toString()}`);
      }

      if (customId === 'close_ticket') {
        const channel = interaction.channel as TextChannel;
        await interaction.reply({ content: 'Ticket will be closed in 5 seconds...' });
        
        // Update DB
        const ticket = await prisma.ticket.findFirst({ where: { channelId: channel.id } });
        if (ticket) {
          await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } });
        }

        setTimeout(async () => {
          await channel.delete().catch(() => {});
        }, 5000);
      }

      if (customId === 'transcript_ticket') {
        await interaction.reply({ content: 'Transcript feature coming soon!', ephemeral: true });
        // TODO: Implement transcript (fetch messages, generate HTML/Text, send file)
      }
    }
  },
};

export default event;