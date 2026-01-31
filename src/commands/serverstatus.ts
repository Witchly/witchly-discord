import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../types';
import { createEmbed, createErrorEmbed } from '../utils/embeds';
import { config } from '../utils/config';
const { GameDig } = require('gamedig');
import dgram from 'dgram';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check the status of a game server.')
    .addStringOption(option => 
      option.setName('game')
        .setDescription('The game to check')
        .setRequired(true)
        .addChoices(
          { name: 'Minecraft', value: 'minecraft' },
          { name: 'Rust', value: 'rust' },
          { name: 'Palworld', value: 'palworld' },
          { name: 'Hytale', value: 'hytale' }
        )
    )
    .addStringOption(option => option.setName('ip').setDescription('Server IP').setRequired(true))
    .addIntegerOption(option => option.setName('port').setDescription('Server Port (Default: Game Default)').setRequired(false)),
  
  async execute(interaction) {
    const game = interaction.options.getString('game', true);
    const ip = interaction.options.getString('ip', true);
    const port = interaction.options.getInteger('port');

    await interaction.deferReply();

    // 1. Hytale Special Handling (UDP Check)
    if (game === 'hytale') {
      const hytalePort = port || 6969; // Assuming 6969 default for your Hytale servers
      const isOnline = await checkUdp(ip, hytalePort);
      
      if (isOnline) {
        const embed = new EmbedBuilder()
          .setTitle(`🟢 ${ip}:${hytalePort} is Online`)
          .setColor(config.colors.success)
          .setDescription('**Note:** Hytale query protocol is not standard yet. Status based on UDP response.')
          .addFields(
            { name: 'Game', value: 'Hytale', inline: true },
            { name: 'Address', value: `\`${ip}:${hytalePort}\``, inline: true },
            { name: 'Status', value: 'Responding (UDP)', inline: true }
          )
          .setFooter({ text: 'Witchly.host', iconURL: config.links.logo })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply({ embeds: [createErrorEmbed(`**Could not reach Hytale server.**\n\n• Checked: 
• Ensure the server is online and port is open.`)] });
      }
      return;
    }

    // 2. Standard GameDig Query
    try {
      const state = await GameDig.query({
        type: game as any,
        host: ip,
        port: port || undefined
      });

      const addressValue = port ? `${ip}:${port}` : ip;

      const embed = new EmbedBuilder()
        .setTitle(`🟢 ${state.name || ip} is Online`)
        .setColor(config.colors.success)
        .addFields(
          { name: 'Game', value: game.charAt(0).toUpperCase() + game.slice(1), inline: true },
          { name: 'Address', value: `\`${addressValue}\``, inline: true },
          { name: 'Ping', value: `${state.ping}ms`, inline: true },
          { name: 'Players', value: `${state.numplayers}/${state.maxplayers}`, inline: true },
          { name: 'Map', value: state.map || 'Unknown', inline: true },
          { name: 'Version', value: state.raw?.version?.name || 'Unknown', inline: true }
        )
        .setFooter({ text: 'Witchly.host', iconURL: config.links.logo })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      const embed = createErrorEmbed(`**Could not reach server.**\n\n• Check the IP and Port.\n• Ensure the server is online.\n• For **Palworld/Rust**, ensure the **Query Port** is open/correct.`);
      await interaction.editReply({ embeds: [embed] });
    }
  }
};

function checkUdp(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    
    // Generic RakNet Unconnected Ping Payload (Used by MC Bedrock, Rust, etc.)
    // Message ID: 0x01 (Unconnected Ping)
    // Time: 8 bytes
    // Magic: 16 bytes (MC Bedrock Magic)
    // GUID: 8 bytes
    const message = Buffer.from('01000000000000000000ffff00fefefefefdfdfdfd123456780000000000000000', 'hex');

    let resolved = false;

    socket.on('message', () => {
      if (!resolved) {
        resolved = true;
        resolve(true);
        socket.close();
      }
    });

    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        resolve(false);
        socket.close();
      }
    });

    socket.send(message, port, host, (err) => {
      if (err) {
        if (!resolved) {
          resolved = true;
          resolve(false);
          socket.close();
        }
      }
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false); // Timeout means no reply (offline or firewall)
        socket.close();
      }
    }, 2000); // 2 second timeout
  });
}

export default command;