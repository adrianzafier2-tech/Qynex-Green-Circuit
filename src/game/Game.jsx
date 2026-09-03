import React, { useEffect } from "react";
import { GameProvider, useGame } from "./GameContext";
import { resumeAudio } from "./audio";
import MainMenu from "./screens/MainMenu";
import HowToPlay from "./screens/HowToPlay";
import Settings from "./screens/Settings";
import Credits from "./screens/Credits";
import Leaderboard from "./screens/Leaderboard";
import PreRace from "./screens/PreRace";
import Race from "./screens/Race";
import Results from "./screens/Results";
import Finale from "./screens/Finale";

function Screens() {
  const { state } = useGame();
  useEffect(() => {
    const handler = () => resumeAudio();
    window.addEventListener("pointerdown", handler, { once: true });
    return () => window.removeEventListener("pointerdown", handler);
  }, []);

  switch (state.screen) {
    case "menu": return <MainMenu />;
    case "howto": return <HowToPlay />;
    case "settings": return <Settings />;
    case "credits": return <Credits />;
    case "leaderboard": return <Leaderboard />;
    case "prerace": return <PreRace />;
    case "race": return <Race />;
    case "results": return <Results />;
    case "finale": return <Finale />;
    default: return <MainMenu />;
  }
}

export default function Game() {
  return (
    <GameProvider>
      <div className="qynex-game w-full h-full">
        <Screens />
      </div>
    </GameProvider>
  );
}