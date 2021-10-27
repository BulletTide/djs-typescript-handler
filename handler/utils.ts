/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { CommandInteraction, GuildChannel, GuildMember, Message, PermissionString, TextChannel, User, Guild, ThreadChannel } from 'discord.js';
import { Client } from '@client';

const consoleColors = {
    'SUCCESS': '\u001b[32m',
    'WARNING': '\u001b[33m',
    'ERROR': '\u001b[31m'
};

class HandlerUtils {
    client: Client;

    constructor (client: Client) {
        this.client = client;
    }

    /**
     * Helper function to find a channel the bot can send a message to.
     * @param {import('discord.js').Guild} guild The guild object.
     * @returns {import('discord.js').TextChannel} Returns a TextChannel object.
     */
    getDefaultChannel (guild: Guild): TextChannel | void {
        const channel: GuildChannel | ThreadChannel | undefined = guild.channels?.cache
            .filter((c: any) => !c.isThread() && c.type === 'GUILD_TEXT' && c.permissionsFor(guild.me as GuildMember).has(['SEND_MESSAGES']), true)
            .first();

        return channel as TextChannel;
    }

    /**
     * Function to send a quick error message.
     * @param {import('discord.js').CommandInteraction} interaction The interaction.
     * @param {string} message The error message.
     */
    async quickError (interaction: CommandInteraction, message: string): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.reply({ content: `${this.client.config.EMOTES.FAIL} ${message}`, ephemeral: true });
        else await interaction.followUp({ content: `${this.client.config.EMOTES.FAIL} ${message}`, ephemeral: true }).catch(() => { /* */ });
    }

    /**
     * Function to send a quick error message.
     * @param {import('discord.js').CommandInteraction} interaction The interaction.
     * @param {string} message The error message.
     */
    async quickSuccess (interaction: CommandInteraction, message: string): Promise<void> {
        if (!interaction.deferred && !interaction.replied) await interaction.reply({ content: `${this.client.config.EMOTES.SUCCESS} ${message}` });
        else await interaction.followUp({ content: `${this.client.config.EMOTES.SUCCESS} ${message}` }).catch(() => { /* */ });
    }

    /**
     * Function to await a reply from a specific user.
     * @param {import('discord.js').Message} message The message to listen to
     * @param {object} [options] Optional parameters
     * @param {number} [options.time] The max time for awaitMessages
     * @param {import('discord.js').User} [options.user] The user to listen to messages to
     * @param {string[]} [options.words] Optional accepted words, will aceept any word if not provided
     * @param {RegExp} [options.regexp] Optional RegExp to accept user input that matches the RegExp
     * @returns {Promise<import('discord.js').Message | void>} Returns the `message` sent by the user if there was one, returns `false` otherwise.
     * @example const reply = await getReply(message, { time: 10000, words: ['yes', 'y', 'n', 'no'] })
     */
    async getReply (message: Message, options?: { time?: number, user?: User, words?: string[], regexp?: RegExp }): Promise<Message | void> {
        let time = 30000;
        let user = message.author;
        let words: string[] = [];

        if (options) {
            if (options.time) time = options.time;
            if (options.user) user = options.user;
            if (options.words) words = options.words;
        }

        const filter = (msg: Message): boolean => {
            return msg.author.id === user.id
                && (words.length === 0 || words.includes(msg.content.toLowerCase()))
                && (!options || !options.regexp || options.regexp.test(msg.content));
        };

        const msgs = await message.channel.awaitMessages({ filter, max: 1, time });

        if (msgs.size > 0) return msgs.first();

    }

    /**
     * Return an random integer between `min` and `max` (both inclusive)
     * @param {number} min The lower bound
     * @param {number} max The upper bound
     * @returns {number}
     * @example const rand = randomRange(0, 10)
     */
    randomRange (min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Function to set a timeout
     * @param {number} ms Time to wait in milliseconds
     * @returns {promise}
     * @example await delay(5000)
     */
    delay (ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Function to get all missing permissions of a GuildMember
     * @param {import('discord.js').GuildMember} member The guild member whose missing permissions you want to get
     * @param {import('discord.js').PermissionString[]} perms The permissions you want to check for
     * @returns {string} Readable string containing all missing permissions
     */
    missingPermissions (member: GuildMember, perms: PermissionString[]): string {
        const missingPerms = member.permissions.missing(perms)
            .map(str => `\`${str.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase())}\``);

        return missingPerms.length > 1 ?
            `${missingPerms.slice(0, -1).join( ',  ')} and ${missingPerms.slice(-1)[0]}` :
            missingPerms[0];
    }

    /**
     * Function to shorten down console logs
     * @param {'SUCCESS'|'WARNING'|'ERROR'} type The type of log (SUCCESS, WARNING, ERROR)
     * @param {string} path The path where the console log is coming from
     * @param {string} text The message to be displayed
     */
    log (type: 'SUCCESS'|'WARNING'|'ERROR', path: string, text: string): void {
        console.log(`\u001b[36;1m<${this.client.user?.username || 'Loading...'}>\u001b[0m\u001b[34m [${path}]\u001b[0m - ${consoleColors[type]}${text}\u001b[0m`);
    }

    /**
     * Takes human time input and outputs time in ms (eg: 5m30s -> 330000 | 3d5h2m -> 277320000).
     * @param {string} timeStr Time input (eg: 1m20s, 1s, 3h20m).
     * @returns {number | undefined} Returns the human time input converted to milliseconds.
     * @example let time = timeToMs('10s') -> 10000
     */
    timeToMs (timeStr: string): number | undefined {
        const values = getUnitAndNumber(timeStr);
        if (!values) return;

        let ms = 0;
        try {
            for (let i = 0; i < values.length; ++i) ms += getMs(values[i].numberPart, values[i].unit);
        } catch (e) {
            return;
        }

        return ms;
    }

    /**
     * Takes ms time input and outputs time in human time (eg: 3780000 -> 1h3m | 1hr3mins | 1 hour 3 minutes).
     * @param {number} time Time input as ms (eg: 3780000).
     * @param {object} [options] Optional parameters.
     * @param {('long'|'medium'|'short')} [options.format] Format to use (short -> 1m3s | medium -> 1min3secs | long -> 1minute3seconds).
     * @param {boolean} [options.spaces] Whether to use spaces (true or false).
     * @param {number} [options.unitRounding] Amount of numbers to output (eg: 1 = 3780000 -> 1h).
     * @param {string} [options.joinString] Specified string to join each unit (eg: ' , ').
     * @returns {string | undefined} Returns a beautified converted string from milliseconds.
     * @example let time = timeToMs(3780000, { format: 'medium', spaces: true, unitRounding: 2, joinstring: ', ' }); -> '1 hr, 3 mins'
     */
    msToTime (time: number, options: { format?: 'long'|'medium'|'short', spaces?: boolean, unitRounding?: number, joinString?: string } = {}): string | undefined {
        if (
            !options.format ||
            (options.format !== 'short' && options.format !== 'medium' && options.format !== 'long')
        ) options.format = 'short';

        if (!options.spaces) options.spaces = false;
        if (!options.joinString) options.joinString = ' ';

        let timeStr: string | undefined = '';
        let nr = 0;

        for (let i = Object.keys(timeUnitValues).length; i >= 0; --i) {
            const key = Object.keys(timeUnitValues)[i];
            if (key === 'a') continue;

            let ctime = time / timeUnitValues[key];
            if (ctime >= 1) {
                if ((options.unitRounding ?? 100) < ++nr) break;

                ctime = Math.floor(ctime);
                timeStr += ctime;
                timeStr += options.spaces === true && options.format !== 'short' ? ' ' : '';
                timeStr += fullTimeUnitNames[key][options.format] + (ctime !== 1 && options.format !== 'short' ? 's' : '');
                timeStr += options.spaces === true ? options.joinString : '';
                time -= ctime * timeUnitValues[key];
            }
        }

        while (timeStr.endsWith(options.joinString)) timeStr = timeStr.slice(0, -1 * options.joinString.length);

        if (timeStr === '') return;
        return timeStr;
    }
}

export { HandlerUtils };

const timeUnits: { [x: string]: string[] } = {
    ms: ['ms', 'millisecond(s)'],
    s: ['sec(s)', 'second(s)'],
    min: ['minute(s)', 'm', 'min(s)'],
    h: ['hr(s)', 'hour(s)'],
    d: ['day(s)'],
    w: ['wk(s)', 'week(s)'],
    mth: ['mth(s)', 'month(s)'],
    y: ['year(s)'],
    a: ['julianyear(s)'],
    dec: ['decade(s)'],
    cen: ['cent(s)', 'century', 'centuries']
};

const timeUnitValues: { [x: string]: number } = {
    ms: 1,
    s: 1000,
    min: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    mth: 1000 * 60 * 60 * 24 * 30,
    y: 1000 * 60 * 60 * 24 * 365,
    a: 1000 * 60 * 60 * 24 * 365.25,
    dec: 1000 * 60 * 60 * 24 * 365 * 10,
    cen: 1000 * 60 * 60 * 24 * 365 * 100
};

const fullTimeUnitNames: { [x: string]: { [y: string]: string } } = {
    ms: { short: 'ms', medium: 'msec', long: 'millisecond' },
    s: { short: 's', medium: 'sec', long: 'second' },
    min: { short: 'm', medium: 'min', long: 'minute' },
    h: { short: 'h', medium: 'hr', long: 'hour' },
    d: { short: 'd', medium: 'day', long: 'day' },
    w: { short: 'wk', medium: 'wk', long: 'week' },
    mth: { short: 'mth', medium: 'mo', long: 'month' },
    y: { short: 'y', medium: 'yr', long: 'year' },
    dec: { short: 'dec', medium: 'dec', long: 'decade' },
    cen: { short: 'cen', medium: 'cent', long: 'century' }
};

function getUnitAndNumber (timeString: string) {
    timeString = timeString.toLowerCase().replace(/ /g, '');

    const unit = timeString.replace(/[0-9.,:]/g, ' ');
    const numberPart = timeString
        .replace(/[^0-9.,:]/g, ' ')
        .replace(',', '.');

    let units = unit.split(' ').filter((str) => str !== '');
    const numberParts = numberPart
        .split(' ')
        .filter((str) => str !== '');

    units = getExactUnits (units)!;

    if (
        unit === '' ||
        !unit ||
        numberPart === '' ||
        !numberPart ||
        !units ||
        units.length === 0 ||
        numberParts.length === 0 ||
        units.length !== numberParts.length
    ) return;

    const ans = [];
    for (let i = 0; i < units.length; ++i)
        ans.push({
            numberPart: numberParts[i],
            unit: units[i]
        });
    return ans;
}

function getExactUnits (thisUnits: string[]) {
    const exactUnits = [];

    for (const newUnit of thisUnits) {
        if (timeUnits[newUnit]) {
            exactUnits.push(newUnit);
            continue;
        } else {
            for (const timeUnit in timeUnits) {
                for (const timeUnitAllias of timeUnits[timeUnit]) {
                    if (timeUnitAllias.replace('(s)', '') === newUnit
                     || timeUnitAllias.replace('(s)', 's') === newUnit) {
                        exactUnits.push(timeUnit);
                        continue;
                    }
                }
            }
        }
    }

    if (exactUnits.length !== thisUnits.length) return;

    return exactUnits;
}

function getMs (number: string, unit: string) {
    if (number.includes(':')) {
        switch (unit) {
        case 'min':
            return (
                Number(number.split(':')[0]) * timeUnitValues.min +
                    Number(number.split(':')[1]) * timeUnitValues.s
            );
        case 'h':
            return (
                Number(number.split(':')[0]) * timeUnitValues.h +
                    Number(number.split(':')[1]) * timeUnitValues.min
            );
        default:
            throw new Error('Used \':\' with a unit which doesn\'t support it');
        }
    }

    return Number(number) * timeUnitValues[unit];
}