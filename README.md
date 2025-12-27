# Discord.js v14 TypeScript Handler

## Overview

A modern, **production-ready Discord bot handler** built with **TypeScript** and **discord.js v14**.

This project exists to remove the boilerplate and architectural guesswork involved in building Discord bots, while still giving developers **full control** over structure, behavior, and scalability.

Designed for:
- Small bots that need clean structure
- Large bots that need strict typing and scalability
- Developers who want correctness over magic

---

## ✨ Features

- ⚡ Automatic command & event loading
- 🧩 Slash commands with subcommands & groups
- 🖱️ User & Message context menu commands
- ⏱️ Optional per-command cooldowns
- 🧠 Optional MongoDB integration
- 🛠️ Strict TypeScript typing throughout
- 🚀 Development vs production command separation
- 📦 ESLint (flat config) + TypeScript ready
- 🔒 Discord-compliant (slash commands only)

---

## 📋 Requirements

- **Node.js 18+**
- **npm 9+**
- **discord.js v14**
- **TypeScript 5+**

> MongoDB is optional and only required if you use database features.

---

## 📦 Installation

```bash
npm install
```

---

## 📁 Project Structure

```text
src/
├── commands/           # Slash & context menu commands
│   ├── default/
│   └── owner/
├── events/             # Discord events
├── utils/              # Client, Command, utilities
├── config/             # Configuration & languages
├── schemas/            # Mongoose schemas (optional)
├── types/              # Shared TypeScript types
└── index.ts            # Entry point

handler/
├── client.ts           # Extended Discord client
├── command.ts          # Command builder
├── events.ts           # Central interaction handling
├── cooldowns.ts        # Cooldown manager
├── manager.ts          # MongoDB manager
├── registry.ts         # Command/event loader
└── typings.d.ts        # Handler typings
```

---

## ⚙️ Configuration

1. Navigate to `src/config`
2. Fill in `config.json`
3. Add your Discord user IDs to `DEVS`
4. Add development guild IDs to `DEV_SERVERS`
5. (Optional) Add `MONGODB_URI`

---

## 🚀 Development vs Production Commands

Commands marked with:

```ts
development: true
```

- Are registered **only** in `DEV_SERVERS`
- Update instantly

Global commands:
- Use `development: false`
- May take up to **1 hour** to propagate

**Recommended workflow**
1. Develop using `development: true`
2. Switch to `false` when stable

---

## 🧠 Commands

All commands extend the base `Command` class and must implement `execute`.

They receive a **unified execution context**, regardless of command type.

### Basic Command

```ts
import { Command } from '../../utils/command';
import { Client } from '../../utils/client';
import { CommandExecutionContext } from '../../../handler/typings';

export default class Example extends Command {
    constructor(client: Client) {
        super(client, {
            name: 'example',
            description: 'Example command',
            cooldown: {
                duration: 5,
                scope: 'USER'
            }
        });
    }

    async execute({ interaction }: CommandExecutionContext): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        await interaction.reply('Hello world');
    }
}
```

---

### Subcommands

```ts
subcommands: {
    one: {
        description: 'First subcommand',
        execute: async ({ interaction }) => {
            await interaction.reply('Subcommand one');
        }
    },
    two: {
        description: 'Second subcommand',
        execute: async ({ interaction }) => {
            await interaction.reply('Subcommand two');
        }
    }
}
```

---

### Autocomplete

Autocomplete can be defined inline per argument:

```ts
autocomplete: async ({ interaction }) => {
    const focused = interaction.options.getFocused();
    return [
        { name: `${focused} one`, value: `${focused}_1` },
        { name: `${focused} two`, value: `${focused}_2` }
    ];
}
```

- Fully typed
- Automatically routed
- No registry required

---

## 🖱️ Context Menu Commands

User and Message context menus are supported using the same `Command` class.

```ts
import { ApplicationCommandType } from 'discord.js';

super(client, {
    name: 'Inspect User',
    type: ApplicationCommandType.User
});
```

- No options
- No description required
- Shares guards, permissions, and cooldowns

---

## ⏱️ Cooldowns

Commands may define optional cooldowns:

```ts
cooldown: {
    duration: 10,
    scope: 'USER' // USER | GUILD | GLOBAL
}
```

- Checked before execution
- In-memory and fast
- Automatically expires

---

## 🧩 Events

```ts
import { Client } from '../../utils/client';

export default async (client: Client): Promise<void> => {
    // Event logic
};
```

Rules:
- File name must match the Discord event
- Automatically registered

---

## ℹ️ Discord.js v14 Notes

- `MessageEmbed` → `EmbedBuilder`
- `CommandInteraction` → `ChatInputCommandInteraction`
- `Intents` → `GatewayIntentBits`
- Slash commands only

---

## 🌱 Environment Variables (Optional)

```text
TOKEN=your-bot-token
MONGODB_URI=mongodb://localhost:27017/bot
```

---

## 🤝 Contributing

- Follow the existing structure
- Use discord.js v14 APIs only
- All changes must pass `tsc` and `eslint`
- Keep the handler framework-agnostic

---

## 📜 License

MIT License — free to use, modify, and distribute.

---

## 🙏 Credits

Inspired by  
Canta’s bot-prefab-package  
https://www.npmjs.com/package/bot-prefab-package
