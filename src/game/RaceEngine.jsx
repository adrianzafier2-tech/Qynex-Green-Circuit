import React, { useEffect, useRef, useState, useCallback } from "react";
import { CAR_IMG } from "./data";
import { pointAtDistance, nearestOnPath, toNorthClockwise, forwardVector } from "./trackUtils";
import { sfx } from "./audio";

// Derive car performance stats from engineering/sustainability (0-100).
export function deriveCarStats(engineering, sustainability) {
  const e = engineering / 100;
  const s = sustainability / 100;
  return {
    maxSpeed: 360 + e * 240, // px/s
    accel: 230 + e * 170,
    brake: 460 + e * 120,
    steerRate: 2.4 + e * 1.3, // rad/s
    grip: 0.7 + e * 0.28, // off-track penalty multiplier
    reliability: 0.6 + (e + s) * 0.2,
    energyRate: 7 - s * 4.5, // energy/s at full throttle
    regenRate: 1.5 + s * 2, // energy/s when coasting/braking
  };
}

export default function RaceEngine({ track, carStats, controlScheme, graphicsQuality, onFinish, onExit }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const carImgRef = useRef(null);
  const [hud, setHud] = useState({
    speed: 0,
    energy: 100,
    health: 100,
    lap: 1,
    totalLaps: track.laps,
    position: 1,
    totalCars: 8,
    countdown: 3,
    finished: false,
    dnf: false,
    warning: null,
  });
  const [eventBanner, setEventBanner] = useState(null);

  // Mutable game state in refs
  const game = useRef(null);

  const touch = useRef({ left: false, right: false, accel: false, brake: false, dragX: null });

  // Initialize game state
  const initGame = useCallback(() => {
    const path = track.path;
    const start = pointAtDistance(path, 0);
    const startAngle = toNorthClockwise(start.canvasAngle);
    const perp = { x: Math.cos(start.canvasAngle), y: Math.sin(start.canvasAngle) };

    const player = {
      x: start.x - perp.x * 30,
      y: start.y - perp.y * 30,
      angle: startAngle,
      speed: 0,
      progress: 0,
      lap: 0,
      energy: 100,
      health: 100,
      isPlayer: true,
      color: "#FF9B33",
      crashedTimer: 0,
      cleanLap: true,
      minEnergyThisLap: 100,
      lapsClean: 0,
      ecoLap: false,
      perfectLap: false,
      sinceLap: 0,
    };

    // AI cars
    const aiCount = 7;
    const ais = [];
    for (let i = 0; i < aiCount; i++) {
      const teamIdx = i % 7;
      const team = [
        { name: "VELOCITY", color: "#E6332A", speed: 1.0 },
        { name: "ECO DYN", color: "#2E7D32", speed: 0.96 },
        { name: "TITAN", color: "#1565C0", speed: 1.02 },
        { name: "SOLAR", color: "#F9A825", speed: 0.98 },
        { name: "CARBON", color: "#6A1B9A", speed: 1.01 },
        { name: "PULSE", color: "#00897B", speed: 0.97 },
        { name: "IRON", color: "#37474F", speed: 0.99 },
      ][teamIdx];
      const offset = (i - 3) * 36;
      const startDist = -120 - i * 80;
      const p = pointAtDistance(path, startDist);
      const ang = toNorthClockwise(p.canvasAngle);
      const perp2 = { x: Math.cos(p.canvasAngle), y: Math.sin(p.canvasAngle) };
      ais.push({
        x: p.x + perp2.x * offset,
        y: p.y + perp2.y * offset,
        angle: ang,
        speed: 0,
        progress: startDist,
        lap: 0,
        targetSpeed: (carStats.maxSpeed * 0.82 + Math.random() * 60) * team.speed * track.difficulty,
        offset: offset,
        targetOffset: offset,
        color: team.color,
        name: team.name,
        reliability: 0.7 + Math.random() * 0.25,
        changeOffsetTimer: Math.random() * 3,
        crashedTimer: 0,
        isPlayer: false,
      });
    }

    game.current = {
      path,
      player,
      ais,
      cars: [player, ...ais],
      camera: { x: player.x, y: player.y },
      countdown: 3.2,
      raceTime: 0,
      finished: false,
      dnf: false,
      lastProgress: 0,
      lapStartTime: 0,
      bestLapMs: null,
      lastLapMs: null,
      eventTimer: 8 + Math.random() * 10,
      activeEvent: null,
      eventDuration: 0,
      cleanRace: true,
      shake: 0,
      lastTime: performance.now(),
      started: false,
    };
  }, [track, carStats]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Load car image (pre-rotated 180°: source art faces down, engine forward is up)
  useEffect(() => {
    const img = new Image();
    img.src = CAR_IMG;
    img.onload = () => {
      const rot = document.createElement("canvas");
      rot.width = img.width;
      rot.height = img.height;
      const rctx = rot.getContext("2d");
      rctx.translate(img.width, img.height);
      rctx.rotate(Math.PI);
      rctx.drawImage(img, 0, 0);
      carImgRef.current = rot;
    };
  }, []);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrapRef.current.clientWidth;
      const h = wrapRef.current.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, []);

  // Main loop
  useEffect(() => {
    let raf;
    let running = true;

    const loop = (now) => {
      if (!running) return;
      const g = game.current;
      if (!g) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min(0.05, (now - g.lastTime) / 1000);
      g.lastTime = now;
      update(dt, now);
      render();
      raf = requestAnimationFrame(loop);
    };

    const update = (dt, now) => {
      const g = game.current;
      const path = g.path;
      const player = g.player;

      // Countdown
      if (g.countdown > 0) {
        const prev = Math.ceil(g.countdown);
        g.countdown -= dt;
        const cur = Math.ceil(g.countdown);
        if (cur !== prev && cur >= 0) {
          if (cur === 0) sfx.go();
          else sfx.countdown();
        }
        if (g.countdown <= 0) {
          g.countdown = 0;
          g.started = true;
          g.lapStartTime = now;
        }
        // still update camera
        g.camera.x = player.x;
        g.camera.y = player.y;
        setHud((h) => ({ ...h, countdown: Math.max(0, Math.ceil(g.countdown)) }));
        return;
      }

      g.raceTime += dt;

      // Random events
      if (!g.activeEvent && g.raceTime > g.eventTimer) {
        const events = ["rain", "overheat", "debris", "wind", "safetycar", "tyredeg"];
        const ev = events[Math.floor(Math.random() * events.length)];
        g.activeEvent = ev;
        g.eventDuration = 6 + Math.random() * 5;
        const labels = {
          rain: { emoji: "🌧️", title: "SUDDEN RAIN", desc: "Grip reduced — drive carefully!" },
          overheat: { emoji: "🌡️", title: "BATTERY OVERHEAT", desc: "Energy drain increased!" },
          debris: { emoji: "🛣️", title: "TRACK DEBRIS", desc: "Hazard on track — avoid collisions!" },
          wind: { emoji: "💨", title: "STRONG WIND", desc: "Crosswinds affect handling!" },
          safetycar: { emoji: "🚨", title: "SAFETY CAR", desc: "Field bunches — conserve energy!" },
          tyredeg: { emoji: "🛞", title: "TYRE DEGRADATION", desc: "Tyres fading — looser handling!" },
        };
        setEventBanner(labels[ev]);
        sfx.warning();
        setTimeout(() => setEventBanner(null), 3500);
      }
      if (g.activeEvent) {
        g.eventDuration -= dt;
        if (g.eventDuration <= 0) g.activeEvent = null;
      }

      // ---- Player control ----
      const t = touch.current;
      let steerInput = 0;
      if (controlScheme === "drag") {
        if (t.dragX !== null) steerInput = Math.max(-1, Math.min(1, t.dragX));
      } else {
        if (t.left) steerInput -= 1;
        if (t.right) steerInput += 1;
      }

      const speedFactor = Math.min(1, player.speed / 80); // can't steer when stopped
      const eventGripMod = g.activeEvent === "rain" || g.activeEvent === "tyredeg" ? 0.7 : 1;
      const windMod = g.activeEvent === "wind" ? 0.85 : 1;

      if (t.accel && player.energy > 0) {
        player.speed += carStats.accel * dt;
        let drain = carStats.energyRate * dt;
        if (g.activeEvent === "overheat") drain *= 1.8;
        player.energy = Math.max(0, player.energy - drain);
      }
      if (t.brake) {
        player.speed -= carStats.brake * dt;
        // regen
        player.energy = Math.min(100, player.energy + carStats.regenRate * dt * 0.6);
      }
      // natural drag
      player.speed -= (player.speed > 0 ? 90 : 0) * dt;
      if (!t.accel && !t.brake && player.speed > 0) {
        player.speed -= 60 * dt; // coast drag
        player.energy = Math.min(100, player.energy + carStats.regenRate * dt * 0.3);
      }

      // energy penalty
      let maxSpeed = carStats.maxSpeed;
      if (player.energy < 20) maxSpeed *= 0.55 + (player.energy / 20) * 0.3;
      if (player.health < 25) maxSpeed *= 0.85;
      if (g.activeEvent === "safetycar") maxSpeed *= 0.7;

      player.speed = Math.max(0, Math.min(maxSpeed, player.speed));

      // steering
      player.angle += steerInput * carStats.steerRate * speedFactor * eventGripMod * windMod * dt;

      // move
      const fwd = forwardVector(player.angle);
      player.x += fwd.x * player.speed * dt;
      player.y += fwd.y * player.speed * dt;

      // track surface check
      const near = nearestOnPath(path, player.x, player.y);
      const halfW = track.trackWidth / 2;
      const halfB = track.barrierWidth / 2;
      if (near.distance > halfW) {
        // grass / off-track
        player.speed *= 1 - (1 - carStats.grip * eventGripMod) * dt * 2.2;
        if (near.distance > halfB) {
          // barrier collision
          const over = near.distance - halfB;
          // push back toward track
          const closest = pointAtDistance(path, near.progress);
          const dx = player.x - closest.x;
          const dy = player.y - closest.y;
          const d = Math.hypot(dx, dy) || 1;
          player.x = closest.x + (dx / d) * halfB;
          player.y = closest.y + (dy / d) * halfB;
          if (player.speed > 120) {
            player.health = Math.max(0, player.health - 14);
            player.speed *= 0.4;
            g.shake = 12;
            sfx.crash();
            player.cleanLap = false;
            g.cleanRace = false;
          } else {
            player.speed *= 0.7;
          }
        }
      }

      // progress / laps
      const prevProgress = player.progress;
      let prog = near.progress;
      player.progress = prog;
      player.sinceLap += player.speed * dt;
      // detect lap crossing: progress went from near total to near 0,
      // but only count it if the car actually traveled most of a lap (guards against seam-flip false counts)
      if (prevProgress > path.total * 0.7 && prog < path.total * 0.3 && player.sinceLap > path.total * 0.5) {
        player.lap += 1;
        player.sinceLap = 0;
        const lapMs = now - g.lapStartTime;
        g.lastLapMs = lapMs;
        if (g.bestLapMs === null || lapMs < g.bestLapMs) g.bestLapMs = lapMs;
        g.lapStartTime = now;
        sfx.lap();
        // check lap bonuses
        if (player.cleanLap) {
          player.lapsClean += 1;
          player.perfectLap = true;
        }
        if (player.minEnergyThisLap > 75) player.ecoLap = true;
        player.cleanLap = true;
        player.minEnergyThisLap = player.energy;
        if (player.lap >= track.laps) {
          // finished
          g.finished = true;
          g.finishTime = now;
        }
      }
      player.minEnergyThisLap = Math.min(player.minEnergyThisLap, player.energy);

      // car-car collisions (simple)
      for (const c of g.ais) {
        const dx = player.x - c.x;
        const dy = player.y - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 42 && d > 0.1) {
          const overlap = (42 - d) / 2;
          const nx = dx / d;
          const ny = dy / d;
          player.x += nx * overlap;
          player.y += ny * overlap;
          c.x -= nx * overlap;
          c.y -= ny * overlap;
          if (player.speed > 200) {
            player.health = Math.max(0, player.health - 6);
            g.cleanRace = false;
            player.cleanLap = false;
            sfx.crash();
            g.shake = 6;
          }
          player.speed *= 0.85;
        }
      }

      // DNF check
      if (player.health <= 0 && !g.dnf) {
        g.dnf = true;
        g.finished = true;
        g.finishTime = now;
        sfx.bad();
      }

      // ---- AI ----
      for (const ai of g.ais) {
        if (g.finished && !ai.isPlayer) {
          // keep moving
        }
        ai.changeOffsetTimer -= dt;
        if (ai.changeOffsetTimer <= 0) {
          ai.targetOffset = (Math.random() - 0.5) * (track.trackWidth - 50);
          ai.changeOffsetTimer = 1.5 + Math.random() * 2.5;
        }
        ai.offset += (ai.targetOffset - ai.offset) * dt * 1.5;
        // reliability crash chance
        if (Math.random() < (1 - ai.reliability) * 0.0008 * (g.activeEvent ? 2 : 1)) {
          ai.crashedTimer = 1.5;
        }
        let aiTarget = ai.targetSpeed;
        if (ai.crashedTimer > 0) {
          ai.crashedTimer -= dt;
          aiTarget = ai.targetSpeed * 0.3;
        }
        if (g.activeEvent === "safetycar") aiTarget *= 0.7;
        ai.speed += (aiTarget - ai.speed) * dt * 1.2;
        ai.progress += ai.speed * dt;
        // wrap progress
        if (ai.progress >= path.total) {
          ai.progress -= path.total;
          ai.lap += 1;
        }
        if (ai.progress < 0) ai.progress += path.total;
        const ap = pointAtDistance(path, ai.progress);
        const perp = { x: Math.cos(ap.canvasAngle), y: Math.sin(ap.canvasAngle) };
        ai.x = ap.x + perp.x * ai.offset;
        ai.y = ap.y + perp.y * ai.offset;
        ai.angle = toNorthClockwise(ap.canvasAngle);
      }

      // ---- Positions ----
      const allCars = [player, ...g.ais];
      const ranked = allCars
        .map((c) => ({ c, score: c.lap * path.total + c.progress }))
        .sort((a, b) => b.score - a.score);
      const playerPos = ranked.findIndex((r) => r.c === player) + 1;

      // camera
      g.camera.x += (player.x - g.camera.x) * Math.min(1, dt * 6);
      g.camera.y += (player.y - g.camera.y) * Math.min(1, dt * 6);
      g.shake *= 1 - dt * 4;

      // warning
      let warning = null;
      if (player.energy < 20) warning = "⚠️ LOW ENERGY";
      if (player.health < 25) warning = "⚠️ LOW CAR HEALTH";

      setHud({
        speed: Math.round(player.speed),
        energy: Math.round(player.energy),
        health: Math.round(player.health),
        lap: Math.min(track.laps, player.lap + 1),
        totalLaps: track.laps,
        position: playerPos,
        totalCars: allCars.length,
        countdown: 0,
        finished: g.finished,
        dnf: g.dnf,
        warning,
      });

      // finish
      if (g.finished && g.finishTime && now - g.finishTime > 1400) {
        running = false;
        finishRace(playerPos, g);
      }
    };

    const finishRace = (position, g) => {
      const player = g.player;
      const POSITION_POINTS = [300, 250, 200, 150, 100, 50, 25, 0];
      const racePoints = POSITION_POINTS[Math.min(position - 1, 7)] || 0;
      const completion = 100;
      const energyMaster = player.energy > 40;
      const cleanRace = g.cleanRace;
      const ecoLap = player.ecoLap;
      const perfectLap = player.perfectLap;
      let totalPoints = racePoints + completion;
      if (cleanRace) totalPoints += 50;
      if (ecoLap) totalPoints += 100;
      if (perfectLap) totalPoints += 100;
      if (energyMaster) totalPoints += 100;
      if (g.dnf) totalPoints = Math.max(0, totalPoints - 200);

      sfx.finish();
      onFinish({
        position: g.dnf ? 8 : position,
        racePoints,
        completion,
        cleanRace,
        ecoLap,
        perfectLap,
        energyMaster,
        dnf: g.dnf,
        totalPoints,
        bestLapMs: g.bestLapMs,
        lastLapMs: g.lastLapMs,
        energyRemaining: Math.round(player.energy),
        healthRemaining: Math.round(player.health),
      });
    };

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const g = game.current;
      if (!g) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const lowQ = graphicsQuality === "low";

      // camera transform
      const shakeX = (Math.random() - 0.5) * g.shake;
      const shakeY = (Math.random() - 0.5) * g.shake;
      ctx.save();
      ctx.fillStyle = lowQ ? "#1b5e20" : "#2e7d32";
      ctx.fillRect(0, 0, w, h);

      ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
      ctx.translate(-g.camera.x, -g.camera.y);

      // grass texture (cheap)
      if (!lowQ) {
        ctx.fillStyle = "#388e3c";
        const grid = 200;
        const sx = Math.floor((g.camera.x - w / 2) / grid) * grid;
        const sy = Math.floor((g.camera.y - h / 2) / grid) * grid;
        for (let gx = sx; gx < sx + w + grid; gx += grid) {
          for (let gy = sy; gy < sy + h + grid; gy += grid) {
            if ((Math.floor(gx / grid) + Math.floor(gy / grid)) % 2 === 0) {
              ctx.fillRect(gx, gy, grid, grid);
            }
          }
        }
      }

      // draw track
      const path = g.path;
      // barrier
      ctx.strokeStyle = "#111";
      ctx.lineWidth = track.barrierWidth;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= path.points.length; i++) {
        const p = path.points[i % path.points.length];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // curbs (red/white) - draw as slightly wider than track with dashes
      ctx.strokeStyle = "#e6332a";
      ctx.lineWidth = track.trackWidth + 14;
      ctx.setLineDash([24, 24]);
      ctx.beginPath();
      for (let i = 0; i <= path.points.length; i++) {
        const p = path.points[i % path.points.length];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // asphalt
      ctx.strokeStyle = "#3a3a3a";
      ctx.lineWidth = track.trackWidth;
      ctx.beginPath();
      for (let i = 0; i <= path.points.length; i++) {
        const p = path.points[i % path.points.length];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      // center dashed line
      ctx.strokeStyle = "#fdd835";
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 25]);
      ctx.beginPath();
      for (let i = 0; i <= path.points.length; i++) {
        const p = path.points[i % path.points.length];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // start/finish line - checkered
      const sf = pointAtDistance(path, 0);
      const perp = { x: Math.cos(sf.canvasAngle), y: Math.sin(sf.canvasAngle) };
      const half = track.trackWidth / 2;
      ctx.save();
      ctx.translate(sf.x, sf.y);
      ctx.rotate(sf.canvasAngle + Math.PI / 2);
      const segs = 8;
      const segW = (track.trackWidth) / segs;
      for (let i = 0; i < segs; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#fff" : "#111";
        ctx.fillRect(-half + i * segW, -10, segW, 20);
      }
      ctx.restore();

      // draw cars (AI first, player last)
      for (const ai of g.ais) {
        drawCar(ctx, ai, false, lowQ);
      }
      drawCar(ctx, g.player, true, lowQ);

      ctx.restore();

      // scanline overlay
      if (!lowQ) {
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = "#000";
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1);
        }
        ctx.restore();
      }
    };

    const drawCar = (ctx, car, isPlayer, lowQ) => {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      const cw = 34;
      const ch = 64;
      if (isPlayer && carImgRef.current) {
        ctx.drawImage(carImgRef.current, -cw / 2, -ch / 2, cw, ch);
      } else {
        // AI car: simple retro sprite
        ctx.fillStyle = car.color;
        ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        ctx.fillStyle = "#111";
        ctx.fillRect(-cw / 2 + 4, -ch / 2 + 16, cw - 8, ch - 32);
        // wings
        ctx.fillStyle = car.color;
        ctx.fillRect(-cw / 2 - 6, -ch / 2 + 2, 4, 12);
        ctx.fillRect(cw / 2 + 2, -ch / 2 + 2, 4, 12);
        ctx.fillRect(-cw / 2 - 8, ch / 2 - 12, cw + 16, 6);
        ctx.fillStyle = "#fff";
        ctx.fillRect(-3, -ch / 2 + 4, 6, 4);
      }
      ctx.restore();
      // position indicator for player
      if (isPlayer && !lowQ) {
        ctx.save();
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(car.x, car.y - 44, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [track, carStats, controlScheme, graphicsQuality, onFinish]);

  // touch handlers
  const press = (key, val) => (e) => {
    e.preventDefault();
    touch.current[key] = val;
  };

  const onDragStart = (e) => {
    e.preventDefault();
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    touch.current.dragStartX = x;
    touch.current.dragX = 0;
  };
  const onDragMove = (e) => {
    e.preventDefault();
    if (touch.current.dragStartX === null && touch.current.dragStartX !== 0) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const dx = x - touch.current.dragStartX;
    touch.current.dragX = Math.max(-1, Math.min(1, dx / 120));
  };
  const onDragEnd = (e) => {
    touch.current.dragX = 0;
    touch.current.dragStartX = null;
  };

  const btn = (key, label, color, extraClass) => (
    <button
      onPointerDown={press(key, true)}
      onPointerUp={press(key, false)}
      onPointerLeave={press(key, false)}
      onPointerCancel={press(key, false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`select-none touch-none flex items-center justify-center font-bold text-white active:scale-95 transition-transform ${extraClass}`}
      style={{ background: color, touchAction: "none" }}
    >
      {label}
    </button>
  );

  return (
    <div ref={wrapRef} className="relative w-full h-full overflow-hidden bg-green-800 select-none">
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* HUD top bar */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex justify-between items-start pointer-events-none z-20" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}>
        <div className="bg-black/70 border-2 border-yellow-400 rounded-lg px-3 py-2 text-white font-mono text-xs sm:text-sm space-y-1">
          <Bar label="⚡" value={hud.energy} color="#FDD835" />
          <Bar label="❤️" value={hud.health} color="#E6332A" />
        </div>
        <div className="bg-black/70 border-2 border-yellow-400 rounded-lg px-4 py-2 text-center text-white font-mono">
          <div className="text-xl sm:text-3xl font-bold text-yellow-400">P{hud.position}<span className="text-sm text-white/60">/{hud.totalCars}</span></div>
          <div className="text-sm sm:text-lg font-bold">LAP {hud.lap}/{hud.totalLaps}</div>
        </div>
        <div className="bg-black/70 border-2 border-yellow-400 rounded-lg px-3 py-2 text-white font-mono text-right">
          <div className="text-2xl sm:text-3xl font-bold text-orange-400">{hud.speed}</div>
          <div className="text-[10px] text-white/60">KM/H</div>
        </div>
      </div>

      {hud.warning && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 border-2 border-yellow-400 px-4 py-1 rounded font-mono font-bold text-white animate-pulse z-20 pointer-events-none">
          {hud.warning}
        </div>
      )}

      {eventBanner && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-black/85 border-2 border-yellow-400 px-5 py-2 rounded-lg text-center z-20 pointer-events-none">
          <div className="text-2xl">{eventBanner.emoji} {eventBanner.title}</div>
          <div className="text-xs text-yellow-300 font-mono">{eventBanner.desc}</div>
        </div>
      )}

      {/* Countdown */}
      {hud.countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-8xl sm:text-9xl font-bold text-yellow-400 font-mono drop-shadow-[0_0_20px_rgba(253,216,53,0.8)] animate-ping-once">
            {hud.countdown === 0 ? "GO!" : hud.countdown}
          </div>
        </div>
      )}

      {/* Touch controls */}
      {controlScheme === "buttons" ? (
        <>
          <div className="absolute bottom-0 left-0 flex gap-3 p-4 z-20" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            {btn("left", "◀", "#1a1a1a", "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 text-3xl")}
            {btn("right", "▶", "#1a1a1a", "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-400 text-3xl")}
          </div>
          <div className="absolute bottom-0 right-0 flex gap-3 p-4 z-20" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            {btn("brake", "BRAKE", "#E6332A", "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white text-sm")}
            {btn("accel", "GAS", "#2E7D32", "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-400 text-lg")}
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute bottom-0 left-0 w-1/2 h-full z-20 flex items-end justify-start p-4"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
          >
            <div className="bg-black/50 border-2 border-yellow-400 rounded-lg px-3 py-2 text-white font-mono text-xs">
              ◀ DRAG TO STEER ▶
            </div>
          </div>
          <div className="absolute bottom-0 right-0 flex gap-3 p-4 z-20" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            {btn("brake", "BRAKE", "#E6332A", "w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white text-sm")}
            {btn("accel", "GAS", "#2E7D32", "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-yellow-400 text-lg")}
          </div>
        </>
      )}

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 border border-yellow-400/50 text-white/70 text-xs px-3 py-1 rounded font-mono z-20"
      >
        QUIT
      </button>
    </div>
  );
}

function Bar({ label, value, color }) {
  return (
    <div className="flex items-center gap-1">
      <span className="w-4">{label}</span>
      <div className="w-20 h-3 bg-white/20 rounded-sm overflow-hidden border border-white/30">
        <div className="h-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[10px] w-6 text-right">{Math.round(value)}</span>
    </div>
  );
}