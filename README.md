# Discord.js v14 TypeScript Handler

## About

Welcome! This is a powerful, modern **TypeScript handler** built for **discord.js v14**.  
The goal of this project is to eliminate the repetitive and time-consuming process of writing a Discord bot handler from scratch, while still giving developers full control and flexibility.

This handler is designed to be:
- Clean, performant, and scalable
- Fully aligned with Discord.js v14 standards
- Friendly for both small bots and large projects

### Features
- ⚡ Automatic command & event loading
- 🧠 Optional MongoDB support with a generic manager
- 🧩 Support for subcommands & subcommand groups
- 🛠️ Strict TypeScript typing
- 🚀 Development vs production command separation
- 📦 ESLint + TypeScript ready
- 🔒 Slash-command–only (Discord compliant)

---

## Requirements

- **Node.js 18.0.0 or newer**
- **npm 9.0.0 or newer**
- **discord.js v14**
- **TypeScript v5+**

> MongoDB is **optional** and only required if you use database features.

---

## Installation

    npm install

---

## Project Structure

    src/
    ├── commands/           # Slash commands
    │   ├── default/
    │   └── owner/
    ├── events/             # Discord events
    ├── utils/              # Client, Command, Utils
    ├── config/             # Configuration & languages
    ├── schemas/            # Mongoose schemas (optional)
    ├── types/              # Shared TypeScript types
    └── index.ts            # Entry point

    handler/
    ├── client.ts           # Extended Discord client
    ├── command.ts          # Command builder
    ├── events.ts           # Shared event logic
    ├── manager.ts          # MongoDB manager
    ├── registry.ts         # Command/event loader
    └── typings.d.ts        # Handler typings

---

## Configuration

1. Navigate to `src/config`
2. Fill in your bot configuration
3. Add your Discord user ID(s) to `DEVS`
4. Add development server IDs to `DEV_SERVERS`
5. (Optional) Add a MongoDB URI if using database features

---

## Development vs Production

Commands marked as:

    development: true

- Are registered **only** to servers listed in `DEV_SERVERS`
- Update instantly

Global commands:
- Use `development: false`
- May take up to **1 hour** to propagate

**Recommended workflow**
1. Develop commands using `development: true`
2. Switch to `false` once stable

---

## Adding a Command

### Basic Command

    import { ChatInputCommandInteraction } from 'discord.js';
    import { Command } from '../../utils/command';
    import { Client } from '../../utils/client';

    export default class Template extends Command {
        constructor(client: Client) {
            super(client, {
                name: 'template',
                description: 'This is a template command'
            });
        }

        async execute({
            client,
            interaction
        }: {
            client: Client;
            interaction: ChatInputCommandInteraction;
        }): Promise<void> {
            //
        }
    }

---

### Subcommands

    import { ChatInputCommandInteraction } from 'discord.js';
    import { Command } from '../../utils/command';
    import { Client } from '../../utils/client';

    export default class Example extends Command {
        constructor(client: Client) {
            super(client, {
                name: 'example',
                description: 'Example with subcommands',
                subcommands: {
                    one: {
                        description: 'First subcommand',
                        execute: async ({ interaction }) => {
                            //
                        }
                    },
                    two: {
                        description: 'Second subcommand',
                        execute: async ({ interaction }) => {
                            //
                        }
                    }
                }
            });
        }
    }

---

## Adding an Event

    import { Client } from '../../utils/client';

    export default async (client: Client): Promise<void> => {
        //
    };

**Rules**
- File name **must match the Discord event name**
- Events are auto-registered at startup

---

## Discord.js v14 Notes

This project strictly follows Discord.js v14:

- `MessageEmbed` → `EmbedBuilder`
- `Intents` → `GatewayIntentBits`
- `CommandInteraction` → `ChatInputCommandInteraction`
- Permissions use `PermissionFlagsBits`
- Slash commands only (no message commands)

Older v13 code **will not work without migration**.

---

## Environment Variables (Optional)

    TOKEN=your-bot-token
    MONGODB_URI=mongodb://localhost:27017/bot

These can override values in `config.json`.

---

## FAQ

### Commands not showing up?
- Ensure the bot has the `applications.commands` scope
- Verify `DEV_SERVERS` is configured
- Restart the bot after changes

### MongoDB required?
No. Database features are optional.

### ESLint errors in template files?
Template files are ignored automatically.

---

## Contributing

- Follow existing project structure
- Use Discord.js v14 APIs only
- All changes must pass `tsc` and `eslint`
- Keep the handler framework-agnostic

---

## License

MIT License  
You are free to use, modify, and distribute this project.

---

## Credits

Inspired by community Discord bot handler patterns


## Credits

Inspired by  
[Canta’s bot-prefab-package](https://www.npmjs.com/package/bot-prefab-package)
