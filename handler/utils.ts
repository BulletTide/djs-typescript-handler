/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import {
    Message,
    User,
    GuildMember,
    PermissionResolvable,
    MessageCollector,
    Guild,
    TextChannel,
    ChannelType,
    PermissionsBitField,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction
} from 'discord.js';
import { Client } from '../src/utils/client';

type AnyInteraction =
    | ChatInputCommandInteraction
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction;

class HandlerUtils {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async getReply(
        message: Message,
        options?: {
            time?: number;
            user?: User;
            words?: string[];
            regexp?: RegExp;
        }
    ): Promise<Message | void> {
        const user = options?.user ?? message.author;
        const words = options?.words ?? [];
        const time = options?.time ?? 30000;

        return await new Promise(resolve => {
            const collector = new MessageCollector(message.channel, {
                time,
                max: 1,
                filter: msg =>
                    msg.author.id === user.id &&
                    (words.length === 0 ||
                        words.includes(msg.content.toLowerCase())) &&
                    (!options?.regexp ||
                        options.regexp.test(msg.content))
            });

            collector.on('collect', msg => resolve(msg));
            collector.on('end', collected => {
                if (!collected.size) resolve(undefined);
            });
        });
    }

    missingPermissions(
        member: GuildMember,
        perms: PermissionResolvable[]
    ): string {
        return member.permissions.missing(perms).join(', ');
    }

    log(
        type: 'SUCCESS' | 'WARNING' | 'ERROR',
        path: string,
        text: string
    ): void {
        console.log(`[${type}] [${path}] ${text}`);
    }

    async quickError(
        interaction: AnyInteraction,
        message: string
    ): Promise<void> {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: message, ephemeral: true });
        } else {
            await interaction.followUp({ content: message, ephemeral: true });
        }
    }

    async quickSuccess(
        interaction: AnyInteraction,
        message: string
    ): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: message });
        } else {
            await interaction.reply({ content: message });
        }
    }

    /* --------------------------------------------- */
    /* Channels                                      */
    /* --------------------------------------------- */

    /**
     * Finds the first text channel the bot can send messages to.
     */
    getDefaultChannel(guild: Guild): TextChannel | null {
        const me = guild.members.me;
        if (!me) return null;

        const channel = guild.channels.cache.find(
            (c): c is TextChannel =>
                c.type === ChannelType.GuildText &&
                c.viewable &&
                c.permissionsFor(me)?.has([
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages
                ])
        );

        return channel ?? null;
    }
}

export { HandlerUtils };