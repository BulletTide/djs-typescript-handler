import { Intents } from 'discord.js';
import { Client } from './utils/client';

const client = new Client({ 
    intents: Object.values(Intents.FLAGS),
    restTimeOffset: 0,
    allowedMentions: { parse: ['users'] }
});

(async () => {
    client.login(client.config.TOKEN);
})();