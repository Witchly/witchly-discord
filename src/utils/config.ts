import dotenv from 'dotenv';

dotenv.config();

export const config = {
  token: process.env.DISCORD_TOKEN as string,
  guildId: process.env.GUILD_ID as string,
  clientId: process.env.CLIENT_ID as string,
  colors: {
    primary: 0xA031F1, // Witchly Purple
    success: 0x57F287,
    error: 0xED4245,
    warning: 0xFEE75C,
  },
  links: {
    website: 'https://witchly.host',
    panel: 'https://panel.witchly.host',
    billing: 'https://billing.witchly.host',
    discord: 'https://discord.witchly.host',
    docs: 'https://docs.witchly.host',
    logo: 'https://witchly.host/images/logo.png',
    banner: 'https://witchly.host/images/witchly-banner.png',
  }
};
