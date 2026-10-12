import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  register: (name: string, email: string, phone: string, role?: UserRole) => User;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (data: Partial<User>) => void;
  sampleAccounts: typeof MOCK_USERS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Administrator initially for convenient demonstration
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartmove_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_USERS[0];
      }
    }
    return MOCK_USERS[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartmove_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartmove_auth_user');
    }
  }, [user]);

  const login = (email: string, targetRole?: UserRole): boolean => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || (targetRole && u.role === targetRole)
    );

    if (foundUser) {
      setUser(foundUser);
      return true;
    }

    // Default fallback user if new email
    const fallbackUser: User = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: targetRole || 'Passenger',
    };
    setUser(fallbackUser);
    return true;
  };

  const register = (name: string, email: string, phone: string, targetRole: UserRole = 'Passenger'): User => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name,
      email,
      phone,
      role: targetRole,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const matchedAccount = MOCK_USERS.find((u) => u.role === newRole);
    if (matchedAccount) {
      setUser(matchedAccount);
    } else if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'Passenger',
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
        sampleAccounts: MOCK_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
