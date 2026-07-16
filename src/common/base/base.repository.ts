// src/common/base/base.repository.ts
import { Model, UpdateQuery } from 'mongoose';
import * as mongoose from 'mongoose';
import { RepositoryOptions } from './repository.options';

export interface RepoPaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface RepoListResult<T> {
    data: T[];
    warning?: string;
}

export abstract class BaseRepository<T> {
    constructor(protected readonly model: Model<T>) { }

    async findAll(
        options: RepositoryOptions<T> = {},
    ): Promise<RepoPaginatedResult<T> | RepoListResult<T>> {
        const {
            filter = {},
            select = '',
            populate = [],
            sort = { createdAt: -1 },
            page = 1,
            limit = 10,
            pagination = true,
            session,
        } = options;

        const isPaginationEnabled = pagination !== false && pagination !== 'false';
        const query = this.model.find(filter);

        if (select) query.select(select);
        if (populate) query.populate(populate);
        if (sort) query.sort(sort);
        if (session) query.session(session);

        if (isPaginationEnabled) {
            const totalDocs = await this.model.countDocuments(filter).exec();
            const totalPages = Math.ceil(totalDocs / limit);

            query.skip((page - 1) * limit).limit(limit);
            const data = await query.lean<T[]>().exec();

            return {
                data,
                meta: {
                    total: totalDocs,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            };
        } else {
            query.limit(1000);
            const data = await query.lean<T[]>().exec();
            return {
                data,
                warning:
                    data.length === 1000
                        ? 'Result truncated to 1000 items for performance'
                        : undefined,
            };
        }
    }

    async findOne(filter: mongoose.QueryFilter<T>, options: RepositoryOptions<T> = {}) {
        const query = this.model.findOne(filter);
        if (options.select) query.select(options.select);
        if (options.populate) query.populate(options.populate);
        if (options.session) query.session(options.session);
        return query.lean<T>().exec();
    }

    async findById(id: string | mongoose.Types.ObjectId, options: RepositoryOptions<T> = {}) {
        const query = this.model.findById(id);
        if (options.populate) query.populate(options.populate);
        if (options.select) query.select(options.select);
        return query.exec();
    }

    async create(data: Partial<T>, session?: mongoose.ClientSession): Promise<T> {
        const doc = new this.model(data);
        const saved = await doc.save({ session });
        return saved.toObject() as T;
    }

    async update(
        id: string | mongoose.Types.ObjectId,
        updateData: UpdateQuery<T>,
        session?: mongoose.ClientSession,
    ) {
        return this.model
            .findByIdAndUpdate(id, updateData, { returnDocument: 'after', session })
            .lean<T>()
            .exec();
    }

    async updateMany(filter: object, updateData: UpdateQuery<T>, session?: mongoose.ClientSession) {
        return this.model.updateMany(filter, updateData).lean<T>().exec();
    }

    async updateOne(filter: object, updateData: UpdateQuery<T>, session?: mongoose.ClientSession) {
        return this.model
            .findOneAndUpdate(filter, updateData, { returnDocument: 'after', session })
            .lean<T>()
            .exec();
    }

    async delete(id: string | mongoose.Types.ObjectId, softDelete = true, session?: mongoose.ClientSession) {
        if (softDelete) {
            return this.update(id, { isActive: false, deletedAt: new Date() }, session);
        }
        return this.model.findByIdAndDelete(id, { session }).lean<T>().exec();
    }

    async aggregate(pipeline: mongoose.PipelineStage[]): Promise<any[]> {
        return this.model.aggregate(pipeline);
    }
}