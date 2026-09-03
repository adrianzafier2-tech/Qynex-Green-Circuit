import React, { useEffect, useState } from "react";
import { useGame } from "../GameContext";
import Mascot from "../components/Mascot";
import { CAR_IMG, finalRating } from "../data";
import { sfx, startMusic, stopMusic } from "../audio";

export default function Finale() {
  const { state, setScreen, resetChampionship } = useGame();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    startMusic("menu");
    setTimeout(() => sfx.victory(), 600);
    const t = setTimeout(() => setStage(1), 2500);
    return () => clearTimeout(t);
  }, []);

  const diff = Math.abs(state.engineering - state.sustainability);
  const rating = finalRating(state.engineering, state.sustainability, state.performancePoints, diff);
  const bestLap = state.bestLapTimes.filter(Boolean).sort((a, b) => a - b)[0];
  const playerStandings = [
    { name: "QYNEX MOTORSPORT", points: state.performancePoints, isPlayer: true },
    ...state.championshipStandings,
  ].sort((a, b) => b.points - a.points);
  const finalPos = playerStandings.findIndex((s) => s.isPlayer) + 1;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a0033] via-[#0a0a0a] to-[#0a3d0a] p-4 sm:p-8 flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
      <div className="absolute inset-0 opacity-10 pointer-events-none retro-grid" />
      <div className="relative z-10 max-w-lg w-full text-center">
        {stage === 0 ? (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <Mascot mood="victory" size={220} showBubble={false} />
            <img src={CAR_IMG} alt="QYNEX car" className="w-48 object-contain animate-car-float" draggable={false} />
            <h1 className="font-mono font-black text-4xl sm:text-6xl text-yellow-400 drop-shadow-[0_0_25px_rgba(253,216,53,0.7)]">🏆 CHAMPIONSHIP COMPLETE</h1>
            <p className="font-mono text-green-400 tracking-widest">QYNEX GREEN CIRCUIT</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <Mascot mood="celebrating" size={140} showBubble={false} />
            <h1 className="font-mono font-black text-3xl sm:text-4xl text-yellow-400 mt-4 mb-1">🏆 FINAL RESULTS</h1>
            <div className="font-mono text-white/60 text-sm mb-4">QYNEX GREEN CIRCUIT CHAMPIONSHIP</div>
            <div className="bg-gradient-to-r from-yellow-900/50 to-green-900/50 border-4 border-yellow-400 rounded-xl p-5 mb-4">
              <div className="text-5xl mb-2">{rating.emoji}</div>
              <div className="font-mono font-black text-2xl text-yellow-400">{rating.title}</div>
              <div className="font-mono text-white/80 text-sm mt-1">{rating.desc}</div>
            </div>
            <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-5 mb-4 text-left">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                <Stat label="FINAL POSITION" value={`${finalPos}${ordinal(finalPos)}`} />
                <Stat label="TOTAL POINTS" value={state.performancePoints.toLocaleString()} />
                <Stat label="BEST RACE" value={state.bestRace ? `${state.bestRace}${ordinal(state.bestRace)}` : "-"} />
                <Stat label="BEST LAP" value={bestLap ? formatTime(bestLap) : "-"} />
                <Stat label="ENGINEERING" value={state.engineering} />
                <Stat label="SUSTAINABILITY" value={state.sustainability} />
                <Stat label="BALANCE DIFF" value={diff} />
                <Stat label="CLEAN RACES" value={state.cleanRaces} />
                <Stat label="ECO RACES" value={state.ecoRaces} />
              </div>
            </div>
            <div className="bg-black/60 border-2 border-green-400 rounded-xl p-4 mb-6">
              <p className="font-mono text-white text-sm">🏎️ ENGINEER THE FUTURE. ♻️ RACE RESPONSIBLY.</p>
              <p className="font-mono text-yellow-400 font-bold text-base mt-1">⚖️ FIND THE BALANCE. 🏆 WIN THE CHAMPIONSHIP.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { sfx.select(); resetChampionship(); }}
                className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
                🏁 NEW CHAMPIONSHIP
              </button>
              <button onClick={() => { sfx.click(); setScreen("menu"); stopMusic(); }}
                className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-white/40 bg-black/50 text-white active:scale-95">
                ← MAIN MENU
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return <div className="flex justify-between border-b border-white/10 py-1"><span className="text-white/60">{label}</span><span className="text-yellow-400 font-bold">{value}</span></div>;
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
function formatTime(ms) { const total = ms / 1000; const m = Math.floor(total / 60); const s = (total % 60).toFixed(2); return `${String(m).padStart(2, "0")}:${s.padStart(5, "0")}`; }