'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
export interface SupabaseProfile {
    id: string;
    business_name: string | null;
    phone: string | null;
    address: string | null;
    email: string | null;
    avatar_url: string | null;
    category: string | null;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: SupabaseProfile | null;
    profileComplete: boolean;          // true when business_name is filled
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithPassword: (email: string, pass: string) => Promise<{ error: any }>;
    signUp: (email: string, pass: string, metadata: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>; // call after completing profile form
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<SupabaseProfile | null>(null);
    const [profileComplete, setProfileComplete] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    // Prevent multiple initial loads
    const initRef = useRef(false);

    // ── Load profile from Supabase for a given user ─────────────────────────
    const loadProfile = useCallback(async (u: User) => {
        if (!supabase) return;
        setIsLoading(true);
        console.log('[Auth] Fetching profile for user:', u.id);

        try {
            const { data, error, status } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', u.id)
                .maybeSingle();

            if (error) {
                console.warn('[Auth] profiles fetch error:', error.message, '| status:', status);
            }

            const p = data as SupabaseProfile | null;
            console.log('[Auth] Profile loaded:', p ? `✅ Found (${p.business_name})` : '⚪ No profile found');

            setProfile(p);
            setProfileComplete(!!p?.business_name);

            // Sync to localStorage.businessProfile so existing pages work
            syncToLocalStorage(u, p);
        } catch (err) {
            console.error('[Auth] Profile fetch exception:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ── Sync Supabase user + profile → localStorage businessProfile ──────────
    const syncToLocalStorage = (u: User, p: SupabaseProfile | null) => {
        const existing = localStorage.getItem('businessProfile');
        const local = existing ? JSON.parse(existing) : {};

        const updated = {
            name: p?.business_name || local.name || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Maalem',
            email: p?.email || local.email || u.email || '',
            phone: p?.phone || local.phone || u.user_metadata?.phone || '',
            address: p?.address || local.address || '',
            category: p?.category || local.category || 'General',
            avatar: p?.avatar_url || u.user_metadata?.avatar_url || local.avatar || '',
        };

        localStorage.setItem('businessProfile', JSON.stringify(updated));
        localStorage.setItem('isAuthenticated', 'true');
    };

    // ── refreshProfile — call after the complete-profile form saves ──────────
    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user);
    }, [user, loadProfile]);

    // ── Bootstrap: load session + profile on mount ───────────────────────────
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        if (!supabase) {
            setIsLoading(false);
            return;
        }

        const initAuth = async () => {
            try {
                const { data: { session: s } } = await supabase.auth.getSession();
                setSession(s);
                setUser(s?.user ?? null);

                if (s?.user) {
                    await loadProfile(s.user);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('[Auth] Bootstrap Error:', err);
                setIsLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: string, s: Session | null) => {
                console.log('[Auth] Event:', event);

                if (event === 'SIGNED_OUT') {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    setProfileComplete(false);
                    setIsLoading(false);
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('businessProfile');
                    // Explicitly NOT pushing to login here to avoid loops, let middleware handle it
                } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    if (s?.user) {
                        setSession(s);
                        setUser(s.user);
                        router.refresh(); // Tell Next.js to fetch the new cookies
                        // Only fetch if profile is not already loaded or if it's a new user
                        await loadProfile(s.user);
                    }
                } else if (event === 'INITIAL_SESSION') {
                    // Ignore initial session event to prevent redirects
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    const signInWithGoogle = async () => {
        if (!supabase) return;
        const getSafeOrigin = () => window.location.origin.replace('//0.0.0.0', '//localhost');
        const redirectTo = `${getSafeOrigin()}/auth/callback?next=/dashboard`;

        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
    };

    const signInWithPassword = async (email: string, pass: string) => {
        if (!supabase) return { error: { message: 'Supabase not ready' } };
        const { error, data } = await supabase.auth.signInWithPassword({ email, password: pass });
        
        if (!error && data?.user) {
            router.push('/dashboard');
            router.refresh(); 
        }
        
        return { error };
    };

    const signUp = async (email: string, pass: string, metadata: any) => {
        if (!supabase) return { error: { message: 'Supabase not ready' } };
        return await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: metadata }
        });
    };

    const signOut = async () => {
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('businessProfile');
        setUser(null);
        setSession(null);
        setProfile(null);
        setProfileComplete(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{
            user, session, profile, profileComplete,
            isLoading, signInWithGoogle, signInWithPassword, signUp, signOut, refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
