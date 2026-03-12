import * as THREE from 'three';

const TILE_SIZE   = 1.0;
const TILE_HEIGHT = 0.12;

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._buildTile();
    this._buildCharacter();
    scene.add(this.group);
  }

  _buildTile() {
    // Square platform tile the character stands on
    const geo = new THREE.BoxGeometry(TILE_SIZE, TILE_HEIGHT, TILE_SIZE);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x0055cc,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.92,
    });
    this.tileMesh = new THREE.Mesh(geo, mat);
    this.tileMesh.position.y = TILE_HEIGHT / 2;
    this.group.add(this.tileMesh);

    // Glowing edges on tile
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x44bbff });
    const edges   = new THREE.LineSegments(edgeGeo, edgeMat);
    this.tileMesh.add(edges);
  }

  _buildCharacter() {
    this.charGroup = new THREE.Group();
    this.charGroup.position.y = TILE_HEIGHT; // sit on top of tile

    const white = new THREE.MeshPhongMaterial({
      color: 0xf4f8ff,
      emissive: 0x001133,
      emissiveIntensity: 0.15,
    });
    const accent = new THREE.MeshPhongMaterial({
      color: 0x00ccff,
      emissive: 0x00aaff,
      emissiveIntensity: 0.8,
    });

    // Legs
    [-0.13, 0.13].forEach(xOff => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.36, 8), white);
      leg.position.set(xOff, 0.18, 0);
      this.charGroup.add(leg);
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.24), white);
    torso.position.set(0, 0.58, 0);
    this.charGroup.add(torso);

    // Chest accent strip
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.26, 0.26), accent);
    chest.position.set(0, 0.58, 0);
    this.charGroup.add(chest);

    // Arms
    [-0.30, 0.30].forEach((xOff, i) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.38, 8), white);
      arm.rotation.z = xOff > 0 ? -0.25 : 0.25;
      arm.position.set(xOff, 0.54, 0);
      this.charGroup.add(arm);
    });

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), white);
    neck.position.set(0, 0.88, 0);
    this.charGroup.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.32), white);
    head.position.set(0, 1.08, 0);
    this.charGroup.add(head);

    // Eyes
    [-0.08, 0.08].forEach(xOff => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), accent);
      eye.position.set(xOff, 1.10, 0.16);
      this.charGroup.add(eye);
    });

    this.group.add(this.charGroup);
  }

  setPosition(x, z, platformY) {
    this.group.position.set(x, platformY, z);
  }

  // angle in radians (Three.js rotation.y)
  setFacing(angle) {
    this.charGroup.rotation.y = angle;
  }

  get position() {
    return this.group.position;
  }
}
