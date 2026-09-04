import { catmullRomClosed, buildPath } from "./trackUtils";

// Official QYNEX assets (uploaded references).
/*** export const MASCOT_IMG =
  "photo_2026-07-18_21-53-01.jpg";
export const CAR_IMG =
  "photo_2026-09-04_06-03-08.jpg";
***/
export const MASCOT_IMG = "../../photo_2026-07-18_21-53-01.jpg";
export const CAR_IMG = "../../photo_2026-07-19-04-06-08.jpg";

// ---- Tracks ----
// Each track: control points -> smoothed centerline path. Coordinate space ~3000.
function makeTrack(controlPoints, opts = {}) {
  const pts = catmullRomClosed(controlPoints, 18);
  return {
    path: buildPath(pts),
    trackWidth: opts.trackWidth || 150,
    barrierWidth: opts.barrierWidth || 190,
    ...opts,
  };
}

const T1 = makeTrack(
  [
    { x: 600, y: 500 }, { x: 1500, y: 420 }, { x: 2400, y: 520 },
    { x: 2550, y: 1000 }, { x: 2200, y: 1500 }, { x: 1500, y: 1580 },
    { x: 800, y: 1500 }, { x: 500, y: 1000 },
  ],
  { name: "QYNEX TEST CIRCUIT", laps: 3, difficulty: 0.92, theme: "test" }
);

const T2 = makeTrack(
  [
    { x: 500, y: 600 }, { x: 1200, y: 400 }, { x: 1900, y: 600 },
    { x: 2300, y: 1000 }, { x: 2100, y: 1500 }, { x: 1500, y: 1700 },
    { x: 1000, y: 1450 }, { x: 700, y: 1700 }, { x: 400, y: 1200 },
  ],
  { name: "GREEN VALLEY", laps: 3, difficulty: 0.96, theme: "valley" }
);

const T3 = makeTrack(
  [
    { x: 600, y: 500 }, { x: 1100, y: 700 }, { x: 1500, y: 450 },
    { x: 1900, y: 700 }, { x: 2400, y: 600 }, { x: 2600, y: 1100 },
    { x: 2200, y: 1400 }, { x: 1700, y: 1300 }, { x: 1400, y: 1600 },
    { x: 900, y: 1500 }, { x: 500, y: 1200 }, { x: 700, y: 850 },
  ],
  { name: "METRO GRAND PRIX", laps: 4, difficulty: 1.0, theme: "metro" }
);

const T4 = makeTrack(
  [
    { x: 500, y: 700 }, { x: 1000, y: 400 }, { x: 1600, y: 500 },
    { x: 2200, y: 400 }, { x: 2700, y: 800 }, { x: 2500, y: 1300 },
    { x: 2000, y: 1500 }, { x: 1500, y: 1300 }, { x: 1100, y: 1600 },
    { x: 600, y: 1500 }, { x: 350, y: 1100 },
  ],
  { name: "ECO RING", laps: 4, difficulty: 1.04, theme: "eco" }
);

const T5 = makeTrack(
  [
    { x: 600, y: 450 }, { x: 1300, y: 380 }, { x: 1900, y: 550 },
    { x: 2400, y: 420 }, { x: 2750, y: 850 }, { x: 2500, y: 1250 },
    { x: 2000, y: 1150 }, { x: 1800, y: 1550 }, { x: 1300, y: 1700 },
    { x: 850, y: 1450 }, { x: 1000, y: 1050 }, { x: 500, y: 1100 },
    { x: 400, y: 700 },
  ],
  { name: "QYNEX WORLD FINALE", laps: 5, difficulty: 1.1, theme: "finale" }
);

export const CHAMPIONSHIP = [
  { index: 0, track: T1, emoji: "🏁", blurb: "Prove the concept. Learn the balance." },
  { index: 1, track: T2, emoji: "🌿", blurb: "Flowing curves through green country." },
  { index: 2, track: T3, emoji: "🏙️", blurb: "Tight street circuit. Precision matters." },
  { index: 3, track: T4, emoji: "♻️", blurb: "The efficiency challenge. Conserve energy." },
  { index: 4, track: T5, emoji: "🏆", blurb: "The world finale. Everything you've built." },
];

// ---- AI Teams ----
export const AI_TEAMS = [
  { name: "VELOCITY RACING", color: "#E6332A", speed: 1.0, aggression: 0.7, reliability: 0.85 },
  { name: "ECO DYNAMICS", color: "#2E7D32", speed: 0.96, aggression: 0.4, reliability: 0.95 },
  { name: "TITAN MOTORSPORT", color: "#1565C0", speed: 1.02, aggression: 0.8, reliability: 0.8 },
  { name: "SOLAR SPRINT", color: "#F9A825", speed: 0.98, aggression: 0.5, reliability: 0.9 },
  { name: "CARBON FOX", color: "#6A1B9A", speed: 1.01, aggression: 0.85, reliability: 0.78 },
  { name: "GREEN PULSE", color: "#00897B", speed: 0.97, aggression: 0.45, reliability: 0.93 },
  { name: "IRON WING", color: "#37474F", speed: 0.99, aggression: 0.65, reliability: 0.82 },
];

export const PLAYER_TEAM = { name: "QYNEX MOTORSPORT", color: "#FF9B33" };

// ---- Engineering / Sustainability decision scenarios ----
// Each choice: { label, desc, eng, sus, perf, consequence, delayed? }
export const SCENARIOS = [
  {
    id: "rearwing", topic: "🔧 Rear Wing", title: "REAR WING FLEX",
    prompt: "Telemetry shows the rear wing is flexing too much at high speed, hurting downforce consistency.",
    choices: [
      { label: "Add reinforcing material", desc: "Stiffen it with extra carbon layers.", eng: 15, sus: -12, perf: 0, consequence: "Wing is rock-solid, but you used more raw material." },
      { label: "Redesign the structure", desc: "Lightweight internal rib geometry.", eng: 8, sus: 5, perf: 50, consequence: "Elegant solution — lighter AND greener.", balanced: true },
      { label: "Leave it as-is", desc: "Save resources, accept the flex.", eng: -15, sus: 2, perf: -50, consequence: "The flex costs you cornering speed." },
    ],
  },
  {
    id: "frontwing", topic: "🔧 Front Wing", title: "FRONT WING TUNING",
    prompt: "The car understeers on corner entry. The front wing needs adjustment.",
    choices: [
      { label: "Maximize downforce", desc: "Aggressive flap angles.", eng: 14, sus: -8, perf: 0, consequence: "Sharper turn-in, more drag and energy use." },
      { label: "Balanced aero package", desc: "Optimize flap + endplate flow.", eng: 7, sus: 6, perf: 50, consequence: "Clean airflow, efficient and effective.", balanced: true },
      { label: "Reduce wing for speed", desc: "Less downforce, straight-line focus.", eng: 4, sus: -4, perf: 0, consequence: "Faster on straights, scarier in corners." },
    ],
  },
  {
    id: "battery", topic: "🔋 Battery", title: "BATTERY OVERHEATING",
    prompt: "The battery pack is running hot after hard laps, risking power loss.",
    choices: [
      { label: "Add heavy cooling fins", desc: "Brute-force thermal management.", eng: 10, sus: -10, perf: 0, consequence: "Cool battery, but added weight and material." },
      { label: "Smart thermal software", desc: "Predictive load balancing.", eng: 6, sus: 8, perf: 50, consequence: "Software keeps temps down with zero extra mass.", balanced: true },
      { label: "Limit power output", desc: "Cap discharge rate.", eng: -8, sus: 4, perf: -50, consequence: "No overheating, but you're noticeably slower." },
    ],
  },
  {
    id: "tyres", topic: "🛞 Tyres", title: "TYRE COMPOUND CHOICE",
    prompt: "You must select a tyre compound for the race. Sustainability regs reward efficient rubber.",
    choices: [
      { label: "Soft, grippy compound", desc: "Maximum performance, fast wear.", eng: 16, sus: -14, perf: 0, consequence: "Huge grip, but tyres shed debris and wear fast." },
      { label: "Bio-sourced medium", desc: "Renewable materials, good life.", eng: 7, sus: 7, perf: 50, consequence: "Grip + longevity + lower footprint.", balanced: true },
      { label: "Hard, durable compound", desc: "Lasts forever, less grip.", eng: -6, sus: 3, perf: -50, consequence: "No pit stops needed, but sliding in corners." },
    ],
  },
  {
    id: "lightweight", topic: "🪶 Materials", title: "LIGHTWEIGHT MATERIALS",
    prompt: "A supplier offers advanced recycled-carbon panels. They're light but pricey.",
    choices: [
      { label: "Buy virgin carbon fiber", desc: "Lightest, strongest, dirty to make.", eng: 12, sus: -15, perf: 0, consequence: "Fast and light, terrible carbon footprint." },
      { label: "Recycled carbon panels", desc: "Nearly as light, far greener.", eng: 9, sus: 10, perf: 50, consequence: "Best of both worlds — light and responsible.", balanced: true },
      { label: "Standard aluminum", desc: "Cheap, heavier.", eng: -8, sus: 0, perf: -50, consequence: "Affordable, but the car gains weight." },
    ],
  },
  {
    id: "shortage", topic: "📦 Supply", title: "MATERIAL SHORTAGE",
    prompt: "A key supplier can't deliver. You can wait, source elsewhere, or substitute.",
    choices: [
      { label: "Air-freight from overseas", desc: "Fast delivery, huge emissions.", eng: 8, sus: -16, perf: 0, consequence: "Parts arrive on time, but the carbon cost is brutal." },
      { label: "Local sustainable substitute", desc: "Slightly different spec, local.", eng: 4, sus: 9, perf: 50, consequence: "Supports local industry, lower transport emissions.", balanced: true },
      { label: "Delay and wait", desc: "No rush, lose prep time.", eng: -10, sus: 2, perf: -50, consequence: "You miss setup time and start on the back foot." },
    ],
  },
  {
    id: "cooling", topic: "❄️ Cooling", title: "COOLING SYSTEM",
    prompt: "Engineers propose a new cooling layout. Options vary in efficiency and drag.",
    choices: [
      { label: "Oversized radiators", desc: "Never overheats, lots of drag.", eng: 6, sus: -9, perf: 0, consequence: "Bulletproof cooling, but the car punches a big hole in the air." },
      { label: "Shaped ducts + heat回收", desc: "Aero ducts recover heat energy.", eng: 8, sus: 8, perf: 50, consequence: "Low drag AND recovers waste heat. Brilliant.", balanced: true },
      { label: "Minimal cooling", desc: "Reduce weight and drag.", eng: 5, sus: -3, perf: 0, consequence: "Fast but risky if temps spike.", delayed: "May cause issues if the race runs hot." },
    ],
  },
  {
    id: "factory", topic: "🏭 Factory", title: "FACTORY ENERGY",
    prompt: "The team factory's energy bill is high. How should you power operations?",
    choices: [
      { label: "Grid power, cheapest", desc: "Cheap, fossil-heavy grid.", eng: 2, sus: -12, perf: 0, consequence: "Saves money, but the team's footprint balloons." },
      { label: "Solar array investment", desc: "Upfront cost, clean forever.", eng: 4, sus: 12, perf: 50, consequence: "Long-term clean energy. The team goes green.", balanced: true },
      { label: "Cut factory hours", desc: "Reduce usage by working less.", eng: -8, sus: 5, perf: -50, consequence: "Less energy, but development slows." },
    ],
  },
  {
    id: "recycling", topic: "♻️ Recycling", title: "END-OF-LIFE PARTS",
    prompt: "Old carbon parts are piling up. What's the disposal plan?",
    choices: [
      { label: "Landfill the waste", desc: "Easiest, worst option.", eng: 0, sus: -16, perf: -50, consequence: "The team's sustainability rating tanks." },
      { label: "Partner with recycler", desc: "Reclaim fibers, reuse.", eng: 3, sus: 11, perf: 50, consequence: "Recovered fibers cut future material costs.", balanced: true },
      { label: "Incinerate for energy", desc: "Burn for power.", eng: 1, sus: -4, perf: 0, consequence: "Some energy recovered, but emissions rise." },
    ],
  },
  {
    id: "logistics", topic: "🚚 Logistics", title: "TEAM TRANSPORT",
    prompt: "Moving the team between races. How do you travel?",
    choices: [
      { label: "Fly everything", desc: "Fastest, dirtiest.", eng: 6, sus: -15, perf: 0, consequence: "Always on time, massive emissions." },
      { label: "Rail + biofuel trucks", desc: "Slower, much cleaner.", eng: 2, sus: 12, perf: 50, consequence: "Logistics go green. The team plans ahead.", balanced: true },
      { label: "Ship by sea", desc: "Cheapest, slowest.", eng: -4, sus: 6, perf: -50, consequence: "Clean but you risk arriving late." },
    ],
  },
  {
    id: "pitstop", topic: "🏁 Pit Stop", title: "PIT STOP STRATEGY",
    prompt: "Do you plan an efficient pit stop or skip it entirely?",
    choices: [
      { label: "Aggressive fast stop", desc: "Rush it, risk errors.", eng: 10, sus: -6, perf: 0, consequence: "Lightning stop, but wasted tyres and energy." },
      { label: "Optimized clean stop", desc: "Rehearsed, minimal waste.", eng: 6, sus: 7, perf: 50, consequence: "Smooth, fast, and wastes nothing.", balanced: true },
      { label: "No pit stop", desc: "Save the stop, run long.", eng: -4, sus: 3, perf: 0, consequence: "No time lost, but tyres fade late.", delayed: "Tyre wear may hurt the final laps." },
    ],
  },
  {
    id: "weather", topic: "🌧️ Weather", title: "WEATHER RESPONSE",
    prompt: "Rain is likely. How do you prepare the car?",
    choices: [
      { label: "Full wet setup, heavy", desc: "Maximum wet performance.", eng: 12, sus: -10, perf: 0, consequence: "Great in rain, but heavy and wasteful if it's dry." },
      { label: "Adaptive aero + wets", desc: "Flexible, efficient.", eng: 7, sus: 6, perf: 50, consequence: "Handles whatever the sky throws at you.", balanced: true },
      { label: "Dry setup, gamble", desc: "Bet on no rain.", eng: -6, sus: 2, perf: -50, consequence: "Fast if dry, dangerous if it rains.", delayed: "Disaster if the rain actually comes." },
    ],
  },
  {
    id: "aero", topic: "💨 Aerodynamics", title: "AERODYNAMIC PACKAGE",
    prompt: "Wind tunnel time is limited. Where do you focus development?",
    choices: [
      { label: "Pure downforce", desc: "Corner speed, drag penalty.", eng: 13, sus: -7, perf: 0, consequence: "Stuck to the track, but burns more energy." },
      { label: "Efficient aero balance", desc: "Optimize drag vs downforce.", eng: 8, sus: 7, perf: 50, consequence: "Slips through the air cleanly.", balanced: true },
      { label: "Low-drag top speed", desc: "Slick bodywork.", eng: 6, sus: -2, perf: 0, consequence: "Monster on straights, loose in corners." },
    ],
  },
  {
    id: "manufacturing", topic: "🔧 Manufacturing", title: "MANUFACTURING PROCESS",
    prompt: "A new 3D-printing method could cut waste. How do you adopt it?",
    choices: [
      { label: "Stick to CNC machining", desc: "Proven, wasteful.", eng: 6, sus: -10, perf: 0, consequence: "Reliable parts, lots of material waste." },
      { label: "Additive manufacturing", desc: "Print parts, near-zero waste.", eng: 7, sus: 11, perf: 50, consequence: "Print only what you need. Minimal waste.", balanced: true },
      { label: "Outsource to cheapest bidder", desc: "Low cost, low control.", eng: -6, sus: -4, perf: -50, consequence: "Cheap parts, inconsistent quality." },
    ],
  },
  {
    id: "energy_mgmt", topic: "⚡ Energy", title: "ENERGY MANAGEMENT MODE",
    prompt: "Choose the race energy strategy. This shapes how the car uses power.",
    choices: [
      { label: "Attack mode", desc: "Max power, drain fast.", eng: 10, sus: -12, perf: 0, consequence: "Explosive pace, but you may run dry." },
      { label: "Smart energy map", desc: "Adaptive power delivery.", eng: 6, sus: 8, perf: 50, consequence: "Power when you need it, saved when you don't.", balanced: true },
      { label: "Eco conserve", desc: "Heavy limits.", eng: -8, sus: 6, perf: -50, consequence: "You'll finish, but you'll be slow." },
    ],
  },
  {
    id: "reliability", topic: "🛠️ Reliability", title: "RELIABILITY VS PERFORMANCE",
    prompt: "The engine can be tuned past its safe limit. How far do you push?",
    choices: [
      { label: "Overdrive the motor", desc: "More power, more risk.", eng: 14, sus: -8, perf: 0, consequence: "Big power, but failure risk climbs.", delayed: "May cause a mechanical issue mid-race." },
      { label: "Balanced reliable tune", desc: "Smart mapping, safe headroom.", eng: 7, sus: 7, perf: 50, consequence: "Strong, dependable, efficient.", balanced: true },
      { label: "Conservative detune", desc: "Under-stress everything.", eng: -6, sus: 4, perf: -50, consequence: "It'll never break. It'll also never win." },
    ],
  },
  {
    id: "waste", topic: "🗑️ Waste", title: "RACE-DAY WASTE",
    prompt: "Race weekends generate waste (tyres, fluids, packaging). Your plan?",
    choices: [
      { label: "Dispose on-site, cheaply", desc: "Quick, dirty.", eng: 0, sus: -13, perf: -50, consequence: "Fast cleanup, bad optics and footprint." },
      { label: "Full circular program", desc: "Sort, recover, reuse.", eng: 3, sus: 12, perf: 50, consequence: "Nearly zero race-day waste. A model for the paddock.", balanced: true },
      { label: "Ship waste home", desc: "Deal with it later.", eng: -2, sus: -2, perf: 0, consequence: "Kicks the can down the road." },
    ],
  },
  {
    id: "braking", topic: "🛑 Braking", title: "BRAKING SYSTEM",
    prompt: "Regenerative braking can recover energy. How aggressive should it be?",
    choices: [
      { label: "Heavy regen, strong brakes", desc: "Big recovery, tricky feel.", eng: 9, sus: 6, perf: 0, consequence: "Lots of energy back, but the car is twitchy under braking." },
      { label: "Tuned regen balance", desc: "Smooth, efficient recovery.", eng: 7, sus: 8, perf: 50, consequence: "Recovers energy without unsettling the car.", balanced: true },
      { label: "Friction brakes only", desc: "No regen, simpler.", eng: 4, sus: -8, perf: -50, consequence: "Predictable, but wastes all braking energy." },
    ],
  },
];

// ---- Random events ----
export const RANDOM_EVENTS = [
  { id: "rain", emoji: "🌧️", title: "SUDDEN RAIN", desc: "The track is getting wet. Grip drops — drive carefully!", type: "grip", severity: 0.7 },
  { id: "overheat", emoji: "🌡️", title: "BATTERY OVERHEAT", desc: "Temps are spiking. Energy drain increases temporarily.", type: "energy", severity: 0.6 },
  { id: "debris", emoji: "🛣️", title: "TRACK DEBRIS", desc: "Debris on the racing line. Watch for collisions!", type: "hazard", severity: 0.5 },
  { id: "wind", emoji: "💨", title: "STRONG WIND", desc: "Crosswinds make the car twitchy at speed.", type: "handling", severity: 0.5 },
  { id: "safetycar", emoji: "🚨", title: "SAFETY CAR", desc: "Field bunches up. Hold position and conserve energy.", type: "safety", severity: 0.4 },
  { id: "tyredeg", emoji: "🛞", title: "TYRE DEGRADATION", desc: "Tyres are fading. Handling gets looser.", type: "grip", severity: 0.6 },
];

// ---- Race scoring ----
export const POSITION_POINTS = [300, 250, 200, 150, 100, 50, 25, 0];
export const RACE_COMPLETE_POINTS = 100;

// ---- Balance rewards ----
export function balanceReward(diff) {
  if (diff <= 10) return { label: "EXCELLENT BALANCE", emoji: "🏆", points: 200, tier: "excellent" };
  if (diff <= 20) return { label: "GOOD BALANCE", emoji: "✅", points: 100, tier: "good" };
  if (diff <= 40) return { label: "UNBALANCED", emoji: "⚠️", points: 25, tier: "ok" };
  return { label: "POOR BALANCE", emoji: "❌", points: -50, tier: "poor" };
}

export const BONUS_POINTS = {
  perfectLap: { label: "PERFECT LAP", points: 100 },
  ecoLap: { label: "ECO LAP", points: 100 },
  balancedTeam: { label: "BALANCED TEAM", points: 150 },
  cleanRace: { label: "CLEAN RACE", points: 50 },
  energyMaster: { label: "ENERGY MASTER", points: 100 },
};

// ---- Final ratings ----
export function finalRating(eng, sus, perf, balanceDiff) {
  const balanced = balanceDiff <= 15;
  const strongRace = perf >= 2000;
  const strongEng = eng >= 70;
  const strongSus = sus >= 70;
  if (strongRace && strongSus && balanced) return { title: "LEGENDARY ENGINEER", emoji: "🏆", desc: "Excellent racing AND sustainability. The complete team." };
  if (strongRace && !strongSus) return { title: "ELITE RACER", emoji: "🥇", desc: "Blistering pace, but sustainability lagged behind." };
  if (strongSus && !strongRace) return { title: "ECO ENGINEER", emoji: "♻️", desc: "A green pioneer. Next time, push for more pace." };
  if (balanced && strongEng && strongSus) return { title: "BALANCED CHAMPION", emoji: "⚖️", desc: "Strong performance with excellent balance." };
  return { title: "NEEDS IMPROVEMENT", emoji: "⚠️", desc: "Inconsistent balance. Learn from this season." };
}
