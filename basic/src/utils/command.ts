import { HandlerCommand, CommandOptions } from '../../handler/command';
import { Client } from './client';

class Command extends HandlerCommand {
    constructor(client: Client, options: CommandOptions) {
        super(client, options);
    }
}

export { Command };