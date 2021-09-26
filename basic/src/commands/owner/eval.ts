import { CommandInteraction, MessageAttachment } from 'discord.js';
import { Command } from '../../utils/command';
import { Client } from '../../utils/client';
import { inspect } from 'util';

export default class Eval extends Command {
    constructor (client: Client) {
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
                    type: 'STRING',
                    required: true
                }
            ],
        });
    }

    async execute ({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        /* Fetching the code to eval */
        let code = interaction.options.getString('code', true);
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        let evaled;

        try {
            /* Getting the start eval time & making eval async */
            const start = process.hrtime();
            evaled = eval(`(async () => { ${code} })();`);

            /* Checking whether the eval returns a promise or not */
            if (evaled instanceof Promise) evaled = await evaled;

            /* Stopping the eval time and initiatng the result */
            const stop = process.hrtime(start);
            const res = `**Output:** \`\`\`js\n${clean(client, inspect(evaled, { depth: 0 }))}\n\`\`\`\n**Time Taken:** \`\`\`${(((stop[0] * 1e9) + stop[1])) / 1e6}ms\`\`\``

            /* Sending the result, if it's chars are more than 2k, create an attachment */
            if (res.length < 2000) await interaction.reply({ content: res, ephemeral: true });
            else {
                const output = new MessageAttachment(Buffer.from(res), 'output.txt');
                await interaction.reply({ files: [output], ephemeral: true });
            }
        } catch (e: any) {
            await interaction.reply({ content: `**Error:** \`\`\`xl\n${clean(client, e)}\n\`\`\``, ephemeral: true });
        }
    }
}

function clean (client: Client, text: string) {
    if (typeof text === 'string') {
        text = text
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`)
            .replace(new RegExp(client.config.TOKEN, 'gi'), '****');
    }

    return text;
}