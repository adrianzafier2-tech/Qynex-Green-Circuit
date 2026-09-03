import React, { useState, useMemo } from "react";
import { useGame } from "../GameContext";
import Mascot from "../components/Mascot";
import StatBar from "../components/StatBar";
import { CAR_IMG, CHAMPIONSHIP, SCENARIOS, balanceReward } from "../data";
import { sfx, startMusic } from "../audio";

export default function PreRace() {
  const { state, applyDecision, startRace } = useGame();
  const race = CHAMPIONSHIP[state.raceIndex];
  const [phase, setPhase] = useState("intro");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [result, setResult] = useState(null);
  const [mascotMood, setMascotMood] = useState("idle");

  const scenarios = useMemo(() => {
    const pool = SCENARIOS.filter((s) => !state.decisionsUsed.includes(s.id));
    const src = pool.length >= 3 ? pool : SCENARIOS;
    const shuffled = [...src].sort((a, b) => {
      const ha = (a.id.charCodeAt(0) + state.raceIndex * 7) % 100;
      const hb = (b.id.charCodeAt(0) + state.raceIndex * 7) % 100;
      return ha - hb;
    });
    return shuffled.slice(0, 3);
  }, [state.raceIndex, state.decisionsUsed]);

  const diff = Math.abs(state.engineering - state.sustainability);
  const balance = balanceReward(diff);

  const handleChoice = (choice) => {
    applyDecision({ id: scenarios[scenarioIdx].id, eng: choice.eng, sus: choice.sus, perf: choice.perf });
    setResult({ choice, scenario: scenarios[scenarioIdx] });
    if (choice.balanced) { setMascotMood("excited"); sfx.excellent(); }
    else if (choice.perf < 0) { setMascotMood("disappointed"); sfx.bad(); }
    else { setMascotMood("happy"); sfx.good(); }
  };

  const nextScenario = () => {
    if (scenarioIdx < scenarios.length - 1) {
      setScenarioIdx(scenarioIdx + 1);
      setResult(null);
      setMascotMood("thinking");
    } else {
      setPhase("ready");
      setMascotMood("idle");
      sfx.select();
    }
  };

  if (phase === "intro") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a3d0a] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-10 pointer-events-none retro-grid" />
        <div className="relative z-10 max-w-2xl w-full text-center">
          <div className="font-mono text-green-400 text-sm tracking-widest">RACE {state.raceIndex + 1} OF {CHAMPIONSHIP.length}</div>
          <h1 className="font-mono font-black text-4xl sm:text-6xl text-yellow-400 mt-1 mb-2">{race.emoji} {race.track.name}</h1>
          <p className="font-mono text-white/70 text-sm mb-6">{race.blurb}</p>
          <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-6 mb-4">
            <div className="font-mono text-yellow-400 text-sm mb-2">🏎️ QYNEX FORMULA RACING PROTOTYPE</div>
            <img src={CAR_IMG} alt="QYNEX car" className="w-56 sm:w-72 mx-auto object-contain animate-car-float my-2" draggable={false} />
            <div className="flex justify-center gap-6 my-4">
              <Mascot mood="idle" size={120} showBubble={false} />
              <div className="flex-1 max-w-xs space-y-3 text-left">
                <StatBar label="ENGINEERING" icon="🔧" value={state.engineering} color="#FF9B33" />
                <StatBar label="SUSTAINABILITY" icon="♻️" value={state.sustainability} color="#2E7D32" />
                <div className="flex justify-between font-mono text-sm text-white">
                  <span>🏆 PERFORMANCE</span><span className="text-yellow-400 font-bold">{state.performancePoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-mono text-sm text-white">
                  <span>⚖️ BALANCE</span><span className="text-green-400 font-bold">{balance.label}</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={() => { sfx.select(); setPhase("decisions"); setMascotMood("thinking"); startMusic("race"); }}
            className="w-full max-w-sm mx-auto px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
            🔧 PREPARE THE CAR →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "decisions") {
    const sc = scenarios[scenarioIdx];
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-4">
            <div className="font-mono text-yellow-400 text-xs tracking-widest">ENGINEERING DECISION {scenarioIdx + 1}/{scenarios.length}</div>
            <div className="font-mono text-white/50 text-xs">{sc.topic}</div>
          </div>
          <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-5 mb-4">
            <h2 className="font-mono font-bold text-xl text-yellow-400 mb-2">{sc.title}</h2>
            <p className="font-mono text-white/80 text-sm mb-4">{sc.prompt}</p>
            <div className="grid grid-cols-1 gap-3">
              {sc.choices.map((c, i) => (
                <button key={i} disabled={!!result} onClick={() => handleChoice(c)}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${result ? "border-white/20 opacity-60" : "border-yellow-400/50 bg-black/40 hover:border-yellow-400 hover:bg-black/60 active:scale-[0.98]"}`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-mono font-bold text-white">{c.label}</div>
                      <div className="font-mono text-xs text-white/60">{c.desc}</div>
                    </div>
                    <div className="font-mono text-xs flex flex-col items-end gap-0.5 shrink-0">
                      <span className={c.eng >= 0 ? "text-orange-400" : "text-red-400"}>🔧 {c.eng >= 0 ? "+" : ""}{c.eng}</span>
                      <span className={c.sus >= 0 ? "text-green-400" : "text-red-400"}>♻️ {c.sus >= 0 ? "+" : ""}{c.sus}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Mascot mood={mascotMood} size={110} showBubble={false} />
            {result && (
              <div className="w-full max-w-lg bg-black/70 border-2 border-green-400 rounded-lg p-4 animate-fade-in">
                <p className="font-mono text-white text-sm text-center mb-3">{result.choice.consequence}</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <StatBar label="ENGINEERING" icon="🔧" value={state.engineering} color="#FF9B33" />
                  <StatBar label="SUSTAINABILITY" icon="♻️" value={state.sustainability} color="#2E7D32" />
                </div>
                {result.choice.delayed && <p className="font-mono text-yellow-400 text-xs text-center mb-2">⏳ {result.choice.delayed}</p>}
                <button onClick={nextScenario}
                  className="w-full px-4 py-3 rounded-lg font-mono font-bold border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
                  {scenarioIdx < scenarios.length - 1 ? "NEXT DECISION →" : "TO THE GRID →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a3d0a] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full text-center">
        <div className="font-mono text-green-400 text-sm tracking-widest mb-1">QYNEX MOTORSPORT</div>
        <h1 className="font-mono font-black text-3xl sm:text-5xl text-yellow-400 mb-4">{race.emoji} {race.track.name}</h1>
        <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-5 mb-4">
          <div className="flex justify-center gap-4 mb-4">
            <Mascot mood="driving" size={100} showBubble={false} />
            <img src={CAR_IMG} alt="QYNEX car" className="w-32 object-contain animate-car-float" draggable={false} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-left mb-4">
            <StatBar label="ENGINEERING" icon="🔧" value={state.engineering} color="#FF9B33" />
            <StatBar label="SUSTAINABILITY" icon="♻️" value={state.sustainability} color="#2E7D32" />
            <StatBar label="ENERGY" icon="⚡" value={100} color="#FDD835" animate={false} />
            <StatBar label="CAR HEALTH" icon="❤️" value={100} color="#E6332A" animate={false} />
          </div>
          <div className="flex justify-between font-mono text-sm text-white border-t border-white/20 pt-3">
            <span>🏆 PERFORMANCE</span><span className="text-yellow-400 font-bold">{state.performancePoints.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-mono text-sm text-white mt-1">
            <span>🏁 LAPS</span><span className="text-white font-bold">{race.track.laps}</span>
          </div>
        </div>
        <h2 className="font-mono font-bold text-2xl text-white mb-4">READY TO RACE?</h2>
        <button onClick={() => { sfx.go(); startRace(); }}
          className="w-full max-w-sm mx-auto px-8 py-5 rounded-lg font-mono font-black text-2xl border-4 border-green-400 bg-green-600 text-white active:scale-95 hover:bg-green-500 animate-pulse">
          🏁 START RACE
        </button>
      </div>
    </div>
  );
}