/*
    Author: Bullet_Tide.
*/

import {
    ApplicationCommandType,
    PermissionResolvable,
    ChatInputCommandInteraction,
    UserContextMenuCommandInteraction,
    MessageContextMenuCommandInteraction,
    AutocompleteInteraction
} from 'discord.js';
import { Client } from '../src/utils/client';

/* --------------------------------------------- */
/* Execution Contexts                            */
/* --------------------------------------------- */

export interface CommandExecutionContext {
    client: Client;
    interaction:
        | ChatInputCommandInteraction
        | UserContextMenuCommandInteraction
        | MessageContextMenuCommandInteraction;
    group: string | null;
    subcommand: string | null;
}

export interface AutocompleteExecutionContext {
    client: Client;
    interaction: AutocompleteInteraction;
}

/* --------------------------------------------- */
/* Cooldowns                                     */
/* --------------------------------------------- */

export interface CommandCooldown {
    duration: number; // seconds
    scope?: 'USER' | 'GUILD' | 'GLOBAL';
}

/* --------------------------------------------- */
/* Command Options                               */
/* --------------------------------------------- */

export interface CommandOptions {
    name: string;
    description?: string;
    type?: ApplicationCommandType;
    category?: string;

    development?: boolean;
    devOnly?: boolean;
    hideCommand?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    nsfw?: boolean;

    cooldown?: CommandCooldown;

    options?: unknown[];
    groups?: Record<string, SubcommandGroup> | null;
    subcommands?: Record<string, Subcommand> | null;
}

/* --------------------------------------------- */
/* Subcommands                                   */
/* --------------------------------------------- */

export interface SubcommandGroup {
    description: string;
    subcommands: Record<string, Subcommand>;
}

export interface Subcommand {
    description: string;
    args?: Argument[];
    execute?: (ctx: CommandExecutionContext) => Promise<void> | void;
}

/* --------------------------------------------- */
/* Arguments & Autocomplete                      */
/* --------------------------------------------- */

export interface Argument {
    type:
        | 'STRING'
        | 'INTEGER'
        | 'BOOLEAN'
        | 'USER'
        | 'CHANNEL'
        | 'ROLE'
        | 'MENTIONABLE'
        | 'NUMBER';
    name: string;
    description: string;
    required?: boolean;
    autocomplete?: (
        ctx: AutocompleteExecutionContext
    ) => Promise<Choice[]> | Choice[];
}

export interface Choice {
    name: string;
    value: string | number;
}