import React from "react";
import { useGame } from "../GameContext";
import { sfx } from "../audio";

export default function HowToPlay() {
  const { setScreen } = useGame();
  const cards = [
    { icon: "🔧", title: "ENGINEERING", desc: "Improves your car's speed, acceleration, handling and reliability. Higher engineering = faster car." },
    { icon: "♻️", title: "SUSTAINABILITY", desc: "Improves energy efficiency and resource use. Higher sustainability = less energy consumed." },
    { icon: "⚖️", title: "BALANCE", desc: "Keep Engineering and Sustainability close together. Excellent balance earns big bonus points!" },
    { icon: "🏆", title: "PERFORMANCE POINTS", desc: "Earned from race positions, good decisions, and bonuses. They decide the championship." },
    { icon: "⚡", title: "ENERGY", desc: "Starts at 100 each race. Aggressive driving drains it faster. Run out and you slow down." },
    { icon: "❤️", title: "CAR HEALTH", desc: "Crashes damage your car. Hit zero and you DNF (Did Not Finish)." },
    { icon: "📱", title: "CONTROLS", desc: "Hold GAS to accelerate, BRAKE to slow, ◀ ▶ to steer. Or switch to DRAG steering in Settings." },
    { icon: "🧠", title: "DECISIONS", desc: "Before each race, make engineering choices. Every choice changes Engineering & Sustainability. Think!" },
  ];
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-mono font-black text-3xl sm:text-5xl text-yellow-400 text-center mb-2">📖 HOW TO PLAY</h1>
        <p className="text-center font-mono text-green-400 text-sm mb-6">Learn the balance. Win the championship.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((c) => (
            <div key={c.title} className="bg-black/60 border-2 border-yellow-400/40 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{c.icon}</span>
                <h3 className="font-mono font-bold text-yellow-400">{c.title}</h3>
              </div>
              <p className="text-white/80 text-sm font-mono">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 bg-gradient-to-r from-green-900/60 to-yellow-900/40 border-2 border-green-400 rounded-lg p-5 text-center">
          <p className="font-mono text-white text-base sm:text-lg">"The fastest solution isn't always the smartest solution."</p>
          <p className="font-mono text-yellow-400 text-sm mt-2">Win by finding the balance between performance and sustainability.</p>
        </div>
        <button onClick={() => { sfx.select(); setScreen("menu"); }}
          className="mt-6 w-full max-w-xs mx-auto block px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 transition-all hover:bg-yellow-300">
          ◀ BACK TO MENU
        </button>
      </div>
    </div>
  );
}