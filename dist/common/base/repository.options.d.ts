import * as mongoose from 'mongoose';
export interface RepositoryOptions<T> {
    filter?: mongoose.QueryFilter<T>;
    select?: mongoose.ProjectionType<T>;
    populate?: mongoose.PopulateOptions | (string | mongoose.PopulateOptions)[];
    sort?: string | {
        [key: string]: mongoose.SortOrder | {
            $meta: 'textScore';
        };
    };
    page?: number;
    limit?: number;
    pagination?: boolean | string;
    session?: mongoose.ClientSession;
}
