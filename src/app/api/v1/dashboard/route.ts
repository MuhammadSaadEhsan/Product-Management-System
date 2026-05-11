import { NextRequest } from 'next/server';
import { dashboardService } from '@/services/dashboardService';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const stats = await dashboardService.getStats();
    return successResponse(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
