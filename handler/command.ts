/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import {
    ApplicationCommandOptionType,
    PermissionResolvable
} from 'discord.js';

import {
    APIApplicationCommandOption,
    APIApplicationCommandSubcommandOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandBasicOption
} from 'discord-api-types/v10';

import { Client } from '../src/utils/client';
import { SubcommandGroup, Subcommand, CommandOptions, Argument } from './typings';

class HandlerCommand {
    client!: Client;
    name!: string;
    description!: string;
    category!: string;

    options!: APIApplicationCommandOption[];

    development!: boolean;
    devOnly!: boolean;
    hideCommand!: boolean;
    ownerOnly!: boolean;
    guildOnly!: boolean;
    nsfw!: boolean;

    perms!: PermissionResolvable[];
    clientPerms!: PermissionResolvable[];

    groups!: Record<string, SubcommandGroup> | null;
    subcommands!: Record<string, Subcommand> | null;

    constructor(client: Client, opts: CommandOptions) {
        this.client = client;

        this.name = opts.name;
        this.description = opts.description;
        this.category = opts.category ?? 'No category';

        this.development = opts.development ?? true;
        this.devOnly = opts.devOnly ?? false;
        this.hideCommand = opts.hideCommand ?? false;
        this.ownerOnly = opts.ownerOnly ?? false;
        this.guildOnly = opts.guildOnly ?? true;
        this.nsfw = opts.nsfw ?? false;

        this.perms = opts.perms ?? [];
        this.clientPerms = opts.clientPerms ?? [];

        this.groups = opts.groups ?? null;
        this.subcommands = opts.subcommands ?? null;

        if (opts.options?.length) {
            this.options = opts.options as APIApplicationCommandOption[];
        } else if (this.groups) {
            this.options = buildGroupOptions(this.groups);
        } else if (this.subcommands) {
            this.options = buildSubcommandOptions(this.subcommands);
        } else {
            this.options = [];
        }
    }
}

export { HandlerCommand, CommandOptions };

/* --------------------------------------------- */
/* Builders (API SAFE)                            */
/* --------------------------------------------- */

function buildGroupOptions(
    groups: Record<string, SubcommandGroup>
): APIApplicationCommandSubcommandGroupOption[] {
    return Object.entries(groups).map(([name, group]) => ({
        type: ApplicationCommandOptionType.SubcommandGroup,
        name,
        description: group.description,
        options: buildSubcommandOptions(group.subcommands)
    }));
}

function buildSubcommandOptions(
    subs: Record<string, Subcommand>
): APIApplicationCommandSubcommandOption[] {
    return Object.entries(subs).map(([name, sub]) => ({
        type: ApplicationCommandOptionType.Subcommand,
        name,
        description: sub.description,
        options: (sub.args ?? []).map(buildArgumentOption) as APIApplicationCommandBasicOption[]
    }));
}

function buildArgumentOption(arg: Argument): APIApplicationCommandBasicOption {
    const base = {
        name: arg.name,
        description: arg.description,
        required: arg.required ?? false
    };

    switch (arg.type) {
    case 'STRING':
        return {
            ...base,
            type: ApplicationCommandOptionType.String,
            ...(arg.choices ? { choices: arg.choices.map(c => ({ name: c.name, value: String(c.value) })) } : {})
        };

    case 'INTEGER':
        return {
            ...base,
            type: ApplicationCommandOptionType.Integer,
            ...(arg.choices ? { choices: arg.choices.map(c => ({ name: c.name, value: Number(c.value) })) } : {})
        };

    case 'NUMBER':
        return {
            ...base,
            type: ApplicationCommandOptionType.Number,
            ...(arg.choices ? { choices: arg.choices.map(c => ({ name: c.name, value: Number(c.value) })) } : {})
        };

    case 'BOOLEAN':
        return { ...base, type: ApplicationCommandOptionType.Boolean };

    case 'USER':
        return { ...base, type: ApplicationCommandOptionType.User };

    case 'CHANNEL':
        return { ...base, type: ApplicationCommandOptionType.Channel };

    case 'ROLE':
        return { ...base, type: ApplicationCommandOptionType.Role };

    case 'MENTIONABLE':
        return { ...base, type: ApplicationCommandOptionType.Mentionable };

    default:
        throw new Error(`Unknown argument type: ${arg.type}`);
    }
}