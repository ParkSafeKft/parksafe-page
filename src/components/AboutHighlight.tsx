'use client';

import { motion } from "framer-motion";
import { Trophy, Award, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export function AboutHighlight() {
    const { t } = useLanguage();

    const cards = [
        {
            icon: Trophy,
            badge: t('about.highlight.card1.badge'),
            title: t('about.highlight.card1.title'),
            desc: t('about.highlight.card1.desc'),
            color: 'amber',
        },
        {
            icon: Award,
            badge: t('about.highlight.card2.badge'),
            title: t('about.highlight.card2.title'),
            desc: t('about.highlight.card2.desc'),
            color: 'blue',
        },
        {
            icon: Rocket,
            badge: t('about.highlight.card3.badge'),
            title: t('about.highlight.card3.title'),
            desc: t('about.highlight.card3.desc'),
            color: 'emerald',
        },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4"
                    >
                        {t('about.highlight.title')}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-lg text-zinc-600 max-w-2xl mx-auto"
                    >
                        {t('about.highlight.subtitle')}
                    </motion.p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        const colorClasses = {
                            amber: {
                                bg: 'bg-amber-50',
                                border: 'border-amber-200',
                                icon: 'text-amber-600',
                                badge: 'bg-amber-100 text-amber-700',
                            },
                            blue: {
                                bg: 'bg-blue-50',
                                border: 'border-blue-200',
                                icon: 'text-blue-600',
                                badge: 'bg-blue-100 text-blue-700',
                            },
                            emerald: {
                                bg: 'bg-emerald-50',
                                border: 'border-emerald-200',
                                icon: 'text-emerald-600',
                                badge: 'bg-emerald-100 text-emerald-700',
                            },
                        }[card.color as 'amber' | 'blue' | 'emerald'];

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="group bg-white rounded-[2rem] p-8 border border-zinc-200 hover:border-zinc-300 shadow-lg hover:shadow-xl transition-all"
                            >
                                {/* Icon */}
                                <div className={`w-16 h-16 ${colorClasses.bg} rounded-2xl flex items-center justify-center mb-6 border ${colorClasses.border} group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-8 h-8 ${colorClasses.icon}`} />
                                </div>

                                {/* Badge */}
                                <div className={`inline-block px-3 py-1 ${colorClasses.badge} rounded-full text-xs font-bold uppercase tracking-wider mb-4`}>
                                    {card.badge}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-zinc-900 mb-3">
                                    {card.title}
                                </h3>

                                {/* Description */}
                                <p className="text-zinc-600 leading-relaxed">
                                    {card.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <Link
                        href="/about"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-semibold rounded-full hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-900/20"
                    >
                        {t('about.highlight.cta')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
