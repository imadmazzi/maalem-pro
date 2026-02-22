"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    direction: 'ltr' | 'rtl';
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    fr: {
        'app.title': 'MaalemPro',
        'nav.dashboard': 'Tableau de bord',
        'nav.new_quote': 'Nouveau Devis',
        'nav.clients': 'Clients',
        'nav.settings': 'Paramètres',
        'actions.create': 'Créer',
        'actions.cancel': 'Annuler',
        'actions.save': 'Enregistrer',
        'actions.download': 'Télécharger PDF',
        'quote.client': 'Client',
        'quote.details': 'Détails du Devis',
        'quote.items': 'Articles',
        'quote.total': 'Total',
        'status.paid': 'Payé',
        'status.unpaid': 'Impayé',
        'status.draft': 'Brouillon',
        'home.welcome': 'Bienvenue sur MaalemPro',
        'home.subtitle': 'Gérez vos devis simplement.',
        'business.profile': 'Votre Profil',
        'business.name': 'Nom complet / Nom commercial',
        'business.phone': 'Numéro de téléphone',
        'business.ice': 'CIN / N° Auto-Entrepreneur (Optionnel)',
        'business.email': 'Email (Optionnel)',
        'business.address': 'Ville / Secteur d\'activité',
        'client.name': 'Nom du Client',
        'client.phone': 'Tél Client',
        'client.address': 'Adresse Chantier',
        'quote.number': 'N° Devis',
        'quote.date': 'Date',
        'quote.description': 'Description des travaux',
        'quote.qty': 'Qté',
        'quote.price': 'Prix U.',
        'quote.add_item': 'Ajouter Tâche',
        'nav.services': 'Mes Services',
        'services.title': 'Liste des Prestations',
        'services.add': 'Ajouter Prestation',
        'services.name': 'Type de service',
        'services.price': 'Prix standard',
        'services.unit': 'Unité (m2, jour...)',
        'clients.list': 'Mes Clients',
        'clients.add': 'Nouveau Client',
        'common.edit': 'Modifier',
        'common.delete': 'Supprimer',
        'common.actions': 'Actions',
        'common.search': 'Chercher...',
        'common.save': 'Enregistrer',
        'common.details': 'Détails',
        'nav.company_settings': 'Mon Profil Pro',
        'settings.title': 'Mon Profil Professionnel',
        'settings.subtitle': 'Ces informations apparaîtront en haut de vos devis.',
        'settings.logo': 'Photo de profil / Logo',
        'settings.upload_logo': 'Changer la photo',
        'settings.save_success': 'Profil mis à jour !',
        'settings.contact_info': 'Mes Coordonnées',
        'settings.legal_info': 'Identifiants (Pour la confiance)',
    },
    ar: {
        'app.title': 'MaalemPro',
        'nav.dashboard': 'لوحة القيادة',
        'nav.dashboard_ar': 'لوحة القيادة',
        'nav.new_quote': 'فاتورة جديدة',
        'nav.clients': 'زبائني',
        'nav.settings': 'الإعدادات',
        'actions.create': 'إنجاز',
        'actions.cancel': 'إلغاء',
        'actions.save': 'حفظ',
        'actions.download': 'تحميل PDF',
        'quote.client': 'الزبون',
        'quote.details': 'تفاصيل العمل',
        'quote.items': 'الخدمات / السلعة',
        'quote.total': 'المجموع',
        'status.paid': 'خالص',
        'status.unpaid': 'مزال ما تخلص',
        'status.draft': 'مسودة',
        'home.welcome': 'مرحبا يا معلم',
        'home.subtitle': 'صوب دوفياتك بكل سهولة وتعرف فين واصل.',
        'business.profile': 'معلوماتك الشخصية',
        'business.name': 'الإسم الكامل / التجاري',
        'business.phone': 'رقم الهاتف',
        'business.ice': 'رقم البطاقة (CIN) / المقاول الذاتي',
        'business.email': 'البريد الإلكتروني (اختياري)',
        'business.address': 'المدينة / منطقة العمل',
        'client.name': 'إسم الزبون',
        'client.phone': 'هاتف الزبون',
        'client.address': 'عنوان الورش',
        'quote.number': 'رقم الدوفي',
        'quote.date': 'التاريخ',
        'quote.description': 'وصف العمل',
        'quote.qty': 'الكمية',
        'quote.price': 'الثمن',
        'quote.add_item': 'زيد خدمة',
        'nav.services': 'خدماتي',
        'services.title': 'لائحة الخدمات دياولي',
        'services.add': 'زيد خدمة جديدة',
        'services.name': 'اسم الخدمة',
        'services.price': 'الثمن التقريبي',
        'services.unit': 'الوحدة (متر، يوم...)',
        'clients.list': 'قائمة الزبناء',
        'clients.add': 'زيد زبون',
        'common.edit': 'بدل',
        'common.delete': 'مسح',
        'common.actions': 'إجراءات',
        'common.search': 'قلب...',
        'common.save': 'سجل',
        'common.details': 'تفاصيل',
        'nav.company_settings': 'بروفيلي',
        'settings.title': 'معلواتي المهنية',
        'settings.subtitle': 'هاد المعلومات غاتبان فالدوفيات ديالك للناس.',
        'settings.logo': 'تصويرتي / اللوغو',
        'settings.upload_logo': 'بدل التصويرة',
        'settings.save_success': 'تم التسجيل بنجاح!',
        'settings.contact_info': 'معلومات الإتصال',
        'settings.legal_info': 'معلومات إضافية (للثقة)',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('ar');

    useEffect(() => {
        // Simple persistence
        const saved = localStorage.getItem('language') as Language;
        if (saved) setLanguage(saved);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, direction: language === 'ar' ? 'rtl' : 'ltr', t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
