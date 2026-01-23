import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, FolderPlus, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
      <h3 className="mt-4 text-lg font-semibold text-gray-900">No data found</h3>
      <p className="mb-8 mt-2 text-sm text-gray-500 max-w-sm">
        You haven't created any workspaces, projects, or tasks yet. Get started by creating one.
      </p>
      
      <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/workspaces/create')}>
           <CardContent className="flex flex-col items-center p-6 space-y-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Layout className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-semibold">Create Workspace</h4>
                    <p className="text-sm text-gray-500">Start organizing your team</p>
                </div>
                <Button variant="outline" className="w-full">Create</Button>
           </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/projects/create')}>
           <CardContent className="flex flex-col items-center p-6 space-y-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full group-hover:bg-green-100 transition-colors">
                    <FolderPlus className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-semibold">Create Project</h4>
                    <p className="text-sm text-gray-500">Setup a new project</p>
                </div>
                <Button variant="outline" className="w-full">Create</Button>
           </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate('/tasks/create')}>
           <CardContent className="flex flex-col items-center p-6 space-y-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full group-hover:bg-purple-100 transition-colors">
                    <PlusCircle className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="font-semibold">Create Task</h4>
                    <p className="text-sm text-gray-500">Add a new task item</p>
                </div>
                <Button variant="outline" className="w-full">Create</Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
