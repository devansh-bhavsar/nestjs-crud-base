"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    async findAll(options = {}) {
        const { filter = {}, select = '', populate = [], sort = { createdAt: -1 }, page = 1, limit = 10, pagination = true, session, } = options;
        const isPaginationEnabled = pagination !== false && pagination !== 'false';
        const query = this.model.find(filter);
        if (select)
            query.select(select);
        if (populate)
            query.populate(populate);
        if (sort)
            query.sort(sort);
        if (session)
            query.session(session);
        if (isPaginationEnabled) {
            const totalDocs = await this.model.countDocuments(filter).exec();
            const totalPages = Math.ceil(totalDocs / limit);
            query.skip((page - 1) * limit).limit(limit);
            const data = await query.lean().exec();
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
        }
        else {
            query.limit(1000);
            const data = await query.lean().exec();
            return {
                data,
                warning: data.length === 1000
                    ? 'Result truncated to 1000 items for performance'
                    : undefined,
            };
        }
    }
    async findOne(filter, options = {}) {
        const query = this.model.findOne(filter);
        if (options.select)
            query.select(options.select);
        if (options.populate)
            query.populate(options.populate);
        if (options.session)
            query.session(options.session);
        return query.lean().exec();
    }
    async findById(id, options = {}) {
        const query = this.model.findById(id);
        if (options.populate)
            query.populate(options.populate);
        if (options.select)
            query.select(options.select);
        return query.exec();
    }
    async create(data, session) {
        const doc = new this.model(data);
        const saved = await doc.save({ session });
        return saved.toObject();
    }
    async update(id, updateData, session) {
        return this.model
            .findByIdAndUpdate(id, updateData, { returnDocument: 'after', session })
            .lean()
            .exec();
    }
    async updateMany(filter, updateData, session) {
        return this.model.updateMany(filter, updateData).lean().exec();
    }
    async updateOne(filter, updateData, session) {
        return this.model
            .findOneAndUpdate(filter, updateData, { returnDocument: 'after', session })
            .lean()
            .exec();
    }
    async delete(id, softDelete = true, session) {
        if (softDelete) {
            return this.update(id, { isActive: false, deletedAt: new Date() }, session);
        }
        return this.model.findByIdAndDelete(id, { session }).lean().exec();
    }
    async aggregate(pipeline) {
        return this.model.aggregate(pipeline);
    }
}
exports.BaseRepository = BaseRepository;
