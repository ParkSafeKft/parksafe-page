'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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

function FAQSection() {
    const { t } = useLanguage();
    const [openItems, setOpenItems] = useState<number[]>([]);

    const faqData: FAQItem[] = [
        {
            question: t('faq.q1'),
            answer: t('faq.a1'),
        },
        {
            question: t('faq.q2'),
            answer: t('faq.a2'),
        },
        {
            question: t('faq.q3'),
            answer: t('faq.a3'),
        },
        {
            question: t('faq.q4'),
            answer: t('faq.a4'),
        },
        {
            question: t('faq.q5'),
            answer: t('faq.a5'),
        },
        {
            question: t('faq.q6'),
            answer: t('faq.a6'),
        },
        {
            question: t('faq.q7'),
            answer: t('faq.a7'),
        },
    ];

    const toggleItem = (index: number) => {
        setOpenItems((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <section className="py-24 bg-white">
            <div className="container px-4 md:px-6 mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">{t('faq.title')}</h2>
                    <p className="text-lg text-zinc-500">
                        {t('faq.subtitle')}
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => (
                        <Collapsible
                            key={index}
                            open={openItems.includes(index)}
                            onOpenChange={() => toggleItem(index)}
                            className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden"
                        >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-zinc-100/50 transition-colors cursor-pointer">
                                <h3 className="text-lg font-semibold text-zinc-900 pr-8">{item.question}</h3>
                                <ChevronDown
                                    size={20}
                                    className={`text-zinc-400 transition-transform duration-300 ${openItems.includes(index) ? "rotate-180" : ""
                                        }`}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="px-6 pb-6 text-zinc-600 leading-relaxed">
                                    <p>{item.answer}</p>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FAQSection;
