'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { Plus, Trash, User, Building, Calculator, Save, ArrowLeft, Crown, X, Eye, Maximize2, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, MessageCircle, Calendar, Hash, ShieldCheck, Lock } from 'lucide-react';
import { Quote } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { generateQuotePDF } from '@/lib/pdfGenerator';
import { Download } from 'lucide-react';

const SignatureCanvasComponent = dynamic(() => import('@/components/SignatureCanvasComponent'), {
    loading: () => <p className="text-center p-4 text-slate-400">Chargement de la zone de signature...</p>,
    ssr: false
});

interface QuoteItemInput {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
}

const UNIT_OPTIONS = [
    { value: 'ensemble', label: 'Ensemble (جملة)' },
    { value: 'm', label: 'Mètre (متر)' },
    { value: 'm2', label: 'Mètre Carré (متر مربع)' },
    { value: 'jour', label: 'Jour (يوم)' },
    { value: 'piece', label: 'Pièce (قطعة)' },
    { value: 'heure', label: 'Heure (ساعة)' },
];

export default function NewQuotePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { t, language } = useLanguage();
    const { clients, services, addQuote, quotes, subscription, setSubscriptionStatus } = useData();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    // Trial Limit Logic
    const FREE_LIMIT = 3;
    const usageCount = quotes.length;
    const isLimitReached = subscription === 'FREE' && usageCount >= FREE_LIMIT;
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    useEffect(() => {
        if (isLimitReached) {
            setIsUpgradeModalOpen(true);
        }
    }, [isLimitReached]);

    // Business Profile State
    const [isBusinessProfileOpen, setIsBusinessProfileOpen] = useState(true);
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const [businessName, setBusinessName] = useState('');
    const [businessPhone, setBusinessPhone] = useState('');
    const [businessEmail, setBusinessEmail] = useState('');
    const [businessAddress, setBusinessAddress] = useState('');
    const [businessCity, setBusinessCity] = useState('');
    const [businessActivity, setBusinessActivity] = useState('');
    const [businessIce, setBusinessIce] = useState('');
    const [businessLogo, setBusinessLogo] = useState<string | null>(null);

    // Client Details
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');

    // Quote Details
    const [quoteNumber, setQuoteNumber] = useState(`Q-${Math.floor(Math.random() * 10000)}`);
    const [quoteDate, setQuoteDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [items, setItems] = useState<QuoteItemInput[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0, unit: 'ensemble' },
    ]);
    const [tvaRate, setTvaRate] = useState(0);

    const [deposit, setDeposit] = useState(0);
    const depositInputRef = useRef<HTMLInputElement>(null);
    const [showDepositAlert, setShowDepositAlert] = useState(false);

    // Preview
    const [showPreviewMobile, setShowPreviewMobile] = useState(false);
    const [showPreviewDesktop, setShowPreviewDesktop] = useState(true);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

    // Signature
    const [signature, setSignature] = useState<string | null>(null);

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tvaAmount = (subtotal * tvaRate) / 100;
    const total = subtotal + tvaAmount;

    const addItem = () => {
        setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, unit: 'ensemble' }]);
    };

    const addServiceItem = (serviceId: string) => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return;
        setItems([...items, {
            id: Date.now().toString(),
            description: service.name,
            quantity: 1,
            unitPrice: service.unitPrice,
            unit: 'ensemble'
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof QuoteItemInput, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                if (field === 'unit' && value === 'ensemble') {
                    return { ...item, [field]: value, quantity: 1 };
                }
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        setSelectedClientId(clientId);
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setClientName(client.name);
            setClientPhone(client.phone);
            setClientAddress(client.address || '');
        } else if (clientId === '') {
            setClientName('');
            setClientPhone('');
            setClientAddress('');
        }
    };

    const getQuoteObject = (): { quote: Quote, profile: any } => {
        const quote: Quote = {
            id: Date.now().toString(),
            number: quoteNumber,
            date: quoteDate,
            clientId: selectedClientId || 'temp-client',
            clientName,
            items,
            subtotal,
            tvaRate,
            tvaAmount,
            total,
            deposit: deposit || 0,
            signature: signature || undefined,
            status: 'draft'
        };

        const profile = {
            name: businessName,
            phone: businessPhone,
            email: businessEmail,
            address: businessAddress,
            city: businessCity,
            activity: businessActivity,
            ice: businessIce,
            logo: businessLogo
        };
        return { quote, profile };
    };

    const processWhatsAppShare = () => {
        const { quote } = getQuoteObject();
        addQuote(quote);
        const maalemName = businessName || (language === 'ar' ? 'Maalem' : 'Votre Maalem');
        const cName = clientName || (language === 'ar' ? 'Cher Client' : 'Cher Client');
        const link = `https://maalempro.com/view/${quote.id}`;
        const message = language === 'ar'
            ? `مرحباً ${cName}، إليك عرض السعر من طرف ${maalemName} عبر معلم برو. يمكنك الاطلاع عليه هنا: ${link}`
            : `Bonjour ${cName}, voici votre devis de la part de ${maalemName} via Maalem Pro. Vous pouvez le consulter ici: ${link}`;
        const whatsappUrl = `https://wa.me/${clientPhone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
    };

    const handleWhatsAppShare = () => {
        if (!clientPhone) {
            alert(language === 'ar' ? "يرجى إضافة رقم هاتف الزبون لإرسال الدوفاي عبر واتساب." : "Veuillez ajouter le numéro de téléphone du client pour envoyer le devis via WhatsApp.");
            return;
        }
        if (isLimitReached) {
            setIsUpgradeModalOpen(true);
            return;
        }
        if (!deposit || deposit === 0) {
            setShowDepositAlert(true);
            return;
        }
        processWhatsAppShare();
    };

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
            setBusinessLogo(p.logo || null);
            if (p.name || p.phone) {
                setIsBusinessProfileOpen(false);
            }
            if (!p.name || !p.phone || !p.address) {
                setShowProfileAlert(true);
                setIsBusinessProfileOpen(true);
            }
        } else {
            setShowProfileAlert(true);
            setIsBusinessProfileOpen(true);
        }
    }, []);

    // LIVE PREVIEW COMPONENT
    const LivePreview = () => (
        <div
            className="bg-white text-black p-8 shadow-2xl rounded-sm min-h-[297mm] w-[210mm] relative font-sans text-xs sm:text-sm mx-auto overflow-hidden text-left"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                <div className="space-y-1">
                    {businessLogo ? (
                        <img src={businessLogo} alt="Logo" className="h-16 object-contain mb-3" />
                    ) : (
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">MAALEM<span className="text-[#10B981]">PRO</span></h1>
                    )}
                    <div className="text-slate-500 space-y-0.5 text-xs">
                        <p className="font-semibold text-slate-900">{businessName || (language === 'ar' ? 'شركتكم' : 'Votre Entreprise')}</p>
                        {businessActivity && <p className="text-slate-600 font-medium">{businessActivity}</p>}
                        <p>{businessPhone || '06 00 00 00 00'}</p>
                        <p>{businessAddress || t('business.address')}{businessCity ? `, ${businessCity}` : ''}</p>
                        <p>ICE: {businessIce || '-'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-4xl font-light text-slate-200 mb-2">{language === 'ar' ? 'عرض سعر' : 'DEVIS'}</h2>
                    <div className="space-y-1 text-slate-600">
                        <p><span className="font-semibold">{t('quote.number')}:</span> {quoteNumber}</p>
                        <p><span className="font-semibold">{t('quote.date')}:</span> {quoteDate}</p>
                    </div>
                </div>
            </div>

            {/* Client Info */}
            <div className="mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('quote.client')}</h3>
                <div className="text-slate-800">
                    <p className="font-bold text-lg">{clientName || (language === 'ar' ? 'إسم الزبون' : 'Nom du Client')}</p>
                    <p>{clientPhone || (language === 'ar' ? 'هاتف الزبون' : 'Tél Client')}</p>
                    <p>{clientAddress || (language === 'ar' ? 'عنوان الزبون' : 'Adresse Client')}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-slate-900 text-white text-left">
                        <th className={`py-3 px-4 font-medium ${language === 'ar' ? 'text-right rounded-r-md' : 'text-left rounded-l-md'}`}>{language === 'ar' ? 'الوصف' : 'Service / Article'}</th>
                        <th className="py-3 px-4 font-medium text-center">{language === 'ar' ? 'الكمية' : 'Quantité'}</th>
                        <th className="py-3 px-4 font-medium text-center">{language === 'ar' ? 'السعر' : 'Prix Unitaire'}</th>
                        <th className={`py-3 px-4 font-medium ${language === 'ar' ? 'text-left rounded-l-md' : 'text-right rounded-r-md'}`}>{language === 'ar' ? 'المجموع' : 'Total HT'}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="py-3 px-4 text-slate-700 font-medium">
                                {item.description || (language === 'ar' ? 'الوصف...' : 'Description...')}
                                {item.unit !== 'ensemble' && <span className="text-xs text-slate-400 block">{item.unit}</span>}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600">{item.unit === 'ensemble' ? '-' : item.quantity}</td>
                            <td className="py-3 px-4 text-center text-slate-600">{item.unitPrice.toFixed(2)}</td>
                            <td className={`py-3 px-4 font-bold text-slate-800 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className={`flex ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-slate-500 py-1 border-b border-slate-100">
                        <span>{language === 'ar' ? 'المجموع الخام' : 'Total HT'}</span>
                        <span>{subtotal.toFixed(2)}</span>
                    </div>
                    {tvaRate > 0 && (
                        <div className="flex justify-between text-slate-500 py-1 border-b border-slate-100">
                            <span>{language === 'ar' ? `الضريبة (${tvaRate}%)` : `TVA (${tvaRate}%)`}</span>
                            <span>{tvaAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-slate-800 font-bold text-lg py-2">
                        <span>{language === 'ar' ? 'المجموع' : 'Total TTC'}</span>
                        <span>{total.toFixed(2)} DH</span>
                    </div>
                    {deposit > 0 && (
                        <div className="flex justify-between text-amber-600 font-medium text-sm py-1 bg-amber-50 px-2 rounded">
                            <span>{language === 'ar' ? 'تسبقة' : 'Avance'}</span>
                            <span>- {deposit.toFixed(2)} DH</span>
                        </div>
                    )}
                    <div className="flex justify-between text-[#10B981] font-bold text-xl pt-2 border-t-2 border-[#10B981] mt-2">
                        <span>{language === 'ar' ? 'الباقي' : 'Reste à payer'}</span>
                        <span>{(total - deposit).toFixed(2)} DH</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 left-8 right-8 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                <p>{language === 'ar' ? 'شكرا لثقتكم. تم الإنشاء بواسطة MaalemPro.' : 'Merci de votre confiance. Document généré par MaalemPro.'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 pb-20">
            {/* Full Screen Preview Modal */}
            {isFullscreenPreview && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md overflow-hidden w-screen h-screen flex flex-col">
                    <div className="flex justify-between items-center p-4 bg-slate-900/80 border-b border-slate-800 z-10">
                        <Button
                            onClick={() => {
                                const { quote, profile } = getQuoteObject();
                                generateQuotePDF(quote, profile);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg gap-2 font-bold"
                        >
                            <Download className="w-4 h-4" />
                            Télécharger PDF
                        </Button>
                        <Button
                            onClick={() => setIsFullscreenPreview(false)}
                            className="bg-white text-black hover:bg-slate-200 rounded-full shadow-xl"
                            size="icon"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col items-center">
                        <div
                            className="shadow-2xl bg-white my-4 transition-transform duration-300"
                            style={{
                                width: '100%',
                                maxWidth: '210mm',
                                touchAction: 'pan-y'
                            }}
                        >
                            <LivePreview />
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8 h-screen-minus-header">
                {/* Top Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-white tracking-tight font-jakarta hidden sm:block">{t('nav.new_quote')}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowPreviewMobile(!showPreviewMobile)}
                            variant="outline"
                            className="lg:hidden border-slate-700 text-slate-300 hover:text-white"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreviewMobile ? 'Éditer' : 'Aperçu'}
                        </Button>
                        <Button
                            onClick={() => setShowPreviewDesktop(!showPreviewDesktop)}
                            variant="outline"
                            className={cn(
                                "hidden lg:flex border-slate-700 text-slate-300 hover:text-white transition-colors",
                                showPreviewDesktop && "bg-slate-800 text-white border-slate-600"
                            )}
                            title={showPreviewDesktop ? "Masquer l'aperçu" : "Afficher l'aperçu"}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showPreviewDesktop ? 'Masquer' : 'Aperçu'}
                        </Button>
                        <Link href="/dashboard" className="hidden sm:block">
                            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 gap-2 font-inter">
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Annuler</span>
                            </Button>
                        </Link>
                        <Button onClick={handleWhatsAppShare} className="gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/20 border-0 font-jakarta">
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{language === 'ar' ? 'إرسال عبر واتساب' : 'Envoyer via WhatsApp'}</span>
                        </Button>
                    </div>
                </div>

                {/* Cyber Mint Usage Banner (Subscription) */}
                <div className="mb-8 bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.06)] animate-in fade-in slide-in-from-top-4 duration-700">
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-4 h-9 text-xs transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {language === 'ar' ? 'ترقية' : 'Upgrade'}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row-reverse gap-8 relative items-start">

                    {/* LIVE PREVIEW (STICKY SIDEBAR) */}
                    <div className={cn(
                        "hidden lg:block sticky top-8 h-[calc(100vh-4rem)] transition-all duration-500 ease-in-out bg-slate-900/50 rounded-xl border border-slate-800 backdrop-blur-sm overflow-hidden",
                        showPreviewDesktop ? "w-[450px] opacity-100 p-6" : "w-0 opacity-0 p-0 border-0"
                    )}>
                        <div className="flex justify-between items-center mb-6 min-w-[300px]">
                            <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Aperçu
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsFullscreenPreview(true)} className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                                    <Maximize2 className="w-3 h-3 mr-1" />
                                    Full
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowPreviewDesktop(false)} className="h-7 px-2 text-xs text-slate-400 hover:text-white">
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="w-full h-full overflow-auto flex justify-center pt-0">
                            <div className="shadow-2xl min-h-[297mm] w-full max-w-[210mm] bg-white transition-all duration-300">
                                <LivePreview />
                            </div>
                        </div>
                    </div>

                    {/* MAIN FORM */}
                    <div className={cn(
                        "flex-1 space-y-6 transition-all duration-500 ease-in-out w-full",
                        showPreviewMobile ? "hidden lg:block" : "block"
                    )}>

                        {/* 1. PERSONAL INFO (BUSINESS PROFILE) */}
                        <div className={cn(
                            "bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden transition-all duration-300",
                            showProfileAlert && "ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                        )}>
                            <button
                                onClick={() => setIsBusinessProfileOpen(!isBusinessProfileOpen)}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-lg transition-colors", isBusinessProfileOpen ? "bg-[#10B981]/10 text-[#10B981]" : "bg-slate-800 text-slate-400")}>
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-inter">
                                            {t('business.profile')}
                                        </h2>
                                        {!isBusinessProfileOpen && (businessName || businessPhone) && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-400 font-inter">
                                                    {businessName && businessName} {businessName && businessPhone && '-'} {businessPhone && businessPhone}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isBusinessProfileOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                            </button>

                            {isBusinessProfileOpen && (
                                <div className="p-5 pt-0 border-t border-slate-700/50 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder={t('business.name')} value={businessName} onChange={e => setBusinessName(e.target.value)} />
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder={t('business.phone')} value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder="Email" value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} />
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder="ICE" value={businessIce} onChange={e => setBusinessIce(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder="Secteur d'activité" value={businessActivity} onChange={e => setBusinessActivity(e.target.value)} />
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder="Ville" value={businessCity} onChange={e => setBusinessCity(e.target.value)} />
                                    </div>
                                    <div>
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] transition-all text-sm font-inter" placeholder={t('business.address')} value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. CLIENT INFO & DETAILS (FULL WIDTH) */}
                        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-inter flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#10B981]" />
                                    {language === 'ar' ? 'الزبون وتفاصيل الدوفاي' : 'Client et Détails'}
                                </h2>
                                <select
                                    className="text-xs bg-[#0F172A] border border-slate-700 text-slate-300 rounded px-3 py-2 outline-none focus:border-[#10B981] min-w-[200px]"
                                    onChange={handleClientSelect}
                                    value={selectedClientId}
                                >
                                    <option value="">-- {t('common.search')} --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Client Fields (Larger Part) */}
                                <div className="md:col-span-8 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">{t('client.name')}</label>
                                            <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none transition-all text-sm" value={clientName} onChange={e => setClientName(e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">{t('client.phone')}</label>
                                            <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none transition-all text-sm" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase tracking-wider">{t('client.address')}</label>
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none transition-all text-sm" value={clientAddress} onChange={e => setClientAddress(e.target.value)} />
                                    </div>
                                </div>

                                {/* Divider for larger screens */}
                                <div className="hidden md:block w-px bg-slate-700/50 absolute top-16 bottom-5 left-[66.666667%]"></div>

                                {/* Details Fields (Smaller Part) */}
                                <div className="md:col-span-4 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Hash className="w-3 h-3" /> N° Devis</label>
                                        <input className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none transition-all text-sm font-mono" value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3 h-3" /> Date</label>
                                        <input type="date" className="w-full h-10 px-3 rounded-md bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none transition-all text-sm" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. ITEMS / SERVICES (TABLE) */}
                        <div className="bg-[#1E293B] rounded-xl border border-slate-700/50 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-700/50 flex justify-between items-center">
                                <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-inter flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-[#10B981]" />
                                    {language === 'ar' ? 'الخدمات / السلعة' : 'Services / Articles'}
                                </h2>
                                <Button size="sm" variant="outline" onClick={addItem} className="h-8 gap-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white text-xs">
                                    <Plus className="w-3 h-3" />
                                    {language === 'ar' ? 'إضافة' : 'Ajouter'}
                                </Button>
                            </div>

                            {/* Desktop Table View (Hidden on mobile) */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#0F172A]/80 text-xs uppercase text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4 w-12 text-center">#</th>
                                            <th className="px-6 py-4 min-w-[300px]">{language === 'ar' ? 'الوصف' : 'Description'}</th>
                                            <th className="px-6 py-4 w-32 text-center">{language === 'ar' ? 'الوحدة' : 'Unité'}</th>
                                            <th className="px-6 py-4 w-24 text-center">{language === 'ar' ? 'الكمية' : 'Qté'}</th>
                                            <th className="px-6 py-4 w-32 text-right">{language === 'ar' ? 'السعر' : 'Prix'}</th>
                                            <th className="px-6 py-4 w-32 text-right">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                                            <th className="px-6 py-4 w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {items.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-4 text-center text-slate-500 text-xs">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#10B981] outline-none text-sm text-white placeholder-slate-600 focus:ring-0 px-0 py-1 transition-all"
                                                        placeholder={language === 'ar' ? 'وصف الخدمة...' : 'Description...'}
                                                        value={item.description}
                                                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="w-full bg-transparent text-xs text-slate-300 outline-none cursor-pointer focus:text-[#10B981]"
                                                        value={item.unit}
                                                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                    >
                                                        {UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1E293B]">{opt.label}</option>)}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type={item.unit === 'ensemble' ? "text" : "number"}
                                                        className={cn(
                                                            "w-full bg-transparent text-center text-sm text-white outline-none focus:text-[#10B981]",
                                                            item.unit === 'ensemble' && "opacity-50 cursor-not-allowed"
                                                        )}
                                                        value={item.unit === 'ensemble' ? "-" : item.quantity}
                                                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                        disabled={item.unit === 'ensemble'}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent text-right text-sm text-white outline-none focus:text-[#10B981]"
                                                        value={item.unitPrice || ''}
                                                        placeholder="0.00"
                                                        onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-200">
                                                    {(item.quantity * item.unitPrice).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile List View */}
                            <div className="sm:hidden space-y-4 p-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="bg-[#0F172A] p-4 rounded-lg border border-slate-700/50 relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs text-slate-500 font-mono">#{index + 1}</span>
                                            <button onClick={() => removeItem(item.id)} className="text-slate-500 hover:text-red-400">
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <input
                                            className="w-full bg-transparent border-b border-slate-700 focus:border-[#10B981] outline-none text-sm text-white placeholder-slate-600 mb-4 pb-2"
                                            placeholder="Description..."
                                            value={item.description}
                                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-1">Qté</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#1E293B] h-8 rounded px-2 text-sm text-center text-white outline-none focus:border-[#10B981] border border-transparent"
                                                    value={item.quantity}
                                                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                    disabled={item.unit === 'ensemble'}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-1">Prix</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[#1E293B] h-8 rounded px-2 text-sm text-center text-white outline-none focus:border-[#10B981] border border-transparent"
                                                    value={item.unitPrice}
                                                    onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 block mb-1">Total</label>
                                                <div className="h-8 flex items-center justify-end text-sm font-bold text-white">
                                                    {(item.quantity * item.unitPrice).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals Section */}
                            <div className="bg-[#0F172A]/30 p-6 border-t border-slate-700/50">
                                <div className="flex flex-col sm:flex-row justify-end items-end gap-6">
                                    {/* Settings (TVA, Deposit) */}
                                    <div className="flex flex-wrap gap-4 items-center justify-end sm:border-r border-slate-700/50 sm:pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">TVA (%)</span>
                                            <div className="relative group">
                                                <button className={cn("h-8 w-16 bg-[#0F172A] border rounded text-xs font-bold transition-all flex items-center justify-center gap-1", tvaRate > 0 ? "border-[#10B981] text-[#10B981]" : "border-slate-700 text-slate-400")}>
                                                    {tvaRate}% <ChevronDown className="w-3 h-3" />
                                                </button>
                                                <div className="absolute bottom-full left-0 mb-1 w-full bg-[#1E293B] border border-slate-700 rounded overflow-hidden hidden group-hover:block z-20">
                                                    {[0, 10, 20].map(r => (
                                                        <div key={r} onClick={() => setTvaRate(r)} className="p-2 text-xs text-center hover:bg-slate-700 cursor-pointer text-white">{r}%</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">{language === 'ar' ? 'عربون' : 'Avance'}</span>
                                            <div className="relative">
                                                <input
                                                    ref={depositInputRef}
                                                    type="number"
                                                    className="w-24 h-8 bg-[#0F172A] border border-slate-700 rounded text-center text-white font-bold text-sm focus:border-amber-500 focus:outline-none"
                                                    value={deposit}
                                                    onChange={e => setDeposit(Number(e.target.value))}
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">DH</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Final Numbers */}
                                    <div className="w-full sm:w-64 space-y-3">
                                        <div className="flex justify-between text-sm text-slate-400">
                                            <span>Total HT</span>
                                            <span>{subtotal.toFixed(2)} DH</span>
                                        </div>
                                        {tvaRate > 0 && (
                                            <div className="flex justify-between text-sm text-slate-400">
                                                <span>TVA ({tvaRate}%)</span>
                                                <span className="text-[#10B981]">+ {tvaAmount.toFixed(2)} DH</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                                            <span className="text-lg font-bold text-white">Total TTC</span>
                                            <span className="text-xl font-bold text-[#10B981]">{total.toFixed(2)} <span className="text-sm font-normal text-slate-500">DH</span></span>
                                        </div>
                                        {deposit > 0 && (
                                            <div className="flex justify-between text-sm text-amber-500 font-medium">
                                                <span>Restant dû</span>
                                                <span>{(total - deposit).toFixed(2)} DH</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Mobile Preview Modal */}
                {showPreviewMobile && (
                    <div className="fixed inset-0 z-50 bg-[#0F172A] w-screen h-screen overflow-hidden lg:hidden flex flex-col">
                        <div className="flex justify-between items-center p-4 bg-[#1E293B] border-b border-slate-800 z-10">
                            <Button
                                onClick={() => {
                                    const { quote, profile } = getQuoteObject();
                                    generateQuotePDF(quote, profile);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg gap-2 font-bold"
                            >
                                <Download className="w-4 h-4" />
                                Télécharger PDF
                            </Button>
                            <Button onClick={() => setShowPreviewMobile(false)} variant="ghost" size="icon">
                                <X className="w-6 h-6 text-white" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 flex flex-col items-center">
                            <div
                                className="shadow-2xl bg-white my-4 transition-transform duration-300"
                                style={{
                                    width: '100%',
                                    maxWidth: '210mm',
                                    touchAction: 'pan-y'
                                }}
                            >
                                <LivePreview />
                            </div>
                        </div>
                    </div>
                )}

                {/* Deposit Alert Modal */}
                {showDepositAlert && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#1E293B] border border-amber-500/30 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-300">
                            <div className="p-6 text-center space-y-6">
                                <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2 font-readex">
                                        {language === 'ar' ? 'تنبيه: لم يتم تسجيل العربون' : 'Attention : Aucune avance'}
                                    </h3>
                                    <p className="text-slate-400 font-readex text-lg leading-relaxed">
                                        {language === 'ar'
                                            ? 'واش خديتي العربون؟ ما تنساش تقيدو باش ينقص من الحساب الإجمالي.'
                                            : 'Avez-vous reçu une avance ? N\'oubliez pas de l\'ajouter pour déduire du montant total.'}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 text-lg rounded-lg shadow-lg font-readex"
                                        onClick={() => {
                                            setShowDepositAlert(false);
                                            depositInputRef.current?.focus();
                                        }}
                                    >
                                        {language === 'ar' ? 'إضافة عربون' : 'Ajouter une avance'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-slate-500 hover:text-white"
                                        onClick={() => {
                                            setShowDepositAlert(false);
                                            processWhatsAppShare();
                                        }}
                                    >
                                        {language === 'ar' ? 'متابعة بدون عربون' : 'Continuer sans avance'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Upgrade Modal */}
                {isUpgradeModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#1E293B] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-300">
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
                                        onClick={() => window.open('https://maalempro.com/upgrade', '_blank')}
                                    >
                                        {language === 'ar' ? 'اشترك الآن' : 'Upgrade Now'}
                                    </Button>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-lg shadow-lg font-readex mt-2"
                                        onClick={() => {
                                            setSubscriptionStatus('PRO');
                                            setIsUpgradeModalOpen(false);
                                            alert("Subscription Upgraded to PRO (Simulated)");
                                        }}
                                    >
                                        {language === 'ar' ? 'تفعيل النسخة الاحترافية (تجريبي)' : 'Activate PRO (Dev Sim)'}
                                    </Button>
                                    <Link href="/dashboard" className="w-full">
                                        <Button
                                            variant="ghost"
                                            className="w-full text-slate-500 hover:text-white"
                                        >
                                            {language === 'ar' ? 'الرجوع للرئيسية' : 'Back to Dashboard'}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
