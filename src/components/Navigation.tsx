'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '@/components/Logo';
import { LayoutDashboard, Users, FileText, Settings, Menu, X, Globe, Wallet, CreditCard, Share2, ShoppingCart, CalendarDays, LogOut } from 'lucide-react';
import { DigitalCardModal } from './DigitalCardModal';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export function Navigation() {
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();
    const { isSyncing } = useData();
    const { signOut, user, profile } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = React.useState(false);

    const isAuthenticated = !!user;
    const userName = profile?.business_name || user?.user_metadata?.full_name || '';

    const handleLogout = async () => {
        await signOut();
    };

    if (pathname?.startsWith('/login')) return null;

    const toggleLanguage = () => {
        setLanguage(language === 'fr' ? 'ar' : 'fr');
    };

    const isLandingPage = pathname === '/';

    const navItems = isLandingPage ? [] : [
        { label: language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { label: language === 'ar' ? 'فواتير / دوفيات' : 'Factures / Devis', href: '/quotes/new', icon: FileText },
        { label: language === 'ar' ? 'المواعيد' : 'Calendrier', href: '/calendar', icon: CalendarDays },
        { label: language === 'ar' ? 'قائمة السلعة' : 'Liste Matériaux', href: '/dashboard/shopping-list', icon: ShoppingCart },
        { label: language === 'ar' ? 'الزبناء' : 'Clients', href: '/clients', icon: Users },
        { label: language === 'ar' ? 'الإعدادات' : 'Paramètres', href: '/settings', icon: Settings },
    ];

    return (
        <>
            {/* Only mount DigitalCardModal when open — prevents its overlay from ever rendering while closed */}
            {isCardModalOpen && (
                <DigitalCardModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />
            )}
            <nav className="bg-[#020617]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 h-20">

                {/* FULL WIDTH Container with specified padding */}
                <div className="w-full h-full px-6 lg:px-8">
                    <div className="flex justify-between items-center h-full">

                        {/* LEFT: Logo - Scaled Up for Maximum Size without affecting Navbar Height */}
                        <Link href="/" className="flex-shrink-0 flex items-center relative z-50 mx-4">
                            <img
                                src="/logo.png"
                                alt="MaalemPro Logo"
                                className="h-20 w-auto object-contain scale-[2.0] origin-left rtl:origin-right drop-shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.querySelector('.fallback-logo')?.classList.remove('hidden');
                                }}
                            />
                            <div className="fallback-logo hidden">
                                <Logo iconClassName="h-16 w-16" textClassName={`text-3xl font-bold tracking-tight ${language === 'ar' ? 'font-cairo' : 'font-sans'} flex items-center gap-1`} />
                            </div>
                        </Link>

                        {/* RIGHT: Desktop Navigation - Far Right */}
                        <div className="hidden md:flex md:items-center md:gap-6 rtl:gap-6">
                            {isAuthenticated && !isLandingPage && (
                                <button
                                    onClick={() => setIsCardModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-[#10B981]/50 transition-all shadow-lg hover:shadow-[#10B981]/10 group"
                                >
                                    <div className="p-1 bg-[#10B981]/10 rounded-full group-hover:bg-[#10B981] group-hover:text-[#0F172A] transition-colors">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                                        {language === 'ar' ? 'بطاقتي الرقمية' : 'Ma Carte Visite'}
                                    </span>
                                </button>
                            )}

                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-[#10B981] transition-colors duration-200"
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className={language === 'ar' ? 'font-cairo' : 'font-sans'}>{item.label}</span>
                                </Link>
                            ))}

                            {/* Language Switcher */}
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-xs font-bold border border-white/5"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{language.toUpperCase()}</span>
                            </button>

                            {/* Auth Buttons */}
                            {isAuthenticated ? (
                                isLandingPage ? (
                                    <Link href="/dashboard" className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0F172A] font-bold text-sm transition-all shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:-translate-y-0.5 flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" />
                                        {language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord'}
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all border border-slate-700"
                                        >
                                            {language === 'ar' ? 'خروج' : 'Déconnexion'}
                                        </button>
                                    </div>
                                )
                            ) : (
                                <Link href="/login" className="px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0F172A] font-bold text-sm transition-all shadow-lg shadow-[#10B981]/20 hover:shadow-[#10B981]/30 hover:-translate-y-0.5">
                                    {language === 'ar' ? 'تسجيل الدخول' : 'Connexion'}
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button - Far Right on Mobile */}
                        <div className="flex md:hidden items-center gap-4">
                            <button
                                onClick={toggleLanguage}
                                className="p-2 text-slate-300 hover:text-white"
                            >
                                <span className="text-xs font-bold">{language === 'fr' ? 'AR' : 'FR'}</span>
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-slate-300 hover:text-white focus:outline-none"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-[#020617] border-t border-white/5 absolute w-full shadow-2xl" style={{ zIndex: 9999 }}>
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {isAuthenticated && !isLandingPage && (
                                <button
                                    onClick={() => {
                                        setIsCardModalOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:text-[#10B981] hover:bg-white/5 transition-colors text-left"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    <span className={`text-base font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                                        {language === 'ar' ? 'بطاقتي الرقمية' : 'Ma Carte Visite'}
                                    </span>
                                </button>
                            )}

                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-300 hover:text-[#10B981] hover:bg-white/5 transition-colors"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className={`text-base font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            ))}

                            {isAuthenticated && !isLandingPage && (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-left font-bold border-t border-white/5 mt-2 pt-4"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className={language === 'ar' ? 'font-cairo' : 'font-sans'}>
                                        {language === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
