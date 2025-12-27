/*
    Author: Bullet_Tide.
*/

import { Interaction, Guild } from 'discord.js';
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
        try {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                await interaction.respond([]);
                return;
            }

            const focused = interaction.options.getFocused(true);
            const group = interaction.options.getSubcommandGroup(false);
            const sub = interaction.options.getSubcommand(false);

            const fullPath = [
                interaction.commandName,
                group,
                sub,
                focused.name
            ].filter(Boolean).join('.');

            const handler =
                command.autocomplete.get(fullPath) ??
                command.autocomplete.get(focused.name);

            if (!handler) {
                await interaction.respond([]);
                return;
            }

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
        } catch (error) {
            client.utils.log(
                'ERROR',
                'autocomplete',
                String(error)
            );

            try {
                await interaction.respond([]);
            } catch {
                // Discord already timed out — nothing else to do
            }
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

    /* --------------------------------------------- */
    /* Global Guards                                 */
    /* --------------------------------------------- */

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

    /* --------------------------------------------- */
    /* Cooldowns                                     */
    /* --------------------------------------------- */

    const remaining = client.cooldowns.isOnCooldown(
        command,
        interaction.user.id,
        interaction.inGuild() ? interaction.guildId : null
    );

    if (remaining) {
        return client.utils.quickError(
            interaction,
            `Please wait **${remaining}s** before using this command again.`
        );
    }

    client.cooldowns.setCooldown(
        command,
        interaction.user.id,
        interaction.inGuild() ? interaction.guildId : null
    );

    /* --------------------------------------------- */
    /* Subcommand Resolution                         */
    /* --------------------------------------------- */

    const group = interaction.isChatInputCommand()
        ? interaction.options.getSubcommandGroup(false)
        : null;

    const sub = interaction.isChatInputCommand()
        ? interaction.options.getSubcommand(false)
        : null;

    const executor =
        group && command.groups
            ? command.groups[group]?.subcommands[sub!]
            : sub && command.subcommands
                ? command.subcommands[sub]
                : command;

    /* --------------------------------------------- */
    /* Safe Execution                                */
    /* --------------------------------------------- */

    try {
        await executor?.execute?.({
            client,
            interaction,
            group,
            subcommand: sub
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