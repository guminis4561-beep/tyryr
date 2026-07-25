export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type WeaponType = 'bow' | 'staff' | 'scythe' | 'crossbow' | 'daggers';

export type ElementalType = 'none' | 'fire' | 'lightning' | 'poison' | 'ice';

export interface WeaponBreakpoint {
  name: string;
  weaponType: WeaponType;
  baseAtkSpeed: number; // Attack interval in seconds
  animationWindup: number; // Windup delay before projectile release
  baseKnockback: number;
  projectileSpeed: number;
  damageMultiplier: number;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: 'offensive' | 'elemental' | 'stat' | 'defensive' | 'special';
  rarity: Rarity;
  statBonus?: {
    atkAdd?: number;
    atkMult?: number;
    atkSpeedMult?: number;
    hpMaxAdd?: number;
    critRateAdd?: number;
    critDamageMult?: number;
    moveSpeedMult?: number;
  };
  projectileModifiers?: {
    extraFront?: number;
    extraDiagonal?: number;
    extraSide?: number;
    extraRear?: number;
    hasRicochet?: boolean;
    ricochetCount?: number;
    hasPiercing?: boolean;
    hasBouncing?: boolean;
    hasMultiShot?: boolean;
  };
  elementalEffect?: ElementalType;
  synergyGroup?: string;
}

export interface ElementalStack {
  type: ElementalType;
  duration: number; // Remaining duration in seconds
  intensity: number; // Stack count or damage per tick
  tickTimer: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
}

export interface PlayerEntity extends Entity {
  level: number;
  exp: number;
  maxExp: number;
  atk: number;
  atkSpeed: number; // Attacks per second
  critRate: number; // 0..100
  critDamage: number; // multiplier (e.g. 1.5)
  moveSpeed: number;
  weaponType: WeaponType;
  isMoving: boolean;
  lastAttackTime: number;
  skills: SkillDefinition[];
  elementalBuffs: ElementalType[];
}

export interface EnemyEntity extends Entity {
  name: string;
  type: 'chaser' | 'ranged' | 'summoner' | 'boss';
  atk: number;
  moveSpeed: number;
  attackRange: number;
  lastAttackTime: number;
  color: string;
  elementalStacks: ElementalStack[];
  isFrozen: boolean;
  bossPhase?: number; // 1, 2, 3 for boss
  bossPhaseMaxHp?: number[];
}

export interface ProjectileEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isCrit: boolean;
  element: ElementalType;
  isPlayerProjectile: boolean;
  ricochetLeft: number;
  pierceLeft: number;
  bouncesLeft: number;
  hitEntityIds: Set<string>;
  color: string;
}

export interface DropEntity {
  id: string;
  x: number;
  y: number;
  type: 'exp' | 'gold' | 'heart' | 'gear';
  value: number;
  color: string;
  gearItem?: GearItem;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  vy: number;
}

export interface GearItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'ring' | 'spirit';
  weaponType?: WeaponType;
  rarity: Rarity;
  level: number;
  stats: {
    atk?: number;
    maxHp?: number;
    critRate?: number;
    critDamage?: number;
    atkSpeed?: number;
    damageReduce?: number;
  };
  setId?: string;
}

export interface GearSlotLevel {
  slotType: 'weapon' | 'armor' | 'ring1' | 'ring2' | 'spirit';
  level: number;
  statBonusAtk: number;
  statBonusHp: number;
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  session: 1 | 2;
  level: number;
  maxLevel: number;
  goldCostBase: number;
  icon: string;
  statPerLevel: string;
  prerequisiteId?: string;
}

export interface Artifact {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  icon: string;
  passiveEffect: string;
  ownedShards: number;
  requiredShards: number;
  unlocked: boolean;
}

export interface DungeonMode {
  id: 'chapter' | 'tower' | 'gold_cave' | 'boss_seal' | 'endless';
  title: string;
  description: string;
  icon: string;
  currentProgress: number;
  maxProgress: number;
  recommendedAtk: number;
  entryCostType: 'energy' | 'gold' | 'free';
  entryCostAmount: number;
}

export interface GuildInfo {
  id: string;
  name: string;
  membersCount: number;
  maxMembers: number;
  leaderName: string;
  level: number;
  notice: string;
}

export interface SeasonPassLevel {
  level: number;
  xpRequired: number;
  freeReward: { type: string; amount: number; name: string };
  premiumReward: { type: string; amount: number; name: string };
}
