'use client';

import { FileText, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
    hu: {
        title: "Általános Szerződési Feltételek",
        lastUpdated: "Utolsó frissítés: 2025. január 5.",
        sections: [
            {
                num: "1.",
                heading: "Általános rendelkezések",
                paragraphs: [
                    "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Premiumtex Kft. (székhely: 6792 Zsombó, Dózsa dűlő 55.; cégjegyzékszám: 06-09-013323; adószám: 14559253-2-06) által üzemeltetett ParkSafe alkalmazás és szolgáltatások használatára vonatkoznak.",
                    "Az alkalmazás használatával Ön elfogadja jelen ÁSZF-ben foglalt feltételeket. Kérjük, hogy a regisztráció előtt figyelmesen olvassa el az alábbi feltételeket.",
                ],
            },
            {
                num: "2.",
                heading: "A szolgáltatás leírása",
                intro: "A ParkSafe egy mobilalkalmazás, amely segít a felhasználóknak biztonságos kerékpár- és roller-tárolóhelyek megtalálásában. A szolgáltatás keretében a következő funkciókat biztosítjuk:",
                list: [
                    "Tárolóhelyek térképes megjelenítése",
                    "Valós idejű elérhetőségi információk",
                    "Közösségi értékelések és vélemények",
                    "Biztonsági információk és kamerarendszer adatok",
                    "Szerviz- és kiegészítő szolgáltatások keresése",
                ],
            },
            {
                num: "3.",
                heading: "Regisztráció és felhasználói fiók",
                intro: "A szolgáltatás teljes körű használatához regisztráció szükséges. A regisztráció során megadott adatok valódiságáért a felhasználó felel. A felhasználó köteles:",
                list: [
                    "Valós adatokat megadni a regisztráció során",
                    "Fiókadatait biztonságban tartani",
                    "Jelszavát rendszeresen megváltoztatni",
                    "Haladéktalanul jelenteni bármilyen visszaélést",
                ],
            },
            {
                num: "4.",
                heading: "Díjak és fizetés",
                paragraphs: [
                    "Az alkalmazás alapfunkciói ingyenesen használhatók. A prémium szolgáltatásokért havonta 990 Ft díjat számítunk fel. A díjfizetés automatikus megújítással történik, amelyet a felhasználó bármikor lemondhat.",
                    "Az első hónapban a prémium szolgáltatások ingyenesen kipróbálhatók. A lemondás elmulasztása esetén automatikusan megújul a prémium előfizetés.",
                ],
            },
            {
                num: "5.",
                heading: "Adatvédelem",
                paragraphs: [
                    "A személyes adatok kezelésére vonatkozó információkat részletesen az Adatvédelmi Tájékoztatónkban találja. A regisztrációval Ön hozzájárul adatainak az ott leírt módon történő kezeléséhez.",
                    "Az alkalmazás használata során gyűjtött helyadatok kizárólag a szolgáltatás nyújtásához szükséges mértékben kerülnek felhasználásra.",
                ],
            },
            {
                num: "6.",
                heading: "Szellemi tulajdonjogok",
                paragraphs: [
                    "Az alkalmazás és annak tartalma (szoftver, grafika, szövegek, adatbázis) a Premiumtex Kft. szellemi tulajdonát képezi. A felhasználó kizárólag a szolgáltatás rendeltetésszerű használatára jogosult.",
                    "Tilos az alkalmazás tartalmának másolása, terjesztése, módosítása vagy kereskedelmi célú felhasználása a Premiumtex Kft. írásos engedélye nélkül.",
                ],
            },
            {
                num: "7.",
                heading: "Felelősség korlátozása",
                paragraphs: [
                    "A Premiumtex Kft. nem vállal felelősséget a tárolóhelyek tényleges biztonságáért vagy elérhetőségéért. Az alkalmazásban megjelenő információk tájékoztató jellegűek.",
                    "A társaság nem felel a felhasználó által a tárolóhelyeken elszenvedett károkért, lopásokért vagy bármilyen egyéb veszteségért.",
                ],
            },
            {
                num: "8.",
                heading: "Közösségi tartalmak",
                paragraphs: [
                    "A felhasználók által közzétett értékelések, vélemények és egyéb tartalmak szerzői jogaiért a feltöltő felhasználó felel. A társaság fenntartja a jogot a nem megfelelő tartalmak eltávolítására.",
                    "Tilos trágár, sértő, jogellenes vagy valótlan tartalmak közzététele. Az ilyen tartalmak közzétevőjének fiókját felfüggesztjük.",
                ],
            },
            {
                num: "9.",
                heading: "Szolgáltatás felfüggesztése",
                paragraphs: [
                    "A Premiumtex Kft. fenntartja a jogot a szolgáltatás ideiglenes vagy végleges felfüggesztésére karbantartás, fejlesztés vagy egyéb műszaki okok miatt.",
                    "Súlyos szerződésszegés esetén a társaság jogosult a felhasználói fiók azonnali felfüggesztésére vagy törlésére előzetes értesítés nélkül.",
                ],
            },
            {
                num: "10.",
                heading: "Jogviták rendezése",
                paragraphs: [
                    "A jelen ÁSZF-fel kapcsolatos jogviták rendezésére a magyar jog irányadó. A felek elsősorban békés úton kísérlik meg rendezni a vitákat.",
                    "Amennyiben a békés rendezés nem vezet eredményre, a jogviták elbírálására a Budapesti Törvényszék kizárólagosan illetékes.",
                ],
            },
            {
                num: "11.",
                heading: "Az ÁSZF módosítása",
                paragraphs: [
                    "A Premiumtex Kft. fenntartja a jogot jelen ÁSZF egyoldalú módosítására. A módosításokról a felhasználókat e-mail útján vagy az alkalmazásban megjelenő értesítéssel tájékoztatjuk.",
                    "A módosítások a közléstől számított 15 napon belül lépnek hatályba. A szolgáltatás további használatával a felhasználó elfogadja a módosított feltételeket.",
                ],
            },
        ],
        contactHeading: "Kapcsolat",
        contactIntro: "Jelen ÁSZF-fel kapcsolatos kérdésekkel, panaszokkal a következő elérhetőségeken fordulhat hozzánk:",
        emailLabel: "E-mail",
        addressLabel: "Postai cím",
        phoneLabel: "Telefonos ügyfélszolgálat",
        footerEffective: "Hatályos:",
        footerDate: "2025. január 5-től",
    },
    en: {
        title: "Terms and Conditions",
        lastUpdated: "Last updated: January 5, 2025",
        sections: [
            {
                num: "1.",
                heading: "General Provisions",
                paragraphs: [
                    "These Terms and Conditions (hereinafter: Terms) govern the use of the ParkSafe application and services operated by Premiumtex Kft. (registered address: 6792 Zsombó, Dózsa dűlő 55.; company registration number: 06-09-013323; tax number: 14559253-2-06).",
                    "By using the application, you agree to the terms set forth in these Terms. Please read the following terms carefully before registering.",
                ],
            },
            {
                num: "2.",
                heading: "Description of Services",
                intro: "ParkSafe is a mobile application that helps users find safe bicycle and scooter storage locations. The service provides the following features:",
                list: [
                    "Map display of storage locations",
                    "Real-time availability information",
                    "Community ratings and reviews",
                    "Security information and CCTV data",
                    "Search for repair and supplementary services",
                ],
            },
            {
                num: "3.",
                heading: "Registration and User Account",
                intro: "Full use of the service requires registration. The user is responsible for the accuracy of the data provided during registration. The user must:",
                list: [
                    "Provide accurate information during registration",
                    "Keep their account credentials secure",
                    "Change their password regularly",
                    "Report any misuse immediately",
                ],
            },
            {
                num: "4.",
                heading: "Fees and Payment",
                paragraphs: [
                    "The basic features of the application are free to use. A monthly fee of 990 HUF is charged for premium services. Payment is made with automatic renewal, which the user may cancel at any time.",
                    "During the first month, premium services can be tried for free. If not cancelled, the premium subscription will automatically renew.",
                ],
            },
            {
                num: "5.",
                heading: "Data Protection",
                paragraphs: [
                    "Detailed information on the processing of personal data can be found in our Privacy Policy. By registering, you consent to the processing of your data as described therein.",
                    "Location data collected during use of the application is used only to the extent necessary to provide the service.",
                ],
            },
            {
                num: "6.",
                heading: "Intellectual Property",
                paragraphs: [
                    "The application and its contents (software, graphics, texts, database) are the intellectual property of Premiumtex Kft. The user is only entitled to use the service for its intended purpose.",
                    "Copying, distributing, modifying, or commercially using the application's content without the written consent of Premiumtex Kft. is prohibited.",
                ],
            },
            {
                num: "7.",
                heading: "Limitation of Liability",
                paragraphs: [
                    "Premiumtex Kft. assumes no responsibility for the actual safety or availability of storage locations. Information displayed in the application is for informational purposes only.",
                    "The company is not liable for any damages, thefts, or any other losses suffered by the user at storage locations.",
                ],
            },
            {
                num: "8.",
                heading: "Community Content",
                paragraphs: [
                    "The user who uploads ratings, reviews, and other content is responsible for the copyright of such content. The company reserves the right to remove inappropriate content.",
                    "Publishing offensive, defamatory, illegal, or false content is prohibited. Accounts of users who publish such content will be suspended.",
                ],
            },
            {
                num: "9.",
                heading: "Service Suspension",
                paragraphs: [
                    "Premiumtex Kft. reserves the right to temporarily or permanently suspend the service for maintenance, development, or other technical reasons.",
                    "In the event of a serious breach of contract, the company is entitled to immediately suspend or delete the user account without prior notice.",
                ],
            },
            {
                num: "10.",
                heading: "Dispute Resolution",
                paragraphs: [
                    "Disputes related to these Terms are governed by Hungarian law. The parties shall first attempt to resolve disputes amicably.",
                    "If an amicable resolution is not achieved, the Budapest Court shall have exclusive jurisdiction over disputes.",
                ],
            },
            {
                num: "11.",
                heading: "Amendment of Terms",
                paragraphs: [
                    "Premiumtex Kft. reserves the right to unilaterally amend these Terms. Users will be notified of amendments via email or in-app notification.",
                    "Amendments take effect within 15 days of notification. Continued use of the service constitutes acceptance of the amended terms.",
                ],
            },
        ],
        contactHeading: "Contact",
        contactIntro: "For questions or complaints regarding these Terms, please contact us at the following:",
        emailLabel: "Email",
        addressLabel: "Postal address",
        phoneLabel: "Customer service phone",
        footerEffective: "Effective from:",
        footerDate: "January 5, 2025",
    },
};

export default function TermsPage() {
    const { language } = useLanguage();
    const c = content[language] ?? content.hu;

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-24 font-sans text-zinc-900 selection:bg-[#34aa56] selection:text-white">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-emerald-50 mb-6 shadow-sm border border-emerald-100">
                        <FileText className="text-[#34aa56] w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
                        {c.title}
                    </h1>
                    <p className="text-zinc-500 font-medium">{c.lastUpdated}</p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100">
                    <div className="prose prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#34aa56] hover:prose-a:text-emerald-700">

                        {c.sections.map((section) => (
                            <section key={section.num} className="mb-12">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <span className="text-[#34aa56]">{section.num}</span> {section.heading}
                                </h2>
                                {"intro" in section && section.intro && (
                                    <p className="text-zinc-600 leading-relaxed mb-4">{section.intro}</p>
                                )}
                                {"list" in section && section.list && (
                                    <ul className="space-y-2 text-zinc-600 list-disc pl-5 marker:text-[#34aa56]">
                                        {section.list.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                                {"paragraphs" in section && section.paragraphs && section.paragraphs.map((p, i) => (
                                    <p key={i} className="text-zinc-600 leading-relaxed mt-4">{p}</p>
                                ))}
                            </section>
                        ))}

                        {/* Contact */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-[#34aa56]">12.</span> {c.contactHeading}
                            </h2>
                            <p className="text-zinc-600 leading-relaxed mb-4">{c.contactIntro}</p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <Mail className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>{c.emailLabel}:</strong> info@parksafe.hu</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <MapPin className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>{c.addressLabel}:</strong> 6792 Zsombó, Dózsa d. 55.</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                    <Phone className="w-5 h-5 text-[#34aa56]" />
                                    <span><strong>{c.phoneLabel}:</strong> +36 30 721 2524</span>
                                </li>
                            </ul>
                        </section>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-12 text-center border-t border-zinc-200 pt-8">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        <strong className="text-zinc-600">{c.footerEffective}</strong> {c.footerDate}
                        <br />
                        <span className="opacity-75">Premiumtex Kft. • Zsombó, Dózsa d. 55. • info@parksafe.hu</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
