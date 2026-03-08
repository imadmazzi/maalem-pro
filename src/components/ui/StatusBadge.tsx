'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Quote } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle2, ChevronDown, RefreshCcw, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastProvider';

interface StatusBadgeProps {
    status: Quote['status'];
    invoiceId: string;
}

export function StatusBadge({ status, invoiceId }: StatusBadgeProps) {
    const { updateQuote } = useData();
    const { language } = useLanguage();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleStatusChange = async (newStatus: Quote['status']) => {
        if (newStatus === status) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            // Update Context
            updateQuote(invoiceId, { status: newStatus });

            // Show Success Toast
            const message = language === 'ar'
                ? 'تم تحديث حالة الدوفاي بنجاح'
                : 'Statut du devis mis à jour avec succès';

            showToast(message, 'success');
            setIsOpen(false);
        } catch (error) {
            console.error('Failed to update status', error);
            showToast(language === 'ar' ? 'فشل التحديث' : 'Échec de la mise à jour', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (s: Quote['status']) => {
        switch (s) {
            case 'sent': return {
                bg: 'bg-blue-500/10',
                text: 'text-blue-400',
                border: 'border-blue-500/20',
                icon: <RefreshCcw className="w-3 h-3" />,
                label: language === 'ar' ? 'تم الإرسال' : 'Envoyé'
            };
            case 'accepted': return {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-400',
                border: 'border-emerald-500/20',
                icon: <CheckCircle2 className="w-3 h-3" />,
                label: language === 'ar' ? 'مقبول' : 'Accepté'
            };
            case 'cancelled': return {
                bg: 'bg-red-500/10',
                text: 'text-red-400',
                border: 'border-red-500/20',
                icon: <X className="w-3 h-3" />,
                label: language === 'ar' ? 'ملغى' : 'Annulé'
            };
            case 'paid': return {
                bg: 'bg-emerald-500/10',
                text: 'text-emerald-400',
                border: 'border-emerald-500/20',
                icon: <CheckCircle2 className="w-3 h-3" />,
                label: language === 'ar' ? 'تم الدفع' : 'Payé'
            };
            case 'draft': return {
                bg: 'bg-slate-500/10',
                text: 'text-slate-400',
                border: 'border-slate-500/20',
                icon: <AlertCircle className="w-3 h-3" />,
                label: language === 'ar' ? 'مسودة' : 'Brouillon'
            };
            default: return {
                bg: 'bg-slate-500/10',
                text: 'text-slate-400',
                border: 'border-slate-500/20',
                icon: <AlertCircle className="w-3 h-3" />,
                label: s
            };
        }
    };

    const currentConfig = getStatusConfig(status);

    const OPTIONS: Quote['status'][] = ['sent', 'accepted', 'cancelled'];

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#1E293B]",
                    currentConfig.bg,
                    currentConfig.text,
                    currentConfig.border,
                    "hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                disabled={loading}
            >
                {loading ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        {currentConfig.label}
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
                    </>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-[#1E293B] border border-slate-700/50 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in duration-100 origin-top">
                    <div className="p-1 space-y-0.5">
                        {OPTIONS.map((opt) => {
                            const config = getStatusConfig(opt);
                            const isSelected = status === opt;
                            return (
                                <button
                                    key={opt}
                                    onClick={() => handleStatusChange(opt)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
                                        isSelected
                                            ? "bg-slate-800 text-white"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                >
                                    <span className={cn("w-2 h-2 rounded-full", opt === 'sent' ? 'bg-blue-500' : opt === 'accepted' ? 'bg-emerald-500' : 'bg-red-500')} />
                                    {config.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
