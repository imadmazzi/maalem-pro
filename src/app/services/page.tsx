'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Service } from '@/lib/types';

export default function ServicesPage() {
    const { t } = useLanguage();
    const { services, addService, updateService, deleteService } = useData();
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        unitPrice: 0,
        unit: '',
        description: '',
    });

    const handleCreateClick = () => {
        setIsEditing('new');
        setFormData({ name: '', unitPrice: 0, unit: 'u', description: '' });
    };

    const handleEditClick = (service: Service) => {
        setIsEditing(service.id);
        setFormData(service);
    };

    const handleSave = () => {
        if (!formData.name) return;

        if (isEditing === 'new') {
            addService({
                id: Date.now().toString(),
                name: formData.name || 'New Service',
                unitPrice: Number(formData.unitPrice) || 0,
                unit: formData.unit || 'u',
                description: formData.description
            });
        } else if (isEditing) {
            updateService(isEditing, {
                name: formData.name,
                unitPrice: Number(formData.unitPrice),
                unit: formData.unit,
                description: formData.description
            });
        }

        setIsEditing(null);
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">{t('services.title')}</h1>
                <Button onClick={handleCreateClick} className="bg-blue-900 hover:bg-blue-800 text-white gap-2 shadow-md">
                    <Plus className="w-4 h-4" />
                    {t('services.add')}
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder={t('common.search')}
                            className="pl-9 bg-gray-50 border-gray-200"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">{t('services.name')}</th>
                                <th className="px-6 py-4">{t('services.unit')}</th>
                                <th className="px-6 py-4">{t('services.price')} (DH)</th>
                                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="font-semibold text-gray-900">Aucun service enregistré</p>
                                            <p className="text-sm">Ajoutez vos prestations habituelles pour aller plus vite !</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {service.name}
                                            {service.description && <p className="text-xs text-gray-400 font-normal mt-0.5">{service.description}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{service.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-900 font-bold">{service.unitPrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(service)} className="hover:bg-blue-50 hover:text-blue-600">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)} className="hover:bg-red-50 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit/Create Modal (Overlay) */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">
                                {isEditing === 'new' ? t('services.add') : t('common.edit')}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('services.name')}</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Pose Carrelage, Peinture..."
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t('services.price')}</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={formData.unitPrice?.toString()} // Ensure string for input
                                            onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                                            className="font-mono"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs text-gray-400">DH</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">{t('services.unit')}</label>
                                    <Input
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="m2, h, unit..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (optionnel)</label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Détails supplémentaires..."
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                            <Button variant="outline" onClick={() => setIsEditing(null)}>
                                {t('actions.cancel')}
                            </Button>
                            <Button onClick={handleSave} className="bg-blue-900 hover:bg-blue-800 text-white shadow-md">
                                {t('common.save')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
