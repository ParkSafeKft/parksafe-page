'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQSection() {
    const { t, language } = useLanguage();
    const [openItems, setOpenItems] = useState<number[]>([]);

    const faqData: FAQItem[] = Array.from({ length: 7 }, (_, index) => ({
        question: t(`faq.q${index + 1}`),
        answer: t(`faq.a${index + 1}`),
    }));

    const toggleItem = (index: number) => {
        setOpenItems((current) =>
            current.includes(index)
                ? current.filter((item) => item !== index)
                : [...current, index]
        );
    };

    return (
        <section id="faq" className="bg-[#f7f9f6] py-24 lg:py-32">
            <div className="mx-auto grid w-full max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:px-12">
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-32">
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">ParkSafe / 06</p>
                        <h2 className="max-w-xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-[#101512] text-balance sm:text-6xl">
                            {t('faq.title')}
                        </h2>
                        <p className="mt-7 max-w-md text-lg leading-8 text-[#626e66] text-pretty">{t('faq.subtitle')}</p>
                        <Link
                            href="/contact"
                            className="mt-8 inline-flex items-center gap-2 border-b border-[#101512]/25 pb-1 text-sm font-bold text-[#101512] transition-colors hover:border-[#34aa56] hover:text-[#258642] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                        >
                            {language === 'en' ? 'Still need help? Contact us' : 'Maradt kérdésed? Írj nekünk'}
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="border-t border-[#101512]/20 lg:col-span-7">
                    {faqData.map((item, index) => {
                        const isOpen = openItems.includes(index);

                        return (
                            <Collapsible
                                key={item.question}
                                open={isOpen}
                                onOpenChange={() => toggleItem(index)}
                                className="border-b border-[#101512]/20"
                            >
                                <CollapsibleTrigger className="group flex w-full cursor-pointer items-start justify-between gap-8 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56] sm:py-8">
                                    <span className="flex gap-5 sm:gap-8">
                                        <span className="pt-1 text-[11px] font-bold tracking-[0.14em] text-[#258642]">0{index + 1}</span>
                                        <span className="text-lg font-black tracking-[-0.02em] text-[#101512] sm:text-xl">
                                            {item.question}
                                        </span>
                                    </span>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? "border-[#34aa56] bg-[#34aa56] text-white" : "border-[#101512]/20 text-[#101512] group-hover:border-[#34aa56]"}`}>
                                        <ChevronDown
                                            size={17}
                                            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    </span>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <div className="pb-8 pl-10 pr-14 text-base leading-8 text-[#58645c] sm:pl-[4.6rem]">
                                        <p className="max-w-2xl text-pretty">{item.answer}</p>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
