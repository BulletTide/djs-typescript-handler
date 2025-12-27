import {
    EmbedBuilder,
    ApplicationCommandOptionType,
    PermissionFlagsBits
} from 'discord.js';

import { Command } from '../../utils/command';
import { Client } from '../../utils/client';
import { CommandExecutionContext } from '../../../handler/typings';
import { HelpLanguage } from '../../types/languages';

export default class Help extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'help',
            description: 'Displays all helpful information on a command or lists all commands available in a category.',
            category: 'Misc',
            clientPerms: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks
            ],
            options: [
                {
                    name: 'name',
                    description: 'The category/command name you need help using.',
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        });
    }

    async execute({ client, interaction }: CommandExecutionContext): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        const languageHelp = client.languages.help.names;
        const name = interaction.options.getString('name')?.toLowerCase();

        if (!name) {
            await defaultHelp(client, interaction, languageHelp);
            return;
        }

        const command = client.commands.get(name);
        const category = client.categories.get(name);
        const embed = new EmbedBuilder();

        if (
            command &&
            !command.hideCommand &&
            !(command.nsfw &&
                interaction.channel?.isTextBased() &&
                'nsfw' in interaction.channel &&
                !interaction.channel.nsfw
            )
        ) {
            const commandHelp = client.languages[command.name];

            embed.setAuthor({ name: `${command.category ?? languageHelp.noCategory} - ${command.name}` });

            if (commandHelp?.description) {
                embed.setDescription(commandHelp.description);
            }

            if (commandHelp?.usage) {
                embed.addFields({
                    name: languageHelp.usage,
                    value: commandHelp.usage
                });
            }

            if (commandHelp?.examples) {
                embed.addFields({
                    name: languageHelp.examples,
                    value: commandHelp.examples
                });
            }

            await interaction.reply({ embeds: [embed] });
            return;
        }

        if (category) {
            embed
                .setTitle(category[0])
                .setDescription(`\`${category.slice(1).join('`, `')}\``);

            await interaction.reply({ embeds: [embed] });
            return;
        }

        await defaultHelp(client, interaction, languageHelp);
    }
}

/* --------------------------------------------- */
/* Helpers                                       */
/* --------------------------------------------- */

async function defaultHelp(
    client: Client,
    interaction: any,
    languageHelp: HelpLanguage['names']
): Promise<void> {
    const embed = new EmbedBuilder()
        .setTitle(languageHelp.commandCategories)
        .setDescription(languageHelp.categoriesHelp)
        .setThumbnail(client.user!.displayAvatarURL())
        .addFields({
            name: languageHelp.categoriesName,
            value: client.categories
                .map(c => `> ${languageHelp.categories[c[0]]}`)
                .join('\n')
        });

    await interaction.reply({ embeds: [embed] });
}