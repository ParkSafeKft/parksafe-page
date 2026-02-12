'use client';

import { History, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AboutTimeline } from "@/components/AboutTimeline";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-24 font-sans text-zinc-900 selection:bg-[#34aa56] selection:text-white">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-4 shadow-sm border border-emerald-100">
                        <History className="text-[#34aa56] w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900">
                        {t('about.page.title')}
                    </h1>
                    <p className="text-xl text-zinc-600 max-w-3xl mx-auto font-medium leading-relaxed">
                        {t('about.page.subtitle')}
                    </p>
                </div>

            </div>

            {/* Timeline Section */}
            <AboutTimeline />

            {/* CTA Section */}
            <div className="container mx-auto px-4 max-w-4xl mt-24">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-[#34aa56] to-emerald-600 rounded-[2rem] p-12 md:p-16 text-center shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            {t('about.page.cta.title')}
                        </h2>
                        <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
                            {t('about.page.cta.desc')}
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#34aa56] font-bold rounded-full hover:bg-zinc-50 hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            {t('about.page.cta.button')}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
