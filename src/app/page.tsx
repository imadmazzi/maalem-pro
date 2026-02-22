'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Zap, Play, CheckCircle, FileText, Smartphone, LayoutTemplate, Send, Shield, Users, Briefcase, Settings, Star, Crown } from 'lucide-react';

export default function LandingPage() {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(!!auth);
  }, []);

  return (
    <div className="font-sans text-slate-200 bg-[#0F172A] min-h-screen overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-32 lg:py-0 overflow-hidden">

        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[20%] right-[25%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">

            {/* LEFT SIDE: Text Content */}
            <div className={`w-full lg:w-1/2 flex flex-col ${language === 'ar' ? 'items-center lg:items-end text-center lg:text-right' : 'items-center lg:items-start text-center lg:text-left'} z-20 order-2 lg:order-1`} dir={language === 'ar' ? 'rtl' : 'ltr'}>

              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                <span className={`text-slate-300 font-medium text-xs tracking-wide ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  {language === 'ar' ? 'منصة الفواتير رقم 1 في المغرب' : 'La plateforme de facturation N°1 au Maroc'}
                </span>
              </div>

              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black ${language === 'ar' ? 'font-cairo' : 'font-sans'} leading-normal lg:leading-tight mb-4 text-white tracking-tight max-w-3xl`}>
                {language === 'ar' ? 'بان محترف' : 'Soyez Pro'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-500 to-cyan-500">
                  {language === 'ar' ? 'قدام كليانك' : 'Devant vos clients'}
                </span>
              </h1>

              <p className={`text-lg md:text-xl text-slate-400 mb-8 ${language === 'ar' ? 'font-cairo' : 'font-sans'} leading-relaxed max-w-lg font-light`}>
                {language === 'ar'
                  ? 'حول خدماتك إلى عمل تجاري احترافي. أسهل طريقة لإنشاء الفواتير، تنظيم العربون، وإدارة الزبناء.'
                  : 'Transformez vos services en business pro. Créez des devis, gérez les acomptes et vos clients facilement.'}
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 justify-center ${language === 'ar' ? 'lg:justify-end' : 'lg:justify-start'} w-full mb-12`}>
                <Link href={isAuthenticated ? "/dashboard" : "/login"} className="w-full sm:w-auto">
                  <button className={`w-full sm:w-auto px-8 py-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-lg font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-1`}>
                    <Zap className="w-5 h-5" />
                    <span>{isAuthenticated ? (language === 'ar' ? 'لوحة التحكم' : 'Tableau de bord') : (language === 'ar' ? 'تجربة مجانية' : 'Essai Gratuit')}</span>
                  </button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <button className={`w-full sm:w-auto px-8 py-4 rounded-lg border border-slate-700 hover:bg-slate-800 text-white text-lg font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} transition-all backdrop-blur-sm flex items-center justify-center gap-2 hover:border-slate-500`}>
                    <Play className="w-5 h-5" />
                    <span>{language === 'ar' ? 'كيفاش كيخدم؟' : 'Comment ça marche ?'}</span>
                  </button>
                </Link>
              </div>

              {/* Stats / Social Proof - Restored */}
              <div className="w-full flex justify-center lg:justify-end">
                <div className="inline-flex items-center gap-4 bg-slate-900/60 backdrop-blur-md p-4 pr-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <div className="flex -space-x-4 space-x-reverse">
                    {/* Avatar Images */}
                    {['b-1.jpg', 'b-2.jpg', 'b-3.jpg', 'b-4.jpg'].map((img, i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0F172A] overflow-hidden relative">
                        <img src={`/${img}`} alt={`Professional Artisan ${i + 1}`} className="w-full h-full object-cover text-xs text-slate-500" />
                      </div>
                    ))}
                  </div>
                  <div className="text-right border-r border-slate-600 pr-4 mr-2">
                    <div className="text-white font-bold text-xl font-sans leading-none mb-1">+200</div>
                    <div className="text-emerald-400 text-xs font-cairo flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      حرفي نشيط
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Hexagon Images (Balanced Triangle + Decor) */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative h-[500px] lg:h-[650px] z-10 mt-12 lg:mt-0 order-2 pointer-events-none select-none">
              <div className="relative w-full max-w-[500px] h-full">

                {/* --- DECORATIF: Glow & Shapes --- */}
                {/* 1. Large Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-500/10 blur-[90px] rounded-full -z-10"></div>

                {/* 2. Rotating Tech Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-emerald-500/10 rounded-full animate-[spin_30s_linear_infinite] -z-10 border-dashed"></div>

                {/* 3. Floating Particles */}
                <div className="absolute top-[5%] left-[10%] w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute top-[40%] right-[-15%] w-3 h-3 bg-emerald-500/30 rounded-full blur-[2px] animate-float-slow"></div>
                <div className="absolute bottom-[5%] left-[20%] w-1 h-1 bg-white/50 rounded-full animate-float"></div>

                {/* Top-Right Hexagon (Worker) - Centered Mobile Layout */}
                <div className="absolute top-[5%] left-1/2 translate-x-[-10%] lg:top-[8%] lg:left-auto lg:right-0 lg:translate-x-0 w-40 h-40 lg:w-56 lg:h-56 z-10 animate-float-delayed hover:z-40 transition-all duration-500 ease-out pointer-events-auto group hover:scale-110 hover:-rotate-2">
                  <div className="w-full h-full relative filter drop-shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:drop-shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-500 group-hover:brightness-125 transition-all duration-500" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}></div>
                    <div className="absolute inset-[3px] bg-slate-900" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}>
                      <img src="/hex-5.png" className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition-all duration-700 ease-in-out saturate-[0.8] group-hover:saturate-150 group-hover:scale-110" alt="Professional Worker" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent pointer-events-none group-hover:opacity-50 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>

                {/* Bottom-Right Hexagon (Finisher) - Centered Mobile Layout */}
                <div className="absolute bottom-[5%] left-1/2 translate-x-[-10%] lg:bottom-[8%] lg:left-auto lg:right-0 lg:translate-x-0 w-40 h-40 lg:w-56 lg:h-56 z-10 animate-float-slow hover:z-40 transition-all duration-500 ease-out pointer-events-auto group hover:scale-110 hover:rotate-2">
                  <div className="w-full h-full relative filter drop-shadow-[0_0_20px_rgba(16,185,129,0.25)] group-hover:drop-shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-500 group-hover:brightness-125 transition-all duration-500" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}></div>
                    <div className="absolute inset-[3px] bg-slate-900" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}>
                      <img src="/hex-3.jpg" className="w-full h-full object-cover object-center opacity-90 group-hover:opacity-100 transition-all duration-700 ease-in-out saturate-[0.8] group-hover:saturate-150 group-hover:scale-110" alt="Craftsman Finisher" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent pointer-events-none group-hover:opacity-50 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>

                {/* Middle-Left Hexagon (Maalem - Center) - Centered Mobile Layout */}
                <div className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-1/2 lg:right-44 lg:left-auto lg:translate-x-0 w-52 h-52 lg:w-60 lg:h-60 z-20 animate-float hover:z-40 transition-all duration-500 ease-out pointer-events-auto group hover:scale-110 hover:-rotate-1">
                  <div className="w-full h-full relative filter drop-shadow-[0_0_30px_rgba(16,185,129,0.35)] group-hover:drop-shadow-[0_0_60px_rgba(16,185,129,0.7)] transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-500 group-hover:brightness-125 transition-all duration-500" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}></div>
                    <div className="absolute inset-[3px] bg-slate-900" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }}>
                      <img src="/hex-1.jpg" className="w-full h-full object-cover object-center opacity-100 transition-all duration-700 ease-in-out saturate-[0.9] group-hover:saturate-150 group-hover:scale-110" alt="Maalem Electrician" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 to-transparent pointer-events-none group-hover:opacity-50 transition-opacity duration-500"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-white mb-2`}>
              {language === 'ar' ? 'ماذا يقول' : 'Témoignages'} <span className="text-emerald-400">{language === 'ar' ? 'الحرفيون؟' : 'Clients'}</span>
            </h2>
            <p className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-lg`}>
              {language === 'ar' ? 'آراء الحرفيين الذين يثقون بنا' : 'Avis des artisans qui nous font confiance'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`bg-[#1E293B] p-8 rounded-2xl relative ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <p className={`text-slate-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'} leading-relaxed mb-4`}>
                "{language === 'ar' ? 'تطبيق غيّر حياتي المهنية. كنت كنضيع الوقت فالفواتير، دابا كلشي ساهل.' : 'Une application qui a changé ma vie professionnelle. Je perdais du temps avec les factures, maintenant tout est facile.'}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-[#0F172A]">K</div>
                <div>
                  <div className={`font-bold text-white ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{language === 'ar' ? 'كريم بناني' : 'Karim Bennani'}</div>
                  <div className={`text-xs text-emerald-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{language === 'ar' ? 'كهربائي' : 'Électricien'}</div>
                </div>
              </div>
            </div>
            <div className={`bg-[#1E293B] p-8 rounded-2xl relative ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <p className={`text-slate-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'} leading-relaxed mb-4`}>
                "{language === 'ar' ? 'أفضل استثمار درتو لخدمتي. الزبناء كيعجبهم النظام والاحترافية.' : 'Le meilleur investissement pour mon travail. Les clients apprécient l\'organisation et le professionnalisme.'}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">R</div>
                <div>
                  <div className={`font-bold text-white ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{language === 'ar' ? 'رشيد العلمي' : 'Rachid El Alami'}</div>
                  <div className={`text-xs text-blue-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{language === 'ar' ? 'نجار' : 'Menuisier'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-white mb-2`}>
              {language === 'ar' ? 'مميزات' : 'Fonctionnalités'} <span className="text-emerald-400">{language === 'ar' ? 'حصرية' : 'Exclusives'}</span>
            </h2>
            <p className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-lg`}>
              {language === 'ar' ? 'كل ما تحتاجه لتنظيم عملك' : 'Tout ce dont vous avez besoin pour organiser votre travail'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {[
              { icon: Zap, title: language === 'ar' ? "سريع وسهل" : "Rapide & Facile", desc: language === 'ar' ? "أنشئ الفواتير في ثواني معدودة" : "Créez vos factures en quelques secondes", color: "emerald" },
              { icon: Shield, title: language === 'ar' ? "آمن ومحفوظ" : "Sécurisé & Sauvegardé", desc: language === 'ar' ? "بياناتك محفوظة في السحابة بأمان" : "Vos données sont sécurisées dans le cloud", color: "blue" },
              { icon: Smartphone, title: language === 'ar' ? "يعمل في كل مكان" : "Accessible partout", desc: language === 'ar' ? "على هاتفك أو حاسوبك، في أي وقت" : "Sur mobile ou PC, à tout moment", color: "purple" },
            ].map((item, i) => (
              <div key={i} className={`bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors group ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className={`w-12 h-12 rounded-lg bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-400 mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-xl font-bold text-white mb-2 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{item.title}</h3>
                <p className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-lg`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0F172A] relative">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} mb-4 text-white`}>
              {language === 'ar' ? 'كيفاش' : 'Comment'} <span className="text-emerald-400">{language === 'ar' ? 'كيخدم؟' : 'ça marche ?'}</span>
            </h2>
            <p className={`text-slate-400 max-w-2xl mx-auto ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-lg`}>
              {language === 'ar' ? 'ثلاث خطوات بسيطة لبدء العمل باحترافية.' : 'Trois étapes simples pour commencer à travailler comme un pro.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {/* Line */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-l from-transparent via-emerald-500/20 to-transparent"></div>

            {[
              { step: "01", title: language === 'ar' ? "سجل حسابك" : "Créez votre compte", desc: language === 'ar' ? "أدخل معلوماتك الشخصية في أقل من دقيقة." : "Entrez vos informations en moins d'une minute.", icon: LayoutTemplate },
              { step: "02", title: language === 'ar' ? "أنشئ الدوفي" : "Créez votre Devis", desc: language === 'ar' ? "أضف الزبون والخدمات واحصل على المجموع تلقائياً." : "Ajoutez client et services, total calculé automatiquement.", icon: FileText },
              { step: "03", title: language === 'ar' ? "شارك عبر واتساب" : "Partagez via WhatsApp", desc: language === 'ar' ? "أرسل الدوفي PDF لزبونك واضمن حقك." : "Envoyez le devis PDF au client.", icon: Send }
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-center text-center group z-10">
                <div className="w-24 h-24 rounded-full bg-[#1E293B] border-4 border-[#0F172A] flex items-center justify-center relative mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-emerald-500/10 text-emerald-400">
                  <item.icon className="w-10 h-10" />
                  <div className={`absolute -top-2 ${language === 'ar' ? '-right-2' : '-left-2'} w-8 h-8 rounded-full bg-emerald-500 text-[#0F172A] font-bold flex items-center justify-center font-sans border-4 border-[#0F172A]`}>
                    {item.step}
                  </div>
                </div>
                <h3 className={`text-2xl font-bold text-white mb-3 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{item.title}</h3>
                <p className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'} leading-relaxed max-w-xs`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#0F172A] relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-white`}>
              {language === 'ar' ? 'خدماتنا' : 'Nos Services'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {[
              { icon: FileText, title: language === 'ar' ? "إدارة الفواتير" : "Facturation" },
              { icon: Users, title: language === 'ar' ? "إدارة الزبناء" : "Gestion Clients" },
              { icon: Briefcase, title: language === 'ar' ? "تنظيم المشاريع" : "Gestion Projets" },
              { icon: Settings, title: language === 'ar' ? "تخصيص كامل" : "Personnalisation" }
            ].map((s, i) => (
              <div key={i} className="flex gap-4 items-center bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors">
                <s.icon className="w-8 h-8 text-emerald-400" />
                <span className={`text-lg font-bold text-slate-200 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-900/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-white mb-4`}>
              {language === 'ar' ? 'باقات' : 'Nos'} <span className="text-emerald-400">{language === 'ar' ? 'الاشتراك' : 'Offres'}</span>
            </h2>
            <p className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'} text-lg`}>
              {language === 'ar' ? 'اختر الخطة المناسبة لعملك' : 'Choisissez le plan adapté à votre activité'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Free Plan */}
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8 flex flex-col relative hover:border-slate-600 transition-colors">
              <div className="mb-6">
                <h3 className={`text-xl font-bold text-white ${language === 'ar' ? 'font-cairo' : 'font-sans'} mb-2`}>
                  {language === 'ar' ? 'الباقة المجانية' : 'Offre Gratuite'}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white font-sans">0</span>
                  <span className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                    {language === 'ar' ? 'درهم / مدى الحياة' : 'DH / Illimité'}
                  </span>
                </div>
                <p className={`text-slate-500 text-sm mt-2 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  {language === 'ar' ? 'للحرفيين المبتدئين' : 'Pour commencer'}
                </p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className={`flex items-center gap-3 text-slate-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{language === 'ar' ? '3 دوفيات (فواتير) مجانية' : '3 Devis gratuits'}</span>
                </li>
                <li className={`flex items-center gap-3 text-slate-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{language === 'ar' ? 'إدارة الزبناء الأساسية' : 'Gestion clients basique'}</span>
                </li>
                <li className={`flex items-center gap-3 text-slate-300 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{language === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
                </li>
              </ul>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="w-full">
                <Button variant="outline" className={`w-full border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700 ${language === 'ar' ? 'font-cairo' : 'font-sans'} h-12 text-lg`}>
                  {language === 'ar' ? 'ابدأ مجاناً' : 'Commencer gratuitement'}
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-800/80 border-2 border-emerald-500 rounded-2xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(16,185,129,0.15)] transform md:-translate-y-4">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-[#0F172A] px-4 py-1 rounded-full text-sm font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'} shadow-lg flex items-center gap-1`}>
                <Star className="w-3 h-3 fill-current" />
                {language === 'ar' ? 'الأكثر طلباً' : 'Le plus populaire'}
              </div>
              <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                {language === 'ar' ? 'عرض محدود' : 'Offre Limitée'}
              </div>

              <div className="mb-6 mt-2">
                <h3 className={`text-xl font-bold text-white ${language === 'ar' ? 'font-cairo' : 'font-sans'} mb-2 flex items-center gap-2`}>
                  {language === 'ar' ? 'باقة المحترفين' : 'Offre Pro'}
                  <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white font-sans">49</span>
                  <span className={`text-slate-400 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                    {language === 'ar' ? 'درهم / شهر' : 'DH / Mois'}
                  </span>
                </div>
                <p className={`text-emerald-400 text-sm mt-2 font-bold ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  {language === 'ar' ? 'استثمار صغير، ربح كبير' : 'Petit investissement, Grand profit'}
                </p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className={`flex items-center gap-3 text-white font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <span>{language === 'ar' ? 'فواتير غير محدودة (Unlimited)' : 'Devis & Factures illimités'}</span>
                </li>
                <li className={`flex items-center gap-3 text-white font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <span>{language === 'ar' ? 'اللوغو ديالك في الفواتير' : 'Logo personnel sur documents'}</span>
                </li>
                <li className={`flex items-center gap-3 text-white font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <span>{language === 'ar' ? 'تنظيم السلعة (Gestion de Stock)' : 'Gestion de Stock'}</span>
                </li>
                <li className={`flex items-center gap-3 text-white font-medium ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  <div className="bg-emerald-500/20 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <span>{language === 'ar' ? 'دعم فني واتساب 7/7' : 'Support WhatsApp 7j/7'}</span>
                </li>
              </ul>

              <Link href="/signup" className="w-full">
                <Button className={`w-full bg-emerald-500 hover:bg-emerald-400 text-[#0F172A] font-bold h-14 text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
                  {language === 'ar' ? 'ترقية الحساب الآن' : 'Passer au Pro'}
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-[#020617] py-12 border-t border-slate-800/50 text-center">
        <p className={`text-slate-500 ${language === 'ar' ? 'font-cairo' : 'font-sans'}`}>
          © 2024 MaalemPro. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}
        </p>
      </footer>

    </div>
  );
}
