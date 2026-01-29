import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-white">
      {/* 404 Graphic/Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8"
      >
        <h1 className="text-9xl font-black text-slate-100 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl md:text-4xl font-bold text-slate-900">
            Hoppá! Eltévedtél?
          </span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed"
      >
        A keresett oldal nem található. Lehet, hogy töröltük, átneveztük, 
        vagy csak elírtad a címet. Ne aggódj, segítünk visszatalálni!
      </motion.p>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-[#34aa56] text-white px-8 py-3 rounded-full font-bold hover:bg-[#2b8f48] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Home className="w-5 h-5" />
          Vissza a Főoldalra
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          Vissza az Előzőre
        </button>
      </motion.div>
    </div>
  );
}
