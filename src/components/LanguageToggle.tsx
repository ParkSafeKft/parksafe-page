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
            className="p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-2 group cursor-pointer"
            aria-label="Toggle language"
        >
            <Globe className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors uppercase">
                {language}
            </span>
        </button>
    );
}
