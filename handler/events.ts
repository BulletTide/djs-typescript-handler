/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import {
    Interaction,
    GuildMember,
    ChannelType,
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
        client.utils.log(
            'ERROR',
            'handler/events.ts',
            String(e)
        );
    }
}

export async function interactionCreate(
    client: Client,
    interaction: Interaction
): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

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

    if (command.ownerOnly) {
        if (!interaction.inGuild() || !(client.config.DEV_SERVERS as string[]).includes(interaction.guildId!)) {
            return client.utils.quickError(
                interaction,
                'This command is restricted to the bot owner.'
            );
        }
    }

    if (command.devOnly) {
        if (
            !interaction.inGuild() ||
            !(client.config.DEV_SERVERS as string[]).includes(interaction.guildId!)
        ) {
            return client.utils.quickError(
                interaction,
                'This command can only be used in development servers.'
            );
        }
    }

    /* --------------------------------------------- */
    /* Guild Context Checks                          */
    /* --------------------------------------------- */

    if (interaction.inGuild()) {
        const guild = interaction.guild!;
        const member = await guild.members.fetch(interaction.user.id);
        const me = guild.members.me as GuildMember;
        const channel = await guild.channels.fetch(interaction.channelId);

        if (
            command.nsfw &&
            channel?.type === ChannelType.GuildText &&
            !channel.nsfw
        ) {
            return client.utils.quickError(
                interaction,
                'This command can only be used in NSFW channels.'
            );
        }

        if (
            command.clientPerms.length &&
            channel?.isTextBased() &&
            !channel.permissionsFor(me)?.has(command.clientPerms)
        ) {
            return client.utils.quickError(
                interaction,
                'I am missing the required permissions to run this command.'
            );
        }

        if (
            command.perms.length &&
            !member.permissions.has(command.perms)
        ) {
            return client.utils.quickError(
                interaction,
                'You do not have permission to use this command.'
            );
        }
    }

    /* --------------------------------------------- */
    /* Subcommand Resolution                         */
    /* --------------------------------------------- */

    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand(false);

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
            'An unexpected error occurred while executing this command.'
        );
    }
}