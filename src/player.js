import * as THREE from 'three';
import { Projectile } from './Projectile.js';

export class Player {
    constructor(camera, scene) {
        if (!camera || !scene) {
            console.error('Camera and scene must be provided!');
            return;
        }
        this.camera = camera;
        this.scene = scene;
        this.size = 2;
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Front
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Back
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Top
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Bottom
            new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Left
            new THREE.MeshBasicMaterial({ color: 0xff0000 })   // Right
        ];
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.size, this.size, this.size),
            materials
        );
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.order = 'YXZ';
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 5;
        this.controls = {
            forward: false, backward: false, left: false, right: false,
            fire: false, rotateLeft: false, rotateRight: false
        };
        this.projectiles = [];
        this.health = 100;  // Player health set to 100
        this.bindControls();
    }

    bindControls() {
        window.addEventListener('keydown', (event) => this.onKeyDown(event), false);
        window.addEventListener('keyup', (event) => this.onKeyUp(event), false);
    }

    onKeyDown(event) {
        if (event.key === 'w') this.controls.forward = true;
        if (event.key === 's') this.controls.backward = true;
        if (event.key === 'a') this.controls.left = true;
        if (event.key === 'd') this.controls.right = true;
        if (event.key === ' ' && !this.controls.fire) {
          this.controls.fire = true;
          this.fire();
        }
        if (event.key === 'ArrowLeft') this.controls.rotateLeft = true;
        if (event.key === 'ArrowRight') this.controls.rotateRight = true;
    }

    onKeyUp(event) {
        if (event.key === 'w') this.controls.forward = false;
        if (event.key === 's') this.controls.backward = false;
        if (event.key === 'a') this.controls.left = false;
        if (event.key === 'd') this.controls.right = false;
        if (event.key === ' ') this.controls.fire = false;
        if (event.key === 'ArrowLeft') this.controls.rotateLeft = false;
        if (event.key === 'ArrowRight') this.controls.rotateRight = false;
    }
    // Method to handle player damage
    takeDamage(amount) {
        this.health -= amount;
    }

    fire() {
        // Get front direction
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.mesh.quaternion).normalize();
        // Set projectile start position just in front of the cube
        const offset = direction.clone().multiplyScalar(this.size / 2 + 0.1);
        const projectilePosition = this.mesh.position.clone().add(offset);
        // Set projectile speed and lifetime
        const projectileSpeed = 20;
        const projectileLifetime = 10; // Increased lifetime to 10 seconds
        const projectile = new Projectile(projectilePosition, direction, projectileSpeed, projectileLifetime); // Added lifetime
        this.projectiles.push(projectile);
        this.scene.add(projectile.mesh); // Add to scene when created
    }

    update(delta) {
        const direction = new THREE.Vector3();
        if (this.controls.forward) direction.z -= 1;
        if (this.controls.backward) direction.z += 1;
        if (this.controls.left) direction.x -= 1;
        if (this.controls.right) direction.x += 1;

        direction.normalize().multiplyScalar(this.speed * delta);
        this.velocity.add(direction);
        this.mesh.position.add(this.velocity);

        this.velocity.multiplyScalar(0.95);

        this.mesh.position.x = Math.max(-50, Math.min(50, this.mesh.position.x));
        this.mesh.position.z = Math.max(-50, Math.min(50, this.mesh.position.z));

        if (this.controls.rotateLeft) this.mesh.rotation.y -= 0.1;
        if (this.controls.rotateRight) this.mesh.rotation.y += 0.1;

        this.projectiles.forEach(p => p.update(delta));
        this.projectiles = this.projectiles.filter(p => p.isAlive);
    }
}
