import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/features/theme/ThemeToggle';
import { Sidebar } from '@/features/sidebar/Sidebar';

export function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen overflow-auto">
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
            <SheetContent side="left" className="p-0 w-[280px]">
               <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <span className="font-semibold md:hidden">Project Manager</span>
          </div>
          <ModeToggle />
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
