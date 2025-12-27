import { Collection } from 'discord.js';
import {
    FilterQuery,
    Model,
    QueryOptions,
    UpdateQuery,
    Document
} from 'mongoose';
import { Client } from '../src/utils/client';

class Manager<K, V extends Document> {
    private _client: Client;
    private _model: Model<V>;
    private _cache: Collection<K, V>;

    constructor(client: Client, model: Model<V>) {
        this._client = client;
        this._model = model;
        this._cache = new Collection();
    }

    async get(key: K, force = false): Promise<V> {
        let item = this._cache.get(key);

        if (!item || force) {
            const found = await this._model.findById(key).exec();

            if (found) {
                item = found;
            } else {
                item = await this._model.create({ _id: key });
            }

            this._cache.set(key, item);
        }

        return item;
    }


    getCache(key: K): V | null {
        return this._cache.get(key) ?? null;
    }

    async findOne(filter: FilterQuery<V>): Promise<V | null> {
        const item = await this._model.findOne(filter).exec();
        if (!item) return null;

        this._cache.set(item._id as K, item);
        return item;
    }

    async findOneAndUpdate(
        filter: FilterQuery<V>,
        update: UpdateQuery<V>,
        options?: QueryOptions
    ): Promise<V | null> {
        const item = await this._model
            .findOneAndUpdate(filter, update, options)
            .exec();

        if (!item) return null;

        this._cache.set(item._id as K, item);
        return item;
    }

    async findOneAndDelete(
        filter: FilterQuery<V>,
        options?: QueryOptions
    ): Promise<V | null> {
        const item = await this._model
            .findOneAndDelete(filter, options)
            .exec();

        if (!item) return null;

        this._cache.delete(item._id as K);
        return item;
    }
}

export { Manager };