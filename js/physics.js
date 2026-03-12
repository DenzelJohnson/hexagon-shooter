import { PLATFORM_HALF } from './arena.js';

const FRICTION        = 1.8;  // exponential decay rate (higher = stops faster)
const STOP_THRESHOLD  = 0.3;  // units/sec — below this, consider stopped

export class Physics {
  constructor() {
    this.vx        = 0;
    this.vz        = 0;
    this.isMoving  = false;
  }

  launch(dirX, dirZ, speed) {
    this.vx       = dirX * speed;
    this.vz       = dirZ * speed;
    this.isMoving = true;
  }

  stop() {
    this.vx       = 0;
    this.vz       = 0;
    this.isMoving = false;
  }

  // Updates player group position. Returns true when the player just stopped this frame.
  update(position, deltaTime) {
    if (!this.isMoving) return false;

    // Move
    position.x += this.vx * deltaTime;
    position.z += this.vz * deltaTime;

    // Boundary bounce — reflect velocity, clamp position to edge
    if (position.x > PLATFORM_HALF) {
      position.x = PLATFORM_HALF;
      this.vx    = -Math.abs(this.vx);
    } else if (position.x < -PLATFORM_HALF) {
      position.x = -PLATFORM_HALF;
      this.vx    = Math.abs(this.vx);
    }

    if (position.z > PLATFORM_HALF) {
      position.z = PLATFORM_HALF;
      this.vz    = -Math.abs(this.vz);
    } else if (position.z < -PLATFORM_HALF) {
      position.z = -PLATFORM_HALF;
      this.vz    = Math.abs(this.vz);
    }

    // Friction — exponential decay, frame-rate independent
    const decay = Math.exp(-FRICTION * deltaTime);
    this.vx *= decay;
    this.vz *= decay;

    // Stop check
    const speed = Math.sqrt(this.vx * this.vx + this.vz * this.vz);
    if (speed < STOP_THRESHOLD) {
      this.stop();
      return true; // just stopped
    }

    return false;
  }
}
