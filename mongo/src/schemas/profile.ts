import { Schema, model } from 'mongoose';
import { handlerProfile } from '../../handler/schemas';

const user = new Schema({
    _id: String,
    handler: handlerProfile

    /* You can add your own things after this */
});

export = model('users', user);