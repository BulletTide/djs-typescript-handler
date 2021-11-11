/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { Client, ClientOptions, Collection, ApplicationCommandData } from 'discord.js';
import { registerCommands, registerEvents } from './registry';
import { Command } from '../src/utils/command';
import { Guild } from '../src/types/guild';
import { Profile } from '../src/types/profile';
import { Utils } from '../src/utils/utils';
import { Manager } from './manager';
import guildModel from '../src/schemas/guild';
import profileModel from '../src/schemas/profile';
import { connect } from 'mongoose';

class HandlerClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, string[]>;
    guildInfo: Manager<string, Guild>;
    profileInfo: Manager<string, Profile>;
    config: typeof import('../config/config.json');
    languages: { [x: string]: any };
    utils: Utils;

    constructor(options: ClientOptions) {
        super(options);

        this.commands = new Collection();
        this.categories = new Collection();

        // @ts-ignore
        this.guildInfo = new Manager(this, guildModel);
        // @ts-ignore
        this.profileInfo = new Manager(this, profileModel);

        this.config = require('../config/config.json');
        this.languages = require('../config/languages.json');

        this.utils = new Utils(this);
    }

    async loadCommands (): Promise<void> {
        if (!this.application?.owner) await this.application?.fetch();

        await registerCommands(this, '../src/commands');

        const guildCommands = toApplicationCommand(this.commands.filter(s => s.development));
        const globalCommands = toApplicationCommand(this.commands.filter(s => !s.development));

        if (guildCommands.length) {
            for (const server of this.config.DEV_SERVERS) {
                const guild = await this.guilds.fetch(server);
                if (!guild) continue;

                await guild.commands.set(guildCommands);
            }
        }

        if (globalCommands.length) await this.application!.commands.set(globalCommands);

        const devOnly = this.commands.filter(s => s.devOnly).values();
        for (const command of devOnly) {
            if (command.development) {
                const guild = await this.guilds.fetch(this.config.DEV_SERVERS[0]);
                await guild.commands.cache.find(c => c.name === command.name)!.permissions.set({ permissions: this.config.DEVS.map(id => { return { id, type: 'USER', permission: true }; }) });
            }
        }
    }

    async loadEvents (): Promise<void> {
        await registerEvents(this, '../src/events');
    }

    /**
     * @param {string} token The bot token.
     */
    async login (token: string): Promise<string> {
        try {
            this.utils.log('WARNING', 'src/util/client.js', 'Connecting to the database...');
            await connect(this.config.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false
            });
            this.utils.log('SUCCESS', 'src/util/client.ts', 'Connected to the database!');
        } catch (e) {
            this.utils.log('ERROR', 'src/util/client.ts', `Error connecting to the database: ${e}`);
            process.exit(1);
        }

        try {
            this.utils.log('WARNING', 'src/util/client.js', 'Logging in...');
            await super.login(token);
            this.utils.log('SUCCESS', 'src/util/client.js', `Logged in as ${this.user!.tag}`);
        } catch (e) {
            this.utils.log('ERROR', 'src/util/client.js', `Error logging in: ${e}`);
            process.exit(1);
        }

        try {
            this.utils.log('WARNING', 'src/util/client.js', 'Loading events...');
            await this.loadEvents();
            this.utils.log('SUCCESS', 'src/util/client.js', 'Loaded all events!');
        } catch (e) {
            this.utils.log('ERROR', 'src/util/client.js', `Error loading events: ${e}`);
        }

        try {
            this.utils.log('WARNING', 'src/util/client.js', 'Loading commands...');
            await this.loadCommands();
            this.utils.log('SUCCESS', 'src/util/client.js', 'Loaded all commands!');
        } catch (e) {
            this.utils.log('ERROR', 'src/util/client.js', `Error loading commands: ${e}`);
        }

        return this.token!;
    }
}

export { HandlerClient };

/**
 * Converts a generated command to a JSON format valid for the discord API.
 * @param {Collection<string, Command>} collection The collection containing the localized client command(s).
 * @returns {import('discord.js').ApplicationCommandData[]} A discord-accepted format of commands of which djs can push to the application.
 */
function toApplicationCommand (collection: Collection<string, Command>): ApplicationCommandData[] {
    return collection.map(s => { return { name: s.name, description: s.description, options: s.options, defaultPermission: s.devOnly ? false : s.defaultPermission }; });
}