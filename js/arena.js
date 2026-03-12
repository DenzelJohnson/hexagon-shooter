import * as THREE from 'three';

export const PLATFORM_HALF = 19; // physics boundary (platform is 40x40, so ±20 but leave 1 unit margin)

const PLATFORM_SIZE      = 40;
const PLATFORM_THICKNESS = 0.4;
const HEX_RADIUS         = 2.0;
const HEX_HEIGHT         = 0.18;
const HEX_COUNT_TARGET   = 85;
const HEX_MIN_SPACING    = HEX_RADIUS * 2 + 0.7; // minimum center-to-center distance
const PLAYER_START_CLEAR = 4.5;                    // keep center clear for player spawn

export class Arena {
  constructor(scene) {
    this.scene    = scene;
    this.hexagons = []; // array of { mesh: THREE.Group, x: number, z: number }
    this.platformY = PLATFORM_THICKNESS / 2; // Y of the platform's top surface

    this._buildPlatform();
    this._buildClouds();
    this._buildDistantGround();
  }

  _buildPlatform() {
    // Transparent glass slab
    const geo = new THREE.BoxGeometry(PLATFORM_SIZE, PLATFORM_THICKNESS, PLATFORM_SIZE);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const platform = new THREE.Mesh(geo, mat);
    platform.position.y = 0;
    this.scene.add(platform);

    // Edge highlight lines
    const edges   = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x88ccff, opacity: 0.45, transparent: true });
    const lines   = new THREE.LineSegments(edges, edgeMat);
    platform.add(lines);

    // Subtle grid on the platform surface using a grid of thin lines
    this._buildGrid();
  }

  _buildGrid() {
    const mat      = new THREE.LineBasicMaterial({ color: 0xaaccee, opacity: 0.18, transparent: true });
    const halfSize = PLATFORM_HALF;
    const step     = 4;
    const yPos     = this.platformY + 0.01;

    const points = [];
    for (let i = -halfSize; i <= halfSize; i += step) {
      points.push(new THREE.Vector3(i, yPos, -halfSize));
      points.push(new THREE.Vector3(i, yPos, halfSize));
      points.push(new THREE.Vector3(-halfSize, yPos, i));
      points.push(new THREE.Vector3(halfSize, yPos, i));
    }
    const geo   = new THREE.BufferGeometry().setFromPoints(points);
    const lines = new THREE.LineSegments(geo, mat);
    this.scene.add(lines);
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
        puff.position.set(offsets[i][0], offsets[i][1], offsets[i][2]);
        cloud.add(puff);
      });
      cloud.position.set(...pos);
      this.scene.add(cloud);
    });
  }

  _buildDistantGround() {
    // Far-below ground plane to reinforce sense of height
    const geo = new THREE.PlaneGeometry(400, 400);
    const mat = new THREE.MeshPhongMaterial({ color: 0xc8dde8, transparent: true, opacity: 0.35 });
    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -90;
    this.scene.add(ground);
  }

  // Called at game start — place hexagons randomly across the platform
  spawnHexagons() {
    this.hexagons.forEach(h => this.scene.remove(h.mesh));
    this.hexagons = [];

    const placed   = [];
    const range    = PLATFORM_HALF - HEX_RADIUS - 0.5;
    let   attempts = 0;
    const maxAtt   = HEX_COUNT_TARGET * 25;

    while (placed.length < HEX_COUNT_TARGET && attempts < maxAtt) {
      attempts++;
      const x = (Math.random() * 2 - 1) * range;
      const z = (Math.random() * 2 - 1) * range;

      // Keep center clear for player spawn
      if (Math.sqrt(x * x + z * z) < PLAYER_START_CLEAR) continue;

      // Check spacing against already-placed hexagons
      let valid = true;
      for (const p of placed) {
        const dx = p.x - x;
        const dz = p.z - z;
        if (Math.sqrt(dx * dx + dz * dz) < HEX_MIN_SPACING) {
          valid = false;
          break;
        }
      }

      if (valid) {
        placed.push({ x, z });
        this._createHexMesh(x, z);
      }
    }
  }

  _createHexMesh(x, z) {
    const group = new THREE.Group();

    // Hex body
    const geo = new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS, HEX_HEIGHT, 6);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xf0f8ff,
      emissive: 0x002244,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.80,
    });
    const body = new THREE.Mesh(geo, mat);
    group.add(body);

    // Glowing edge outline
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ccff });
    const edges   = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edges);

    group.position.set(x, this.platformY + HEX_HEIGHT / 2, z);
    this.scene.add(group);

    this.hexagons.push({ mesh: group, x, z });
  }

  // Returns the index of the hexagon the player landed on, or -1.
  // Uses closest-point-on-square to hexagon-center distance so that
  // ANY overlap between the 1×1 square and the hexagon counts.
  checkLanding(px, pz) {
    const threshold = HEX_RADIUS * 0.87; // ≈ inscribed radius
    const h = 0.5; // half-width of the 1×1 square tile
    for (let i = 0; i < this.hexagons.length; i++) {
      const { x, z } = this.hexagons[i];
      // Closest point on the square to the hexagon center
      const cx = Math.max(px - h, Math.min(x, px + h));
      const cz = Math.max(pz - h, Math.min(z, pz + h));
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

  get hexCount() {
    return this.hexagons.length;
  }
}
