'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Leaf, Bike, TreeDeciduous, Car } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Co2Stats = {
    total_rides: number;
    total_meters: number;
    total_co2_grams: number;
    rides_30d: number;
    meters_30d: number;
    co2_grams_30d: number;
    rides_7d: number;
    meters_7d: number;
    co2_grams_7d: number;
    last_ride_at: string | null;
    computed_at: string;
};

// Mature tree absorbs ~21 kg CO2 per year (US EPA / EU forestry estimates).
const KG_CO2_PER_TREE_YEAR = 21;
// Average urban car trip ~5 km — used to translate biked km into "car trips replaced".
const AVG_CAR_TRIP_KM = 5;

function AnimatedNumber({
    value,
    decimals = 0,
    suffix = '',
    play,
}: {
    value: number;
    decimals?: number;
    suffix?: string;
    play: boolean;
}) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!play) return;
        const start = performance.now();
        const duration = 1600;
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay(value * eased);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, play]);

    const formatted = display.toLocaleString('hu-HU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return (
        <span>
            {formatted}
            {suffix}
        </span>
    );
}

export default function Co2Impact() {
    const { t, language } = useLanguage();
    const [stats, setStats] = useState<Co2Stats | null>(null);
    const [errored, setErrored] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: '-15% 0px' });

    useEffect(() => {
        let cancelled = false;
        fetch('/api/co2-stats')
            .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
            .then((data: Co2Stats) => {
                if (!cancelled) setStats(data);
            })
            .catch(() => {
                if (!cancelled) setErrored(true);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Hide section gracefully if backend is unreachable AND we have no data.
    if (errored && !stats) return null;

    const co2Kg = stats ? stats.total_co2_grams / 1000 : 0;
    const km = stats ? stats.total_meters / 1000 : 0;
    const rides = stats?.total_rides ?? 0;
    const trees = co2Kg / KG_CO2_PER_TREE_YEAR;
    const carTrips = km / AVG_CAR_TRIP_KM;

    const last30Kg = stats ? stats.co2_grams_30d / 1000 : 0;

    const dateLocale = language === 'hu' ? 'hu-HU' : 'en-GB';
    const computedAt = stats
        ? new Date(stats.computed_at).toLocaleDateString(dateLocale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';

    return (
        <section
            ref={ref}
            className="py-24 lg:py-32 bg-gradient-to-b from-emerald-50/40 via-white to-white border-t border-emerald-100/60 relative overflow-hidden"
        >
            {/* Soft organic blobs */}
            <div className="absolute -top-40 -left-32 w-[500px] h-[500px] bg-[#34aa56]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto max-w-6xl relative">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#34aa56]/10 border border-[#34aa56]/20 mb-6"
                    >
                        <Leaf className="w-4 h-4 text-[#34aa56]" />
                        <span className="text-xs font-bold tracking-wider uppercase text-[#1f7a3a]">
                            {t('home.impact.badge')}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 16 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.05 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6"
                    >
                        {t('home.impact.title')}{' '}
                        <span className="text-[#34aa56]">{t('home.impact.titleHighlight')}</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-lg text-slate-500 leading-relaxed font-medium"
                    >
                        {t('home.impact.description')}
                    </motion.p>
                </div>

                {/* Hero number — total CO2 saved */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-gradient-to-br from-[#0f1d16] to-[#152920] rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-emerald-900/20 text-white relative overflow-hidden mb-8"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#34aa56]/15 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-400/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-[#34aa56]/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-[#34aa56]/30">
                                    <Leaf className="w-6 h-6 text-emerald-300" />
                                </div>
                                <span className="text-sm font-bold tracking-wider uppercase text-emerald-300/80">
                                    {t('home.impact.heroLabel')}
                                </span>
                            </div>
                            <div className="text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight text-white leading-none mb-3">
                                <AnimatedNumber value={co2Kg} decimals={co2Kg < 100 ? 1 : 0} play={inView && !!stats} />
                                <span className="text-4xl md:text-5xl lg:text-6xl text-emerald-300/80 ml-2">kg</span>
                            </div>
                            <p className="text-emerald-100/70 text-lg leading-relaxed max-w-md">
                                {t('home.impact.heroSubtitle')}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-emerald-100/60 text-sm font-semibold">
                                        {t('home.impact.last30Days')}
                                    </span>
                                    <Leaf className="w-4 h-4 text-emerald-300/60" />
                                </div>
                                <div className="text-4xl font-extrabold mt-2">
                                    <AnimatedNumber
                                        value={last30Kg}
                                        decimals={last30Kg < 100 ? 1 : 0}
                                        play={inView && !!stats}
                                    />
                                    <span className="text-2xl text-emerald-300/80 ml-1">kg</span>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-emerald-100/60 text-sm font-semibold">
                                        {t('home.impact.totalRides')}
                                    </span>
                                    <Bike className="w-4 h-4 text-emerald-300/60" />
                                </div>
                                <div className="text-4xl font-extrabold mt-2">
                                    <AnimatedNumber value={rides} play={inView && !!stats} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Equivalent metaphors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Bike,
                            value: km,
                            decimals: km < 100 ? 1 : 0,
                            unit: 'km',
                            label: t('home.impact.kmLabel'),
                            iconBg: 'bg-emerald-50',
                            iconColor: 'text-[#34aa56]',
                        },
                        {
                            icon: Car,
                            value: carTrips,
                            decimals: 0,
                            unit: '',
                            label: t('home.impact.carTripsLabel'),
                            iconBg: 'bg-blue-50',
                            iconColor: 'text-blue-600',
                        },
                        {
                            icon: TreeDeciduous,
                            value: trees,
                            decimals: trees < 10 ? 1 : 0,
                            unit: '',
                            label: t('home.impact.treesLabel'),
                            iconBg: 'bg-amber-50',
                            iconColor: 'text-amber-700',
                        },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 hover:border-[#34aa56]/30 transition-colors"
                        >
                            <div
                                className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center mb-6`}
                            >
                                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                            </div>
                            <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-2">
                                <AnimatedNumber
                                    value={item.value}
                                    decimals={item.decimals}
                                    play={inView && !!stats}
                                />
                                {item.unit && (
                                    <span className="text-2xl text-zinc-400 ml-1">{item.unit}</span>
                                )}
                            </div>
                            <p className="text-zinc-500 font-medium">{item.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Footnote */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center text-xs text-slate-400 mt-10 max-w-2xl mx-auto"
                >
                    {t('home.impact.methodology')}
                    {stats && computedAt && (
                        <>
                            {' • '}
                            {t('home.impact.updatedOn')} {computedAt}
                        </>
                    )}
                </motion.p>
            </div>
        </section>
    );
}
