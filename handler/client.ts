/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import {
    Client,
    ClientOptions,
    Collection
} from 'discord.js';

import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { connect, Document } from 'mongoose';

import { registerCommands, registerEvents } from './registry';
import { Command } from '../src/utils/command';
import { Utils } from '../src/utils/utils';
import { Manager } from './manager';

import guildModel from '../src/schemas/guild';
import profileModel from '../src/schemas/profile';

/* --------------------------------------------- */
/* Client                                        */
/* --------------------------------------------- */

class HandlerClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, string[]>;

    guildInfo: Manager<string, Document>;
    profileInfo: Manager<string, Document>;

    config: typeof import('../config/config.json');
    languages: Record<string, any>;
    utils: Utils;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.categories = new Collection();

        this.guildInfo = new Manager(this, guildModel);
        this.profileInfo = new Manager(this, profileModel);

        this.config = require('../config/config.json');
        this.languages = require('../config/languages.json');

        this.utils = new Utils(this);
    }

    async loadCommands(): Promise<void> {
        await registerCommands(this, '../src/commands');

        const guildCommands = toApplicationCommands(
            this.commands.filter(cmd => cmd.development)
        );

        const globalCommands = toApplicationCommands(
            this.commands.filter(cmd => !cmd.development)
        );

        if (guildCommands.length) {
            for (const guildId of this.config.DEV_SERVERS) {
                const guild = await this.guilds.fetch(guildId).catch(() => null);
                if (!guild) continue;

                await guild.commands.set(guildCommands);
            }
        }

        if (globalCommands.length) {
            await this.application!.commands.set(globalCommands);
        }
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

function toApplicationCommands(
    collection: Collection<string, Command>
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return collection.map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options
    }));
}