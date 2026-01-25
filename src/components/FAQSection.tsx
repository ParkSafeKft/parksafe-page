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
    <section className="py-24 bg-white">
      <div className="container px-4 md:px-6 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Gyakran Ismételt Kérdések</h2>
          <p className="text-lg text-zinc-500">
            Minden, amit a ParkSafe használatáról tudni érdemes.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <Collapsible
              key={index}
              open={openItems.includes(index)}
              onOpenChange={() => toggleItem(index)}
              className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-6 text-left hover:bg-zinc-100/50 transition-colors">
                <h3 className="text-lg font-semibold text-zinc-900 pr-8">{item.question}</h3>
                <ChevronDown
                  size={20}
                  className={`text-zinc-400 transition-transform duration-300 ${openItems.includes(index) ? "rotate-180" : ""
                    }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-6 pb-6 text-zinc-600 leading-relaxed">
                  <p>{item.answer}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
