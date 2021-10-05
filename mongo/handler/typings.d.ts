/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { PermissionString, ApplicationCommandPermissionData, CommandInteraction, ApplicationCommandOptionData } from 'discord.js';
import { Client } from '../src/utils/client';

export interface CommandOptions {
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

export interface SubcommandGroup {
    description: string;
    subcommands: { [x: string]: Subcommand }
}

export interface Subcommand {
    description: string;
    args?: Argument[];
    execute? ({ client, interaction, group, subcommand }: { client: Client, interaction: CommandInteraction, group: string, subcommand: string }): any;
}

export interface Argument {
    type: 'STRING'|'INTEGER'|'BOOLEAN'|'USER'|'CHANNEL'|'ROLE'|'MENTIONABLE'|'NUMBER';
    name: string;
    description: string;
    choices?: Choice[];
    required?: boolean;
    channelTypes?: ChannelTypes[];
}

export interface Choice {
    name: string;
    value: string|number;
}

export type ChannelTypes = | 'GUILD_TEXT' | 'DM' | 'GUILD_VOICE' | 'GROUP_DM' | 'GUILD_CATEGORY' | 'GUILD_NEWS' | 'GUILD_STORE' | 'GUILD_NEWS_THREAD' | 'GUILD_PUBLIC_THREAD' | 'GUILD_PRIVATE_THREAD' | 'GUILD_STAGE_VOICE';