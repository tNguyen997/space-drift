import * as THREE from 'three';

export class Projectile {
    constructor(position, direction, speed = 10, lifetime = 3, color = 0xff0000) {
        this.radius = 0.5;
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.radius),
            new THREE.MeshBasicMaterial({ color: color })
        );
        this.mesh.position.copy(position);
        this.direction = direction.normalize();
        this.speed = speed;
        this.lifetime = 0;
        this.maxLifetime = lifetime;
        this.isAlive = true;
        this.bounces = 0; // Initialize bounce counter
        this.maxBounces = 2; // Set the maximum number of bounces
    }

    update(delta) {
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * delta));
        // Bounce the projectile off the arena boundaries
        if (Math.abs(this.mesh.position.x) > 50 - this.radius) {
            this.direction.x *= -1; // Reverse direction on the X-axis
            this.bounces++; // Increment bounce counter
        }
        if (Math.abs(this.mesh.position.z) > 50 - this.radius) {
            this.direction.z *= -1; // Reverse direction on the Z-axis
            this.bounces++; // Increment bounce counter
        }
        // Disappear after reaching the maximum number of bounces
        if (this.bounces >= this.maxBounces) {
            this.isAlive = false;
            this.mesh.visible = false; // Optional: Hide the mesh
        }
        // Also consider the maximum lifetime as a fallback
        this.lifetime += delta;
        if (this.lifetime > this.maxLifetime && this.isAlive) {
            this.isAlive = false;
            this.mesh.visible = false;
        }
    }
}