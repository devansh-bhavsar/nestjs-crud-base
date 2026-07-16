# nestjs-crud-base

Reusable base repository, service, and controller classes for NestJS + Mongoose projects. Handles common CRUD plumbing — pagination, soft delete, populate, sorting, and aggregation — so you don't rewrite it in every project.

## Features

- 📄 Built-in pagination with metadata (`total`, `totalPages`, `hasNextPage`, `hasPrevPage`)
- 🗑️ Soft delete support (`isActive`/`deletedAt`) with hard-delete fallback
- 🔗 Populate support on `findAll`, `findOne`, `findById`
- 🔄 MongoDB transaction/session support across all methods
- 📊 Raw aggregation pipeline passthrough
- 🧩 Extend per-entity with your own overrides — no repeated CRUD boilerplate
- 🪶 Zero NestJS dependency in the repository layer — pure Mongoose, works in any Node project

## Install

```bash
npm install nestjs-crud-base mongoose
```

Requires Mongoose `^9.0.0` (peer dependency).

## Quick start

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'nestjs-crud-base';
import { Job } from './job.schema';

@Injectable()
export class JobRepository extends BaseRepository<Job> {
  constructor(@InjectModel(Job.name) jobModel: Model<Job>) {
    super(jobModel);
  }
}
```

```typescript
@Injectable()
export class JobService {
  constructor(private readonly jobRepo: JobRepository) {}

  findAll(page = 1, limit = 10) {
    return this.jobRepo.findAll({ page, limit, populate: [{ path: 'customer' }] });
  }

  softDelete(id: string) {
    return this.jobRepo.delete(id); // soft delete by default
  }
}
```

## API reference

### `findAll(options?: RepositoryOptions<T>)`

Returns paginated results by default.

```typescript
const result = await jobRepo.findAll({
  filter: { status: 'active' },
  populate: [{ path: 'customer' }],
  sort: { createdAt: -1 },
  page: 1,
  limit: 20,
});
// { data: Job[], meta: { total, page, limit, totalPages, hasNextPage, hasPrevPage } }
```

Disable pagination for a raw list (capped at 1000 items):
```typescript
const result = await jobRepo.findAll({ pagination: false });
// { data: Job[], warning?: string }
```

### `findOne(filter, options?)`

```typescript
const job = await jobRepo.findOne({ status: 'active' }, { populate: [{ path: 'customer' }] });
```

### `findById(id, options?)`

```typescript
const job = await jobRepo.findById(jobId, { populate: [{ path: 'customer' }] });
```

### `create(data, session?)`

```typescript
const job = await jobRepo.create({ title: 'Fix leaky faucet', customer: customerId });
```

### `update(id, updateData, session?)`

```typescript
const job = await jobRepo.update(jobId, { status: 'completed' });
```

### `updateOne(filter, updateData, session?)` / `updateMany(filter, updateData, session?)`

```typescript
await jobRepo.updateOne({ _id: jobId }, { status: 'completed' });
await jobRepo.updateMany({ status: 'pending' }, { status: 'cancelled' });
```

### `delete(id, softDelete = true, session?)`

Soft-deletes by default (`isActive: false`, `deletedAt: new Date()`). Pass `false` for a hard delete.

```typescript
await jobRepo.delete(jobId);          // soft delete
await jobRepo.delete(jobId, false);   // hard delete
```

> ⚠️ Soft delete assumes your schema has `isActive` and `deletedAt` fields. If it doesn't, `delete(id)` with the default `softDelete: true` won't throw, but those fields simply won't apply as expected.

### `aggregate(pipeline)`

```typescript
const stats = await jobRepo.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$technician', count: { $sum: 1 } } },
]);
```

## `RepositoryOptions<T>`

| Option | Type | Description |
|---|---|---|
| `filter` | `QueryFilter<T>` | Mongoose filter query |
| `select` | `ProjectionType<T>` | Field projection |
| `populate` | `PopulateOptions \| (string \| PopulateOptions)[]` | Populate config |
| `sort` | `string \| Record<string, SortOrder>` | Sort order (default: `{ createdAt: -1 }`) |
| `page` | `number` | Page number (default: `1`) |
| `limit` | `number` | Items per page (default: `10`) |
| `pagination` | `boolean \| string` | Set `false` to return a flat list instead of paginated result |
| `session` | `ClientSession` | Mongo transaction session |

## Extending per entity

Override defaults by wrapping calls in your own repository methods:

```typescript
@Injectable()
export class JobRepository extends BaseRepository<Job> {
  constructor(@InjectModel(Job.name) jobModel: Model<Job>) {
    super(jobModel);
  }

  findAllForTechnician(technicianId: string, options: RepositoryOptions<Job> = {}) {
    return this.findAll({
      filter: { assignedTechnician: technicianId, ...options.filter },
      populate: options.populate ?? [{ path: 'customer' }],
      ...options,
    });
  }
}
```

## Requirements

- Node.js ≥ 18
- Mongoose ^9.0.0
- NestJS (for `@Injectable()` usage — not required by the repository layer itself)

## Roadmap

- [ ] `BaseService` — service layer wrapping `BaseRepository` with common business-logic hooks
- [ ] `BaseController` — CRUD controller with standard REST endpoints wired to `BaseService`

## License

MIT
