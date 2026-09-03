import React, { useEffect } from "react";
import { useGame } from "../GameContext";
import Mascot from "../components/Mascot";
import { CAR_IMG } from "../data";
import { startMusic, sfx } from "../audio";

export default function MainMenu() {
  const { state, setScreen, newChampionship, continueGame } = useGame();

  useEffect(() => { startMusic("menu"); }, []);

  const handle = (fn) => () => { sfx.select(); fn(); };

  const menuBtn = (label, onClick, accent = "yellow") => (
    <button
      onClick={onClick}
      onMouseEnter={() => sfx.click()}
      className={`w-full px-6 py-4 rounded-lg font-mono font-bold text-lg sm:text-xl border-4 active:scale-95 transition-all
        ${accent === "yellow" ? "bg-yellow-400 text-black border-yellow-200 hover:bg-yellow-300"
          : accent === "green" ? "bg-green-600 text-white border-green-400 hover:bg-green-500"
          : "bg-black/70 text-yellow-400 border-yellow-400 hover:bg-black/90"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#1a1a2e] to-[#0a3d0a]">
      <div className="absolute inset-0 opacity-20 pointer-events-none retro-grid" />
      <div className="absolute inset-0 pointer-events-none scanlines" />

      <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl w-full">
        <div className="text-center">
          <h1 className="font-mono font-black text-5xl sm:text-7xl text-yellow-400 tracking-tight drop-shadow-[0_0_25px_rgba(253,216,53,0.6)]">QYNEX</h1>
          <h2 className="font-mono font-bold text-2xl sm:text-4xl text-white tracking-[0.2em] mt-1">GREEN CIRCUIT</h2>
          <p className="font-mono text-xs sm:text-sm text-green-400 mt-2 tracking-widest">ENGINEER THE FUTURE. RACE RESPONSIBLY.</p>
        </div>

        <div className="flex items-end justify-center gap-2 sm:gap-6 my-2">
          <Mascot mood="idle" size={160} showBubble={false} />
          <img src={CAR_IMG} alt="QYNEX race car" className="w-32 sm:w-48 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-car-float" draggable={false} />
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3">
          {state.hasSave && (
            <button onClick={handle(continueGame)} onMouseEnter={() => sfx.click()}
              className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg sm:text-xl border-4 border-green-400 bg-green-600 text-white active:scale-95 transition-all hover:bg-green-500">
              ▶ CONTINUE CHAMPIONSHIP
            </button>
          )}
          {menuBtn("🏁 START CHAMPIONSHIP", handle(newChampionship), "yellow")}
          {menuBtn("📖 HOW TO PLAY", handle(() => setScreen("howto")))}
          {menuBtn("🏆 LEADERBOARD", handle(() => setScreen("leaderboard")))}
          {menuBtn("⚙️ SETTINGS", handle(() => setScreen("settings")))}
          {menuBtn("👤 CREDITS", handle(() => setScreen("credits")))}
        </div>

        <div className="mt-4 text-center">
          <div className="font-mono text-[10px] text-white/40">v1.0 • 5-RACE CHAMPIONSHIP • TOUCHSCREEN READY</div>
        </div>
      </div>
    </div>
  );
}