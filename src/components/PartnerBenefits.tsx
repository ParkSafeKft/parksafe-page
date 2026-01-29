'use client';

import { Ticket, Wrench, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Benefit {
    icon: LucideIcon;
    title: string;
    description: string;
}

function PartnerBenefits() {
    const { t } = useLanguage();

    const benefits: Benefit[] = [
        {
            icon: Ticket,
            title: t('partners.benefit1.title'),
            description: t('partners.benefit1.desc'),
        },
        {
            icon: Wrench,
            title: t('partners.benefit2.title'),
            description: t('partners.benefit2.desc'),
        },
        {
            icon: ShoppingBag,
            title: t('partners.benefit3.title'),
            description: t('partners.benefit3.desc'),
        },
    ];

    return (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full">
                        {t('partners.comingSoon')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('partners.title')}</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        {t('partners.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => {
                        const IconComponent = benefit.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-[#34aa56]">
                                    <IconComponent size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default PartnerBenefits;
