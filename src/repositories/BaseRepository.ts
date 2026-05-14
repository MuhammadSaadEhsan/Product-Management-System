import { Model, QueryOptions } from 'mongoose';

type FilterQuery<T> = any;
type UpdateQuery<T> = any;
import connectDB from '@/lib/db';

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: any;
  populate?: string | string[];
}

export abstract class BaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    await connectDB();
    return await this.model.create(data);
  }

  async find(filter: any = {}, options: QueryOptions = {}): Promise<T[]> {
    await connectDB();
    return await this.model.find(filter, null, options).lean();
  }

  async findOne(filter: any = {}): Promise<T | null> {
    await connectDB();
    return await this.model.findOne(filter).lean();
  }

  async findById(id: string): Promise<T | null> {
    await connectDB();
    return await this.model.findById(id).lean();
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    await connectDB();
    return await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<T | null> {
    await connectDB();
    return await this.model.findByIdAndDelete(id).lean();
  }

    async paginate(filter: any = {}, options: IPaginationOptions = {}): Promise<{ data: T[], total: number, page: number, limit: number, totalPages: number, hasNext: boolean, hasPrev: boolean }> {
    await connectDB();
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      (populate ? this.model.find(filter).populate(populate) : this.model.find(filter)).sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return { 
      data: data as T[], 
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  // Backwards-compatible alias used across the codebase
  async findPaginated(filter: any = {}, options: IPaginationOptions = {}) {
    return this.paginate(filter, options);
  }
}
