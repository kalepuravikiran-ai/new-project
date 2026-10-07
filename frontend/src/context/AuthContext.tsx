import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/api.client.js';
import { UserProfile } from '../types/index.js';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, farmName?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDemo: (role?: 'agronomist' | 'farm_manager' | 'field_worker') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agri_aura_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default active agronomist for immediate evaluation
    return {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'Dr. Sarah Vance',
      email: 'agronomist@agriaura.io',
      farm_name: 'Verdant Horizon Precision Labs',
      role: 'agronomist'
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: UserProfile = {
          id: session.user.id,
          email: session.user.email || 'agronomist@agriaura.io',
          full_name: session.user.user_metadata?.full_name || 'Agronomist',
          farm_name: session.user.user_metadata?.farm_name || 'Agri-AURA Field Lab',
          role: session.user.user_metadata?.role || 'agronomist'
        };
        setUser(u);
        localStorage.setItem('agri_aura_user', JSON.stringify(u));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: UserProfile = {
          id: session.user.id,
          email: session.user.email || 'agronomist@agriaura.io',
          full_name: session.user.user_metadata?.full_name || 'Agronomist',
          farm_name: session.user.user_metadata?.farm_name || 'Agri-AURA Field Lab',
          role: session.user.user_metadata?.role || 'agronomist'
        };
        setUser(u);
        localStorage.setItem('agri_aura_user', JSON.stringify(u));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Farm Manager',
          farm_name: data.user.user_metadata?.farm_name || 'Precision Fields',
          role: data.user.user_metadata?.role || 'farm_manager'
        };
        setUser(u);
        localStorage.setItem('agri_aura_user', JSON.stringify(u));
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    farmName?: string,
    role: string = 'farm_manager'
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, farm_name: farmName, role }
        }
      });
      if (error) throw error;
      if (data.user) {
        const u: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          full_name: fullName,
          farm_name: farmName || 'Agri-AURA Farm',
          role: role as any
        };
        setUser(u);
        localStorage.setItem('agri_aura_user', JSON.stringify(u));
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    setUser(null);
    localStorage.removeItem('agri_aura_user');
  };

  const loginAsDemo = (role: 'agronomist' | 'farm_manager' | 'field_worker' = 'agronomist') => {
    const rolesData = {
      agronomist: {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Dr. Sarah Vance',
        email: 'agronomist@agriaura.io',
        farm_name: 'Verdant Horizon Agronomic Labs',
        role: 'agronomist' as const
      },
      farm_manager: {
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Marcus Holloway',
        email: 'manager@agriaura.io',
        farm_name: 'Sunbelt Agri-Holdings',
        role: 'farm_manager' as const
      },
      field_worker: {
        id: '00000000-0000-0000-0000-000000000003',
        full_name: 'Carlos Mendez',
        email: 'operator@agriaura.io',
        farm_name: 'Pivot Operations Sector 7',
        role: 'field_worker' as const
      }
    };
    const profile = rolesData[role];
    setUser(profile);
    localStorage.setItem('agri_aura_user', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
