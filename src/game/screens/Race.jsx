import React, { useEffect } from "react";
import { useGame } from "../GameContext";
import RaceEngine, { deriveCarStats } from "../RaceEngine";
import { CHAMPIONSHIP } from "../data";
import { startMusic, stopMusic } from "../audio";

export default function Race() {
  const { state, finishRace, setScreen } = useGame();
  const race = CHAMPIONSHIP[state.raceIndex];
  const carStats = deriveCarStats(state.engineering, state.sustainability);

  useEffect(() => { startMusic("race"); return () => stopMusic(); }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black landscape-game">
      <RaceEngine
        track={race.track}
        carStats={carStats}
        controlScheme={state.settings.controlScheme}
        graphicsQuality={state.settings.graphicsQuality}
        onFinish={(result) => { stopMusic(); finishRace(result); }}
        onExit={() => { stopMusic(); setScreen("menu"); }}
      />
    </div>
  );
}