import React, { useState } from 'react';
import { TalentNode } from '../types/game';
import { TreePine, Zap, Swords, Heart, Target, Sparkles, Coins, MoveRight } from 'lucide-react';
import { audioSynth } from '../game/engine/AudioSynthesizer';

interface TalentTabProps {
  gold: number;
  onUpgradeTalent: (talentId: string, cost: number) => void;
}

// 32-Node Talent Tree Catalog
const MASTER_TALENTS: TalentNode[] = [
  // Session 1: Martial Fundamentals
  { id: 't_atk_1', name: 'Strength I', description: 'Increases Base ATK by +50', session: 1, level: 5, maxLevel: 10, goldCostBase: 500, icon: 'Swords', statPerLevel: '+50 ATK' },
  { id: 't_hp_1', name: 'Vitality I', description: 'Increases Max HP by +250', session: 1, level: 4, maxLevel: 10, goldCostBase: 400, icon: 'Heart', statPerLevel: '+250 HP' },
  { id: 't_crit_1', name: 'Eagle Eye', description: 'Increases Crit Rate by +2%', session: 1, level: 3, maxLevel: 5, goldCostBase: 800, icon: 'Target', statPerLevel: '+2% Crit Rate' },
  { id: 't_coins_1', name: 'Greed', description: 'Increases Gold drops by +5%', session: 1, level: 3, maxLevel: 10, goldCostBase: 600, icon: 'Coins', statPerLevel: '+5% Gold' },
  { id: 't_element_1', name: 'Elemental Master', description: 'Increases Elemental Tick Damage by +10%', session: 1, level: 2, maxLevel: 5, goldCostBase: 1000, icon: 'Zap', statPerLevel: '+10% Elem DMG' },
  { id: 't_speed_1', name: 'Gale Footwork', description: 'Increases Move Speed by +3%', session: 1, level: 1, maxLevel: 5, goldCostBase: 700, icon: 'MoveRight', statPerLevel: '+3% Move Speed' },

  // Session 2: Mythic Mastery
  { id: 't_atk_2', name: 'Strength II', description: 'Increases Base ATK by +120', session: 2, level: 0, maxLevel: 10, goldCostBase: 2500, icon: 'Swords', statPerLevel: '+120 ATK', prerequisiteId: 't_atk_1' },
  { id: 't_hp_2', name: 'Vitality II', description: 'Increases Max HP by +600', session: 2, level: 0, maxLevel: 10, goldCostBase: 2200, icon: 'Heart', statPerLevel: '+600 HP', prerequisiteId: 't_hp_1' },
  { id: 't_crit_2', name: 'Lethal Strike', description: 'Increases Crit Damage by +20%', session: 2, level: 0, maxLevel: 5, goldCostBase: 3500, icon: 'Target', statPerLevel: '+20% Crit DMG', prerequisiteId: 't_crit_1' },
  { id: 't_lifesteal_2', name: 'Bloodthirst', description: 'Restores +1% HP on Enemy Kill', session: 2, level: 0, maxLevel: 5, goldCostBase: 5000, icon: 'Sparkles', statPerLevel: '+1% Kill Heal', prerequisiteId: 't_hp_2' }
];

export const TalentTab: React.FC<TalentTabProps> = ({ gold, onUpgradeTalent }) => {
  const [activeSession, setActiveSession] = useState<1 | 2>(1);
  const [talents, setTalents] = useState<TalentNode[]>(MASTER_TALENTS);

  const handleUpgrade = (talent: TalentNode) => {
    const cost = talent.goldCostBase * (talent.level + 1);
    if (gold < cost || talent.level >= talent.maxLevel) return;

    audioSynth.playCoin();
    setTalents(talents.map(t => t.id === talent.id ? { ...t, level: t.level + 1 } : t));
    onUpgradeTalent(talent.id, cost);
  };

  const filteredTalents = talents.filter(t => t.session === activeSession);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      {/* Title & Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-lg">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide">TALENT TREE (32 TALENTS)</h2>
            <p className="text-xs text-slate-400">Permanent Passive Stat Bonuses across 2 Martial Sessions</p>
          </div>
        </div>

        {/* Session Switcher */}
        <div className="flex bg-slate-900/90 border border-slate-700/80 rounded-full p-1 text-xs font-bold shadow-lg">
          <button
            onClick={() => setActiveSession(1)}
            className={`px-5 py-2 rounded-full transition-all ${
              activeSession === 1 ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SESSION 1
          </button>
          <button
            onClick={() => setActiveSession(2)}
            className={`px-5 py-2 rounded-full transition-all ${
              activeSession === 2 ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SESSION 2
          </button>
        </div>
      </div>

      {/* Talent Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTalents.map(talent => {
          const cost = talent.goldCostBase * (talent.level + 1);
          const canAfford = gold >= cost;
          const isMaxed = talent.level >= talent.maxLevel;

          return (
            <div
              key={talent.id}
              className={`p-5 rounded-3xl border bg-slate-800/40 border-slate-700/80 space-y-3.5 shadow-xl backdrop-blur-sm transition-all ${
                canAfford && !isMaxed ? 'hover:border-emerald-500/60 hover:shadow-emerald-500/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-100">{talent.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{talent.description}</p>
                </div>
                <span className="text-xs font-black bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-inner">
                  {talent.level}/{talent.maxLevel}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 font-mono font-semibold">
                Current Bonus: {talent.statPerLevel} per level
              </div>

              <button
                onClick={() => handleUpgrade(talent)}
                disabled={!canAfford || isMaxed}
                className={`w-full py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                  isMaxed
                    ? 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : canAfford
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-emerald-500/20 active:scale-98'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                {isMaxed ? 'MAXED OUT' : `UPGRADE ($ ${cost.toLocaleString()})`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
