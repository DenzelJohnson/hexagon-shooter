import * as THREE from 'three';
import { Arena }       from './arena.js?v=3';
import { Player }      from './player.js?v=3';
import { Physics }     from './physics.js?v=3';
import { GameState }   from './gameState.js?v=3';
import { UI }          from './ui.js?v=3';
import { LEVELS }      from './levelConfig.js?v=3';

// ─── Renderer ─────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.prepend(renderer.domElement);

// ─── Scene ────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeef5ff);
scene.fog = new THREE.FogExp2(0xeef5ff, 0.012);

// ─── Lighting ─────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1.4));
const sun = new THREE.DirectionalLight(0xffffff, 1.1);
sun.position.set(15, 40, 10);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xaaddff, 0.45);
fill.position.set(-10, 8, -15);
scene.add(fill);

// ─── Camera ───────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 250);
camera.position.set(0, 12, 14);
camera.lookAt(0, 0.5, 0);

// ─── Game Objects ─────────────────────────────────────────────────────────────
const state  = new GameState();
const ui     = new UI();
const arena  = new Arena(scene);
const player = new Player(scene);
const phys   = new Physics();

// ─── Aim Arrow ────────────────────────────────────────────────────────────────
const aimArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 1.5, 0),
  3.2, 0x00ccff, 0.7, 0.45
);
scene.add(aimArrow);

// ─── Aim / Keyboard State ─────────────────────────────────────────────────────
let aimAngle = Math.PI;
let aimX = 0;
let aimZ = -1;

const keys = { ArrowLeft: false, ArrowRight: false };
document.addEventListener('keydown', (e) => { if (e.key in keys) { keys[e.key] = true;  e.preventDefault(); } });
document.addEventListener('keyup',   (e) => { if (e.key in keys) { keys[e.key] = false; e.preventDefault(); } });

const ROTATE_SPEED = 2.2;
function updateAimFromKeys(delta) {
  if (keys.ArrowLeft)  aimAngle += ROTATE_SPEED * delta;
  if (keys.ArrowRight) aimAngle -= ROTATE_SPEED * delta;
  if (keys.ArrowLeft || keys.ArrowRight) {
    aimX = Math.sin(aimAngle);
    aimZ = Math.cos(aimAngle);
  }
}

// ─── Camera Follow State ──────────────────────────────────────────────────────
const camPos    = new THREE.Vector3(0, 12, 14);
const camLookAt = new THREE.Vector3(0, 0.5, 0);
let   camAimX   = 0;
let   camAimZ   = -1;

// ─── App / Level State ────────────────────────────────────────────────────────
let gameActive      = false;
let currentLevelId  = 1;

// Timed-tile countdown
let timedCountdown  = null; // seconds remaining, null = inactive
let timedTileIdx    = -1;   // hexagons[] index of the timed tile we're on
let timedDuration   = 4;    // set from level config when countdown starts

// ─── Level / App Flow ─────────────────────────────────────────────────────────

function startLevel(levelId) {
  currentLevelId = levelId;
  const config   = LEVELS.find(l => l.id === levelId);

  state.setLevel(config);
  arena.spawnHexagons(config);
  player.setPosition(0, 0, arena.platformY);
  phys.stop();

  timedCountdown = null;
  timedTileIdx   = -1;

  ui.showGame();
  ui.updateLevelName(`LVL ${config.id}  ${config.name.toUpperCase()}`);
  ui.updateRound(0, state.targetRounds);
  ui.updateMeter(state.meterPercent);
  ui.setShootEnabled(true);
  ui.hideCountdown();

  camAimX = aimX;
  camAimZ = aimZ;
  gameActive = true;
}

function startRound() {
  ui.setShootEnabled(true);
}

function shoot() {
  if (!gameActive || phys.isMoving) return;

  // If on a timed tile, cancel its countdown and remove the tile
  if (timedCountdown !== null) {
    if (timedTileIdx >= 0 && timedTileIdx < arena.hexagons.length) {
      arena.removeHexagon(timedTileIdx);
    }
    timedCountdown = null;
    timedTileIdx   = -1;
    ui.hideCountdown();
  }

  ui.setShootEnabled(false);

  const dir = new THREE.Vector3(aimX, 0, aimZ);
  if (dir.length() < 0.01) dir.set(0, 0, -1);
  dir.normalize();

  camAimX = dir.x;
  camAimZ = dir.z;

  phys.launch(dir.x, dir.z, state.launchSpeed);
}

function onLanded(hitIdx) {
  if (hitIdx < 0) {
    showGameOver(); return;
  }

  const hex = arena.hexagons[hitIdx];
  state.nextRound();

  // Win condition (check before tile-specific logic)
  if (state.isWon) {
    arena.removeHexagon(hitIdx);
    winLevel(); return;
  }

  ui.updateRound(state.round, state.targetRounds);
  ui.updateMeter(state.meterPercent);

  if (hex && hex.type === 'timed') {
    // Don't remove tile yet — start countdown, player must shoot in time
    const config  = LEVELS.find(l => l.id === currentLevelId);
    timedDuration = config ? config.timedTileDuration : 4;
    timedCountdown = timedDuration;
    timedTileIdx   = hitIdx;
    ui.showCountdown(1.0, timedDuration);
    ui.setShootEnabled(true);
  } else {
    arena.removeHexagon(hitIdx);
    startRound();
  }
}

function winLevel() {
  gameActive = false;
  const config  = LEVELS.find(l => l.id === currentLevelId);
  const hasNext = currentLevelId < LEVELS.length;
  ui.showWin(config.name, state.round, hasNext);
}

function showGameOver() {
  gameActive = false;
  phys.stop();
  timedCountdown = null;
  timedTileIdx   = -1;
  ui.hideCountdown();
  ui.showGameOver(state.round, state.targetRounds, state.personalBest);
}

// ─── UI Event Wiring ──────────────────────────────────────────────────────────

ui.buildLevelGrid(LEVELS, (levelId) => startLevel(levelId));

ui.onPlayCampaign(() => ui.showLevelSelect());
ui.onBack(()          => ui.showHome());
ui.onShoot(()         => shoot());
ui.onRetry(()         => startLevel(currentLevelId));
ui.onNextLevel(()     => startLevel(currentLevelId + 1));
ui.onLevelsWin(()     => ui.showLevelSelect());
ui.onLevelsGO(()      => ui.showLevelSelect());

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);

  if (gameActive) {
    updateAimFromKeys(delta);
    arena.update(delta); // moves moving tiles each frame

    // ── Timed-tile countdown ──
    if (timedCountdown !== null) {
      timedCountdown -= delta;
      const fraction = Math.max(0, timedCountdown / timedDuration);
      ui.showCountdown(fraction, timedCountdown);

      // Pulse the tile emissive as urgency rises
      if (timedTileIdx >= 0 && timedTileIdx < arena.hexagons.length) {
        const body = arena.hexagons[timedTileIdx].mesh.children[0];
        if (body) {
          const pulse = 0.3 + 0.7 * (Math.sin(clock.elapsedTime * Math.PI * (2 + (1 - fraction) * 8)) * 0.5 + 0.5);
          body.material.emissiveIntensity = pulse;
        }
      }

      if (timedCountdown <= 0) {
        // Tile broke — game over
        if (timedTileIdx >= 0 && timedTileIdx < arena.hexagons.length) {
          arena.removeHexagon(timedTileIdx);
        }
        timedCountdown = null;
        timedTileIdx   = -1;
        ui.hideCountdown();
        showGameOver();
      }
    }

    // ── Physics ──
    if (phys.isMoving) {
      const stopped = phys.update(player.group.position, delta);
      if (stopped) {
        const hitIdx = arena.checkLanding(player.position.x, player.position.z);
        onLanded(hitIdx);
      }
    }

    // ── Aim arrow + player facing ──
    if (!phys.isMoving) {
      const aimDir = new THREE.Vector3(aimX, 0, aimZ).normalize();
      aimArrow.position.copy(player.position).setY(player.position.y + 1.4);
      aimArrow.setDirection(aimDir);
      aimArrow.visible = true;
      player.setFacing(Math.atan2(aimX, aimZ));
    } else {
      aimArrow.visible = false;
    }
  }

  // ── Camera ── (always smooth, even on menus — looks good behind overlays)
  const usedAimX = phys.isMoving ? camAimX : aimX;
  const usedAimZ = phys.isMoving ? camAimZ : aimZ;
  const len      = Math.sqrt(usedAimX * usedAimX + usedAimZ * usedAimZ);
  const nax      = len > 0.01 ? usedAimX / len : 0;
  const naz      = len > 0.01 ? usedAimZ / len : -1;

  camPos.lerp(new THREE.Vector3(
    player.position.x - nax * 12,
    player.position.y + 10,
    player.position.z - naz * 12,
  ), 0.05);
  camLookAt.lerp(new THREE.Vector3(
    player.position.x,
    player.position.y + 0.6,
    player.position.z,
  ), 0.07);
  camera.position.copy(camPos);
  camera.lookAt(camLookAt);

  renderer.render(scene, camera);
}

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
ui.showHome();
animate();
