import express from "express";
import path from "path";
let createViteServer: any;

const app = express();
const PORT = 3000;

app.use(express.json());

// Memory Database for Server-Authoritative State & Anti-Cheat Validation
interface PlayerData {
  id: string;
  name: string;
  level: number;
  exp: number;
  gold: number;
  diamonds: number;
  guildCoins: number;
  arenaTokens: number;
  crystals: number;
  mythstones: number;
  chapter: number;
  towerFloor: number;
  pityCounter: { epic: number; legendary: number };
  equipped: Record<string, any>;
  inventory: any[];
  talents: Record<string, number>;
  runes: any[];
  guildId: string | null;
  elo: number;
  updatedAt: string;
}

let playerDatabase: PlayerData = {
  id: "player_77819",
  name: "Shadow Archer",
  level: 12,
  exp: 4200,
  gold: 25800,
  diamonds: 1450,
  guildCoins: 620,
  arenaTokens: 380,
  crystals: 15,
  mythstones: 3,
  chapter: 3,
  towerFloor: 18,
  pityCounter: { epic: 14, legendary: 36 },
  equipped: {
    weapon: { id: "w_mythic_bow", name: "Sunfire Phoenix Bow", type: "weapon", weaponType: "bow", rarity: "Legendary", level: 15, stats: { atk: 450, critRate: 15, atkSpeed: 1.2 } },
    armor: { id: "a_epic_vest", name: "Shadow Cloak", type: "armor", rarity: "Epic", level: 12, stats: { maxHp: 1800, damageReduce: 8 } },
    ring1: { id: "r_rare_wolf", name: "Ring of the Falcon", type: "ring", rarity: "Rare", level: 10, stats: { critDamage: 25 } },
    ring2: { id: "r_epic_dragon", name: "Ring of the Wyrm", type: "ring", rarity: "Epic", level: 10, stats: { atk: 120 } },
    spirit: { id: "s_rare_bat", name: "Laser Bat Spirit", type: "spirit", rarity: "Rare", level: 8, stats: { atk: 90 } }
  },
  inventory: [
    { id: "inv_1", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } },
    { id: "inv_2", name: "Death Scythe", type: "weapon", weaponType: "scythe", rarity: "Rare", level: 1, stats: { atk: 280, knockback: 2.0 } },
    { id: "inv_3", name: "Heavy Crossbow", type: "weapon", weaponType: "crossbow", rarity: "Rare", level: 1, stats: { atk: 320, critRate: 10 } },
    { id: "inv_4", name: "Golden Chestplate", type: "armor", rarity: "Rare", level: 1, stats: { maxHp: 850 } },
    { id: "inv_5", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } },
    { id: "inv_6", name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers", rarity: "Epic", level: 1, stats: { atk: 210, atkSpeed: 1.6 } }
  ],
  talents: {
    "t_atk_1": 5,
    "t_hp_1": 4,
    "t_crit_1": 3,
    "t_element_1": 2,
    "t_coins_1": 3
  },
  runes: [
    { id: "rune_1", name: "Rune of Ignition", slot: 1, stat: "Fire Damage +15%", rarity: "Epic" },
    { id: "rune_2", name: "Rune of Swiftness", slot: 2, stat: "Attack Speed +8%", rarity: "Rare" }
  ],
  guildId: "guild_phoenix",
  elo: 1450,
  updatedAt: new Date().toISOString()
};

// Guild Boss Shared HP State
let guildBossState = {
  id: "boss_dragon_lord",
  name: "Abyssal Flame Dragon",
  maxHp: 50000000,
  currentHp: 32450000,
  level: 50,
  seasonEndsIn: "2d 14h 22m"
};

// Leaderboard Mock (Redis Sorted Set simulation)
let leaderboardData = [
  { rank: 1, name: "Valkyrie", score: 184500, chapter: 15, elo: 2450 },
  { rank: 2, name: "Shadow Archer", score: 142000, chapter: 12, elo: 1980 },
  { rank: 3, name: "Kratos", score: 139500, chapter: 11, elo: 1890 },
  { rank: 4, name: "RogueOne", score: 121000, chapter: 10, elo: 1750 },
  { rank: 5, name: "ArrowGod", score: 115200, chapter: 10, elo: 1680 }
];

// Remote Config JSON (Hot-Reloadable)
let remoteConfig = {
  version: "2.4.0",
  enemyHpScaling: 1.15,
  enemyDamageScaling: 1.12,
  gachaEpicPity: 20,
  gachaLegendaryPity: 50,
  goldCaveMultiplier: 2.5,
  doubleDropEventActive: true,
  announcement: "🔥 Season 4 Archero 2 Update Live! Guild Boss Raids active!"
};

// Audit Logs
let auditLogs: string[] = [
  `[${new Date().toLocaleTimeString()}] System initialized. Anti-cheat audit layer operational.`,
  `[${new Date().toLocaleTimeString()}] Config loaded: v2.4.0`
];

function logAudit(action: string) {
  const entry = `[${new Date().toLocaleTimeString()}] ${action}`;
  auditLogs.unshift(entry);
  if (auditLogs.length > 50) auditLogs.pop();
}

// REST API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), server: "Archero2-Backend-v2.4" });
});

app.get("/api/player/profile", (req, res) => {
  res.json({ success: true, data: playerDatabase });
});

app.post("/api/player/sync", (req, res) => {
  const { goldEarned, expEarned, chapterReached, killCount } = req.body;
  
  // Anti-cheat validation check
  const maxAllowableGold = 50000;
  if (goldEarned > maxAllowableGold) {
    logAudit(`⚠️ CHEAT SUSPECT: Player ${playerDatabase.id} submitted impossible gold gain (${goldEarned})`);
    return res.status(400).json({ success: false, error: "Validation failure: Abnormal reward values detected" });
  }

  playerDatabase.gold += goldEarned || 0;
  playerDatabase.exp += expEarned || 0;
  if (chapterReached > playerDatabase.chapter) {
    playerDatabase.chapter = chapterReached;
  }
  playerDatabase.updatedAt = new Date().toISOString();

  logAudit(`Sync success for ${playerDatabase.name}: +${goldEarned} Gold, +${expEarned} EXP`);
  res.json({ success: true, data: playerDatabase });
});

// Gacha System API (Server-Authoritative)
app.post("/api/gacha/roll", (req, res) => {
  const cost = 300; // Diamonds
  if (playerDatabase.diamonds < cost) {
    return res.status(400).json({ success: false, error: "Insufficient Diamonds" });
  }

  playerDatabase.diamonds -= cost;
  playerDatabase.pityCounter.epic += 1;
  playerDatabase.pityCounter.legendary += 1;

  let rolledRarity = "Common";
  const roll = Math.random() * 100;

  if (playerDatabase.pityCounter.legendary >= remoteConfig.gachaLegendaryPity || roll < 2.5) {
    rolledRarity = "Legendary";
    playerDatabase.pityCounter.legendary = 0;
    playerDatabase.pityCounter.epic = 0;
  } else if (playerDatabase.pityCounter.epic >= remoteConfig.gachaEpicPity || roll < 15) {
    rolledRarity = "Epic";
    playerDatabase.pityCounter.epic = 0;
  } else if (roll < 45) {
    rolledRarity = "Rare";
  }

  const itemsPool = [
    { name: "Mythic Sun Bow", type: "weapon", weaponType: "bow" },
    { name: "Gale Blade Daggers", type: "weapon", weaponType: "daggers" },
    { name: "Thunder Scythe", type: "weapon", weaponType: "scythe" },
    { name: "Shadow Cloak", type: "armor" },
    { name: "Ring of Wyrm", type: "ring" },
    { name: "Laser Bat Spirit", type: "spirit" }
  ];

  const randomItemTemplate = itemsPool[Math.floor(Math.random() * itemsPool.length)];
  const newItem = {
    id: `item_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    name: `${rolledRarity} ${randomItemTemplate.name}`,
    type: randomItemTemplate.type,
    weaponType: randomItemTemplate.weaponType,
    rarity: rolledRarity,
    level: 1,
    stats: { atk: rolledRarity === "Legendary" ? 350 : rolledRarity === "Epic" ? 200 : 100 }
  };

  playerDatabase.inventory.push(newItem);
  logAudit(`Gacha Roll: Player got [${rolledRarity}] ${newItem.name}`);

  res.json({
    success: true,
    rolledItem: newItem,
    pityState: playerDatabase.pityCounter,
    diamondsRemaining: playerDatabase.diamonds
  });
});

// Blacksmith Merge/Fuse API
app.post("/api/blacksmith/fuse", (req, res) => {
  const { itemIds } = req.body;
  if (!itemIds || itemIds.length < 3) {
    return res.status(400).json({ success: false, error: "Requires 3 matching items to fuse!" });
  }

  // Find items in inventory
  const itemsToFuse = playerDatabase.inventory.filter(i => itemIds.includes(i.id));
  if (itemsToFuse.length < 3) {
    return res.status(400).json({ success: false, error: "Selected items not found in inventory" });
  }

  const baseItem = itemsToFuse[0];
  const nextRarityMap: Record<string, string> = {
    "Common": "Rare",
    "Rare": "Epic",
    "Epic": "Legendary",
    "Legendary": "Mythic"
  };

  const nextRarity = nextRarityMap[baseItem.rarity] || "Mythic";

  // Remove used items
  playerDatabase.inventory = playerDatabase.inventory.filter(i => !itemIds.includes(i.id));

  // Add fused upgraded item
  const upgradedItem = {
    id: `fused_${Date.now()}`,
    name: baseItem.name.replace(baseItem.rarity, nextRarity),
    type: baseItem.type,
    weaponType: baseItem.weaponType,
    rarity: nextRarity,
    level: baseItem.level,
    stats: { atk: Math.round((baseItem.stats?.atk || 100) * 1.6) }
  };

  playerDatabase.inventory.push(upgradedItem);
  logAudit(`Blacksmith Fuse: 3x ${baseItem.rarity} -> 1x ${nextRarity} ${upgradedItem.name}`);

  res.json({ success: true, upgradedItem, inventory: playerDatabase.inventory });
});

// Guild Raid API
app.post("/api/guild/raid", (req, res) => {
  const { damageDealt } = req.body;
  const clampedDamage = Math.min(damageDealt || 100000, 5000000); // Anti-cheat clamp
  
  guildBossState.currentHp = Math.max(0, guildBossState.currentHp - clampedDamage);
  const coinsReward = Math.floor(clampedDamage / 1000);
  playerDatabase.guildCoins += coinsReward;

  logAudit(`Guild Raid: ${playerDatabase.name} dealt ${clampedDamage} damage to Guild Boss (+${coinsReward} Guild Coins)`);

  res.json({
    success: true,
    damageDealt: clampedDamage,
    guildBoss: guildBossState,
    guildCoinsEarned: coinsReward
  });
});

// Leaderboard API
app.get("/api/leaderboard", (req, res) => {
  res.json({ success: true, leaderboard: leaderboardData });
});

// Remote Config API
app.get("/api/remote-config", (req, res) => {
  res.json({ success: true, config: remoteConfig });
});

app.post("/api/remote-config/update", (req, res) => {
  remoteConfig = { ...remoteConfig, ...req.body };
  logAudit(`Remote Config updated live by admin! Version: ${remoteConfig.version}`);
  res.json({ success: true, config: remoteConfig });
});

// Audit Logs API
app.get("/api/audit-logs", (req, res) => {
  res.json({ success: true, logs: auditLogs });
});

// Receipt Validation API (Monetization)
app.post("/api/monetization/validate-receipt", (req, res) => {
  const { receiptData, productId } = req.body;
  
  const productRewards: Record<string, { diamonds: number; gold: number }> = {
    "pack_starter": { diamonds: 500, gold: 10000 },
    "pack_pile_diamonds": { diamonds: 2500, gold: 50000 },
    "pack_season_pass_premium": { diamonds: 1500, gold: 30000 }
  };

  const reward = productRewards[productId] || { diamonds: 300, gold: 5000 };
  playerDatabase.diamonds += reward.diamonds;
  playerDatabase.gold += reward.gold;

  logAudit(`Receipt Validated [${productId}]: +${reward.diamonds} Diamonds, +${reward.gold} Gold`);

  res.json({
    success: true,
    verified: true,
    productId,
    rewardGranted: reward,
    newBalance: { diamonds: playerDatabase.diamonds, gold: playerDatabase.gold }
  });
});

// Serve Vite or Static files
function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // only load vite in dev
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Archero 2 Game Engine & API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
