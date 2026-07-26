"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    const toggleLanguage = () => {
        setLanguage(language === 'hu' ? 'en' : 'hu');
    };

    return (
        <button
            onClick={toggleLanguage}
            className="group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[#59645d] transition-colors hover:bg-white hover:text-[#101512]"
            aria-label="Toggle language"
        >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-[0.08em]">
                {language}
            </span>
        </button>
    );
}
