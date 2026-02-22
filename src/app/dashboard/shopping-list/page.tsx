'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import {
    ShoppingCart, Plus, Trash2, CheckSquare, Square,
    Send, ArrowLeft, FolderPlus, ChevronDown, ChevronUp,
    Phone, StickyNote, Pencil, Check, X as XIcon,
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ─────────────────────────────────────────────── */
interface SupplyItem {
    id: string;
    name: string;
    quantity: string;
    notes: string;
    checked: boolean;
}

interface ShoppingList {
    id: string;
    projectName: string;
    clientName: string;
    clientPhone: string;
    /** Optional – set when list was created from a known client */
    clientId?: string;
    createdAt: string;
    items: SupplyItem[];
}

const STORAGE_KEY = 'maalem_shopping_lists';

function load(): ShoppingList[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}
function save(lists: ShoppingList[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

/* ── Inline Edit Panel ──────────────────────────────────── */
interface EditPanelProps {
    list: ShoppingList;
    onSave: (name: string, phone: string) => void;
    onClose: () => void;
    language: string;
}
function EditPanel({ list, onSave, onClose, language }: EditPanelProps) {
    const [name, setName] = useState(list.clientName);
    const [phone, setPhone] = useState(list.clientPhone);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => { nameRef.current?.focus(); }, []);

    const MINT = '#10B981';
    return (
        <div className="border-t border-[#10B981]/30 bg-[#10B981]/5 px-5 py-4 space-y-3
            animate-in fade-in slide-in-from-top-1 duration-150">
            <p className="text-[10px] text-[#10B981] uppercase tracking-wider font-bold">
                {language === 'ar' ? 'تعديل معلومات الزبون' : 'Modifier les infos client'}
            </p>
            <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[140px] space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {language === 'ar' ? 'اسم الزبون' : 'Nom du client'}
                    </label>
                    <input
                        ref={nameRef}
                        className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-[#10B981]/50 text-white
                            focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 text-sm"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSave(name, phone)}
                    />
                </div>
                <div className="w-44 space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {language === 'ar' ? 'رقم WhatsApp' : 'N° WhatsApp'}
                    </label>
                    <input
                        className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-[#10B981]/50 text-white
                            focus:border-[#10B981] focus:outline-none focus:ring-1 focus:ring-[#10B981]/30 text-sm font-mono"
                        placeholder="06XXXXXXXX"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSave(name, phone)}
                    />
                </div>
                <button
                    onClick={() => onSave(name, phone)}
                    className="h-9 px-4 rounded-lg font-bold text-sm flex items-center gap-1.5 flex-shrink-0 transition-colors"
                    style={{ background: MINT, color: '#0F172A' }}
                >
                    <Check className="w-4 h-4" />
                    {language === 'ar' ? 'حفظ' : 'Sauvegarder'}
                </button>
                <button
                    onClick={onClose}
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-white
                        hover:bg-slate-700 transition-colors flex-shrink-0"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function ShoppingListPage() {
    const { language } = useLanguage();
    const { clients, updateClient } = useData();

    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [maalemName, setMaalemName] = useState('Maalem');

    // New-list form
    const [showNewForm, setShowNewForm] = useState(false);
    const [newProject, setNewProject] = useState('');
    const [newClient, setNewClient] = useState('');
    const [newPhone, setNewPhone] = useState('');

    // Add-item form
    const [itemName, setItemName] = useState('');
    const [itemQty, setItemQty] = useState('');
    const [itemNotes, setItemNotes] = useState('');

    useEffect(() => {
        setLists(load());
        try {
            const p = JSON.parse(localStorage.getItem('businessProfile') || '{}');
            setMaalemName(p.name || 'Maalem');
        } catch { /* empty */ }
    }, []);

    const persist = (updated: ShoppingList[]) => {
        setLists(updated);
        save(updated);
    };

    /* ── List CRUD ── */
    const createList = () => {
        if (!newProject.trim()) return;
        // Try to match with an existing client by name
        const matched = clients.find(c =>
            c.name.trim().toLowerCase() === newClient.trim().toLowerCase()
        );
        const list: ShoppingList = {
            id: Date.now().toString(),
            projectName: newProject.trim(),
            clientName: newClient.trim(),
            clientPhone: newPhone.trim(),
            clientId: matched?.id,
            createdAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-MA'),
            items: [],
        };
        persist([list, ...lists]);
        setOpenId(list.id);
        setShowNewForm(false);
        setNewProject(''); setNewClient(''); setNewPhone('');
    };

    const deleteList = (id: string) => {
        if (!confirm(language === 'ar' ? 'حذف هذه القائمة؟' : 'Supprimer cette liste ?')) return;
        persist(lists.filter(l => l.id !== id));
        if (openId === id) setOpenId(null);
        if (editingId === id) setEditingId(null);
    };

    /* ── Client info save — dual sync ── */
    const saveClientInfo = (listId: string, newName: string, newPhone: string) => {
        // 1. Update the shopping list record
        const updated = lists.map(l => l.id === listId
            ? { ...l, clientName: newName, clientPhone: newPhone }
            : l
        );
        persist(updated);

        // 2. If we know which Client record this maps to, sync it
        const list = lists.find(l => l.id === listId);
        if (list?.clientId) {
            updateClient(list.clientId, { name: newName, phone: newPhone });
        } else {
            // Try fuzzy-match by old name as fallback
            const matched = clients.find(c =>
                c.name.trim().toLowerCase() === list?.clientName.trim().toLowerCase()
            );
            if (matched) {
                updateClient(matched.id, { name: newName, phone: newPhone });
                // Also store the resolved clientId for future saves
                persist(updated.map(l => l.id === listId ? { ...l, clientId: matched.id } : l));
            }
        }

        setEditingId(null);
    };

    /* ── Item CRUD ── */
    const addItem = (listId: string) => {
        if (!itemName.trim()) return;
        const item: SupplyItem = {
            id: Date.now().toString(),
            name: itemName.trim(),
            quantity: itemQty.trim() || '1',
            notes: itemNotes.trim(),
            checked: false,
        };
        persist(lists.map(l => l.id === listId ? { ...l, items: [...l.items, item] } : l));
        setItemName(''); setItemQty(''); setItemNotes('');
    };

    const toggleItem = (listId: string, itemId: string) =>
        persist(lists.map(l => l.id === listId
            ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
            : l));

    const deleteItem = (listId: string, itemId: string) =>
        persist(lists.map(l => l.id === listId
            ? { ...l, items: l.items.filter(i => i.id !== itemId) }
            : l));

    /* ── WhatsApp: items + quantities only ── */
    const sendWhatsApp = (list: ShoppingList) => {
        const lines = list.items
            .map(i => `- ${i.name} : ${i.quantity}${i.notes ? ` (${i.notes})` : ''}`)
            .join('\n');
        const msg =
            `قائمة السلعة المطلوبة لمشروع ${list.projectName}:\n` +
            `${lines}\n` +
            `شكراً، ${maalemName}.`;
        const phone = list.clientPhone.replace(/\s+/g, '');
        window.open(
            phone
                ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                : `https://wa.me/?text=${encodeURIComponent(msg)}`,
            '_blank'
        );
    };

    const MINT = '#10B981';

    return (
        <div className="min-h-screen bg-[#0F172A] text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard"
                            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#10B981]" />
                                {language === 'ar' ? 'قوائم السلعة' : 'Listes de Matériaux'}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {language === 'ar'
                                    ? 'قائمة التسوق الخاصة بكل مشروع'
                                    : 'Check-list par projet · cliquez ✏️ pour modifier le client'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowNewForm(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                        style={{ background: `linear-gradient(135deg, ${MINT}, #059669)`, color: '#fff' }}
                    >
                        <FolderPlus className="w-4 h-4" />
                        {language === 'ar' ? 'قائمة جديدة' : 'Nouvelle liste'}
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-4">

                {/* ── New List Form ── */}
                {showNewForm && (
                    <div className="bg-[#1E293B] rounded-xl border border-[#10B981]/30 p-5 space-y-4">
                        <h3 className="text-sm font-bold text-[#10B981] uppercase tracking-wider">
                            {language === 'ar' ? 'إنشاء قائمة جديدة' : 'Créer une nouvelle liste'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider">
                                    {language === 'ar' ? 'اسم المشروع *' : 'Nom du projet *'}
                                </label>
                                <input
                                    className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                    placeholder={language === 'ar' ? 'ترميم الحمام...' : 'Rénovation salle de bain...'}
                                    value={newProject}
                                    onChange={e => setNewProject(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && createList()}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider">
                                    {language === 'ar' ? 'اسم الزبون' : 'Client'}
                                </label>
                                <input
                                    className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                    placeholder={language === 'ar' ? 'محمد...' : 'Mohammed...'}
                                    value={newClient}
                                    onChange={e => setNewClient(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {language === 'ar' ? 'هاتف (للواتساب)' : 'Tél. (WhatsApp)'}
                                </label>
                                <input
                                    className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm font-mono"
                                    placeholder="06XXXXXXXX"
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowNewForm(false)}
                                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                {language === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button onClick={createList}
                                className="px-5 py-2 rounded-lg text-sm font-bold"
                                style={{ background: MINT, color: '#0F172A' }}>
                                {language === 'ar' ? 'إنشاء' : 'Créer'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Empty State ── */}
                {lists.length === 0 && !showNewForm && (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
                            <ShoppingCart className="w-8 h-8 text-[#10B981]" />
                        </div>
                        <p className="text-slate-400 text-sm">
                            {language === 'ar' ? 'لا توجد قوائم بعد' : "Aucune liste pour l'instant"}
                        </p>
                        <button onClick={() => setShowNewForm(true)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold"
                            style={{ background: MINT, color: '#0F172A' }}>
                            {language === 'ar' ? 'إنشاء أول قائمة' : 'Créer ma première liste'}
                        </button>
                    </div>
                )}

                {/* ── Lists ── */}
                {lists.map(list => {
                    const isOpen = openId === list.id;
                    const isEditing = editingId === list.id;
                    const total = list.items.length;
                    const checked = list.items.filter(i => i.checked).length;

                    return (
                        <div key={list.id}
                            className="bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden">

                            {/* ── Accordion Header ── */}
                            <div className="flex items-center gap-2 px-5 py-4">
                                <button
                                    onClick={() => { setOpenId(isOpen ? null : list.id); setEditingId(null); }}
                                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                                >
                                    <div className="flex-1 min-w-0">
                                        {/* Project name */}
                                        <p className="font-bold text-white truncate">{list.projectName}</p>

                                        {/* Client info row */}
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            {list.clientName ? (
                                                <span className="text-xs text-slate-400">{list.clientName}</span>
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">
                                                    {language === 'ar' ? 'بدون زبون' : 'Sans client'}
                                                </span>
                                            )}
                                            {list.clientPhone && (
                                                <span className="text-xs text-slate-600 font-mono">{list.clientPhone}</span>
                                            )}
                                            {total > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                                    style={{ background: 'rgba(16,185,129,0.15)', color: MINT }}>
                                                    {checked}/{total}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isOpen
                                        ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                                </button>

                                {/* ✏️ Edit client info */}
                                <button
                                    onClick={e => { e.stopPropagation(); setEditingId(isEditing ? null : list.id); setOpenId(list.id); }}
                                    title={language === 'ar' ? 'تعديل معلومات الزبون' : 'Modifier le client'}
                                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isEditing
                                            ? 'bg-[#10B981]/20 text-[#10B981]'
                                            : 'text-slate-500 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>

                                {/* WhatsApp send */}
                                <button onClick={() => sendWhatsApp(list)}
                                    title={language === 'ar' ? 'إرسال واتساب' : 'Envoyer WhatsApp'}
                                    className="p-2 rounded-lg hover:bg-[#10B981]/10 text-[#10B981] transition-colors flex-shrink-0">
                                    <Send className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button onClick={() => deleteList(list.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* ── Inline Edit Panel ── */}
                            {isEditing && (
                                <EditPanel
                                    list={list}
                                    language={language}
                                    onSave={(name, phone) => saveClientInfo(list.id, name, phone)}
                                    onClose={() => setEditingId(null)}
                                />
                            )}

                            {/* ── Expanded Body ── */}
                            {isOpen && (
                                <div className="border-t border-slate-700/50 p-5 space-y-4">

                                    {/* Add Item Row */}
                                    <div className="flex flex-wrap gap-2 items-end">
                                        <div className="flex-1 min-w-[130px] space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                {language === 'ar' ? 'اسم المادة' : 'Matériau'}
                                            </label>
                                            <input
                                                className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                placeholder={language === 'ar' ? 'سيمان...' : 'Ciment...'}
                                                value={itemName}
                                                onChange={e => setItemName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                            />
                                        </div>
                                        <div className="w-28 space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                {language === 'ar' ? 'الكمية' : 'Quantité'}
                                            </label>
                                            <input
                                                className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                placeholder="5 sacs"
                                                value={itemQty}
                                                onChange={e => setItemQty(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-[100px] space-y-1">
                                            <label className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                <StickyNote className="w-3 h-3" />
                                                {language === 'ar' ? 'ملاحظة' : 'Note'}
                                            </label>
                                            <input
                                                className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                placeholder={language === 'ar' ? 'ماركة خاصة...' : 'Marque spéciale...'}
                                                value={itemNotes}
                                                onChange={e => setItemNotes(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                            />
                                        </div>
                                        <button onClick={() => addItem(list.id)}
                                            className="h-9 px-4 rounded-lg font-bold text-sm flex items-center gap-1.5 flex-shrink-0"
                                            style={{ background: MINT, color: '#0F172A' }}>
                                            <Plus className="w-3.5 h-3.5" />
                                            {language === 'ar' ? 'إضافة' : 'Ajouter'}
                                        </button>
                                    </div>

                                    {/* Items */}
                                    {list.items.length === 0 ? (
                                        <p className="text-center text-slate-600 text-sm py-6">
                                            {language === 'ar' ? 'أضف أول سلعة لهذا المشروع' : 'Ajoutez votre premier matériau'}
                                        </p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {list.items.map(item => (
                                                <div key={item.id}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${item.checked
                                                            ? 'bg-[#10B981]/5 border-[#10B981]/20'
                                                            : 'bg-[#0F172A]/50 border-slate-700/40'
                                                        }`}>
                                                    <button onClick={() => toggleItem(list.id, item.id)}
                                                        className="flex-shrink-0 hover:opacity-70 transition-opacity">
                                                        {item.checked
                                                            ? <CheckSquare className="w-5 h-5 text-[#10B981]" />
                                                            : <Square className="w-5 h-5 text-slate-600" />}
                                                    </button>
                                                    <span className={`flex-1 text-sm font-medium truncate ${item.checked ? 'line-through text-slate-500' : 'text-white'
                                                        }`}>{item.name}</span>
                                                    <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs font-mono flex-shrink-0">
                                                        {item.quantity}
                                                    </span>
                                                    {item.notes && (
                                                        <span className="text-xs text-slate-500 italic truncate max-w-[120px] flex-shrink-0 hidden sm:block">
                                                            {item.notes}
                                                        </span>
                                                    )}
                                                    <button onClick={() => deleteItem(list.id, item.id)}
                                                        className="flex-shrink-0 text-slate-700 hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    {list.items.length > 0 && (
                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
                                            <p className="text-sm text-slate-400">
                                                <span className="font-bold text-[#10B981]">{checked}</span>
                                                {' / '}{total}{' '}
                                                {language === 'ar' ? 'تم الشراء' : 'achetés'}
                                            </p>
                                            <button onClick={() => sendWhatsApp(list)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                                                style={{
                                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                                    color: '#fff',
                                                    boxShadow: '0 4px 16px rgba(16,185,129,0.28)',
                                                }}>
                                                <Send className="w-4 h-4" />
                                                {language === 'ar' ? 'إرسال للزبون / الدروكيست' : 'Envoyer au client / droguiste'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
