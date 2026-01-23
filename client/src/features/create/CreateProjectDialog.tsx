import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useCreateProject } from '@/entities/project/api/useProjects';
import { Textarea } from '@/components/ui/textarea';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  key: z.string().min(2, 'Key must be at least 2 characters').max(10).uppercase(),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function CreateProjectDialog({ children, workspaceId }: { children: React.ReactNode, workspaceId?: string }) {
  const [open, setOpen] = useState(false);
  const { mutate: createProject, isPending } = useCreateProject();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = (data: ProjectFormValues) => {
    // If no workspaceId is passed (e.g. from global create), we might need a selector.
    // For now assuming we are in a context or providing a default.
    // Hardcoding a mock workspace ID if missing for demo
    const targetWorkspaceId = workspaceId || "default-workspace-id";
    
    createProject({
        ...data,
        workspaceId: targetWorkspaceId,
    }, {
        onSuccess: () => {
            toast.success('Project created successfully');
            setOpen(false);
            reset();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Failed to create project');
        }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project in this workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="Website Redesign"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">Project Key (e.g., WEB)</Label>
            <Input
              id="key"
              placeholder="WEB"
              {...register('key')}
            />
            {errors.key && (
              <p className="text-sm text-red-500">{errors.key.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              {...register('description')}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
