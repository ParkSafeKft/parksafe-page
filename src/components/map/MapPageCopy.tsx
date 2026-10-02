'use client';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { type MapRoute } from '@/lib/map-data';

export default function MapPageCopy({ route, date }: { route: MapRoute; date: string | null }) {
    const { t, language } = useLanguage();
    return <>
        <header className="web-map-heading">
            <p className="web-map-kicker">{t('webMap.country')}</p>
            <h1>{t(`webMap.${route}Title`)}</h1>
            <p>{t(`webMap.${route}Description`)}</p>
        </header>
        <section className="web-map-explanation">
            <h2>{t(`webMap.${route}ExplainTitle`)}</h2>
            <p>{t(`webMap.${route}Explain`)}</p>
            <p className="web-map-provenance">ParkSafe / OpenStreetMap {date && `${t('webMap.snapshot')}: ${new Date(date).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-GB', { timeZone: 'UTC' })}`}</p>
            <p className="web-map-provenance"><a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a> · <a href="https://opendatacommons.org/licenses/odbl/1-0/">ODbL 1.0</a> · <a href="https://www.geonames.org/about.html">GeoNames CC BY 4.0</a></p>
            <nav aria-label={t('webMap.categories')}>{(['map', 'bikerack', 'service', 'water'] as const).map(r => <Link key={r} href={`/${r}`} scroll={false}>{t(`webMap.tab.${r}`)}</Link>)}</nav>
        </section>
    </>;
}
