'use client';

import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-12 md:py-16">
            <div className="container mx-auto px-4">

                {/* Top Section: Logo & main links */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">

                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <picture>
                                <source srcSet="/logo_64.webp" type="image/webp" />
                                <img src="/logo_64.png" alt="P" className="w-6 h-6 brightness-110" />
                            </picture>
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">ParkSafe</span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
                        <a href="https://apps.apple.com/app/id6752813986" className="hover:text-white transition-colors">
                            {t('footer.appStore')}
                        </a>
                        <a href="https://play.google.com/store/apps/details?id=com.parksafe.app" className="hover:text-white transition-colors">
                            {t('footer.googlePlay')}
                        </a>
                        <Link href="/contact" className="hover:text-white transition-colors" aria-label="Contact ParkSafe Support">
                            {t('nav.contact')}
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors" aria-label="Read Terms of Service">
                            {t('footer.terms')}
                        </Link>
                        <Link href="/privacy" className="hover:text-white transition-colors" aria-label="Read Privacy Policy">
                            {t('footer.privacy')}
                        </Link>

                    </div>
                </div>

                {/* Bottom Section: Copyright */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium opacity-60">
                    <p>{t('footer.rights')}</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-white transition-colors">Instagram</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}

export default Footer;
