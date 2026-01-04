import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export class ProjectController {
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await projectService.createProject(req.body, userId);

      return res.status(201).json({ success: true, data: { project } });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      });
    }
  }

  async getWorkspaceProjects(req: Request, res: Response) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const userId = req.user!.userId;

      const projects = await projectService.getWorkspaceProjects(
        workspaceId,
        userId
      );

      return res.json({ success: true, data: { projects } });
    } catch {
      return res
        .status(400)
        .json({ success: false, error: "Failed to fetch projects" });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.userId;

      const project = await projectService.getProjectById(projectId, userId);

      return res.json({ success: true, data: { project } });
    } catch {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.userId;

      const project = await projectService.updateProject(
        projectId,
        req.body,
        userId
      );

      return res.json({ success: true, data: { project } });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update project",
      });
    }
  }

  async deleteProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.userId;

      await projectService.deleteProject(projectId, userId);

      return res.json({ success: true, message: "Project deleted" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const { userId: targetUserId, role } = req.body;

      const adderId = req.user!.userId;

      await projectService.addProjectMember(
        projectId,
        targetUserId,
        role,
        adderId
      );

      return res.status(201).json({ success: true, message: "Member added" });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to add member",
      });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId as string;
      const userId = req.user!.userId;

      const members = await projectService.getProjectMembers(projectId, userId);

      return res.json({ success: true, data: { members } });
    } catch {
      return res
        .status(400)
        .json({ success: false, error: "Failed to fetch members" });
    }
  }
}
