import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation, Shield, Wrench, Star, Check, Bike, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import FAQSection from "@/components/FAQSection";
import PartnerBenefits from "@/components/PartnerBenefits";
import HowItWorks from "@/components/HowItWorks";
import { useLanguage } from "./contexts/LanguageContext";

function HomePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("map");

  useEffect(() => {
    // Dynamic FAQ Schema based on current language
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: t('faq.q1'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a1') }
        },
        {
          "@type": "Question",
          name: t('faq.q2'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a2') }
        },
        {
          "@type": "Question",
          name: t('faq.q3'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a3') }
        },
        {
          "@type": "Question",
          name: t('faq.q4'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a4') }
        },
        {
          "@type": "Question",
          name: t('faq.q5'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a5') }
        },
        {
          "@type": "Question",
          name: t('faq.q6'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a6') }
        },
        {
          "@type": "Question",
          name: t('faq.q7'),
          acceptedAnswer: { "@type": "Answer", text: t('faq.a7') }
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [t]); // Re-run when language changes

  return (
    <div className="home-page font-sans text-slate-900 bg-white selection:bg-[#34aa56] selection:text-white">

      {/* Hero Section - Corporate & Trusted ===================================== */}
      <section className="relative w-full pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">

        {/* Minimal Noise Texture for "Paper" feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-multiply" />

        {/* Subtle Gradient Spot - One only, very faint */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-slate-50 to-white -z-10" />

        <div className="container px-4 md:px-6 relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Left Content - Static Authority */}
            <div className="flex flex-col gap-8 text-center lg:text-left">

              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]"
              >
                {t('home.hero.title')} <br className="hidden lg:block" />
                <span className="text-[#34aa56]">{t('home.hero.subtitle')}</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
              >
                {t('home.hero.description')}
              </motion.p>

              {/* Action Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
              >
                <a href="https://apps.apple.com/app/id6752813986" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10">
                  <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 mb-1"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
                  {t('home.hero.downloadIOS')}
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.parksafe.app" className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm">
                  <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5 mb-1"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
                  {t('home.hero.downloadAndroid')}
                </a>
              </motion.div>

            </div>

            {/* Right Content - High Fidelity Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center justify-center lg:justify-end py-10 lg:py-0"
            >
              {/* Decorative Blob/Glow to anchor the phone */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-[#34aa56]/20 via-emerald-100/30 to-transparent rounded-full blur-3xl -z-10" />
              
              <div className="relative w-[300px] md:w-[400px] lg:w-[480px]">
                <picture className="w-full h-auto drop-shadow-2xl">
                  {/* Responsive WebP Sources */}
                  <source 
                    type="image/webp" 
                    srcSet="/ios_mapview_300.webp 300w, /ios_mapview_480.webp 480w, /ios_mapview_600.webp 600w, /ios_mapview_800.webp 800w"
                    sizes="(min-width: 1024px) 480px, (min-width: 768px) 400px, 300px"
                  />
                  {/* Responsive PNG Fallback */}
                  <img
                    src="/ios_mapview.png"
                    srcSet="/ios_mapview_300.png 300w, /ios_mapview_480.png 480w, /ios_mapview_600.png 600w, /ios_mapview_800.png 800w"
                    sizes="(min-width: 1024px) 480px, (min-width: 768px) 400px, 300px"
                    alt="ParkSafe Mobile Interface - Kerékpáros Térkép"
                    width="480"
                    height="900"
                    className="w-full h-auto drop-shadow-2xl"
                    fetchPriority="high"
                    decoding="async"
                  />
                </picture>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Bento Feature Grid - Network Scale & Features */}
      <section className="py-32 bg-zinc-50 border-t border-zinc-200">
        <div className="container px-4 md:px-6 mx-auto">

          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6">
              {t('home.grid.osTitle')}
            </h2>
            <p className="text-lg text-zinc-500">
              {t('home.grid.osDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* Master Card - Network Scale */}
            <div className="md:col-span-2 row-span-2 bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#34aa56]/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight">
                  {t('home.grid.mainStat')}
                  <span className="block text-2xl md:text-3xl font-bold text-zinc-500 mt-2">{t('home.grid.mainStatLabel')}</span>
                </h3>
                <p className="text-zinc-500 max-w-md text-lg leading-relaxed mt-6">
                  {t('home.grid.mainDesc')}
                </p>
              </div>

              {/* Abstract UI representation */}
              <div className="absolute bottom-0 right-0 w-[60%] h-[60%] bg-zinc-50 rounded-tl-[2rem] border-l border-t border-zinc-100 shadow-2xl translate-y-8 translate-x-8 transition-transform group-hover:translate-x-6 group-hover:translate-y-6 overflow-hidden">
                <picture>
                  <source type="image/webp" srcSet="/ios_mapview_300.webp" />
                  <img 
                    src="/ios_mapview_300.png" 
                    alt="" 
                    className="w-full h-full object-cover object-top opacity-80 grayscale-[20%]"
                    loading="lazy" 
                  />
                </picture>
              </div>
            </div>

            {/* Feature Card 2 - Infrastructure */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col justify-between group hover:border-[#34aa56]/30 transition-colors">
              <div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                  <Navigation className="text-[#34aa56] w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">{t('home.grid.infraTitle')}</h3>
                <p className="text-zinc-500 text-sm">
                  {t('home.grid.infraDesc')}
                </p>
              </div>
            </div>

            {/* Feature Card 3 - Service Network */}
            <div className="bg-[#0f1d16] rounded-[2rem] p-8 shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <Wrench className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-2">{t('home.grid.serviceTitle')}</h3>
              <p className="text-emerald-100/60 text-sm">
                {t('home.grid.serviceDesc')}
              </p>
            </div>

            {/* Feature Card 4 - Routing */}
            <div className="md:col-span-3 lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-xl shadow-zinc-200/50 border border-zinc-100 flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                <Zap className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{t('home.grid.trafficTitle')}</h3>
                <p className="text-zinc-500 text-sm">{t('home.grid.trafficDesc')}</p>
              </div>
            </div>

            {/* Feature Card 5 - Community (New Symmetrical Fill) */}
            <div className="md:col-span-3 lg:col-span-2 bg-gradient-to-br from-[#0f1d16] to-[#152920] rounded-[2rem] p-8 shadow-xl shadow-emerald-900/10 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#34aa56]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="relative z-10 flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Users className="text-emerald-400 w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('home.grid.communityTitle')}</h3>
                </div>
                <p className="text-emerald-100/60 text-sm leading-relaxed max-w-md">
                  {t('home.grid.communityDesc')}
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-center md:items-end shrink-0">
                <span className="text-5xl font-extrabold tracking-tight text-white mb-1">{t('home.grid.communityStat')}</span>
                <span className="text-emerald-500 font-bold text-sm tracking-wider uppercase">Accuracy Score</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <HowItWorks />
      
      <PartnerBenefits />

      <FAQSection />

      {/* Corporate Dark Mode CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-900">

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        <div className="container px-4 mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            {t('home.cta.title')} <span className="text-[#34aa56]">{t('home.cta.titleHighlight')}</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('home.cta.desc')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="https://apps.apple.com/app/id6752813986" className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
              <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 mb-1"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
              {t('home.hero.downloadIOS')}
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.parksafe.app" className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all hover:scale-105 active:scale-95">
              <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5 mb-1"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" /></svg>
              {t('home.hero.downloadAndroid')}
            </a>
          </div>

          <p className="mt-8 text-slate-500 text-sm font-medium">
            {t('home.cta.security')}
          </p>
        </div>
      </section>

    </div>
  );
}

export default HomePage;

