import * as THREE from 'three';
import { Projectile } from './projectile.js';

export class AIPlayer {
    constructor(scene, target, initialHealth = 5) {
        if (!scene || !target) {
            console.error('Scene and target (player) must be provided!');
            return;
        }
        this.scene = scene;
        this.target = target;
        this.size = 2;
       
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 32, 32),
            material
        );

        this.mesh.position.set(20, 0, 20);
        this.mesh.rotation.order = 'YXZ';
        this.projectiles = [];
        this.fireCooldown = 1;
        this.fireTimer = 0;
        this.speed = 2;
        this.health = initialHealth;
        this.isRemoving = false;

        this.canTeleport = false; 
        this.fireMultipleProjectiles = false; 
        this.evasiveManeuvers = false; 

        scene.add(this.mesh);
    }

    update(delta) {
        if (this.health <= 0 || this.isRemoving) {
            return;
        }
        const directionToPlayer = new THREE.Vector3().subVectors(this.target.mesh.position, this.mesh.position);
        directionToPlayer.y = 0;
        directionToPlayer.normalize().multiplyScalar(this.speed * delta);
        this.mesh.position.add(directionToPlayer);

        this.fireTimer += delta;
        if (this.fireTimer >= this.fireCooldown) {
            this.fire();
            this.fireTimer = 0;
        }

        this.projectiles.forEach(p => p.update(delta));
        this.projectiles = this.projectiles.filter(p => p.isAlive);
    }

    fire() {
        if (this.health <= 0 || this.isRemoving) {
            return;
        }
        const directionToPlayer = new THREE.Vector3().subVectors(this.target.mesh.position, this.mesh.position);
        directionToPlayer.y = 0;
        directionToPlayer.normalize();

        const projectile = new Projectile(this.mesh.position, directionToPlayer, 30, 5, 0xffffff);
        this.projectiles.push(projectile);
        this.scene.add(projectile.mesh);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && !this.isRemoving) {
            this.isRemoving = true;
            // Remove all projectiles associated with the AI
            this.projectiles.forEach((p) => {
                p.isAlive = false;
                this.scene.remove(p.mesh);
            });
            // Remove the AI mesh from the scene
            this.scene.remove(this.mesh);
        }
    }
}
