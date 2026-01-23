import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";

const projectService = new ProjectService();

export class ProjectController {
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await projectService.createProject(req.body, userId);

      return res.status(201).json({
        success: true,
        data: { project },
      });
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
      const { workspaceId } = req.params;
      const userId = req.user!.userId;

      const projects = await projectService.getWorkspaceProjects(
        workspaceId,
        userId
      );

      return res.json({
        success: true,
        data: { projects },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch projects",
      });
    }
  }

  async getProjectById(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const project = await projectService.getProjectById(projectId, userId);

      return res.json({
        success: true,
        data: { project },
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
      });
    }
  }

  async updateProject(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const project = await projectService.updateProject(
        projectId,
        req.body,
        userId
      );

      return res.json({
        success: true,
        data: { project },
      });
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
      const { projectId } = req.params;
      const userId = req.user!.userId;

      await projectService.deleteProject(projectId, userId);

      return res.json({
        success: true,
        message: "Project deleted",
      });
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
      const { projectId } = req.params;
      const { userId: targetUserId, role } = req.body;
      const adderId = req.user!.userId;

      await projectService.addProjectMember(
        projectId,
        targetUserId,
        role,
        adderId
      );

      return res.status(201).json({
        success: true,
        message: "Member added",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to add member",
      });
    }
  }

  async updateMemberRole(req: Request, res: Response) {
    try {
      const { projectId, userId: targetUserId } = req.params;
      const { role } = req.body;
      const updaterId = req.user!.userId;

      await projectService.updateProjectMemberRole(
        projectId,
        targetUserId,
        role,
        updaterId
      );

      return res.json({
        success: true,
        message: "Member role updated",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to update role",
      });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { projectId, userId: targetUserId } = req.params;
      const removerId = req.user!.userId;

      await projectService.removeProjectMember(
        projectId,
        targetUserId,
        removerId
      );

      return res.json({
        success: true,
        message: "Member removed",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      });
    }
  }

  async getMembers(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const userId = req.user!.userId;

      const members = await projectService.getProjectMembers(projectId, userId);

      return res.json({
        success: true,
        data: { members },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Failed to fetch members",
      });
    }
  }

  async getProjectsHealth(req: Request, res: Response) {
    try {
      const { workspaceId } = req.query;
      const userId = req.user!.userId;

      if (!workspaceId) {
         return res.status(400).json({
          success: false,
          error: "Workspace ID is required",
        });
      }

      const health = await projectService.getProjectsHealth(
        workspaceId as string,
        userId
      );

      return res.json({
        success: true,
        data: { health },
      });
    } catch (error) {
       return res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch project health",
      });
    }
  }
}
