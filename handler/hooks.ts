import { CommandExecutionContext } from './typings';
import { Command } from '../src/utils/command';

export interface CommandHookContext extends CommandExecutionContext {
    command: Command;
}

export type CommandHook = (_ctx: CommandHookContext) => Promise<void> | void;

export interface CommandHooks {
    beforeExecute?: CommandHook[];
    afterExecute?: CommandHook[];
    onError?: CommandHook[];
}