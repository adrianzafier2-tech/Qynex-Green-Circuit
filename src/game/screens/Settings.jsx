import React from "react";
import { useGame } from "../GameContext";
import { sfx, setMusicVolume, setSfxVolume } from "../audio";

export default function Settings() {
  const { state, setSettings, setScreen, resetChampionship } = useGame();
  const s = state.settings;

  const set = (patch) => {
    sfx.click();
    setSettings(patch);
    if (patch.musicVolume !== undefined) setMusicVolume(patch.musicVolume);
    if (patch.sfxVolume !== undefined) setSfxVolume(patch.sfxVolume);
  };

  const Slider = ({ label, value, onChange, color = "#FDD835" }) => (
    <div className="mb-4">
      <div className="flex justify-between font-mono text-sm text-white mb-1">
        <span>{label}</span><span style={{ color }}>{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-3 accent-yellow-400" />
    </div>
  );

  const Toggle = (label, valA, valB, current, onPick) => (
    <div className="mb-6">
      <h3 className="font-mono font-bold text-white mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {[valA, valB].map((v) => (
          <button key={v} onClick={() => onPick(v)}
            className={`px-4 py-3 rounded font-mono font-bold border-2 ${current === v ? "bg-yellow-400 text-black border-yellow-200" : "bg-black/50 text-white border-white/30"}`}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-black/60 border-2 border-yellow-400 rounded-lg p-6">
        <h1 className="font-mono font-black text-3xl text-yellow-400 text-center mb-6">⚙️ SETTINGS</h1>
        {Toggle("🎮 CONTROLS", "BUTTON", "DRAG", s.controlScheme.toUpperCase(), (v) => set({ controlScheme: v.toLowerCase() }))}
        <Slider label="🔊 MUSIC VOLUME" value={s.musicVolume} onChange={(v) => set({ musicVolume: v })} />
        <Slider label="🔊 SOUND EFFECTS" value={s.sfxVolume} onChange={(v) => set({ sfxVolume: v })} color="#2E7D32" />
        {Toggle("✨ GRAPHICS", "HIGH", "LOW", s.graphicsQuality.toUpperCase(), (v) => set({ graphicsQuality: v.toLowerCase() }))}
        <button onClick={() => { sfx.bad(); if (confirm("Reset all championship progress?")) resetChampionship(); }}
          className="w-full px-4 py-3 rounded font-mono font-bold border-2 border-red-500 bg-red-900/50 text-red-300 mb-6 active:scale-95">
          🔄 RESET CHAMPIONSHIP
        </button>
        <button onClick={() => { sfx.select(); setScreen("menu"); }}
          className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
          ◀ BACK TO MENU
        </button>
      </div>
    </div>
  );
}