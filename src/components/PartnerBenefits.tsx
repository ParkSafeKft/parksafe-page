import { Ticket, Wrench, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Ticket,
    title: "Exkluzív kedvezmények partnereknél",
    description: "Hamarosan induló programunkban különleges ajánlatokat kapsz a ParkSafe partnereitől.",
  },
  {
    icon: Wrench,
    title: "Szerviz partnerek kedvezményes árakon",
    description: "Bővülő hálózatunkban szervizek és kerékpárboltok várnak speciális feltételekkel.",
  },
  {
    icon: ShoppingBag,
    title: "Boltok és szolgáltatások",
    description: "Időszakos akciók és ajánlatok a városi kerékpározás szerelmeseinek.",
  },
];

function PartnerBenefits() {
  return (
    <section className="partner-benefits">
      <div className="container">
        <div className="partner-benefits-header">
          <h2>Partnerek és kedvezmények</h2>
          <p>Különleges ajánlatok és kedvezmények ParkSafe felhasználóknak</p>
        </div>

        <div className="benefits-list">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="benefit-item">
                <div className="benefit-icon-wrapper">
                  <IconComponent size={32} />
                </div>
                <div className="benefit-content">
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="partner-coming-soon">
          <p>Hamarosan bővülő partnerhálózat!</p>
        </div>
      </div>
    </section>
  );
}

export default PartnerBenefits;
