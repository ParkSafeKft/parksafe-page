import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Mock Data
const USERS = [
  { id: 1, name: 'Mihaela Mihaylova', email: 'mihaela.mihaylova1@icloud.com', role: 'Felhasználó', date: '2026. jan. 21.', phone: 'Nincs megadva', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: 2, name: 'Amira Paxián', email: 'paxiamira@gmail.com', role: 'Felhasználó', date: '2026. jan. 16.', phone: 'Nincs megadva', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop' },
  { id: 3, name: 'Letti Keresztes-Nagy', email: '5gcgpccj8g@privaterelay.appleid.com', role: 'Felhasználó', date: '2026. jan. 16.', phone: 'Nincs megadva', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop' },
  { id: 4, name: 'Sólyom Szélyes', email: '1madar1039@gmail.com', role: 'Felhasználó', date: '2026. jan. 16.', phone: 'Nincs megadva', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
  { id: 5, name: 'Janeta Kaleva', email: 'sq8nkty7zg@privaterelay.appleid.com', role: 'Felhasználó', date: '2025. dec. 27.', phone: 'Nincs megadva', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
];

const PARKING = [
  { id: 1, name: 'szex', city: 'szex', desc: 'sex', covered: true, status: 'Aktív', date: '2025. okt. 7.', coords: '30.4554, 19.9662' },
  { id: 2, name: 'B+R', city: 'Szeged', desc: 'Nincs leírás', covered: true, status: 'Aktív', date: '2025. júl. 17.', coords: '46.2401, 20.1188' },
  { id: 3, name: 'biciklitároló', city: 'Tiszadob', desc: 'Nincs leírás', covered: false, status: 'Aktív', date: '2025. júl. 17.', coords: '48.0171, 21.1736' },
  { id: 4, name: 'biciklitároló', city: 'Zalaszentgrót', desc: 'Nincs leírás', covered: false, status: 'Aktív', date: '2025. júl. 17.', coords: '46.9437, 17.0789' },
  { id: 5, name: 'biciklitároló', city: 'Siófok', desc: 'Nincs leírás', covered: true, status: 'Aktív', date: '2025. júl. 17.', coords: '46.8998, 18.0173' },
];

export const UserTable = () => (
  <div className="flex flex-col gap-4">
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111111]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Avatar</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Felhasználónév</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Szerepkör</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Létrehozva</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {USERS.map((user) => (
            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="p-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-green-500/50 transition-colors">
                  <ImageWithFallback src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm font-semibold text-white">{user.name}</span>
              </td>
              <td className="p-4">
                <span className="text-sm text-zinc-400">{user.email}</span>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm text-zinc-500">{user.date}</span>
              </td>
              <td className="p-4 text-right">
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between px-2">
      <p className="text-xs text-zinc-500">1 / 3 oldal</p>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg opacity-50 cursor-not-allowed">Előző</button>
        <button className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">Következő</button>
      </div>
    </div>
  </div>
);

export const ParkingTable = ({ onRowClick }: { onRowClick: (item: any) => void }) => (
  <div className="flex flex-col gap-4">
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#111111]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Név</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Város</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Fedett</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Státusz</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Létrehozva</th>
            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Műveletek</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {PARKING.map((item) => (
            <tr 
              key={item.id} 
              className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
              onClick={() => onRowClick(item)}
            >
              <td className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.coords}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <span className="text-sm text-zinc-400">{item.city}</span>
              </td>
              <td className="p-4 text-center">
                {item.covered ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">IGEN</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-500 border border-zinc-700">NEM</span>
                )}
              </td>
              <td className="p-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  {item.status}
                </span>
              </td>
              <td className="p-4">
                <span className="text-sm text-zinc-500">{item.date}</span>
              </td>
              <td className="p-4 text-right">
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between px-2">
      <p className="text-xs text-zinc-500">1 / 727 oldal</p>
      <div className="flex gap-2">
        <button className="px-4 py-2 text-xs font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg opacity-50 cursor-not-allowed">Előző</button>
        <button className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">Következő</button>
      </div>
    </div>
  </div>
);

import { ParkingEditModal } from './ParkingEditModal';

export const Dashboard = ({ activeTab }: { activeTab: string }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getTitle = () => {
    switch(activeTab) {
      case 'users': return 'Felhasználók';
      case 'parking': return 'Bicikli Parkolók';
      case 'services': return 'Szervizek & Boltok';
      case 'stations': return 'Javító Állomások';
      default: return 'Kezelőfelület';
    }
  };

  const getIcon = () => {
    switch(activeTab) {
      case 'users': return <Users className="w-6 h-6 text-green-500" />;
      case 'parking': return <MapPin className="w-6 h-6 text-green-500" />;
      default: return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getSubtitle = () => {
    switch(activeTab) {
      case 'users': return 'Összes regisztrált felhasználó kezelése';
      case 'parking': return 'Bicikli parkolók létrehozása és kezelése';
      default: return 'Válasszon egy menüpontot az adatok kezeléséhez';
    }
  };

  return (
    <main className="flex-1 bg-[#09090b] min-h-screen overflow-y-auto p-8 relative">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{getTitle()}</h2>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20 uppercase tracking-wider">
                {activeTab === 'users' ? '24 elem' : activeTab === 'parking' ? '7264 elem' : 'Aktív'}
              </span>
            </div>
            <p className="text-zinc-500 text-sm mt-0.5">{getSubtitle()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Keresés..." 
              className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500/50 w-64 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95">
            <Plus className="w-4 h-4" />
            Új hozzáadása
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'users' ? (
          <UserTable />
        ) : activeTab === 'parking' ? (
          <ParkingTable onRowClick={setSelectedItem} />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-lg font-semibold text-white">Nincs tartalom</h3>
            <p className="text-zinc-500 max-w-xs text-center mt-2">Ez a modul fejlesztés alatt áll vagy nincs megjeleníthető adat.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && !isEditing && (
        <DetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onEdit={() => setIsEditing(true)}
        />
      )}

      {/* Edit Modal */}
      {isEditing && (
        <ParkingEditModal 
          item={selectedItem} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </main>
  );
};

// Subcomponents helper
const Users = ({ className }: { className?: string }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const DetailModal = ({ item, onClose, onEdit }: { item: any, onClose: () => void, onEdit: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
    <div className="bg-[#111111] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">{item.name}</h3>
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">{item.status}</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 transition-colors">
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Images */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Képek (6)
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-square rounded-xl bg-zinc-900 border border-white/5 overflow-hidden group relative">
                <ImageWithFallback src={`https://images.unsplash.com/photo-${1550000000000 + i}?auto=format&fit=crop&q=80&w=200&h=200`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                  {i}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="grid grid-cols-2 gap-y-6">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Város</p>
            <p className="text-sm text-white font-medium">{item.city}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Fedett</p>
            <p className="text-sm text-white font-medium">{item.covered ? 'Igen' : 'Nem'}</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">24 órás</p>
            <p className="text-sm text-white font-medium">Nem</p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Kamera</p>
            <p className="text-sm text-white font-medium">Nem</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Koordináták</p>
          <p className="text-sm text-zinc-300 font-mono bg-black/30 p-2 rounded-lg border border-white/5">{item.coords}</p>
        </div>
      </div>

      <div className="p-6 bg-black/20 border-t border-white/5 flex gap-3">
        <button onClick={onClose} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl transition-all border border-zinc-800">Bezárás</button>
        <button onClick={onEdit} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20">Szerkesztés</button>
      </div>
    </div>
  </div>
);
