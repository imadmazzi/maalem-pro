'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2, Phone, MapPin, ChevronRight,
    Loader2, CheckCircle2, Sparkles, User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// ── Category options ──────────────────────────────────────
const CATEGORIES = [
    { value: 'plomberie', label: 'سباك', emoji: '🔧' },
    { value: 'electricite', label: 'كهربائي', emoji: '⚡' },
    { value: 'menuiserie', label: 'نجار', emoji: '🪵' },
    { value: 'peinture', label: 'طلاء', emoji: '🖌️' },
    { value: 'maconnerie', label: 'بناء', emoji: '🧱' },
    { value: 'climatisation', label: 'تكييف', emoji: '❄️' },
    { value: 'carrelage', label: 'بلاط', emoji: '◼️' },
    { value: 'ferronnerie', label: 'حداد', emoji: '⚙️' },
    { value: 'autre', label: 'أخرى', emoji: '🛠️' },
];

// ── Field wrapper ─────────────────────────────────────────
function Field({ label, icon, children }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <span className="text-emerald-400">{icon}</span>
                {label}
            </label>
            {children}
        </div>
    );
}

// ─────────────────────────────────────────────────────────
export default function CompleteProfilePage() {
    const router = useRouter();
    const { user, refreshProfile, profileComplete, isLoading } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        business_name: '',
        phone: '',
        address: '',
        category: 'autre',
    });

    // If profile already complete, skip straight to dashboard
    useEffect(() => {
        if (!isLoading && profileComplete) router.replace('/dashboard');
    }, [profileComplete, router, isLoading]);

    // Pre-fill name from Google metadata
    useEffect(() => {
        if (user?.user_metadata?.full_name) {
            setForm(f => ({ ...f, business_name: f.business_name || user.user_metadata.full_name }));
        }
    }, [user]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── 1. Basic Validation ─────────────────────────────
        if (!form.business_name.trim()) { setError('اسم النشاط التجاري مطلوب'); return; }
        if (!supabase) { setError('خدمة Supabase غير متاحة'); return; }

        setIsSubmitting(true);
        setError('');

        try {
            // ── 2. Get Fresh User ID ───────────────────────────
            const { data: { user: freshUser }, error: userErr } = await supabase.auth.getUser();

            if (userErr || !freshUser) {
                console.error('[CompleteProfile] Auth Check Failed:', userErr);
                setError('جلسة العمل منتهية. يرجى تسجيل الدخول مرة أخرى.');
                setIsSubmitting(false);
                return;
            }

            console.log('[CompleteProfile] Authenticated User:', freshUser.id);

            // ── 3. Prepare Payload ─────────────────────────────
            const payload = {
                id: freshUser.id,
                business_name: form.business_name.trim(),
                phone: form.phone.trim() || null,
                address: form.address.trim() || null,
            };

            console.log('[CompleteProfile] Attempting Upsert with payload:', JSON.stringify(payload, null, 2));

            // ── 4. Execute Upsert ──────────────────────────────
            const { error: upsertErr, status, statusText } = await supabase
                .from('profiles')
                .upsert(payload, { onConflict: 'id' });

            if (upsertErr) {
                console.error('[CompleteProfile] ❌ SUPABASE ERROR:', JSON.stringify(upsertErr, null, 2));
                let hint = upsertErr.message;
                if (status === 403) hint = 'RLS blocking write. Check Supabase Policies.';
                setError(`خطأ: ${hint} (${upsertErr.code || status})`);
                setIsSubmitting(false);
                return;
            }

            // ── 5. Detailed Verification ────────────────────────
            const { data: verifyData, error: verifyErr } = await supabase
                .from('profiles')
                .select('id, business_name')
                .eq('id', freshUser.id)
                .single();

            if (verifyErr || !verifyData) {
                console.error('[CompleteProfile] ⚠️ Verification Failed:', verifyErr);
                setError('تم الإرسال ولكن لم نتمكن من التأكد من الحفظ.');
                setIsSubmitting(false);
                return;
            }

            // ── 6. Sync Context ──────────────────
            await refreshProfile();
            setDone(true);
            setIsSubmitting(false);
            setTimeout(() => router.push('/dashboard'), 1400);

        } catch (err: any) {
            console.error('[CompleteProfile] Unexpected Exception:', err);
            setError(`حدث خطأ غير متوقع: ${err.message || 'Unknown error'}`);
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm font-cairo">تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] font-cairo text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-teal-500/6 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.025)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.12)] mb-4">
                        <User className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">أكمل إعداد حسابك</h1>
                    <p className="text-slate-400 text-sm mt-2">أضف معلومات نشاطك التجاري لتبدأ باستخدام Maalem Pro</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="w-8 h-1.5 rounded-full bg-emerald-500/40" />
                        <div className="w-8 h-1.5 rounded-full bg-emerald-500" />
                        <div className="w-8 h-1.5 rounded-full bg-slate-700" />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.4)]">
                    {done ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center animate-[scale-in_.3s_ease]">
                                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">تم الحفظ بنجاح!</h2>
                            <p className="text-slate-400 text-sm">جاري توجيهك إلى لوحة التحكم...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <Field label="اسم النشاط التجاري *" icon={<Building2 className="w-4 h-4" />}>
                                <div className="relative group">
                                    <Building2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                                    <input
                                        name="business_name"
                                        type="text"
                                        value={form.business_name}
                                        onChange={handleChange}
                                        placeholder="مثال: المعلم محمد للسباكة"
                                        required
                                        className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 hover:border-slate-600 transition-all text-sm"
                                    />
                                </div>
                            </Field>

                            <Field label="نوع الحرفة" icon={<Sparkles className="w-4 h-4" />}>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, category: cat.value })}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all
                                                ${form.category === cat.value
                                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                                }`}
                                        >
                                            <span className="text-lg">{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            <Field label="رقم الهاتف" icon={<Phone className="w-4 h-4" />}>
                                <div className="relative group">
                                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="0600 000 000"
                                        style={{ direction: 'ltr', textAlign: 'left' }}
                                        className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 hover:border-slate-600 transition-all text-sm"
                                    />
                                </div>
                            </Field>

                            <Field label="العنوان" icon={<MapPin className="w-4 h-4" />}>
                                <div className="relative group">
                                    <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                                    <input
                                        name="address"
                                        type="text"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="الدار البيضاء، المغرب"
                                        className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 hover:border-slate-600 transition-all text-sm"
                                    />
                                </div>
                            </Field>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-13 mt-2 flex items-center justify-center gap-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] shadow-lg shadow-emerald-500/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{ height: '52px' }}
                            >
                                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الحفظ...</> : <><span>حفظ والمتابعة</span> <ChevronRight className="w-5 h-5" /></>}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="w-full text-center text-slate-500 hover:text-slate-300 text-xs transition-colors py-1"
                            >
                                تخطي الآن، سأكمل لاحقاً
                            </button>
                        </form>
                    )}
                </div>
                <p className="text-center text-slate-600 text-xs mt-4">معلوماتك محمية وآمنة — يمكنك تعديلها في أي وقت من الإعدادات</p>
            </div>
        </div>
    );
}
