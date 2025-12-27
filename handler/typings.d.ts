/*
    Author: Bullet_Tide.
*/

import {
    ApplicationCommandOptionData,
    PermissionResolvable,
    ChatInputCommandInteraction
} from 'discord.js';
import { Client } from '../src/utils/client';

/* --------------------------------------------- */
/* Shared Execution Context                      */
/* --------------------------------------------- */

export interface CommandExecutionContext {
    client: Client;
    interaction: ChatInputCommandInteraction;
    group: string | null;
    subcommand: string | null;
}

/* --------------------------------------------- */
/* Command Options                               */
/* --------------------------------------------- */

export interface CommandOptions {
    name: string;
    description: string;
    category?: string;
    options?: ApplicationCommandOptionData[];
    development?: boolean;
    devOnly?: boolean;
    hideCommand?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    perms?: PermissionResolvable[];
    clientPerms?: PermissionResolvable[];
    nsfw?: boolean;
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
/* Arguments                                     */
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
    choices?: Choice[];
    required?: boolean;
}

export interface Choice {
    name: string;
    value: string | number;
}