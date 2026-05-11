import { NextRequest } from 'next/server';
import { getSupplierRepo } from '@/repositories';
import { supplierSchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';

const supplierRepo = getSupplierRepo();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const filter: Record<string, unknown> = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    const result = await supplierRepo.findPaginated(filter, { page, limit, sort: { name: 1 } });
    return successResponse(result.data, 'Suppliers fetched', {
      page: result.page, limit: result.limit, total: result.total,
      totalPages: result.totalPages, hasNext: result.hasNext, hasPrev: result.hasPrev,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = supplierSchema.parse(body);
    const supplier = await supplierRepo.create(validated);
    return createdResponse(supplier);
  } catch (error) {
    return errorResponse(error);
  }
}
