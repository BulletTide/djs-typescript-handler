/*
    Author: Bullet_Tide.
*/

import 'dotenv/config';
import { GatewayIntentBits } from 'discord.js';
import { Client } from '../src/utils/client';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    allowedMentions: { parse: ['users'] }
});

(async () => {
    await client.start();
})();