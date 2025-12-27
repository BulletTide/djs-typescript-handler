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
import { CommandHooks } from './hooks';

import guildModel from '../src/schemas/guild';
import profileModel from '../src/schemas/profile';
import { Languages } from '../src/types/languages';
import { env, EnvConfig } from '../src/config/env';

class HandlerClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, string[]>;
    cooldowns: CooldownManager;

    guildInfo: Manager<string, Document>;
    profileInfo: Manager<string, Document>;

    hooks: CommandHooks = {};

    config: EnvConfig;
    languages: Languages;
    utils: Utils;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.categories = new Collection();
        this.cooldowns = new CooldownManager();

        this.guildInfo = new Manager(this, guildModel);
        this.profileInfo = new Manager(this, profileModel);

        this.config = env;
        this.languages = require('../src/config/languages.json') as Languages;
        this.utils = new Utils(this);
    }

    async loadCommands(): Promise<void> {
        await registerCommands(this, '../src/commands');

        const chatInput = this.commands
            .filter(c => c.type === ApplicationCommandType.ChatInput)
            .map<RESTPostAPIChatInputApplicationCommandsJSONBody>(cmd => ({
                name: cmd.name,
                description: cmd.description!,
                options: cmd.options
            }));

        const contextMenus = this.commands
            .filter(
                c =>
                    c.type === ApplicationCommandType.User ||
                    c.type === ApplicationCommandType.Message
            )
            .map<RESTPostAPIContextMenuApplicationCommandsJSONBody>(cmd => ({
                name: cmd.name,
                type: cmd.type as
                    | ApplicationCommandType.User
                    | ApplicationCommandType.Message
            }));

        for (const guildId of this.config.DEV_SERVERS) {
            const guild = await this.guilds.fetch(guildId).catch(() => null);
            if (!guild) continue;

            await guild.commands.set([
                ...chatInput.filter(c =>
                    this.commands.get(c.name)?.development
                ),
                ...contextMenus
            ]);
        }

        await this.application!.commands.set([
            ...chatInput.filter(
                c => !this.commands.get(c.name)?.development
            ),
            ...contextMenus
        ]);
    }

    async loadEvents(): Promise<void> {
        await registerEvents(this, '../src/events');
    }

    async start(): Promise<string> {
        if (this.config.MONGODB_URI) {
            await connect(this.config.MONGODB_URI);
        }

        await super.login(this.config.TOKEN);

        await this.loadEvents();
        await this.loadCommands();

        return this.token!;
    }
}

export { HandlerClient };