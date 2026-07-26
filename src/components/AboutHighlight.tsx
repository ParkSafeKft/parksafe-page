'use client';

import { motion } from "framer-motion";
import { ArrowUpRight, Award, Rocket, Trophy } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export function AboutHighlight() {
    const { t } = useLanguage();

    const achievements = [
        {
            icon: Trophy,
            badge: t('about.highlight.card1.badge'),
            title: t('about.highlight.card1.title'),
            desc: t('about.highlight.card1.desc'),
        },
        {
            icon: Award,
            badge: t('about.highlight.card2.badge'),
            title: t('about.highlight.card2.title'),
            desc: t('about.highlight.card2.desc'),
        },
        {
            icon: Rocket,
            badge: t('about.highlight.card3.badge'),
            title: t('about.highlight.card3.title'),
            desc: t('about.highlight.card3.desc'),
        },
    ];

    return (
        <section className="bg-[#101512] py-24 text-white lg:py-32">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-10 border-b border-white/15 pb-14 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-8">
                        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-[#58ce79]">ParkSafe / 02</p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true, amount: 0.3 }}
                            className="max-w-4xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl"
                        >
                            {t('about.highlight.title')}
                        </motion.h2>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="mb-7 max-w-md text-lg leading-8 text-white/60 text-pretty">
                            {t('about.highlight.subtitle')}
                        </p>
                        <Link
                            href="/about"
                            className="inline-flex items-center gap-3 rounded-xl bg-[#34aa56] px-6 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#3dbd61] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#58ce79]"
                        >
                            {t('about.highlight.cta')}
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid md:grid-cols-3">
                    {achievements.map((achievement, index) => (
                        <motion.article
                            key={achievement.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            viewport={{ once: true, amount: 0.35 }}
                            className="group border-b border-white/15 py-10 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0 lg:py-14"
                        >
                            <div className="mb-16 flex items-start justify-between">
                                <achievement.icon className="h-7 w-7 text-[#58ce79]" />
                                <span className="text-5xl font-black tracking-[-0.06em] text-white/10 transition-colors group-hover:text-[#34aa56]/30">
                                    0{index + 1}
                                </span>
                            </div>
                            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#58ce79]">
                                {achievement.badge}
                            </p>
                            <h3 className="text-2xl font-black tracking-[-0.025em]">{achievement.title}</h3>
                            <p className="mt-4 max-w-sm leading-7 text-white/55">{achievement.desc}</p>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
