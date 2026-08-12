'use client';

import { Award, Globe2, Lightbulb, Rocket, TrendingUp, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

export function AboutTimeline() {
    const { t } = useLanguage();

    const milestones = [
        {
            year: t('about.page.timeline.milestone1.year'),
            badge: t('about.page.timeline.milestone1.badge'),
            title: t('about.page.timeline.milestone1.title'),
            desc: t('about.page.timeline.milestone1.desc'),
            icon: Lightbulb,
            imageAlt: t('about.page.timeline.milestone1.imageAlt'),
            image: '/mgk.jpg',
            imageOrientation: 'portrait' as const,
        },
        {
            year: t('about.page.timeline.milestone2.year'),
            badge: t('about.page.timeline.milestone2.badge'),
            title: t('about.page.timeline.milestone2.title'),
            desc: t('about.page.timeline.milestone2.desc'),
            icon: Rocket,
            imageAlt: t('about.page.timeline.milestone2.imageAlt'),
            image: null,
        },
        {
            year: t('about.page.timeline.milestone3.year'),
            badge: t('about.page.timeline.milestone3.badge'),
            title: t('about.page.timeline.milestone3.title'),
            desc: t('about.page.timeline.milestone3.desc'),
            achievement: t('about.page.timeline.milestone3.achievement'),
            icon: Trophy,
            imageAlt: t('about.page.timeline.milestone3.imageAlt'),
            image: '/start.jpg',
            imageOrientation: 'landscape' as const,
        },
        {
            year: t('about.page.timeline.milestone4.year'),
            badge: t('about.page.timeline.milestone4.badge'),
            title: t('about.page.timeline.milestone4.title'),
            desc: t('about.page.timeline.milestone4.desc'),
            achievement: t('about.page.timeline.milestone4.achievement'),
            icon: Award,
            imageAlt: t('about.page.timeline.milestone4.imageAlt'),
            image: '/virtus.JPG',
            imageOrientation: 'landscape' as const,
        },
        {
            year: t('about.page.timeline.milestone5.year'),
            badge: t('about.page.timeline.milestone5.badge'),
            title: t('about.page.timeline.milestone5.title'),
            desc: t('about.page.timeline.milestone5.desc'),
            achievement: t('about.page.timeline.milestone5.achievement'),
            icon: Trophy,
            imageAlt: t('about.page.timeline.milestone5.imageAlt'),
            image: null,
        },
        {
            year: t('about.page.timeline.milestone6.year'),
            badge: t('about.page.timeline.milestone6.badge'),
            title: t('about.page.timeline.milestone6.title'),
            desc: t('about.page.timeline.milestone6.desc'),
            achievement: t('about.page.timeline.milestone6.achievement'),
            icon: Globe2,
            imageAlt: t('about.page.timeline.milestone6.imageAlt'),
            image: '/parksafe-world-final-showcase.jpg',
            imageOrientation: 'landscape' as const,
        },
        {
            year: t('about.page.timeline.milestone7.year'),
            badge: t('about.page.timeline.milestone7.badge'),
            title: t('about.page.timeline.milestone7.title'),
            desc: t('about.page.timeline.milestone7.desc'),
            icon: TrendingUp,
            imageAlt: t('about.page.timeline.milestone7.imageAlt'),
            image: '/parksafe-world-final-team.jpg',
            imageOrientation: 'landscape' as const,
        },
    ];

    return (
        <section className="bg-white py-24 lg:py-32">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-8 border-b border-[#101512]/20 pb-12 lg:grid-cols-12 lg:items-end">
                    <motion.h2
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true, amount: 0.4 }}
                        className="text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#101512] text-balance sm:text-6xl lg:col-span-8 lg:text-7xl"
                    >
                        {t('about.page.timeline.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.06 }}
                        viewport={{ once: true, amount: 0.4 }}
                        className="max-w-lg text-lg leading-8 text-[#626e66] text-pretty lg:col-span-4"
                    >
                        {t('about.page.timeline.subtitle')}
                    </motion.p>
                </div>

                <div>
                    {milestones.map((milestone, index) => (
                        <motion.article
                            key={milestone.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55 }}
                            viewport={{ once: true, amount: 0.2 }}
                            className="grid gap-8 border-b border-[#101512]/15 py-12 last:border-b-0 lg:grid-cols-12 lg:gap-10 lg:py-16"
                        >
                            <div className="flex items-start justify-between lg:col-span-2 lg:block">
                                <span className="text-5xl font-black leading-none tracking-[-0.07em] text-[#101512]/12">
                                    0{index + 1}
                                </span>
                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#258642] lg:mt-8">
                                    {milestone.year}
                                </p>
                            </div>

                            <div className={milestone.image ? "lg:col-span-6" : "lg:col-span-8"}>
                                <div className="mb-7 flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#258642]">
                                        <milestone.icon className="h-5 w-5" />
                                    </span>
                                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#667169]">
                                        {milestone.badge}
                                    </span>
                                </div>

                                <h3 className="max-w-3xl text-3xl font-black leading-[1.02] tracking-[-0.04em] text-[#101512] text-balance sm:text-4xl">
                                    {milestone.title}
                                </h3>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-[#5c6860] text-pretty">
                                    {milestone.desc}
                                </p>

                                {milestone.achievement && (
                                    <div className="mt-7 flex max-w-2xl items-center gap-3 border-t border-[#101512]/15 pt-5 text-sm font-bold text-[#245d35]">
                                        <Trophy className="h-4 w-4 shrink-0 text-[#34aa56]" />
                                        <span>{milestone.achievement.replace('🏆 ', '')}</span>
                                    </div>
                                )}
                            </div>

                            {milestone.image && (
                                <div className="lg:col-span-4">
                                    <div className={`relative w-full overflow-hidden rounded-[1.5rem] bg-[#edf1ed] ${
                                        milestone.imageOrientation === 'portrait' ? 'aspect-[4/5]' : 'aspect-[16/10]'
                                    }`}>
                                        <Image
                                            src={milestone.image}
                                            alt={milestone.imageAlt}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 34vw"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
