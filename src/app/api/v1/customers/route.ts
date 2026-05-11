import { NextRequest } from 'next/server';
import { getCustomerRepo } from '@/repositories';
import { customerSchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';

const customerRepo = getCustomerRepo();

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
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const result = await customerRepo.findPaginated(filter, { page, limit, sort: { name: 1 } });
    return successResponse(result.data, 'Customers fetched', {
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
    const validated = customerSchema.parse(body);
    const customer = await customerRepo.create(validated);
    return createdResponse(customer);
  } catch (error) {
    return errorResponse(error);
  }
}
