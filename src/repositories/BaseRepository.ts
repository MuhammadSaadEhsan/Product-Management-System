import { Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import connectDB from '@/lib/db';

export interface IPaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Generic base repository implementing the Repository Pattern.
 * Provides CRUD operations for any Mongoose model.
 */
export class BaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  protected async ensureConnection(): Promise<void> {
    await connectDB();
  }

  async findAll(
    filter: FilterQuery<T> = {},
    options: QueryOptions = {}
  ): Promise<T[]> {
    await this.ensureConnection();
    return this.model.find(filter, null, options).lean<T[]>().exec();
  }

  async findPaginated(
    filter: FilterQuery<T> = {},
    options: IPaginationOptions
  ): Promise<IPaginatedResult<T>> {
    await this.ensureConnection();
    const { page, limit, sort, populate } = options;
    const skip = (page - 1) * limit;

    let query = this.model.find(filter).skip(skip).limit(limit).lean<T[]>();

    if (sort) query = query.sort(sort) as typeof query;
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => { query = query.populate(p) as typeof query; });
      } else {
        query = query.populate(populate) as typeof query;
      }
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findById(id: string, populate?: string | string[]): Promise<T | null> {
    await this.ensureConnection();
    let query = this.model.findById(id).lean<T>();
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => { query = query.populate(p) as typeof query; });
      } else {
        query = query.populate(populate) as typeof query;
      }
    }
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, populate?: string | string[]): Promise<T | null> {
    await this.ensureConnection();
    let query = this.model.findOne(filter).lean<T>();
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((p) => { query = query.populate(p) as typeof query; });
      } else {
        query = query.populate(populate) as typeof query;
      }
    }
    return query.exec();
  }

  async create(data: Partial<T>): Promise<T> {
    await this.ensureConnection();
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    await this.ensureConnection();
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean<T>().exec();
  }

  async deleteById(id: string): Promise<T | null> {
    await this.ensureConnection();
    return this.model.findByIdAndDelete(id).lean<T>().exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    await this.ensureConnection();
    return this.model.countDocuments(filter).exec();
  }

  async aggregate(pipeline: Record<string, unknown>[]): Promise<unknown[]> {
    await this.ensureConnection();
    return this.model.aggregate(pipeline).exec();
  }
}
