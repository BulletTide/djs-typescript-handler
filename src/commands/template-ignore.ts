import { ApplicationCommandType } from 'discord.js';
import { Command } from '../../src/utils/command';
import { Client } from '../../src/utils/client';
import { CommandExecutionContext } from '../../handler/typings';

export default class Template extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'template',
            description: 'This is a template command',

            /* --------------------------------------------- */
            /* Optional flags                                */
            /* --------------------------------------------- */

            // category: 'Misc',
            // devOnly: true,
            // ownerOnly: true,
            // guildOnly: true,
            // hideCommand: false,

            /* --------------------------------------------- */
            /* Optional cooldown                             */
            /* --------------------------------------------- */

            // cooldown: {
            //     duration: 10, // seconds
            //     scope: 'USER' // USER | GUILD | GLOBAL
            // },

            /* --------------------------------------------- */
            /* Optional command type                         */
            /* --------------------------------------------- */

            // type: ApplicationCommandType.ChatInput, // default
            // type: ApplicationCommandType.User,
            // type: ApplicationCommandType.Message,

            /* --------------------------------------------- */
            /* Optional arguments & subcommands              */
            /* --------------------------------------------- */

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
            //
            //                     return [
            //                         { name: `${focused} one`, value: `${focused}_1` },
            //                         { name: `${focused} two`, value: `${focused}_2` }
            //                     ];
            //                 }
            //             }
            //         ],
            //         execute: async ({ interaction }) => {
            //             if (!interaction.isChatInputCommand()) return;
            //
            //             await interaction.reply('Subcommand executed');
            //         }
            //     }
            // }
        });
    }

    async execute({
        interaction
    }: CommandExecutionContext): Promise<void> {
        /* --------------------------------------------- */
        /* Slash command example                         */
        /* --------------------------------------------- */

        if (interaction.isChatInputCommand()) {
            await interaction.reply({
                content: 'Template slash command executed',
                ephemeral: true
            });
            return;
        }

        /* --------------------------------------------- */
        /* User context menu example                     */
        /* --------------------------------------------- */

        if (interaction.isUserContextMenuCommand()) {
            await interaction.reply({
                content: `User ID: ${interaction.targetUser.id}`,
                ephemeral: true
            });
            return;
        }

        /* --------------------------------------------- */
        /* Message context menu example                  */
        /* --------------------------------------------- */

        if (interaction.isMessageContextMenuCommand()) {
            await interaction.reply({
                content: `Message ID: ${interaction.targetMessage.id}`,
                ephemeral: true
            });
        }
    }
}