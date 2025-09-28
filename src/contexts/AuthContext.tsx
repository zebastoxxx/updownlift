import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomUser {
  id: string;
  username: string;
  full_name: string;
  role: 'operario' | 'supervisor' | 'administrador';
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any; user?: CustomUser }>;
  signOut: () => Promise<void>;
  hasPermission: (requiredRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        // Decode JWT payload (basic decode without verification for client-side)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.sub,
            username: payload.username,
            full_name: payload.full_name,
            role: payload.role
          });
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('authenticate-user', {
        body: { username, password }
      });

      if (error) {
        return { error: error.message || 'Error de autenticación' };
      }

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        return { error: null, user: data.user };
      } else {
        return { error: data.error || 'Credenciales inválidas' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Error de red' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const hasPermission = (requiredRole: string) => {
    if (!user) return false;
    
    const roleHierarchy = {
      'operario': 1,
      'supervisor': 2,
      'administrador': 3
    };
    
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
    
    return userLevel >= requiredLevel;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}