import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Shield, Star, Wrench, Check, Bike, Zap, Download, ChevronDown, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import FAQSection, { faqSchema } from "@/components/FAQSection";
import HowItWorks from "@/components/HowItWorks";
import PartnerBenefits from "@/components/PartnerBenefits";

function HomePage() {
  const [titleNumber, setTitleNumber] = useState(0);
  const [expandedFeatures, setExpandedFeatures] = useState<number[]>([]);
  const titles = useMemo(
    () => ["bárhol", "bármikor", "egyszerűen", "gyorsan", "könnyedén"],
    []
  );

  const toggleFeature = (index: number) => {
    setExpandedFeatures((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  useEffect(() => {
    // Animated counter effect
    const animateCounter = (element, target, duration = 2000) => {
      let startTime = null;

      const animate = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * target);

        element.textContent = currentValue.toLocaleString() + "+";

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = target.toLocaleString() + "+";
        }
      };

      requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timer = setTimeout(() => {
      const counters = document.querySelectorAll(".stat-number[data-target]");
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute("data-target"));
        animateCounter(counter, target);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Add FAQ Schema markup for SEO
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <AuroraBackground className="!min-h-[90vh] !h-auto !justify-start !pt-[120px] !pb-[80px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="container hero-container"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <div className="hero-content">
            <h1 className="hero-title">
              Kerékpáros navigáció Szegeden{" "}
              <span className="relative inline-block overflow-hidden" style={{ width: '380px', height: '1.2em', verticalAlign: 'bottom' }}>
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="highlight whitespace-nowrap"
                    style={{ position: 'absolute', left: 0, top: 0 }}
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>
            <p className="hero-subtitle">
              Biztonságos tárolók, szervizek és kerékpáros útvonalak egy helyen
            </p>
            <p className="hero-description">
              A ParkSafe egy kifejezetten kerékpárosokra optimalizált digitális térképalkalmazás Szegeden. Találd meg a legjobb útvonalakat városi közlekedéshez, biztonságos tárolóhelyeket és közeli szervizeket közösségi visszajelzések alapján.
            </p>
            <div className="store-buttons hero-store-buttons">
              <a
                href="https://apps.apple.com/app/id6752813986"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button apple"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
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
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div className="store-text">
                  <span className="store-small">Szerezd be</span>
                  <span className="store-large">Google Play</span>
                </div>
              </a>
            </div>
            <p className="hero-subtext">
              Ingyenes • Android és iOS • Már elérhető!
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number" data-target="7500">
                  0+
                </span>
                <span className="stat-label">Vizsgált Helyszín</span>
              </div>
              <div className="stat">
                <span className="stat-number" data-target="200">
                  0+
                </span>
                <span className="stat-label">Város</span>
              </div>
              <div className="stat">
                <span className="stat-number" data-target="847">
                  0+
                </span>
                <span className="stat-label">Érdeklődő</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="phone-mockup">
              <div className="phone-screen">
                <img
                  src="/phone.jpeg"
                  alt="ParkSafe app mockup"
                  className="phone-screen-image"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AuroraBackground>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <h2>Miért válaszd a ParkSafe-ot?</h2>
            <p>Az egyetlen kifejezetten kerékpárosokra optimalizált alkalmazás Szegeden</p>
          </div>
          <div className="features-grid">
            <div className={`feature-card ${expandedFeatures.includes(0) ? 'expanded' : 'collapsed'}`}>
              <div className="feature-icon green">
                <Navigation size={28} />
              </div>
              <h3>Kerékpáros útvonaltervezés</h3>
              <p>
                Nem autós, hanem kifejezetten kerékpáros logikára optimalizált útvonalak.
                {expandedFeatures.includes(0) && (
                  <> A ParkSafe figyelembe veszi a kerékpárutak minőségét, a forgalmat és a terepviszonyokat, hogy a legbiztonságosabb és legkényelmesebb útvonalat ajánlja városi közlekedéshez.</>
                )}
              </p>
              <button className="expand-toggle" onClick={() => toggleFeature(0)}>
                {expandedFeatures.includes(0) ? "Kevesebb" : "Bővebben"}{" "}
                <ChevronDown
                  size={16}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: expandedFeatures.includes(0) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
            <div className={`feature-card ${expandedFeatures.includes(1) ? 'expanded' : 'collapsed'}`}>
              <div className="feature-icon blue">
                <Shield size={28} />
              </div>
              <h3>Biztonságos tárolóhelyek</h3>
              <p>
                Szűrhető tárolók biztonsági szint, fedettség és kamerás védelem alapján.
                {expandedFeatures.includes(1) && (
                  <> Minden tárolóról részletes információkat találsz: van-e kamerás megfigyelés, fedett-e, milyen a környék biztonsága. A közösségi értékelések segítenek a legjobb döntés meghozatalában.</>
                )}
              </p>
              <button className="expand-toggle" onClick={() => toggleFeature(1)}>
                {expandedFeatures.includes(1) ? "Kevesebb" : "Bővebben"}{" "}
                <ChevronDown
                  size={16}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: expandedFeatures.includes(1) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
            <div className={`feature-card ${expandedFeatures.includes(2) ? 'expanded' : 'collapsed'}`}>
              <div className="feature-icon green">
                <Wrench size={28} />
              </div>
              <h3>Szervizek és önjavító állomások</h3>
              <p>
                Találd meg a legközelebbi kerékpárszervizeket és önjavító állomásokat egyetlen térképen.
                {expandedFeatures.includes(2) && (
                  <> Akár defekt ért útközben, akár rendszeres karbantartásra van szükséged, a ParkSafe megmutatja, hol kaphatsz gyors segítséget. Nyitvatartási idővel és elérhetőségi adatokkal.</>
                )}
              </p>
              <button className="expand-toggle" onClick={() => toggleFeature(2)}>
                {expandedFeatures.includes(2) ? "Kevesebb" : "Bővebben"}{" "}
                <ChevronDown
                  size={16}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: expandedFeatures.includes(2) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
            <div className={`feature-card ${expandedFeatures.includes(3) ? 'expanded' : 'collapsed'}`}>
              <div className="feature-icon blue">
                <Star size={28} />
              </div>
              <h3>Közösségi visszajelzések</h3>
              <p>
                A ParkSafe közösségi alapon működik: felhasználók osztják meg tapasztalataikat.
                {expandedFeatures.includes(3) && (
                  <> Értékelések, képek és valós tapasztalatok segítenek abban, hogy megbízható információk alapján dönts. A közösség biztosítja, hogy az adatok naprakészek és hitelesek legyenek.</>
                )}
              </p>
              <button className="expand-toggle" onClick={() => toggleFeature(3)}>
                {expandedFeatures.includes(3) ? "Kevesebb" : "Bővebben"}{" "}
                <ChevronDown
                  size={16}
                  style={{
                    transition: "transform 0.3s ease",
                    transform: expandedFeatures.includes(3) ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="target-audience">
        <div className="container">
          <div className="target-header">
            <h2>Kinek szól a ParkSafe?</h2>
            <p>
              Minden kerékpáros számára, aki Szegeden közlekedik – munkába, egyetemre vagy ügyintézéshez
            </p>
          </div>
          <div className="target-grid">
            <div className="target-card">
              <div className="target-icon">
                <Bike size={40} />
              </div>
              <h3>Rendszeres városi közlekedők</h3>
              <p>
                Napi ingázók, egyetemisták és városi kerékpárosok, akik biztonságos útvonalakat és tárolóhelyeket keresnek. A ParkSafe segít megtalálni a legbiztonságosabb helyeket munkába vagy egyetemre menet.
              </p>
            </div>
            <div className="target-card">
              <div className="target-icon">
                <Zap size={40} />
              </div>
              <h3>Alkalmi felhasználók és turisták</h3>
              <p>
                Új városrészekben mozgó kerékpárosok, turisták és rolleresek, akiknek fontos a gyors tájékozódás. Ismeretlen környezetben is megtalálod a biztonságos útvonalakat és tárolókat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>
              Kezdd el használni a ParkSafe-et!
            </h2>
            <p>
              Csatlakozz a szegedi kerékpáros közösséghez és találd meg a legbiztonságosabb útvonalakat.
            </p>
            <div className="cta-benefits">
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Kerékpáros szemléletű útvonaltervezés
              </div>
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Közösségi értékelések és visszajelzések
              </div>
              <div className="benefit">
                <Check size={20} className="benefit-icon" />
                Teljesen ingyenes használat
              </div>
            </div>
            <div className="store-buttons-cta">
              <a
                href="https://apps.apple.com/app/id6752813986"
                target="_blank"
                rel="noopener noreferrer"
                className="store-button apple"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="store-icon">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
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
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
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
    </div>
  );
}

export default HomePage;
