import { FileText, Shield, Mail, MapPin, Phone } from "lucide-react";

function Terms() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-24 font-sans text-zinc-900 selection:bg-[#34aa56] selection:text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-6 shadow-sm border border-emerald-100">
            <FileText className="text-[#34aa56] w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Általános Szerződési Feltételek
          </h1>
          <p className="text-zinc-500 font-medium">
            Utolsó frissítés: 2025. január 5.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">
          
          <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#34aa56] hover:prose-a:text-emerald-700">
            
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">1.</span> Általános rendelkezések
              </h2>
              <p className="text-zinc-600 leading-relaxed">
                Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a
                Premiumtex Kft. (székhely: 6792 Zsombó, Dózsa dűlő 55.;
                cégjegyzékszám: 06-09-013323; adószám: 14559253-2-06) által
                üzemeltetett ParkSafe alkalmazás és szolgáltatások használatára
                vonatkoznak.
              </p>
              <p className="text-zinc-600 leading-relaxed mt-4">
                Az alkalmazás használatával Ön elfogadja jelen ÁSZF-ben foglalt
                feltételeket. Kérjük, hogy a regisztráció előtt figyelmesen
                olvassa el az alábbi feltételeket.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">2.</span> A szolgáltatás leírása
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A ParkSafe egy mobilalkalmazás, amely segít a
                felhasználóknak biztonságos kerékpár- és roller-tárolóhelyek
                megtalálásában. A szolgáltatás keretében a következő funkciókat
                biztosítjuk:
              </p>
              <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                <li>Tárolóhelyek térképes megjelenítése</li>
                <li>Valós idejű elérhetőségi információk</li>
                <li>Közösségi értékelések és vélemények</li>
                <li>Biztonsági információk és kamerarendszer adatok</li>
                <li>Szerviz- és kiegészítő szolgáltatások keresése</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">3.</span> Regisztráció és felhasználói fiók
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A szolgáltatás teljes körű használatához regisztráció szükséges. A
                regisztráció során megadott adatok valódiságáért a felhasználó
                felel. A felhasználó köteles:
              </p>
              <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                <li>Valós adatokat megadni a regisztráció során</li>
                <li>Fiókadatait biztonságban tartani</li>
                <li>Jelszavát rendszeresen megváltoztatni</li>
                <li>Haladéktalanul jelenteni bármilyen visszaélést</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">4.</span> Díjak és fizetés
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Az alkalmazás alapfunkciói ingyenesen használhatók. A prémium
                szolgáltatásokért havonta 990 Ft díjat számítunk fel. A díjfizetés
                automatikus megújítással történik, amelyet a felhasználó bármikor
                lemondhat.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Az első hónapban a prémium szolgáltatások ingyenesen
                kipróbálhatók. A lemondás elmulasztása esetén automatikusan
                megújul a prémium előfizetés.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">5.</span> Adatvédelem
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A személyes adatok kezelésére vonatkozó információkat részletesen
                az Adatvédelmi Tájékoztatónkban találja. A regisztrációval Ön
                hozzájárul adatainak az ott leírt módon történő kezeléséhez.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Az alkalmazás használata során gyűjtött helyadatok kizárólag a
                szolgáltatás nyújtásához szükséges mértékben kerülnek
                felhasználásra.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">6.</span> Szellemi tulajdonjogok
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Az alkalmazás és annak tartalma (szoftver, grafika, szövegek,
                adatbázis) a Premiumtex Kft. szellemi tulajdonát képezi. A
                felhasználó kizárólag a szolgáltatás rendeltetésszerű használatára
                jogosult.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Tilos az alkalmazás tartalmának másolása, terjesztése, módosítása
                vagy kereskedelmi célú felhasználása a Premiumtex Kft. írásos
                engedélye nélkül.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">7.</span> Felelősség korlátozása
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A Premiumtex Kft. nem vállal felelősséget a tárolóhelyek tényleges
                biztonságáért vagy elérhetőségéért. Az alkalmazásban megjelenő
                információk tájékoztató jellegűek.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                A társaság nem felel a felhasználó által a tárolóhelyeken
                elszenvedett károkért, lopásokért vagy bármilyen egyéb
                veszteségért.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">8.</span> Közösségi tartalmak
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A felhasználók által közzétett értékelések, vélemények és egyéb
                tartalmak szerzői jogaiért a feltöltő felhasználó felel. A
                társaság fenntartja a jogot a nem megfelelő tartalmak
                eltávolítására.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Tilos trágár, sértő, jogellenes vagy valótlan tartalmak
                közzététele. Az ilyen tartalmak közzétevőjének fiókját
                felfüggesztjük.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">9.</span> Szolgáltatás felfüggesztése
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A Premiumtex Kft. fenntartja a jogot a szolgáltatás ideiglenes
                vagy végleges felfüggesztésére karbantartás, fejlesztés vagy egyéb
                műszaki okok miatt.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Súlyos szerződésszegés esetén a társaság jogosult a felhasználói
                fiók azonnali felfüggesztésére vagy törlésére előzetes értesítés
                nélkül.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">10.</span> Jogviták rendezése
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A jelen ÁSZF-fel kapcsolatos jogviták rendezésére a magyar jog
                irányadó. A felek elsősorban békés úton kísérlik meg rendezni a
                vitákat.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Amennyiben a békés rendezés nem vezet eredményre, a jogviták
                elbírálására a Budapesti Törvényszék kizárólagosan illetékes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">11.</span> Az ÁSZF módosítása
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                A Premiumtex Kft. fenntartja a jogot jelen ÁSZF egyoldalú
                módosítására. A módosításokról a felhasználókat e-mail útján vagy
                az alkalmazásban megjelenő értesítéssel tájékoztatjuk.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                A módosítások a közléstől számított 15 napon belül lépnek
                hatályba. A szolgáltatás további használatával a felhasználó
                elfogadja a módosított feltételeket.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-[#34aa56]">12.</span> Kapcsolat
              </h2>
              <p className="text-zinc-600 leading-relaxed mb-4">
                Jelen ÁSZF-fel kapcsolatos kérdésekkel, panaszokkal a következő
                elérhetőségeken fordulhat hozzánk:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <Mail className="w-5 h-5 text-[#34aa56]" />
                  <span><strong>E-mail:</strong> perjesidev@gmail.com</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <MapPin className="w-5 h-5 text-[#34aa56]" />
                  <span><strong>Postai cím:</strong> 6792 Zsombó, Dózsa d. 55.</span>
                </li>
                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                  <Phone className="w-5 h-5 text-[#34aa56]" />
                  <span><strong>Telefonos ügyfélszolgálat:</strong> +36 30 721 2524</span>
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center border-t border-zinc-200 pt-8">
          <p className="text-zinc-400 text-sm leading-relaxed">
            <strong className="text-zinc-600">Hatályos:</strong> 2025. január 5-től
            <br />
            <span className="opacity-75">Premiumtex Kft. • Zsombó, Dózsa d. 55. • perjesidev@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Terms;

