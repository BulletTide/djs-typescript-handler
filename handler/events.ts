/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { Guild, Interaction, GuildMember } from 'discord.js';
import { Client } from '../src/utils/client';

async function guildCreate (client: Client, guild: Guild): Promise<void> {
    try {
        if (guild.available) {
            await client.guildInfo.get(guild.id);

            const channel = client.utils.getDefaultChannel(guild);
            if (!channel) return;

            await channel.send('Thanks for adding me! For a list of commands, use `/help`!');
        }
    } catch (e) {
        client.utils.log('ERROR', 'src/events/guild/guildCreate.js', `${e}`);
    }
}

async function interactionCreate (client: Client, interaction: Interaction): Promise<void> {
    try {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            const developers: string[] = client.config.DEVS;

            if (!developers.includes(interaction.user.id)) {
                if (command.guildOnly) {
                    const channel = await interaction.guild!.channels.fetch(interaction.channel!.id);
                    const member = await interaction.guild!.members.fetch(interaction.user.id);

                    if (!interaction.inGuild()) return await client.utils.quickError(interaction, 'This command can only be run in a server.');

                    if (channel) {
                        if (command.ownerOnly && interaction.guild!.ownerId !== interaction.user.id) return await client.utils.quickError(interaction, 'This command can only be run by the server owner.');

                        if (command.clientPerms && !channel.permissionsFor(interaction.guild!.me as GuildMember).has(command.clientPerms, true)) return await client.utils.quickError(interaction, `I am missing the following permissions: ${client.utils.missingPermissions(interaction.guild!.me as GuildMember, command.clientPerms)}.`);

                        if (command.perms && !member.permissions.has(command.perms, true)) return await client.utils.quickError(interaction, `You are missing the following permissions: ${client.utils.missingPermissions(member, command.perms)}.`);

                        if (command.nsfw && channel.isText() && !channel.nsfw) return await client.utils.quickError(interaction, 'This command can only be run in a NSFW channel.');
                    }
                }
            }

            const group = interaction.options.getSubcommandGroup(false)!;
            const subcommand = interaction.options.getSubcommand(false)!;

            try {
                let sub;
                if (command.groups) sub = command.groups[group].subcommands[subcommand];
                else if (command.subcommands) sub = command.subcommands[subcommand];

                if (sub && sub.execute) return await sub.execute({ client, interaction, group, subcommand });

                // @ts-ignore
                await command.execute({ client, interaction, group, subcommand });
            } catch (e) {
                client.utils.log('ERROR', 'src/events/interaction/interactionCreate.js', `Error running command '${command.name}'`);
            }
        }
    } catch (e) {
        client.utils.log('ERROR', 'src/events/interaction/interactionCreate.js', `${e}`);
    }
}

export {
    guildCreate,
    interactionCreate
};