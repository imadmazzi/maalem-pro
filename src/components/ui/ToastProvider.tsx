'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full duration-300",
                            toast.type === 'success' && "bg-[#1E293B] border-[#10B981]/30 text-white shadow-[#10B981]/10",
                            toast.type === 'error' && "bg-[#1E293B] border-red-500/30 text-white shadow-red-500/10",
                            toast.type === 'info' && "bg-[#1E293B] border-blue-500/30 text-white shadow-blue-500/10"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-full shrink-0",
                            toast.type === 'success' && "bg-[#10B981]/10 text-[#10B981]",
                            toast.type === 'error' && "bg-red-500/10 text-red-500",
                            toast.type === 'info' && "bg-blue-500/10 text-blue-500"
                        )}>
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <p className="text-sm font-medium pr-8">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
