'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bike, Car, Leaf, TreeDeciduous } from 'lucide-react';
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

const KG_CO2_PER_TREE_YEAR = 21;
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
            const progress = Math.min(1, (now - start) / duration);
            setDisplay(value * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value, play]);

    return (
        <span>
            {display.toLocaleString('hu-HU', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
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
            .then((response) => (response.ok ? response.json() : Promise.reject(response.statusText)))
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

    const metrics = [
        {
            icon: Bike,
            value: km,
            decimals: km < 100 ? 1 : 0,
            unit: 'km',
            label: t('home.impact.kmLabel'),
        },
        {
            icon: Car,
            value: carTrips,
            decimals: 0,
            unit: '',
            label: t('home.impact.carTripsLabel'),
        },
        {
            icon: TreeDeciduous,
            value: trees,
            decimals: trees < 10 ? 1 : 0,
            unit: '',
            label: t('home.impact.treesLabel'),
        },
    ];

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#edf7ef] py-24 lg:py-32">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(16,21,18,0.055)_1px,transparent_1px)] bg-[size:80px_100%]" />

            <div className="relative mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <div className="grid gap-9 lg:grid-cols-12 lg:items-end">
                    <div className="lg:col-span-8">
                        <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#258642]">
                            <Leaf className="h-4 w-4" />
                            {t('home.impact.badge')}
                        </div>
                        <motion.h2
                            initial={{ opacity: 0, y: 18 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.65 }}
                            className="max-w-5xl text-4xl font-black leading-[0.93] tracking-[-0.055em] text-[#101512] text-balance sm:text-6xl lg:text-7xl"
                        >
                            {t('home.impact.title')} {t('home.impact.titleHighlight')}
                        </motion.h2>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.65, delay: 0.08 }}
                        className="max-w-lg text-lg leading-8 text-[#52645a] lg:col-span-4"
                    >
                        {t('home.impact.description')}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mt-14 overflow-hidden rounded-[1.75rem] bg-[#101512] text-white"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:56px_56px]" />
                    <div className="relative grid lg:grid-cols-12">
                        <div className="border-b border-white/15 p-7 sm:p-10 lg:col-span-8 lg:min-h-[520px] lg:border-b-0 lg:border-r lg:p-14">
                            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#58ce79]">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34aa56]/15">
                                    <Leaf className="h-5 w-5" />
                                </span>
                                {t('home.impact.heroLabel')}
                            </div>
                            <div className="mt-20 text-[clamp(5rem,13vw,11rem)] font-black leading-[0.78] tracking-[-0.085em] tabular-nums">
                                <AnimatedNumber value={co2Kg} decimals={co2Kg < 100 ? 1 : 0} play={inView && !!stats} />
                                <span className="ml-3 text-[0.32em] tracking-[-0.04em] text-[#58ce79]">kg</span>
                            </div>
                            <p className="mt-10 max-w-xl text-lg leading-8 text-white/58">
                                {t('home.impact.heroSubtitle')}
                            </p>
                        </div>

                        <div className="grid lg:col-span-4 lg:grid-rows-2">
                            <div className="border-b border-white/15 p-7 sm:p-10 lg:p-12">
                                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">
                                    {t('home.impact.last30Days')}
                                </div>
                                <div className="mt-8 text-5xl font-black tracking-[-0.06em] tabular-nums sm:text-6xl">
                                    <AnimatedNumber value={last30Kg} decimals={last30Kg < 100 ? 1 : 0} play={inView && !!stats} />
                                    <span className="ml-2 text-2xl text-[#58ce79]">kg</span>
                                </div>
                            </div>
                            <div className="p-7 sm:p-10 lg:p-12">
                                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/45">
                                    {t('home.impact.totalRides')}
                                </div>
                                <div className="mt-8 text-5xl font-black tracking-[-0.06em] tabular-nums sm:text-6xl">
                                    <AnimatedNumber value={rides} play={inView && !!stats} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative grid border-t border-white/15 md:grid-cols-3">
                        {metrics.map((metric, index) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0 }}
                                animate={inView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.55, delay: 0.3 + index * 0.08 }}
                                className="border-b border-white/15 p-7 last:border-b-0 sm:p-9 md:border-b-0 md:border-r md:last:border-r-0"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <metric.icon className="h-5 w-5 text-[#58ce79]" />
                                    <div className="text-right">
                                        <div className="text-4xl font-black tracking-[-0.055em] tabular-nums">
                                            <AnimatedNumber
                                                value={metric.value}
                                                decimals={metric.decimals}
                                                play={inView && !!stats}
                                            />
                                            {metric.unit && <span className="ml-1 text-lg text-white/45">{metric.unit}</span>}
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-white/45">{metric.label}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-[#647068]"
                >
                    {t('home.impact.methodology')}
                    {stats && computedAt && (
                        <>
                            {' · '}
                            {t('home.impact.updatedOn')} {computedAt}
                        </>
                    )}
                </motion.p>
            </div>
        </section>
    );
}
