'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, Briefcase, Loader2, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { signUp, user, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        category: '',
        phone: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (user && !authLoading) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const { error: signUpError } = await signUp(formData.email, formData.password, {
            full_name: formData.fullName,
            category: formData.category,
            phone: formData.phone
        });

        if (signUpError) {
            setIsLoading(false);
            setError(signUpError.message);
            return;
        }

        setIsLoading(false);
        setShowSuccess(true);
        // After signup, we wait for user to confirm email or if auto-confirm is on, we redirect
        setTimeout(() => {
            router.push('/complete-profile');
        }, 2000);
    };

    const categories = [
        "كهربائي (Electrician)",
        "سباك (Plumber)",
        "نجار (Carpenter)",
        "صباغ (Painter)",
        "بناي (Mason)",
        "جباس (Plasterer)",
        "لحام (Welder)",
        "ألمنيوم (Aluminum)",
        "زلايجي (Tiler)",
        "آخر (Other)"
    ];

    return (
        <div className="min-h-screen w-full flex bg-[#0F172A] font-sans text-slate-200 selection:bg-emerald-500/30">

            {/* Left Side - Hero/Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
                {/* Background Image/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-tl from-emerald-900/20 to-slate-900 z-0"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900/60 to-slate-900 z-0"></div>

                {/* Content Overlay */}
                <div className="relative z-10 max-w-lg px-12">
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                            <Briefcase className="w-8 h-8 text-emerald-400" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold font-cairo text-white mb-6 leading-tight text-right">
                        انضم إلى نخبة <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">الحرفيين المحترفين</span>
                    </h1>

                    <div className="space-y-4 mt-8 text-right">
                        {[
                            "أنشئ فواتير احترافية في ثوانٍ",
                            "نظم مواعيدك وزبنائك بسهولة",
                            "احصل على تقارير مالية دقيقة"
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-end gap-3 text-slate-300 font-cairo">
                                <span>{feature}</span>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                {/* Mobile Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="w-full max-w-md space-y-6 bg-slate-800/30 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 shadow-2xl lg:bg-transparent lg:shadow-none lg:border-none lg:p-0 relative z-10">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <Link href="/" className="inline-flex justify-center mt-12 mb-4 group hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="Maalem Pro Logo" className="h-40 w-auto object-contain group-hover:scale-105 transition-transform" />
                        </Link>
                        <h2 className="text-2xl font-bold text-white font-cairo">إنشاء حساب جديد</h2>
                        <p className="text-slate-400 font-cairo text-sm">ابدأ رحلتك الاحترافية معنا اليوم</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignup} className="space-y-5 mt-8" dir="rtl">

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 font-cairo block text-right">الإسم الكامل</label>
                            <div className="relative group">
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="الإسم والنسب"
                                    className="w-full h-11 pr-10 pl-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-cairo text-right"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Professional Category */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 font-cairo block text-right">التخصص (الحرفة)</label>
                            <div className="relative group">
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <select
                                    className="w-full h-11 pr-10 pl-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-cairo text-right appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="" disabled className="text-slate-500">اختر تخصصك</option>
                                    {categories.map((cat, i) => (
                                        <option key={i} value={cat} className="bg-slate-800 text-white py-2">{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                                    <ArrowRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 font-cairo block text-right">رقم الهاتف</label>
                            <div className="relative group">
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="06 XX XX XX XX"
                                    className="w-full h-11 pr-10 pl-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans text-right dir-ltr placeholder:text-right"
                                    style={{ direction: 'ltr', textAlign: 'right' }}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 font-cairo block text-right">البريد الإلكتروني</label>
                            <div className="relative group">
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full h-11 pr-10 pl-4 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans text-right dir-ltr placeholder:text-right"
                                    style={{ direction: 'ltr', textAlign: 'right' }}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 font-cairo block text-right">كلمة المرور</label>
                            <div className="relative group">
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full h-11 pr-10 pl-12 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans text-right dir-ltr placeholder:text-right"
                                    style={{ direction: 'ltr', textAlign: 'right' }}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                {/* Show/Hide Password Toggle (Left side for RTL inputs) */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
                                >
                                    {showPassword ? <Zap className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
                                    {/* Using icons metaphorically or just text if preferred, but icons work well. Let's use simple text toggle or different icon if needed. Actually Zap/Lock isn't great for eye. Let's import Eye/EyeOff properly or just reuse from Login */}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full h-12 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-md rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center justify-center font-cairo cursor-pointer ${isLoading ? 'opacity-80 cursor-not-allowed transform-none' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                    جاري تسجيل الحساب...
                                </>
                            ) : (
                                "إنشاء حساب"
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-2">
                            <p className="text-slate-400 text-sm font-cairo">
                                لديك حساب بالفعل؟ {' '}
                                <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors">
                                    تسجيل الدخول
                                </Link>
                            </p>
                        </div>

                    </form>
                </div>
            </div>

            {/* Success Popup (Toast) */}
            {showSuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-slate-800 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)] rounded-xl p-4 flex items-center gap-4 min-w-[320px]">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="text-right flex-1">
                            <h4 className="text-white font-bold font-cairo text-sm">تم إنشاء حسابك بنجاح</h4>
                            <p className="text-slate-400 text-xs font-cairo mt-0.5">مرحباً بك! جاري توجيهك...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
