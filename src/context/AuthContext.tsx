import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  subscribeToFirebaseAuthState,
  getFriendlyAuthErrorMessage
} from '../firebase/authService';
import { isFirebaseConfigured } from '../firebase/config';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  isDemoUser: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'docguard_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // 1. If Firebase is configured, subscribe to Firebase Auth state
    if (isFirebaseConfigured) {
      const unsubscribe = subscribeToFirebaseAuthState((fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User'
          });
          setIsDemoUser(false);
        } else {
          // Check if local demo user is active
          const localDemo = localStorage.getItem(DEMO_USER_KEY);
          if (localDemo) {
            setUser(JSON.parse(localDemo));
            setIsDemoUser(true);
          } else {
            setUser(null);
            setIsDemoUser(false);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // 2. If Firebase is not configured, check for saved demo user
      const localDemo = localStorage.getItem(DEMO_USER_KEY);
      if (localDemo) {
        setUser(JSON.parse(localDemo));
        setIsDemoUser(true);
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const fbUser = await loginWithFirebase(email, pass);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User'
        });
        setIsDemoUser(false);
        localStorage.removeItem(DEMO_USER_KEY);
      }
    } catch (err: any) {
      console.error('Login error caught in AuthContext:', err);
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    try {
      const fbUser = await registerWithFirebase(email, pass, name);
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name || fbUser.email?.split('@')[0] || 'User'
        });
        setIsDemoUser(false);
        localStorage.removeItem(DEMO_USER_KEY);
      }
    } catch (err: any) {
      console.error('Register error caught in AuthContext:', err);
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  const loginAsDemo = () => {
    const demo: AppUser = {
      uid: 'demo_user_12345',
      email: 'demo@docguard.vault',
      displayName: 'Alex Morgan'
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demo));
    setUser(demo);
    setIsDemoUser(true);
  };

  const logout = async () => {
    if (isFirebaseConfigured && !isDemoUser) {
      await logoutFromFirebase();
    }
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
    setIsDemoUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        isDemoUser,
        login,
        register,
        loginAsDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
