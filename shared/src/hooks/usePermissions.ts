import { useAuthStore } from "../store/auth.store";
import { useWorkspaceStore } from "../stores/useWorkspaceStore";

type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const { activeWorkspaceId } = useWorkspaceStore();

    const getWorkspaceRole = (workspaceId?: string): WorkspaceRole | undefined => {
        const targetWorkspaceId = workspaceId || activeWorkspaceId;
        if (!user || !targetWorkspaceId) return undefined;

        const membership = user.workspaceMemberships?.find(
            (m) => m.workspaceId === targetWorkspaceId
        );

        return membership?.role as WorkspaceRole | undefined;
    };

    const currentRole = getWorkspaceRole();

    const canCreateProject = (role?: WorkspaceRole) => {
        const roleToCheck = role || currentRole;
        if (!roleToCheck) return true; // Default allow if no role context (or restrict? user choice was 'check by default without passing')
        // Let's assume strict RBAC: if checking permissions, we usually want to restrict. 
        // But for "canCreateProject", maybe members can too?
        return ['owner', 'admin', 'member'].includes(roleToCheck);
    };

    const canDeleteProject = (role?: WorkspaceRole) => {
        const roleToCheck = role || currentRole;
         if (!roleToCheck) return false;
         return ['owner', 'admin'].includes(roleToCheck);
    };

    const canManageMembers = (role?: WorkspaceRole) => {
        const roleToCheck = role || currentRole;
        if (!roleToCheck) return false;
        return ['owner', 'admin'].includes(roleToCheck);
    };

    return {
        canCreateProject,
        canDeleteProject,
        canManageMembers,
        role: currentRole
    };
}
