import * as THREE from 'three';

export class Arena {
    constructor() {
      this.arena = null;
    }

    // Function to create the arena
    create() {
      // Create a simple flat arena (large plane)
      const arenaGeometry = new THREE.PlaneGeometry(100, 100);
      const arenaMaterial = new THREE.MeshBasicMaterial({ color: 0x777777, side: THREE.DoubleSide });
      this.arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
      this.arena.rotation.x = Math.PI / 2; // Rotate it to lie flat
      this.arena.position.y = -0.5; // Slightly lower than the player position

      return this.arena;
    }
}
