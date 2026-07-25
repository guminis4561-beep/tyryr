import {
  PlayerEntity,
  EnemyEntity,
  ProjectileEntity,
  DropEntity,
  FloatingText,
  WeaponType,
  ElementalType,
  SkillDefinition
} from '../../types/game';
import { WEAPON_BREAKPOINTS, SkillManager, RARITY_MULTIPLIERS } from './SkillManager';
import { audioSynth } from './AudioSynthesizer';

export interface CombatEngineCallbacks {
  onPlayerLevelUp: (newLevel: number) => void;
  onGameOver: (isVictory: boolean, stats: { goldGained: number; expGained: number; kills: number }) => void;
  onBossSpawned: (bossName: string) => void;
  onBossDefeated: () => void;
}

export class CombatEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // Arena Dimensions
  public width: number = 600;
  public height: number = 800;

  // Game Entities
  public player: PlayerEntity;
  public enemies: EnemyEntity[] = [];
  public projectiles: ProjectileEntity[] = [];
  public drops: DropEntity[] = [];
  public floatingTexts: FloatingText[] = [];

  // Input Vector
  public inputVector: { x: number; y: number } = { x: 0, y: 0 };

  // Stage & Dungeon State
  public stageWave: number = 1;
  public maxStageWaves: number = 10;
  public dungeonMode: string = 'chapter';
  public totalKills: number = 0;
  public totalGoldEarned: number = 0;
  public totalExpEarned: number = 0;
  public isPaused: boolean = false;
  public isGameActive: boolean = false;

  private callbacks: CombatEngineCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: CombatEngineCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;

    this.width = canvas.width;
    this.height = canvas.height;

    // Initialize Default Player
    this.player = {
      id: 'player_main',
      x: this.width / 2,
      y: this.height - 120,
      radius: 18,
      vx: 0,
      vy: 0,
      hp: 2500,
      maxHp: 2500,
      level: 1,
      exp: 0,
      maxExp: 100,
      atk: 320,
      atkSpeed: 1.2,
      critRate: 15,
      critDamage: 1.8,
      moveSpeed: 240,
      weaponType: 'bow',
      isMoving: false,
      lastAttackTime: 0,
      skills: [],
      elementalBuffs: []
    };
  }

  public initStage(mode: string = 'chapter', startingWeapon: WeaponType = 'bow') {
    this.dungeonMode = mode;
    this.player.weaponType = startingWeapon;
    this.player.hp = this.player.maxHp;
    this.player.x = this.width / 2;
    this.player.y = this.height - 120;
    this.player.skills = [];
    this.player.level = 1;
    this.player.exp = 0;
    this.player.maxExp = 100;

    this.enemies = [];
    this.projectiles = [];
    this.drops = [];
    this.floatingTexts = [];
    this.stageWave = 1;
    this.totalKills = 0;
    this.totalGoldEarned = 0;
    this.totalExpEarned = 0;

    this.spawnWave(this.stageWave);
    this.isGameActive = true;
    this.isPaused = false;
  }

  public start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (time: number) => {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // Cap delta time at 50ms
    this.lastTime = time;

    if (this.isGameActive && !this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    // 1. Update Player Movement
    const speed = this.player.moveSpeed;
    if (this.inputVector.x !== 0 || this.inputVector.y !== 0) {
      this.player.isMoving = true;
      this.player.vx = this.inputVector.x * speed;
      this.player.vy = this.inputVector.y * speed;

      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;

      // Clamp Player inside Arena Bounds
      this.player.x = Math.max(this.player.radius, Math.min(this.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.height - this.player.radius, this.player.y));
    } else {
      this.player.isMoving = false;
      this.player.vx = 0;
      this.player.vy = 0;
    }

    // 2. Stop-To-Shoot Mechanic Engine
    if (!this.player.isMoving) {
      this.handleStopToShoot(dt);
    }

    // 3. Update Projectiles
    this.updateProjectiles(dt);

    // 4. Update Enemies & AI
    this.updateEnemies(dt);

    // 5. Update Drops & Magnetization
    this.updateDrops(dt);

    // 6. Update Floating Damage Texts
    this.updateFloatingTexts(dt);

    // 7. Check Stage Wave Completion
    if (this.enemies.length === 0 && this.isGameActive) {
      if (this.stageWave < this.maxStageWaves) {
        this.stageWave++;
        this.spawnWave(this.stageWave);
      } else {
        // Victory!
        this.isGameActive = false;
        this.callbacks.onGameOver(true, {
          goldGained: this.totalGoldEarned + 1200,
          expGained: this.totalExpEarned + 500,
          kills: this.totalKills
        });
      }
    }
  }

  // Stop-To-Shoot Logic Engine
  private handleStopToShoot(dt: number) {
    const now = performance.now() / 1000;
    const weaponConfig = WEAPON_BREAKPOINTS[this.player.weaponType];

    // Compute effective attack speed rate
    let speedMult = 1.0;
    this.player.skills.forEach(s => {
      if (s.statBonus?.atkSpeedMult) speedMult += s.statBonus.atkSpeedMult;
    });

    const attackInterval = (1.0 / (weaponConfig.baseAtkSpeed * speedMult));

    if (now - this.player.lastAttackTime >= attackInterval) {
      // Find nearest alive enemy
      const nearestEnemy = this.getNearestEnemy();
      if (nearestEnemy) {
        this.fireVolleyAt(nearestEnemy);
        this.player.lastAttackTime = now;
      }
    }
  }

  private getNearestEnemy(): EnemyEntity | null {
    let nearest: EnemyEntity | null = null;
    let minDistance = Infinity;

    for (const enemy of this.enemies) {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private fireVolleyAt(target: EnemyEntity) {
    const dx = target.x - this.player.x;
    const dy = target.y - this.player.y;
    const baseAngle = Math.atan2(dy, dx);

    const weaponConfig = WEAPON_BREAKPOINTS[this.player.weaponType];
    audioSynth.playShoot(this.player.weaponType);

    // Aggregate Projectile Modifiers from active skills
    let extraFront = 0;
    let extraDiagonal = 0;
    let extraSide = 0;
    let extraRear = 0;
    let ricochet = false;
    let piercing = false;
    let bouncing = false;
    let activeElement: ElementalType = 'none';

    this.player.skills.forEach(s => {
      if (s.projectileModifiers?.extraFront) extraFront += s.projectileModifiers.extraFront;
      if (s.projectileModifiers?.extraDiagonal) extraDiagonal += s.projectileModifiers.extraDiagonal;
      if (s.projectileModifiers?.extraSide) extraSide += s.projectileModifiers.extraSide;
      if (s.projectileModifiers?.extraRear) extraRear += s.projectileModifiers.extraRear;
      if (s.projectileModifiers?.hasRicochet) ricochet = true;
      if (s.projectileModifiers?.hasPiercing) piercing = true;
      if (s.projectileModifiers?.hasBouncing) bouncing = true;
      if (s.elementalEffect) activeElement = s.elementalEffect;
    });

    const anglesToFire: number[] = [baseAngle];

    // Diagonal angles
    if (extraDiagonal > 0) {
      anglesToFire.push(baseAngle - Math.PI / 4, baseAngle + Math.PI / 4);
    }
    // Side angles
    if (extraSide > 0) {
      anglesToFire.push(baseAngle - Math.PI / 2, baseAngle + Math.PI / 2);
    }
    // Rear angle
    if (extraRear > 0) {
      anglesToFire.push(baseAngle + Math.PI);
    }

    // Double/Front arrow parallelism
    const isCrit = Math.random() * 100 < this.player.critRate;
    const { damage } = SkillManager.calculateDamage(this.player.atk, this.player, isCrit);

    anglesToFire.forEach((angle, index) => {
      const speed = weaponConfig.projectileSpeed;
      const projColor = activeElement === 'fire' ? '#ef4444' :
                        activeElement === 'lightning' ? '#eab308' :
                        activeElement === 'poison' ? '#22c55e' :
                        activeElement === 'ice' ? '#06b6d4' : '#3b82f6';

      this.projectiles.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 6,
        damage,
        isCrit,
        element: activeElement,
        isPlayerProjectile: true,
        ricochetLeft: ricochet ? 3 : 0,
        pierceLeft: piercing ? 2 : 0,
        bouncesLeft: bouncing ? 2 : 0,
        hitEntityIds: new Set<string>(),
        color: projColor
      });
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Screen Boundary Collision & Bounce
      if (p.x <= p.radius || p.x >= this.width - p.radius) {
        if (p.bouncesLeft > 0) {
          p.vx = -p.vx;
          p.bouncesLeft--;
        } else {
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      if (p.y <= p.radius || p.y >= this.height - p.radius) {
        if (p.bouncesLeft > 0) {
          p.vy = -p.vy;
          p.bouncesLeft--;
        } else {
          this.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check Collision with Targets
      if (p.isPlayerProjectile) {
        for (const enemy of this.enemies) {
          if (p.hitEntityIds.has(enemy.id)) continue;

          const dist = Math.hypot(p.x - enemy.x, p.y - enemy.y);
          if (dist < p.radius + enemy.radius) {
            // Hit Enemy!
            audioSynth.playHit();
            p.hitEntityIds.add(enemy.id);

            // Apply Damage
            enemy.hp -= p.damage;

            // Apply Elemental Effect Stacks
            this.applyElementalEffect(enemy, p.element);

            // Spawn Floating Damage Text
            this.floatingTexts.push({
              id: `ft_${Date.now()}_${Math.random()}`,
              x: enemy.x + (Math.random() * 20 - 10),
              y: enemy.y - 15,
              text: `${p.damage}${p.isCrit ? ' CRIT!' : ''}`,
              color: p.isCrit ? '#facc15' : p.color,
              opacity: 1.0,
              vy: -40
            });

            // Handle Ricochet
            if (p.ricochetLeft > 0) {
              p.ricochetLeft--;
              const nextTarget = this.enemies.find(e => e.id !== enemy.id && !p.hitEntityIds.has(e.id));
              if (nextTarget) {
                const angle = Math.atan2(nextTarget.y - p.y, nextTarget.x - p.x);
                const speed = Math.hypot(p.vx, p.vy);
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
                break;
              }
            }

            // Handle Piercing or Removal
            if (p.pierceLeft > 0) {
              p.pierceLeft--;
            } else {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // Enemy Projectile hitting Player
        const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
        if (dist < p.radius + this.player.radius) {
          this.player.hp -= p.damage;
          audioSynth.playHit();
          this.floatingTexts.push({
            id: `ft_p_${Date.now()}`,
            x: this.player.x,
            y: this.player.y - 20,
            text: `-${p.damage}`,
            color: '#ef4444',
            opacity: 1.0,
            vy: -35
          });

          this.projectiles.splice(i, 1);

          if (this.player.hp <= 0) {
            this.isGameActive = false;
            this.callbacks.onGameOver(false, {
              goldGained: this.totalGoldEarned,
              expGained: this.totalExpEarned,
              kills: this.totalKills
            });
          }
        }
      }
    }
  }

  private applyElementalEffect(enemy: EnemyEntity, element: ElementalType) {
    if (element === 'none') return;

    if (element === 'ice') {
      enemy.isFrozen = true;
      setTimeout(() => { enemy.isFrozen = false; }, 2500);
    }

    const existingStack = enemy.elementalStacks.find(s => s.type === element);
    if (existingStack) {
      existingStack.duration = 3.0;
      existingStack.intensity += 1;
    } else {
      enemy.elementalStacks.push({
        type: element,
        duration: 3.0,
        intensity: 1,
        tickTimer: 0.5
      });
    }
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Handle Elemental Ticks
      enemy.elementalStacks.forEach(s => {
        s.duration -= dt;
        s.tickTimer -= dt;
        if (s.tickTimer <= 0) {
          s.tickTimer = 0.5;
          let tickDamage = Math.round(this.player.atk * 0.15 * s.intensity);
          enemy.hp -= tickDamage;
          this.floatingTexts.push({
            id: `ft_elem_${Date.now()}`,
            x: enemy.x,
            y: enemy.y - 10,
            text: `${tickDamage}`,
            color: s.type === 'fire' ? '#ef4444' : s.type === 'poison' ? '#22c55e' : '#eab308',
            opacity: 1.0,
            vy: -25
          });
        }
      });
      enemy.elementalStacks = enemy.elementalStacks.filter(s => s.duration > 0);

      // Enemy Death Check
      if (enemy.hp <= 0) {
        this.totalKills++;
        this.spawnDrops(enemy.x, enemy.y, enemy.type === 'boss');
        if (enemy.type === 'boss') {
          this.callbacks.onBossDefeated();
        }
        this.enemies.splice(i, 1);
        continue;
      }

      // Enemy Movement AI
      const slowFactor = enemy.isFrozen ? 0.5 : 1.0;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.hypot(dx, dy);

      if (enemy.type === 'chaser') {
        enemy.x += (dx / dist) * enemy.moveSpeed * slowFactor * dt;
        enemy.y += (dy / dist) * enemy.moveSpeed * slowFactor * dt;

        // Contact Attack
        if (dist < enemy.radius + this.player.radius) {
          const now = performance.now() / 1000;
          if (now - enemy.lastAttackTime > 1.0) {
            enemy.lastAttackTime = now;
            this.player.hp -= enemy.atk;
            audioSynth.playHit();
            this.floatingTexts.push({
              id: `ft_hit_${Date.now()}`,
              x: this.player.x,
              y: this.player.y - 15,
              text: `-${enemy.atk}`,
              color: '#ef4444',
              opacity: 1.0,
              vy: -30
            });
          }
        }
      } else if (enemy.type === 'ranged') {
        // Keep distance
        if (dist > 220) {
          enemy.x += (dx / dist) * enemy.moveSpeed * slowFactor * dt;
          enemy.y += (dy / dist) * enemy.moveSpeed * slowFactor * dt;
        }

        const now = performance.now() / 1000;
        if (now - enemy.lastAttackTime > 2.2) {
          enemy.lastAttackTime = now;
          // Fire slow enemy orb
          const angle = Math.atan2(dy, dx);
          this.projectiles.push({
            id: `eproj_${Date.now()}`,
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 220,
            vy: Math.sin(angle) * 220,
            radius: 8,
            damage: enemy.atk,
            isCrit: false,
            element: 'none',
            isPlayerProjectile: false,
            ricochetLeft: 0,
            pierceLeft: 0,
            bouncesLeft: 0,
            hitEntityIds: new Set(),
            color: '#f97316'
          });
        }
      } else if (enemy.type === 'boss') {
        // Boss Phase Logic
        const hpPercent = enemy.hp / enemy.maxHp;
        if (hpPercent < 0.3) enemy.bossPhase = 3;
        else if (hpPercent < 0.6) enemy.bossPhase = 2;
        else enemy.bossPhase = 1;

        const now = performance.now() / 1000;
        if (now - enemy.lastAttackTime > (enemy.bossPhase === 3 ? 1.2 : 2.0)) {
          enemy.lastAttackTime = now;
          // Fire ring bullet hell
          const bulletCount = enemy.bossPhase === 3 ? 16 : 10;
          for (let b = 0; b < bulletCount; b++) {
            const angle = (Math.PI * 2 / bulletCount) * b + (now % 2);
            this.projectiles.push({
              id: `boss_bullet_${Date.now()}_${b}`,
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angle) * 200,
              vy: Math.sin(angle) * 200,
              radius: 9,
              damage: enemy.atk,
              isCrit: false,
              element: 'none',
              isPlayerProjectile: false,
              ricochetLeft: 0,
              pierceLeft: 0,
              bouncesLeft: 0,
              hitEntityIds: new Set(),
              color: '#dc2626'
            });
          }
        }
      }
    }
  }

  private spawnDrops(x: number, y: number, isBoss: boolean = false) {
    const count = isBoss ? 12 : 3;
    for (let i = 0; i < count; i++) {
      const dropTypeRand = Math.random();
      let type: 'exp' | 'gold' | 'heart' = 'gold';
      let color = '#facc15';
      let value = 15;

      if (dropTypeRand < 0.5) {
        type = 'exp';
        color = '#3b82f6';
        value = 25;
      } else if (dropTypeRand < 0.85) {
        type = 'gold';
        color = '#facc15';
        value = 50;
      } else {
        type = 'heart';
        color = '#ef4444';
        value = 250;
      }

      this.drops.push({
        id: `drop_${Date.now()}_${Math.random()}`,
        x: x + (Math.random() * 40 - 20),
        y: y + (Math.random() * 40 - 20),
        type,
        value,
        color
      });
    }
  }

  private updateDrops(dt: number) {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      const dx = this.player.x - drop.x;
      const dy = this.player.y - drop.y;
      const dist = Math.hypot(dx, dy);

      // Magnetization range
      if (dist < 120) {
        drop.x += (dx / dist) * 350 * dt;
        drop.y += (dy / dist) * 350 * dt;
      }

      // Pickup Collision
      if (dist < this.player.radius + 12) {
        if (drop.type === 'exp') {
          this.player.exp += drop.value;
          this.totalExpEarned += drop.value;
          audioSynth.playCoin();

          if (this.player.exp >= this.player.maxExp) {
            this.player.exp -= this.player.maxExp;
            this.player.level++;
            this.player.maxExp = Math.round(this.player.maxExp * 1.3);
            audioSynth.playLevelUp();
            this.isPaused = true;
            this.callbacks.onPlayerLevelUp(this.player.level);
          }
        } else if (drop.type === 'gold') {
          this.totalGoldEarned += drop.value;
          audioSynth.playCoin();
        } else if (drop.type === 'heart') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + drop.value);
          audioSynth.playCoin();
        }

        this.drops.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.opacity -= 1.2 * dt;
      if (ft.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private spawnWave(waveNumber: number) {
    const isBossWave = waveNumber === this.maxStageWaves;

    if (isBossWave) {
      audioSynth.playBossRoar();
      const boss: EnemyEntity = {
        id: `boss_abyssal_${Date.now()}`,
        name: "Abyssal Flame Dragon",
        type: 'boss',
        x: this.width / 2,
        y: 180,
        radius: 42,
        vx: 0,
        vy: 0,
        hp: 12000,
        maxHp: 12000,
        atk: 380,
        moveSpeed: 60,
        attackRange: 300,
        lastAttackTime: 0,
        color: '#dc2626',
        elementalStacks: [],
        isFrozen: false,
        bossPhase: 1
      };
      this.enemies.push(boss);
      this.callbacks.onBossSpawned(boss.name);
    } else {
      const count = 4 + waveNumber * 2;
      for (let i = 0; i < count; i++) {
        const isRanged = Math.random() > 0.6;
        const enemy: EnemyEntity = {
          id: `enemy_w${waveNumber}_${i}`,
          name: isRanged ? "Orb Sniper" : "Shadow Slime",
          type: isRanged ? 'ranged' : 'chaser',
          x: Math.random() * (this.width - 80) + 40,
          y: Math.random() * 250 + 60,
          radius: isRanged ? 16 : 14,
          vx: 0,
          vy: 0,
          hp: 600 + waveNumber * 200,
          maxHp: 600 + waveNumber * 200,
          atk: 120 + waveNumber * 15,
          moveSpeed: isRanged ? 70 : 110,
          attackRange: 200,
          lastAttackTime: 0,
          color: isRanged ? '#f97316' : '#8b5cf6',
          elementalStacks: [],
          isFrozen: false
        };
        this.enemies.push(enemy);
      }
    }
  }

  // Render Engine
  public render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render Grid Pattern Background
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Render Drops
    this.drops.forEach(d => {
      this.ctx.fillStyle = d.color;
      this.ctx.beginPath();
      this.ctx.arc(d.x, d.y, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = d.color;
    });
    this.ctx.shadowBlur = 0;

    // Render Projectiles
    this.projectiles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Render Enemies
    this.enemies.forEach(e => {
      this.ctx.fillStyle = e.isFrozen ? '#06b6d4' : e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Enemy Health Bar
      const barW = e.radius * 2.2;
      const barH = 5;
      const hpRatio = Math.max(0, e.hp / e.maxHp);
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(e.x - barW / 2, e.y - e.radius - 12, barW, barH);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(e.x - barW / 2, e.y - e.radius - 12, barW * hpRatio, barH);

      if (e.type === 'boss') {
        this.ctx.strokeStyle = '#facc15';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(e.x - barW / 2, e.y - e.radius - 12, barW, barH);
      }
    });

    // Render Player Entity
    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Player Direction Indicator
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y - 8, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Render Floating Text
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, ft.opacity);
      this.ctx.fillStyle = ft.color;
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });
  }
}
