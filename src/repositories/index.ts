import { BaseRepository } from './BaseRepository';
import Product, { IProduct } from '@/models/Product';
import Category, { ICategory } from '@/models/Category';
import Customer, { ICustomer } from '@/models/Customer';
import Supplier, { ISupplier } from '@/models/Supplier';
import Sale, { ISale } from '@/models/Sale';
import Purchase, { IPurchase } from '@/models/Purchase';
import InventoryLog, { IInventoryLog } from '@/models/InventoryLog';
import User, { IUser } from '@/models/User';

// ============================================
// Concrete Repository Implementations
// ============================================

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await this.ensureConnection();
    return this.model.findOne({ email }).select('+password').lean<IUser>().exec();
  }
}

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return this.findOne({ slug });
  }
}

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async findLowStock(threshold?: number): Promise<IProduct[]> {
    await this.ensureConnection();
    const filter = threshold
      ? { quantity: { $lte: threshold }, isActive: true }
      : { $expr: { $lte: ['$quantity', '$lowStockThreshold'] }, isActive: true };
    return this.model.find(filter).populate('category').lean<IProduct[]>().exec();
  }

  async findOutOfStock(): Promise<IProduct[]> {
    return this.findAll({ quantity: { $lte: 0 }, isActive: true });
  }

  async updateStock(productId: string, quantityChange: number): Promise<IProduct | null> {
    await this.ensureConnection();
    return this.model
      .findByIdAndUpdate(
        productId,
        { $inc: { quantity: quantityChange } },
        { new: true, runValidators: true }
      )
      .lean<IProduct>()
      .exec();
  }

  async searchProducts(query: string): Promise<IProduct[]> {
    await this.ensureConnection();
    return this.model
      .find({
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { barcode: { $regex: query, $options: 'i' } },
        ],
      })
      .populate('category')
      .limit(20)
      .lean<IProduct[]>()
      .exec();
  }
}

export class CustomerRepository extends BaseRepository<ICustomer> {
  constructor() {
    super(Customer);
  }
}

export class SupplierRepository extends BaseRepository<ISupplier> {
  constructor() {
    super(Supplier);
  }
}

export class SaleRepository extends BaseRepository<ISale> {
  constructor() {
    super(Sale);
  }

  async getLastInvoiceNumber(): Promise<string | null> {
    await this.ensureConnection();
    const last = await this.model.findOne().sort({ createdAt: -1 }).select('invoiceNumber').lean<ISale>().exec();
    return last?.invoiceNumber || null;
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<ISale[]> {
    return this.findAll({
      createdAt: { $gte: startDate, $lte: endDate },
    });
  }
}

export class PurchaseRepository extends BaseRepository<IPurchase> {
  constructor() {
    super(Purchase);
  }

  async getLastInvoiceNumber(): Promise<string | null> {
    await this.ensureConnection();
    const last = await this.model.findOne().sort({ createdAt: -1 }).select('invoiceNumber').lean<IPurchase>().exec();
    return last?.invoiceNumber || null;
  }
}

export class InventoryLogRepository extends BaseRepository<IInventoryLog> {
  constructor() {
    super(InventoryLog);
  }

  async getLogsByProduct(productId: string, limit = 50): Promise<IInventoryLog[]> {
    await this.ensureConnection();
    return this.model
      .find({ product: productId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'name')
      .lean<IInventoryLog[]>()
      .exec();
  }
}

// ============================================
// Singleton Factory for Repositories
// ============================================
class RepositoryFactory {
  private static instances: Map<string, BaseRepository<unknown>> = new Map();

  static getRepository<T>(
    key: string,
    RepositoryClass: new () => BaseRepository<T>
  ): BaseRepository<T> {
    if (!this.instances.has(key)) {
      this.instances.set(key, new RepositoryClass() as BaseRepository<unknown>);
    }
    return this.instances.get(key) as BaseRepository<T>;
  }
}

export const getUserRepo = () =>
  RepositoryFactory.getRepository<IUser>('user', UserRepository) as UserRepository;
export const getCategoryRepo = () =>
  RepositoryFactory.getRepository<ICategory>('category', CategoryRepository) as CategoryRepository;
export const getProductRepo = () =>
  RepositoryFactory.getRepository<IProduct>('product', ProductRepository) as ProductRepository;
export const getCustomerRepo = () =>
  RepositoryFactory.getRepository<ICustomer>('customer', CustomerRepository) as CustomerRepository;
export const getSupplierRepo = () =>
  RepositoryFactory.getRepository<ISupplier>('supplier', SupplierRepository) as SupplierRepository;
export const getSaleRepo = () =>
  RepositoryFactory.getRepository<ISale>('sale', SaleRepository) as SaleRepository;
export const getPurchaseRepo = () =>
  RepositoryFactory.getRepository<IPurchase>('purchase', PurchaseRepository) as PurchaseRepository;
export const getInventoryLogRepo = () =>
  RepositoryFactory.getRepository<IInventoryLog>('inventoryLog', InventoryLogRepository) as InventoryLogRepository;
