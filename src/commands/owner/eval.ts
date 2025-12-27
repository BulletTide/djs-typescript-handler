import {
    AttachmentBuilder,
    ApplicationCommandOptionType
} from 'discord.js';

import { Command } from '../../utils/command';
import { Client } from '../../utils/client';
import { CommandExecutionContext } from '../../../handler/typings';
import { inspect } from 'util';

export default class Eval extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'eval',
            category: 'Owner',
            description: 'Eval command for the developer(s).',
            devOnly: true,
            hideCommand: true,
            development: true,
            options: [
                {
                    name: 'code',
                    description: 'The code to eval, please note that a return needs to be specified.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        });
    }

    async execute({
        client,
        interaction
    }: CommandExecutionContext): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        let code = interaction.options.getString('code', true);
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, '\'');

        try {
            const start = process.hrtime();

            let evaled = eval(`(async () => { ${code} })();`);
            if (evaled instanceof Promise) evaled = await evaled;

            const stop = process.hrtime(start);
            const time = (((stop[0] * 1e9) + stop[1]) / 1e6).toFixed(2);

            const output = clean(client, inspect(evaled, { depth: 0 }));
            const result = `**Output:**\n\`\`\`js\n${output}\n\`\`\`\n**Time Taken:** \`${time}ms\``;

            if (result.length < 2000) {
                await interaction.reply({ content: result, ephemeral: true });
            } else {
                const attachment = new AttachmentBuilder(
                    Buffer.from(result),
                    { name: 'output.txt' }
                );

                await interaction.reply({
                    files: [attachment],
                    ephemeral: true
                });
            }
        } catch (error) {
            await interaction.reply({
                content: `**Error:**\n\`\`\`xl\n${clean(client, String(error))}\n\`\`\``,
                ephemeral: true
            });
        }
    }
}

/* --------------------------------------------- */
/* Helpers                                       */
/* --------------------------------------------- */

function clean(client: Client, text: string): string {
    return text
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`)
        .replace(new RegExp(client.config.TOKEN, 'gi'), '****');
}