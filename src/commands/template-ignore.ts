import { CommandInteraction } from 'discord.js';
import { Command } from '@command';
import { Client } from '@client';

export default class Template extends Command {
    constructor (client: Client) {
        super(client, {
            name: 'template',
            description: 'This is a template'
        });
    }

    async execute ({ client, interaction, group, subcommand }: { client: Client, interaction: CommandInteraction, group: string, subcommand: string }) {
        //
    }
}