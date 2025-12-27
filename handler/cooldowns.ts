/*
    Author: Bullet_Tide.
*/

import { Command } from '../src/utils/command';

type Scope = 'USER' | 'GUILD' | 'GLOBAL';

interface CooldownEntry {
    expiresAt: number;
}

export class CooldownManager {
    private readonly store = new Map<string, CooldownEntry>();

    isOnCooldown(
        command: Command,
        userId: string,
        guildId: string | null
    ): number | null {
        if (!command.cooldown) return null;

        const scope: Scope = command.cooldown.scope ?? 'USER';
        const key = this.buildKey(command.name, scope, userId, guildId);
        const entry = this.store.get(key);

        if (!entry) return null;

        const now = Date.now();
        if (now >= entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return Math.ceil((entry.expiresAt - now) / 1000);
    }

    setCooldown(
        command: Command,
        userId: string,
        guildId: string | null
    ): void {
        if (!command.cooldown) return;

        const scope: Scope = command.cooldown.scope ?? 'USER';
        const key = this.buildKey(command.name, scope, userId, guildId);

        this.store.set(key, { expiresAt: Date.now() + command.cooldown.duration * 1000 });
    }

    private buildKey(
        commandName: string,
        scope: Scope,
        userId: string,
        guildId: string | null
    ): string {
        switch (scope) {
        case 'GLOBAL':
            return `${commandName}:global`;
        case 'GUILD':
            return `${commandName}:guild:${guildId ?? 'dm'}`;
        case 'USER':
        default:
            return `${commandName}:user:${userId}`;
        }
    }
}