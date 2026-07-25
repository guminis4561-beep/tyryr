import React, { useState } from 'react';
import { GearItem, Rarity } from '../types/game';
import { Shield, Hammer, Sparkles, ArrowUp, Zap, ChevronRight } from 'lucide-react';

interface EquipmentTabProps {
  equipped: Record<string, GearItem>;
  inventory: GearItem[];
  gold: number;
  onFuseSuccess: (upgradedItem: GearItem, newInventory: GearItem[]) => void;
}

const rarityColors: Record<Rarity, string> = {
  Common: 'border-2 border-slate-600/80 bg-slate-900/90 text-slate-300',
  Rare: 'border-2 border-blue-500 bg-slate-900/90 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)]',
  Epic: 'border-2 border-purple-500 bg-slate-900/90 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]',
  Legendary: 'border-2 border-orange-500 bg-slate-900/90 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
  Mythic: 'border-2 border-rose-500 bg-slate-900/90 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.35)]'
};

export const EquipmentTab: React.FC<EquipmentTabProps> = ({
  equipped,
  inventory,
  gold,
  onFuseSuccess
}) => {
  const [selectedForFuse, setSelectedForFuse] = useState<string[]>([]);
  const [fuseMessage, setFuseMessage] = useState<string | null>(null);
  const [isFusing, setIsFusing] = useState<boolean>(false);

  const toggleFuseSelect = (id: string) => {
    if (selectedForFuse.includes(id)) {
      setSelectedForFuse(selectedForFuse.filter(i => i !== id));
    } else {
      if (selectedForFuse.length < 3) {
        setSelectedForFuse([...selectedForFuse, id]);
      }
    }
  };

  const handleFuseItems = async () => {
    if (selectedForFuse.length < 3) return;
    setIsFusing(true);
    setFuseMessage(null);

    try {
      const res = await fetch('/api/blacksmith/fuse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selectedForFuse })
      });
      const data = await res.json();
      if (data.success) {
        setFuseMessage(`✨ Blacksmith Fusion Success! Crafted ${data.upgradedItem.name}!`);
        setSelectedForFuse([]);
        onFuseSuccess(data.upgradedItem, data.inventory);
      } else {
        setFuseMessage(`❌ Fusion failed: ${data.error}`);
      }
    } catch (err) {
      setFuseMessage('❌ Server error during fusion');
    } finally {
      setIsFusing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wide">EQUIPMENT & BLACKSMITH 2.0</h2>
            <p className="text-xs text-slate-400">Slot-Based Upgrades + 3-Item Blacksmith Merge</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equipped Slots Grid */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 backdrop-blur-sm shadow-xl">
          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CURRENTLY EQUIPPED GEAR</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(equipped).map(([slotKey, rawItem]) => {
              const item = rawItem as GearItem;
              const style = rarityColors[item.rarity as Rarity] || rarityColors.Common;
              return (
                <div key={slotKey} className={`p-3.5 rounded-2xl ${style} space-y-1.5 transition-all hover:scale-[1.02]`}>
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider opacity-90">
                    <span className="text-slate-300">{slotKey}</span>
                    <span className="text-amber-400">LVL {item.level}</span>
                  </div>
                  <div className="font-extrabold text-sm">{item.name}</div>
                  <div className="text-[11px] font-mono space-y-0.5 pt-1">
                    {item.stats.atk && <div className="text-red-400 font-bold">ATK: +{item.stats.atk}</div>}
                    {item.stats.maxHp && <div className="text-green-400 font-bold">HP: +{item.stats.maxHp}</div>}
                    {item.stats.critRate && <div className="text-purple-400 font-bold">CRIT: +{item.stats.critRate}%</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            * Slot upgrade level persists when swapping gear items in Archero 2!
          </p>
        </div>

        {/* Blacksmith Merge/Fuse Section */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
              <Hammer className="w-4 h-4 text-amber-400" />
              <span>BLACKSMITH FORGE (3-ITEM MERGE)</span>
            </h3>

            <p className="text-xs text-slate-300">
              Select 3 identical rarity items to fuse into a higher rarity tier (Common → Rare → Epic → Legendary → Mythic).
            </p>

            {/* Selected Items Slots */}
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(slotIdx => {
                const itemId = selectedForFuse[slotIdx];
                const item = inventory.find(i => i.id === itemId);
                return (
                  <div
                    key={slotIdx}
                    className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-2 text-xs font-bold transition-all ${
                      item ? rarityColors[item.rarity as Rarity] : 'border-slate-700 bg-slate-900/60 text-slate-500'
                    }`}
                  >
                    {item ? (
                      <>
                        <span className="text-[9px] uppercase font-black tracking-wider">{item.rarity}</span>
                        <span className="truncate w-full mt-1 text-white">{item.name}</span>
                      </>
                    ) : (
                      <span className="text-slate-500 text-[11px]">+ Slot {slotIdx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {fuseMessage && (
              <div className="text-xs font-bold p-3 rounded-2xl bg-slate-900/90 border border-amber-500/50 text-amber-300 shadow-lg">
                {fuseMessage}
              </div>
            )}
          </div>

          <button
            onClick={handleFuseItems}
            disabled={selectedForFuse.length < 3 || isFusing}
            className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-xl ${
              selectedForFuse.length === 3 && !isFusing
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-indigo-500/30 active:scale-98'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isFusing ? 'FUSING IN FORGE...' : 'FUSE 3 ITEMS INTO 1 HIGHER TIER'}
          </button>
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-3 backdrop-blur-sm shadow-xl">
        <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          INVENTORY GEAR BAG ({inventory.length} ITEMS)
        </h3>
        <p className="text-xs text-slate-400">Click items to select/deselect for Blacksmith Fusion</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {inventory.map(item => {
            const isSelected = selectedForFuse.includes(item.id);
            const style = rarityColors[item.rarity as Rarity] || rarityColors.Common;
            return (
              <button
                key={item.id}
                onClick={() => toggleFuseSelect(item.id)}
                className={`p-3.5 rounded-2xl ${style} ${
                  isSelected ? 'ring-2 ring-amber-400 scale-105 shadow-xl' : 'hover:scale-102 opacity-90 hover:opacity-100'
                } transition-all text-left flex flex-col justify-between space-y-2 cursor-pointer`}
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider">{item.rarity}</span>
                  <div className="font-extrabold text-xs truncate mt-0.5">{item.name}</div>
                </div>
                <div className="text-[10px] font-mono font-bold">
                  {item.stats.atk ? (
                    <span className="text-red-400">ATK +{item.stats.atk}</span>
                  ) : (
                    <span className="text-green-400">HP +{item.stats.maxHp}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
