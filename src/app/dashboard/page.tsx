'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, CheckCircle, Clock, AlertCircle, DollarSign, ArrowUpRight, ChevronRight, MoreHorizontal, Lock, Crown, X, Wallet, Search, CalendarDays, MessageCircle, Briefcase, Wrench, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Quote } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import { StatusBadge } from '@/components/ui/StatusBadge';

/* ─────────────────────────────────────────────────────────
   UPCOMING EVENTS WIDGET (reads from calendar localStorage)
───────────────────────────────────────────────────────── */
const CAL_LS = 'maalem_calendar_events';
type EvType = 'visit' | 'start' | 'payment';
interface CalEvent { id: string; type: EvType; title: string; date: string; time: string; phone?: string; }
const EV_META: Record<EvType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    visit: { label: 'شوفة الشانطي', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: <Briefcase size={12} /> },
    start: { label: 'بداية الخدمة', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <Wrench size={12} /> },
    payment: { label: 'موعد الخلاص', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: <Banknote size={12} /> },
};
const todayISO = () => new Date().toISOString().slice(0, 10);

function UpcomingEventsWidget({ language }: { language: string }) {
    const [events, setEvents] = React.useState<CalEvent[]>([]);
    React.useEffect(() => {
        const raw = localStorage.getItem(CAL_LS);
        if (raw) setEvents(JSON.parse(raw));
    }, []);

    const upcoming = events
        .filter(e => e.date >= todayISO())
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 3);

    const sendWA = (ev: CalEvent) => {
        const msg = `السلام عليكم، كنفكرك بلي عندنا موعد غدا مع ${ev.time}. تبارك الله عليك.`;
        const ph = ev.phone?.replace(/[^0-9]/g, '') || '';
        const url = ph
            ? `https://wa.me/212${ph.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-5">
            {/* Widget header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-bold text-white">
                        {language === 'ar' ? 'المواعيد اللي جاية ⏰' : 'Prochains rendez-vous ⏰'}
                    </h2>
                </div>
                <Link href="/calendar" className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                    {language === 'ar' ? 'الكل' : 'Voir tout'}
                    <ChevronRight className="w-3 h-3" />
                </Link>
            </div>

            {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                    <CalendarDays className="w-8 h-8 text-slate-600" />
                    <p className="text-slate-500 text-sm">{language === 'ar' ? 'ما كاين حتى موعد' : 'Aucun événement'}</p>
                    <Link href="/calendar" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold mt-1">
                        + {language === 'ar' ? 'إضافة موعد' : 'Ajouter un RDV'}
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {upcoming.map(ev => {
                        const meta = EV_META[ev.type];
                        return (
                            <div key={ev.id} style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}
                                className="rounded-xl p-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div style={{ color: meta.color, background: `${meta.color}20` }} className="p-1.5 rounded-lg flex-shrink-0">
                                        {meta.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span style={{ color: meta.color }} className="text-xs font-semibold">{meta.label}</span>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" />{ev.date} — {ev.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {ev.phone && (
                                    <button onClick={() => sendWA(ev)}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        style={{ background: 'rgba(37,211,102,0.12)', color: '#25D366', border: '1px solid rgba(37,211,102,0.25)' }}>
                                        <MessageCircle className="w-3 h-3" />
                                        {language === 'ar' ? 'تذكير' : 'Rappel'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <Link href="/calendar" className="text-center text-xs text-slate-400 hover:text-emerald-400 transition-colors py-1">
                        {language === 'ar' ? 'فتح الروزنامة الكاملة ←' : 'Ouvrir le calendrier complet ←'}
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const { t, language } = useLanguage();
    const { quotes, updateQuote, clients } = useData();
    const { user, profile, profileComplete, isLoading: authLoading } = useAuth();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'accepted' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const userName = profile?.business_name || user?.user_metadata?.full_name || '';

    useEffect(() => {
        if (authLoading) return;

        // ── If profile incomplete → onboarding ──
        if (user && !profileComplete && pathname !== '/complete-profile') {
            router.replace('/complete-profile');
            return;
        }
    }, [user, profileComplete, authLoading, router, pathname]);



    // Limit Constants
    const FREE_LIMIT = 5; // Increased limit slightly as a bonus
    const usageCount = quotes.length;
    const isLimitReached = usageCount >= FREE_LIMIT;

    // FILTER DATA
    const filteredQuotes = useMemo(() => {
        let data = quotes;
        if (selectedClientId !== 'all') {
            data = data.filter(q => q.clientId === selectedClientId);
        }
        if (statusFilter !== 'all') {
            data = data.filter(q => q.status === statusFilter);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            data = data.filter(q =>
                q.clientName.toLowerCase().includes(query) ||
                q.number.toLowerCase().includes(query) ||
                q.items.some(i => i.description.toLowerCase().includes(query))
            );
        }
        return data;
    }, [quotes, selectedClientId, statusFilter, searchQuery]);


    // Calculate Stats
    const stats = useMemo(() => {
        // Total Invoiced (Everything except draft/rejected)
        const totalInvoiced = filteredQuotes.reduce((acc, q) =>
            q.status !== 'rejected' && q.status !== 'draft' ? acc + q.total : acc, 0);

        // Pending Payment (Sent, Unpaid, Deposit Only)
        const totalPending = filteredQuotes.reduce((acc, q) =>
            (q.status === 'sent' || q.status === 'deposit_only' || q.status === 'unpaid') ? acc + q.total : acc, 0);

        // Paid Amount (Actual Cash In)
        const totalPaid = filteredQuotes.reduce((acc, q) =>
            q.status === 'paid' ? acc + q.total : acc, 0);

        const paidCount = filteredQuotes.filter(q => q.status === 'paid').length;
        const activeCount = filteredQuotes.filter(q => q.status === 'sent' || q.status === 'deposit_only' || q.status === 'unpaid').length;
        const draftCount = filteredQuotes.filter(q => q.status === 'draft').length;

        // Monthly Revenue (Paid? Or Invoiced?) - Let's use Invoiced for Activity
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = filteredQuotes
            .filter(q => {
                const d = new Date(q.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && q.status !== 'rejected' && q.status !== 'draft';
            })
            .reduce((acc, q) => acc + q.total, 0);

        return { totalInvoiced, totalPending, totalPaid, paidCount, activeCount, draftCount, monthlyRevenue };
    }, [filteredQuotes]);

    // Stats: Status Counts (for the top summary)
    const statusCounts = useMemo(() => {
        return {
            sent: filteredQuotes.filter(q => q.status === 'sent').length,
            accepted: filteredQuotes.filter(q => q.status === 'accepted').length, // New
            cancelled: filteredQuotes.filter(q => q.status === 'cancelled').length // New
        };
    }, [filteredQuotes]);

    const getStatusColor = (status: Quote['status']) => {
        switch (status) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-400'; // Keep for legacy
            case 'sent': return 'bg-blue-500/10 text-blue-400';
            case 'accepted': return 'bg-emerald-500/10 text-emerald-400'; // Green as requested
            case 'cancelled': return 'bg-red-500/10 text-red-400'; // Red as requested
            case 'draft': return 'bg-slate-500/10 text-slate-400';
            case 'deposit_only': return 'bg-purple-500/10 text-purple-400';
            case 'rejected': return 'bg-red-500/10 text-red-400';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    const statusOptions: { value: Quote['status'], label: string }[] = [
        { value: 'sent', label: language === 'ar' ? 'تم الإرسال' : 'Envoyé' },
        { value: 'accepted', label: language === 'ar' ? 'مقبول' : 'Accepté' },
        { value: 'cancelled', label: language === 'ar' ? 'ملغى' : 'Annulé' },
        // Keep others just in case but prioritize these 3
        { value: 'draft', label: language === 'ar' ? 'مسودة' : 'Brouillon' },
        { value: 'paid', label: language === 'ar' ? 'تم الدفع' : 'Payé' },
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-cairo">جاري التحقق من الحساب...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-cairo">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Header Section */}
                <section className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700/50">
                    <div className="text-center md:text-right w-full md:w-auto">
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                            {language === 'ar' ? 'مرحباً، معلم' : 'Bonjour, Maalem'} <span className="text-emerald-400">{userName || (language === 'ar' ? 'محترف' : '')}</span> 👋
                        </h1>
                        <p className="text-slate-400 text-sm">
                            {language === 'ar' ? 'إليك نظرة عامة على نشاطك التجاري اليوم.' : 'Voici un aperçu de votre activité aujourd\'hui.'}
                        </p>


                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                        {/* Client Filter */}
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="h-11 bg-[#1E293B] border border-slate-700 rounded-xl px-4 text-sm text-slate-300 outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer hover:bg-slate-800 min-w-[200px]"
                        >
                            <option value="all">{language === 'ar' ? 'جميع الزبائن' : 'Tous les Clients'}</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>

                        <div className="flex gap-3 w-full md:w-auto justify-center">
                            {/* New Quote Button */}
                            {isLimitReached ? (
                                <Button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    size="lg"
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-500/20 rounded-xl px-6 gap-2"
                                >
                                    <Crown className="w-5 h-5" />
                                    {language === 'ar' ? 'ترقية إلى برو' : 'Upgrade to Pro'}
                                </Button>
                            ) : (
                                <Link href="/quotes/new">
                                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold shadow-lg shadow-emerald-500/20 rounded-xl px-6">
                                        <Plus className="w-5 h-5 ml-2" />
                                        {t('nav.new_quote')}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Cyber Mint Usage Banner (Subscription) */}
                <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.06)] animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "p-3 rounded-xl transition-all duration-300",
                            isLimitReached
                                ? "bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                                : "bg-[#10B981]/10 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        )}>
                            {isLimitReached ? <Lock className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200 font-jakarta">
                                {language === 'ar' ? 'استهلاك خطة Maalem Free' : 'Utilisation du Plan Maalem Free'}
                            </span>
                            <span className="text-xs text-slate-400 font-inter mt-0.5">
                                {language === 'ar' ? 'لقد استهلكت ' : 'Vous avez utilisé '}
                                <span className={cn("font-bold font-jakarta", isLimitReached ? "text-amber-500" : "text-[#10B981]")}>{usageCount}</span>
                                <span className="mx-1">/</span>
                                <span className="font-bold">{FREE_LIMIT}</span>
                                {language === 'ar' ? ' من عروض الأسعار المجانية.' : ' devis gratuits.'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Progress Bar */}
                        <div className="w-48 h-2 bg-slate-800 rounded-full hidden lg:block overflow-hidden border border-slate-700/50">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                    isLimitReached ? "bg-amber-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                                )}
                                style={{ width: `${Math.min((usageCount / FREE_LIMIT) * 100, 100)}%` }}
                            />
                        </div>

                        <Button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-4 h-9 text-xs transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
                        >
                            {language === 'ar' ? 'ترقية' : 'Upgrade'}
                        </Button>
                    </div>
                </div>

                {/* Profile Completion Alert */}
                {showProfileAlert && (
                    <div className="bg-[#10B981]/10 border border-[#10B981] rounded-xl p-4 relative flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <div className="flex items-center gap-4 text-right">
                            <div className="p-3 bg-[#10B981]/20 rounded-full text-[#10B981] shrink-0">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-[#10B981] font-bold text-lg mb-1">
                                    {language === 'ar' ? 'مرحباً بك! 👋' : 'Bienvenue !'}
                                </h3>
                                <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
                                    {language === 'ar'
                                        ? 'يرجى إكمال معلومات ملفك الشخصي (الهاتف، العنوان، اللوجو) لتظهر فواتيرك بشكل احترافي وموثوق أمام عملائك.'
                                        : 'Veuillez compléter votre profil pour que vos factures paraissent professionnelles.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                            <Link href="/settings" className="w-full sm:w-auto">
                                <Button className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-slate-900 font-bold shadow-lg shadow-[#10B981]/20 whitespace-nowrap">
                                    {language === 'ar' ? 'تعديل الملف الشخصي' : 'Modifier le profil'}
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setShowProfileAlert(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 shrink-0">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Invoiced Card */}
                    <div className="group bg-[#1E293B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700/50 hover:border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded-full font-jakarta">
                                +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                            </span>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-jakarta">
                            {language === 'ar' ? 'مجموع المبيعات' : 'Total Ventes'}
                        </h3>
                        <p className="text-3xl font-bold text-white mt-2 font-jakarta tracking-tight">
                            {stats.totalInvoiced.toLocaleString()} <span className="text-sm font-medium text-slate-500">DH</span>
                        </p>
                    </div>

                    {/* Pending Amount Card */}
                    <div className="group bg-[#1E293B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700/50 hover:border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-jakarta">
                            {language === 'ar' ? 'المبالغ المعلقة' : 'Paiements en attente'}
                        </h3>
                        <p className="text-3xl font-bold text-white mt-2 font-jakarta tracking-tight">
                            {stats.totalPending.toLocaleString()} <span className="text-sm font-medium text-slate-500">DH</span>
                        </p>
                    </div>

                    {/* Active Quotes Card */}
                    <div className="group bg-[#1E293B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700/50 hover:border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <FileText className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-jakarta">
                            {language === 'ar' ? 'عروض أسعار نشطة' : 'Devis actifs'}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-3xl font-bold text-white font-jakarta tracking-tight">{stats.activeCount}</p>
                            <span className="text-xs text-slate-500 font-medium font-inter">
                                {language === 'ar' ? 'قيد الانتظار' : 'En cours'}
                            </span>
                        </div>
                    </div>

                    {/* Success Count Card */}
                    <div className="group bg-[#1E293B] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-slate-700/50 hover:border-slate-600">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-jakarta">
                            {language === 'ar' ? 'تم الدفع' : 'Payés'}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <p className="text-3xl font-bold text-white font-jakarta tracking-tight">{stats.paidCount}</p>
                            <span className="text-xs text-slate-500 font-medium font-inter">
                                {language === 'ar' ? 'فواتير مدفوعة' : 'Factures payées'}
                            </span>
                        </div>
                    </div>
                </div>
                {/* ════════════════════════════════════════
                    ⭐ UPCOMING CALENDAR WIDGET
                ═══════════════════════════════════════ */}
                <UpcomingEventsWidget language={language} />


                {/* Recent Activity / Quotes Table */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-700/50 flex flex-col xl:flex-row justify-between items-center gap-4 bg-[#1E293B]">
                        <h2 className="text-lg font-bold text-white font-jakarta">{language === 'ar' ? 'آخر المعاملات' : 'Dernières transactions'}</h2>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                            {/* Search Input */}
                            <div className="relative w-full sm:w-64 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#10B981] transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={language === 'ar' ? 'بحث عن زبون أو مشروع...' : 'Rechercher un client ou un projet...'}
                                    className="w-full h-9 pl-9 pr-3 text-sm bg-[#0F172A] border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
                                />
                            </div>

                            {/* Status Filter Buttons */}
                            <div className="flex items-center gap-1 bg-[#0F172A] p-1 rounded-lg border border-slate-700/50 w-full sm:w-auto justify-center sm:justify-start overflow-x-auto">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                                        statusFilter === 'all'
                                            ? "bg-slate-700 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                    )}
                                >
                                    {language === 'ar' ? 'الكل' : 'Tous'}
                                </button>
                                <button
                                    onClick={() => setStatusFilter('sent')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                                        statusFilter === 'sent'
                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm"
                                            : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                    )}
                                >
                                    {language === 'ar' ? 'تم الإرسال' : 'Envoyés'}
                                </button>
                                <button
                                    onClick={() => setStatusFilter('accepted')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                                        statusFilter === 'accepted'
                                            ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 shadow-sm"
                                            : "text-slate-400 hover:text-[#10B981] hover:bg-[#10B981]/10"
                                    )}
                                >
                                    {language === 'ar' ? 'مقبول' : 'Acceptés'}
                                </button>
                                <button
                                    onClick={() => setStatusFilter('cancelled')}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap",
                                        statusFilter === 'cancelled'
                                            ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm"
                                            : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                    )}
                                >
                                    {language === 'ar' ? 'ملغى' : 'Annulés'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {quotes.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-600 opacity-50" />
                            <p className="text-base font-medium font-jakarta">{language === 'ar' ? 'لا توجد معاملات' : 'Aucune transaction'}</p>
                            <p className="text-sm mt-1 mb-6 text-slate-600 font-inter">{language === 'ar' ? 'أنشئ عرض سعر جديد للبدء.' : 'Créez un nouveau devis pour commencer.'}</p>
                            <Link href="/quotes/new">
                                <Button variant="outline" className="border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 font-inter">
                                    {language === 'ar' ? 'إنشاء عرض سعر' : 'Créer un devis'}
                                </Button>
                            </Link>
                        </div>
                    ) : filteredQuotes.length === 0 ? (
                        <div className="p-16 text-center text-slate-500">
                            <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-600 opacity-50" />
                            <p className="text-base font-medium font-jakarta">
                                {language === 'ar' ? 'لا توجد نتائج لبحثك.' : 'Aucun résultat trouvé pour votre recherche.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="text-slate-500 font-semibold text-xs uppercase bg-[#1E293B] border-b border-slate-700/50 font-jakarta tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">{language === 'ar' ? 'رقم الدوفي' : 'N° Devis'}</th>
                                        <th className="px-6 py-4">{language === 'ar' ? 'الزبون' : 'Client'}</th>
                                        <th className="px-6 py-4">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                                        <th className="px-6 py-4 text-right">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                                        <th className="px-6 py-4 text-center">{language === 'ar' ? 'الحالة' : 'Statut'}</th>
                                        <th className="px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 text-slate-300 font-inter">
                                    {filteredQuotes.slice().reverse().map((quote) => (
                                        <tr key={quote.id} className="group hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-white group-hover:text-emerald-400 transition-colors font-jakarta">
                                                {quote.number}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                {quote.clientName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs">
                                                {quote.date}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white text-right font-jakarta tracking-tight">
                                                {quote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500 font-normal">DH</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="relative inline-block">
                                                    <StatusBadge status={quote.status} invoiceId={quote.id} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-full">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Upgrade Modal */}
                {isUpgradeModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-6 text-center space-y-6">
                                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
                                    <Crown className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-readex">
                                        {language === 'ar' ? 'لقد استنفدت الدوفيات المجانية' : 'Free Quota Exceeded'}
                                    </h3>
                                    <p className="text-slate-400 font-readex text-lg leading-relaxed">
                                        {language === 'ar' ? 'اشترك الآن للاستفادة من عدد غير محدود' : 'Upgrade now to unlock unlimited quotes and premium features.'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg rounded-lg shadow-lg font-readex"
                                        onClick={() => window.open('https://maalempro.com/upgrade', '_blank')} // Placeholder link
                                    >
                                        {language === 'ar' ? 'اشترك الآن' : 'Upgrade Now'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-500 hover:text-white"
                                        onClick={() => setIsUpgradeModalOpen(false)}
                                    >
                                        {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
