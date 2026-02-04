'use client';

import { Mail, User, Phone, Clock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans text-slate-900 selection:bg-[#34aa56] selection:text-white">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-4 shadow-sm">
                        <Mail className="text-[#34aa56] w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                        {t('contact.title')}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        {t('contact.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

                    {/* Main Contact Card */}
                    <div className="md:col-span-3 bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden group">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner border border-slate-200 shrink-0">
                                    <User size={40} className="text-slate-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Perjési Szabolcs</h2>
                                    <p className="text-[#34aa56] font-bold text-sm uppercase tracking-wider mt-1">{t('contact.role')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <a href="mailto:info@parksafe.hu" className="group/item flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                        <Mail size={20} className="text-[#34aa56]" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email</h3>
                                        <p className="text-lg font-semibold text-slate-900 group-hover/item:text-[#34aa56] transition-colors">info@parksafe.hu</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </a>

                                <a href="tel:+36307212524" className="group/item flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                                        <Phone size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Telefon</h3>
                                        <p className="text-lg font-semibold text-slate-900 group-hover/item:text-blue-600 transition-colors">+36 30 721 2524</p>
                                    </div>
                                    <ChevronRight className="ml-auto text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Info Cards */}
                    <div className="md:col-span-2">

                        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden h-full flex flex-col justify-center min-h-[320px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Clock size={32} className="text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('contact.responseTimeTitle')}</h3>
                                <p className="text-slate-400 font-medium">
                                    {t('contact.responseTimeDesc')}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-16 text-center">
                    <p className="text-slate-400 max-w-2xl mx-auto border-t border-slate-200 pt-8">
                        {t('contact.footerNote')}
                    </p>
                </div>

            </div>
        </div>
    );
}
