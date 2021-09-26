import { Interaction } from 'discord.js';
import { Client } from '../../utils/client';
import { interactionCreate } from '../../../handler/events';

export default async (client: Client, interaction: Interaction): Promise<void> => {
    await interactionCreate(client, interaction);
};