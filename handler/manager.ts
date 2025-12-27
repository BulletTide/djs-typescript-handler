/*
    Author: Bullet_Tide.
    Note: Please refrain from editing in this file.
          Any changes made in this file could be
          overwritten upon pulling any commits from
          the main repo.
*/

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
            item = await this._model
                .findOneAndUpdate(
                    { _id: key } as FilterQuery<V>,
                    {},
                    { new: true, upsert: true, setDefaultsOnInsert: true }
                )
                .exec();

            this._cache.set(key, item!);
        }

        return item!;
    }

    getCache(key: K): V | null {
        return this._cache.get(key) ?? null;
    }


    async findById(key: K): Promise<V | null> {
        return await this.findOne({ _id: key } as FilterQuery<V>);
    }

    async findOne(filter: FilterQuery<V>): Promise<V | null> {
        const item = await this._model.findOne(filter).exec();
        if (!item) return null;

        this._cache.set(item._id as K, item);
        return item;
    }

    async findMany(filter: FilterQuery<V>): Promise<V[]> {
        const items = await this._model.find(filter).exec();

        for (const item of items) {
            this._cache.set(item._id as K, item);
        }

        return items;
    }

    async findByIdAndUpdate(
        key: K,
        update: UpdateQuery<V>,
        options?: QueryOptions
    ): Promise<V | null> {
        return await this.findOneAndUpdate(
            { _id: key } as FilterQuery<V>,
            update,
            options
        );
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

    async updateMany(
        filter: FilterQuery<V>,
        update: UpdateQuery<V>,
        options?: QueryOptions
    ): Promise<void> {
        await this._model.updateMany(filter, update, options).exec();
    }

    async findByIdAndDelete(
        key: K,
        options?: QueryOptions
    ): Promise<V | null> {
        return await this.findOneAndDelete(
            { _id: key } as FilterQuery<V>,
            options
        );
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

    async deleteMany(
        filter: FilterQuery<V>,
        options?: QueryOptions
    ): Promise<void> {
        await this._model.deleteMany(filter, options).exec();
    }

    async insertOne(item: V): Promise<V | null> {
        if (!item) return null;
        return (await this.insertMany([item]))?.[0] ?? null;
    }

    async insertMany(items: V[]): Promise<V[] | null> {
        if (!items.length) return null;

        const docs = await this._model.insertMany(items);

        for (const item of docs) {
            this._cache.set(item._id as K, item);
        }

        return docs;
    }

    async exists(key: K): Promise<boolean> {
        if (!key) return false;

        let item: V | null | undefined = this._cache.get(key);
        if (!item) {
            item = await this.findOne({ _id: key } as FilterQuery<V>);
        }

        return Boolean(item);
    }

    async countItems(filter: FilterQuery<V>): Promise<number> {
        return await this._model.countDocuments(filter).exec();
    }

    get cache(): Collection<K, V> {
        return this._cache;
    }

    get model(): Model<V> {
        return this._model;
    }
}

export { Manager };