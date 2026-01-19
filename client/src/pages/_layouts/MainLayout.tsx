import { Outlet } from "react-router-dom";
// import { Header } from "@/widgets/header/Header";
// import { Sidebar } from "@/widgets/sidebar/Sidebar";
// import { useUiStore } from "@/shared/lib/store/ui";
// import { cn } from "@/shared/lib/utils";

export const MainLayout = () => {
  //   const sidebarOpen = useUiStore((state) => state.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* <Sidebar /> */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* <Header /> */}
        <main
        //   className={cn(
        //     "flex-1 overflow-y-auto p-6 transition-all duration-300",
        //     sidebarOpen ? "ml-64" : "ml-16"
        //   )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
