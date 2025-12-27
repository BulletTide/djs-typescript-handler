import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    PermissionResolvable
} from 'discord.js';

import {
    APIApplicationCommandOption,
    APIApplicationCommandSubcommandOption,
    APIApplicationCommandSubcommandGroupOption,
    APIApplicationCommandBasicOption
} from 'discord-api-types/v10';

import { Client } from '../src/utils/client';
import {
    SubcommandGroup,
    Subcommand,
    CommandOptions,
    Argument,
    CommandCooldown
} from './typings';

class HandlerCommand {
    client: Client;

    name: string;
    description?: string;
    type: ApplicationCommandType;
    category: string;

    options: APIApplicationCommandOption[] = [];
    autocomplete = new Map<string, Argument['autocomplete']>();

    development: boolean;
    devOnly: boolean;
    hideCommand: boolean;
    ownerOnly: boolean;
    guildOnly: boolean;
    nsfw: boolean;

    perms: PermissionResolvable[];
    clientPerms: PermissionResolvable[];
    cooldown?: CommandCooldown;

    groups: Record<string, SubcommandGroup> | null;
    subcommands: Record<string, Subcommand> | null;

    constructor(client: Client, opts: CommandOptions) {
        this.client = client;

        this.name = opts.name;
        this.description = opts.description;
        this.type = opts.type ?? ApplicationCommandType.ChatInput;
        this.category = opts.category ?? 'No category';

        this.development = opts.development ?? true;
        this.devOnly = opts.devOnly ?? false;
        this.hideCommand = opts.hideCommand ?? false;
        this.ownerOnly = opts.ownerOnly ?? false;
        this.guildOnly = opts.guildOnly ?? true;
        this.nsfw = opts.nsfw ?? false;

        this.perms = opts.perms ?? [];
        this.clientPerms = opts.clientPerms ?? [];
        this.cooldown = opts.cooldown;

        this.groups = opts.groups ?? null;
        this.subcommands = opts.subcommands ?? null;

        if (this.type !== ApplicationCommandType.ChatInput) return;

        if (opts.options) {
            this.options = opts.options as APIApplicationCommandOption[];
        } else if (this.groups) {
            this.options = buildGroupOptions(
                this.name,
                this.groups,
                this.autocomplete
            );
        } else if (this.subcommands) {
            this.options = buildSubcommandOptions(
                this.name,
                this.subcommands,
                this.autocomplete
            );
        }
    }
}

export { HandlerCommand, CommandOptions };

function buildGroupOptions(
    command: string,
    groups: Record<string, SubcommandGroup>,
    autocomplete: Map<string, Argument['autocomplete']>
): APIApplicationCommandSubcommandGroupOption[] {
    return Object.entries(groups).map(([name, group]) => ({
        type: ApplicationCommandOptionType.SubcommandGroup,
        name,
        description: group.description,
        options: buildSubcommandOptions(
            `${command}.${name}`,
            group.subcommands,
            autocomplete
        )
    }));
}

function buildSubcommandOptions(
    path: string,
    subs: Record<string, Subcommand>,
    autocomplete: Map<string, Argument['autocomplete']>
): APIApplicationCommandSubcommandOption[] {
    return Object.entries(subs).map(([name, sub]) => ({
        type: ApplicationCommandOptionType.Subcommand,
        name,
        description: sub.description,
        options: (sub.args ?? []).map(arg =>
            buildArgumentOption(arg, autocomplete, `${path}.${name}`)
        )
    }));
}

function buildArgumentOption(
    arg: Argument,
    autocomplete: Map<string, Argument['autocomplete']>,
    path: string
): APIApplicationCommandBasicOption {
    const base = {
        name: arg.name,
        description: arg.description,
        required: arg.required ?? false
    };

    const supportsAutocomplete =
        arg.type === 'STRING' ||
        arg.type === 'INTEGER' ||
        arg.type === 'NUMBER';

    if (supportsAutocomplete && arg.autocomplete) {
        autocomplete.set(`${path}.${arg.name}`, arg.autocomplete);
    }

    switch (arg.type) {
    case 'STRING':
        return {
            ...base,
            type: ApplicationCommandOptionType.String,
            ...(arg.autocomplete ? { autocomplete: true } : {})
        };

    case 'INTEGER':
        return {
            ...base,
            type: ApplicationCommandOptionType.Integer,
            ...(arg.autocomplete ? { autocomplete: true } : {})
        };

    case 'NUMBER':
        return {
            ...base,
            type: ApplicationCommandOptionType.Number,
            ...(arg.autocomplete ? { autocomplete: true } : {})
        };

    case 'BOOLEAN':
        return {
            ...base,
            type: ApplicationCommandOptionType.Boolean
        };

    case 'USER':
        return {
            ...base,
            type: ApplicationCommandOptionType.User
        };

    case 'CHANNEL':
        return {
            ...base,
            type: ApplicationCommandOptionType.Channel
        };

    case 'ROLE':
        return {
            ...base,
            type: ApplicationCommandOptionType.Role
        };

    case 'MENTIONABLE':
        return {
            ...base,
            type: ApplicationCommandOptionType.Mentionable
        };

    default: {
        const _exhaustive: never = arg.type;
        throw new Error(`Unknown argument type: ${_exhaustive}`);
    }
    }
}