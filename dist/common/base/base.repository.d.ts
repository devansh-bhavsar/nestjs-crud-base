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
export declare abstract class BaseRepository<T> {
    protected readonly model: Model<T>;
    constructor(model: Model<T>);
    findAll(options?: RepositoryOptions<T>): Promise<RepoPaginatedResult<T> | RepoListResult<T>>;
    findOne(filter: mongoose.QueryFilter<T>, options?: RepositoryOptions<T>): Promise<T | (mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> extends infer T_1 ? T_1 extends mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> ? T_1 extends null ? T | null : T : never : never) | null>;
    findById(id: string | mongoose.Types.ObjectId, options?: RepositoryOptions<T>): Promise<mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> | null>;
    create(data: Partial<T>, session?: mongoose.ClientSession): Promise<T>;
    update(id: string | mongoose.Types.ObjectId, updateData: UpdateQuery<T>, session?: mongoose.ClientSession): Promise<T | (mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> extends infer T_1 ? T_1 extends mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> ? T_1 extends null ? T | null : T : never : never) | null>;
    updateMany(filter: object, updateData: UpdateQuery<T>, session?: mongoose.ClientSession): Promise<T>;
    updateOne(filter: object, updateData: UpdateQuery<T>, session?: mongoose.ClientSession): Promise<T | (mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> extends infer T_1 ? T_1 extends mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> ? T_1 extends null ? T | null : T : never : never) | null>;
    delete(id: string | mongoose.Types.ObjectId, softDelete?: boolean, session?: mongoose.ClientSession): Promise<T | (mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> extends infer T_1 ? T_1 extends mongoose.IfAny<T, any, mongoose.Document<unknown, {}, T, {}, mongoose.DefaultSchemaOptions> & mongoose.Require_id<T> & {
        __v: number;
    } & mongoose.AddDefaultId<T, {}, mongoose.DefaultSchemaOptions>> ? T_1 extends null ? T | null : T : never : never) | null>;
    aggregate(pipeline: mongoose.PipelineStage[]): Promise<any[]>;
}
