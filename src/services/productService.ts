import { getProductRepo, getCategoryRepo, getInventoryLogRepo } from '@/repositories';
import { ProductInput } from '@/validators/schemas';
import { slugify, generateSKU } from '@/lib/utils';
import { IProduct } from '@/models/Product';
import { IPaginationOptions, IPaginatedResult } from '@/repositories/BaseRepository';
import { FilterQuery } from 'mongoose';

export class ProductService {
  private productRepo = getProductRepo();
  private categoryRepo = getCategoryRepo();
  private inventoryLogRepo = getInventoryLogRepo();

  async getProducts(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<IPaginatedResult<IProduct>> {
    const { page = 1, limit = 10, search, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    
    const filter: FilterQuery<IProduct> = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;

    if (status === 'low_stock') {
      filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
      filter.quantity = { $gt: 0 };
    } else if (status === 'out_of_stock') {
      filter.quantity = { $lte: 0 };
    }

    const options: IPaginationOptions = {
      page,
      limit,
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      populate: 'category',
    };

    return this.productRepo.findPaginated(filter, options);
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return this.productRepo.findById(id, 'category');
  }

  async createProduct(data: ProductInput, userId: string): Promise<IProduct> {
    const slug = slugify(data.name);
    const category = await this.categoryRepo.findById(data.category);
    if (!category) throw new Error('Category not found');

    const existingSlug = await this.productRepo.findOne({ slug });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const productCount = await this.productRepo.count();
    const sku = data.barcode || generateSKU(category.code, String(productCount + 1).padStart(6, '0'));

    const product = await this.productRepo.create({
      ...data,
      slug: finalSlug,
      sku,
    });

    if (data.quantity > 0) {
      await this.inventoryLogRepo.create({
        product: product._id,
        action: 'adjustment',
        quantityChange: data.quantity,
        previousQuantity: 0,
        newQuantity: data.quantity,
        reference: 'Initial stock',
        referenceType: 'manual',
        createdBy: userId,
      });
    }

    return product;
  }

  async updateProduct(id: string, data: Partial<ProductInput>): Promise<IProduct | null> {
    const updateData: Record<string, unknown> = { ...data };
    if (data.name) updateData.slug = slugify(data.name);
    return this.productRepo.updateById(id, updateData);
  }

  async deleteProduct(id: string): Promise<IProduct | null> {
    return this.productRepo.updateById(id, { isActive: false });
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    return this.productRepo.searchProducts(query);
  }

  async getLowStockProducts(): Promise<IProduct[]> {
    return this.productRepo.findLowStock();
  }

  async getOutOfStockProducts(): Promise<IProduct[]> {
    return this.productRepo.findOutOfStock();
  }
}

export const productService = new ProductService();
