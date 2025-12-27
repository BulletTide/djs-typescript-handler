/*
    Author: Bullet_Tide.
*/

function required(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optional(key: string, fallback = ''): string {
    return process.env[key] ?? fallback;
}

function list(key: string): string[] {
    return optional(key)
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
}

export const env = {
    TOKEN: required('TOKEN'),
    MONGODB_URI: optional('MONGODB_URI'),
    DEVS: list('DEVS'),
    DEV_SERVERS: list('DEV_SERVERS'),
    NODE_ENV: optional('NODE_ENV', 'production')
} as const;

export type EnvConfig = typeof env;