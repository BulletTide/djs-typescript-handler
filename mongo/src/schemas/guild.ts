import { Schema, model } from 'mongoose';
import { handlerGuild } from '../../handler/schemas';

const guild = new Schema({
    _id: String,
    handler: handlerGuild,

    /* You can add your own things after this */
});

export = model('guilds', guild);