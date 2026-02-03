import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="flex w-full min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-green-500/30 selection:text-green-500">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <Dashboard activeTab={activeTab} />
    </div>
  );
};

export default App;
