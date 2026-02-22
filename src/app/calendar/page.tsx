'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, ChevronRight, Plus, X, MessageCircle,
    Briefcase, Wrench, Banknote, Calendar, Trash2, Clock,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/* ─────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────── */
export type EventType = 'visit' | 'start' | 'payment';

export interface MaalemEvent {
    id: string;
    type: EventType;
    title: string;           // client name / note
    date: string;            // YYYY-MM-DD
    time: string;            // HH:MM
    phone?: string;
    note?: string;
}

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */
const LS_KEY = 'maalem_calendar_events';

export const EVENT_META: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    visit: { label: 'شوفة د الشانطي', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: <Briefcase size={13} /> },
    start: { label: 'بداية الخدمة', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <Wrench size={13} /> },
    payment: { label: 'موعد الخلاص', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <Banknote size={13} /> },
};

const DAYS_AR = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);

function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay(); // 0=Sun
}

/* ─────────────────────────────────────────────────────────
   QUICK-ADD MODAL
───────────────────────────────────────────────────────── */
function AddEventModal({
    initialDate,
    onSave,
    onClose,
}: {
    initialDate: string;
    onSave: (e: MaalemEvent) => void;
    onClose: () => void;
}) {
    const [type, setType] = useState<EventType>('visit');
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState('09:00');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');

    const save = () => {
        if (!title.trim() || !date) return;
        onSave({ id: uid(), type, title: title.trim(), date, time, phone: phone.trim(), note: note.trim() });
        onClose();
    };

    const iStyle: React.CSSProperties = {
        width: '100%', padding: '9px 12px',
        background: '#0d1117',
        border: '1px solid #374151', borderRadius: 8,
        color: '#e5e7eb', fontSize: 14, outline: 'none',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
        }}>
            <div style={{
                width: '100%', maxWidth: 420,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 24,
                display: 'flex', flexDirection: 'column', gap: 16,
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>➕ إضافة موعد</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Type selector */}
                <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                        نوع الموعد
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {(Object.entries(EVENT_META) as [EventType, typeof EVENT_META[EventType]][]).map(([key, meta]) => (
                            <button key={key} onClick={() => setType(key)}
                                style={{
                                    flex: 1, padding: '8px 4px',
                                    borderRadius: 8, cursor: 'pointer',
                                    border: `2px solid ${type === key ? meta.color : '#374151'}`,
                                    background: type === key ? meta.bg : '#1e293b',
                                    color: type === key ? meta.color : '#6b7280',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                }}>
                                {meta.icon}
                                <span style={{ fontSize: 9, textAlign: 'center', lineHeight: 1.3 }}>{meta.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Client name */}
                <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>اسم الزبون / الملاحظة</label>
                    <input style={iStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً: سي حسن..." />
                </div>

                {/* Date + Time */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>التاريخ</label>
                        <input type="date" style={iStyle} value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>الوقت</label>
                        <input type="time" style={iStyle} value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label style={{ fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>الهاتف (اختياري)</label>
                    <input style={iStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="06XXXXXXXX" />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: 10, borderRadius: 8,
                        background: '#1e293b', border: '1px solid #374151',
                        color: '#94a3b8', fontWeight: 600, cursor: 'pointer',
                    }}>إلغاء</button>
                    <button onClick={save} style={{
                        flex: 2, padding: 10, borderRadius: 8,
                        background: EVENT_META[type].color,
                        border: 'none', color: '#0f172a',
                        fontWeight: 800, cursor: 'pointer', fontSize: 14,
                    }}>✓ حفظ الموعد</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   EVENT PILL (appears on calendar day)
───────────────────────────────────────────────────────── */
function EventPill({ ev, onDelete }: { ev: MaalemEvent; onDelete: () => void }) {
    const meta = EVENT_META[ev.type];

    const sendWhatsApp = () => {
        const msg = `السلام عليكم، كنفكرك بلي عندنا موعد غدا مع ${ev.time}. تبارك الله عليك.`;
        const phone = ev.phone?.replace(/[^0-9]/g, '') || '';
        const url = phone
            ? `https://wa.me/212${phone.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`
            : `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    };

    return (
        <div style={{
            background: meta.bg,
            border: `1px solid ${meta.color}40`,
            borderRadius: 6, padding: '4px 7px',
            display: 'flex', alignItems: 'center', gap: 5,
            marginBottom: 2,
        }}>
            <span style={{ color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
            <span style={{ fontSize: 11, color: '#e5e7eb', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.time} {ev.title}
            </span>
            <button onClick={sendWhatsApp} title="إرسال تذكير واتساب"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#25D366', flexShrink: 0, padding: 0, display: 'flex' }}>
                <MessageCircle size={12} />
            </button>
            <button onClick={onDelete} title="حذف"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', flexShrink: 0, padding: 0, display: 'flex' }}>
                <Trash2 size={11} />
            </button>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   MAIN CALENDAR PAGE
───────────────────────────────────────────────────────── */
export default function CalendarPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { language } = useLanguage();

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);
    const [events, setEvents] = useState<MaalemEvent[]>([]);
    const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
    const [curYear, setCurYear] = useState(() => new Date().getFullYear());
    const [curMonth, setCurMonth] = useState(() => new Date().getMonth());
    const [weekStart, setWeekStart] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d;
    });
    const [showAdd, setShowAdd] = useState(false);
    const [addDate, setAddDate] = useState(todayStr);

    /* ── Persist ── */
    useEffect(() => {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) setEvents(JSON.parse(raw));
    }, []);
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(events));
    }, [events]);

    const addEvent = useCallback((ev: MaalemEvent) => setEvents(p => [...p, ev]), []);
    const deleteEvent = useCallback((id: string) => setEvents(p => p.filter(e => e.id !== id)), []);

    /* ── Month nav ── */
    const prevMonth = () => { if (curMonth === 0) { setCurMonth(11); setCurYear(y => y - 1); } else setCurMonth(m => m - 1); };
    const nextMonth = () => { if (curMonth === 11) { setCurMonth(0); setCurYear(y => y + 1); } else setCurMonth(m => m + 1); };

    /* ── Week nav ── */
    const prevWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    const nextWeek = () => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });

    const eventsOnDay = (dateStr: string) => events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

    /* ─── MONTH VIEW ─── */
    const renderMonthView = () => {
        const totalDays = daysInMonth(curYear, curMonth);
        const startOffset = firstDayOfMonth(curYear, curMonth);
        const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
        // pad to complete last row
        while (cells.length % 7 !== 0) cells.push(null);

        const today = new Date();
        const isToday = (d: number) => d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();

        return (
            <div>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
                    {DAYS_AR.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 700, padding: '6px 0' }}>{d}</div>
                    ))}
                </div>
                {/* Cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                    {cells.map((day, idx) => {
                        if (!day) return <div key={`e-${idx}`} style={{ minHeight: 70 }} />;
                        const dateStr = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayEvs = eventsOnDay(dateStr);
                        return (
                            <div key={dateStr}
                                onClick={() => { setAddDate(dateStr); setShowAdd(true); }}
                                style={{
                                    minHeight: 70, padding: '4px 4px 4px',
                                    background: isToday(day) ? 'rgba(16,185,129,0.08)' : '#1e293b',
                                    border: `1px solid ${isToday(day) ? '#10B981' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: 8, cursor: 'pointer',
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                <div style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: isToday(day) ? '#10B981' : '#94a3b8',
                                    marginBottom: 3, textAlign: 'right',
                                }}>{day}</div>
                                {dayEvs.slice(0, 2).map(ev => (
                                    <EventPill key={ev.id} ev={ev} onDelete={() => deleteEvent(ev.id)} />
                                ))}
                                {dayEvs.length > 2 && (
                                    <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>+{dayEvs.length - 2}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ─── WEEK VIEW ─── */
    const renderWeekView = () => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
        const today = todayStr();

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {days.map(day => {
                    const dateStr = day.toISOString().slice(0, 10);
                    const dayEvs = eventsOnDay(dateStr);
                    const isT = dateStr === today;
                    return (
                        <div key={dateStr} style={{
                            background: isT ? 'rgba(16,185,129,0.06)' : '#1e293b',
                            border: `1px solid ${isT ? '#10B981' : 'rgba(255,255,255,0.05)'}`,
                            borderRadius: 10, padding: '10px 12px',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: isT ? '#10B981' : '#e5e7eb' }}>
                                    {DAYS_AR[day.getDay()]} {day.getDate()} {MONTHS_AR[day.getMonth()]}
                                </div>
                                <button onClick={() => { setAddDate(dateStr); setShowAdd(true); }}
                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 6, padding: '2px 8px', color: '#10B981', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>
                                    + إضافة
                                </button>
                            </div>
                            {dayEvs.length === 0
                                ? <div style={{ fontSize: 11, color: '#374151', fontStyle: 'italic' }}>— لا مواعيد —</div>
                                : dayEvs.map(ev => <EventPill key={ev.id} ev={ev} onDelete={() => deleteEvent(ev.id)} />)
                            }
                        </div>
                    );
                })}
            </div>
        );
    };

    /* ─── UPCOMING EVENTS sidebar ─── */
    const upcoming = events
        .filter(e => e.date >= todayStr())
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 5);

    return (
        <div style={{ minHeight: '100vh', background: '#0F172A', color: '#e2e8f0', fontFamily: 'Cairo, sans-serif' }}>
            <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>

                {/* ── Page Header ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>
                            <Calendar size={20} style={{ display: 'inline', marginLeft: 8, color: '#10B981' }} />
                            مواعيد الخدمة
                        </h1>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                            خصص مواعيدك، دير تذكيرات، وتواصل مع زبنائك مباشرة
                        </p>
                    </div>

                    {/* View toggle */}
                    <div style={{ display: 'flex', background: '#1e293b', borderRadius: 10, padding: 3, gap: 2 }}>
                        {(['month', 'week'] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{
                                padding: '6px 16px', borderRadius: 7,
                                background: viewMode === v ? '#10B981' : 'transparent',
                                border: 'none', cursor: 'pointer',
                                color: viewMode === v ? '#0f172a' : '#64748b',
                                fontSize: 12, fontWeight: 700,
                            }}>
                                {v === 'month' ? 'شهر' : 'أسبوع'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Legend ── */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {(Object.entries(EVENT_META) as [EventType, typeof EVENT_META[EventType]][]).map(([, meta]) => (
                        <div key={meta.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color }} />
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{meta.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* ── MAIN CALENDAR ── */}
                    <div style={{ flex: 1, minWidth: 280 }}>

                        {/* Nav bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <button onClick={viewMode === 'month' ? prevMonth : prevWeek}
                                style={{ background: '#1e293b', border: '1px solid #374151', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <ChevronRight size={16} />
                            </button>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>
                                {viewMode === 'month'
                                    ? `${MONTHS_AR[curMonth]} ${curYear}`
                                    : `${weekStart.getDate()} ${MONTHS_AR[weekStart.getMonth()]} – ${new Date(weekStart.getTime() + 6 * 86400000).getDate()} ${MONTHS_AR[new Date(weekStart.getTime() + 6 * 86400000).getMonth()]}`
                                }
                            </span>
                            <button onClick={viewMode === 'month' ? nextMonth : nextWeek}
                                style={{ background: '#1e293b', border: '1px solid #374151', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                <ChevronLeft size={16} />
                            </button>
                        </div>

                        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
                    </div>

                    {/* ── UPCOMING SIDEBAR ── */}
                    <div style={{ width: 220, flexShrink: 0, background: '#1e293b', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 800, color: '#10B981' }}>
                            ⏰ المواعيد اللي جاية
                        </h3>
                        {upcoming.length === 0
                            ? <p style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>ما كاين حتى موعد</p>
                            : upcoming.map(ev => {
                                const meta = EVENT_META[ev.type];
                                const sendWA = () => {
                                    const msg = `السلام عليكم، كنفكرك بلي عندنا موعد غدا مع ${ev.time}. تبارك الله عليك.`;
                                    const ph = ev.phone?.replace(/[^0-9]/g, '') || '';
                                    const url = ph ? `https://wa.me/212${ph.replace(/^0/, '')}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                                    window.open(url, '_blank');
                                };
                                return (
                                    <div key={ev.id} style={{
                                        background: meta.bg, border: `1px solid ${meta.color}40`,
                                        borderRadius: 8, padding: '8px 10px', marginBottom: 8,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ color: meta.color, fontSize: 10, fontWeight: 700 }}>{meta.label}</span>
                                            <button onClick={() => deleteEvent(ev.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, display: 'flex' }}>
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '3px 0 2px' }}>{ev.title}</div>
                                        <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={10} />
                                            {ev.date} — {ev.time}
                                        </div>
                                        {ev.phone && (
                                            <button onClick={sendWA} style={{
                                                marginTop: 6, display: 'flex', alignItems: 'center', gap: 5,
                                                background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.3)',
                                                borderRadius: 6, padding: '4px 8px', cursor: 'pointer',
                                                color: '#25D366', fontSize: 11, fontWeight: 700, width: '100%',
                                            }}>
                                                <MessageCircle size={12} />
                                                إرسال تذكير
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            {/* ── FAB: Big "+" Button ── */}
            <button
                onClick={() => { setAddDate(todayStr()); setShowAdd(true); }}
                style={{
                    position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 999,
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none', borderRadius: 999,
                    color: '#0f172a', fontWeight: 900, fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 8px 30px rgba(16,185,129,0.4)',
                }}
            >
                <Plus size={20} strokeWidth={3} />
                إضافة موعد
            </button>

            {/* ── Add Modal ── */}
            {showAdd && (
                <AddEventModal
                    initialDate={addDate}
                    onSave={addEvent}
                    onClose={() => setShowAdd(false)}
                />
            )}
        </div>
    );
}
