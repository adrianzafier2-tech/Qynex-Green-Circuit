import React, { useState, useEffect } from "react";
import { useGame } from "../GameContext";
import Mascot from "../components/Mascot";
import { CHAMPIONSHIP, balanceReward, BONUS_POINTS } from "../data";
import { sfx, startMusic } from "../audio";

export default function Results() {
  const { state, advance } = useGame();
  const r = state.lastResult;
  const [showStandings, setShowStandings] = useState(false);
  useEffect(() => { startMusic("menu"); }, []);

  if (!r) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white"><button onClick={advance} className="font-mono text-yellow-400">Continue</button></div>;
  }

  const diff = Math.abs(state.engineering - state.sustainability);
  const balance = balanceReward(diff);
  const isLast = state.raceIndex >= CHAMPIONSHIP.length - 1;
  const bonuses = [];
  if (r.cleanRace) bonuses.push(BONUS_POINTS.cleanRace);
  if (r.ecoLap) bonuses.push(BONUS_POINTS.ecoLap);
  if (r.perfectLap) bonuses.push(BONUS_POINTS.perfectLap);
  if (r.energyMaster) bonuses.push(BONUS_POINTS.energyMaster);
  bonuses.push(balance);
  const mood = r.dnf ? "disappointed" : r.position <= 3 ? "celebrating" : "happy";
  const lapTimeStr = r.bestLapMs ? formatTime(r.bestLapMs) : "--:--.--";
  const standings = [
    { name: "QYNEX MOTORSPORT", color: "#FF9B33", points: state.performancePoints, isPlayer: true },
    ...state.championshipStandings,
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a3d0a] p-4 sm:p-8 flex items-center justify-center overflow-y-auto">
      <div className="max-w-lg w-full">
        <div className="text-center mb-4">
          <h1 className="font-mono font-black text-4xl sm:text-5xl text-yellow-400">{r.dnf ? "💥 DNF" : "🏁 RACE COMPLETE"}</h1>
          <div className="font-mono text-white/60 text-sm">{CHAMPIONSHIP[state.raceIndex].track.name}</div>
        </div>
        <div className="flex justify-center mb-4"><Mascot mood={mood} size={120} showBubble={false} /></div>
        <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <Row label="POSITION" value={r.dnf ? "DNF" : `${r.position}${ordinal(r.position)}`} highlight />
            <Row label="BEST LAP" value={lapTimeStr} />
            <Row label="ENERGY LEFT" value={`${r.energyRemaining}%`} />
            <Row label="CAR HEALTH" value={`${r.healthRemaining}%`} />
          </div>
        </div>
        <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-5 mb-4">
          <div className="font-mono font-bold text-yellow-400 text-sm mb-3">POINTS BREAKDOWN</div>
          <Line label="🏁 Race Position" value={r.racePoints} />
          <Line label="✅ Race Completion" value={100} />
          {bonuses.map((b, i) => <Line key={i} label={`${b.emoji} ${b.label}`} value={b.points} />)}
          <div className="border-t border-white/30 mt-2 pt-2 flex justify-between font-mono font-bold text-lg">
            <span className="text-white">TOTAL EARNED</span><span className="text-yellow-400">+{r.totalPoints.toLocaleString()}</span>
          </div>
        </div>
        {!showStandings ? (
          <button onClick={() => { sfx.select(); setShowStandings(true); }}
            className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
            🏆 CHAMPIONSHIP STANDING →
          </button>
        ) : (
          <div className="bg-black/60 border-2 border-green-400 rounded-xl p-5 mb-4">
            <div className="font-mono font-bold text-green-400 text-sm mb-3">CHAMPIONSHIP STANDINGS</div>
            <div className="space-y-1.5">
              {standings.map((e, i) => (
                <div key={e.name} className={`flex items-center gap-2 px-3 py-2 rounded ${e.isPlayer ? "bg-yellow-400/20" : ""}`}>
                  <span className="font-mono font-bold w-6 text-center" style={{ color: i === 0 ? "#FFD700" : "#fff" }}>{i + 1}</span>
                  <span className="w-3 h-3 rounded-full" style={{ background: e.color }} />
                  <span className={`flex-1 font-mono text-sm ${e.isPlayer ? "text-yellow-400 font-bold" : "text-white"}`}>{e.name}</span>
                  <span className="font-mono text-sm text-white">{e.points.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { sfx.go(); advance(); }}
              className="w-full mt-4 px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-green-400 bg-green-600 text-white active:scale-95 hover:bg-green-500">
              {isLast ? "🏆 TO THE FINALE →" : "➡ NEXT RACE →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return <div className={`flex justify-between ${highlight ? "text-yellow-400 font-bold text-lg" : "text-white"}`}><span>{label}</span><span>{value}</span></div>;
}
function Line({ label, value }) {
  const neg = value < 0;
  return <div className="flex justify-between font-mono text-sm py-0.5"><span className="text-white/80">{label}</span><span className={neg ? "text-red-400" : "text-green-400"}>{neg ? "" : "+"}{value}</span></div>;
}
function ordinal(n) { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
function formatTime(ms) { const total = ms / 1000; const m = Math.floor(total / 60); const s = (total % 60).toFixed(2); return `${String(m).padStart(2, "0")}:${s.padStart(5, "0")}`; }