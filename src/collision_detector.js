export class CollisionDetector {
    constructor() {
        this.collisionHandlers = new Map();
    }
    // Check collision between projectile and entity (player or AI)
    checkProjectileCollision(projectile, entity, hitDistance) {
        if (!projectile.isAlive || (entity.isRemoving !== undefined && entity.isRemoving)) {
            return false;
        }
        const distance = projectile.mesh.position.distanceTo(entity.mesh.position);
        return distance < (entity.size + hitDistance);
    }
    // Handle collisions between AI projectiles and player
    handleAIProjectilesVsPlayer(aiPlayers, player, scene) {
        aiPlayers.forEach(ai => {
            ai.projectiles.forEach(proj => {
                if (!proj.isAlive) return;
                if (this.checkProjectileCollision(proj, player, 0.5)) {
                    player.takeDamage(1);
                    proj.isAlive = false;
                    scene.remove(proj.mesh);
                }
            });
        });
    }
    // Handle collisions between player projectiles and AI
    handlePlayerProjectilesVsAI(player, aiPlayers, scene) {
        player.projectiles.forEach(proj => {
            aiPlayers.forEach(ai => {
                if (!proj.isAlive || ai.isRemoving) return;
                if (this.checkProjectileCollision(proj, ai, 0.5)) {
                    ai.takeDamage(1);
                    proj.isAlive = false;
                    scene.remove(proj.mesh);
                }
            });
        });
    }
    // Clean up dead projectiles
    cleanupDeadProjectiles(entities, scene) {
        entities.forEach(entity => {
            entity.projectiles = entity.projectiles.filter(proj => {
                if (!proj.isAlive) {
                    scene.remove(proj.mesh);
                    return false;
                }
                return true;
            });
        });
    }
    // Main update method to handle all collisions
    update(player, aiPlayers, scene) {
        // Handle all collisions
        this.handleAIProjectilesVsPlayer(aiPlayers, player, scene);
        this.handlePlayerProjectilesVsAI(player, aiPlayers, scene);
        // Clean up dead projectiles
        this.cleanupDeadProjectiles([player, ...aiPlayers], scene);
    }
} 