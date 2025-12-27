import { Command } from '../../utils/command';
import { Client } from '../../utils/client';
import { CommandExecutionContext } from '../../../handler/typings';

export default class Ping extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'ping',
            description: 'Displays the bots websocket ping.',
            category: 'Misc'
        });
    }

    async execute({
        client,
        interaction
    }: CommandExecutionContext): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        await client.utils.quickSuccess(
            interaction,
            `**Websocket Ping:** ${client.ws.ping}ms.`
        );
    }
}