'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import {
    ArrowLeft, User, Phone, Mail, MapPin,
    FileText, ShoppingCart, Plus, Trash2,
    CheckSquare, Square, Send, Archive,
    RotateCcw, StickyNote, Check, X as XIcon,
    Pencil, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Shopping-list types (self-contained, persisted separately) ── */
interface SupplyItem {
    id: string;
    name: string;
    quantity: string;
    notes: string;
    checked: boolean;
}
interface ProjectList {
    id: string;
    clientId: string;
    projectName: string;
    createdAt: string;
    archived: boolean;
    items: SupplyItem[];
}

const SL_KEY = 'maalem_shopping_lists';
function loadLists(): ProjectList[] {
    try { return JSON.parse(localStorage.getItem(SL_KEY) || '[]'); } catch { return []; }
}
function saveLists(l: ProjectList[]) { localStorage.setItem(SL_KEY, JSON.stringify(l)); }

type TabId = 'accounts' | 'supplies';

/* ═══════════════════════════════════════════════════════════════ */
export default function ClientProfilePage() {
    const { language } = useLanguage();
    const { clients, quotes, updateClient } = useData();
    const params = useParams();
    const router = useRouter();
    const clientId = params?.id as string;

    const client = clients.find(c => c.id === clientId);
    const clientQuotes = quotes.filter(q => q.clientId === clientId);

    const [tab, setTab] = useState<TabId>('accounts');

    /* ─── Shopping lists ─── */
    const [allLists, setAllLists] = useState<ProjectList[]>([]);
    const [showArchive, setShowArchive] = useState(false);
    const [openListId, setOpenListId] = useState<string | null>(null);
    const [maalemName, setMaalemName] = useState('Maalem');

    // new project form
    const [newProject, setNewProject] = useState('');
    const [showNewForm, setShowNewForm] = useState(false);

    // add item form
    const [itemName, setItemName] = useState('');
    const [itemQty, setItemQty] = useState('');
    const [itemNotes, setItemNotes] = useState('');

    // edit client
    const [isEditingClient, setIsEditingClient] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editAddress, setEditAddress] = useState('');

    useEffect(() => {
        setAllLists(loadLists());
        try {
            const p = JSON.parse(localStorage.getItem('businessProfile') || '{}');
            setMaalemName(p.name || 'Maalem');
        } catch { /* empty */ }
    }, []);

    const thisLists = allLists.filter(l => l.clientId === clientId);
    const active = thisLists.filter(l => !l.archived);
    const archived = thisLists.filter(l => l.archived);

    const persist = (updated: ProjectList[]) => {
        setAllLists(updated);
        saveLists(updated);
    };

    /* ─── Open client edit ─── */
    const openEdit = () => {
        setEditName(client?.name || '');
        setEditPhone(client?.phone || '');
        setEditEmail(client?.email || '');
        setEditAddress(client?.address || '');
        setIsEditingClient(true);
    };
    const saveClientEdit = () => {
        updateClient(clientId, {
            name: editName.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim(),
            address: editAddress.trim(),
        });
        setIsEditingClient(false);
    };

    /* ─── List CRUD ─── */
    const createList = () => {
        if (!newProject.trim()) return;
        const list: ProjectList = {
            id: Date.now().toString(),
            clientId,
            projectName: newProject.trim(),
            createdAt: new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-MA'),
            archived: false,
            items: [],
        };
        persist([list, ...allLists]);
        setOpenListId(list.id);
        setNewProject('');
        setShowNewForm(false);
    };

    const archiveList = (id: string) => persist(allLists.map(l => l.id === id ? { ...l, archived: true } : l));
    const restoreList = (id: string) => persist(allLists.map(l => l.id === id ? { ...l, archived: false } : l));
    const deleteList = (id: string) => { if (confirm('Supprimer ?')) persist(allLists.filter(l => l.id !== id)); };

    /* ─── Item CRUD ─── */
    const addItem = (listId: string) => {
        if (!itemName.trim()) return;
        const item: SupplyItem = {
            id: Date.now().toString(), name: itemName.trim(),
            quantity: itemQty.trim() || '1', notes: itemNotes.trim(), checked: false,
        };
        persist(allLists.map(l => l.id === listId ? { ...l, items: [...l.items, item] } : l));
        setItemName(''); setItemQty(''); setItemNotes('');
    };
    const toggleItem = (listId: string, itemId: string) =>
        persist(allLists.map(l => l.id === listId
            ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) }
            : l));
    const deleteItem = (listId: string, itemId: string) =>
        persist(allLists.map(l => l.id === listId
            ? { ...l, items: l.items.filter(i => i.id !== itemId) }
            : l));

    /* ─── WhatsApp ─── */
    const sendWhatsApp = (list: ProjectList) => {
        if (list.items.length === 0) return;
        const lines = list.items.map(i =>
            `- ${i.name} : ${i.quantity}${i.notes ? ` (${i.notes})` : ''}`
        ).join('\n');
        const msg =
            `قائمة السلعة لمشروع ${list.projectName} - ${client?.name || ''}:\n` +
            `${lines}\n` +
            `شكراً، ${maalemName}.`;
        const phone = (client?.phone || '').replace(/\s+/g, '');
        window.open(
            phone
                ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                : `https://wa.me/?text=${encodeURIComponent(msg)}`,
            '_blank'
        );
    };

    if (!client) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-slate-400">
                        {language === 'ar' ? 'هذا الزبون غير موجود' : 'Client introuvable'}
                    </p>
                    <button onClick={() => router.push('/clients')}
                        className="px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold">
                        {language === 'ar' ? 'العودة للقائمة' : 'Retour à la liste'}
                    </button>
                </div>
            </div>
        );
    }

    const MINT = '#10B981';

    return (
        <div className="min-h-screen bg-[#0F172A] text-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* ── Top Bar ── */}
            <div className="sticky top-0 z-20 bg-[#0F172A]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-8 py-3">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <Link href="/clients"
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                            {language === 'ar' ? 'ملف الزبون' : 'Fiche client'}
                        </p>
                        <h1 className="text-lg font-bold text-white truncate">{client.name}</h1>
                    </div>
                    <button onClick={openEdit}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-5">

                {/* ── Client Card ── */}
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700/50 p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="flex-1 space-y-1.5 min-w-0">
                            <h2 className="text-xl font-bold text-white">{client.name}</h2>
                            {client.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="font-mono">{client.phone}</span>
                                </div>
                            )}
                            {client.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Mail className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    <span className="truncate">{client.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex gap-1 bg-[#1E293B] rounded-xl p-1 border border-slate-700/50">
                    {([
                        { id: 'accounts', ar: 'الحسابات', fr: 'Factures / Devis', icon: FileText },
                        { id: 'supplies', ar: 'السلعة', fr: 'Liste Matériaux', icon: ShoppingCart },
                    ] as const).map(t => (
                        <button key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === t.id
                                    ? 'bg-[#10B981] text-[#0F172A] shadow-md'
                                    : 'text-slate-400 hover:text-white'
                                }`}>
                            <t.icon className="w-4 h-4" />
                            {language === 'ar' ? t.ar : t.fr}
                        </button>
                    ))}
                </div>

                {/* ════════════════ TAB: ACCOUNTS ════════════════ */}
                {tab === 'accounts' && (
                    <div className="space-y-3">
                        {/* New devis shortcut */}
                        <Link href={`/quotes/new?clientId=${clientId}&clientName=${encodeURIComponent(client.name)}&clientPhone=${encodeURIComponent(client.phone || '')}`}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-slate-700
                                text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-sm">
                            <Plus className="w-4 h-4" />
                            {language === 'ar' ? 'إنشاء فاتورة / دوفيز جديدة' : 'Créer une nouvelle facture / devis'}
                        </Link>

                        {clientQuotes.length === 0 ? (
                            <div className="py-12 text-center text-slate-600 text-sm">
                                {language === 'ar' ? 'لا توجد فواتير لهذا الزبون بعد' : 'Aucune facture pour ce client'}
                            </div>
                        ) : (
                            clientQuotes.map(q => (
                                <Link key={q.id} href={`/quotes/${q.id}`}
                                    className="flex items-center justify-between px-5 py-4 bg-[#1E293B] rounded-xl
                                        border border-slate-700/50 hover:border-emerald-500/30 transition-colors group">
                                    <div>
                                        <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {q.number || `#${q.id.slice(-4)}`}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{q.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-400">{q.total?.toFixed(2)} DH</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${q.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' :
                                                q.status === 'unpaid' ? 'bg-red-500/15 text-red-400' :
                                                    q.status === 'sent' ? 'bg-blue-500/15 text-blue-400' :
                                                        'bg-slate-500/15 text-slate-400'
                                            }`}>
                                            {q.status}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* ════════════════ TAB: SUPPLIES ════════════════ */}
                {tab === 'supplies' && (
                    <div className="space-y-3">

                        {/* New list button */}
                        {!showNewForm ? (
                            <button onClick={() => setShowNewForm(true)}
                                className="w-full flex items-center gap-3 px-5 py-3 rounded-xl border border-dashed border-slate-700
                                    text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-sm">
                                <Plus className="w-4 h-4" />
                                {language === 'ar' ? 'قائمة سلعة جديدة لهذا الزبون' : 'Nouvelle liste de matériaux'}
                            </button>
                        ) : (
                            <div className="bg-[#1E293B] rounded-xl border border-[#10B981]/30 p-4 space-y-3">
                                <label className="text-[10px] text-[#10B981] uppercase tracking-wider font-bold">
                                    {language === 'ar' ? 'اسم المشروع' : 'Nom du projet'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        className="flex-1 h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white
                                            focus:border-[#10B981] focus:outline-none text-sm"
                                        placeholder={language === 'ar' ? 'ترميم الحمام...' : 'Rénovation salon...'}
                                        value={newProject}
                                        onChange={e => setNewProject(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && createList()}
                                    />
                                    <button onClick={createList}
                                        className="h-9 px-4 rounded-lg font-bold text-sm"
                                        style={{ background: MINT, color: '#0F172A' }}>
                                        {language === 'ar' ? 'إنشاء' : 'Créer'}
                                    </button>
                                    <button onClick={() => { setShowNewForm(false); setNewProject(''); }}
                                        className="h-9 w-9 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Active lists */}
                        {active.length === 0 && !showNewForm && (
                            <div className="py-10 text-center text-slate-600 text-sm">
                                {language === 'ar' ? 'لا توجد قوائم نشطة' : 'Aucune liste active'}
                            </div>
                        )}

                        {active.map(list => {
                            const isOpen = openListId === list.id;
                            const total = list.items.length;
                            const checked = list.items.filter(i => i.checked).length;
                            const done = total > 0 && checked === total;

                            return (
                                <div key={list.id}
                                    className={`bg-[#1E293B] rounded-xl overflow-hidden border transition-colors ${done ? 'border-emerald-500/40' : 'border-slate-700/50'
                                        }`}>

                                    {/* List header */}
                                    <div className="flex items-center gap-2 px-4 py-3">
                                        <button
                                            onClick={() => setOpenListId(isOpen ? null : list.id)}
                                            className="flex-1 text-left min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white truncate">{list.projectName}</span>
                                                {done && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                                                        {language === 'ar' ? 'مكتمل ✓' : 'Terminé ✓'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-600 mt-0.5">
                                                {list.createdAt}
                                                {total > 0 && <span className="ml-2 text-[#10B981]">{checked}/{total}</span>}
                                            </p>
                                        </button>

                                        {/* WhatsApp — always visible, big CTA */}
                                        <button
                                            onClick={() => sendWhatsApp(list)}
                                            disabled={list.items.length === 0}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 flex-shrink-0"
                                            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', color: '#fff' }}>
                                            <Send className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </button>

                                        {/* Archive when done */}
                                        {done && (
                                            <button onClick={() => archiveList(list.id)}
                                                title={language === 'ar' ? 'أرشفة' : 'Archiver'}
                                                className="p-2 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors flex-shrink-0">
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => deleteList(list.id)}
                                            className="p-2 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Expanded body */}
                                    {isOpen && (
                                        <div className="border-t border-slate-700/50 p-4 space-y-3">

                                            {/* Add item row */}
                                            <div className="flex flex-wrap gap-2 items-end">
                                                <div className="flex-1 min-w-[120px] space-y-1">
                                                    <label className="text-[10px] text-slate-600 uppercase tracking-wider">
                                                        {language === 'ar' ? 'المادة' : 'Matériau'}
                                                    </label>
                                                    <input
                                                        className="w-full h-8 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                        placeholder={language === 'ar' ? 'سيمان...' : 'Ciment...'}
                                                        value={itemName}
                                                        onChange={e => setItemName(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                                    />
                                                </div>
                                                <div className="w-24 space-y-1">
                                                    <label className="text-[10px] text-slate-600 uppercase tracking-wider">
                                                        {language === 'ar' ? 'الكمية' : 'Qté'}
                                                    </label>
                                                    <input
                                                        className="w-full h-8 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                        placeholder="5 sacs"
                                                        value={itemQty}
                                                        onChange={e => setItemQty(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-[90px] space-y-1">
                                                    <label className="text-[10px] text-slate-600 uppercase tracking-wider flex items-center gap-1">
                                                        <StickyNote className="w-3 h-3" />
                                                        {language === 'ar' ? 'ملاحظة' : 'Note'}
                                                    </label>
                                                    <input
                                                        className="w-full h-8 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white focus:border-[#10B981] focus:outline-none text-sm"
                                                        placeholder={language === 'ar' ? 'ماركة...' : 'Marque...'}
                                                        value={itemNotes}
                                                        onChange={e => setItemNotes(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && addItem(list.id)}
                                                    />
                                                </div>
                                                <button onClick={() => addItem(list.id)}
                                                    className="h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1 flex-shrink-0"
                                                    style={{ background: MINT, color: '#0F172A' }}>
                                                    <Plus className="w-3.5 h-3.5" />
                                                    {language === 'ar' ? 'إضافة' : 'Aj.'}
                                                </button>
                                            </div>

                                            {/* Items */}
                                            {list.items.length === 0 ? (
                                                <p className="text-center text-slate-700 text-xs py-4">
                                                    {language === 'ar' ? 'أضف أول مادة' : 'Ajoutez un matériau'}
                                                </p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {list.items.map(item => (
                                                        <div key={item.id}
                                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${item.checked
                                                                    ? 'bg-[#10B981]/5 border-[#10B981]/20'
                                                                    : 'bg-[#0F172A]/40 border-slate-700/30'
                                                                }`}>
                                                            <button onClick={() => toggleItem(list.id, item.id)}
                                                                className="flex-shrink-0 hover:opacity-70 transition-opacity">
                                                                {item.checked
                                                                    ? <CheckSquare className="w-4 h-4 text-[#10B981]" />
                                                                    : <Square className="w-4 h-4 text-slate-600" />}
                                                            </button>
                                                            <span className={`flex-1 text-sm truncate ${item.checked ? 'line-through text-slate-600' : 'text-white'
                                                                }`}>{item.name}</span>
                                                            <span className="text-xs font-mono text-slate-400 flex-shrink-0 bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                                {item.quantity}
                                                            </span>
                                                            {item.notes && (
                                                                <span className="text-xs text-slate-600 italic hidden sm:block flex-shrink-0 max-w-[100px] truncate">
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

                                            {/* Big WhatsApp CTA at bottom */}
                                            {list.items.length > 0 && (
                                                <button onClick={() => sendWhatsApp(list)}
                                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm mt-1"
                                                    style={{
                                                        background: 'linear-gradient(135deg,#10B981,#059669)',
                                                        color: '#fff',
                                                        boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
                                                    }}>
                                                    <Send className="w-4 h-4" />
                                                    {language === 'ar'
                                                        ? 'إرسال القائمة للزبون / الدروكيست عبر واتساب'
                                                        : 'Envoyer la liste via WhatsApp'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Archive section */}
                        {archived.length > 0 && (
                            <div className="pt-2">
                                <button onClick={() => setShowArchive(v => !v)}
                                    className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                                    <Archive className="w-3.5 h-3.5" />
                                    {showArchive
                                        ? (language === 'ar' ? 'إخفاء الأرشيف' : 'Masquer l\'archive')
                                        : `${language === 'ar' ? 'الأرشيف' : 'Archive'} (${archived.length})`}
                                </button>

                                {showArchive && (
                                    <div className="mt-2 space-y-2">
                                        {archived.map(list => (
                                            <div key={list.id}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-700/30 opacity-60">
                                                <Archive className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-400 line-through truncate">{list.projectName}</p>
                                                    <p className="text-[10px] text-slate-600">{list.createdAt} · {list.items.length} {language === 'ar' ? 'مواد' : 'articles'}</p>
                                                </div>
                                                <button onClick={() => restoreList(list.id)}
                                                    title={language === 'ar' ? 'استعادة' : 'Restaurer'}
                                                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-600 hover:text-white transition-colors flex-shrink-0">
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteList(list.id)}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-700 hover:text-red-400 transition-colors flex-shrink-0">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Edit Client Modal ── */}
            {isEditingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1E293B] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                            <h2 className="font-bold text-white">
                                {language === 'ar' ? 'تعديل معلومات الزبون' : 'Modifier le client'}
                            </h2>
                            <button onClick={() => setIsEditingClient(false)}
                                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors">
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-3">
                            {[
                                { label: language === 'ar' ? 'الاسم *' : 'Nom *', val: editName, set: setEditName, ph: 'Ahmed Benani' },
                                { label: language === 'ar' ? 'الهاتف' : 'Téléphone', val: editPhone, set: setEditPhone, ph: '06XXXXXXXX' },
                                { label: 'Email', val: editEmail, set: setEditEmail, ph: 'client@mail.com' },
                                { label: language === 'ar' ? 'العنوان' : 'Adresse', val: editAddress, set: setEditAddress, ph: 'Casablanca, Maroc' },
                            ].map(f => (
                                <div key={f.label} className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-wider">{f.label}</label>
                                    <input
                                        className="w-full h-9 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white
                                            focus:border-[#10B981] focus:outline-none text-sm"
                                        placeholder={f.ph}
                                        value={f.val}
                                        onChange={e => f.set(e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 px-5 pb-5">
                            <button onClick={() => setIsEditingClient(false)}
                                className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                {language === 'ar' ? 'إلغاء' : 'Annuler'}
                            </button>
                            <button onClick={saveClientEdit}
                                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-colors"
                                style={{ background: MINT, color: '#0F172A' }}>
                                <Check className="w-4 h-4" />
                                {language === 'ar' ? 'حفظ' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
