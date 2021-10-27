import { HandlerUtils } from '../../handler/utils';
import { Client } from '../../src/utils/client';

class Utils extends HandlerUtils {
    constructor(client: Client) {
        super(client);
    }
}

export { Utils };