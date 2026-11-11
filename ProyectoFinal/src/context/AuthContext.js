import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabase';
import { traducirErrorAuth } from '../utils/validaciones';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    supabase.auth.getSession()
      .then(({ data: sessionData }) => {
        if (active) {
          setUser(sessionData.session?.user ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? traducirErrorAuth(error.message) : '' };
  };

  const signUp = async (nombre, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nombre: nombre.trim() } },
    });
    return {
      error: error ? traducirErrorAuth(error.message) : '',
      confirmationRequired: !data.session,
    };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: error ? traducirErrorAuth(error.message) : '' };
  };

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}