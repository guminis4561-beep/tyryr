import React from 'react';
import { SkillDefinition, Rarity } from '../types/game';
import { Sparkles, Zap, Shield, Flame, Swords, ArrowUpRight } from 'lucide-react';
import { audioSynth } from '../game/engine/AudioSynthesizer';

interface SkillSelectionModalProps {
  choices: SkillDefinition[];
  onSelectSkill: (skill: SkillDefinition) => void;
  playerLevel: number;
}

const rarityColors: Record<Rarity, { border: string; bg: string; text: string; shadow: string }> = {
  Common: { border: 'border-slate-500', bg: 'bg-slate-900', text: 'text-slate-300', shadow: 'shadow-slate-500/20' },
  Rare: { border: 'border-blue-500', bg: 'bg-blue-950/80', text: 'text-blue-400', shadow: 'shadow-blue-500/30' },
  Epic: { border: 'border-purple-500', bg: 'bg-purple-950/80', text: 'text-purple-400', shadow: 'shadow-purple-500/40' },
  Legendary: { border: 'border-amber-400', bg: 'bg-amber-950/80', text: 'text-amber-300', shadow: 'shadow-amber-500/50' },
  Mythic: { border: 'border-rose-500', bg: 'bg-rose-950/80', text: 'text-rose-400', shadow: 'shadow-rose-500/60' }
};

export const SkillSelectionModal: React.FC<SkillSelectionModalProps> = ({
  choices,
  onSelectSkill,
  playerLevel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LEVEL UP! LEVEL {playerLevel}</span>
          </div>
          <h2 className="text-xl font-black text-slate-100">ROGUELIKE 2.0 SKILL SELECTION</h2>
          <p className="text-xs text-slate-400">Choose 1 of 3 skills (Double Randomization Active)</p>
        </div>

        {/* 3 Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {choices.map((skill, idx) => {
            const style = rarityColors[skill.rarity] || rarityColors.Common;
            return (
              <button
                key={skill.id + idx}
                onClick={() => {
                  audioSynth.playSkillSelect();
                  onSelectSkill(skill);
                }}
                className={`relative group flex flex-col justify-between p-4 rounded-xl border-2 ${style.border} ${style.bg} ${style.shadow} hover:scale-105 transition-all text-left space-y-3 cursor-pointer shadow-lg`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${style.border} ${style.text}`}>
                      {skill.rarity}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-100 leading-tight">{skill.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>
                </div>

                {skill.synergyGroup && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] font-semibold text-amber-400 flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Synergy: {skill.synergyGroup.toUpperCase()}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
