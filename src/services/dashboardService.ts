import { getSaleRepo, getPurchaseRepo, getProductRepo } from '@/repositories';
import connectDB from '@/lib/db';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';

export class DashboardService {
  private saleRepo = getSaleRepo();
  private purchaseRepo = getPurchaseRepo();
  private productRepo = getProductRepo();

  async getStats() {
    await connectDB();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSalesCount,
      totalPurchasesCount,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      revenueAgg,
      purchaseTotalAgg,
      monthlySalesAgg,
      monthlyPurchasesAgg,
      recentSales,
    ] = await Promise.all([
      this.saleRepo.count(),
      this.purchaseRepo.count(),
      this.productRepo.count({ isActive: true }),
      this.productRepo.findLowStock(),
      this.productRepo.findOutOfStock(),
      Sale.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Purchase.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Sale.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
        { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Purchase.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
        { $group: { _id: { $month: '$createdAt' }, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Sale.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalPurchaseAmount = purchaseTotalAgg[0]?.total || 0;

    return {
      totalRevenue,
      totalPurchases: totalPurchaseAmount,
      totalSales: totalSalesCount,
      totalPurchasesCount,
      totalProfit: totalRevenue - totalPurchaseAmount,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentSales,
      monthlySales: monthlySalesAgg.map((m: { _id: number; total: number; count: number }) => ({
        month: months[m._id - 1], total: m.total, count: m.count,
      })),
      monthlyPurchases: monthlyPurchasesAgg.map((m: { _id: number; total: number; count: number }) => ({
        month: months[m._id - 1], total: m.total, count: m.count,
      })),
    };
  }
}

export const dashboardService = new DashboardService();
