/*
    Author: Bullet_Tide.
*/

import {
    Interaction,
    Guild
} from 'discord.js';
import { Client } from '../src/utils/client';

export async function guildCreate(client: Client, guild: Guild): Promise<void> {
    try {
        if (!guild.available) return;

        await client.guildInfo.get(guild.id);

        const channel = client.utils.getDefaultChannel(guild);
        if (!channel) return;

        await channel.send(
            'Thanks for adding me! For a list of commands, use `/help`!'
        );
    } catch (e) {
        client.utils.log('ERROR', 'handler/events.ts', String(e));
    }
}

export async function interactionCreate(
    client: Client,
    interaction: Interaction
): Promise<void> {

    /* --------------------------------------------- */
    /* Autocomplete                                  */
    /* --------------------------------------------- */

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const focused = interaction.options.getFocused(true);
        const group = interaction.options.getSubcommandGroup(false);
        const sub = interaction.options.getSubcommand(false);

        const path = [
            interaction.commandName,
            group,
            sub,
            focused.name
        ].filter(Boolean).join('.');

        const handler = command.autocomplete.get(path);
        if (!handler) return;

        try {
            const choices = await handler({ client, interaction });
            await interaction.respond(choices);
        } catch (e) {
            client.utils.log(
                'ERROR',
                `autocomplete:${command.name}`,
                String(e)
            );
        }

        return;
    }

    /* --------------------------------------------- */
    /* Slash & Context Menu Commands                 */
    /* --------------------------------------------- */

    if (
        !interaction.isChatInputCommand() &&
        !interaction.isUserContextMenuCommand() &&
        !interaction.isMessageContextMenuCommand()
    ) {
        return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (command.guildOnly && !interaction.inGuild()) {
        return client.utils.quickError(
            interaction,
            'This command can only be used in a server.'
        );
    }

    if (command.ownerOnly && !client.config.DEVS.includes(interaction.user.id)) {
        return client.utils.quickError(
            interaction,
            'This command is restricted to the bot owner.'
        );
    }

    try {
        await command.execute({
            client,
            interaction,
            group: null,
            subcommand: null
        });
    } catch (error) {
        client.utils.log(
            'ERROR',
            `command:${command.name}`,
            String(error)
        );

        await client.utils.quickError(
            interaction,
            'An unexpected error occurred.'
        );
    }
}