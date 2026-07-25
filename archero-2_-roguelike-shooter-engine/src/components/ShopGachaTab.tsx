import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Tv, Gift, ShieldCheck, Zap } from 'lucide-react';
import { audioSynth } from '../game/engine/AudioSynthesizer';

interface ShopGachaTabProps {
  diamonds: number;
  pityCounter: { epic: number; legendary: number };
  onGachaRollSuccess: (item: any, newPity: any, remainingDiamonds: number) => void;
  onReceiptVerified: (reward: { diamonds: number; gold: number }) => void;
}

export const ShopGachaTab: React.FC<ShopGachaTabProps> = ({
  diamonds,
  pityCounter,
  onGachaRollSuccess,
  onReceiptVerified
}) => {
  const [gachaResult, setGachaResult] = useState<any | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [iapMessage, setIapMessage] = useState<string | null>(null);

  const handleRollGacha = async () => {
    if (diamonds < 300) return;
    setIsRolling(true);
    setGachaResult(null);

    try {
      const res = await fetch('/api/gacha/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        audioSynth.playLevelUp();
        setGachaResult(data.rolledItem);
        onGachaRollSuccess(data.rolledItem, data.pityState, data.diamondsRemaining);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRolling(false);
    }
  };

  const handleSimulateIap = async (productId: string) => {
    try {
      const res = await fetch('/api/monetization/validate-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptData: "mock_apple_receipt_xyz_123", productId })
      });
      const data = await res.json();
      if (data.success) {
        audioSynth.playCoin();
        setIapMessage(`✅ Receipt Verified Server-Side! Granted +${data.rewardGranted.diamonds} 💎 & +${data.rewardGranted.gold} 🪙`);
        onReceiptVerified(data.rewardGranted);
      }
    } catch (err) {
      setIapMessage('❌ Receipt validation failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-lg">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-wide">PRAYER GACHA & SHOP 2.0</h2>
          <p className="text-xs text-slate-400">Pity Counter System + Server-Authoritative Receipt Validation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Artifact Prayer Gacha Banner */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>PRAYER ARTIFACT GACHA</span>
              </h3>
              <span className="text-[10px] font-bold bg-amber-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 shadow-inner">
                Guaranteed Legendary @ 50
              </span>
            </div>

            {/* Pity Counters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-slate-400 block text-[10px] font-extrabold tracking-wider">EPIC PITY</span>
                <span className="text-purple-400 font-extrabold text-base font-mono">{pityCounter.epic} / 20</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-slate-400 block text-[10px] font-extrabold tracking-wider">LEGENDARY PITY</span>
                <span className="text-amber-400 font-extrabold text-base font-mono">{pityCounter.legendary} / 50</span>
              </div>
            </div>

            {gachaResult && (
              <div className="p-4 rounded-2xl border-2 border-orange-500 bg-slate-900/90 text-center space-y-1 shadow-[0_0_15px_rgba(249,115,22,0.3)] animate-scale-up">
                <span className="text-[10px] uppercase font-black text-amber-400 tracking-wider">{gachaResult.rarity} ITEM ROLLED!</span>
                <h4 className="font-extrabold text-base text-slate-100">{gachaResult.name}</h4>
              </div>
            )}
          </div>

          <button
            onClick={handleRollGacha}
            disabled={diamonds < 300 || isRolling}
            className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
              diamonds >= 300 && !isRolling
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 active:scale-98'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isRolling ? 'PRAYING...' : 'SUMMON 1X ARTIFACT (💎 300)'}
          </button>
        </div>

        {/* In-App Purchases & Rewarded Ads */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>IAP PACKS & REWARDED ADS</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center shadow-inner">
              <div>
                <div className="font-bold text-slate-200">Starter Adventurer Pack</div>
                <div className="text-[10px] text-slate-400 font-mono">+500 💎 +10,000 🪙</div>
              </div>
              <button
                onClick={() => handleSimulateIap('pack_starter')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-xs shadow-md transition-transform active:scale-95"
              >
                $2.99
              </button>
            </div>

            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex justify-between items-center shadow-inner">
              <div>
                <div className="font-bold text-slate-200">Pile of Diamonds</div>
                <div className="text-[10px] text-slate-400 font-mono">+2,500 💎 +50,000 🪙</div>
              </div>
              <button
                onClick={() => handleSimulateIap('pack_pile_diamonds')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-full text-xs shadow-md transition-transform active:scale-95"
              >
                $9.99
              </button>
            </div>
          </div>

          {iapMessage && (
            <div className="text-xs font-bold p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/50 text-emerald-300 shadow-lg">
              {iapMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
