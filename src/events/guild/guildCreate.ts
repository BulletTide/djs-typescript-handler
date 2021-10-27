import { Guild } from 'discord.js';
import { Client } from '../../../src/utils/client';
import { guildCreate } from '../../../handler/events';

export default async (client: Client, guild: Guild): Promise<void> => {
    await guildCreate(client, guild);
};