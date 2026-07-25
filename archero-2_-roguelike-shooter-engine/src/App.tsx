import React, { useState, useEffect } from 'react';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { GameCanvas } from './components/GameCanvas';
import { EquipmentTab } from './components/EquipmentTab';
import { TalentTab } from './components/TalentTab';
import { DungeonsTab } from './components/DungeonsTab';
import { GuildTab } from './components/GuildTab';
import { ShopGachaTab } from './components/ShopGachaTab';
import { ArchitectureDocsTab } from './components/ArchitectureDocsTab';
import { GearItem } from './types/game';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('battle');
  const [playerLevel, setPlayerLevel] = useState<number>(12);
  const [gold, setGold] = useState<number>(25800);
  const [diamonds, setDiamonds] = useState<number>(1450);
  const [guildCoins, setGuildCoins] = useState<number>(620);
  const [pityCounter, setPityCounter] = useState<{ epic: number; legendary: number }>({ epic: 14, legendary: 36 });

  const [equipped, setEquipped] = useState<Record<string, GearItem>>({
    weapon: { id: "w_mythic_bow", name: "Sunfire Phoenix Bow", type: "weapon", weaponType: "bow", rarity: "Legendary", level: 15, stats: { atk: 450, critRate: 15, atkSpeed: 1.2 } },
    armor: { id: "a_epic_vest", name: "Shadow Cloak", type: "armor", rarity: "Epic", level: 12, stats: { maxHp: 1800, damageReduce: 8 } },
    ring1: { id: "r_rare_wolf", name: "Ring of the Falcon", type: "ring", rarity: "Rare", level: 10, stats: { critDamage: 25 } },
    ring2: { id: "r_epic_dragon", name: "Ring of the Wyrm", type: "ring", rarity: "Epic", level: 10, stats: { atk: 120 } },
    spirit: { id: "s_rare_bat", name: "Laser Bat Spirit", type: "spirit", rarity: "Rare", level: 8, stats: { atk: 90 } }
  });

  const [inventory, setInventory] = useState<GearItem[]>([
    { id: "inv_1", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } },
    { id: "inv_2", name: "Death Scythe", type: "weapon", weaponType: "scythe", rarity: "Rare", level: 1, stats: { atk: 280 } },
    { id: "inv_3", name: "Heavy Crossbow", type: "weapon", weaponType: "crossbow", rarity: "Rare", level: 1, stats: { atk: 320 } },
    { id: "inv_4", name: "Golden Chestplate", type: "armor", rarity: "Rare", level: 1, stats: { maxHp: 850 } },
    { id: "inv_5", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } },
    { id: "inv_6", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } }
  ]);

  // Initial Fetch from Server API
  useEffect(() => {
    fetch('/api/player/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const p = data.data;
          setPlayerLevel(p.level || 12);
          setGold(p.gold || 25800);
          setDiamonds(p.diamonds || 1450);
          setGuildCoins(p.guildCoins || 620);
          if (p.pityCounter) setPityCounter(p.pityCounter);
          if (p.equipped) setEquipped(p.equipped);
          if (p.inventory) setInventory(p.inventory);
        }
      })
      .catch(err => console.log('Using local initial state', err));
  }, []);

  const handleGameFinish = async (stats: { goldGained: number; expGained: number; kills: number }) => {
    setGold(prev => prev + stats.goldGained);

    // Sync with Server-Authoritative Endpoint
    try {
      await fetch('/api/player/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goldEarned: stats.goldGained,
          expEarned: stats.expGained,
          killCount: stats.kills,
          chapterReached: 3
        })
      });
    } catch (e) { console.error('Sync failed', e); }
  };

  const handleFuseSuccess = (upgradedItem: GearItem, newInventory: GearItem[]) => {
    setInventory(newInventory);
  };

  const handleUpgradeTalent = (talentId: string, cost: number) => {
    setGold(prev => Math.max(0, prev - cost));
  };

  const handleGachaRollSuccess = (rolledItem: GearItem, newPity: any, remainingDiamonds: number) => {
    setInventory(prev => [...prev, rolledItem]);
    setPityCounter(newPity);
    setDiamonds(remainingDiamonds);
  };

  const handleReceiptVerified = (reward: { diamonds: number; gold: number }) => {
    setDiamonds(prev => prev + reward.diamonds);
    setGold(prev => prev + reward.gold);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans antialiased relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Atmosphere Lights */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] pointer-events-none -z-10"></div>
      <div className="fixed top-[-100px] left-[-100px] w-[400px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Top Header Navigation */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        playerLevel={playerLevel}
        gold={gold}
        diamonds={diamonds}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12 pt-4 relative z-10">
        {activeTab === 'battle' && (
          <GameCanvas onGameFinish={handleGameFinish} />
        )}

        {activeTab === 'gear' && (
          <EquipmentTab
            equipped={equipped}
            inventory={inventory}
            gold={gold}
            onFuseSuccess={handleFuseSuccess}
          />
        )}

        {activeTab === 'talents' && (
          <TalentTab
            gold={gold}
            onUpgradeTalent={handleUpgradeTalent}
          />
        )}

        {activeTab === 'dungeons' && (
          <DungeonsTab
            onStartDungeonRun={() => setActiveTab('battle')}
          />
        )}

        {activeTab === 'guild' && (
          <GuildTab
            guildCoins={guildCoins}
            onGuildRaidAttack={(earnedCoins) => setGuildCoins(prev => prev + earnedCoins)}
          />
        )}

        {activeTab === 'shop' && (
          <ShopGachaTab
            diamonds={diamonds}
            pityCounter={pityCounter}
            onGachaRollSuccess={handleGachaRollSuccess}
            onReceiptVerified={handleReceiptVerified}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDocsTab />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/60 bg-slate-900/60 backdrop-blur-md py-3.5 text-center text-xs text-slate-400 relative z-10">
        Archero 2 Mobile Roguelike Shooter • Powered by Express & React Vite Engine
      </footer>
    </div>
  );
}
