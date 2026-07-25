import React from 'react';
import { Swords, Shield, TreePine, Castle, Users, ShoppingBag, Terminal } from 'lucide-react';

export type TabType = 'battle' | 'gear' | 'talents' | 'dungeons' | 'guild' | 'shop' | 'architecture';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  playerLevel: number;
  gold: number;
  diamonds: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  playerLevel,
  gold,
  diamonds
}) => {
  const tabs = [
    { id: 'battle' as TabType, label: 'Battle', icon: Swords },
    { id: 'gear' as TabType, label: 'Forge', icon: Shield },
    { id: 'talents' as TabType, label: 'Talents', icon: TreePine },
    { id: 'dungeons' as TabType, label: 'Dungeons', icon: Castle },
    { id: 'guild' as TabType, label: 'Guild & PvP', icon: Users },
    { id: 'shop' as TabType, label: 'Gacha Shop', icon: ShoppingBag },
    { id: 'architecture' as TabType, label: 'Infra & Specs', icon: Terminal }
  ];

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/60 text-white sticky top-0 z-40 shadow-2xl">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        {/* Left: Player Badge & Level Progress */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-lg">
            <span className="text-yellow-400 font-extrabold text-xs">⚡ 20/20</span>
            <div className="w-px h-3.5 bg-slate-600"></div>
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">MAX</span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Player</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black italic text-blue-400 leading-none">LV.{playerLevel}</span>
              <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 hidden sm:block">
                <div className="bg-blue-500 h-full w-2/3 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Currencies */}
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <div className="bg-slate-800/80 border border-slate-700 pr-3.5 pl-1 py-1 rounded-full flex items-center gap-2 shadow-lg">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center font-black text-slate-950 text-xs shadow-inner">
              $
            </div>
            <span className="font-mono font-bold text-slate-100 text-xs sm:text-sm">{gold.toLocaleString()}</span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 pr-3.5 pl-1 py-1 rounded-full flex items-center gap-2 shadow-lg">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-inner">
              💎
            </div>
            <span className="font-mono font-bold text-slate-100 text-xs sm:text-sm">{diamonds.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-t border-slate-800/80 max-w-7xl mx-auto px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-400 text-blue-300 bg-blue-600/20 shadow-[0_0_15px_rgba(59,130,246,0.25)] rounded-t-xl'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
