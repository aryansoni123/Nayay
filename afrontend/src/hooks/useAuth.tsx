import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedAuth = localStorage.getItem('isAuthenticated');

    if (storedUserId && storedAuth === 'true') {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (userId: string) => {
    setUserId(userId);
    setIsAuthenticated(true);
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUserId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
  };

  // Return loading state or provider during hydration
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)]" />;
  }

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
