import React, { useState } from 'react';
import { Users, Flame, Swords, Shield, Trophy, Zap } from 'lucide-react';
import { audioSynth } from '../game/engine/AudioSynthesizer';

interface GuildTabProps {
  guildCoins: number;
  onGuildRaidAttack: (damage: number) => void;
}

export const GuildTab: React.FC<GuildTabProps> = ({ guildCoins, onGuildRaidAttack }) => {
  const [bossHp, setBossHp] = useState<number>(32450000);
  const maxBossHp = 50000000;
  const [lastRaidDmg, setLastRaidDmg] = useState<number | null>(null);
  const [pvpResult, setPvpResult] = useState<string | null>(null);

  const handleAttackBoss = async () => {
    audioSynth.playBossRoar();
    const damage = Math.floor(250000 + Math.random() * 300000);

    try {
      const res = await fetch('/api/guild/raid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damageDealt: damage })
      });
      const data = await res.json();
      if (data.success) {
        setBossHp(data.guildBoss.currentHp);
        setLastRaidDmg(data.damageDealt);
        onGuildRaidAttack(data.guildCoinsEarned);
      }
    } catch (err) {
      // Fallback local update
      setBossHp(Math.max(0, bossHp - damage));
      setLastRaidDmg(damage);
    }
  };

  const handleSimulatePvP = () => {
    audioSynth.playShoot('scythe');
    const isWin = Math.random() > 0.35;
    if (isWin) {
      setPvpResult('🏆 PvP Victory! +25 ELO, +50 Arena Tokens (Best-of-3 Match Cleared)');
    } else {
      setPvpResult('💔 PvP Defeat! -10 ELO');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
        <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shadow-lg">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-wide">GUILD & PVP ARENA 2.0</h2>
          <p className="text-xs text-slate-400">Shared Guild Boss Raid + Best-of-3 ELO Arena & 3v3 Rumble Ladder</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guild Boss Shared HP Raid */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>GUILD BOSS RAID (SHARED HP POOL)</span>
            </h3>
            <span className="text-[10px] font-bold bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              Phoenix Order Guild
            </span>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
            <div className="flex justify-between text-xs font-bold">
              <span>Abyssal Flame Dragon (Lvl 50)</span>
              <span className="text-rose-400 font-mono">{((bossHp / maxBossHp) * 100).toFixed(1)}% HP Left</span>
            </div>

            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 font-mono">
              HP: {bossHp.toLocaleString()} / {maxBossHp.toLocaleString()}
            </p>
          </div>

          {lastRaidDmg && (
            <div className="text-xs font-bold p-3 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 shadow-lg">
              💥 Dealt {lastRaidDmg.toLocaleString()} damage to Guild Boss! Earned +{Math.floor(lastRaidDmg/1000)} Guild Coins.
            </div>
          )}

          <button
            onClick={handleAttackBoss}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:from-red-500 hover:to-amber-400 font-black text-slate-950 rounded-full text-xs uppercase tracking-wider transition-all shadow-xl shadow-red-500/20 active:scale-98 cursor-pointer"
          >
            ATTACK GUILD BOSS RAID
          </button>
        </div>

        {/* PvP Best-of-3 Arena */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
              <Swords className="w-4 h-4 text-cyan-400" />
              <span>BEST-OF-3 PVP ARENA & 3V3 RUMBLE</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time netcode simulation with ELO matchmaking, rollback compensation & seasonal rank rewards.
            </p>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Current Rating:</span>
                <span className="text-cyan-400 font-mono">1,450 ELO (Gold Tier)</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Season Rank:</span>
                <span className="text-amber-400 font-mono">#42 Server-wide</span>
              </div>
            </div>

            {pvpResult && (
              <div className="text-xs font-bold p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/50 text-cyan-300 shadow-lg">
                {pvpResult}
              </div>
            )}
          </div>

          <button
            onClick={handleSimulatePvP}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 font-black text-white rounded-full text-xs uppercase tracking-wider transition-all shadow-xl shadow-cyan-500/20 active:scale-98 cursor-pointer mt-2"
          >
            FIND PVP ARENA MATCH (BEST-OF-3)
          </button>
        </div>
      </div>
    </div>
  );
};
