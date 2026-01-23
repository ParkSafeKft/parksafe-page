import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Mi az a ParkSafe?",
    answer: "A ParkSafe egy kifejezetten kerékpárosokra optimalizált digitális térképalkalmazás, amely egyesíti az útvonaltervezést, tárolóhelyeket és szervizeket egyetlen platformon. Jelenleg Szegeden érhető el.",
  },
  {
    question: "Hogyan működik az útvonaltervezés?",
    answer: "A ParkSafe nem autós, hanem kerékpáros logikára építő útvonalakat ajánl. Figyelembe veszi a kerékpárutak minőségét, biztonságát és a városi közlekedés sajátosságait – nem túrázásra, hanem munkahelyre, egyetemre vagy ügyintézésre való eljutáshoz.",
  },
  {
    question: "Milyen információkat tartalmaz egy tároló adatlapja?",
    answer: "Minden tárolónál megtalálod: fedett vagy nyitott tárolás, biztonsági szint (van-e kamerás védelem), közösségi értékelések, felhasználói képek és tapasztalatok. Így megalapozott döntést hozhatsz.",
  },
  {
    question: "Ingyenes a ParkSafe használata?",
    answer: "Igen, a ParkSafe alapfunkciói teljesen ingyenesen használhatók. Jelenleg nincs díjköteles szolgáltatás, a jövőben esetlegesen partneri kedvezmények jelenhetnek meg.",
  },
  {
    question: "Mennyire megbízhatóak az adatok?",
    answer: "A ParkSafe közösségi alapon működik: felhasználók osztják meg tapasztalataikat, értékelik a helyeket és töltenek fel képeket. Ez biztosítja, hogy az információk naprakészek és valósak legyenek.",
  },
  {
    question: "Csak Szegeden működik?",
    answer: "Jelenleg a ParkSafe Szegeden érhető el teljes funkcionalitással. A platform tervezetten más városokra is bővül, ha a szegedi validáció sikeres és elegendő felhasználói bázis alakul ki.",
  },
  {
    question: "Hogyan vehetem fel a kapcsolatot a csapattal?",
    answer: 'A weboldalon található "Írj nekünk" menüponton keresztül tudsz üzenetet küldeni. Minden megkeresésre igyekszünk gyorsan reagálni.',
  },
];

// Generate FAQ Schema for SEO
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <h2>GYIK – Gyakran Ismételt Kérdések</h2>
          <p>
            Válaszok a leggyakrabban felmerülő kérdésekre a ParkSafe használatáról
          </p>
        </div>

        <div className="faq-list">
          {faqData.map((item, index) => (
            <Collapsible
              key={index}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
            >
              <CollapsibleTrigger>
                <h3>{item.question}</h3>
                <ChevronDown
                  size={24}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: openItems.includes(index)
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p>{item.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="faq-cta">
          <h3>Készen állsz a biztonságos tárolásra?</h3>
          <div className="store-buttons">
            <a
              href="https://apps.apple.com/app/id6752813986"
              target="_blank"
              rel="noopener noreferrer"
              className="store-button apple"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div className="store-text">
                <span className="store-small">Töltsd le</span>
                <span className="store-large">App Store</span>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.parksafe.app"
              target="_blank"
              rel="noopener noreferrer"
              className="store-button google"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="store-text">
                <span className="store-small">Szerezd be</span>
                <span className="store-large">Google Play</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
