/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import * as fs from 'fs/promises';
import * as path from 'path';
import { Client } from '../src/utils/client';
import { Command } from '../src/utils/command';

async function registerCommands(
    client: Client,
    ...dirs: string[]
): Promise<void> {
    for (const dir of dirs) {
        const files = await fs.readdir(path.join(__dirname, dir));

        for (const file of files) {
            const fullPath = path.join(__dirname, dir, file);
            const stat = await fs.lstat(fullPath);

            if (file.includes('-ignore')) continue;

            if (stat.isDirectory()) {
                await registerCommands(client, path.join(dir, file));
                continue;
            }

            // NOTE: The registry loads compiled JavaScript files.
            // Ensure the project is built with `tsc` before running in production.
            if (!file.endsWith('.js')) continue;

            try {
                const Imported = (await import(fullPath)).default;
                if (!Imported) continue;

                const cmdModule: Command = new Imported(client);

                if (typeof cmdModule.execute !== 'function') {
                    client.utils.log(
                        'ERROR',
                        'src/registry.js',
                        `Command "${file}" does not implement execute()`
                    );
                    continue;
                }

                const { name, category, hideCommand } = cmdModule;

                if (!name) {
                    client.utils.log(
                        'WARNING',
                        'src/registry.js',
                        `The command '${fullPath}' doesn't have a name`
                    );
                    continue;
                }

                if (client.commands.has(name)) {
                    client.utils.log(
                        'WARNING',
                        'src/registry.js',
                        `The command name '${name}' (${fullPath}) has already been added.`
                    );
                    continue;
                }

                if (cmdModule.development) {
                    const server = client.config.DEV_SERVERS[0];

                    if (!server) {
                        client.utils.log(
                            'WARNING',
                            'src/registry.js',
                            'To add a development-only command, at least one DEV_SERVER is required.'
                        );
                        continue;
                    }
                }

                client.commands.set(name, cmdModule);

                if (hideCommand) continue;

                if (category) {
                    const key = category.toLowerCase();
                    const commands = client.categories.get(key) ?? [category];
                    commands.push(name);
                    client.categories.set(key, commands);
                } else {
                    client.utils.log(
                        'WARNING',
                        'src/registry.js',
                        `The command '${name}' doesn't have a category, defaulting to 'No category'.`
                    );

                    const commands =
                        client.categories.get('no category') ?? ['No category'];
                    commands.push(name);
                    client.categories.set('no category', commands);
                }
            } catch (e) {
                client.utils.log(
                    'ERROR',
                    'src/registry.js',
                    `Error loading command ${file}: ${e}`
                );
            }
        }
    }
}

async function registerEvents(
    client: Client,
    ...dirs: string[]
): Promise<void> {
    for (const dir of dirs) {
        const files = await fs.readdir(path.join(__dirname, dir));

        for (const file of files) {
            const fullPath = path.join(__dirname, dir, file);
            const stat = await fs.lstat(fullPath);

            if (file.includes('-ignore')) continue;

            if (stat.isDirectory()) {
                await registerEvents(client, path.join(dir, file));
                continue;
            }

            if (!file.endsWith('.js')) continue;

            const eventName = file.substring(0, file.indexOf('.js'));

            try {
                const eventModule = (await import(fullPath)).default;
                client.on(eventName, eventModule.bind(null, client));
            } catch (e) {
                client.utils.log(
                    'ERROR',
                    'src/registry.js',
                    `Error loading event ${file}: ${e}`
                );
            }
        }
    }
}

export {
    registerEvents,
    registerCommands
};