/*
    Author: Bullet_Tide.
*/

import { HandlerCommand } from '../../handler/command';
import { CommandExecutionContext } from '../../handler/typings';

export abstract class Command extends HandlerCommand {
    abstract execute(_ctx: CommandExecutionContext): Promise<void> | void;
}