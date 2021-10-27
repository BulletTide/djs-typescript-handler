/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { PermissionString, ApplicationCommandPermissionData, ApplicationCommandOptionData } from 'discord.js';
import { Client } from '@client';
import { SubcommandGroup, Subcommand, CommandOptions } from './typings';

class HandlerCommand {
    client: Client;
    name: string;
    description: string;
    category: string;
    options: ApplicationCommandOptionData[];
    defaultPermission: boolean;
    permissions: ApplicationCommandPermissionData[]
    development: boolean;
    devOnly: boolean;
    hideCommand: boolean;
    ownerOnly: boolean;
    guildOnly: boolean;
    perms: PermissionString[];
    clientPerms: PermissionString[];
    nsfw: boolean;
    groups: { [x: string]: SubcommandGroup } | null;
    subcommands: { [x: string]: Subcommand } | null;

    constructor (client: Client, {
        name = '',
        description = '',
        category = 'No category',
        options = [],
        defaultPermission = true,
        permissions = [],
        development = true,
        devOnly = false,
        hideCommand = false,
        ownerOnly = false,
        guildOnly = true,
        perms = [],
        clientPerms = [],
        nsfw = false,
        groups = null,
        subcommands = null
    }: CommandOptions) {
        this.client = client;
        this.name = name;
        this.description = description;
        this.category = category;
        this.options = options;
        this.defaultPermission = defaultPermission;
        this.permissions = permissions;
        this.development = development;
        this.devOnly = devOnly;
        this.hideCommand = hideCommand;
        this.ownerOnly = ownerOnly;
        this.guildOnly = guildOnly;
        this.perms = perms;
        this.clientPerms = clientPerms;
        this.nsfw = nsfw;
        this.groups = groups;
        this.subcommands = subcommands;

        if (options && options.length) this.options = options;
        else if (groups && Object.keys(groups)) this.options = getSubcommandGroupOptions(groups);
        else if (subcommands && Object.keys(subcommands)) this.options = getSubcommandOptions(subcommands);
    }
}

export { HandlerCommand, CommandOptions };

function getSubcommandGroupOptions (groups: { [x: string]: SubcommandGroup }) {
    const names = Object.keys(groups);
    const options = [];

    for (const name of names) {
        const option: ApplicationCommandOptionData = {
            name,
            description: groups[name].description,
            options: getSubcommandOptions(groups[name].subcommands),
            type: 'SUB_COMMAND_GROUP'
        };

        options.push(option);
    }

    return options;
}

function getSubcommandOptions (subcommands: { [x: string]: Subcommand }) {
    const names = Object.keys(subcommands);
    const options = [];

    for (const name of names) {
        const option: ApplicationCommandOptionData = {
            name,
            description: subcommands[name].description,
            options: subcommands[name].args ? subcommands[name].args! : [],
            type: 'SUB_COMMAND'
        };

        options.push(option);
    }

    return options;
}