import React, { useState } from 'react';
import { DungeonMode } from '../types/game';
import { Castle, Trophy, Coins, Swords, Flame, Sparkles } from 'lucide-react';

interface DungeonsTabProps {
  onStartDungeonRun: (modeId: string) => void;
}

const MASTER_DUNGEONS: DungeonMode[] = [
  {
    id: 'boss_seal',
    title: 'BOSS SEAL BATTLE 2.0',
    description: 'Face Abyssal Bosses with multi-phase mechanics & bullet-hell rings.',
    icon: 'Flame',
    currentProgress: 3,
    maxProgress: 10,
    recommendedAtk: 1200,
    entryCostType: 'energy',
    entryCostAmount: 5
  },
  {
    id: 'tower',
    title: 'TRIAL TOWER (50 FLOORS)',
    description: 'Ascend 50 floors of increasing enemy waves & high-tier rune drops.',
    icon: 'Castle',
    currentProgress: 18,
    maxProgress: 50,
    recommendedAtk: 950,
    entryCostType: 'energy',
    entryCostAmount: 5
  },
  {
    id: 'gold_cave',
    title: 'GOLD CAVE SURVIVAL',
    description: 'Survive 60 seconds against swarms with 2.5x Gold drop multiplier!',
    icon: 'Coins',
    currentProgress: 1,
    maxProgress: 3,
    recommendedAtk: 600,
    entryCostType: 'free',
    entryCostAmount: 0
  },
  {
    id: 'endless',
    title: 'ENDLESS MODE (50 WAVES)',
    description: 'Test your endurance against 50 endless procedural enemy waves.',
    icon: 'Swords',
    currentProgress: 24,
    maxProgress: 50,
    recommendedAtk: 1500,
    entryCostType: 'energy',
    entryCostAmount: 10
  }
];

export const DungeonsTab: React.FC<DungeonsTabProps> = ({ onStartDungeonRun }) => {
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
        <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 shadow-lg">
          <Castle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-wide">DUNGEONS & CHALLENGES 2.0</h2>
          <p className="text-xs text-slate-400">Boss Seal Battle, Trial Tower (50 Floors), Gold Cave & Endless Mode</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MASTER_DUNGEONS.map(dungeon => (
          <div
            key={dungeon.id}
            className="bg-slate-800/40 border border-slate-700/80 hover:border-indigo-500/60 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-extrabold text-base text-indigo-300">{dungeon.title}</h3>
                <span className="text-[10px] font-black uppercase bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30 shadow-inner">
                  REC ATK: {dungeon.recommendedAtk}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{dungeon.description}</p>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 font-extrabold tracking-wider">
                  <span>PROGRESS</span>
                  <span className="text-indigo-400 font-mono">{dungeon.currentProgress} / {dungeon.maxProgress}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${(dungeon.currentProgress / dungeon.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartDungeonRun(dungeon.id)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-black text-xs uppercase tracking-wider text-white rounded-full transition-all shadow-lg shadow-indigo-500/20 active:scale-98 cursor-pointer mt-2"
            >
              ENTER DUNGEON (⚡ {dungeon.entryCostAmount})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
