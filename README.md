# Witchly Discord Bot 🔮

The official Discord bot for **Witchly.host**, designed to provide seamless integration between Discord and the Witchly hosting platform. It handles moderation, support tickets, documentation searching, and advanced server status monitoring.

## 🚀 Features

### 🛡️ Moderation
- **Advanced Logging:** Tracks message deletes, updates, bans, and member joins/leaves with audit log integration.
- **Commands:** `/ban`, `/kick`, `/timeout`, `/warn`, and `/purge` for efficient community management.
- **Auto-Role:** Automatically assigns the community member role to newcomers.

### 🎫 Support & Tickets
- **Modal-Based Tickets:** `/ticketpanel` allows users to open tickets with specific reasons via Discord modals.
- **Transcripts:** Automatically saves and logs ticket transcripts to a dedicated channel upon closing.
- **Docs Integration:** `/docs <query>` uses Fuse.js to search through indexed Witchly documentation for quick answers. *Note: Docs are indexed from the GitBook repo on bot startup.*

### 📢 Promotion & Growth
- **Bump Reminder:** Sends an `@everyone` reminder every 12 hours in the promotion channel to bump Witchly on 7 different platforms:
  - Disboard, Discadia, Discord.me, Discordservers.com, Top.gg, Discord Home, and Top-Servers.net.
  - Includes direct voting links where applicable to maximize ranking efficiency.

### 🎮 Game Server Integration
- **Server Status:** `/serverstatus` provides real-time status (online/offline, player count, version) for:
  - Minecraft (Java/Bedrock)
  - Rust
  - Palworld
  - Hytale (Custom UDP/RakNet ping implementation)
- **Status Rotation:** The bot cycles its activity status every 15 seconds, showcasing the games supported by Witchly.

### 📈 Invite Tracking
- **Invite Stats:** `/invites [user]` shows who invited a member and their total successful invites.
- **Leaderboard:** `/leaderboard` displays the top 10 most active inviters in the server.
- **Smart Welcomes:** Automatically mentions the inviter and their current invite count in the welcome channel.

### 🛠️ Utilities & Feedback
- **System Status:** `/status` checks the HTTP health of the Website, Panel, and Billing systems.
- **Suggestions:** `/suggest <idea>` allows users to post ideas in a restricted channel with automatic ✅/❌ reactions for community voting.
- **Info Commands:** `/userinfo` (includes banner and creation date) and `/serverinfo`.

## 💻 Tech Stack
- **Language:** TypeScript
- **Library:** Discord.js v14
- **Database:** Prisma with SQLite
- **Tools:** 
  - `gamedig` for server querying
  - `fuse.js` for fuzzy documentation search
  - `pm2` for process management

## 🛠️ Setup & Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root:
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_server_id
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Locally (Development):**
   ```bash
   npm run dev
   ```

## 🚢 Deployment (Witchly VPS)

The bot is deployed to the production VPS using a compiled `dist/` workflow.

1. **Build Locally:**
   ```bash
   npx tsc
   ```

2. **Sync to VPS:**
   ```bash
   rsync -avz --exclude 'node_modules' --exclude '.env' --exclude '.git' dist/ witchly:/root/witchly-bot/dist/
   ```

3. **Restart Service:**
   ```bash
   ssh witchly "pm2 restart witchly-bot"
   ```

---
*Developed by Witchly.host Engineering*
