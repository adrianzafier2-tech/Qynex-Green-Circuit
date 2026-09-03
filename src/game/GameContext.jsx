import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { AI_TEAMS, CHAMPIONSHIP, PLAYER_TEAM } from "./data";
import { sfx } from "./audio";

const STORAGE_KEY = "qynex_green_circuit_save_v1";

const defaultSettings = {
  controlScheme: "buttons", // 'buttons' | 'drag'
  musicVolume: 0.35,
  sfxVolume: 0.6,
  graphicsQuality: "high", // 'high' | 'low'
};

const initialState = {
  screen: "menu",
  hasSave: false,
  raceIndex: 0,
  engineering: 50,
  sustainability: 50,
  performancePoints: 0,
  championshipStandings: AI_TEAMS.map((t, i) => ({ name: t.name, color: t.color, points: 0 })),
  bestLapTimes: [],
  bestRace: null,
  cleanRaces: 0,
  ecoRaces: 0,
  lastResult: null,
  settings: defaultSettings,
  decisionsUsed: [],
  tutorialDone: false,
};

function freshStandings() {
  return AI_TEAMS.map((t) => ({ name: t.name, color: t.color, points: 0 }));
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "NEW_CHAMPIONSHIP":
      return {
        ...initialState,
        settings: state.settings,
        tutorialDone: state.tutorialDone,
        screen: "prerace",
        raceIndex: 0,
        engineering: 50,
        sustainability: 50,
        performancePoints: 0,
        championshipStandings: freshStandings(),
        hasSave: true,
      };
    case "CONTINUE":
      return { ...state, screen: "prerace" };
    case "APPLY_DECISION": {
      const { eng, sus, perf, id } = action.d;
      const engineering = clamp(state.engineering + eng);
      const sustainability = clamp(state.sustainability + sus);
      const performancePoints = state.performancePoints + perf;
      return { ...state, engineering, sustainability, performancePoints, decisionsUsed: [...state.decisionsUsed, id] };
    }
    case "START_RACE":
      return { ...state, screen: "race" };
    case "FINISH_RACE": {
      const r = action.result;
      const eng = clamp(state.engineering + (r.engDelta || 0));
      const sus = clamp(state.sustainability + (r.susDelta || 0));
      let standings = state.championshipStandings.map((s) => ({ ...s }));
      // AI teams earn points based on difficulty + randomness
      const aiPoints = AI_TEAMS.map((t, i) => {
        const base = 80 + Math.round(t.speed * 60) + Math.floor(Math.random() * 80);
        return base;
      });
      // sort ai points desc, assign position points
      const sortedAi = aiPoints.map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
      const POSITION_POINTS = [300, 250, 200, 150, 100, 50, 25, 0];
      // player position among 8 cars
      const playerPos = r.position; // 1-8
      sortedAi.forEach((entry, idx) => {
        const aiPos = idx < playerPos - 1 ? idx + 1 : idx + 2; // shift for player
        const pts = POSITION_POINTS[Math.min(aiPos - 1, POSITION_POINTS.length - 1)] || 0;
        standings[entry.i].points += pts;
      });
      // player points added separately in performancePoints
      const performancePoints = state.performancePoints + r.totalPoints;
      const bestLapTimes = [...state.bestLapTimes];
      if (r.bestLapMs) bestLapTimes[state.raceIndex] = r.bestLapMs;
      const isLast = state.raceIndex >= CHAMPIONSHIP.length - 1;
      return {
        ...state,
        engineering: eng,
        sustainability: sus,
        performancePoints,
        championshipStandings: standings,
        lastResult: r,
        bestLapTimes,
        bestRace: !state.bestRace || r.position < state.bestRace ? r.position : state.bestRace,
        cleanRaces: state.cleanRaces + (r.cleanRace ? 1 : 0),
        ecoRaces: state.ecoRaces + (r.ecoLap ? 1 : 0),
        screen: "results",
        raceIndex: isLast ? state.raceIndex : state.raceIndex,
        nextScreen: isLast ? "finale" : "prerace",
      };
    }
    case "ADVANCE":
      if (state.nextScreen === "finale") return { ...state, screen: "finale" };
      return { ...state, screen: "prerace", raceIndex: Math.min(state.raceIndex + 1, CHAMPIONSHIP.length - 1) };
    case "SET_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case "RESET_CHAMPIONSHIP":
      return { ...initialState, settings: state.settings, screen: "menu" };
    case "TUTORIAL_DONE":
      return { ...state, tutorialDone: true };
    case "LOAD":
      return { ...action.state, settings: { ...defaultSettings, ...(action.state.settings || {}) } };
    default:
      return state;
  }
}

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "LOAD", state: { ...parsed, screen: "menu", hasSave: parsed.raceIndex > 0 || parsed.performancePoints > 0 } });
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const toSave = { ...state, screen: undefined };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [state]);

  const setScreen = useCallback((screen) => dispatch({ type: "SET_SCREEN", screen }), []);
  const newChampionship = useCallback(() => dispatch({ type: "NEW_CHAMPIONSHIP" }), []);
  const continueGame = useCallback(() => dispatch({ type: "CONTINUE" }), []);
  const applyDecision = useCallback((d) => dispatch({ type: "APPLY_DECISION", d }), []);
  const startRace = useCallback(() => dispatch({ type: "START_RACE" }), []);
  const finishRace = useCallback((result) => dispatch({ type: "FINISH_RACE", result }), []);
  const advance = useCallback(() => dispatch({ type: "ADVANCE" }), []);
  const setSettings = useCallback((settings) => dispatch({ type: "SET_SETTINGS", settings }), []);
  const resetChampionship = useCallback(() => dispatch({ type: "RESET_CHAMPIONSHIP" }), []);

  return (
    <GameContext.Provider
      value={{ state, setScreen, newChampionship, continueGame, applyDecision, startRace, finishRace, advance, setSettings, resetChampionship, sfx }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}