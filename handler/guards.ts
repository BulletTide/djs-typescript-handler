/*
    Author: Bullet_Tide.
*/

import { ChatInputCommandInteraction } from 'discord.js';
import { Client } from '../src/utils/client';
import { Command } from '../src/utils/command';

/**
 * Validates whether a command can be executed in the current context.
 *
 * @returns A human-readable error message, or null if allowed.
 */
export function canRunCommand(
    client: Client,
    command: Command,
    interaction: ChatInputCommandInteraction
): string | null {

    if (command.guildOnly && !interaction.inGuild()) {
        return 'This command can only be used in a server.';
    }

    if (
        command.ownerOnly &&
        !client.config.DEVS.includes(interaction.user.id)
    ) {
        return 'This command is restricted to the bot owner.';
    }

    return null;
}