'use client';

import { ArrowUpRight, Clock, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white text-[#101512] selection:bg-[#34aa56] selection:text-white">
            <section className="relative overflow-hidden border-b border-[#101512]/10 bg-[#f2f6f1] pb-20 pt-36 lg:pb-28 lg:pt-44">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,18,0.055)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
                    <h1 className="text-[clamp(4.2rem,12vw,11rem)] font-black leading-[0.78] tracking-[-0.08em] lg:col-span-8">
                        {t('contact.title')}
                    </h1>
                    <p className="max-w-lg border-t border-[#101512]/20 pt-6 text-lg font-medium leading-8 text-[#526058] text-pretty lg:col-span-4">
                        {t('contact.subtitle')}
                    </p>
                </div>
            </section>

            <section className="py-24 lg:py-32">
                <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12">
                    <div className="lg:col-span-5">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-[#edf1ed]">
                            <Image
                                src="/psz.png"
                                alt="Perjési Szabolcs"
                                fill
                                priority
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 42vw"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:col-span-7">
                        <div className="border-b border-[#101512]/20 pb-10">
                            <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.045em] sm:text-5xl">
                                Perjési Szabolcs
                            </h2>
                            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#258642]">
                                {t('contact.role')}
                            </p>
                        </div>

                        <div>
                            <a
                                href="mailto:info@parksafe.hu"
                                className="group grid grid-cols-[48px_1fr] items-center gap-4 border-b border-[#101512]/15 py-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56] sm:grid-cols-[56px_1fr_auto]"
                            >
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#258642]">
                                    <Mail className="h-5 w-5" />
                                </span>
                                <span>
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#7a857d]">Email</span>
                                    <span className="mt-1 block text-xl font-black tracking-[-0.025em] sm:text-2xl">info@parksafe.hu</span>
                                </span>
                                <ArrowUpRight className="hidden h-5 w-5 text-[#101512]/25 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#34aa56] sm:block" />
                            </a>

                            <a
                                href="tel:+36307212524"
                                className="group grid grid-cols-[48px_1fr] items-center gap-4 border-b border-[#101512]/15 py-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56] sm:grid-cols-[56px_1fr_auto]"
                            >
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#258642]">
                                    <Phone className="h-5 w-5" />
                                </span>
                                <span>
                                    <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-[#7a857d]">Telefon</span>
                                    <span className="mt-1 block text-xl font-black tracking-[-0.025em] sm:text-2xl">+36 30 721 2524</span>
                                </span>
                                <ArrowUpRight className="hidden h-5 w-5 text-[#101512]/25 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#34aa56] sm:block" />
                            </a>
                        </div>

                        <div className="mt-10 grid gap-6 rounded-[1.5rem] bg-[#101512] p-7 text-white sm:grid-cols-[56px_1fr] sm:items-start sm:p-9">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/8 text-[#58ce79]">
                                <Clock className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="text-xl font-black tracking-[-0.025em]">{t('contact.responseTimeTitle')}</h3>
                                <p className="mt-2 max-w-lg leading-7 text-white/55">{t('contact.responseTimeDesc')}</p>
                            </div>
                        </div>

                        <p className="mt-auto border-t border-[#101512]/15 pt-8 text-base leading-8 text-[#667169] text-pretty lg:mt-10">
                            {t('contact.footerNote')}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
