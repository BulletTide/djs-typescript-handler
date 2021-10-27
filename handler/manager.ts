/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

import { Collection } from 'discord.js';
import { EnforceDocument, FilterQuery, Model, QueryOptions, QueryWithHelpers, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { Client } from '@client';

class Manager <K, V> {
    _client: Client;
    _model: Model<V>
    _cache: Collection<K, V>;

    constructor (client: Client, model: Model<V>) {
        this._client = client;
        this._model = model;
        this._cache = new Collection();
    }

    async get (key: K, force?: boolean): Promise<V> {
        let item = this._cache.get(key);

        if (!item || force) {
            item = await this._model.findOneAndUpdate({ _id: key }, { }, { new: true, upsert: true, setDefaultsOnInsert: true });
            this._cache.set(key, item);
        }

        return item;
    }

    getCache (key: K): V | undefined {
        return this._cache.get(key);
    }

    async findById (key: K): Promise<EnforceDocument<V, {}> | null | undefined> {
        return await this.findOne({ _id: key });
    }

    async findOne (filter: FilterQuery<V>): Promise<QueryWithHelpers<EnforceDocument<V, {}> | null, EnforceDocument<V, {}>, {}, V> | null | undefined> {
        const item = await this._model.findOne(filter);

        if (!item) return;

        this._cache.set(item._id, item);

        return item;
    }

    async findMany (filter: FilterQuery<V>): Promise<EnforceDocument<V, {}>[]> {
        const items = await this._model.find(filter);

        for (const item of items) this._cache.set(item._id, item);

        return items;
    }

    async findByIdAndUpdate (key: K, update: UpdateQuery<V>, options?: QueryOptions): Promise<EnforceDocument<V, {}> | null | undefined> {
        return await this.findOneAndUpdate({ _id: key }, update, options);
    }

    async findOneAndUpdate (filter: FilterQuery<V>, update: UpdateQuery<V>, options?: QueryOptions): Promise<EnforceDocument<V, {}> | null | undefined> {
        const item = await this._model.findOneAndUpdate(filter, update, options);

        if (!item) return;

        this._cache.set(item._id, item);

        return item;
    }

    async updateMany (filter: FilterQuery<V>, update: UpdateQuery<V>, options?: QueryOptions): Promise<UpdateWriteOpResult> {
        const query = await this._model.updateMany(filter, update, options);

        return query;
    }

    async findByIdAndDelete (key: K, options?: QueryOptions): Promise<EnforceDocument<V, {}> | null | undefined> {
        return await this.findOneAndDelete({ _id: key }, options);
    }

    async findOneAndDelete (filter: FilterQuery<V>, options?: QueryOptions): Promise<EnforceDocument<V, {}> | null | undefined> {
        const item = await this._model.findOneAndDelete(filter, options);

        if (!item) return;

        this._cache.delete(item._id);

        return item;
    }

    async deleteMany (filter: FilterQuery<V>, options?: QueryOptions): Promise<void> {
        await this._model.deleteMany(filter, options);
    }

    async insertOne (item: V): Promise<EnforceDocument<V, {}> | null | undefined> {
        if (!item) return;

        return (await this.insertMany([item]))![0];
    }

    async insertMany (items: V[]): Promise<EnforceDocument<V, {}>[] | null | undefined> {
        if (!items || !items.length) return;

        const query = await this._model.insertMany(items);

        for (const item of query) this._cache.set(item._id, item);

        return query;
    }

    async exists (key: K): Promise<boolean> {
        if (!key) return false;

        let item: any = this._cache.get(key);

        if (!item) item = await this.findOne({ _id: key }).catch(() => { /* */ });

        return Boolean(item);
    }

    async countItems (filter: FilterQuery<V>): Promise<number> {
        return await this._model.countDocuments(filter);
    }

    get cache (): Collection<K, V> {
        return this._cache;
    }

    get model (): Model<V, {}, {}> {
        return this._model;
    }
}

export { Manager };