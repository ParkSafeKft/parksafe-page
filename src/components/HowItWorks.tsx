import { motion } from "framer-motion";
import { Smartphone, MapPin, Star, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    icon: Smartphone,
    title: "Nyisd meg az appot",
    description: "Töltsd le a ParkSafe mobilalkalmazást iOS vagy Android rendszerre.",
  },
  {
    number: 2,
    icon: MapPin,
    title: "Böngészd a térképet",
    description: "Találd meg a legközelebbi biztonságos tárolókat, szervizeket és kerékpáros útvonalakat.",
  },
  {
    number: 3,
    icon: Star,
    title: "Olvasd az értékeléseket",
    description: "Nézd meg a közösség által megosztott tapasztalatokat és értékeléseket.",
  },
  {
    number: 4,
    icon: Lock,
    title: "Válassz és parkolj",
    description: "Válaszd ki a megfelelő tárolót biztonsági szint és távolság alapján.",
  },
];

function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="container">
        <div className="how-it-works-header">
          <h2>Hogyan működik a ParkSafe?</h2>
          <p>Négy egyszerű lépésben a biztonságos kerékpáros közlekedéshez</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={step.number}
                className="step-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <IconComponent size={32} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
