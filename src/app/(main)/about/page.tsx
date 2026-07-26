'use client';

import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AboutTimeline } from "@/components/AboutTimeline";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-[#f7f9f6] text-[#101512] selection:bg-[#34aa56] selection:text-white">
            <section className="relative overflow-hidden border-b border-[#101512]/10 bg-[#f2f6f1] pb-20 pt-36 lg:pb-28 lg:pt-44">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,18,0.055)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        className="text-[clamp(4.8rem,13vw,12rem)] font-black leading-[0.76] tracking-[-0.085em] lg:col-span-8"
                    >
                        {t('about.page.title')}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.08 }}
                        className="max-w-lg border-t border-[#101512]/20 pt-6 text-lg font-medium leading-8 text-[#526058] text-pretty lg:col-span-4"
                    >
                        {t('about.page.subtitle')}
                    </motion.p>
                </div>
            </section>

            <AboutTimeline />

            <section className="relative overflow-hidden bg-[#34aa56] py-24 lg:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,18,0.12)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative mx-auto grid w-full max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:items-end lg:px-12"
                >
                    <div className="lg:col-span-8">
                        <h2 className="max-w-5xl text-5xl font-black leading-[0.88] tracking-[-0.06em] text-[#101512] text-balance sm:text-7xl lg:text-[7rem]">
                            {t('about.page.cta.title')}
                        </h2>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="mb-8 max-w-lg text-lg font-medium leading-8 text-[#183a21] text-pretty">
                            {t('about.page.cta.desc')}
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#101512] px-7 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#1c241f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            {t('about.page.cta.button')}
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
