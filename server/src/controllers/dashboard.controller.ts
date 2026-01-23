import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

const statsService = new StatsService();

export class DashboardController {
  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await statsService.getDashboardStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
      });
    }
  }
}
