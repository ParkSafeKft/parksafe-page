'use client';

import { motion } from "framer-motion";
import { Lock, MapPin, Smartphone, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
    number: number;
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function HowItWorks() {
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
        <section id="how-it-works" className="bg-white py-24 lg:py-32">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-8 border-b border-[#101512]/15 pb-12 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-8">
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">ParkSafe / 04</p>
                        <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#101512] text-balance sm:text-6xl lg:text-7xl">
                            {t('howItWorks.title')}
                        </h2>
                    </div>
                    <p className="text-lg leading-8 text-[#626e66] lg:col-span-4">{t('howItWorks.subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => (
                        <motion.article
                            key={step.number}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: index * 0.08, duration: 0.5 }}
                            className="group relative border-b border-[#101512]/15 py-10 md:border-r md:px-8 md:odd:pl-0 md:even:border-r-0 lg:min-h-[430px] lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                        >
                            <div className="flex items-start justify-between">
                                <span className="text-[clamp(4.5rem,8vw,7rem)] font-black leading-none tracking-[-0.08em] text-[#101512]/8 transition-colors group-hover:text-[#34aa56]/20">
                                    0{step.number}
                                </span>
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#258642]">
                                    <step.icon className="h-5 w-5" />
                                </span>
                            </div>
                            <div className="mt-20 lg:absolute lg:bottom-12 lg:left-8 lg:right-8 lg:mt-0 lg:first:left-0">
                                <h3 className="text-2xl font-black tracking-[-0.03em] text-[#101512]">{step.title}</h3>
                                <p className="mt-4 max-w-xs leading-7 text-[#657168]">{step.description}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
