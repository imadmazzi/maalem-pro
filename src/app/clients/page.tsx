'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Search, ChevronRight, User } from 'lucide-react';
import { Client } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t, language } = useLanguage();
    const { clients, addClient, updateClient, deleteClient } = useData();
    const { showToast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Client>>({
        name: '',
        phone: '',
        email: '',
        address: '',
        ice: ''
    });

    const handleAudit = (client?: Client) => {
        if (client) {
            setEditingId(client.id);
            setFormData(client);
        } else {
            setEditingId(null); // New client
            setFormData({ name: '', phone: '', email: '', address: '', ice: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name) return;

        if (!editingId) {
            // Add New
            addClient({
                id: Date.now().toString(),
                name: formData.name,
                phone: formData.phone || '',
                email: formData.email,
                address: formData.address,
                ice: formData.ice
            });
            showToast('تمت إضافة الزبون بنجاح ✅', 'success');
        } else {
            // Update Existing
            updateClient(editingId, formData);
            showToast('تم تحديث الزبون ✅', 'success');
        }

        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', phone: '', email: '', address: '', ice: '' });
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-200 font-cairo p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{t('clients.list') || (language === 'ar' ? 'لائحة الزبناء' : 'Liste des Clients')}</h1>
                        <p className="text-slate-400 text-sm mt-1">
                            {language === 'ar' ? 'قم بإدارة زبنائك ومعلوماتهم هنا.' : 'Gérez vos clients et leurs informations ici.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => handleAudit()} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-500/20">
                            <Plus className="w-5 h-5" />
                            <span className="font-bold">{t('clients.add') || (language === 'ar' ? 'إضافة زبون' : 'Ajouter un client')}</span>
                        </Button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">

                    {/* Search Bar */}
                    <div className="p-4 border-b border-slate-700/50 flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <Input
                                placeholder={t('common.search') || (language === 'ar' ? 'بحث...' : 'Rechercher...')}
                                className="pl-10 bg-[#0F172A] border-slate-700 text-slate-200 focus:ring-emerald-500/50 focus:border-emerald-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#0F172A]/50 text-slate-400 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">{t('client.name') || (language === 'ar' ? 'الاسم' : 'Nom')}</th>
                                    <th className="px-6 py-4">{t('client.phone') || (language === 'ar' ? 'الهاتف' : 'Téléphone')}</th>
                                    <th className="px-6 py-4">{t('business.email') || (language === 'ar' ? 'البريد الإلكتروني' : 'Email')}</th>
                                    <th className="px-6 py-4 text-right">{t('common.actions') || (language === 'ar' ? 'إجراءات' : 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 text-slate-300">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="w-8 h-8 opacity-20" />
                                                <p>{language === 'ar' ? 'لا يوجد زبناء حاليا.' : 'Aucun client trouvé.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                            onClick={() => router.push(`/clients/${client.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                        <User className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <span className="font-bold text-white">{client.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-emerald-400">{client.phone}</td>
                                            <td className="px-6 py-4 text-slate-400">{client.email || '-'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end items-center gap-2">
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon"
                                                            onClick={e => { e.stopPropagation(); handleAudit(client); }}
                                                            className="text-blue-400 hover:text-white hover:bg-blue-500/20 h-8 w-8">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            onClick={e => { e.stopPropagation(); deleteClient(client.id); }}
                                                            className="text-red-400 hover:text-white hover:bg-red-500/20 h-8 w-8">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit/Add Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                            <div className="p-6 border-b border-slate-700/50">
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? (language === 'ar' ? 'تعديل زبون' : 'Modifier le client') : (language === 'ar' ? 'إضافة زبون جديد' : 'Ajouter un nouveau client')}
                                </h2>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase">{t('client.name') || 'Nom Complet'}</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Ahmed Benani"
                                        className="bg-[#0F172A] border-slate-700 text-white focus:border-emerald-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase">{t('client.phone') || 'Téléphone'}</label>
                                        <Input
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="06..."
                                            className="bg-[#0F172A] border-slate-700 text-white focus:border-emerald-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
                                        <Input
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="client@example.com"
                                            className="bg-[#0F172A] border-slate-700 text-white focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase">{t('client.address') || 'Adresse'}</label>
                                    <Input
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Casablanca, Maroc..."
                                        className="bg-[#0F172A] border-slate-700 text-white focus:border-emerald-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase">ICE</label>
                                    <Input
                                        value={formData.ice}
                                        onChange={e => setFormData({ ...formData, ice: e.target.value })}
                                        placeholder="Identifiant Commun de l'Entreprise (Optionnel)"
                                        className="bg-[#0F172A] border-slate-700 text-white focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-700/50 flex justify-end gap-3 bg-[#0F172A]/30">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                    {t('actions.cancel') || (language === 'ar' ? 'إلغاء' : 'Annuler')}
                                </Button>
                                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6">
                                    {t('common.save') || (language === 'ar' ? 'حفظ' : 'Enregistrer')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
