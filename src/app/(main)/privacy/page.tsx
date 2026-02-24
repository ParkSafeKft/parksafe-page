import { ShieldCheck, Mail, MapPin } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-24 font-sans text-zinc-900 selection:bg-[#34aa56] selection:text-white">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-6 shadow-sm border border-emerald-100">
                        <ShieldCheck className="text-[#34aa56] w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
                        Adatvédelmi Szabályzat
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Utolsó frissítés: 2026. február 24.
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">

                    <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#34aa56] hover:prose-a:text-emerald-700">

                        {/* Adatkezelő */}
                        <section className="mb-12">
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-2 text-zinc-600 mb-6">
                                <p><strong className="text-zinc-900">Adatkezelő:</strong> Premiumtex Kft.</p>
                                <p><strong className="text-zinc-900">Székhely:</strong> 6792 Zsombó, Dózsa dűlő 55.</p>
                                <p><strong className="text-zinc-900">Cégjegyzékszám:</strong> 06-09-013323</p>
                                <p><strong className="text-zinc-900">Adószám:</strong> 14559253-2-06</p>
                                <p><strong className="text-zinc-900">E-mail:</strong> info@parksafe.hu</p>
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Jelen adatvédelmi szabályzat bemutatja:
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                <li>milyen adatokat gyűjtünk,</li>
                                <li>milyen célból és jogalapon kezeljük azokat,</li>
                                <li>mennyi ideig őrizzük meg,</li>
                                <li>kinek továbbítjuk,</li>
                                <li>milyen jogai vannak Önnek az adatkezeléssel kapcsolatban.</li>
                            </ul>
                            <p className="text-zinc-600 leading-relaxed">
                                Az adatkezelés során különösen a <strong className="text-zinc-900">GDPR</strong> (EU 2016/679 rendelet),
                                valamint a vonatkozó magyar jogszabályok (pl. Infotv.) rendelkezéseit tartjuk be.
                                Bizonyos adatkezelésekhez (pl. helyadatok, marketing értesítések) külön, kifejezett
                                hozzájárulást kérünk az alkalmazáson belül.
                            </p>
                        </section>

                        {/* 1. Gyűjtött adatok */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="text-[#34aa56]">1.</span> Gyűjtött adatok és adatkezelési célok
                            </h2>

                            <div className="space-y-6">
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">a) Regisztrációs és azonosítási adatok</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>név (vagy felhasználónév),</li>
                                        <li>e-mail cím,</li>
                                        <li>telefonszám (ha megadja),</li>
                                        <li>jelszó (titkosítva, visszafejthetetlen formában),</li>
                                        <li>külső azonosítók (pl. Google / Apple fiók azonosítója, ha social login-t használ).</li>
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> fiók létrehozása és kezelése, bejelentkezés biztosítása, azonosítás, kapcsolattartás.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> szerződés teljesítése (GDPR 6. cikk (1) b)), illetve jogos érdek (fiókbiztonság).
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">b) Helyadatok</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>GPS koordináták,</li>
                                        <li>keresett helyek,</li>
                                        <li>megjelenített térképrészletek.</li>
                                    </ul>
                                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-amber-900 text-sm">
                                        <strong>Háttérben futó helymeghatározás (background location):</strong> Az alkalmazás
                                        kerékpáros útvonalkövetés (ride tracking) funkciójának használata során – amennyiben Ön
                                        ezt kifejezetten engedélyezi – az alkalmazás háttérben is hozzáférhet az eszköz
                                        helyadataihoz, akkor is, ha az alkalmazás éppen nem látható a képernyőn. Erre kizárólag
                                        az aktív menetkövetés ideje alatt kerül sor. A gyűjtött helyadatok kizárólag a megtett
                                        távolság, sebesség és emelkedés kiszámítására szolgálnak; a részletes GPS nyomvonalat
                                        nem tároljuk, csak összesített statisztikai adatokat.
                                    </div>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> közeli tárolóhelyek és szervizpontok megjelenítése, navigáció,
                                        releváns találatok nyújtása, kerékpáros statisztikák rögzítése menetkövetés során.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> az Ön <strong>kifejezett hozzájárulása</strong> (GDPR 6. cikk (1) a)).
                                        Hozzájárulását bármikor visszavonhatja a készülék beállításaiban.
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">c) Eszköz- és technikai adatok</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>eszköz típusa, operációs rendszer, verzió,</li>
                                        <li>alkalmazás verziószáma,</li>
                                        <li>egyes technikai naplóadatok (hibalogok, teljesítményadatok).</li>
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> szolgáltatás technikai biztosítása, hibák feltárása, teljesítmény optimalizálása, visszaélések megelőzése.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> jogos érdek (GDPR 6. cikk (1) f)).
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">d) Használati adatok</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>alkalmazás használati szokások,</li>
                                        <li>kedvenc helyek, keresési előzmények,</li>
                                        <li>értesítések fogadására vonatkozó beállítások.</li>
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> felhasználói élmény javítása, termékfejlesztés, anonim statisztikák készítése.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> jogos érdek (szolgáltatás fejlesztése) vagy – ahol szükséges – hozzájárulás.
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">e) Közösségi tartalmak</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>értékelések (1–5 csillag),</li>
                                        <li>szöveges vélemények,</li>
                                        <li>feltöltött képek,</li>
                                        <li>hibajelentések, új helyszín javaslatok.</li>
                                    </ul>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> közösségi funkciók biztosítása, más felhasználók tájékoztatása, adatok minőségének javítása.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> szerződés teljesítése (az alkalmazás funkcióinak biztosítása).
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-3">f) Kerékpáros statisztikák (ride stats)</h3>
                                    <ul className="space-y-1 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                        <li>megtett távolság,</li>
                                        <li>menet időtartama,</li>
                                        <li>átlag- és maximális sebesség,</li>
                                        <li>indulás időpontja.</li>
                                    </ul>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4 text-emerald-900 text-sm font-medium">
                                        GPS nyomvonalat (részletes útvonal-koordinátákat) nem tárolunk – kizárólag összesített statisztikai adatokat.
                                    </div>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> statisztikák biztosítása a felhasználó számára, teljesítménykövetés, anonim aggregált statisztikák.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> szerződés teljesítése, jogos érdek (szolgáltatás fejlesztése).
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Helyadatok */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">2.</span> Helyadatok kezelése
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Helyadatok kezelése során különös figyelmet fordítunk az adatvédelmi elvekre:
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-6">
                                <li>helyadatokat <strong className="text-zinc-900">csak akkor gyűjtünk</strong>, ha Ön ehhez a készülék és az alkalmazás engedélyeiben hozzájárult,</li>
                                <li>a pontos helyadatokat <strong className="text-zinc-900">elsősorban a szolgáltatás nyújtása közben</strong> használjuk,</li>
                                <li><strong className="text-zinc-900">nem tárolunk</strong> folyamatos GPS útvonalat, nyomvonalat,</li>
                                <li>lehetősége van a helymeghatározás bármikori <strong className="text-zinc-900">kikapcsolására</strong>.</li>
                            </ul>

                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                <h3 className="text-lg font-bold text-zinc-900 mb-3">Háttérben futó helymeghatározás</h3>
                                <p className="text-zinc-600 mb-3">
                                    Az alkalmazás kerékpáros menetkövetés funkciójához opcionálisan
                                    <strong className="text-zinc-900"> háttér-helymeghatározási engedélyt</strong> kérhet:
                                </p>
                                <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                    <li>a háttér-helymeghatározás engedélyezése <strong className="text-zinc-900">nem kötelező</strong>; megtagadása esetén a menetkövetés csak akkor működik, ha az alkalmazás előtérben van,</li>
                                    <li>a háttérben gyűjtött helyadatokat <strong className="text-zinc-900">kizárólag az aktív menetkövetés ideje alatt</strong> használjuk,</li>
                                    <li>a háttér-hozzáférés az útvonal leállításával automatikusan megszűnik,</li>
                                    <li>a részletes GPS koordinátákat <strong className="text-zinc-900">nem tároljuk</strong> sem a készüléken, sem a szerveren,</li>
                                    <li>a háttér-helyadat engedélyt bármikor visszavonhatja a készülék <strong className="text-zinc-900">Beállítások → Adatvédelem → Helyszolgáltatások</strong> menüjében.</li>
                                </ul>
                            </div>
                        </section>

                        {/* 3. Sütik */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">3.</span> Sütik és nyomkövetés
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Az alkalmazás elsősorban mobil kliensként működik, de webes felület használata esetén
                                <strong className="text-zinc-900"> sütiket (cookies)</strong> és hasonló technológiákat alkalmazhatunk:
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: "Munkamenet-sütik", desc: "A bejelentkezési állapot fenntartására, biztonságos működésre." },
                                    { label: "Beállítási sütik", desc: "Nyelvi beállítás, téma (világos/sötét mód), egyéb preferenciák tárolása." },
                                    { label: "Teljesítmény- és analitikai sütik", desc: "A szolgáltatás fejlesztése érdekében anonim statisztikák készítése." },
                                    { label: "Hibakövetési eszközök", desc: "Alkalmazás összeomlások, hibák feltárása." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0">{idx + 1}</span>
                                        <span className="text-zinc-600"><strong className="text-zinc-900">{item.label}:</strong> {item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 mt-4 leading-relaxed">
                                Ahol jogszabály előírja, a nem feltétlenül szükséges sütik alkalmazásához
                                <strong className="text-zinc-900"> külön hozzájárulást kérünk</strong>, és lehetőséget biztosítunk azok kezelésére.
                            </p>
                        </section>

                        {/* 4. Adatbiztonság */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">4.</span> Adatbiztonság
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Adatainak védelme érdekében többek között az alábbi intézkedéseket alkalmazzuk:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {[
                                    { title: "Titkosítás", desc: "Az adatok titkosított formában kerülnek tárolásra és továbbításra (SSL/TLS)." },
                                    { title: "Hozzáférés-korlátozás", desc: "A személyes adatokhoz csak az arra jogosult munkatársak férnek hozzá." },
                                    { title: "Rendszeres frissítések", desc: "Biztonsági frissítések, sérülékenységvizsgálatok." },
                                    { title: "Biztonsági mentések", desc: "Rendszeres mentések készülnek az adatvesztés megelőzése érdekében." },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm">
                                        <strong className="block text-zinc-900 mb-1">{item.title}</strong>
                                        <span className="text-zinc-500 text-sm">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                                Bár mindent megteszünk az adatok védelméért, az interneten keresztüli adatátvitel és tárolás
                                nem tekinthető 100%-ban biztonságosnak; ennek kockázatát a felhasználó is tudomásul veszi.
                            </p>
                        </section>

                        {/* 5. Adatfeldolgozók */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">5.</span> Adatfeldolgozók és adatmegosztás
                            </h2>
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 text-emerald-900 font-medium mb-4">
                                Személyes adatait harmadik félnek nem adjuk el, és nem adjuk át indokolatlanul.
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Adatfeldolgozókat azonban igénybe veszünk a szolgáltatás működtetéséhez, például:
                            </p>
                            <div className="space-y-3 mb-6">
                                {[
                                    { label: "Infrastruktúra és adatbázis", desc: "pl. Supabase (hitelesítés, adatbázis), tárhelyszolgáltatók." },
                                    { label: "Térkép- és helymeghatározás", desc: "pl. MapLibre, OpenStreetMap adatszolgáltatók, Google Maps." },
                                    { label: "Fizetési szolgáltatók", desc: "Prémium előfizetések és egyéb tranzakciók lebonyolítására." },
                                    { label: "Analitikai és hibakövető", desc: "Alkalmazás teljesítményének és hibáinak elemzésére." },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0 whitespace-nowrap">{item.label}</span>
                                        <span className="text-zinc-600">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-3">
                                Ezek a partnerek az adatokat <strong className="text-zinc-900">kizárólag a szerződésben rögzített célokra</strong> kezelhetik.
                            </p>
                            <p className="text-zinc-600 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                                Adatátadás jogi okból történhet: hatósági megkeresésre, jogi eljárások során,
                                vagy ha jogi kötelezettség írja elő. Ilyen esetben az átadásról a jogszabályi
                                keretek között igyekszünk Önt értesíteni.
                            </p>
                        </section>

                        {/* 6. Adatmegőrzési idők */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">6.</span> Adatmegőrzési idők
                            </h2>
                            <p className="text-zinc-600 mb-4">Az adatokat <strong className="text-zinc-900">csak a szükséges ideig</strong> őrizzük meg:</p>
                            <ul className="space-y-3">
                                {[
                                    { label: "FIÓK", desc: "A fiók fennállásáig; fiók törlésekor ésszerű határidőn belül anonimizálásra vagy törlésre kerülnek." },
                                    { label: "TRANZAKCIÓK", desc: "Jogszabályban meghatározott ideig (pl. számviteli előírások)." },
                                    { label: "ÜGYFÉLSZOLGÁLAT", desc: "A szükséges ideig, hogy a panaszok, kérelmek kezelését biztosítsuk." },
                                    { label: "KÖZÖSSÉGI TARTALOM", desc: "A szolgáltatás működése szempontjából szükséges ideig; kérheti egyes tartalmak eltávolítását." },
                                    { label: "ANALITIKA", desc: "Jellemzően anonimizált formában, hosszabb távon is megőrizhetők." },
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100 list-none">
                                        <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5 shrink-0">{item.label}</span>
                                        <span className="text-zinc-600">{item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* 7. Érintetti jogok */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">7.</span> Érintetti jogok
                            </h2>
                            <p className="text-zinc-600 mb-4">A GDPR alapján Önnek joga van:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {[
                                    { title: "Hozzáférés joga", desc: "Tájékoztatást kérhet arról, hogy milyen adatokat kezelünk Önről, és másolatot kérhet ezekről." },
                                    { title: "Helyesbítés joga", desc: "Kérheti a pontatlan vagy hiányos adatok helyesbítését." },
                                    { title: "Törlés joga", desc: "Bizonyos esetekben kérheti adatai törlését (pl. ha már nincs szükség az adatokra)." },
                                    { title: "Korlátozás joga", desc: "Kérheti az adatkezelés korlátozását (pl. vitatott pontosság esetén az ellenőrzés idejére)." },
                                    { title: "Adathordozhatóság joga", desc: "Kérheti, hogy adatait géppel olvasható formában adjuk ki vagy továbbítsuk." },
                                    { title: "Tiltakozás joga", desc: "Jogos érdek jogalapú adatkezelés esetén tiltakozhat az adatkezelés ellen." },
                                    { title: "Hozzájárulás visszavonása", desc: "Ha az adatkezelés hozzájáruláson alapul, azt bármikor visszavonhatja." },
                                ].map((right, idx) => (
                                    <div key={idx} className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        <strong className="block text-zinc-900 mb-1">{right.title}</strong>
                                        <span className="text-zinc-500 text-sm">{right.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-600 bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                                Jogai gyakorlására vonatkozó kérelmét az{" "}
                                <strong className="text-blue-700">info@parksafe.hu</strong> e-mail címre küldheti el.
                            </p>
                        </section>

                        {/* 8. Kapcsolat */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">8.</span> Kapcsolat, panaszkezelés, felügyeleti hatóság
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Adatvédelemmel kapcsolatos kérdés, kérelem vagy panasz esetén az alábbi elérhetőségen
                                veheti fel velünk a kapcsolatot:
                            </p>
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-3 text-zinc-600 mb-6">
                                <p className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>E-mail:</strong> info@parksafe.hu</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>Postai cím:</strong> Premiumtex Kft., 6792 Zsombó, Dózsa dűlő 55.</span>
                                </p>
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-3">
                                Amennyiben úgy ítéli meg, hogy személyes adatai kezelése sérti a jogszabályi
                                előírásokat, jogosult:
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                <li>panaszt tenni a <strong className="text-zinc-900">Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH)</strong>,</li>
                                <li>bírósághoz fordulni a jogainak érvényesítése érdekében.</li>
                            </ul>
                        </section>

                        {/* 9. Módosítások */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">9.</span> Az adatkezelési tájékoztató módosítása
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Fenntartjuk a jogot, hogy a jelen Adatvédelmi szabályzatot időről időre módosítsuk, különösen:
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56] mb-4">
                                <li>jogszabályváltozás,</li>
                                <li>új szolgáltatások bevezetése,</li>
                                <li>adatkezelést érintő lényeges változás esetén.</li>
                            </ul>
                            <p className="text-zinc-600 leading-relaxed">
                                A módosításokról az alkalmazásban vagy a kapcsolódó weboldalon keresztül adunk
                                tájékoztatást. Amennyiben a változtatások lényegesen érintik az Ön jogait, külön
                                is jelezhetjük (pl. in-app értesítéssel) és adott esetben új hozzájárulást kérünk.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center border-t border-zinc-200 pt-8">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        <strong className="text-zinc-600">Hatályos:</strong> 2026. február 24-től
                        <br />
                        <span className="opacity-75">Premiumtex Kft. • 6792 Zsombó, Dózsa dűlő 55. • info@parksafe.hu</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
