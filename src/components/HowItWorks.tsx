'use client';

import { motion } from "framer-motion";
import { Smartphone, MapPin, Star, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
    number: number;
    icon: LucideIcon;
    title: string;
    description: string;
}

function HowItWorks() {
    const { t } = useLanguage();

    const steps: Step[] = [
        {
            number: 1,
            icon: Smartphone,
            title: t('howItWorks.step1.title'),
            description: t('howItWorks.step1.desc'),
        },
        {
            number: 2,
            icon: MapPin,
            title: t('howItWorks.step2.title'),
            description: t('howItWorks.step2.desc'),
        },
        {
            number: 3,
            icon: Star,
            title: t('howItWorks.step3.title'),
            description: t('howItWorks.step3.desc'),
        },
        {
            number: 4,
            icon: Lock,
            title: t('howItWorks.step4.title'),
            description: t('howItWorks.step4.desc'),
        },
    ];

    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{t('howItWorks.title')}</h2>
                    <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                        {t('howItWorks.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-zinc-200 via-emerald-100 to-zinc-200 -z-10" />

                    {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                            <motion.div
                                key={step.number}
                                className="flex flex-col items-center text-center relative"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-zinc-50 shadow-xl flex items-center justify-center mb-6 relative z-10">
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#34aa56] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                        {step.number}
                                    </div>
                                    <IconComponent size={32} className="text-zinc-700" />
                                </div>

                                <h3 className="text-xl font-bold text-zinc-900 mb-3">{step.title}</h3>
                                <p className="text-zinc-500 leading-relaxed text-sm px-4">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default HowItWorks;
