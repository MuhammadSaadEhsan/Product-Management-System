import { NextRequest } from 'next/server';
import { productService } from '@/services/productService';
import { productSchema } from '@/validators/schemas';
import { successResponse, createdResponse, errorResponse } from '@/lib/apiResponse';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const result = await productService.getProducts({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 10,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    });
    return successResponse(result.data, 'Products fetched', {
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
    const validated = productSchema.parse(body);
    const product = await productService.createProduct(validated, session.user.id);
    return createdResponse(product);
  } catch (error) {
    return errorResponse(error);
  }
}
