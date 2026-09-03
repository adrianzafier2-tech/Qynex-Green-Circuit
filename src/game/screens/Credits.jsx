import React from "react";
import { useGame } from "../GameContext";
import { sfx } from "../audio";
import { MASCOT_IMG, CAR_IMG } from "../data";

export default function Credits() {
  const { setScreen } = useGame();
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-black/60 border-2 border-yellow-400 rounded-lg p-6 text-center">
        <h1 className="font-mono font-black text-3xl text-yellow-400 mb-4">👤 CREDITS</h1>
        <div className="flex items-center justify-center gap-4 mb-6">
          <img src={MASCOT_IMG} alt="Q-LYNX" className="w-24 object-contain" />
          <img src={CAR_IMG} alt="QYNETIC IX RACECAR" className="w-32 object-contain" />
        </div>
        <div className="font-mono text-white/80 text-sm space-y-2 mb-6">
          <p className="text-yellow-400 font-bold text-lg">QYNEX: GREEN CIRCUIT</p>
          <p>Driver: QYNEX Motorsport Mascot</p>
          <p>Car: QYNEX Formula Racing Prototype</p>
          <p className="text-green-400 mt-3">"Engineer the future. Race responsibly."</p>
          <p className="text-white/50 text-xs mt-3">A retro-futuristic engineering & sustainability racing game.</p>
        </div>
        <button onClick={() => { sfx.select(); setScreen("menu"); }}
          className="w-full px-6 py-4 rounded-lg font-mono font-bold text-lg border-4 border-yellow-400 bg-yellow-400 text-black active:scale-95 hover:bg-yellow-300">
          ◀ BACK TO MENU
        </button>
      </div>
    </div>
  );
}
