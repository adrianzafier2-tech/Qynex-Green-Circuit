import React from "react";
import { MASCOT_IMG } from "../data";

const MOODS = {
  idle: { tint: "", anim: "mascot-idle", bubble: null },
  happy: { tint: "", anim: "mascot-bounce", bubble: "Nice one! 🏁" },
  thinking: { tint: "brightness-95", anim: "mascot-think", bubble: "Let me think..." },
  concerned: { tint: "brightness-90 saturate-75", anim: "mascot-shake", bubble: "That's risky..." },
  excited: { tint: "saturate-125", anim: "mascot-bounce", bubble: "Excellent! 🔥" },
  disappointed: { tint: "brightness-80 saturate-50", anim: "mascot-shake", bubble: "Not great..." },
  driving: { tint: "", anim: "mascot-drive", bubble: null },
  celebrating: { tint: "saturate-130", anim: "mascot-bounce", bubble: "We did it! 🎉" },
  victory: { tint: "saturate-150", anim: "mascot-victory", bubble: "CHAMPION! 🏆" },
};

export default function Mascot({ mood = "idle", size = 200, speech, showBubble = true }) {
  const m = MOODS[mood] || MOODS.idle;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${m.anim}`} style={{ width: size, height: size }}>
        <img
          src={file:///E:/Amir%20Adrian%20Zafier/Videos/photo_2026-07-18_21-53-01.jpg}
          alt="QYNEX mascot"
          className={`w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] ${m.tint}`}
          draggable={false}
        />
        {mood === "thinking" && <div className="absolute top-2 right-2 text-2xl animate-pulse">💭</div>}
        {mood === "celebrating" && (
          <>
            <div className="absolute -top-2 left-2 text-xl animate-bounce">🎉</div>
            <div className="absolute -top-2 right-2 text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>✨</div>
          </>
        )}
        {mood === "victory" && (
          <>
            <div className="absolute -top-3 left-0 text-2xl animate-spin-slow">⭐</div>
            <div className="absolute -top-3 right-0 text-2xl animate-spin-slow" style={{ animationDelay: "0.3s" }}>⭐</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl">🏆</div>
          </>
        )}
        {mood === "disappointed" && <div className="absolute top-4 right-4 text-xl">💧</div>}
      </div>
      {showBubble && (speech || m.bubble) && (
        <div className="bg-black/90 border-2 border-yellow-400 text-yellow-300 font-mono text-sm px-3 py-1 rounded-lg max-w-xs text-center">
          {speech || m.bubble}
        </div>
      )}
    </div>
  );
}
