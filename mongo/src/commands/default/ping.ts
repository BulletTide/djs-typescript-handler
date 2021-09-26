import { CommandInteraction } from 'discord.js';
import { Command } from '../../utils/command';
import { Client } from '../../utils/client';

export default class Template extends Command {
    constructor (client: Client) {
        super(client, {
            name: 'ping',
            description: 'Displays the bots websocket ping.',
            category: 'Misc'
        });
    }

    async execute ({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        /* Returning the ping */
        await client.utils.quickSuccess(interaction, `**Websocket Ping:** ${client.ws.ping}ms.`);
    }
}