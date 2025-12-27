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
    if (!interaction.isChatInputCommand()) return;

    const i = interaction as ChatInputCommandInteraction;
    const command = client.commands.get(i.commandName);
    if (!command) return;

    if (command.guildOnly && !i.inGuild()) {
        return client.utils.quickError(i, 'Server only command.');
    }

    if (command.ownerOnly && !client.config.DEVS.includes(i.user.id)) {
        return client.utils.quickError(i, 'Owner only command.');
    }

    if (
        command.devOnly &&
        (!i.inGuild() || !client.config.DEV_SERVERS.includes(i.guildId!))
    ) {
        return client.utils.quickError(i, 'Development server only command.');
    }

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
            return client.utils.quickError(i, 'NSFW only.');
        }

        if (
            command.clientPerms.length &&
            channel?.isTextBased() &&
            !channel.permissionsFor(me)?.has(command.clientPerms)
        ) {
            return client.utils.quickError(i, 'Missing bot permissions.');
        }

        if (
            command.perms.length &&
            !member.permissions.has(command.perms)
        ) {
            return client.utils.quickError(i, 'Missing user permissions.');
        }
    }

    const group = i.options.getSubcommandGroup(false);
    const sub = i.options.getSubcommand(false);

    const exec =
        group && command.groups
            ? command.groups[group]?.subcommands[sub!]
            : sub && command.subcommands
                ? command.subcommands[sub]
                : null;

    try {
        await exec?.execute?.({
            client,
            interaction: i,
            group,
            subcommand: sub
        });
    } catch (error) {
        client.utils.log('ERROR', `command:${command.name}`, String(error));
        await client.utils.quickError(i, 'Unexpected error occurred.');
    }
}