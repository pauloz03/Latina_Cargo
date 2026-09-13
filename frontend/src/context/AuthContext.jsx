import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api';
import { client } from '../Supabase/client';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadProfile = async (sessionUser) => {
      if (!sessionUser) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await client
        .from('profiles')
        .select('is_admin')
        .eq('id', sessionUser.id)
        .single();

      if (!error) {
        setIsAdmin(!!data?.is_admin);
        return;
      }

      try {
        const profile = await getMe();
        setIsAdmin(!!profile?.is_admin);
      } catch {
        setIsAdmin(false);
      }
    };
  
    useEffect(() => {
      client.auth.getSession().then(async ({ data: { session } }) => {
        setUser(session?.user ?? null);
        await loadProfile(session?.user ?? null);
        setLoading(false);
      });
  
      // Keep state in sync with every future auth event
      const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        loadProfile(session?.user ?? null);
      });
  
      return () => listener.subscription.unsubscribe();
    }, []);
  
    const logout = async () => {
      await client.auth.signOut();
    };
  
    return (
      <AuthContext.Provider value={{ isAuthenticated: !!user, user, isAdmin, logout, loading }}>
        {loading ? <div>Cargando sesión...</div> : children}
      </AuthContext.Provider>
    );
};
