import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import connectDB from '@/lib/db';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'monthly';

    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = Object.keys(dateFilter).length > 0
      ? { $match: { createdAt: dateFilter } }
      : { $match: {} };

    let groupId: Record<string, unknown>;
    if (type === 'daily') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (type === 'weekly') {
      groupId = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const [salesReport, purchaseReport, topProducts] = await Promise.all([
      Sale.aggregate([
        matchStage,
        { $group: { _id: groupId, totalRevenue: { $sum: '$totalAmount' }, totalSales: { $sum: 1 }, avgOrderValue: { $avg: '$totalAmount' } } },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      ]),
      Purchase.aggregate([
        matchStage,
        { $group: { _id: groupId, totalCost: { $sum: '$totalAmount' }, totalPurchases: { $sum: 1 } } },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),
      Sale.aggregate([
        matchStage,
        { $unwind: '$items' },
        { $group: { _id: '$items.product', productName: { $first: '$items.productName' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalRevenue = salesReport.reduce((s: number, r: { totalRevenue: number }) => s + r.totalRevenue, 0);
    const totalCost = purchaseReport.reduce((s: number, r: { totalCost: number }) => s + r.totalCost, 0);

    return successResponse({
      salesReport, purchaseReport, topProducts,
      summary: { totalRevenue, totalCost, grossProfit: totalRevenue - totalCost, profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2) : '0' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
