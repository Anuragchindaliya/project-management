/**
 * Main App component with providers
 */

import { QueryProvider } from './app/providers/QueryProvider';
import { AuthProvider } from './app/providers/AuthProvider';
import { useSocket } from './shared/hooks/useSocket';

function AppContent() {
  // Initialize socket connection for real-time updates
  useSocket();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Project Management Platform
        </h1>
        <p className="text-gray-600">
          Your React frontend is set up with:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-600">
          <li>TypeScript with shared Drizzle types</li>
          <li>TanStack Query v5 for server state</li>
          <li>Zustand for local UI state</li>
          <li>Feature-Sliced Design folder structure</li>
          <li>Type-safe API client with axios</li>
          <li>Socket.io integration for real-time updates</li>
        </ul>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
