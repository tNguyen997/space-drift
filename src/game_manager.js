import * as THREE from 'three';
import { Player } from './player.js';
import { AIPlayer } from './AIPlayer.js';
import { CollisionDetector } from './collision_detector.js';
import { UIManager } from './ui_manager.js';

export class GameManager {
    constructor(renderer) {
        this.gameRenderer = renderer;
        this.player = null;
        this.aiPlayers = [];
        this.clock = new THREE.Clock();
        // Game settings
        this.MAX_AI_COUNT = 64;
        this.spawnInterval = 5; // seconds
        this.aiSpawnTimer = 0;
        this.totalSpawnedAI = 0;
        // Game state, 'menu', 'playing', 'paused', 'gameOver'
        this.gameState = 'menu'; 
        this.survivalTime = 0;
        // Parse stored survival times, convert old format if necessary
        const storedTimes = JSON.parse(localStorage.getItem('survivalTimes')) || [];
        this.survivalTimes = storedTimes.map(item => {
            // Check if item is in old format (just a number)
            if (typeof item === 'number') {
                return {
                    time: item,
                    score: 0 // Default score for old records
                };
            }
            return item;
        });
        // UI Elements
        this.menuElement = document.getElementById('menu');
        this.startButton = document.getElementById('startButton');
        this.survivalTimesList = document.getElementById('survivalTimesList');
        // Initialize managers
        this.collisionDetector = new CollisionDetector();
        this.uiManager = new UIManager(this);
        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startNewGame());
        window.addEventListener('keydown', (event) => this.handleKeyPress(event), false); // Add key listener
        this.initializeGame();
    }

    initializeGame() {
        // Create initial scene setup
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
        );
        plane.rotation.x = -Math.PI / 2;
        this.gameRenderer.getScene().add(plane);
        // Create player
        this.player = new Player(this.gameRenderer.getCamera(), this.gameRenderer.getScene());
        this.gameRenderer.getScene().add(this.player.mesh);
        // Display initial survival times
        this.uiManager.displaySurvivalTimes(this.survivalTimes);
    }

    resetGame() {
        // Clean up player projectiles
        if (this.player) {
            this.player.projectiles.forEach(p => {
                if (p.mesh) this.gameRenderer.getScene().remove(p.mesh);
            });
            this.player.projectiles = [];
        }
        // Rebuild game scene
        const light = new THREE.AmbientLight(0xffffff, 1);
        this.gameRenderer.getScene().add(light);
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide })
        );
        plane.rotation.x = -Math.PI / 2;
        this.gameRenderer.getScene().add(plane);
        // Reset player
        this.player = new Player(this.gameRenderer.getCamera(), this.gameRenderer.getScene());
        this.player.health = 100;
        this.gameRenderer.getScene().add(this.player.mesh);
        // Spawn initial AI
        this.spawnAI(1);
    }

    startNewGame() {
        this.gameState = 'playing';
        this.survivalTime = 0;
        this.aiPlayers = [];
        this.aiSpawnTimer = 0;
        this.totalSpawnedAI = 0;
        // Clean up scene
        this.gameRenderer.cleanScene();
        // Reset game state and rebuild scene
        this.resetGame();
        // Update UI
        this.uiManager.hideMenu();
        // Start game loop
        this.clock.start();
        this.gameLoop();
    }

    spawnAI(count) {
        for (let i = 0; i < count; i++) {
            const ai = new AIPlayer(this.gameRenderer.getScene(), this.player);
            ai.mesh.position.set(
                (Math.random() - 0.5) * 60,
                0,
                (Math.random() - 0.5) * 60
            );
            ai.canTeleport = true;
            ai.fireMultipleProjectiles = true;
            ai.evasiveManeuvers = true;
            this.aiPlayers.push(ai);
            this.totalSpawnedAI++;
        }
    }

    handleGameOver() {
        this.gameState = 'gameOver';
        // Calculate final score
        const finalScore = (this.totalSpawnedAI - this.aiPlayers.length) * 100;
        // Store both time and score
        const gameResult = {
            time: this.survivalTime,
            score: finalScore
        };
        // Add new result to the beginning of the array
        this.survivalTimes.unshift(gameResult);
        // Keep only the last 5 results
        if (this.survivalTimes.length > 5) {
            this.survivalTimes.pop();
        }
        // Save to localStorage
        localStorage.setItem('survivalTimes', JSON.stringify(this.survivalTimes));
        // Update UI
        this.uiManager.showMenu();
        this.uiManager.displaySurvivalTimes(this.survivalTimes);
    }

    handleKeyPress(event) {
        if (event.key === 'Enter') {
            this.togglePause();
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.clock.stop(); // Stop the clock when paused
            this.uiManager.showPauseScreen(); // Show pause UI
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.clock.start(); // Resume the clock
            this.uiManager.hidePauseScreen(); // Hide pause UI
            this.gameLoop(); // Re-initiate the game loop
        }
    }

    update(delta) {
        if (this.gameState !== 'playing') return;
        this.aiSpawnTimer += delta;
        if (this.aiSpawnTimer >= this.spawnInterval && this.aiPlayers.length < this.MAX_AI_COUNT) {
            this.aiSpawnTimer = 0;
            const currentCount = this.aiPlayers.length;
            if (currentCount === 0) {
                this.spawnAI(1);
            } else {
                const newCount = Math.min(currentCount * 2, this.MAX_AI_COUNT - currentCount);
                this.spawnAI(newCount);
            }
        }
        // Update entities
        this.player.update(delta);
        this.aiPlayers.forEach(ai => ai.update(delta));
        // Handle collisions using CollisionDetector
        this.collisionDetector.update(
            this.player, 
            this.aiPlayers, 
            this.gameRenderer.getScene()
        );
        // Remove dead AI
        this.aiPlayers = this.aiPlayers.filter(ai => !ai.isRemoving);
        // Check game over condition
        if (this.player.health <= 0) {
            this.handleGameOver();
            return;
        }
        this.survivalTime += delta;
        // Update UI
        this.uiManager.update();
    }

    gameLoop() {
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            requestAnimationFrame(() => this.gameLoop());
        }
        if (this.gameState === 'playing') {
            const delta = this.clock.getDelta();
            this.update(delta);
            this.gameRenderer.render();
        }
    }
} 