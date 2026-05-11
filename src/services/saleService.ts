import { getSaleRepo, getProductRepo, getInventoryLogRepo, getCustomerRepo } from '@/repositories';
import { SaleInput } from '@/validators/schemas';
import { generateInvoiceNumber } from '@/lib/utils';
import { INVOICE_PREFIX } from '@/config/constants';
import { ISale } from '@/models/Sale';
import { IPaginatedResult, IPaginationOptions } from '@/repositories/BaseRepository';
import { FilterQuery } from 'mongoose';

export class SaleService {
  private saleRepo = getSaleRepo();
  private productRepo = getProductRepo();
  private inventoryLogRepo = getInventoryLogRepo();
  private customerRepo = getCustomerRepo();

  async getSales(params: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    paymentStatus?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<IPaginatedResult<ISale>> {
    const { page = 1, limit = 10, search, startDate, endDate, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const filter: FilterQuery<ISale> = {};

    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const options: IPaginationOptions = {
      page,
      limit,
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      populate: 'customer',
    };

    return this.saleRepo.findPaginated(filter, options);
  }

  async getSaleById(id: string): Promise<ISale | null> {
    return this.saleRepo.findById(id, ['customer', 'createdBy']);
  }

  async createSale(data: SaleInput, userId: string): Promise<ISale> {
    // Validate stock availability
    for (const item of data.items) {
      const product = await this.productRepo.findById(item.product);
      if (!product) throw new Error(`Product not found: ${item.productName}`);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}. Available: ${product.quantity}`);
      }
    }

    // Generate invoice number
    const count = await this.saleRepo.count();
    const invoiceNumber = generateInvoiceNumber(INVOICE_PREFIX.SALE, count);

    // Create sale
    const sale = await this.saleRepo.create({
      ...data,
      invoiceNumber,
      createdBy: userId,
    });

    // Deduct stock and log inventory
    for (const item of data.items) {
      const product = await this.productRepo.findById(item.product);
      if (!product) continue;

      const previousQuantity = product.quantity;
      await this.productRepo.updateStock(item.product, -item.quantity);

      await this.inventoryLogRepo.create({
        product: item.product,
        action: 'sale',
        quantityChange: -item.quantity,
        previousQuantity,
        newQuantity: previousQuantity - item.quantity,
        reference: invoiceNumber,
        referenceType: 'sale',
        referenceId: sale._id,
        createdBy: userId,
      });
    }

    // Update customer total purchases
    if (data.customer) {
      await this.customerRepo.updateById(data.customer, {
        $inc: { totalPurchases: 1 },
      });
    }

    return sale;
  }

  async getRecentSales(limit = 5): Promise<ISale[]> {
    return this.saleRepo.findAll({}, { sort: { createdAt: -1 }, limit });
  }

  async getSalesByDateRange(startDate: Date, endDate: Date): Promise<ISale[]> {
    return this.saleRepo.getSalesByDateRange(startDate, endDate);
  }
}

export const saleService = new SaleService();
