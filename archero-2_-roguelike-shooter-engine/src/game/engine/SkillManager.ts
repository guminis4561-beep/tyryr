import { SkillDefinition, Rarity, WeaponBreakpoint, WeaponType, ElementalType, PlayerEntity } from '../../types/game';

// Weapon Attack Speed Breakpoint Definitions
export const WEAPON_BREAKPOINTS: Record<WeaponType, WeaponBreakpoint> = {
  bow: {
    name: "Sunfire Bow",
    weaponType: "bow",
    baseAtkSpeed: 1.2, // 1.2 attacks per second
    animationWindup: 0.15,
    baseKnockback: 1.5,
    projectileSpeed: 520,
    damageMultiplier: 1.0
  },
  staff: {
    name: "Arcane Homing Staff",
    weaponType: "staff",
    baseAtkSpeed: 0.9,
    animationWindup: 0.22,
    baseKnockback: 1.0,
    projectileSpeed: 420,
    damageMultiplier: 1.15
  },
  scythe: {
    name: "Death Scythe",
    weaponType: "scythe",
    baseAtkSpeed: 0.75,
    animationWindup: 0.30,
    baseKnockback: 3.5,
    projectileSpeed: 380,
    damageMultiplier: 1.5
  },
  crossbow: {
    name: "Heavy Crossbow",
    weaponType: "crossbow",
    baseAtkSpeed: 1.1,
    animationWindup: 0.18,
    baseKnockback: 2.0,
    projectileSpeed: 650,
    damageMultiplier: 1.3
  },
  daggers: {
    name: "Gale Blade Daggers",
    weaponType: "daggers",
    baseAtkSpeed: 2.2,
    animationWindup: 0.08,
    baseKnockback: 0.5,
    projectileSpeed: 580,
    damageMultiplier: 0.65
  }
};

// Rarity Multipliers Matrix
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1.0,
  Rare: 1.25,
  Epic: 1.5,
  Legendary: 2.0,
  Mythic: 3.0
};

// Master Skills Catalog
export const SKILL_CATALOG: SkillDefinition[] = [
  {
    id: "s_double_shot",
    name: "Double Shot",
    description: "Fires +1 additional arrow in sequence with slight delay.",
    icon: "Repeat",
    category: "offensive",
    rarity: "Common",
    projectileModifiers: { extraFront: 1 },
    synergyGroup: "multishot"
  },
  {
    id: "s_front_arrow",
    name: "Front Arrow +1",
    description: "Adds 1 extra parallel arrow facing forward.",
    icon: "ArrowUp",
    category: "offensive",
    rarity: "Rare",
    projectileModifiers: { extraFront: 1 }
  },
  {
    id: "s_diagonal_arrow",
    name: "Diagonal Arrows",
    description: "Fires 2 extra arrows diagonally at 45 degree angles.",
    icon: "ArrowUpRight",
    category: "offensive",
    rarity: "Rare",
    projectileModifiers: { extraDiagonal: 2 }
  },
  {
    id: "s_side_arrow",
    name: "Side Arrows",
    description: "Fires 2 arrows to the left and right sides.",
    icon: "ArrowLeftRight",
    category: "offensive",
    rarity: "Common",
    projectileModifiers: { extraSide: 2 }
  },
  {
    id: "s_ricochet",
    name: "Ricochet",
    description: "Projectiles bounce between up to 3 nearby enemies.",
    icon: "Zap",
    category: "special",
    rarity: "Epic",
    projectileModifiers: { hasRicochet: true, ricochetCount: 3 },
    synergyGroup: "ricochet"
  },
  {
    id: "s_piercing",
    name: "Piercing Shot",
    description: "Projectiles pass through enemies without stopping.",
    icon: "MoveRight",
    category: "offensive",
    rarity: "Epic",
    projectileModifiers: { hasPiercing: true }
  },
  {
    id: "s_bouncing",
    name: "Bouncing Wall",
    description: "Arrows bounce off screen walls back into combat.",
    icon: "Maximize",
    category: "special",
    rarity: "Rare",
    projectileModifiers: { hasBouncing: true }
  },
  {
    id: "s_fire_arrow",
    name: "Blaze Arrow (Fire)",
    description: "Ignites enemies on hit, dealing fire damage over 3s.",
    icon: "Flame",
    category: "elemental",
    rarity: "Common",
    elementalEffect: "fire",
    synergyGroup: "fire"
  },
  {
    id: "s_shock_arrow",
    name: "Thunder Spark (Lightning)",
    description: "Triggers chain lightning to 3 adjacent targets.",
    icon: "Zap",
    category: "elemental",
    rarity: "Rare",
    elementalEffect: "lightning",
    synergyGroup: "lightning"
  },
  {
    id: "s_poison_arrow",
    name: "Venom Arrow (Poison)",
    description: "Infects target with stacking poison damage tick.",
    icon: "Skull",
    category: "elemental",
    rarity: "Common",
    elementalEffect: "poison",
    synergyGroup: "poison"
  },
  {
    id: "s_ice_arrow",
    name: "Frostbite Arrow (Ice)",
    description: "Freezes enemies, slowing movement & attack rate by 50%.",
    icon: "Snowflake",
    category: "elemental",
    rarity: "Epic",
    elementalEffect: "ice",
    synergyGroup: "ice"
  },
  {
    id: "s_atk_boost",
    name: "Attack Boost",
    description: "Increases overall attack damage by +20%.",
    icon: "Swords",
    category: "stat",
    rarity: "Common",
    statBonus: { atkMult: 0.20 }
  },
  {
    id: "s_atk_speed_boost",
    name: "Attack Speed Boost",
    description: "Increases attack speed rate by +25%.",
    icon: "Gauge",
    category: "stat",
    rarity: "Common",
    statBonus: { atkSpeedMult: 0.25 }
  },
  {
    id: "s_crit_boost",
    name: "Critical Strike Master",
    description: "Increases Critical Rate by +15% and Crit Damage by +40%.",
    icon: "Target",
    category: "stat",
    rarity: "Rare",
    statBonus: { critRateAdd: 15, critDamageMult: 0.40 }
  },
  {
    id: "s_life_steal",
    name: "Vampiric Touch",
    description: "Restores +3% Max HP on every enemy kill.",
    icon: "HeartPulse",
    category: "defensive",
    rarity: "Epic",
    statBonus: { hpMaxAdd: 100 }
  },
  {
    id: "s_mythic_overload",
    name: "Mythic Divine Barrage",
    description: "Fires massive holy volley with +100% ATK and all elements!",
    icon: "Sparkles",
    category: "special",
    rarity: "Mythic",
    statBonus: { atkMult: 1.0, atkSpeedMult: 0.5 },
    projectileModifiers: { extraFront: 2, extraDiagonal: 2, hasRicochet: true }
  }
];

export class SkillManager {
  // Roguelike 2.0 Double Randomization Picker
  static rollThreeSkillChoices(): SkillDefinition[] {
    const choices: SkillDefinition[] = [];
    const usedIds = new Set<string>();

    for (let i = 0; i < 3; i++) {
      // Step 1: Roll Rarity Tier
      const rarityRoll = Math.random() * 100;
      let targetRarity: Rarity = "Common";
      if (rarityRoll < 1.0) targetRarity = "Mythic";
      else if (rarityRoll < 5.0) targetRarity = "Legendary";
      else if (rarityRoll < 15.0) targetRarity = "Epic";
      else if (rarityRoll < 40.0) targetRarity = "Rare";

      // Filter catalog for matching rarity (or fall back if empty)
      let eligible = SKILL_CATALOG.filter(s => s.rarity === targetRarity && !usedIds.has(s.id));
      if (eligible.length === 0) {
        eligible = SKILL_CATALOG.filter(s => !usedIds.has(s.id));
      }

      const selected = eligible[Math.floor(Math.random() * eligible.length)];
      if (selected) {
        choices.push(selected);
        usedIds.add(selected.id);
      }
    }

    return choices;
  }

  // Combat 2.0 Hybrid Damage Formula Pipeline
  static calculateDamage(
    baseAtk: number,
    player: PlayerEntity,
    isCrit: boolean,
    targetDebuffMult: number = 0
  ): { damage: number; isCrit: boolean } {
    let additiveSum = 0;
    let multSum = 1.0;
    let rarityMod = 1.0;

    player.skills.forEach(skill => {
      if (skill.statBonus?.atkAdd) additiveSum += skill.statBonus.atkAdd;
      if (skill.statBonus?.atkMult) multSum += skill.statBonus.atkMult;
      rarityMod *= RARITY_MULTIPLIERS[skill.rarity] ? (1 + (RARITY_MULTIPLIERS[skill.rarity] - 1) * 0.1) : 1.0;
    });

    const weaponConfig = WEAPON_BREAKPOINTS[player.weaponType];
    const weaponMult = weaponConfig.damageMultiplier;

    // Formula: (baseAtk + additiveSum) * multSum * rarityMod * weaponMult * (1 - targetDebuffMult)
    let rawDamage = (baseAtk + additiveSum) * multSum * rarityMod * weaponMult * (1 - targetDebuffMult);

    if (isCrit) {
      rawDamage *= player.critDamage;
    }

    // Variance +/- 5%
    const variance = 0.95 + Math.random() * 0.10;
    return {
      damage: Math.round(rawDamage * variance),
      isCrit
    };
  }

  // Check Active Skill Synergies
  static checkSynergies(skills: SkillDefinition[]): string[] {
    const activeGroups = new Set(skills.map(s => s.synergyGroup).filter(Boolean));
    const activeSynergies: string[] = [];

    if (activeGroups.has("fire") && activeGroups.has("lightning")) {
      activeSynergies.push("Plasma Overload: Fire & Lightning trigger explosive AOE bursts!");
    }
    if (activeGroups.has("multishot") && activeGroups.has("ricochet")) {
      activeSynergies.push("Shatterstorm: Ricocheting arrows split into sub-projectiles!");
    }
    if (activeGroups.has("ice") && activeGroups.has("poison")) {
      activeSynergies.push("Toxic Frost: Frozen enemies suffer 2x Poison ticks!");
    }

    return activeSynergies;
  }
}
