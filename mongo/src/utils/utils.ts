import { HandlerUtils } from '../../handler/utils';
import { Client } from './client';

class Utils extends HandlerUtils {
    constructor(client: Client) {
        super(client);
    }
}

export { Utils };