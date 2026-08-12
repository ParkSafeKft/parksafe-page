'use client';

import Link from "next/link";
import { FileText, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const content = {
    hu: {
        title: "Általános Szerződési Feltételek",
        lastUpdated: "Utolsó frissítés: 2026. augusztus 12.",
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
                heading: "Támogatás",
                paragraphs: [
                    "A felhasználók önkéntes támogatással járulhatnak hozzá az alkalmazás fejlesztéséhez és működtetéséhez.",
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
        footerDate: "2026. augusztus 12-től",
    },
    en: {
        title: "Terms and Conditions",
        lastUpdated: "Last updated: August 12, 2026",
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
                heading: "Support",
                paragraphs: [
                    "Users may voluntarily support the development and operation of the application.",
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
        footerDate: "August 12, 2026",
    },
};

export default function TermsPage() {
    const { language } = useLanguage();
    const c = content[language] ?? content.hu;

    return (
        <div className="min-h-screen bg-white pb-28 pt-36 font-sans text-[#101512] selection:bg-[#34aa56] selection:text-white">
            <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <header className="grid gap-8 border-b border-[#101512]/20 pb-12 lg:grid-cols-12 lg:items-end lg:pb-16">
                    <div className="lg:col-span-8">
                        <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#258642]">
                            <FileText className="h-5 w-5" />
                            ParkSafe / Legal
                        </p>
                        <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                            {c.title}
                        </h1>
                    </div>
                    <div className="lg:col-span-4">
                        <p className="text-sm font-semibold text-[#667169]">{c.lastUpdated}</p>
                        <nav aria-label="Legal documents" className="mt-5 flex gap-5 text-sm font-bold">
                            <span className="text-[#258642]">{language === 'en' ? 'Terms' : 'ÁSZF'}</span>
                            <Link href="/privacy" className="border-b border-[#101512]/25 pb-1 hover:border-[#34aa56] hover:text-[#258642]">
                                {language === 'en' ? 'Privacy' : 'Adatvédelem'}
                            </Link>
                        </nav>
                    </div>
                </header>

                <div className="grid gap-12 py-14 lg:grid-cols-12 lg:py-20">
                    <aside className="hidden lg:col-span-3 lg:block">
                        <nav aria-label={language === 'en' ? 'Terms sections' : 'ÁSZF fejezetek'} className="sticky top-32 border-t border-[#101512]/20">
                            {c.sections.map((section) => (
                                <a
                                    key={section.num}
                                    href={`#section-${section.num.replace('.', '')}`}
                                    className="grid grid-cols-[2rem_1fr] gap-3 border-b border-[#101512]/10 py-3 text-sm text-[#5f6a62] transition-colors hover:text-[#258642]"
                                >
                                    <span className="font-bold text-[#258642]">{section.num}</span>
                                    <span>{section.heading}</span>
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <article className="lg:col-span-8 lg:col-start-5">
                        {c.sections.map((section) => (
                            <section
                                id={`section-${section.num.replace('.', '')}`}
                                key={section.num}
                                className="scroll-mt-32 border-t border-[#101512]/20 py-10 first:pt-0 lg:py-12"
                            >
                                <h2 className="grid gap-3 text-2xl font-black tracking-[-0.035em] sm:grid-cols-[3rem_1fr] sm:text-3xl">
                                    <span className="text-[#258642]">{section.num}</span>
                                    <span>{section.heading}</span>
                                </h2>
                                <div className="mt-6 max-w-[70ch] pl-0 sm:pl-12">
                                    {"intro" in section && section.intro && (
                                        <p className="mb-4 leading-8 text-[#5f6a62] text-pretty">{section.intro}</p>
                                    )}
                                    {"list" in section && section.list && (
                                        <ul className="list-disc space-y-2 pl-5 leading-7 text-[#5f6a62] marker:text-[#34aa56]">
                                            {section.list.map((item) => <li key={item}>{item}</li>)}
                                        </ul>
                                    )}
                                    {"paragraphs" in section && section.paragraphs && section.paragraphs.map((paragraph) => (
                                        <p key={paragraph} className="mt-4 leading-8 text-[#5f6a62] text-pretty">{paragraph}</p>
                                    ))}
                                </div>
                            </section>
                        ))}

                        <section className="border-t border-[#101512]/20 py-10 lg:py-12">
                            <h2 className="grid gap-3 text-2xl font-black tracking-[-0.035em] sm:grid-cols-[3rem_1fr] sm:text-3xl">
                                <span className="text-[#258642]">12.</span>
                                <span>{c.contactHeading}</span>
                            </h2>
                            <div className="mt-6 max-w-[70ch] sm:pl-12">
                                <p className="mb-6 leading-8 text-[#5f6a62]">{c.contactIntro}</p>
                                <ul className="border-t border-[#101512]/15">
                                    <li className="flex items-center gap-3 border-b border-[#101512]/15 py-4 text-[#5f6a62]">
                                        <Mail className="h-5 w-5 text-[#258642]" />
                                        <span><strong className="text-[#101512]">{c.emailLabel}:</strong> info@parksafe.hu</span>
                                    </li>
                                    <li className="flex items-center gap-3 border-b border-[#101512]/15 py-4 text-[#5f6a62]">
                                        <MapPin className="h-5 w-5 text-[#258642]" />
                                        <span><strong className="text-[#101512]">{c.addressLabel}:</strong> 6792 Zsombó, Dózsa d. 55.</span>
                                    </li>
                                    <li className="flex items-center gap-3 border-b border-[#101512]/15 py-4 text-[#5f6a62]">
                                        <Phone className="h-5 w-5 text-[#258642]" />
                                        <span><strong className="text-[#101512]">{c.phoneLabel}:</strong> +36 30 721 2524</span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </article>
                </div>

                <div className="border-t border-[#101512]/20 pt-8">
                    <p className="text-sm leading-7 text-[#667169]">
                        <strong className="text-[#101512]">{c.footerEffective}</strong> {c.footerDate}
                        <br />
                        Premiumtex Kft. • Zsombó, Dózsa d. 55. • info@parksafe.hu
                    </p>
                </div>
            </div>
        </div>
    );
}
