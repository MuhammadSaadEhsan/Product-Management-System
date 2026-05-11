import { NextRequest } from 'next/server';
import { saleService } from '@/services/saleService';
import { saleSchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await saleService.getSales({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      paymentStatus: searchParams.get('paymentStatus') || undefined,
    });
    return successResponse(result.data, 'Sales fetched', {
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
    const validated = saleSchema.parse(body);
    const sale = await saleService.createSale(validated, session.user.id);
    return createdResponse(sale);
  } catch (error) {
    return errorResponse(error);
  }
}
