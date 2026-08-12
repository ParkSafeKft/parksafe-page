'use client';

import { ArrowUpRight, ShoppingBag, Ticket, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface Benefit {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function PartnerBenefits() {
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
        <section className="border-y border-[#101512]/10 bg-[#e9f6ec] py-24 lg:py-32">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="mb-12 flex items-center gap-4 sm:mb-16 sm:gap-6">
                    <span className="h-px flex-1 bg-[#258642]/30" aria-hidden="true" />
                    <div className="inline-flex items-center justify-center gap-3 text-center">
                        <span className="h-3 w-3 shrink-0 rounded-full bg-[#34aa56]" aria-hidden="true" />
                        <p className="text-xl font-black uppercase tracking-[0.1em] text-[#101512] sm:text-2xl lg:text-3xl">
                            {t('partners.comingSoon')}
                        </p>
                    </div>
                    <span className="h-px flex-1 bg-[#258642]/30" aria-hidden="true" />
                </div>

                <div className="grid gap-9 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-8">
                        <h2 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#101512] text-balance sm:text-6xl lg:text-7xl">
                            {t('partners.title')}
                        </h2>
                    </div>
                    <p className="max-w-lg text-lg leading-8 text-[#46604d] lg:col-span-4">{t('partners.subtitle')}</p>
                </div>

                <div className="mt-14 grid border-t border-[#101512]/20 md:grid-cols-3">
                    {benefits.map((benefit, index) => (
                        <article
                            key={benefit.title}
                            className="group border-b border-[#101512]/20 py-9 md:min-h-[340px] md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
                        >
                            <div className="mb-20 flex items-start justify-between">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#101512] text-[#58ce79]">
                                    <benefit.icon className="h-5 w-5" />
                                </span>
                                <ArrowUpRight className="h-5 w-5 text-[#101512]/25 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#258642]" />
                            </div>
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#258642]">0{index + 1}</p>
                            <h3 className="text-2xl font-black tracking-[-0.03em] text-[#101512]">{benefit.title}</h3>
                            <p className="mt-4 max-w-sm leading-7 text-[#54685a]">{benefit.description}</p>
                        </article>
                    ))}
                </div>

                <div className="border-t border-[#101512]/20 pt-12 text-center sm:pt-14">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#258642]">{t('partners.partnerInvite')}</p>
                    <h3 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-[-0.03em] text-[#101512] text-balance sm:text-3xl">
                        {t('partners.partnerHeading')}
                    </h3>
                    <Link
                        href="/contact"
                        className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#258642] px-6 py-3 text-sm font-black text-white transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-[#1f7338] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258642] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e9f6ec]"
                    >
                        {t('partners.partnerCta')}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
