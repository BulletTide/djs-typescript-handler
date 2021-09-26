import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from '../../utils/command';
import { Client } from '../../utils/client';

export default class Template extends Command {
    constructor (client: Client) {
        super(client, {
            name: 'help',
            description: 'Displays all helpful information on a command or lists all commands available in a category.',
            category: 'Misc',
            clientPerms: ['SEND_MESSAGES', 'EMBED_LINKS'],
            options: [
                {
                    name: 'name',
                    description: 'The category/command name you need help using.',
                    type: 'STRING'
                }
            ]
        });
    }

    async execute ({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        const languageHelp = client.languages.help.names;

        const name = interaction.options.getString('name')?.toLowerCase();
        if (!name) return defaultHelp(client, interaction, languageHelp);

        const command = client.commands.get(name);
        const category = client.categories.get(name);

        const embed = new MessageEmbed();

        // @ts-ignore
        if (command && !command.hideCommand && !(command.nsfw && !interaction.channel.nsfw)) {
            const commandHelp = client.languages[command.name];

            embed.setAuthor(`${command.category ? command.category : languageHelp.noCategory} - ${command.name}`);

            if (commandHelp.description) embed.setDescription(commandHelp.description);

            if (commandHelp.usage) embed.addField(languageHelp.usage, commandHelp.usage);

            if (commandHelp.examples) embed.addField(languageHelp.examples, commandHelp.examples);

            await interaction.reply({ embeds: [embed] });
        } else if (category) {
            embed
                .setTitle(category[0])
                .setDescription('`' + category.slice(1).join('`, `') + '`');

            await interaction.reply({ embeds: [embed] });
        } else defaultHelp(client, interaction, languageHelp);
    }
}

/**
 * 
 * @param {Client} client The client object.
 * @param {CommandInteraction} interaction The command interaction object. 
 * @param {any} languageHelp 
 */
 async function defaultHelp(client: Client, interaction: CommandInteraction, languageHelp: any) {
    const embed = new MessageEmbed()
        .setTitle(languageHelp.commandCategories)
        .setDescription(languageHelp.categoriesHelp,)
        .setThumbnail(client.user!.displayAvatarURL())
        .addField(languageHelp.categoriesName, client.categories.map(c => '> ' + languageHelp.categories[c[0]]).join('\n'));

    await interaction.reply({ embeds: [embed] });
}