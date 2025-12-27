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

            if (file.endsWith('.ts')) {
                client.utils.log(
                    'WARNING',
                    'registry',
                    `TypeScript file detected (${file}). Did you forget to run tsc?`
                );
            }

            if (stat.isDirectory()) {
                await registerCommands(client, path.join(dir, file));
                continue;
            }

            if (!file.endsWith('.js')) continue;

            try {
                const Imported = (await import(fullPath)).default;
                if (!Imported) continue;

                const cmdModule: Command = new Imported(client);

                if (typeof cmdModule.execute !== 'function') {
                    client.utils.log(
                        'ERROR',
                        'registry',
                        `Command "${file}" does not implement execute()`
                    );
                    continue;
                }

                const { name, category, hideCommand } = cmdModule;

                if (!name) {
                    client.utils.log(
                        'WARNING',
                        'registry',
                        `The command '${fullPath}' doesn't have a name`
                    );
                    continue;
                }

                if (client.commands.has(name)) {
                    client.utils.log(
                        'WARNING',
                        'registry',
                        `The command name '${name}' (${fullPath}) has already been added.`
                    );
                    continue;
                }

                if (cmdModule.development && !client.config.DEV_SERVERS[0]) {
                    client.utils.log(
                        'WARNING',
                        'registry',
                        'Development command detected but no DEV_SERVERS configured.'
                    );
                    continue;
                }

                client.commands.set(name, cmdModule);

                if (hideCommand) continue;

                const key = category?.toLowerCase() ?? 'no category';
                const list = client.categories.get(key) ?? [category ?? 'No category'];
                list.push(name);
                client.categories.set(key, list);
            } catch (e) {
                client.utils.log(
                    'ERROR',
                    'registry',
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
                    'registry',
                    `Error loading event ${file}: ${e}`
                );
            }
        }
    }
}

export {
    registerCommands,
    registerEvents
};