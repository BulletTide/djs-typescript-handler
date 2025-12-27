import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../src/utils/command';
import { Client } from '../../src/utils/client';

export default class Template extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'template',
            description: 'This is a template'
        });
    }

    async execute({
        client,
        interaction,
        group,
        subcommand
    }: {
        client: Client;
        interaction: ChatInputCommandInteraction;
        group?: string;
        subcommand?: string;
    }): Promise<void> {
        // your logic here
    }
}