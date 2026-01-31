import { Collection, Guild } from 'discord.js';

/**
 * Stores guild invites in a Map: GuildID -> Collection<InviteCode, UsageCount>
 */
export const inviteCache = new Collection<string, Collection<string, number>>();

export const updateGuildInvites = async (guild: Guild) => {
  try {
    const invites = await guild.invites.fetch();
    const cache = new Collection<string, number>();
    
    invites.forEach(invite => {
      cache.set(invite.code, invite.uses || 0);
    });
    
    inviteCache.set(guild.id, cache);
  } catch (error) {
    // Possibly missing permissions
  }
};
