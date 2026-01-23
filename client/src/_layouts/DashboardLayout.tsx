import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  LogOut, 
  Menu,
  Briefcase
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/features/theme/ThemeToggle';
import { useAuth } from '@/app/providers/AuthProvider';
import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

function NavItem({ to, icon: Icon, label, onClick }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export function DashboardLayout() {
  const { logout, user } = useAuth();
  // const navigate = useNavigate(); -> Removed in previous step but commented out. cleaning up.
  const [isOpen, setIsOpen] = useState(false);

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="">Acme Inc</span>
        </NavLink>
        <div className="ml-auto">
             <ModeToggle />
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsOpen(false)} />
          <div className="my-2 border-t" />
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            Workspaces
          </div>
          {/* We would map workspaces here. For now static or placeholder */}
          <NavItem to="/workspaces" icon={Briefcase} label="All Workspaces" onClick={() => setIsOpen(false)} />
          
          <div className="my-2 border-t" />
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            Projects
          </div>
          <NavItem to="/projects" icon={FolderKanban} label="All Projects" onClick={() => setIsOpen(false)} />
          <NavItem to="/tasks" icon={ListTodo} label="My Tasks" onClick={() => setIsOpen(false)} />
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              </div>
          </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <span className="font-semibold md:hidden">Project Manager</span>
          </div>
          <ModeToggle />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
