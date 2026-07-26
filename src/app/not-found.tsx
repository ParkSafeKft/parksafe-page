'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
    hu: {
        eyebrow: 'ParkSafe / 404',
        title: 'Ez az útvonal nem található.',
        description: 'A keresett oldal elköltözött, megszűnt, vagy a cím hibás. Térj vissza a főoldalra, vagy jelezd nekünk, ha egy hibás link vezetett ide.',
        home: 'Vissza a főoldalra',
        contact: 'Hiba jelzése',
    },
    en: {
        eyebrow: 'ParkSafe / 404',
        title: 'This route could not be found.',
        description: 'The page may have moved, been removed, or the address may be incorrect. Return home, or let us know if a broken link brought you here.',
        home: 'Back to Home',
        contact: 'Report the Link',
    },
};

export default function NotFound() {
    const { language } = useLanguage();
    const content = copy[language] ?? copy.hu;

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <main className="flex flex-1 items-center px-5 pb-24 pt-36 sm:px-8 lg:px-12">
                <div className="mx-auto grid w-full max-w-[1440px] gap-10 border-y border-[#101512]/20 py-14 lg:grid-cols-12 lg:items-end lg:py-20">
                    <div className="lg:col-span-4">
                        <p className="text-[clamp(7rem,18vw,15rem)] font-black leading-[0.72] tracking-[-0.09em] text-[#34aa56]">
                            404
                        </p>
                    </div>

                    <div className="lg:col-span-7 lg:col-start-6">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">
                            {content.eyebrow}
                        </p>
                        <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.055em] text-[#101512] text-balance sm:text-6xl lg:text-7xl">
                            {content.title}
                        </h1>
                        <p className="mt-7 max-w-2xl text-lg leading-8 text-[#626e66] text-pretty">
                            {content.description}
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="/"
                                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-[#34aa56] px-6 font-bold text-white transition-colors hover:bg-[#2d964b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#258642]"
                            >
                                {content.home}
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex h-14 items-center justify-center rounded-xl border border-[#101512]/20 px-6 font-bold text-[#101512] transition-colors hover:border-[#34aa56] hover:bg-[#f7f9f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                            >
                                {content.contact}
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
