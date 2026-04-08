'use client';

import { ShieldCheck, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
    const { language } = useLanguage();
    const isEn = language === 'en';

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-24 font-sans text-zinc-900 selection:bg-[#34aa56] selection:text-white">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-6 shadow-sm border border-emerald-100">
                        <ShieldCheck className="text-[#34aa56] w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
                        {isEn ? "Privacy Policy" : "Adatvédelmi Szabályzat"}
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        {isEn ? "Last updated: March 17, 2026" : "Utolsó frissítés: 2026. március 17."}
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">
                    <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#34aa56] hover:prose-a:text-emerald-700">

                        {/* Data Controller */}
                        <section className="mb-12">
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-2 text-zinc-600 mb-6">
                                <p><strong className="text-zinc-900">{isEn ? "Data Controller:" : "Adatkezelő:"}</strong> Premiumtex Kft.</p>
                                <p><strong className="text-zinc-900">{isEn ? "Registered address:" : "Székhely:"}</strong> 6792 Zsombó, Dózsa dűlő 55.</p>
                                <p><strong className="text-zinc-900">{isEn ? "Company registration number:" : "Cégjegyzékszám:"}</strong> 06-09-013323</p>
                                <p><strong className="text-zinc-900">{isEn ? "Tax number:" : "Adószám:"}</strong> 14559253-2-06</p>
                                <p><strong className="text-zinc-900">{isEn ? "Email:" : "E-mail:"}</strong> info@parksafe.hu</p>
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "This privacy policy describes:"
                                    : "Jelen adatvédelmi szabályzat bemutatja:"}
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                {isEn ? (
                                    <>
                                        <li>what data we collect,</li>
                                        <li>for what purpose and on what legal basis we process it,</li>
                                        <li>how long we retain it,</li>
                                        <li>to whom we transfer it,</li>
                                        <li>what rights you have regarding data processing.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>milyen adatokat gyűjtünk,</li>
                                        <li>milyen célból és jogalapon kezeljük azokat,</li>
                                        <li>mennyi ideig őrizzük meg,</li>
                                        <li>kinek továbbítjuk,</li>
                                        <li>milyen jogai vannak Önnek az adatkezeléssel kapcsolatban.</li>
                                    </>
                                )}
                            </ul>
                            <p className="text-zinc-600 leading-relaxed">
                                {isEn ? (
                                    <>
                                        In data processing we comply in particular with the <strong className="text-zinc-900">GDPR</strong> (EU Regulation 2016/679) and applicable Hungarian legislation (e.g. Infotv.). For certain data processing activities (e.g. location data, marketing notifications) we seek separate, explicit consent within the application.
                                    </>
                                ) : (
                                    <>
                                        Az adatkezelés során különösen a <strong className="text-zinc-900">GDPR</strong> (EU 2016/679 rendelet), valamint a vonatkozó magyar jogszabályok (pl. Infotv.) rendelkezéseit tartjuk be. Bizonyos adatkezelésekhez (pl. helyadatok, marketing értesítések) külön, kifejezett hozzájárulást kérünk az alkalmazáson belül.
                                    </>
                                )}
                            </p>
                        </section>

                        {/* 1. Collected Data */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-[#34aa56]">1.</span>{" "}
                                {isEn ? "Data Collected and Processing Purposes" : "Gyűjtött adatok és adatkezelési célok"}
                            </h2>

                            <div className="space-y-6">
                                {/* a) Registration data */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "a) Registration and identification data" : "a) Regisztrációs és azonosítási adatok"}
                                    </h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>name (or username),</li>
                                                <li>email address,</li>
                                                <li>phone number (if provided),</li>
                                                <li>password (encrypted, in non-reversible form),</li>
                                                <li>external identifiers (e.g. Google / Apple account ID, if using social login).</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>név (vagy felhasználónév),</li>
                                                <li>e-mail cím,</li>
                                                <li>telefonszám (ha megadja),</li>
                                                <li>jelszó (titkosítva, visszafejthetetlen formában),</li>
                                                <li>külső azonosítók (pl. Google / Apple fiók azonosítója, ha social login-t használ).</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                        {isEn
                                            ? "account creation and management, login provisioning, identification, communication."
                                            : "fiók létrehozása és kezelése, bejelentkezés biztosítása, azonosítás, kapcsolattartás."}
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                        {isEn
                                            ? "performance of a contract (GDPR Art. 6(1)(b)), and legitimate interest (account security)."
                                            : "szerződés teljesítése (GDPR 6. cikk (1) b)), illetve jogos érdek (fiókbiztonság)."}
                                    </p>
                                </div>

                                {/* b) Location data */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "b) Location data" : "b) Helyadatok"}
                                    </h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>GPS coordinates,</li>
                                                <li>searched locations,</li>
                                                <li>displayed map areas.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>GPS koordináták,</li>
                                                <li>keresett helyek,</li>
                                                <li>megjelenített térképrészletek.</li>
                                            </>
                                        )}
                                    </ul>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-amber-900 text-sm">
                                        {isEn ? (
                                            <><strong>Background location access:</strong> When using the cycling route tracking (ride tracking) feature — if you explicitly enable it — the application may access the device&apos;s location data in the background, even when the application is not visible on screen. This occurs exclusively during active ride tracking. The collected location data is used solely to calculate distance travelled, speed, and elevation; the detailed GPS track is not stored, only aggregated statistical data.</>
                                        ) : (
                                            <><strong>Háttérben futó helymeghatározás (background location):</strong> Az alkalmazás kerékpáros útvonalkövetés (ride tracking) funkciójának használata során – amennyiben Ön ezt kifejezetten engedélyezi – az alkalmazás háttérben is hozzáférhet az eszköz helyadataihoz, akkor is, ha az alkalmazás éppen nem látható a képernyőn. Erre kizárólag az aktív menetkövetés ideje alatt kerül sor. A gyűjtött helyadatok kizárólag a megtett távolság, sebesség és emelkedés kiszámítására szolgálnak; a részletes GPS nyomvonalat nem tároljuk, csak összesített statisztikai adatokat.</>
                                        )}
                                    </div>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                        {isEn
                                            ? "displaying nearby storage locations and service points, navigation, providing relevant results, recording cycling statistics during ride tracking."
                                            : "közeli tárolóhelyek és szervizpontok megjelenítése, navigáció, releváns találatok nyújtása, kerékpáros statisztikák rögzítése menetkövetés során."}
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                        {isEn ? (
                                            <>your <strong>explicit consent</strong> (GDPR Art. 6(1)(a)). You may withdraw consent at any time in the device settings.</>
                                        ) : (
                                            <>az Ön <strong>kifejezett hozzájárulása</strong> (GDPR 6. cikk (1) a)). Hozzájárulását bármikor visszavonhatja a készülék beállításaiban.</>
                                        )}
                                    </p>
                                </div>

                                {/* c) Device data */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "c) Device and technical data" : "c) Eszköz- és technikai adatok"}
                                    </h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>device type, operating system, version,</li>
                                                <li>application version number,</li>
                                                <li>certain technical log data (error logs, performance data).</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>eszköz típusa, operációs rendszer, verzió,</li>
                                                <li>alkalmazás verziószáma,</li>
                                                <li>egyes technikai naplóadatok (hibalogok, teljesítményadatok).</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                        {isEn
                                            ? "technical provision of the service, error detection, performance optimisation, abuse prevention."
                                            : "szolgáltatás technikai biztosítása, hibák feltárása, teljesítmény optimalizálása, visszaélések megelőzése."}
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                        {isEn ? "legitimate interest (GDPR Art. 6(1)(f))." : "jogos érdek (GDPR 6. cikk (1) f))."}
                                    </p>
                                </div>

                                {/* d) Usage data */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "d) Usage data" : "d) Használati adatok"}
                                    </h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>application usage patterns,</li>
                                                <li>favourite locations, search history,</li>
                                                <li>notification preferences.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>alkalmazás használati szokások,</li>
                                                <li>kedvenc helyek, keresési előzmények,</li>
                                                <li>értesítések fogadására vonatkozó beállítások.</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                        {isEn
                                            ? "improving user experience, product development, generating anonymous statistics."
                                            : "felhasználói élmény javítása, termékfejlesztés, anonim statisztikák készítése."}
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                        {isEn
                                            ? "legitimate interest (service improvement) or — where required — consent."
                                            : "jogos érdek (szolgáltatás fejlesztése) vagy – ahol szükséges – hozzájárulás."}
                                    </p>
                                </div>

                                {/* e) Community content */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "e) Community content" : "e) Közösségi tartalmak"}
                                    </h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>ratings (1–5 stars),</li>
                                                <li>written reviews,</li>
                                                <li>uploaded photos,</li>
                                                <li>error reports, new location suggestions.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>értékelések (1–5 csillag),</li>
                                                <li>szöveges vélemények,</li>
                                                <li>feltöltött képek,</li>
                                                <li>hibajelentések, új helyszín javaslatok.</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                        {isEn
                                            ? "providing community features, informing other users, improving data quality."
                                            : "közösségi funkciók biztosítása, más felhasználók tájékoztatása, adatok minőségének javítása."}
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                        {isEn
                                            ? "performance of a contract (providing the application's features)."
                                            : "szerződés teljesítése (az alkalmazás funkcióinak biztosítása)."}
                                    </p>
                                </div>

                                {/* f) Ride tracking */}
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                        {isEn ? "f) Cycling route recording and ride statistics" : "f) Kerékpáros útvonal-rögzítés és túrastatisztikák"}
                                    </h3>
                                    <p className="text-zinc-600 mb-3">
                                        {isEn ? (
                                            <>The ParkSafe application&apos;s <strong className="text-zinc-900">Ride</strong> feature lets you record your cycling trips. Before first use, the application requests <strong className="text-zinc-900">explicit consent</strong>.</>
                                        ) : (
                                            <>A ParkSafe alkalmazás <strong className="text-zinc-900">Túra (Ride)</strong> funkciójával kerékpáros túráit rögzítheti. A funkció első használata előtt az alkalmazás <strong className="text-zinc-900">kifejezett hozzájárulást</strong> kér.</>
                                        )}
                                    </p>
                                    <p className="text-zinc-600 mb-2 font-medium text-zinc-800">
                                        {isEn ? "Data collected during active ride tracking:" : "Az aktív menetkövetés során gyűjtött adatok:"}
                                    </p>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>GPS coordinates (latitude, longitude, altitude, timestamp) — every 2–4 seconds,</li>
                                                <li>current, average and maximum speed (km/h),</li>
                                                <li>distance travelled (metres),</li>
                                                <li>ride duration and moving time (seconds),</li>
                                                <li>elevation gain (metres),</li>
                                                <li>ride start time (timestamp).</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>GPS koordináták (szélességi fok, hosszúsági fok, tengerszint feletti magasság, időbélyeg) – 2–4 másodpercenként,</li>
                                                <li>aktuális, átlagos és maximális sebesség (km/h),</li>
                                                <li>megtett távolság (méterben),</li>
                                                <li>menetidő és mozgási idő (másodpercben),</li>
                                                <li>szintemelkedés (méterben),</li>
                                                <li>túra kezdési időpontja (timestamp).</li>
                                            </>
                                        )}
                                    </ul>
                                    <p className="text-zinc-600 mb-2 font-medium text-zinc-800">
                                        {isEn ? "Data storage:" : "Adatok tárolása:"}
                                    </p>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        {isEn ? (
                                            <>
                                                <li>During an active ride, data resides exclusively <strong className="text-zinc-900">in device memory</strong>.</li>
                                                <li>On completion, the system uploads data to the <strong className="text-zinc-900">Supabase cloud database</strong>.</li>
                                                <li>The route is stored in <strong className="text-zinc-900">simplified form</strong>: the Ramer–Douglas–Peucker algorithm with 5-metre tolerance reduces the number of stored coordinates.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Az aktív menet során az adatok kizárólag <strong className="text-zinc-900">a készülék memóriájában</strong> találhatók.</li>
                                                <li>A túra befejezésekor a rendszer a mért adatokat a <strong className="text-zinc-900">Supabase felhőadatbázisba</strong> tölti fel.</li>
                                                <li>Az útvonal <strong className="text-zinc-900">egyszerűsített formában</strong> kerül tárolásra: a Ramer–Douglas–Peucker algoritmus 5 méteres toleranciával csökkenti a tárolt koordináták számát.</li>
                                            </>
                                        )}
                                    </ul>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-amber-900 text-sm">
                                        {isEn ? (
                                            <><strong>Public visibility and privacy trimming:</strong> If you set a ride to public (is_public = true), the system automatically <strong>removes the first and last 300 metres of the route</strong> so that the vicinity of your home cannot be identified. Other users can only see the trimmed route.</>
                                        ) : (
                                            <><strong>Nyilvánosság és adatvédelmi trimming:</strong> Ha Ön egy túrát nyilvánosra (is_public = true) állít, a rendszer automatikusan <strong>eltávolítja az útvonal első és utolsó 300 méterét</strong>, hogy lakóhelyének körzetét ne lehessen beazonosítani. Más felhasználók kizárólag a csonkított útvonalat láthatják.</>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-zinc-600 mb-4">
                                        <p className="mb-1">
                                            <strong className="text-zinc-900">{isEn ? "Purpose:" : "Cél:"}</strong>{" "}
                                            {isEn
                                                ? "personal recording of cycling trips, display of individual performance data and statistics."
                                                : "kerékpáros túrák személyes rögzítése, egyéni teljesítményadatok és statisztikák megjelenítése."}
                                        </p>
                                        <p className="mb-1">
                                            <strong className="text-zinc-900">{isEn ? "Legal basis:" : "Jogalap:"}</strong>{" "}
                                            {isEn ? (
                                                <>your <strong>explicit consent</strong> (GDPR Art. 6(1)(a)). You may withdraw consent at any time within the application, upon which recording of new routes will stop (previously saved rides are not automatically deleted but can be manually deleted by you).</>
                                            ) : (
                                                <>az Ön <strong>kifejezett hozzájárulása</strong> (GDPR 6. cikk (1) a) pont). Hozzájárulását bármikor visszavonhatja az alkalmazáson belül, aminek következtében új útvonalak rögzítése leáll (a korábban mentett túrák nem törlődnek automatikusan, de azokat Ön manuálisan törölheti).</>
                                            )}
                                        </p>
                                        <p className="mb-1">
                                            <strong className="text-zinc-900">{isEn ? "Data retention:" : "Adatmegőrzés:"}</strong>{" "}
                                            {isEn
                                                ? "Ride data is retained for the duration of the user account. Upon account deletion all ride records are automatically deleted (CASCADE). Individual rides may be manually deleted at any time."
                                                : "A túraadatok a felhasználói fiók fennállásáig megőrzésre kerülnek. Fiók törlésekor az összes túrarekord automatikusan törlődik (CASCADE törlés). Az egyes túrákat bármikor manuálisan is törölheti."}
                                        </p>
                                        <p>
                                            <strong className="text-zinc-900">{isEn ? "Data security:" : "Adatbiztonság:"}</strong>{" "}
                                            {isEn
                                                ? "Row-Level Security ensures each user can only view, modify, and delete their own ride data."
                                                : "Sor szintű hozzáférés-védelemmel (Row-Level Security) biztosítjuk, hogy minden felhasználó kizárólag saját túraadatait láthatja, módosíthatja és törölheti."}
                                        </p>
                                    </div>
                                    <p className="text-zinc-600 mb-1 font-medium text-zinc-800">
                                        {isEn ? "Your rights and control over this data processing:" : "Az Ön jogai és kontrollja ezzel az adatkezeléssel kapcsolatban:"}
                                    </p>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                        {isEn ? (
                                            <>
                                                <li>You can access all your rides and view them in the application.</li>
                                                <li>You can delete any individual ride.</li>
                                                <li>You can set each ride as public or private.</li>
                                                <li>You can withdraw ride tracking consent within the application.</li>
                                                <li>You can revoke background location permission at any time in the device <strong className="text-zinc-900">Settings → Privacy → Location Services</strong> menu.</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Minden túrájához hozzáférhet, megtekintheti azt az alkalmazásban.</li>
                                                <li>Bármely túráját egyenként törölheti.</li>
                                                <li>Meghatározhatja, hogy egy túra nyilvános vagy privát legyen.</li>
                                                <li>A menetkövetési hozzájárulást az alkalmazásban visszavonhatja.</li>
                                                <li>A háttér-helymeghatározási engedélyt bármikor visszavonhatja a készülék <strong className="text-zinc-900">Beállítások → Adatvédelem → Helyszolgáltatások</strong> menüjében.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 2. Location data */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">2.</span>{" "}
                                {isEn ? "Processing of Location Data" : "Helyadatok kezelése"}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "We pay special attention to data protection principles when processing location data:"
                                    : "Helyadatok kezelése során különös figyelmet fordítunk az adatvédelmi elvekre:"}
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-6">
                                {isEn ? (
                                    <>
                                        <li>we collect location data <strong className="text-zinc-900">only when you have consented</strong> in the device and application permissions,</li>
                                        <li>precise location data is used <strong className="text-zinc-900">primarily while providing the service</strong>,</li>
                                        <li>for the cycling ride tracking feature, the route is stored in <strong className="text-zinc-900">simplified form</strong> (Ramer–Douglas–Peucker algorithm) — solely with your consent and linked to your account,</li>
                                        <li>you may <strong className="text-zinc-900">disable</strong> location services at any time.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>helyadatokat <strong className="text-zinc-900">csak akkor gyűjtünk</strong>, ha Ön ehhez a készülék és az alkalmazás engedélyeiben hozzájárult,</li>
                                        <li>a pontos helyadatokat <strong className="text-zinc-900">elsősorban a szolgáltatás nyújtása közben</strong> használjuk,</li>
                                        <li>a kerékpáros menetkövetés funkció esetén az útvonal <strong className="text-zinc-900">egyszerűsített formában</strong> (Ramer–Douglas–Peucker algoritmussal) kerül tárolásra – kizárólag az Ön hozzájárulásával és az Ön fiókjához rendelten,</li>
                                        <li>lehetősége van a helymeghatározás bármikori <strong className="text-zinc-900">kikapcsolására</strong>.</li>
                                    </>
                                )}
                            </ul>

                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                <h3 className="text-lg font-bold text-zinc-900 mb-3">
                                    {isEn ? "Background location access" : "Háttérben futó helymeghatározás"}
                                </h3>
                                <p className="text-zinc-600 mb-3">
                                    {isEn ? (
                                        <>The application may optionally request a <strong className="text-zinc-900">background location permission</strong> for the cycling ride tracking feature:</>
                                    ) : (
                                        <>Az alkalmazás kerékpáros menetkövetés funkciójához opcionálisan <strong className="text-zinc-900"> háttér-helymeghatározási engedélyt</strong> kérhet:</>
                                    )}
                                </p>
                                <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                    {isEn ? (
                                        <>
                                            <li>background location is <strong className="text-zinc-900">not mandatory</strong>; if denied, ride tracking only works when the application is in the foreground,</li>
                                            <li>background location data is used <strong className="text-zinc-900">exclusively during active ride tracking</strong>,</li>
                                            <li>background access ends automatically when ride tracking is stopped,</li>
                                            <li>background location data is processed <strong className="text-zinc-900">solely for active ride tracking purposes</strong>; the route is stored in simplified form (see section 1f),</li>
                                            <li>you may revoke background location permission at any time in the device <strong className="text-zinc-900">Settings → Privacy → Location Services</strong> menu.</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>a háttér-helymeghatározás engedélyezése <strong className="text-zinc-900">nem kötelező</strong>; megtagadása esetén a menetkövetés csak akkor működik, ha az alkalmazás előtérben van,</li>
                                            <li>a háttérben gyűjtött helyadatokat <strong className="text-zinc-900">kizárólag az aktív menetkövetés ideje alatt</strong> használjuk,</li>
                                            <li>a háttér-hozzáférés az útvonal leállításával automatikusan megszűnik,</li>
                                            <li>a háttérben gyűjtött helyadatok feldolgozása <strong className="text-zinc-900">kizárólag az aktív menetkövetés céljára</strong> történik; az útvonal egyszerűsített formában kerül tárolásra (lásd az 1f pontot),</li>
                                            <li>a háttér-helyadat engedélyt bármikor visszavonhatja a készülék <strong className="text-zinc-900">Beállítások → Adatvédelem → Helyszolgáltatások</strong> menüjében.</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </section>

                        {/* 3. Cookies */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">3.</span>{" "}
                                {isEn ? "Cookies and Tracking" : "Sütik és nyomkövetés"}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn ? (
                                    <>The application operates primarily as a mobile client, but when using the web interface we may use <strong className="text-zinc-900">cookies</strong> and similar technologies:</>
                                ) : (
                                    <>Az alkalmazás elsősorban mobil kliensként működik, de webes felület használata esetén <strong className="text-zinc-900"> sütiket (cookies)</strong> és hasonló technológiákat alkalmazhatunk:</>
                                )}
                            </p>
                            <div className="space-y-3">
                                {(isEn ? [
                                    { label: "Session cookies", desc: "Maintaining login state, ensuring secure operation." },
                                    { label: "Preference cookies", desc: "Storing language setting, theme (light/dark mode), and other preferences." },
                                    { label: "Performance and analytics cookies", desc: "Generating anonymous statistics to improve the service." },
                                    { label: "Error tracking tools", desc: "Detecting application crashes and errors." },
                                ] : [
                                    { label: "Munkamenet-sütik", desc: "A bejelentkezési állapot fenntartására, biztonságos működésre." },
                                    { label: "Beállítási sütik", desc: "Nyelvi beállítás, téma (világos/sötét mód), egyéb preferenciák tárolása." },
                                    { label: "Teljesítmény- és analitikai sütik", desc: "A szolgáltatás fejlesztése érdekében anonim statisztikák készítése." },
                                    { label: "Hibakövetési eszközök", desc: "Alkalmazás összeomlások, hibák feltárása." },
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0">{idx + 1}</span>
                                        <span className="text-zinc-600"><strong className="text-zinc-900">{item.label}:</strong> {item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 mt-4 leading-relaxed">
                                {isEn
                                    ? <>Where required by law, we will seek <strong className="text-zinc-900">separate consent</strong> for non-essential cookies and provide the ability to manage them.</>
                                    : <>Ahol jogszabály előírja, a nem feltétlenül szükséges sütik alkalmazásához <strong className="text-zinc-900"> külön hozzájárulást kérünk</strong>, és lehetőséget biztosítunk azok kezelésére.</>
                                }
                            </p>
                        </section>

                        {/* 4. Data security */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">4.</span>{" "}
                                {isEn ? "Data Security" : "Adatbiztonság"}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "To protect your data, we apply the following measures, among others:"
                                    : "Adatainak védelme érdekében többek között az alábbi intézkedéseket alkalmazzuk:"}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {(isEn ? [
                                    { title: "Encryption", desc: "Data is stored and transmitted in encrypted form (SSL/TLS)." },
                                    { title: "Access control", desc: "Only authorised staff have access to personal data." },
                                    { title: "Regular updates", desc: "Security updates, vulnerability assessments." },
                                    { title: "Backups", desc: "Regular backups are made to prevent data loss." },
                                ] : [
                                    { title: "Titkosítás", desc: "Az adatok titkosított formában kerülnek tárolásra és továbbításra (SSL/TLS)." },
                                    { title: "Hozzáférés-korlátozás", desc: "A személyes adatokhoz csak az arra jogosult munkatársak férnek hozzá." },
                                    { title: "Rendszeres frissítések", desc: "Biztonsági frissítések, sérülékenységvizsgálatok." },
                                    { title: "Biztonsági mentések", desc: "Rendszeres mentések készülnek az adatvesztés megelőzése érdekében." },
                                ]).map((item, idx) => (
                                    <div key={idx} className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm">
                                        <strong className="block text-zinc-900 mb-1">{item.title}</strong>
                                        <span className="text-zinc-500 text-sm">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                                {isEn
                                    ? "While we do everything to protect your data, data transmission and storage over the internet cannot be considered 100% secure; the user acknowledges this risk."
                                    : "Bár mindent megteszünk az adatok védelméért, az interneten keresztüli adatátvitel és tárolás nem tekinthető 100%-ban biztonságosnak; ennek kockázatát a felhasználó is tudomásul veszi."}
                            </p>
                        </section>

                        {/* 5. Data processors */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">5.</span>{" "}
                                {isEn ? "Data Processors and Data Sharing" : "Adatfeldolgozók és adatmegosztás"}
                            </h2>
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 text-emerald-900 font-medium mb-4">
                                {isEn
                                    ? "We do not sell your personal data and do not share it without justification."
                                    : "Személyes adatait harmadik félnek nem adjuk el, és nem adjuk át indokolatlanul."}
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "However, we use data processors to operate the service, for example:"
                                    : "Adatfeldolgozókat azonban igénybe veszünk a szolgáltatás működtetéséhez, például:"}
                            </p>
                            <div className="space-y-3 mb-6">
                                {(isEn ? [
                                    { label: "Infrastructure & database", desc: "e.g. Supabase (authentication, database), hosting providers." },
                                    { label: "Maps & geolocation", desc: "e.g. MapLibre, OpenStreetMap data providers, Google Maps." },
                                    { label: "Payment providers", desc: "For processing premium subscriptions and other transactions." },
                                    { label: "Analytics & error tracking", desc: "For analysing application performance and errors." },
                                ] : [
                                    { label: "Infrastruktúra és adatbázis", desc: "pl. Supabase (hitelesítés, adatbázis), tárhelyszolgáltatók." },
                                    { label: "Térkép- és helymeghatározás", desc: "pl. MapLibre, OpenStreetMap adatszolgáltatók, Google Maps." },
                                    { label: "Fizetési szolgáltatók", desc: "Prémium előfizetések és egyéb tranzakciók lebonyolítására." },
                                    { label: "Analitikai és hibakövető", desc: "Alkalmazás teljesítményének és hibáinak elemzésére." },
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0 whitespace-nowrap">{item.label}</span>
                                        <span className="text-zinc-600">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-3">
                                {isEn ? (
                                    <>These partners may process data <strong className="text-zinc-900">only for the purposes specified in the contract</strong>.</>
                                ) : (
                                    <>Ezek a partnerek az adatokat <strong className="text-zinc-900">kizárólag a szerződésben rögzített célokra</strong> kezelhetik.</>
                                )}
                            </p>
                            <p className="text-zinc-600 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                                {isEn
                                    ? "Data may be transferred for legal reasons: upon authority request, during legal proceedings, or where required by law. In such cases, we endeavour to notify you within the limits permitted by law."
                                    : "Adatátadás jogi okból történhet: hatósági megkeresésre, jogi eljárások során, vagy ha jogi kötelezettség írja elő. Ilyen esetben az átadásról a jogszabályi keretek között igyekszünk Önt értesíteni."}
                            </p>
                        </section>

                        {/* 6. Retention */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">6.</span>{" "}
                                {isEn ? "Data Retention Periods" : "Adatmegőrzési idők"}
                            </h2>
                            <p className="text-zinc-600 mb-4">
                                {isEn ? (
                                    <>We retain data <strong className="text-zinc-900">only for as long as necessary</strong>:</>
                                ) : (
                                    <>Az adatokat <strong className="text-zinc-900">csak a szükséges ideig</strong> őrizzük meg:</>
                                )}
                            </p>
                            <ul className="space-y-3">
                                {(isEn ? [
                                    { label: "ACCOUNT", desc: "Until the account exists; upon deletion, anonymised or deleted within a reasonable period." },
                                    { label: "TRANSACTIONS", desc: "As required by law (e.g. accounting regulations)." },
                                    { label: "CUSTOMER SERVICE", desc: "As long as necessary to handle complaints and requests." },
                                    { label: "RIDE DATA", desc: "Until the user account exists; automatically deleted on account deletion (CASCADE). Individual rides may be manually deleted at any time." },
                                    { label: "COMMUNITY CONTENT", desc: "As long as necessary for the service; you may request removal of certain content." },
                                    { label: "ANALYTICS", desc: "Typically in anonymised form, may be retained long-term." },
                                ] : [
                                    { label: "FIÓK", desc: "A fiók fennállásáig; fiók törlésekor ésszerű határidőn belül anonimizálásra vagy törlésre kerülnek." },
                                    { label: "TRANZAKCIÓK", desc: "Jogszabályban meghatározott ideig (pl. számviteli előírások)." },
                                    { label: "ÜGYFÉLSZOLGÁLAT", desc: "A szükséges ideig, hogy a panaszok, kérelmek kezelését biztosítsuk." },
                                    { label: "TÚRAADATOK", desc: "A felhasználói fiók fennállásáig; fiók törlésekor automatikusan törlődnek (CASCADE). Az egyes túrák manuálisan is törölhetők bármikor." },
                                    { label: "KÖZÖSSÉGI TARTALOM", desc: "A szolgáltatás működése szempontjából szükséges ideig; kérheti egyes tartalmak eltávolítását." },
                                    { label: "ANALITIKA", desc: "Jellemzően anonimizált formában, hosszabb távon is megőrizhetők." },
                                ]).map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100 list-none">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0">{item.label}</span>
                                        <span className="text-zinc-600">{item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 7. Rights */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">7.</span>{" "}
                                {isEn ? "Data Subject Rights" : "Érintetti jogok"}
                            </h2>
                            <p className="text-zinc-600 mb-4">
                                {isEn ? "Under the GDPR you have the right to:" : "A GDPR alapján Önnek joga van:"}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {(isEn ? [
                                    { title: "Right of access", desc: "You may request information about what data we hold about you and request a copy." },
                                    { title: "Right to rectification", desc: "You may request correction of inaccurate or incomplete data." },
                                    { title: "Right to erasure", desc: "In certain cases you may request deletion of your data (e.g. when no longer needed)." },
                                    { title: "Right to restriction", desc: "You may request restriction of processing (e.g. during verification of contested accuracy)." },
                                    { title: "Right to data portability", desc: "You may request that your data be provided in machine-readable format or transferred." },
                                    { title: "Right to object", desc: "You may object to processing based on legitimate interests." },
                                    { title: "Withdrawal of consent", desc: "If processing is based on consent, you may withdraw it at any time." },
                                ] : [
                                    { title: "Hozzáférés joga", desc: "Tájékoztatást kérhet arról, hogy milyen adatokat kezelünk Önről, és másolatot kérhet ezekről." },
                                    { title: "Helyesbítés joga", desc: "Kérheti a pontatlan vagy hiányos adatok helyesbítését." },
                                    { title: "Törlés joga", desc: "Bizonyos esetekben kérheti adatai törlését (pl. ha már nincs szükség az adatokra)." },
                                    { title: "Korlátozás joga", desc: "Kérheti az adatkezelés korlátozását (pl. vitatott pontosság esetén az ellenőrzés idejére)." },
                                    { title: "Adathordozhatóság joga", desc: "Kérheti, hogy adatait géppel olvasható formában adjuk ki vagy továbbítsuk." },
                                    { title: "Tiltakozás joga", desc: "Jogos érdek jogalapú adatkezelés esetén tiltakozhat az adatkezelés ellen." },
                                    { title: "Hozzájárulás visszavonása", desc: "Ha az adatkezelés hozzájáruláson alapul, azt bármikor visszavonhatja." },
                                ]).map((right, idx) => (
                                    <div key={idx} className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <strong className="block text-zinc-900 mb-1">{right.title}</strong>
                                        <span className="text-zinc-500 text-sm">{right.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                {isEn ? (
                                    <>Submit your request to exercise your rights to <strong className="text-blue-700">info@parksafe.hu</strong>.</>
                                ) : (
                                    <>Jogai gyakorlására vonatkozó kérelmét az <strong className="text-blue-700">info@parksafe.hu</strong> e-mail címre küldheti el.</>
                                )}
                            </p>
                        </section>

                        {/* 8. Contact */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">8.</span>{" "}
                                {isEn ? "Contact, Complaints, Supervisory Authority" : "Kapcsolat, panaszkezelés, felügyeleti hatóság"}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "For data protection questions, requests, or complaints, please contact us at:"
                                    : "Adatvédelemmel kapcsolatos kérdés, kérelem vagy panasz esetén az alábbi elérhetőségen veheti fel velünk a kapcsolatot:"}
                            </p>
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-3 text-zinc-600 mb-6">
                                <p className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>{isEn ? "Email:" : "E-mail:"}</strong> info@parksafe.hu</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>{isEn ? "Postal address:" : "Postai cím:"}</strong> Premiumtex Kft., 6792 Zsombó, Dózsa dűlő 55.</span>
                                </p>
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-3">
                                {isEn
                                    ? "If you believe that the processing of your personal data violates legal requirements, you are entitled to:"
                                    : "Amennyiben úgy ítéli meg, hogy személyes adatai kezelése sérti a jogszabályi előírásokat, jogosult:"}
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                {isEn ? (
                                    <>
                                        <li>lodge a complaint with the <strong className="text-zinc-900">Hungarian National Authority for Data Protection and Freedom of Information (NAIH)</strong>,</li>
                                        <li>seek judicial remedy to enforce your rights.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>panaszt tenni a <strong className="text-zinc-900">Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH)</strong>,</li>
                                        <li>bírósághoz fordulni a jogainak érvényesítése érdekében.</li>
                                    </>
                                )}
                            </ul>
                        </section>

                        {/* 9. Amendments */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">9.</span>{" "}
                                {isEn ? "Amendment of the Privacy Policy" : "Az adatkezelési tájékoztató módosítása"}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                {isEn
                                    ? "We reserve the right to amend this Privacy Policy from time to time, in particular due to:"
                                    : "Fenntartjuk a jogot, hogy a jelen Adatvédelmi szabályzatot időről időre módosítsuk, különösen:"}
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                {isEn ? (
                                    <>
                                        <li>changes in legislation,</li>
                                        <li>introduction of new services,</li>
                                        <li>material changes affecting data processing.</li>
                                    </>
                                ) : (
                                    <>
                                        <li>jogszabályváltozás,</li>
                                        <li>új szolgáltatások bevezetése,</li>
                                        <li>adatkezelést érintő lényeges változás esetén.</li>
                                    </>
                                )}
                            </ul>
                            <p className="text-zinc-600 leading-relaxed">
                                {isEn
                                    ? "We will notify you of amendments via the application or the associated website. If changes materially affect your rights, we may also notify you separately (e.g. via in-app notification) and, where applicable, request new consent."
                                    : "A módosításokról az alkalmazásban vagy a kapcsolódó weboldalon keresztül adunk tájékoztatást. Amennyiben a változtatások lényegesen érintik az Ön jogait, külön is jelezhetjük (pl. in-app értesítéssel) és adott esetben új hozzájárulást kérünk."}
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center border-t border-zinc-200 pt-8">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        <strong className="text-zinc-600">{isEn ? "Effective from:" : "Hatályos:"}</strong>{" "}
                        {isEn ? "March 17, 2026" : "2026. március 17-től"}
                        <br />
                        <span className="opacity-75">Premiumtex Kft. • 6792 Zsombó, Dózsa dűlő 55. • info@parksafe.hu</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
