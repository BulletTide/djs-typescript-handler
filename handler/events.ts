/*
    Author: Bullet_Tide.
*/

import { Interaction, Guild } from 'discord.js';
import { Client } from '../src/utils/client';
import { canRunCommand } from './guards';

/* --------------------------------------------- */
/* Guild Events                                  */
/* --------------------------------------------- */

export async function guildCreate(
    client: Client,
    guild: Guild
): Promise<void> {
    try {
        if (!guild.available) return;

        await client.guildInfo.get(guild.id);

        const channel = client.utils.getDefaultChannel(guild);
        if (!channel) return;

        await channel.send(
            'Thanks for adding me! For a list of commands, use `/help`!'
        );
    } catch {
        client.utils.log(
            'ERROR',
            'handler/events.ts',
            'Failed to handle guildCreate event'
        );
    }
}

/* --------------------------------------------- */
/* Interaction Create                            */
/* --------------------------------------------- */

export async function interactionCreate(
    client: Client,
    interaction: Interaction
): Promise<void> {

    /* --------------------------------------------- */
    /* Autocomplete                                  */
    /* --------------------------------------------- */

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            await interaction.respond([]);
            return;
        }

        const focused = interaction.options.getFocused(true);
        const group = interaction.options.getSubcommandGroup(false);
        const sub = interaction.options.getSubcommand(false);

        const key = [
            interaction.commandName,
            group,
            sub,
            focused.name
        ].filter(Boolean).join('.');

        const handler =
            command.autocomplete.get(key) ??
            command.autocomplete.get(
                `${interaction.commandName}.${focused.name}`
            );

        if (!handler) {
            await interaction.respond([]);
            return;
        }

        try {
            const result = await Promise.resolve(
                handler({ client, interaction })
            );

            const choices = Array.isArray(result)
                ? result.slice(0, 25).map(choice => ({
                    name: String(choice.name),
                    value:
                        typeof choice.value === 'number'
                            ? choice.value
                            : String(choice.value)
                }))
                : [];

            await interaction.respond(choices);
        } catch {
            try {
                await interaction.respond([]);
            } catch {
                // Discord already timed out
            }
        }

        return;
    }

    /* --------------------------------------------- */
    /* Slash Commands                                */
    /* --------------------------------------------- */

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const guardError = canRunCommand(client, command, interaction);
    if (guardError) {
        await client.utils.quickError(interaction, guardError);
        return;
    }

    /* --------------------------------------------- */
    /* Cooldowns                                     */
    /* --------------------------------------------- */

    const remaining = client.cooldowns.isOnCooldown(
        command,
        interaction.user.id,
        interaction.guildId
    );

    if (remaining) {
        await client.utils.quickError(
            interaction,
            `Please wait **${remaining}s** before using this command again.`
        );
        return;
    }

    client.cooldowns.setCooldown(
        command,
        interaction.user.id,
        interaction.guildId
    );

    /* --------------------------------------------- */
    /* Subcommand Resolution                         */
    /* --------------------------------------------- */

    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(false);

    const executor =
        group && command.groups
            ? command.groups[group]?.subcommands[sub!]
            : sub && command.subcommands
                ? command.subcommands[sub]
                : command;

    /* --------------------------------------------- */
    /* Execution + Hooks                             */
    /* --------------------------------------------- */

    try {
        for (const hook of client.hooks.beforeExecute ?? []) {
            await hook({ client, interaction, group, subcommand: sub, command });
        }

        await executor?.execute?.({
            client,
            interaction,
            group,
            subcommand: sub
        });

        for (const hook of client.hooks.afterExecute ?? []) {
            await hook({ client, interaction, group, subcommand: sub, command });
        }
    } catch {
        for (const hook of client.hooks.onError ?? []) {
            await hook({ client, interaction, group, subcommand: sub, command });
        }

        await client.utils.quickError(
            interaction,
            'An unexpected error occurred.'
        );
    }
}