import { Events, Invite } from 'discord.js';
import { BotEvent } from '../types';
import { updateGuildInvites } from '../utils/inviteCache';

const event: BotEvent = {
  name: Events.InviteDelete,
  execute: async (invite: Invite) => {
    if (invite.guild) {
      await updateGuildInvites(invite.guild as any);
    }
  },
};

export default event;
