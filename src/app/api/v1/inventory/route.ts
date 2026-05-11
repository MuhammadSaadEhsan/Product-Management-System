import { NextRequest } from 'next/server';
import { getInventoryLogRepo, getProductRepo } from '@/repositories';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { auth } from '@/lib/auth';
import { inventoryAdjustmentSchema } from '@/validators/schemas';
import mongoose from 'mongoose';

const inventoryLogRepo = getInventoryLogRepo();
const productRepo = getProductRepo();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const productId = searchParams.get('product');
    const filter: Record<string, unknown> = {};
    if (productId) filter.product = new mongoose.Types.ObjectId(productId);
    const result = await inventoryLogRepo.findPaginated(filter, {
      page, limit, sort: { createdAt: -1 }, populate: ['product', 'createdBy'],
    });
    return successResponse(result.data, 'Inventory logs fetched', {
      page: result.page, limit: result.limit, total: result.total,
      totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return errorResponse(new Error('Unauthorized'));
    const body = await req.json();
    const validated = inventoryAdjustmentSchema.parse(body);
    const product = await productRepo.findById(validated.product);
    if (!product) return errorResponse(new Error('Product not found'));
    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + validated.quantityChange;
    if (newQuantity < 0) return errorResponse(new Error('Stock cannot go below zero'));
    await productRepo.updateStock(validated.product, validated.quantityChange);
    const log = await inventoryLogRepo.create({
      product: new mongoose.Types.ObjectId(validated.product),
      action: 'adjustment',
      quantityChange: validated.quantityChange,
      previousQuantity,
      newQuantity,
      reference: 'Manual adjustment',
      referenceType: 'manual',
      notes: validated.notes,
      createdBy: new mongoose.Types.ObjectId(session.user.id),
    });
    return successResponse(log, 'Stock adjusted');
  } catch (error) {
    return errorResponse(error);
  }
}
