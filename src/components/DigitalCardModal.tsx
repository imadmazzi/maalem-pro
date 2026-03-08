'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    X, Phone, MapPin, Wrench, User, Download, MessageCircle,
    Hammer, Star, Sun, Moon, QrCode, Palette,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/ToastProvider';
import { toPng } from 'html-to-image';
import { QRCodeCanvas } from 'qrcode.react';

/* ── Types ─────────────────────────────────────────────── */
interface DigitalCardModalProps { isOpen: boolean; onClose: () => void; }

interface CardSettings {
    name: string;
    title: string;
    phone: string;
    city: string;
    theme: 'dark' | 'light';
    accent: 'amber' | 'mint' | 'blue' | 'rose';
    showQr: boolean;
}

const ACCENT_MAP = {
    amber: { main: '#F59E0B', dark: '#D97706', label: '🟡 ذهبي' },
    mint: { main: '#10B981', dark: '#059669', label: '🟢 أخضر' },
    blue: { main: '#3B82F6', dark: '#2563EB', label: '🔵 أزرق' },
    rose: { main: '#F43F5E', dark: '#E11D48', label: '🔴 أحمر' },
};

const SETTINGS_KEY = 'maalem_card_settings';

/* ═══════════════════════════════════════════════════════════════ */
export function DigitalCardModal({ isOpen, onClose }: DigitalCardModalProps) {
    const { language } = useLanguage();
    const { showToast } = useToast();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    /* ── Card settings (persisted) ── */
    const [settings, setSettings] = useState<CardSettings>({
        name: '', title: '', phone: '', city: '',
        theme: 'dark', accent: 'amber', showQr: true,
    });

    /* Load profile + saved settings on open */
    useEffect(() => {
        if (!isOpen) return;
        const prof = JSON.parse(localStorage.getItem('businessProfile') || '{}');
        setProfile(prof);

        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        setSettings({
            name: saved.name ?? prof.name ?? '',
            title: saved.title ?? prof.activity ?? (language === 'ar' ? 'حرفي محترف' : 'Artisan Professionnel'),
            phone: saved.phone ?? prof.phone ?? '',
            city: saved.city ?? prof.city ?? '',
            theme: saved.theme ?? 'dark',
            accent: saved.accent ?? 'amber',
            showQr: saved.showQr ?? true,
        });
    }, [isOpen]);

    /* Auto-save settings whenever they change */
    useEffect(() => {
        if (!isOpen) return;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings, isOpen]);

    /* Detect small screen for card scaling */
    useEffect(() => {
        const check = () => setIsSmallScreen(window.innerWidth < 480);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!isOpen) return null;

    const set = (patch: Partial<CardSettings>) => setSettings(s => ({ ...s, ...patch }));

    /* ── Derived values ── */
    const accent = ACCENT_MAP[settings.accent];
    const MAIN = accent.main;
    const DARK_ACC = accent.dark;
    const isDark = settings.theme === 'dark';

    const cardBg = isDark
        ? `repeating-linear-gradient(45deg,transparent,transparent 28px,rgba(${settings.accent === 'amber' ? '245,158,11' :
            settings.accent === 'mint' ? '16,185,129' :
                settings.accent === 'blue' ? '59,130,246' : '244,63,94'
        },0.03) 28px,rgba(${settings.accent === 'amber' ? '245,158,11' :
            settings.accent === 'mint' ? '16,185,129' :
                settings.accent === 'blue' ? '59,130,246' : '244,63,94'
        },0.03) 29px),linear-gradient(160deg,#1c2333 0%,#111827 50%,#0d1117 100%)`
        : `linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)`;

    const textMain = isDark ? '#ffffff' : '#0f172a';
    const textSub = isDark ? '#9ca3af' : '#64748b';
    const pillBg = isDark ? 'rgba(31,41,55,0.9)' : 'rgba(241,245,249,0.95)';
    const pillBorder = isDark ? 'rgba(55,65,81,0.8)' : 'rgba(203,213,225,0.8)';
    const cardShadow = isDark
        ? '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
        : '0 20px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)';
    const DARK2 = '#1F2937';
    const DARK3 = '#374151';

    const waPhone = settings.phone.replace(/[^0-9]/g, '');
    const cardId = settings.phone.replace(/\s+/g, '') || 'unknown';
    const qrValue = waPhone ? `https://wa.me/${waPhone}` : `https://maalem.pro/m/${cardId}`;
    const logo = profile?.logo;

    /* ── Export ── */
    const generateImage = async (): Promise<Blob | null> => {
        if (!cardRef.current) return null;
        setIsGenerating(true);
        showToast(language === 'ar' ? 'جاري تحضير البطاقة...' : 'Génération...', 'info');
        try {
            await new Promise(r => setTimeout(r, 350));
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 2,
                backgroundColor: isDark ? '#111827' : '#f8fafc',
                cacheBust: true,
                skipFonts: false,
            });
            const res = await fetch(dataUrl);
            return await res.blob();
        } catch (e) {
            console.error(e);
            showToast(language === 'ar' ? 'فشل إنشاء البطاقة' : 'Échec de la génération', 'error');
            return null;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = async () => {
        const blob = await generateImage();
        if (!blob) return;
        const a = document.createElement('a');
        a.download = `maalem-pro-card-${cardId}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        showToast(language === 'ar' ? 'تم حفظ الصورة' : 'Image enregistrée', 'success');
    };

    const handleWhatsAppShare = async () => {
        const WA_MSG = `السلام عليكم، هادي البطاقة المهنية ديالي على منصة Maalem Pro 🪪✅\nتقدر تسكاني الكود باش تاخد نمرتي.\n\n👷 ${settings.name}\n📞 ${settings.phone}${settings.city ? `\n📍 ${settings.city}` : ''}`;

        /* ── MOBILE: native share sheet → user picks WhatsApp & image goes with it ── */
        if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
            const blob = await generateImage();
            if (blob) {
                const file = new File([blob], 'maalem-pro-card.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({ files: [file], text: WA_MSG, title: settings.name });
                        return; // done — user chose WhatsApp from share sheet
                    } catch {
                        /* user cancelled share sheet, fall through to download+open */
                    }
                }
            }
        }

        /* ── DESKTOP (or mobile fallback): download image first, then open WhatsApp ── */
        const blob = await generateImage();
        if (blob) {
            // 1. Trigger download so the Maalem has the image ready to attach
            const a = document.createElement('a');
            a.download = `maalem-pro-card-${cardId}.png`;
            a.href = URL.createObjectURL(blob);
            a.click();

            // 2. Toast: tell them the image is saved and they can attach it
            showToast(
                'تم تحميل البطاقة، يمكنك الآن إرفاقها في واتساب 📎',
                'success'
            );
        }

        // 3. Small delay then open WhatsApp with pre-filled Darija message
        setTimeout(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(WA_MSG)}`, '_blank');
        }, 600);
    };

    /* ── Shared input style ── */
    const iStyle: React.CSSProperties = {
        width: '100%', padding: '7px 10px',
        background: '#0d1117', border: '1px solid #374151',
        borderRadius: 8, color: '#e5e7eb', fontSize: 13,
        outline: 'none', fontFamily: 'inherit',
        boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 10, fontWeight: 700,
        color: '#6b7280', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 4,
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            overflowY: 'auto',
            padding: '16px',
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(10px)',
            /* Use flex just to horizontally center; vertical start so content not cut off */
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
        }}>
            {/* ── Modal shell ── */}
            <div style={{
                position: 'relative',
                width: '900px',
                maxWidth: '100%',
                /* No maxHeight — let it be as tall as needed; overlay scrolls */
                background: '#0d1117',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: isSmallScreen ? 14 : 20,
                boxShadow: '0 30px 80px -10px rgba(0,0,0,0.9)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                marginTop: isSmallScreen ? 0 : 16,
                marginBottom: 16,
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    flexShrink: 0,
                }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#fff', fontSize: 16, fontWeight: 700 }}>
                            {language === 'ar' ? 'بطاقتك المهنية' : 'Votre Carte Professionnelle'}
                        </h2>
                        <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: 11 }}>
                            {language === 'ar' ? 'خصّص بطاقتك وشاركها' : 'Personnalisez et partagez votre carte'}
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: DARK2, border: `1px solid ${DARK3}`,
                        borderRadius: '50%', width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#9ca3af',
                    }}>
                        <X size={15} />
                    </button>
                </div>

                {/* Body: on desktop = side-by-side; on mobile = stacked (card first) */}
                <div style={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    overflow: 'visible',
                    flex: 1,
                }}>

                    {/* ═══ LEFT / TOP on mobile: Customizer Panel ═══ */}
                    <div style={{
                        width: isSmallScreen ? '100%' : '300px',
                        flex: isSmallScreen ? 'none' : '0 0 300px',
                        padding: isSmallScreen ? '16px' : '20px',
                        borderRight: isSmallScreen ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        borderBottom: isSmallScreen ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        display: 'flex', flexDirection: 'column', gap: 16,
                        overflowY: 'visible',
                        /* On mobile, show customizer collapsed under the card — use order */
                        order: isSmallScreen ? 2 : 1,
                    }}>

                        {/* Section: Text Fields */}
                        <div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                marginBottom: 12,
                            }}>
                                <User size={13} color={MAIN} />
                                <span style={{ fontSize: 11, fontWeight: 800, color: MAIN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {language === 'ar' ? 'المعلومات' : 'Informations'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div>
                                    <label style={labelStyle}>{language === 'ar' ? 'الاسم الكامل' : 'Nom complet'}</label>
                                    <input style={iStyle} value={settings.name}
                                        onChange={e => set({ name: e.target.value })}
                                        placeholder={language === 'ar' ? 'حسن المعلم...' : 'Hassan Maalem...'} />
                                </div>
                                <div>
                                    <label style={labelStyle}>{language === 'ar' ? 'المهنة / التخصص' : 'Métier / Spécialité'}</label>
                                    <input style={iStyle} value={settings.title}
                                        onChange={e => set({ title: e.target.value })}
                                        placeholder={language === 'ar' ? 'حرفي محترف...' : 'Maçon professionnel...'} />
                                </div>
                                <div>
                                    <label style={labelStyle}><Phone size={9} style={{ display: 'inline', marginRight: 4 }} />{language === 'ar' ? 'الهاتف' : 'Téléphone'}</label>
                                    <input style={iStyle} value={settings.phone}
                                        onChange={e => set({ phone: e.target.value })}
                                        placeholder="06XXXXXXXX" />
                                </div>
                                <div>
                                    <label style={labelStyle}><MapPin size={9} style={{ display: 'inline', marginRight: 4 }} />{language === 'ar' ? 'المدينة' : 'Ville'}</label>
                                    <input style={iStyle} value={settings.city}
                                        onChange={e => set({ city: e.target.value })}
                                        placeholder={language === 'ar' ? 'كازا، الرباط...' : 'Casablanca...'} />
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                        {/* Section: Visual Controls */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <Palette size={13} color={MAIN} />
                                <span style={{ fontSize: 11, fontWeight: 800, color: MAIN, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {language === 'ar' ? 'المظهر' : 'Apparence'}
                                </span>
                            </div>

                            {/* Theme toggle */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>{language === 'ar' ? 'الخلفية' : 'Fond de carte'}</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {(['dark', 'light'] as const).map(t => (
                                        <button key={t} onClick={() => set({ theme: t })}
                                            style={{
                                                flex: 1, padding: '8px 0',
                                                borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                                                border: settings.theme === t ? `2px solid ${MAIN}` : '2px solid #374151',
                                                background: settings.theme === t ? `rgba(${settings.accent === 'amber' ? '245,158,11' :
                                                    settings.accent === 'mint' ? '16,185,129' :
                                                        settings.accent === 'blue' ? '59,130,246' : '244,63,94'
                                                    },0.12)` : '#1F2937',
                                                color: settings.theme === t ? MAIN : '#9ca3af',
                                            }}>
                                            {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                                            {t === 'dark'
                                                ? (language === 'ar' ? 'داكن' : 'Sombre')
                                                : (language === 'ar' ? 'فاتح' : 'Clair')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent color */}
                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>{language === 'ar' ? 'اللون الرئيسي' : 'Couleur accent'}</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {(Object.entries(ACCENT_MAP) as [keyof typeof ACCENT_MAP, typeof ACCENT_MAP[keyof typeof ACCENT_MAP]][]).map(([key, val]) => (
                                        <button key={key} onClick={() => set({ accent: key })}
                                            title={val.label}
                                            style={{
                                                width: 34, height: 34, borderRadius: '50%',
                                                background: val.main, cursor: 'pointer',
                                                border: settings.accent === key
                                                    ? `3px solid #fff`
                                                    : '3px solid transparent',
                                                boxShadow: settings.accent === key
                                                    ? `0 0 0 2px ${val.main}`
                                                    : 'none',
                                                transition: 'all 0.15s',
                                                flexShrink: 0,
                                            }} />
                                    ))}
                                </div>
                            </div>

                            {/* QR toggle */}
                            <div>
                                <label style={labelStyle}>{language === 'ar' ? 'رمز QR' : 'Code QR'}</label>
                                <button onClick={() => set({ showQr: !settings.showQr })}
                                    style={{
                                        width: '100%', padding: '8px 12px',
                                        borderRadius: 8, fontSize: 12, fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        border: `2px solid ${settings.showQr ? MAIN : '#374151'}`,
                                        background: settings.showQr
                                            ? `rgba(${settings.accent === 'amber' ? '245,158,11' :
                                                settings.accent === 'mint' ? '16,185,129' :
                                                    settings.accent === 'blue' ? '59,130,246' : '244,63,94'
                                            },0.12)` : '#1F2937',
                                        color: settings.showQr ? MAIN : '#9ca3af',
                                    }}>
                                    <QrCode size={14} />
                                    {settings.showQr
                                        ? (language === 'ar' ? 'QR ظاهر ✓' : 'QR visible ✓')
                                        : (language === 'ar' ? 'QR مخفي' : 'QR masqué')}
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

                        {/* Reset to profile */}
                        <button
                            onClick={() => {
                                const prof = profile || {};
                                set({
                                    name: prof.name || '',
                                    title: prof.activity || (language === 'ar' ? 'حرفي محترف' : 'Artisan Professionnel'),
                                    phone: prof.phone || '',
                                    city: prof.city || '',
                                });
                            }}
                            style={{
                                width: '100%', padding: '8px',
                                background: 'transparent', border: '1px dashed #374151',
                                borderRadius: 8, color: '#6b7280', fontSize: 11,
                                cursor: 'pointer', fontWeight: 600,
                            }}>
                            {language === 'ar' ? '↺ استعادة من الإعدادات' : '↺ Réinitialiser depuis le profil'}
                        </button>
                    </div>

                    {/* ═══ RIGHT / TOP on mobile: Preview + Actions ═══ */}
                    <div style={{
                        flex: 1,
                        padding: isSmallScreen ? '16px' : '24px 20px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: isSmallScreen ? 12 : 20,
                        background: '#080c12',
                        order: isSmallScreen ? 1 : 2,
                    }}>

                        {/* ══════════════════════════════════
                            THE CRAFTSMAN CARD (live preview)
                        ══════════════════════════════════ */}
                        <div
                            ref={cardRef}
                            style={{
                                width: '100%', maxWidth: 420,
                                height: 'auto',
                                minHeight: 240,
                                borderRadius: 14,
                                overflow: 'hidden',
                                flexShrink: 0,
                                fontFamily: "'Segoe UI', Arial, sans-serif",
                                position: 'relative',
                                background: cardBg,
                                boxShadow: cardShadow,
                                marginBottom: 0,
                            }}
                        >
                            {/* Top accent stripe */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                                background: `linear-gradient(90deg,${DARK_ACC},${MAIN},${DARK_ACC})`,
                            }} />

                            {/* Corner decoration */}
                            <div style={{
                                position: 'absolute', bottom: -20, right: -20,
                                width: 100, height: 100, borderRadius: '50%',
                                border: `12px solid ${MAIN}0f`, pointerEvents: 'none',
                            }} />

                            {/* ROW 1: QR (left) + Brand (right) */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                padding: '12px 16px 0',
                            }}>
                                {settings.showQr ? (
                                    <div style={{
                                        background: '#fff', padding: 4,
                                        borderRadius: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                    }}>
                                        <QRCodeCanvas value={qrValue} size={38} fgColor="#111827" />
                                    </div>
                                ) : (
                                    <div style={{ width: 46, height: 46 }} />
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: textMain, letterSpacing: '0.1em', lineHeight: 1, textAlign: 'right' }}>
                                            MAALEM<span style={{ color: MAIN }}>PRO</span>
                                        </div>
                                        <div style={{ fontSize: 8, color: textSub, letterSpacing: '0.12em', marginTop: 2, textAlign: 'right' }}>
                                            ARTISAN CERTIFIÉ
                                        </div>
                                    </div>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: 7,
                                        background: `linear-gradient(135deg,${MAIN},${DARK_ACC})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 4px 12px ${MAIN}55`,
                                    }}>
                                        <Wrench size={14} color={isDark ? '#111827' : '#ffffff'} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>

                            {/* ROW 2: Avatar + Name + Trade */}
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                justifyContent: 'center',
                                padding: '6px 16px 0', gap: 6,
                            }}>
                                {/* Avatar ring */}
                                <div style={{ position: 'relative', width: 58, height: 58, flexShrink: 0 }}>
                                    <div style={{
                                        position: 'absolute', inset: -3, borderRadius: '50%',
                                        background: `conic-gradient(${MAIN} 0deg,${DARK_ACC} 90deg,${MAIN} 180deg,${DARK_ACC} 270deg,${MAIN} 360deg)`,
                                    }} />
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%',
                                        border: `3px solid ${isDark ? '#111827' : '#f8fafc'}`,
                                        overflow: 'hidden',
                                        background: isDark ? '#1F2937' : '#e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {logo
                                            ? <img src={logo} alt={settings.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <User size={24} color={MAIN} />}
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 style={{
                                    margin: 0, fontSize: 18, fontWeight: 900,
                                    color: textMain, letterSpacing: '-0.02em',
                                    textShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : 'none',
                                    lineHeight: 1.1, textAlign: 'center',
                                }}>
                                    {settings.name || (language === 'ar' ? 'اسم المعلم' : 'Nom du Maalem')}
                                </h3>

                                {/* Trade badge */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: `linear-gradient(135deg,${MAIN}22,${DARK_ACC}18)`,
                                    border: `1px solid ${MAIN}44`,
                                    borderRadius: 999, padding: '3px 12px',
                                }}>
                                    <Hammer size={9} color={MAIN} strokeWidth={2.5} />
                                    <span style={{
                                        fontSize: 10, fontWeight: 700, color: MAIN,
                                        textTransform: 'uppercase', letterSpacing: '0.12em',
                                    }}>
                                        {settings.title || (language === 'ar' ? 'حرفي محترف' : 'Artisan')}
                                    </span>
                                    <Star size={8} color={MAIN} fill={MAIN} />
                                </div>
                            </div>

                            {/* ROW 3: Phone + City */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '8px 16px 12px',
                                borderTop: `1px solid ${MAIN}1a`,
                                marginTop: 6,
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: pillBg, border: `1px solid ${pillBorder}`,
                                    borderRadius: 999, padding: '4px 10px',
                                }}>
                                    <Phone size={11} color={MAIN} strokeWidth={2.5} />
                                    <span style={{
                                        fontFamily: 'monospace', fontSize: 12,
                                        fontWeight: 700, color: textMain, letterSpacing: '0.04em',
                                    }}>
                                        {settings.phone || '—'}
                                    </span>
                                </div>

                                {settings.city ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <MapPin size={11} color={MAIN} />
                                        <span style={{
                                            fontSize: 10, fontWeight: 700, color: textSub,
                                            textTransform: 'uppercase', letterSpacing: '0.1em',
                                        }}>
                                            {settings.city}
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: 9, color: textSub, letterSpacing: '0.08em' }}>
                                        maalem.pro
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Live update hint */}
                        <p style={{ margin: 0, fontSize: 10, color: '#4b5563', textAlign: 'center' }}>
                            {language === 'ar'
                                ? '⚡ البطاقة تتحدث فوراً عند الكتابة'
                                : '⚡ La carte se met à jour en temps réel'}
                        </p>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 420 }}>
                            <button onClick={handleDownload} disabled={isGenerating}
                                style={{
                                    flex: 1, padding: '12px 0',
                                    background: '#1F2937', color: '#e5e7eb',
                                    border: '1px solid #374151',
                                    borderRadius: 10, fontSize: 13, fontWeight: 700,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    opacity: isGenerating ? 0.6 : 1,
                                }}>
                                <Download size={15} />
                                {language === 'ar' ? 'تحميل' : 'Télécharger'}
                            </button>

                            <button onClick={handleWhatsAppShare} disabled={isGenerating}
                                style={{
                                    flex: 1, padding: '12px 0',
                                    background: `linear-gradient(135deg,${MAIN},${DARK_ACC})`,
                                    color: isDark ? '#111827' : '#fff',
                                    border: 'none',
                                    borderRadius: 10, fontSize: 13, fontWeight: 800,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                    opacity: isGenerating ? 0.6 : 1,
                                    boxShadow: `0 4px 20px ${MAIN}44`,
                                }}>
                                <MessageCircle size={15} />
                                {language === 'ar' ? 'واتساب' : 'WhatsApp'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
