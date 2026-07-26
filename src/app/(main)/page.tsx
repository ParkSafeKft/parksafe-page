'use client';

import { useEffect } from "react";
import { ArrowDown, Navigation, Users, Wrench, Zap } from "lucide-react";
import { motion } from "framer-motion";
import FAQSection from "@/components/FAQSection";
import PartnerBenefits from "@/components/PartnerBenefits";
import HowItWorks from "@/components/HowItWorks";
import { AboutHighlight } from "@/components/AboutHighlight";
import Co2Impact from "@/components/Co2Impact";
import { useLanguage } from "@/contexts/LanguageContext";

const appStoreHref = "https://apps.apple.com/app/id6752813986";
const googlePlayHref = "https://play.google.com/store/apps/details?id=com.parksafe.app";

export default function HomePage() {
    const { t } = useLanguage();

    useEffect(() => {
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: Array.from({ length: 7 }, (_, index) => ({
                "@type": "Question",
                name: t(`faq.q${index + 1}`),
                acceptedAnswer: {
                    "@type": "Answer",
                    text: t(`faq.a${index + 1}`),
                },
            })),
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(faqSchema);
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, [t]);

    return (
        <div className="home-page overflow-clip bg-[#f7f9f6] text-[#101512] selection:bg-[#34aa56] selection:text-white">
            <section className="relative min-h-[900px] overflow-hidden border-b border-[#101512]/10 bg-[#f2f6f1] pt-28 lg:pt-32">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,18,0.055)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="pointer-events-none absolute -right-24 top-10 h-[720px] w-[720px] rounded-full border-[90px] border-[#34aa56]/10" />
                <div className="relative mx-auto grid min-h-[710px] w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-5 pb-14 sm:px-8 lg:grid-cols-12 lg:px-12">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-20 pt-10 lg:col-span-7 lg:pt-0"
                    >
                        <h1 className="max-w-[930px] text-[clamp(3.6rem,8.1vw,8.6rem)] font-black leading-[0.92] tracking-[-0.045em] text-[#101512] text-balance">
                            {t('home.hero.title')}
                            <span className="mt-2 block text-[#34aa56]">{t('home.hero.subtitle')}</span>
                        </h1>

                        <div className="mt-10 grid max-w-3xl gap-8 border-t border-[#101512]/20 pt-7 md:grid-cols-[1fr_auto] md:items-end">
                            <p className="max-w-xl text-lg font-medium leading-8 text-[#425047] text-pretty md:text-xl">
                                {t('home.hero.description')}
                            </p>
                            <a
                                href="#platform"
                                aria-label={t('home.grid.osTitle')}
                                className="hidden h-14 w-14 items-center justify-center rounded-full border border-[#101512]/25 text-[#101512] transition-colors hover:border-[#34aa56] hover:bg-[#34aa56] hover:text-white md:flex"
                            >
                                <ArrowDown className="h-5 w-5" />
                            </a>
                        </div>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <a
                                href={appStoreHref}
                                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#101512] px-7 py-4 text-sm font-bold tracking-[0.01em] text-white transition-transform hover:-translate-y-0.5 hover:bg-[#1c241f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                            >
                                <svg viewBox="0 0 384 512" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                                </svg>
                                {t('home.hero.downloadIOS')}
                            </a>
                            <a
                                href={googlePlayHref}
                                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#101512]/25 bg-white/70 px-7 py-4 text-sm font-bold tracking-[0.01em] text-[#101512] backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:border-[#101512] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#34aa56]"
                            >
                                <svg viewBox="0 0 512 512" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                </svg>
                                {t('home.hero.downloadAndroid')}
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 flex min-h-[590px] items-center justify-center lg:col-span-5 lg:justify-end"
                    >
                        <picture className="relative z-10 block w-[330px] translate-y-6 sm:w-[400px] lg:w-[460px]">
                            <source
                                type="image/webp"
                                srcSet="/ios_mapview_300.webp 300w, /ios_mapview_480.webp 480w, /ios_mapview_600.webp 600w, /ios_mapview_800.webp 800w"
                                sizes="(min-width: 1024px) 460px, (min-width: 640px) 400px, 330px"
                            />
                            <img
                                src="/ios_mapview.png"
                                srcSet="/ios_mapview_300.png 300w, /ios_mapview_480.png 480w, /ios_mapview_600.png 600w, /ios_mapview_800.png 800w"
                                sizes="(min-width: 1024px) 460px, (min-width: 640px) 400px, 330px"
                                alt="ParkSafe Mobile Interface - Kerékpáros Térkép"
                                width="480"
                                height="900"
                                className="h-auto w-full drop-shadow-[0_36px_40px_rgba(16,21,18,0.28)]"
                                fetchPriority="high"
                                decoding="async"
                            />
                        </picture>
                    </motion.div>
                </div>
            </section>

            <section id="platform" className="bg-white py-24 lg:py-36">
                <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                    <div className="grid gap-10 border-b border-[#101512]/15 pb-14 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-8">
                            <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">ParkSafe / 01</p>
                            <h2 className="max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.045em] text-[#101512] text-balance sm:text-6xl lg:text-7xl">
                                {t('home.grid.osTitle')}
                            </h2>
                        </div>
                        <p className="max-w-lg text-lg leading-8 text-[#5a665e] text-pretty lg:col-span-4">
                            {t('home.grid.osDesc')}
                        </p>
                    </div>

                    <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
                        <div className="relative min-h-[600px] overflow-hidden rounded-[1.75rem] bg-[#101512] p-7 text-white sm:p-10 lg:col-span-7 lg:min-h-[720px]">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
                            <div className="relative z-10 max-w-xl">
                                <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                                    <span className="h-2 w-2 rounded-full bg-[#58ce79]" />
                                    {t('home.grid.mainStatLabel')}
                                </div>
                                <p className="text-[clamp(5rem,12vw,9.5rem)] font-black leading-none tracking-[-0.075em]">
                                    {t('home.grid.mainStat')}
                                </p>
                                <p className="mt-5 max-w-md text-lg leading-8 text-white/65">
                                    {t('home.grid.mainDesc')}
                                </p>
                            </div>
                            <div className="absolute bottom-[-8%] right-[-5%] h-[54%] w-[72%] max-w-[520px] rotate-3 sm:h-[62%]">
                                <picture>
                                    <source type="image/webp" srcSet="/ios_mapview_600.webp" />
                                    <img
                                        src="/ios_mapview_600.png"
                                        alt=""
                                        className="h-full w-full origin-bottom translate-x-[6%] scale-[1.25] object-contain object-bottom sm:scale-[1.12]"
                                        loading="lazy"
                                    />
                                </picture>
                            </div>
                        </div>

                        <div className="grid content-start lg:col-span-5">
                            {[
                                {
                                    icon: Navigation,
                                    label: "02",
                                    title: t('home.grid.infraTitle'),
                                    desc: t('home.grid.infraDesc'),
                                },
                                {
                                    icon: Wrench,
                                    label: "03",
                                    title: t('home.grid.serviceTitle'),
                                    desc: t('home.grid.serviceDesc'),
                                },
                                {
                                    icon: Zap,
                                    label: "04",
                                    title: t('home.grid.trafficTitle'),
                                    desc: t('home.grid.trafficDesc'),
                                },
                                {
                                    icon: Users,
                                    label: "05",
                                    title: t('home.grid.communityTitle'),
                                    desc: t('home.grid.communityDesc'),
                                    stat: t('home.grid.communityStat'),
                                },
                            ].map((feature) => (
                                <div
                                    key={feature.label}
                                    className="group grid grid-cols-[52px_1fr_auto] gap-4 border-t border-[#101512]/15 py-8 first:border-t-0 lg:first:border-t"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf7ee] text-[#258642] transition-colors group-hover:bg-[#34aa56] group-hover:text-white">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#869088]">
                                            {feature.label}
                                        </div>
                                        <h3 className="text-xl font-black tracking-[-0.025em] text-[#101512]">{feature.title}</h3>
                                        <p className="mt-2 max-w-md leading-7 text-[#667169]">{feature.desc}</p>
                                    </div>
                                    {feature.stat && (
                                        <span className="self-start text-3xl font-black tracking-[-0.05em] text-[#34aa56]">
                                            {feature.stat}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <AboutHighlight />
            <Co2Impact />
            <HowItWorks />
            <PartnerBenefits />
            <FAQSection />

            <section className="relative overflow-hidden bg-[#34aa56] py-24 text-[#101512] lg:py-32">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,21,18,0.12)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                    <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-8">
                            <p className="mb-6 text-xs font-black uppercase tracking-[0.18em]">ParkSafe / Download</p>
                            <h2 className="max-w-5xl text-5xl font-black leading-[0.88] tracking-[-0.06em] text-balance sm:text-7xl lg:text-[7rem]">
                                {t('home.cta.title')} {t('home.cta.titleHighlight')}
                            </h2>
                        </div>
                        <div className="lg:col-span-4">
                            <p className="mb-8 max-w-lg text-lg font-medium leading-8 text-[#15371f]">
                                {t('home.cta.desc')}
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                <a
                                    href={appStoreHref}
                                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#101512] px-6 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                                >
                                    <svg viewBox="0 0 384 512" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                                    </svg>
                                    {t('home.hero.downloadIOS')}
                                </a>
                                <a
                                    href={googlePlayHref}
                                    className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#101512]/35 bg-transparent px-6 py-4 text-sm font-bold text-[#101512] transition-transform hover:-translate-y-0.5 hover:bg-white/20"
                                >
                                    <svg viewBox="0 0 512 512" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                                    </svg>
                                    {t('home.hero.downloadAndroid')}
                                </a>
                            </div>
                            <p className="mt-6 text-xs font-bold uppercase tracking-[0.11em] text-[#1c512b]">
                                {t('home.cta.security')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
