import { HandlerCommand, CommandOptions } from '../../handler/command';
import { Client } from '../../src/utils/client';

class Command extends HandlerCommand {
    constructor(client: Client, options: CommandOptions) {
        super(client, options);
    }
}

export { Command };