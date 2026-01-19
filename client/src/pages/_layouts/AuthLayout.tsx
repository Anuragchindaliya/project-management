import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Project Manager
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your projects efficiently
            </p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
