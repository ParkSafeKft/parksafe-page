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
                        Utolsó frissítés: 2025. augusztus 8.
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">

                    <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#34aa56] hover:prose-a:text-emerald-700">

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">1.</span> Általános információk
                            </h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Jelen Adatvédelmi Szabályzat a ParkSafe alkalmazással és
                                weboldalával kapcsolatos adatkezelési gyakorlatainkat ismerteti.
                                Az adatkezelő a <strong className="text-zinc-900">Premiumtex Kft.</strong>
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">2.</span> Adatkezelő elérhetősége
                            </h2>
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-3 text-zinc-600">
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-900 min-w-[80px]">Cégnév:</span> Premiumtex Kft.
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-900 min-w-[80px]">Székhely:</span> 6792 Zsombó, Dózsa d. 55
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-semibold text-zinc-900 min-w-[80px]">E-mail:</span> info@parksafe.hu
                                </p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">3.</span> Kezelt személyes adatok
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Weboldalunkon keresztül kizárólag az alábbi személyes adatokat
                                kezeljük:
                            </p>
                            <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                <li>
                                    <strong className="text-zinc-900">E-mail cím:</strong> Hírlevelünkre való feliratkozás
                                    esetén
                                </li>
                                <li>
                                    <strong className="text-zinc-900">Kapcsolatfelvételi adatok:</strong> A kapcsolatfelvételi
                                    űrlap kitöltése esetén (név, e-mail, üzenet)
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">4.</span> Adatkezelés célja és jogalapja
                            </h2>
                            <div className="space-y-6">
                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">4.1 Hírlevél feliratkozás</h3>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> Tájékoztatás nyújtása a ParkSafe
                                        alkalmazással kapcsolatos újdonságokról és fejlesztésekről.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> Az érintett önkéntes hozzájárulása
                                        (GDPR 6. cikk (1) bekezdés a) pont)
                                    </p>
                                </div>

                                <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100">
                                    <h3 className="text-lg font-bold text-zinc-900 mb-2">4.2 Kapcsolatfelvétel</h3>
                                    <p className="text-zinc-600 mb-1">
                                        <strong className="text-zinc-900">Cél:</strong> A felhasználók kérdéseinek megválaszolása,
                                        támogatás nyújtása.
                                    </p>
                                    <p className="text-zinc-600">
                                        <strong className="text-zinc-900">Jogalap:</strong> Jogos érdek (GDPR 6. cikk (1) bekezdés
                                        f) pont)
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">5.</span> Adatok felhasználása
                            </h2>
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 text-emerald-900 font-medium mb-4">
                                Kifejezetten kijelentjük, hogy személyes adatait kizárólag
                                azonosítás és kommunikáció céljából használjuk fel.
                            </div>
                            <p className="text-zinc-600 leading-relaxed">
                                Adatait nem használjuk fel marketing célokra a hírlevél küldésén
                                kívül, nem készítünk profilt Önről, és nem végzünk automatizált
                                döntéshozatalt.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">6.</span> Adatok továbbítása harmadik fél részére
                            </h2>
                            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 text-emerald-900 font-medium mb-4">
                                Személyes adatait harmadik fél részére nem továbbítjuk, nem
                                adjuk ki, és nem értékesítjük.
                            </div>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Az adatok kizárólag saját rendszereinkben kerülnek tárolásra és
                                feldolgozásra.
                            </p>
                            <p className="text-zinc-600 leading-relaxed italic border-l-2 border-zinc-200 pl-4">
                                Kivétel: Jogszabály által előírt esetekben (pl. hatósági
                                megkeresés) kötelezettek vagyunk az adatok átadására a
                                jogszabályban meghatározott szerveknek.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">7.</span> Adatok tárolásának időtartama
                            </h2>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5">HÍRLEVÉL</span>
                                    <span className="text-zinc-600">A feliratkozás visszavonásáig vagy a szolgáltatás megszűnéséig</span>
                                </li>
                                <li className="flex items-start gap-3 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded mt-0.5">KAPCSOLAT</span>
                                    <span className="text-zinc-600">A megkeresés lezárásától számított 1 évig</span>
                                </li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">8.</span> Az érintettek jogai
                            </h2>
                            <p className="text-zinc-600 mb-4">A GDPR alapján Önnek joga van:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {[
                                    { title: "Tájékoztatáshoz", desc: "Információt kérni az adatkezelésről" },
                                    { title: "Hozzáféréshez", desc: "Betekinteni a kezelt személyes adataiba" },
                                    { title: "Helyesbítéshez", desc: "Kérni az adatok javítását" },
                                    { title: "Törléshez", desc: "Kérni az adatok törlését" },
                                    { title: "Korlátozáshoz", desc: "Kérni az adatkezelés korlátozását" },
                                    { title: "Hordozhatósághoz", desc: "Kérni az adatok átadását" },
                                    { title: "Tiltakozáshoz", desc: "Tiltakozni az adatkezelés ellen" },
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

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">9.</span> Adatbiztonság
                            </h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Megfelelő technikai és szervezési intézkedéseket tettünk az adatok
                                biztonságának megőrzése érdekében. Az adatok tárolása titkosított
                                kapcsolaton keresztül, biztonságos szervereken történik.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">10.</span> Sütik (Cookies)
                            </h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Weboldalunk alapvető működéséhez szükséges sütiket használ.
                                Analitikai célú sütiket csak az Ön hozzájárulásával használunk. A
                                sütik kezelésére vonatkozó részletes tájékoztatást külön Süti
                                Szabályzatunkban találja.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">11.</span> Kapcsolat és panasztétel
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">
                                Adatvédelmi kérdéseivel, panaszaival fordulhat hozzánk az alábbi
                                elérhetőségeken:
                            </p>
                            <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 space-y-3 text-zinc-600">
                                <p className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>E-mail:</strong> info@parksafe.hu</span>
                                </p>
                                <p className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>Postai cím:</strong> 6792 Zsombó, Dózsa d. 55</span>
                                </p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">12.</span> Módosítások
                            </h2>
                            <p className="text-zinc-600 leading-relaxed">
                                Fenntartjuk a jogot jelen Adatvédelmi Szabályzat módosítására. A
                                módosításokról weboldalunkon keresztül tájékoztatjuk
                                felhasználóinkat.
                            </p>
                        </section>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center border-t border-zinc-200 pt-8">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        <strong className="text-zinc-600">Hatályos:</strong> 2025. augusztus 8-tól
                        <br />
                        <span className="opacity-75">Premiumtex Kft. • 6792 Zsombó, Dózsa d. 55 • info@parksafe.hu</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
