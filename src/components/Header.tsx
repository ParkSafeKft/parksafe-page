'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";

function Header() {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
            scrolled
                ? "border-black/10 bg-white/92 shadow-[0_8px_30px_rgba(16,21,18,0.06)] backdrop-blur-xl"
                : "border-black/8 bg-[#f2f6f1]/88 backdrop-blur-lg"
        }`}>
            <div
                className={`mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 transition-all duration-300 sm:px-8 lg:px-12 ${
                    scrolled ? "h-[72px]" : "h-20"
                }`}
            >
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#34aa56] transition-transform group-hover:-rotate-3">
                        <picture>
                            <source srcSet="/logo_64.webp" type="image/webp" />
                            <img src="/logo_64.png" alt="" className="h-6 w-6 object-contain" />
                        </picture>
                    </div>
                    <span className="text-lg font-black tracking-[-0.035em] text-[#101512]">ParkSafe</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-2 rounded-xl border border-[#101512]/10 bg-white/55 p-1 md:flex">
                    <Link href="/" className="rounded-lg px-4 py-2 text-xs font-bold tracking-[0.01em] text-[#101512] transition-colors hover:bg-white">
                        {t('nav.home')}
                    </Link>
                    <Link href="/about" className="rounded-lg px-4 py-2 text-xs font-bold tracking-[0.01em] text-[#59645d] transition-colors hover:bg-white hover:text-[#101512]">
                        {t('about.nav')}
                    </Link>
                    <Link href="/contact" className="rounded-lg px-4 py-2 text-xs font-bold tracking-[0.01em] text-[#59645d] transition-colors hover:bg-white hover:text-[#101512]">
                        {t('nav.contact')}
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <LanguageToggle />

                    {/* Auth Button with fixed width container to prevent CLS */}
                    <div className="flex min-w-[88px] justify-end sm:min-w-[100px]">
                        {!loading ? (
                            user ? (
                                <Link
                                    href="/profile"
                                    className="rounded-xl border border-[#101512]/10 bg-white px-4 py-2.5 text-xs font-bold text-[#101512] transition-colors hover:border-[#34aa56]"
                                >
                                    {t('nav.profile')}
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-xl bg-[#101512] px-5 py-3 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 hover:bg-[#1c241f]"
                                >
                                    {t('nav.login')}
                                </Link>
                            )
                        ) : (
                            /* Skeleton / Placeholder to reserve space */
                            <div className="h-10 w-20 animate-pulse rounded-xl bg-[#101512]/8 sm:w-24" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
