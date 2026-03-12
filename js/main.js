import * as THREE from 'three';
import { Arena }     from './arena.js';
import { Player }    from './player.js';
import { Physics }   from './physics.js';
import { GameState } from './gameState.js';
import { UI }        from './ui.js';

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
const ambient = new THREE.AmbientLight(0xffffff, 1.4);
scene.add(ambient);

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
const defaultDir = new THREE.Vector3(0, 0, -1);
const aimArrow   = new THREE.ArrowHelper(defaultDir, new THREE.Vector3(0, 1.5, 0), 3.2, 0x00ccff, 0.7, 0.45);
scene.add(aimArrow);

// ─── Mouse / Aim State ────────────────────────────────────────────────────────
let aimAngle = Math.PI; // Math.sin(π)=0, Math.cos(π)=-1 → default facing -Z
let aimX = 0;
let aimZ = -1; // default: aim away from viewer

// ─── Keyboard Input ───────────────────────────────────────────────────────────
const keys = { ArrowLeft: false, ArrowRight: false };

document.addEventListener('keydown', (e) => {
  if (e.key in keys) {
    keys[e.key] = true;
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key in keys) {
    keys[e.key] = false;
    e.preventDefault();
  }
});

// Continuously rotate aim left/right — infinite rotation
const ROTATE_SPEED = 2.2; // radians per second

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
let   camAimX   = 0;  // camera orbits based on this — locked to aim dir at launch
let   camAimZ   = -1;

// ─── Game Flow ────────────────────────────────────────────────────────────────
function initGame() {
  state.reset();
  arena.spawnHexagons();
  player.setPosition(0, 0, arena.platformY);
  phys.stop();
  ui.hideGameOver();
  camAimX = aimX;
  camAimZ = aimZ;
  startRound();
}

function startRound() {
  ui.updateHUD(state.round + 1, state.meterPercent, state.personalBest);
  ui.setShootEnabled(true);
}

function shoot() {
  if (phys.isMoving) return;
  ui.setShootEnabled(false);

  const dir = new THREE.Vector3(aimX, 0, aimZ);
  if (dir.length() < 0.01) dir.set(0, 0, -1);
  dir.normalize();

  // Lock camera direction to launch angle during slide
  camAimX = dir.x;
  camAimZ = dir.z;

  phys.launch(dir.x, dir.z, state.launchSpeed);
}

function onLanded(hitIndex) {
  if (hitIndex >= 0) {
    // Success — remove hexagon, advance
    arena.removeHexagon(hitIndex);
    state.nextRound();
    startRound();
  } else {
    // Miss — game over
    state.savePersonalBest();
    ui.showGameOver(state.score, state.personalBest);
  }
}

// ─── Animation Loop ───────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05); // cap to prevent huge jumps

  // Update aim from arrow keys
  updateAimFromKeys(delta);

  // Physics update while moving
  if (phys.isMoving) {
    const stopped = phys.update(player.group.position, delta);
    if (stopped) {
      const hitIdx = arena.checkLanding(player.position.x, player.position.z);
      onLanded(hitIdx);
    }
  }

  // When idle: update aim arrow + player facing from live mouse
  if (!phys.isMoving) {
    const aimDir = new THREE.Vector3(aimX, 0, aimZ).normalize();
    aimArrow.position.copy(player.position).setY(player.position.y + 1.4);
    aimArrow.setDirection(aimDir);
    aimArrow.visible = true;

    // Rotate character to face aim direction
    player.setFacing(Math.atan2(aimX, aimZ));
  } else {
    aimArrow.visible = false;
  }

  // Smooth camera follow — use live aim when idle, locked aim when sliding
  const usedAimX = phys.isMoving ? camAimX : aimX;
  const usedAimZ = phys.isMoving ? camAimZ : aimZ;
  const len      = Math.sqrt(usedAimX * usedAimX + usedAimZ * usedAimZ);
  const nax      = len > 0.01 ? usedAimX / len : 0;
  const naz      = len > 0.01 ? usedAimZ / len : -1;

  const targetCam = new THREE.Vector3(
    player.position.x - nax * 12,
    player.position.y + 10,
    player.position.z - naz * 12,
  );
  const targetLook = new THREE.Vector3(
    player.position.x,
    player.position.y + 0.6,
    player.position.z,
  );

  camPos.lerp(targetCam, 0.05);
  camLookAt.lerp(targetLook, 0.07);
  camera.position.copy(camPos);
  camera.lookAt(camLookAt);

  renderer.render(scene, camera);
}

// ─── Events ───────────────────────────────────────────────────────────────────
ui.onShoot(shoot);
ui.onRestart(initGame);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
initGame();
animate();
