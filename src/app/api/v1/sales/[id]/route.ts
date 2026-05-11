import { NextRequest } from 'next/server';
import { saleService } from '@/services/saleService';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sale = await saleService.getSaleById(id);
    if (!sale) return errorResponse(new Error('Sale not found'));
    return successResponse(sale);
  } catch (error) {
    return errorResponse(error);
  }
}
