import React from 'react';
import { XCircle, Save, MapPin, Info, Camera, Clock, ShieldCheck } from 'lucide-react';

interface EditModalProps {
  item: any;
  onClose: () => void;
}

export const ParkingEditModal: React.FC<EditModalProps> = ({ item, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-[#111111] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Parkoló Szerkesztése
              <span className="text-zinc-600 text-xs font-normal">#{item.id}</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Módosítsd az adatokat és mentsd el a változtatásokat. A *-gal jelölt mezők kötelezőek.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Név *</label>
              <input 
                defaultValue={item.name}
                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
                placeholder="Parkoló neve"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Város *</label>
              <input 
                defaultValue={item.city}
                className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none"
                placeholder="Város neve"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">Leírás</label>
            <textarea 
              defaultValue={item.desc}
              rows={3}
              className="w-full bg-zinc-900/50 border border-white/5 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 rounded-xl px-4 py-3 text-sm text-white transition-all outline-none resize-none"
              placeholder="Írjon egy rövid leírást..."
            />
          </div>

          {/* Coordinates Group */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Koordináták</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Szélesség (Latitude) *</label>
                <input 
                  defaultValue={item.coords.split(',')[0]}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Hosszúság (Longitude) *</label>
                <input 
                  defaultValue={item.coords.split(',')[1]}
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-zinc-300 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-[10px] text-zinc-500">Tipp: A koordinátákat <span className="text-green-500">Google Maps</span>-ről vagy <span className="text-green-500">OpenStreetMap</span>-ről tudod kimásolni.</p>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/5 space-y-6">
             <div className="flex items-center gap-2 text-zinc-400 mb-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Parkoló információk</span>
            </div>
            
            <ToggleItem label="Fedett parkoló" icon={Info} active={item.covered} />
            <ToggleItem label="24 órás nyitvatartás" icon={Clock} active={false} />
            <ToggleItem label="Kamera biztonság" icon={Camera} active={false} />

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest px-1">Kapacitás szint</label>
              <select className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer focus:border-green-500/50 outline-none">
                <option>Válassz...</option>
                <option>Kevés (1-10)</option>
                <option>Közepes (10-50)</option>
                <option>Sok (50+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-black/30 border-t border-white/5 flex gap-4 shrink-0">
          <button onClick={onClose} className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-all border border-zinc-800">
            Mégse
          </button>
          <button className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 group">
            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, icon: Icon, active }: { label: string, icon: any, active: boolean }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-white/5 text-zinc-500 group-hover:text-green-500 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-zinc-300 font-medium">{label}</span>
    </div>
    <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${active ? 'bg-green-600' : 'bg-zinc-800'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  </div>
);
