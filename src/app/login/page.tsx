'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, Loader2, Zap, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ── Google SVG icon ──────────────────────────────────────
function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGoogle, user, isLoading: authLoading } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [error, setError] = useState('');

    // If already authenticated (Supabase session or localStorage), redirect
    useEffect(() => {
        if (user) { router.push('/dashboard'); return; }
        const auth = localStorage.getItem('isAuthenticated');
        if (auth) router.push('/dashboard');
    }, [user, router]);

    // ── Google sign-in ────────────────────────────────────
    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setError('');
        await signInWithGoogle();
        // Page will redirect to Google — no need to setGoogleLoading(false)
    };

    // ── Email / phone sign-in (existing localStorage logic) ──
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        await new Promise(r => setTimeout(r, 800));

        const registeredUserStr = localStorage.getItem('registeredUser');
        let isAuthenticated = false;

        if (registeredUserStr) {
            const reg = JSON.parse(registeredUserStr);
            if (
                (formData.identifier === reg.email || formData.identifier === reg.phone) &&
                formData.password === reg.password
            ) isAuthenticated = true;
        } else {
            isAuthenticated = true; // demo / first-time
        }

        if (isAuthenticated) {
            localStorage.setItem('isAuthenticated', 'true');
            if (!localStorage.getItem('businessProfile')) {
                localStorage.setItem('businessProfile', JSON.stringify({
                    name: 'Utilisateur Démo',
                    phone: formData.identifier,
                    address: 'Maroc',
                    email: formData.identifier.includes('@') ? formData.identifier : '',
                    category: 'General',
                }));
            }
            setIsLoading(false);
            setShowSuccess(true);
            setTimeout(() => router.push('/dashboard'), 1200);
        } else {
            setIsLoading(false);
            setError('Identifiants incorrects. Essayez de créer un compte.');
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#0F172A] font-cairo text-slate-200 selection:bg-emerald-500/30">

            {/* ── Left panel — branding (desktop) ─────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950 to-blue-900/10" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.04)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                {/* Glow orbs */}
                <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-md px-12 text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                            <Zap className="w-10 h-10 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                        مرحباً بك في{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                            Maalem Pro
                        </span>
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed">
                        المنصة الأولى للحرفيين المحترفين في المغرب.
                        أدر أعمالك، أنشئ الفواتير، وتواصل مع زبنائك بكل سهولة.
                    </p>

                    {/* Feature list */}
                    <div className="mt-10 space-y-3 text-right">
                        {['إنشاء فواتير PDF احترافية في ثوانٍ', 'إدارة زبنائك ومتابعة المدفوعات', 'بطاقة رقمية مع QR كود'].map(f => (
                            <div key={f} className="flex items-center gap-3 justify-end">
                                <span className="text-slate-300 text-sm">{f}</span>
                                <div className="w-5 h-5 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-500/30 shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel — login form ─────────────────────────── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                {/* Mobile glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex justify-center group">
                            <img
                                src="/logo.png"
                                alt="Maalem Pro"
                                className="h-28 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                        <h2 className="text-2xl font-bold text-white mt-4">تسجيل الدخول</h2>
                        <p className="text-slate-400 text-sm mt-1">أدخل معلوماتك للوصول إلى حسابك</p>
                    </div>

                    {/* ── Google Sign-In Button ─────────────────────── */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || authLoading}
                        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-600/60
                                   bg-slate-800/60 hover:bg-slate-700/60 hover:border-slate-500
                                   text-white font-medium text-sm transition-all duration-200
                                   shadow-lg hover:shadow-xl hover:-translate-y-0.5
                                   disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                                   group relative overflow-hidden"
                    >
                        {/* Shimmer */}
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        {googleLoading
                            ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                            : <GoogleIcon />
                        }
                        <span>{googleLoading ? 'جاري التوجيه...' : 'الدخول عبر Google'}</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-700/60" />
                        <span className="text-slate-500 text-xs font-medium tracking-widest uppercase">أو</span>
                        <div className="flex-1 h-px bg-slate-700/60" />
                    </div>

                    {/* ── Email / Phone Form ────────────────────────── */}
                    <form onSubmit={handleLogin} className="space-y-4" dir="rtl">

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Identifier */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 block">
                                البريد الإلكتروني أو الهاتف
                            </label>
                            <div className="relative group">
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <User className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="name@example.com"
                                    value={formData.identifier}
                                    onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                                    required
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                    className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500
                                               focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60
                                               hover:border-slate-600 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
                                <Link href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hover:underline">
                                    نسيت كلمة المرور؟
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <Lock className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    style={{ direction: 'ltr', textAlign: 'left' }}
                                    className="w-full h-12 pr-10 pl-12 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500
                                               focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/60
                                               hover:border-slate-600 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 mt-2 rounded-xl font-bold text-white text-sm transition-all duration-200
                                       bg-gradient-to-r from-emerald-500 to-teal-500
                                       hover:from-emerald-400 hover:to-teal-400
                                       hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)]
                                       shadow-lg shadow-emerald-500/20
                                       disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
                                       flex items-center justify-center gap-2"
                        >
                            {isLoading
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</>
                                : <><Sparkles className="w-4 h-4" /> تسجيل الدخول</>
                            }
                        </button>

                        {/* Register link */}
                        <p className="text-center text-slate-400 text-sm pt-2">
                            ليس لديك حساب؟{' '}
                            <Link href="/signup" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
                                إنشاء حساب مجاني
                            </Link>
                        </p>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-slate-600 text-xs mt-8">
                        بالمتابعة أنت توافق على{' '}
                        <Link href="#" className="hover:text-slate-400 underline">شروط الاستخدام</Link>
                        {' '}و{' '}
                        <Link href="#" className="hover:text-slate-400 underline">سياسة الخصوصية</Link>
                    </p>
                </div>
            </div>

            {/* ── Success toast ─────────────────────────────────────── */}
            {showSuccess && (
                <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="bg-slate-800 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] rounded-xl p-4 flex items-center gap-3 min-w-[280px]">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">مرحبا بك من جديد</p>
                            <p className="text-slate-400 text-xs mt-0.5">جاري توجيهك إلى لوحة التحكم...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
