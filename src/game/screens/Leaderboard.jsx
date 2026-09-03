import React from "react";
import { useGame } from "../GameContext";
import { sfx } from "../audio";

export default function Leaderboard() {
  const { state, setScreen } = useGame();
  const entries = [
    { name: "QYNEX MOTORSPORT", color: "#FF9B33", points: state.performancePoints, isPlayer: true },
    ...state.championshipStandings,
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-lg w-full bg-black/60 border-2 border-yellow-400 rounded-lg p-6">
        <h1 className="font-mono font-black text-3xl text-yellow-400 text-center mb-6">🏆 LEADERBOARD</h1>
        <div className="space-y-2">
          {entries.map((e, i) => (
            <div key={e.name} className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${e.isPlayer ? "bg-yellow-400/20 border-yellow-400" : "bg-black/40 border-white/20"}`}>
              <span className="font-mono font-black text-2xl w-10 text-center" style={{ color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#fff" }}>{i + 1}</span>
              <span className="w-4 h-4 rounded-full" style={{ background: e.color }} />
              <span className={`flex-1 font-mono font-bold ${e.isPlayer ? "text-yellow-400" : "text-white"}`}>{e.name}</span>
              <span className="font-mono font-bold text-white">{e.points.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <p className="text-center font-mono text-white/40 text-xs mt-4">Performance Points across the championship</p>
        <button onClick={() => { sfx.select(); setScreen("menu"); }}
          className="mt-6 w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
          ◀ BACK TO MENU
        </button>
      </div>
    </div>
  );
}