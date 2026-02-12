'use client';

import { motion } from "framer-motion";
import { Trophy, Award, Rocket, Lightbulb, TrendingUp } from "lucide-react";
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
            icon: TrendingUp,
            imageAlt: t('about.page.timeline.milestone5.imageAlt'),
            image: null,
        },
    ];

    return (
        <section className="py-24 bg-zinc-50">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4"
                    >
                        {t('about.page.timeline.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-lg text-zinc-600 max-w-2xl mx-auto"
                    >
                        {t('about.page.timeline.subtitle')}
                    </motion.p>
                </div>

                {/* Timeline */}
                <div className="relative">
                    {/* Center Line - Hidden on mobile, visible on md+ */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#34aa56] via-emerald-400 to-zinc-300 transform -translate-x-1/2" />

                    {/* Milestones */}
                    <div className="space-y-12 md:space-y-24">
                        {milestones.map((milestone, index) => {
                            const Icon = milestone.icon;
                            const isLeft = index % 2 === 0;

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.15 }}
                                    viewport={{ once: true }}
                                    className={`relative flex flex-col md:flex-row items-center gap-8 ${
                                        isLeft ? 'md:flex-row-reverse' : ''
                                    }`}
                                >
                                    {/* Timeline Dot - Center point */}
                                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white border-4 border-[#34aa56] shadow-lg items-center justify-center z-10">
                                        <Icon className="w-7 h-7 text-[#34aa56]" />
                                    </div>

                                    {/* Content Card */}
                                    <div className={`w-full md:w-[calc(50%-4rem)] ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-zinc-100 hover:shadow-2xl transition-shadow">
                                            {/* Year Badge */}
                                            <div className={`inline-flex items-center gap-2 mb-4 ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                                                <span className="px-4 py-1.5 bg-[#34aa56] text-white text-sm font-bold rounded-full">
                                                    {milestone.year}
                                                </span>
                                                <span className="px-4 py-1.5 bg-zinc-100 text-zinc-700 text-sm font-semibold rounded-full">
                                                    {milestone.badge}
                                                </span>
                                            </div>

                                            {/* Icon for mobile */}
                                            <div className="md:hidden flex justify-center mb-6">
                                                <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-[#34aa56] flex items-center justify-center">
                                                    <Icon className="w-7 h-7 text-[#34aa56]" />
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                                                {milestone.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-zinc-600 leading-relaxed mb-6">
                                                {milestone.desc}
                                            </p>

                                            {/* Achievement Badge (for milestones 3 & 4) */}
                                            {milestone.achievement && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                                                    <span className="text-amber-600 font-semibold text-sm">
                                                        {milestone.achievement}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Image */}
                                            {milestone.image && (
                                                <div className={`relative w-full ${milestone.imageOrientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'} rounded-2xl overflow-hidden shadow-lg`}>
                                                    <Image
                                                        src={milestone.image}
                                                        alt={milestone.imageAlt}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Spacer for the other side (desktop only) */}
                                    <div className="hidden md:block w-[calc(50%-4rem)]" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
