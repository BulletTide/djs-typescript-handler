import { Guild } from 'discord.js';
import { Client } from '../../utils/client';
import { guildCreate } from '../../../handler/events';

export default async (client: Client, guild: Guild): Promise<void> => {
    await guildCreate(client, guild);
};