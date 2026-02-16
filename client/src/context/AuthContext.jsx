import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase.js';
import { getMe } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!supabase);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getMe();
      if (res.success) {
        setProfile(res.data);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email, password) => {
    if (!supabase) throw new Error('Auth not configured');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Auth not configured');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const getAccessToken = async () => {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const tier = profile?.tier || 'free';
  const isPremium = tier === 'premium';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      tier,
      isPremium,
      loading,
      signUp,
      signIn,
      signOut,
      getAccessToken,
      refreshProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
