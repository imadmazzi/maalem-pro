'use client';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <DataProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </DataProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
