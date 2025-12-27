import { Command } from '../../src/utils/command';
import { Client } from '../../src/utils/client';
import { CommandExecutionContext } from '../../handler/typings';

export default class Template extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'template',
            description: 'This is a template command',

            // Optional flags
            // category: 'Misc',
            // devOnly: true,
            // ownerOnly: true,
            // guildOnly: true,

            // Optional arguments with inline autocomplete
            // subcommands: {
            //     example: {
            //         description: 'Example subcommand',
            //         args: [
            //             {
            //                 name: 'query',
            //                 type: 'STRING',
            //                 description: 'Search query',
            //                 autocomplete: async ({ interaction }) => {
            //                     const focused = interaction.options.getFocused();
            //                     return [
            //                         { name: `${focused} one`, value: `${focused}_1` },
            //                         { name: `${focused} two`, value: `${focused}_2` }
            //                     ];
            //                 }
            //             }
            //         ],
            //         execute: async ({ interaction }) => {
            //             await interaction.reply('Subcommand executed');
            //         }
            //     }
            // }
        });
    }

    async execute({
        client,
        interaction,
        group,
        subcommand
    }: CommandExecutionContext): Promise<void> {
        await interaction.reply({
            content: 'Template command executed',
            ephemeral: true
        });
    }
}