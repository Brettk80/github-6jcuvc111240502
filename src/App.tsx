import React, { useState } from 'react';
import { Toaster } from 'sonner';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Mock user for testing
  const mockUser = {
    name: "John Doe",
    email: "john@example.com",
    has2FAEnabled: true
  };

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {isAuthenticated && user ? (
        <Dashboard user={user} />
      ) : (
        <LoginPage onLogin={handleLogin} mockUser={mockUser} />
      )}
    </div>
  );
}

export default App;