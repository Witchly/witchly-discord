import { Events, Interaction, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder, EmbedBuilder } from 'discord.js';
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
        // Show Modal instead of creating immediately
        const modal = new ModalBuilder()
          .setCustomId('ticket_modal')
          .setTitle('Open a Support Ticket');

        const reasonInput = new TextInputBuilder()
          .setCustomId('ticket_reason')
          .setLabel("Reason for ticket")
          .setStyle(TextInputStyle.Paragraph)
          .setPlaceholder('Please describe your issue here...')
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
      }

      if (customId === 'close_ticket') {
        const channel = interaction.channel as TextChannel;
        await interaction.deferReply();

        // 1. Fetch Ticket Data
        const ticket = await prisma.ticket.findFirst({
          where: { channelId: channel.id },
          include: { user: true }
        });

        if (ticket) {
          await prisma.ticket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } });
        }

        // 2. Generate Transcript
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcriptContent = messages.reverse().map(m => {
            const time = m.createdAt.toLocaleString();
            return `[${time}] ${m.author.tag}: ${m.content} ${m.attachments.size > 0 ? '[Attachment]' : ''}`;
          }).join('\n');

        const buffer = Buffer.from(transcriptContent, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });

        // 3. Log to Log Channel
        const logChannel = interaction.guild?.channels.cache.get(config.ticketLogChannelId) as TextChannel;
        
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setTitle('Ticket Closed')
            .setColor(config.colors.primary)
            .addFields(
              { name: 'Ticket Owner', value: ticket ? `<@${ticket.userId}>` : 'Unknown', inline: true },
              { name: 'Closed By', value: interaction.user.toString(), inline: true },
              { name: 'Opened At', value: ticket?.createdAt.toDateString() || 'Unknown', inline: true }
            )
            .setTimestamp();

          await logChannel.send({ embeds: [logEmbed], files: [attachment] });
        }

        // 4. Delete Channel
        await interaction.editReply('Ticket closed. Deleting channel in 5 seconds...');
        setTimeout(async () => {
          await channel.delete().catch(() => {});
        }, 5000);
      }
    }

    // Modals
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_modal') {
        await interaction.deferReply({ ephemeral: true });
        
        const reason = interaction.fields.getTextInputValue('ticket_reason');

        // Check if user has open ticket
        const existingTicket = await prisma.ticket.findFirst({
          where: { userId: interaction.user.id, status: 'OPEN' }
        });

        if (existingTicket) {
           const channel = interaction.guild?.channels.cache.get(existingTicket.channelId);
           if (channel) {
             await interaction.editReply(`You already have an open ticket: ${channel.toString()}`);
             return;
           } else {
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

        // Send Welcome & Controls
        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
          );
        
        const welcomeEmbed = createEmbed(
          'Ticket Created',
          `Hello ${interaction.user.toString()}, support will be with you shortly.\n\n**Reason:**\n${reason}`,
          config.colors.primary
        );

        await channel.send({ content: `${interaction.user.toString()}`, embeds: [welcomeEmbed], components: [row] });
        await interaction.editReply(`Ticket created: ${channel.toString()}`);
      }
    }
  },
};

export default event;
