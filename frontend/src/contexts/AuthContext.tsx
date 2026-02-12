import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface User {
  userId: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  googleLogin: (role?: 'CLIENT' | 'MECHANIC') => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}


interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'CLIENT' | 'MECHANIC';
  shopName?: string;
  address?: string;
  shopTypes?: string[];
  openTime?: string;
  closeTime?: string;
  latitude?: number;
  longitude?: number;
  servicesOffered?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (token && userId && role) {
      setUser({ token, userId, role });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      console.log('Login attempt with:', { email, passwordLength: password.length });
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const apiResponse = response.data;
      console.log('Login response:', apiResponse);
      
      // Backend wraps the response in ApiResponse { success, message, data }
      const data = apiResponse.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('role', data.user.role);
      
      setUser({ token: data.token, userId: data.user.id, role: data.user.role });
      return { success: true, role: data.user.role };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials';
      return { success: false, error: errorMessage };
    }
  };

  const googleLogin = async (role: 'CLIENT' | 'MECHANIC' = 'CLIENT'): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      console.log('Google Login Success, token obtained. Exchanging with backend...');

      // Send token to backend
      const response = await api.post('/auth/firebase-login', { 
          idToken,
          role 
      });
      
      const apiResponse = response.data;
      const data = apiResponse.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('role', data.user.role);
      
      setUser({ token: data.token, userId: data.user.id, role: data.user.role });
      return { success: true, role: data.user.role };

    } catch (error: any) {
      console.error("Google Login Error", error);
      const errorMessage = error.response?.data?.message || error.message || 'Google Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/register', data);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, googleLogin, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
