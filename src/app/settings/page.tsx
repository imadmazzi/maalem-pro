'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Building, Upload, Save, Phone, Mail, MapPin, FileCode, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t, language } = useLanguage();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // State for form fields
    const [businessName, setBusinessName] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [businessCity, setBusinessCity] = useState('');
    const [businessActivity, setBusinessActivity] = useState('');
    const [businessIce, setBusinessIce] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // Save Status State
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Load saved data on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('businessProfile');
        if (savedProfile) {
            const p = JSON.parse(savedProfile);
            setBusinessName(p.name || '');
            setBusinessPhone(p.phone || '');
            setBusinessEmail(p.email || '');
            setBusinessAddress(p.address || '');
            setBusinessCity(p.city || '');
            setBusinessActivity(p.activity || '');
            setBusinessIce(p.ice || '');
            setLogoPreview(p.logo || null);
        }
    }, []);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        setIsSaving(true);

        const profile = {
            name: businessName,
            phone: businessPhone,
            email: businessEmail,
            address: businessAddress,
            city: businessCity,
            activity: businessActivity,
            ice: businessIce,
            logo: logoPreview
        };

        // Simulate network delay for better UX
        setTimeout(() => {
            localStorage.setItem('businessProfile', JSON.stringify(profile));
            setIsSaving(false);
            setShowSuccess(true); // Trigger success animation

            // Hide Toast after 3 seconds
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 pb-20 relative">
            <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white font-jakarta">{t('nav.company_settings')}</h1>
                            <p className="text-slate-400 text-sm mt-1 font-inter">Gérez les informations de votre entreprise visibles sur vos devis.</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "gap-2 text-white shadow-lg border-0 font-jakarta transition-all duration-300",
                            isSaving ? "bg-slate-600 opacity-80" : "bg-[#10B981] hover:bg-[#059669] shadow-[#10B981]/20"
                        )}
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">
                            {isSaving
                                ? (language === 'ar' ? 'جاري الحفظ...' : 'Enregistrement...')
                                : (language === 'ar' ? 'حفظ' : 'Enregistrer')
                            }
                        </span>
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Logo Section */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl shadow-sm border border-slate-700/50 space-y-6">
                        <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700/50 pb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                <Upload className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg font-jakarta">{t('settings.logo')}</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="w-32 h-32 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center bg-[#0F172A] overflow-hidden relative group transition-colors hover:border-[#10B981]/50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <span className="text-slate-500 text-xs text-center p-2 font-inter">Aucun Logo</span>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                                <label className="inline-block">
                                    <span className="sr-only">{t('settings.upload_logo')}</span>
                                    <div className="relative overflow-hidden inline-block">
                                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 hover:bg-white/5 font-inter pointer-events-none">
                                            Télécharger un logo
                                        </Button>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                </label>
                                <p className="mt-3 text-xs text-slate-500 font-inter">Format recommandé : PNG transparent. Taille max : 2Mo.</p>
                                <p className="mt-1 text-xs text-amber-500/80 font-inter">
                                    {language === 'ar'
                                        ? 'تنبيه: إذا لم تقم بتحميل شعارك، فسيتم استخدام شعار Maalem Pro تلقائيًا في فواتيرك.'
                                        : 'Note : Si vous ne téléchargez pas de logo, le logo Maalem Pro sera utilisé par défaut.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* General Info */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl shadow-sm border border-slate-700/50 space-y-6">
                        <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700/50 pb-4">
                            <div className="p-2 bg-[#10B981]/10 rounded-lg text-[#10B981]">
                                <Building className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg font-jakarta">{t('settings.contact_info')}</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">{t('business.name')}</label>
                                <FormInput
                                    value={businessName}
                                    onChange={e => setBusinessName(e.target.value)}
                                    placeholder="Ex: Ahmed Plombier"
                                    icon={<Building className="w-4 h-4" />}
                                />
                            </div>

                            {/* Activity & City Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">Secteur d'activité</label>
                                    <FormInput
                                        value={businessActivity}
                                        onChange={e => setBusinessActivity(e.target.value)}
                                        placeholder="Ex: Plomberie, Electricité..."
                                        icon={<FileCode className="w-4 h-4" />}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">Ville</label>
                                    <FormInput
                                        value={businessCity}
                                        onChange={e => setBusinessCity(e.target.value)}
                                        placeholder="Ex: Casablanca"
                                        icon={<MapPin className="w-4 h-4" />}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">{t('business.phone')}</label>
                                    <FormInput
                                        value={businessPhone}
                                        onChange={e => setBusinessPhone(e.target.value)}
                                        placeholder="06 00 00 00 00"
                                        icon={<Phone className="w-4 h-4" />}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">{t('business.email')}</label>
                                    <FormInput
                                        value={businessEmail}
                                        onChange={e => setBusinessEmail(e.target.value)}
                                        placeholder="email@gmail.com"
                                        icon={<Mail className="w-4 h-4" />}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">{t('business.address')}</label>
                                <FormInput
                                    value={businessAddress}
                                    onChange={e => setBusinessAddress(e.target.value)}
                                    placeholder="Casablanca, Maârif..."
                                    icon={<MapPin className="w-4 h-4" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Legal Info */}
                    <div className="bg-[#1E293B] p-8 rounded-2xl shadow-sm border border-slate-700/50 space-y-6">
                        <div className="flex items-center gap-3 text-slate-300 border-b border-slate-700/50 pb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                <FileCode className="w-5 h-5" />
                            </div>
                            <h2 className="font-semibold text-lg font-jakarta">{t('settings.legal_info')}</h2>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide font-inter">{t('business.ice')}</label>
                            <FormInput
                                value={businessIce}
                                onChange={e => setBusinessIce(e.target.value)}
                                placeholder="CIN: BH123456 / AE: 12345..."
                                icon={<FileCode className="w-4 h-4" />}
                            />
                            <p className="mt-2 text-xs text-slate-500 font-inter">Important pour inspirer confiance (Numéro CIN ou Auto-Entrepreneur).</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Success Toast Notification */}
            {showSuccess && (
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#1E293B] border border-[#10B981]/30 shadow-2xl shadow-[#10B981]/10 rounded-xl px-6 py-4 flex items-center gap-4">
                        <div className="p-2 bg-[#10B981]/10 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold font-jakarta text-sm">
                                {language === 'ar' ? 'تم الحفظ!' : 'Enregistré !'}
                            </h4>
                            <p className="text-slate-400 text-xs font-inter mt-0.5">
                                {language === 'ar' ? 'تم تحديث معلوماتك بنجاح.' : 'Vos informations ont été mises à jour.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styling helper for inputs with icons
function FormInput({ icon, className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
    return (
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-3 text-slate-500 pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                {...props}
                className={cn(
                    "w-full h-11 rounded-lg bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter",
                    icon ? "pl-10" : "px-3",
                    className
                )}
            />
        </div>
    );
}
