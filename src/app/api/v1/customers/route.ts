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
    const { data, total } = await customerRepo.paginate(filter, { page, limit, sort: { name: 1 } });
    const totalPages = Math.ceil(total / limit);
    
    return successResponse(data, 'Customers fetched', {
      page, 
      limit, 
      total,
      totalPages, 
      hasNext: page < totalPages, 
      hasPrev: page > 1,
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
