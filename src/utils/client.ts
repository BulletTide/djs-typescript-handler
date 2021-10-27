import { ClientOptions } from 'discord.js';
import { HandlerClient } from '../../handler/client';

class Client extends HandlerClient {
    constructor(options: ClientOptions) {
        super(options);
    }
}

export { Client };