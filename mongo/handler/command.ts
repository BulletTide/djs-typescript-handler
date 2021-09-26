/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { PermissionString, ApplicationCommandPermissionData, CommandInteraction, ApplicationCommandOptionData } from 'discord.js';
import { Client } from '../src/utils/client';

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
        }

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
            options: subcommands[name].args,
            type: 'SUB_COMMAND'
        }

        options.push(option);
    }

    return options;
}

/**
 * @typedef CommandOptions Options for the slash command.
 * @type {object}
 * @property {string} name The name of the slash command.
 * @property {string} description The description of the slash command.
 * @property {string} [category] The category of this command.
 * @property {import('discord.js').ApplicationCommandOptionData[]} [options] The options for this slash command.
 * @property {boolean} [defaultPermission] If false, this slash command will be disabled for everyone.
 * @property {import('discord.js').ApplicationCommandPermissionData[]} [permissions] Data to give/take the permissions for a user/role to use this command.
 * @property {boolean} [development] Whether this is a global command or a guild only command (first ID of config.DEV_SERVERS).
 * @property {boolean} [devOnly] Whether this command can only be used by a bot dev.
 * @property {boolean} [hideCommand] Whether or not this command will be displayed in the help command.
 * @property {boolean} [ownerOnly] Whether this command can only be used by the server owner.
 * @property {boolean} [guildOnly] Whether this command can only be used in a server.
 * @property {import('discord.js').PermissionString[]} [perms] Permissions that the user needs in order to use this command.
 * @property {import('discord.js').PermissionString[]} [clientPerms] Permissions that the client needs to run this command.
 * @property {boolean} [nsfw] Whether or not this command can only be used in a NSFW channel.
 * @property {Object.<string, SubcommandGroup>} [groups] Subcommand groups for this command.
 * @property {Object.<string, Subcommand>} [subcommands] Subcommands for this command.
 */
 declare interface CommandOptions {
    name: string;
    description: string;
    category?: string;
    options?: ApplicationCommandOptionData[];
    defaultPermission?: boolean;
    permissions?: ApplicationCommandPermissionData[]
    development?: boolean;
    devOnly?: boolean;
    hideCommand?: boolean;
    ownerOnly?: boolean;
    guildOnly?: boolean;
    perms?: PermissionString[];
    clientPerms?: PermissionString[];
    nsfw?: boolean;
    groups?: { [x: string]: SubcommandGroup } | null;
    subcommands?: { [x: string]: Subcommand } | null;
}

/**
 * @typedef SubcommandGroup The group for a subcommand.
 * @type {object} 
 * @property {string} description The description for the subcommand group.
 * @property {Object.<string, Subcommand>} subcommands An object containing each subcommand.
 */
declare interface SubcommandGroup {
    description: string;
    subcommands: { [x: string]: Subcommand }
}

/**
 * @typedef Subcommand The subcommand.
 * @type {object} 
 * @property {string} description The description for the subcommand.
 * @property {Argument[]} [args] Argument(s) (options) for the subcommand.
 * @property {({ client, interaction, group, subcommand } : { client: import('../src/utils/client'), interaction: import('discord.js').CommandInteraction, group: string, subcommand: string }) => any} [execute] The execute function for the subcommand.
 */
declare interface Subcommand {
    description: string;
    args?: Argument[];
    execute? ({ client, interaction, group, subcommand }: { client: Client, interaction: CommandInteraction, group: string, subcommand: string }): any;
}

/**
 * @typedef Argument The argument (options) for the slash command.
 * @type {object} 
 * @property {('STRING'|'INTEGER'|'BOOLEAN'|'USER'|'CHANNEL'|'ROLE'|'MENTIONABLE'|'NUMBER')} type The type of option for the slash command.
 * @property {string} name The name for the argument (this needs to be unique for each argument, no spaces!).
 * @property {string} description The description for the argument.
 * @property {Choice[]} [choices] The choices for the argument.
 * @property {boolean} [required] Whether the argument is required or not.
 */
declare interface Argument {
    type: 'STRING'|'INTEGER'|'BOOLEAN'|'USER'|'CHANNEL'|'ROLE'|'MENTIONABLE'|'NUMBER';
    name: string;
    description: string;
    choices?: Choice[];
    required?: boolean;
}

/**
 * @typedef Choice The custom choice for the argument.
 * @type {object} 
 * @property {string} name The name of the choice (this needs to be unique for each chouce, no spaces!).
 * @property {string|number} value The custom value that the choice will return upon interaction (this needs to be unique for each chouce, no spaces!).
 */
declare interface Choice {
    name: string;
    value: string|number;
}