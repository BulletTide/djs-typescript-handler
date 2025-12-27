/*
    Author: Bullet_Tide.
*/

import {
    Client,
    ClientOptions,
    Collection,
    ApplicationCommandType
} from 'discord.js';

import {
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    RESTPostAPIContextMenuApplicationCommandsJSONBody
} from 'discord-api-types/v10';

import { connect, Document } from 'mongoose';

import { registerCommands, registerEvents } from './registry';
import { Command } from '../src/utils/command';
import { Utils } from '../src/utils/utils';
import { Manager } from './manager';
import { CooldownManager } from './cooldowns';

import guildModel from '../src/schemas/guild';
import profileModel from '../src/schemas/profile';
import { Languages } from '../src/types/languages';

/* --------------------------------------------- */
/* Config Type                                   */
/* --------------------------------------------- */

interface BotConfig {
    TOKEN: string;
    MONGODB_URI: string;
    DEVS: string[];
    DEV_SERVERS: string[];
    EMOTES: Record<string, string>;
}

/* --------------------------------------------- */
/* Client                                        */
/* --------------------------------------------- */

class HandlerClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, string[]>;
    cooldowns: CooldownManager;

    guildInfo: Manager<string, Document>;
    profileInfo: Manager<string, Document>;

    config: BotConfig;
    languages: Languages;
    utils: Utils;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.categories = new Collection();
        this.cooldowns = new CooldownManager();

        this.guildInfo = new Manager(this, guildModel);
        this.profileInfo = new Manager(this, profileModel);

        this.config = require('../config/config.json') as BotConfig;
        this.languages = require('../config/languages.json') as Languages;

        this.utils = new Utils(this);
    }

    async loadCommands(): Promise<void> {
        await registerCommands(this, '../src/commands');

        const guildChatInput = toChatInputCommands(
            this.commands.filter(
                c =>
                    c.development &&
                    c.type === ApplicationCommandType.ChatInput
            )
        );

        const globalChatInput = toChatInputCommands(
            this.commands.filter(
                c =>
                    !c.development &&
                    c.type === ApplicationCommandType.ChatInput
            )
        );

        const contextMenus = toContextMenuCommands(
            this.commands.filter(
                c =>
                    c.type === ApplicationCommandType.User ||
                    c.type === ApplicationCommandType.Message
            )
        );

        for (const guildId of this.config.DEV_SERVERS) {
            const guild = await this.guilds.fetch(guildId).catch(() => null);
            if (!guild) continue;

            await guild.commands.set([
                ...guildChatInput,
                ...contextMenus
            ]);
        }

        await this.application!.commands.set([
            ...globalChatInput,
            ...contextMenus
        ]);
    }

    async loadEvents(): Promise<void> {
        await registerEvents(this, '../src/events');
    }

    async login(token: string): Promise<string> {
        if (this.config.MONGODB_URI) {
            await connect(this.config.MONGODB_URI);
        }

        await super.login(token);

        await this.loadEvents();
        await this.loadCommands();

        return this.token!;
    }
}

export { HandlerClient };

/* --------------------------------------------- */
/* Helpers                                       */
/* --------------------------------------------- */

function toChatInputCommands(
    collection: Collection<string, Command>
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return collection.map(cmd => ({
        name: cmd.name,
        description: cmd.description!,
        options: cmd.options
    }));
}

function toContextMenuCommands(
    collection: Collection<string, Command>
): RESTPostAPIContextMenuApplicationCommandsJSONBody[] {
    return collection.map(cmd => ({
        name: cmd.name,
        type: cmd.type as
            | ApplicationCommandType.User
            | ApplicationCommandType.Message
    }));
}