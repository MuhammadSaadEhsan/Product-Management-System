import { getPurchaseRepo, getProductRepo, getInventoryLogRepo } from '@/repositories';
import { PurchaseInput } from '@/validators/schemas';
import { generateInvoiceNumber } from '@/lib/utils';
import { INVOICE_PREFIX } from '@/config/constants';
import { IPurchase } from '@/models/Purchase';
import { IPaginatedResult, IPaginationOptions } from '@/repositories/BaseRepository';
import { FilterQuery } from 'mongoose';

export class PurchaseService {
  private purchaseRepo = getPurchaseRepo();
  private productRepo = getProductRepo();
  private inventoryLogRepo = getInventoryLogRepo();

  async getPurchases(params: {
    page?: number; limit?: number; search?: string;
    startDate?: string; endDate?: string;
    sortBy?: string; sortOrder?: 'asc' | 'desc';
  }): Promise<IPaginatedResult<IPurchase>> {
    const { page = 1, limit = 10, search, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const filter: FilterQuery<IPurchase> = {};
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const options: IPaginationOptions = {
      page, limit,
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
      populate: 'supplier',
    };
    return this.purchaseRepo.findPaginated(filter, options);
  }

  async getPurchaseById(id: string): Promise<IPurchase | null> {
    return this.purchaseRepo.findById(id, ['supplier', 'createdBy']);
  }

  async createPurchase(data: PurchaseInput, userId: string): Promise<IPurchase> {
    const count = await this.purchaseRepo.count();
    const invoiceNumber = generateInvoiceNumber(INVOICE_PREFIX.PURCHASE, count);
    const purchase = await this.purchaseRepo.create({
      ...data, invoiceNumber, createdBy: userId,
    });
    for (const item of data.items) {
      const product = await this.productRepo.findById(item.product);
      if (!product) continue;
      const previousQuantity = product.quantity;
      await this.productRepo.updateStock(item.product, item.quantity);
      await this.inventoryLogRepo.create({
        product: item.product, action: 'purchase',
        quantityChange: item.quantity, previousQuantity,
        newQuantity: previousQuantity + item.quantity,
        reference: invoiceNumber, referenceType: 'purchase',
        referenceId: purchase._id, createdBy: userId,
      });
    }
    return purchase;
  }
}

export const purchaseService = new PurchaseService();
