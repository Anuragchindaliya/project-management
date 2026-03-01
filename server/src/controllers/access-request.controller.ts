import { Request, Response } from "express";
import { AccessRequestService } from "../services/access-request.service";

const accessRequestService = new AccessRequestService();

export class AccessRequestController {
  async createRequest(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const request = await accessRequestService.createRequest(req.body, userId);

      return res.status(201).json({
        success: true,
        data: { request },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to create request",
      });
    }
  }

  async getPendingRequests(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const requests = await accessRequestService.getPendingRequestsForOwner(userId);

      return res.json({
        success: true,
        data: { requests },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch requests",
      });
    }
  }

  async processRequest(req: Request, res: Response) {
    try {
      const { requestId } = req.params as { requestId: string };
      const { status } = req.body;
      const userId = req.user!.userId;

      await accessRequestService.processRequest(requestId, status, userId);

      return res.json({
        success: true,
        message: `Request ${status === 'approved' ? 'approved' : 'rejected'}`,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process request",
      });
    }
  }
}
