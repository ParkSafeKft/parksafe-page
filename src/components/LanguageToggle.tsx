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
            className="p-2 rounded-full hover:bg-slate-100 transition-colors flex items-center gap-2 group"
            aria-label="Toggle language"
        >
            <span className="text-lg leading-none" role="img" aria-label={language === 'hu' ? 'Magyar' : 'English'}>
                {language === 'hu' ? '🇭🇺' : '🇬🇧'}
            </span>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors uppercase">
                {language}
            </span>
        </button>
    );
}

