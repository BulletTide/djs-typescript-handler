/*
    Author: Bullet_Tide.
*/

import {
    Interaction,
    GuildMember,
    ChannelType,
    Guild,
    ChatInputCommandInteraction
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
        ]
            .filter(Boolean)
            .join('.');

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
    /* Slash Commands                                */
    /* --------------------------------------------- */

    if (!interaction.isChatInputCommand()) return;

    const i = interaction as ChatInputCommandInteraction;
    const command = client.commands.get(i.commandName);
    if (!command) return;

    /* --------------------------------------------- */
    /* Global Guards                                 */
    /* --------------------------------------------- */

    if (command.guildOnly && !i.inGuild()) {
        return client.utils.quickError(
            i,
            'This command can only be used in a server.'
        );
    }

    if (command.ownerOnly && !client.config.DEVS.includes(i.user.id)) {
        return client.utils.quickError(
            i,
            'This command is restricted to the bot owner.'
        );
    }

    if (
        command.devOnly &&
        (!i.inGuild() || !client.config.DEV_SERVERS.includes(i.guildId!))
    ) {
        return client.utils.quickError(
            i,
            'This command can only be used in development servers.'
        );
    }

    /* --------------------------------------------- */
    /* Guild Context Checks                          */
    /* --------------------------------------------- */

    if (i.inGuild()) {
        const guild = i.guild!;
        const member = await guild.members.fetch(i.user.id);
        const me = guild.members.me as GuildMember;
        const channel = await guild.channels.fetch(i.channelId);

        if (
            command.nsfw &&
            channel?.type === ChannelType.GuildText &&
            !channel.nsfw
        ) {
            return client.utils.quickError(
                i,
                'This command can only be used in NSFW channels.'
            );
        }

        if (
            command.clientPerms.length &&
            channel?.isTextBased() &&
            !channel.permissionsFor(me)?.has(command.clientPerms)
        ) {
            return client.utils.quickError(
                i,
                'I am missing the required permissions to run this command.'
            );
        }

        if (
            command.perms.length &&
            !member.permissions.has(command.perms)
        ) {
            return client.utils.quickError(
                i,
                'You do not have permission to use this command.'
            );
        }
    }

    /* --------------------------------------------- */
    /* Subcommand Resolution                         */
    /* --------------------------------------------- */

    const group = i.options.getSubcommandGroup(false);
    const sub = i.options.getSubcommand(false);

    const exec =
        group && command.groups
            ? command.groups[group]?.subcommands[sub!]
            : sub && command.subcommands
                ? command.subcommands[sub]
                : null;

    /* --------------------------------------------- */
    /* Safe Execution                                */
    /* --------------------------------------------- */

    try {
        await exec?.execute?.({
            client,
            interaction: i,
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
            i,
            'An unexpected error occurred while executing this command.'
        );
    }
}