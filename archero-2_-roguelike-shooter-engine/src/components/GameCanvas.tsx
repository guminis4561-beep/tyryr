import React, { useEffect, useRef, useState } from 'react';
import { CombatEngine } from '../game/engine/CombatEngine';
import { SkillDefinition, WeaponType } from '../types/game';
import { Play, Pause, RefreshCw, Trophy, Skull, Swords, Shield, Zap } from 'lucide-react';
import { SkillSelectionModal } from './SkillSelectionModal';
import { SkillManager } from '../game/engine/SkillManager';

interface GameCanvasProps {
  onGameFinish: (stats: { goldGained: number; expGained: number; kills: number }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onGameFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CombatEngine | null>(null);

  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType>('bow');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [skillChoices, setSkillChoices] = useState<SkillDefinition[]>([]);
  const [activeSkills, setActiveSkills] = useState<SkillDefinition[]>([]);

  // HUD State
  const [playerHp, setPlayerHp] = useState<number>(2500);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(2500);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [playerExp, setPlayerExp] = useState<number>(0);
  const [playerMaxExp, setPlayerMaxExp] = useState<number>(100);
  const [stageWave, setStageWave] = useState<number>(1);
  const [bossName, setBossName] = useState<string | null>(null);
  const [gameOverStats, setGameOverStats] = useState<{ isVictory: boolean; gold: number; exp: number; kills: number } | null>(null);

  // Virtual Joystick State
  const joystickRef = useRef<{ active: boolean; startX: number; startY: number; currX: number; currY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    currX: 0,
    currY: 0
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new CombatEngine(canvasRef.current, {
      onPlayerLevelUp: (newLevel) => {
        setPlayerLevel(newLevel);
        const choices = SkillManager.rollThreeSkillChoices();
        setSkillChoices(choices);
        setShowLevelUpModal(true);
      },
      onGameOver: (isVictory, stats) => {
        setIsPlaying(false);
        setGameOverStats({
          isVictory,
          gold: stats.goldGained,
          exp: stats.expGained,
          kills: stats.kills
        });
        onGameFinish(stats);
      },
      onBossSpawned: (name) => {
        setBossName(name);
      },
      onBossDefeated: () => {
        setBossName(null);
      }
    });

    engineRef.current = engine;
    engine.start();

    // Keyboard Listeners (WASD / Arrows)
    const keysPressed: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = true;
      updateInputVectorFromKeys();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key.toLowerCase()] = false;
      updateInputVectorFromKeys();
    };

    const updateInputVectorFromKeys = () => {
      if (!engineRef.current) return;
      let x = 0;
      let y = 0;
      if (keysPressed['w'] || keysPressed['arrowup']) y -= 1;
      if (keysPressed['s'] || keysPressed['arrowdown']) y += 1;
      if (keysPressed['a'] || keysPressed['arrowleft']) x -= 1;
      if (keysPressed['d'] || keysPressed['arrowright']) x += 1;

      const len = Math.hypot(x, y);
      if (len > 0) {
        engineRef.current.inputVector = { x: x / len, y: y / len };
      } else {
        engineRef.current.inputVector = { x: 0, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Sync HUD timer
    const hudInterval = setInterval(() => {
      if (engineRef.current && engineRef.current.isGameActive) {
        setPlayerHp(engineRef.current.player.hp);
        setPlayerMaxHp(engineRef.current.player.maxHp);
        setPlayerLevel(engineRef.current.player.level);
        setPlayerExp(engineRef.current.player.exp);
        setPlayerMaxExp(engineRef.current.player.maxExp);
        setStageWave(engineRef.current.stageWave);
      }
    }, 100);

    return () => {
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(hudInterval);
    };
  }, []);

  const startNewRun = () => {
    if (engineRef.current) {
      engineRef.current.initStage('chapter', selectedWeapon);
      setIsPlaying(true);
      setIsPaused(false);
      setGameOverStats(null);
      setActiveSkills([]);
      setBossName(null);
    }
  };

  const handleSelectSkill = (skill: SkillDefinition) => {
    if (engineRef.current) {
      engineRef.current.player.skills.push(skill);
      setActiveSkills([...engineRef.current.player.skills]);
      engineRef.current.isPaused = false;
      setShowLevelUpModal(false);
    }
  };

  // Virtual Touch / Mouse Drag Joystick Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || isPaused) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    joystickRef.current = { active: true, startX: x, startY: y, currX: x, currY: y };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!joystickRef.current.active || !engineRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    joystickRef.current.currX = x;
    joystickRef.current.currY = y;

    const dx = x - joystickRef.current.startX;
    const dy = y - joystickRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      engineRef.current.inputVector = { x: dx / dist, y: dy / dist };
    } else {
      engineRef.current.inputVector = { x: 0, y: 0 };
    }
  };

  const handlePointerUp = () => {
    joystickRef.current.active = false;
    if (engineRef.current) {
      engineRef.current.inputVector = { x: 0, y: 0 };
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[600px] w-full bg-slate-950 p-2 select-none">
      {/* Top Combat HUD */}
      {isPlaying && (
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-2 text-white space-y-2 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">
                WAVE {stageWave}/10
              </span>
              <span>LVL {playerLevel}</span>
            </div>
            {bossName && <span className="text-red-400 animate-pulse font-extrabold">🐉 {bossName}</span>}
            <button
              onClick={() => {
                if (engineRef.current) {
                  engineRef.current.isPaused = !isPaused;
                  setIsPaused(!isPaused);
                }
              }}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Player HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-300 font-semibold">
              <span>HP: {Math.max(0, Math.round(playerHp))} / {playerMaxHp}</span>
              <span>{Math.round((playerHp / playerMaxHp) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
              />
            </div>
          </div>

          {/* EXP Bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${Math.min(100, (playerExp / playerMaxExp) * 100)}%` }}
            />
          </div>

          {/* Active Skill Badges */}
          {activeSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {activeSkills.map((s, i) => (
                <span key={i} className="text-[9px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-bold">
                  {s.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Canvas Viewport + Touch Area */}
      <div
        className="relative border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={620}
          className="block w-full max-w-[480px] h-auto"
        />

        {/* Start Game Overlay */}
        {!isPlaying && !gameOverStats && (
          <div className="absolute inset-0 bg-[#0F172A]/90 backdrop-blur-md flex flex-col items-center justify-between p-6 text-center text-white z-20">
            {/* Stage Title */}
            <div className="text-center pt-2">
              <p className="text-blue-400 font-bold tracking-[0.3em] uppercase text-[11px] mb-1">Current Quest</p>
              <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow">Chapter 14</h1>
              <h3 className="text-base font-bold text-slate-300 italic">The Frozen Peaks</h3>
            </div>

            {/* Character Stage Display */}
            <div className="relative w-full my-2 flex items-center justify-center">
              <div className="absolute bottom-2 w-48 h-16 bg-blue-500/25 rounded-[100%] blur-xl transform rotate-[-5deg]"></div>
              <div className="relative z-10 w-32 h-44 flex flex-col items-center justify-center bg-gradient-to-b from-blue-400/20 to-transparent rounded-full border border-white/10 shadow-2xl">
                <div className="text-6xl filter drop-shadow-[0_0_25px_rgba(59,130,246,0.7)]">
                  {selectedWeapon === 'bow' ? '🏹' : selectedWeapon === 'scythe' ? '🗡️' : '🗡️'}
                </div>
                <div className="mt-2 px-3 py-0.5 bg-blue-600 rounded-full font-extrabold text-[10px] uppercase tracking-wider text-white shadow-md">
                  Archer Hero
                </div>
              </div>
            </div>

            {/* Weapon Selector */}
            <div className="space-y-1.5 w-full max-w-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Starting Weapon</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['bow', 'scythe', 'daggers'] as WeaponType[]).map(w => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeapon(w)}
                    className={`py-2 px-1 rounded-xl border font-bold capitalize transition-all ${
                      selectedWeapon === w
                        ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        : 'border-slate-700/80 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Vibrant Battle Button */}
            <div className="w-full flex justify-center pt-2 pb-1">
              <button onClick={startNewRun} className="group relative transition-transform active:scale-95">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full blur opacity-80 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <div className="relative px-10 py-3 bg-slate-900 rounded-full border-2 border-orange-500/60 flex items-center gap-3 shadow-2xl">
                  <span className="text-lg font-black uppercase tracking-widest text-white italic">Start Battle</span>
                  <span className="text-xl">⚔️</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOverStats && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-5 text-white animate-fade-in">
            <div className="space-y-1">
              {gameOverStats.isVictory ? (
                <div className="inline-flex items-center space-x-2 text-amber-400 font-black text-xl">
                  <Trophy className="w-6 h-6" />
                  <span>CHAPTER CLEARED!</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-2 text-red-500 font-black text-xl">
                  <Skull className="w-6 h-6" />
                  <span>DEFEATED!</span>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Enemies Defeated:</span>
                <span className="text-slate-200">{gameOverStats.kills}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Gold Reward:</span>
                <span className="text-amber-400">+🪙 {gameOverStats.gold}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">EXP Earned:</span>
                <span className="text-cyan-400">+⭐ {gameOverStats.exp}</span>
              </div>
            </div>

            <button
              onClick={startNewRun}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 font-black text-slate-950 rounded-xl text-xs transition-all shadow-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Skill Selection Level Up Modal */}
      {showLevelUpModal && (
        <SkillSelectionModal
          choices={skillChoices}
          onSelectSkill={handleSelectSkill}
          playerLevel={playerLevel}
        />
      )}
    </div>
  );
};
