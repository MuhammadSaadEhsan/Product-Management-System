import { NextRequest } from 'next/server';
import { purchaseService } from '@/services/purchaseService';
import { purchaseSchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await purchaseService.getPurchases({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });
    return successResponse(result.data, 'Purchases fetched', {
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
    const validated = purchaseSchema.parse(body);
    const purchase = await purchaseService.createPurchase(validated, session.user.id);
    return createdResponse(purchase);
  } catch (error) {
    return errorResponse(error);
  }
}
