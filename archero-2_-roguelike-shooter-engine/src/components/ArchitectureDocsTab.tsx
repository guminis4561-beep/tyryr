import React, { useState, useEffect } from 'react';
import { Terminal, Database, Server, Code, FileText, Cpu, Activity, Download, RefreshCw } from 'lucide-react';

export const ArchitectureDocsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'diagrams' | 'sql' | 'openapi' | 'docker' | 'remote_config' | 'audit_logs'>('diagrams');
  const [remoteConfig, setRemoteConfig] = useState<any>({});
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [configMessage, setConfigMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRemoteConfig();
    fetchAuditLogs();
  }, []);

  const fetchRemoteConfig = async () => {
    try {
      const res = await fetch('/api/remote-config');
      const data = await res.json();
      if (data.success) setRemoteConfig(data.config);
    } catch (e) { console.error(e); }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      if (data.success) setAuditLogs(data.logs);
    } catch (e) { console.error(e); }
  };

  const handleUpdateConfig = async () => {
    try {
      const res = await fetch('/api/remote-config/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(remoteConfig)
      });
      const data = await res.json();
      if (data.success) {
        setConfigMessage('✅ Remote Config updated live on server!');
        setTimeout(() => setConfigMessage(null), 3000);
      }
    } catch (e) { console.error(e); }
  };

  const asciiArchitecture = `
========================================================================================================
                          ARCHERO 2 - FULL-STACK SYSTEM ARCHITECTURE DIAGRAM
========================================================================================================

 [ MOBILE GAME CLIENT ]
   │  • Unity 2023 / Godot 4.2 Engine (C# / GDScript)
   │  • 60 FPS Fixed Game Loop + Interpolated Render
   │  • Entity Component System (ECS) Core
   │  • Stop-To-Shoot & Virtual Touch Joystick Netcode
   │
   ├── (REST API / HTTPS) ──────────────────────────┐
   │                                                 ▼
   └── (WebSocket / Colyseus) ───────────► [ BACKEND API GATEWAY ]
                                             │  • FastAPI / Express Async
                                             │  • JWT Auth + Anti-Cheat Audit
                                             │  • Server-Authoritative Combat
                                             │
                                             ├───────────────────────────────┐
                                             ▼                               ▼
                                     [ REDIS CACHE ]                 [ POSTGRESQL DB ]
                                     • Session Store                 • Player Inventory
                                     • ELO Leaderboard               • Gear / Talents
                                     • Matchmaking Queue             • Audit Transaction Logs

========================================================================================================
`;

  const sqlSchema = `-- ====================================================================
-- ARCHERO 2 PRODUCTION DATABASE SCHEMA MIGRATION (PostgreSQL 15+)
-- ====================================================================

CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    exp BIGINT NOT NULL DEFAULT 0,
    gold BIGINT NOT NULL DEFAULT 0,
    diamonds INT NOT NULL DEFAULT 0,
    guild_coins INT NOT NULL DEFAULT 0,
    arena_tokens INT NOT NULL DEFAULT 0,
    chapter INT NOT NULL DEFAULT 1,
    tower_floor INT NOT NULL DEFAULT 1,
    pity_epic INT NOT NULL DEFAULT 0,
    pity_legendary INT NOT NULL DEFAULT 0,
    elo INT NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_inventory (
    id VARCHAR(64) PRIMARY KEY,
    player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
    item_name VARCHAR(128) NOT NULL,
    item_type VARCHAR(32) NOT NULL, -- weapon, armor, ring, spirit
    weapon_type VARCHAR(32), -- bow, staff, scythe, crossbow, daggers
    rarity VARCHAR(32) NOT NULL, -- Common, Rare, Epic, Legendary, Mythic
    item_level INT NOT NULL DEFAULT 1,
    stats_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_talents (
    player_id VARCHAR(64) REFERENCES players(id) ON DELETE CASCADE,
    talent_id VARCHAR(64) NOT NULL,
    level INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, talent_id)
);

CREATE TABLE IF NOT EXISTS guilds (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    leader_player_id VARCHAR(64) REFERENCES players(id),
    boss_max_hp BIGINT NOT NULL DEFAULT 50000000,
    boss_current_hp BIGINT NOT NULL DEFAULT 50000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

  const dockerComposeSpec = `version: '3.8'

services:
  game-server:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://archero:secret123@postgres:5432/archero2_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: always

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: archero2_db
      POSTGRES_USER: archero
      POSTGRES_PASSWORD: secret123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
`;

  const openApiSpec = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Archero 2 Game Engine REST API",
    "version": "2.4.0"
  },
  "paths": {
    "/api/player/profile": {
      "get": {
        "summary": "Fetch full player state",
        "responses": { "200": { "description": "OK" } }
      }
    },
    "/api/gacha/roll": {
      "post": {
        "summary": "Server-authoritative Prayer Gacha roll",
        "responses": { "200": { "description": "Rolled Item & Pity" } }
      }
    },
    "/api/blacksmith/fuse": {
      "post": {
        "summary": "Fuse 3 matching gear items into higher rarity",
        "responses": { "200": { "description": "Upgraded Item" } }
      }
    },
    "/api/guild/raid": {
      "post": {
        "summary": "Submit Guild Boss Raid damage",
        "responses": { "200": { "description": "Shared HP State" } }
      }
    }
  }
}`;

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-white animate-fade-in">
      <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-3">
        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-lg">
          <Terminal className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-wide">SYSTEM ARCHITECTURE, DB & INFRA</h2>
          <p className="text-xs text-slate-400">Full Phase 1-5 Architecture Specs, SQL Migrations, Docker & Remote Config</p>
        </div>
      </div>

      {/* Subtab Navigation Buttons */}
      <div className="flex overflow-x-auto space-x-2 border-b border-slate-800/80 pb-2 text-xs font-bold no-scrollbar">
        {[
          { id: 'diagrams', label: 'Architecture Diagram', icon: Cpu },
          { id: 'sql', label: 'SQL Migrations', icon: Database },
          { id: 'openapi', label: 'OpenAPI Specs', icon: Code },
          { id: 'docker', label: 'Docker & Compose', icon: Server },
          { id: 'remote_config', label: 'Live Remote Config', icon: Activity },
          { id: 'audit_logs', label: 'Anti-Cheat Logs', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                activeSubTab === tab.id
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.25)] font-black'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Architecture Diagrams View */}
      {activeSubTab === 'diagrams' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-3 font-mono text-xs text-amber-300 overflow-x-auto shadow-xl backdrop-blur-sm">
          <pre>{asciiArchitecture}</pre>
        </div>
      )}

      {/* SQL Migration Viewer */}
      {activeSubTab === 'sql' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">POSTGRESQL DB MIGRATION SCRIPT</h3>
            <button
              onClick={() => downloadFile('migration.sql', sqlSchema)}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-full text-xs font-black shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD SQL</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto shadow-inner">
            {sqlSchema}
          </pre>
        </div>
      )}

      {/* OpenAPI Spec Inspector */}
      {activeSubTab === 'openapi' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">OPENAPI 3.0 SPECIFICATION JSON</h3>
            <button
              onClick={() => downloadFile('openapi.json', openApiSpec)}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-full text-xs font-black shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD JSON</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto shadow-inner">
            {openApiSpec}
          </pre>
        </div>
      )}

      {/* Docker Spec Inspector */}
      {activeSubTab === 'docker' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">DOCKER-COMPOSE.YML INFRASTRUCTURE SPEC</h3>
            <button
              onClick={() => downloadFile('docker-compose.yml', dockerComposeSpec)}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-full text-xs font-black shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD YML</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto shadow-inner">
            {dockerComposeSpec}
          </pre>
        </div>
      )}

      {/* Live Remote Config Editor */}
      {activeSubTab === 'remote_config' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">LIVE REMOTE CONFIG EDITOR</h3>
          <p className="text-xs text-slate-400">Modify game balancing parameters live without client rebuilds!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Enemy HP Scaling Factor:</label>
              <input
                type="number"
                step="0.01"
                value={remoteConfig.enemyHpScaling || 1.15}
                onChange={e => setRemoteConfig({ ...remoteConfig, enemyHpScaling: parseFloat(e.target.value) })}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold">Epic Gacha Pity Limit:</label>
              <input
                type="number"
                value={remoteConfig.gachaEpicPity || 20}
                onChange={e => setRemoteConfig({ ...remoteConfig, gachaEpicPity: parseInt(e.target.value) })}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 text-white font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {configMessage && (
            <div className="text-xs font-bold p-3 bg-slate-900/90 border border-emerald-500/50 text-emerald-400 rounded-2xl shadow-lg">
              {configMessage}
            </div>
          )}

          <button
            onClick={handleUpdateConfig}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full text-xs uppercase shadow-lg shadow-amber-500/20 active:scale-95"
          >
            PUSH LIVE REMOTE CONFIG
          </button>
        </div>
      )}

      {/* Anti-Cheat Audit Logs */}
      {activeSubTab === 'audit_logs' && (
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">SERVER ANTI-CHEAT AUDIT LOGS</h3>
            <button onClick={fetchAuditLogs} className="p-2 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 max-h-80 overflow-y-auto shadow-inner">
            {auditLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
