"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Client, Service, Quote } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────
//  helpers
// ─────────────────────────────────────────────────────────
/** Run a Supabase query with a hard timeout — never lets network hang the UI */
async function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T | null> {
    try {
        return await Promise.race([
            promise,
            new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Supabase timeout')), ms)
            ),
        ]) as T;
    } catch (e) {
        console.warn('[Supabase] timeout or error:', e);
        return null;
    }
}

// ─────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────
interface DataContextType {
    clients: Client[];
    services: Service[];
    quotes: Quote[];
    subscription: 'FREE' | 'PRO';
    isSyncing: boolean;
    addClient: (client: Client) => void;
    updateClient: (id: string, client: Partial<Client>) => void;
    deleteClient: (id: string) => void;
    addService: (service: Service) => void;
    updateService: (id: string, service: Partial<Service>) => void;
    deleteService: (id: string) => void;
    addQuote: (quote: Quote) => void;
    updateQuote: (id: string, quote: Partial<Quote>) => void;
    deleteQuote: (id: string) => void;
    setSubscriptionStatus: (status: 'FREE' | 'PRO') => void;
    refetchFromCloud: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────
//  Provider
// ─────────────────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const [clients, setClients] = useState<Client[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [subscription, setSubscription] = useState<'FREE' | 'PRO'>('FREE');
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    console.log('DEBUG: DataContext initialized ✅', { isSupabaseConfigured });

    // ── Resolve userId from businessProfile ──────────────
    const resolveUserId = (): string | null => {
        try {
            const raw = localStorage.getItem('businessProfile');
            if (!raw) return null;
            const p = JSON.parse(raw);
            return p.email || p.phone || null;
        } catch { return null; }
    };

    // ── Load from localStorage (synchronous — instant UI) ──
    const loadFromLocal = useCallback((userId: string) => {
        try {
            const sc = localStorage.getItem(`data_${userId}_clients`);
            const ss = localStorage.getItem(`data_${userId}_services`);
            const sq = localStorage.getItem(`data_${userId}_quotes`);
            const sub = localStorage.getItem(`sub_${userId}_status`);
            setClients(sc ? JSON.parse(sc) : []);
            setServices(ss ? JSON.parse(ss) : []);
            setQuotes(sq ? JSON.parse(sq) : []);
            setSubscription(sub === 'PRO' ? 'PRO' : 'FREE');
        } catch (e) {
            console.error('[DataContext] loadFromLocal error:', e);
        }
    }, []);

    // ── Sync FROM Supabase (background, non-blocking) ──
    const syncFromSupabase = useCallback(async (userId: string) => {
        if (!isSupabaseConfigured || !supabase) return;
        setIsSyncing(true);
        console.log('[Supabase] Syncing for user:', userId);
        try {
            const [clientsRes, quotesRes] = await Promise.all([
                withTimeout(supabase.from('clients').select('*').eq('user_id', userId)),
                withTimeout(supabase.from('invoices').select('*').eq('user_id', userId)),
            ]);

            if (clientsRes) {
                const r = clientsRes as any;
                if (!r.error && Array.isArray(r.data) && r.data.length > 0) {
                    setClients(r.data);
                    localStorage.setItem(`data_${userId}_clients`, JSON.stringify(r.data));
                }
            }
            if (quotesRes) {
                const r = quotesRes as any;
                if (!r.error && Array.isArray(r.data) && r.data.length > 0) {
                    setQuotes(r.data);
                    localStorage.setItem(`data_${userId}_quotes`, JSON.stringify(r.data));
                }
            }
        } catch (e) {
            console.warn('[Supabase] sync failed:', e);
        } finally {
            setIsSyncing(false);
        }
    }, []);

    // ── Initial load on mount / route change ───────────
    useEffect(() => {
        const userId = resolveUserId();
        if (!userId) {
            setClients([]); setServices([]); setQuotes([]);
            setIsLoaded(true);
            return;
        }
        setCurrentUserId(userId);
        loadFromLocal(userId);   // ← instant, synchronous
        setIsLoaded(true);
        syncFromSupabase(userId); // ← background, non-blocking
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // ── Persist to localStorage ──────────────────────────
    useEffect(() => {
        if (isLoaded && currentUserId)
            localStorage.setItem(`data_${currentUserId}_clients`, JSON.stringify(clients));
    }, [clients, isLoaded, currentUserId]);

    useEffect(() => {
        if (isLoaded && currentUserId)
            localStorage.setItem(`data_${currentUserId}_services`, JSON.stringify(services));
    }, [services, isLoaded, currentUserId]);

    useEffect(() => {
        if (isLoaded && currentUserId)
            localStorage.setItem(`data_${currentUserId}_quotes`, JSON.stringify(quotes));
    }, [quotes, isLoaded, currentUserId]);

    useEffect(() => {
        if (isLoaded && currentUserId)
            localStorage.setItem(`sub_${currentUserId}_status`, subscription);
    }, [subscription, isLoaded, currentUserId]);

    // ── CRUD — localStorage first, Supabase in background ──

    const addClient = useCallback((c: Client) => {
        console.log('Client sent to Supabase:', c);
        // 1. Update UI immediately
        setClients(prev => [c, ...prev]);

        // 2. Push to Supabase in background (non-blocking)
        if (isSupabaseConfigured && supabase && currentUserId) {
            const payload = { ...c, user_id: currentUserId };
            withTimeout(
                supabase.from('clients').upsert(payload)
            ).then(res => {
                if (res && (res as any).error) {
                    console.error('[Supabase] addClient error:', (res as any).error);
                } else {
                    console.log('[Supabase] ✅ Client saved to Supabase');
                }
            });
        }
    }, [currentUserId]);

    const updateClient = useCallback((id: string, d: Partial<Client>) => {
        setClients(p => p.map(c => c.id === id ? { ...c, ...d } : c));
        if (isSupabaseConfigured && supabase && currentUserId) {
            withTimeout(supabase.from('clients').update(d).eq('id', id).eq('user_id', currentUserId));
        }
    }, [currentUserId]);

    const deleteClient = useCallback((id: string) => {
        setClients(p => p.filter(c => c.id !== id));
        if (isSupabaseConfigured && supabase && currentUserId) {
            withTimeout(supabase.from('clients').delete().eq('id', id).eq('user_id', currentUserId));
        }
    }, [currentUserId]);

    const addService = useCallback((s: Service) => setServices(p => [...p, s]), []);
    const updateService = useCallback((id: string, d: Partial<Service>) => setServices(p => p.map(s => s.id === id ? { ...s, ...d } : s)), []);
    const deleteService = useCallback((id: string) => setServices(p => p.filter(s => s.id !== id)), []);

    const addQuote = useCallback((q: Quote) => {
        setQuotes(prev => [q, ...prev]);
        if (isSupabaseConfigured && supabase && currentUserId) {
            const payload = { ...q, user_id: currentUserId };
            withTimeout(supabase.from('invoices').upsert(payload)).then(res => {
                if (res && (res as any).error) console.error('[Supabase] addQuote error:', (res as any).error);
            });
        }
    }, [currentUserId]);

    const updateQuote = useCallback((id: string, d: Partial<Quote>) => {
        setQuotes(p => p.map(q => q.id === id ? { ...q, ...d } : q));
        if (isSupabaseConfigured && supabase && currentUserId) {
            withTimeout(supabase.from('invoices').update(d).eq('id', id).eq('user_id', currentUserId));
        }
    }, [currentUserId]);

    const deleteQuote = useCallback((id: string) => {
        setQuotes(p => p.filter(q => q.id !== id));
        if (isSupabaseConfigured && supabase && currentUserId) {
            withTimeout(supabase.from('invoices').delete().eq('id', id).eq('user_id', currentUserId));
        }
    }, [currentUserId]);

    const refetchFromCloud = useCallback(() => {
        if (currentUserId) syncFromSupabase(currentUserId);
    }, [currentUserId, syncFromSupabase]);

    return (
        <DataContext.Provider value={{
            clients, services, quotes, subscription, isSyncing,
            addClient, updateClient, deleteClient,
            addService, updateService, deleteService,
            addQuote, updateQuote, deleteQuote,
            setSubscriptionStatus: setSubscription,
            refetchFromCloud,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within a DataProvider');
    return ctx;
}
