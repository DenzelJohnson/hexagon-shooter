import * as THREE from 'three';

export const PLATFORM_HALF = 19;

const PLATFORM_SIZE      = 40;
const PLATFORM_THICKNESS = 0.4;
const HEX_HEIGHT         = 0.18;
const PLAYER_START_CLEAR = 4.5;

export class Arena {
  constructor(scene) {
    this.scene     = scene;
    this.hexagons  = [];
    this.platformY = PLATFORM_THICKNESS / 2;
    this.hexRadius = 2.0;
    this.time      = 0;

    this._buildPlatform();
    this._buildClouds();
    this._buildDistantGround();
  }

  // ─── Spawn hexagons according to level config ─────────────────────────────
  spawnHexagons(config) {
    this.hexagons.forEach(h => this.scene.remove(h.mesh));
    this.hexagons = [];
    this.time     = 0;

    const radius           = config ? config.hexRadius           : 2.0;
    const hexCount         = config ? config.hexCount            : 85;
    const spacingExtra     = config ? config.hexMinSpacingExtra  : 0.7;
    const movingCount      = config ? config.movingTileCount     : 0;
    const timedCount       = config ? config.timedTileCount      : 0;

    this.hexRadius = radius;
    const MIN_SPACING = radius * 2 + spacingExtra;
    const range       = PLATFORM_HALF - radius - 0.5;
    const placed      = [];
    let   attempts    = 0;
    const maxAtt      = hexCount * 30;

    while (placed.length < hexCount && attempts < maxAtt) {
      attempts++;
      const x = (Math.random() * 2 - 1) * range;
      const z = (Math.random() * 2 - 1) * range;
      if (Math.sqrt(x * x + z * z) < PLAYER_START_CLEAR) continue;

      let valid = true;
      for (const p of placed) {
        if (Math.sqrt((p.x - x) ** 2 + (p.z - z) ** 2) < MIN_SPACING) {
          valid = false; break;
        }
      }
      if (valid) {
        placed.push({ x, z });
        this._createHexMesh(x, z, radius, 'normal');
      }
    }

    // ── Designate moving tiles ──
    const allIndices = Array.from({ length: this.hexagons.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5);
    allIndices.slice(0, movingCount).forEach(i => {
      const h = this.hexagons[i];
      h.type      = 'moving';
      h.baseX     = h.x;
      h.baseZ     = h.z;
      h.axis      = Math.random() < 0.5 ? 'x' : 'z';
      h.amplitude = 3 + Math.random() * 3;   // 3–6 units
      h.speed     = 0.8 + Math.random() * 0.8; // 0.8–1.6 rad/s
      h.phase     = Math.random() * Math.PI * 2;
      // Green/teal appearance
      h.mesh.children[0].material.color.setHex(0x00ddaa);
      h.mesh.children[0].material.emissive.setHex(0x003322);
      h.mesh.children[1].material.color.setHex(0x00ffcc);
    });

    // ── Designate timed tiles (non-moving only) ──
    const nonMoving = Array.from({ length: this.hexagons.length }, (_, i) => i)
      .filter(i => this.hexagons[i].type === 'normal')
      .sort(() => Math.random() - 0.5);
    nonMoving.slice(0, timedCount).forEach(i => {
      const h = this.hexagons[i];
      h.type = 'timed';
      // Orange/warm appearance
      h.mesh.children[0].material.color.setHex(0xff7700);
      h.mesh.children[0].material.emissive.setHex(0x441100);
      h.mesh.children[1].material.color.setHex(0xff5500);
    });
  }

  // ─── Per-frame update: move the moving tiles ──────────────────────────────
  update(delta) {
    this.time += delta;
    for (const h of this.hexagons) {
      if (h.type !== 'moving') continue;
      const offset = h.amplitude * Math.sin(h.speed * this.time + h.phase);
      if (h.axis === 'x') {
        h.x = h.baseX + offset;
        h.mesh.position.x = h.x;
      } else {
        h.z = h.baseZ + offset;
        h.mesh.position.z = h.z;
      }
    }
  }

  // ─── Landing check: closest point on 1×1 square to hex center ────────────
  checkLanding(px, pz) {
    const threshold = this.hexRadius * 0.87;
    const h = 0.5;
    for (let i = 0; i < this.hexagons.length; i++) {
      const { x, z } = this.hexagons[i];
      const cx   = Math.max(px - h, Math.min(x, px + h));
      const cz   = Math.max(pz - h, Math.min(z, pz + h));
      const dist = Math.sqrt((cx - x) ** 2 + (cz - z) ** 2);
      if (dist < threshold) return i;
    }
    return -1;
  }

  removeHexagon(index) {
    const hex = this.hexagons[index];
    if (!hex) return;
    this.scene.remove(hex.mesh);
    this.hexagons.splice(index, 1);
  }

  get hexCount() { return this.hexagons.length; }

  // ─── Private builders (unchanged) ─────────────────────────────────────────

  _createHexMesh(x, z, radius, type) {
    const group = new THREE.Group();

    const geo = new THREE.CylinderGeometry(radius, radius, HEX_HEIGHT, 6);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xf0f8ff,
      emissive: 0x002244,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.80,
    });
    group.add(new THREE.Mesh(geo, mat));

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ccff });
    group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));

    group.position.set(x, this.platformY + HEX_HEIGHT / 2, z);
    this.scene.add(group);
    this.hexagons.push({ mesh: group, x, z, type: 'normal' });
  }

  _buildPlatform() {
    const geo = new THREE.BoxGeometry(PLATFORM_SIZE, PLATFORM_THICKNESS, PLATFORM_SIZE);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xaaddff, transparent: true, opacity: 0.22, side: THREE.DoubleSide,
    });
    const platform = new THREE.Mesh(geo, mat);
    platform.position.y = 0;
    this.scene.add(platform);
    platform.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x88ccff, opacity: 0.45, transparent: true })
    ));
    this._buildGrid();
  }

  _buildGrid() {
    const mat      = new THREE.LineBasicMaterial({ color: 0xaaccee, opacity: 0.18, transparent: true });
    const halfSize = PLATFORM_HALF;
    const step     = 4;
    const yPos     = this.platformY + 0.01;
    const points   = [];
    for (let i = -halfSize; i <= halfSize; i += step) {
      points.push(new THREE.Vector3(i, yPos, -halfSize));
      points.push(new THREE.Vector3(i, yPos,  halfSize));
      points.push(new THREE.Vector3(-halfSize, yPos, i));
      points.push(new THREE.Vector3( halfSize, yPos, i));
    }
    this.scene.add(new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points), mat
    ));
  }

  _buildClouds() {
    const cloudMat = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.88 });
    const configs  = [
      { pos: [-28, 36, -22], sizes: [4, 3.2, 2.8], offsets: [[0,0,0],[3,-0.5,1.5],[-2.5,-1,0]] },
      { pos: [12, 40, -32],  sizes: [3.5, 3, 2.5],  offsets: [[0,0,0],[2.5,-0.3,1],[-2,-0.8,-0.5]] },
      { pos: [32, 34, 14],   sizes: [5, 3.8, 3],    offsets: [[0,0,0],[3.5,-0.5,1.2],[-3,-1,0]] },
      { pos: [-36, 42, 8],   sizes: [3, 2.5, 2],    offsets: [[0,0,0],[2,-0.3,0.8],[-1.5,-0.6,0]] },
      { pos: [6, 44, 26],    sizes: [4.5, 3.5, 2.8], offsets: [[0,0,0],[3,-0.4,1.5],[-2.5,-0.9,0]] },
      { pos: [-14, 38, 42],  sizes: [3.8, 3, 2.3],  offsets: [[0,0,0],[2.8,-0.5,1],[-2,-0.8,0]] },
    ];
    configs.forEach(({ pos, sizes, offsets }) => {
      const cloud = new THREE.Group();
      sizes.forEach((s, i) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 8), cloudMat);
        puff.position.set(...offsets[i]);
        cloud.add(puff);
      });
      cloud.position.set(...pos);
      this.scene.add(cloud);
    });
  }

  _buildDistantGround() {
    const geo    = new THREE.PlaneGeometry(400, 400);
    const mat    = new THREE.MeshPhongMaterial({ color: 0xc8dde8, transparent: true, opacity: 0.35 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -90;
    this.scene.add(ground);
  }
}
