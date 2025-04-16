import * as THREE from 'three';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        // HTML UI Elements
        this.menuElement = document.getElementById('menu');
        this.startButton = document.getElementById('startButton');
        this.survivalTimesList = document.getElementById('survivalTimesList');     
        // Game UI Elements
        this.gameUI = document.createElement('div');
        this.gameUI.id = 'gameUI';
        document.body.appendChild(this.gameUI);
        // Create UI elements
        this.createGameUI();
        // 3D Text for floating damage numbers
        this.damageTexts = [];
        // Pause Screen Element
        this.pauseScreen = null;
        this.createPauseScreen();
        // Bind event listeners
        this.startButton.addEventListener('click', () => this.gameManager.startNewGame());
    }

    createGameUI() {
        // Create HTML UI elements
        this.gameUI.innerHTML = `
            <div class="stats">
                <div id="health">Health: 100</div>
                <div id="score">Score: 0</div>
                <div id="wave">Wave: 1</div>
                <div id="survival-time">Time: 0.00s</div>
            </div>
            <div class="controls-legend">
                <h3>Controls</h3>
                <div class="control-group">
                    <div class="control-item">
                        <span class="key">W A S D</span>
                        <span class="action">Movement</span>
                    </div>
                    <div class="control-item">
                        <span class="key">←→</span>
                        <span class="action">Rotate</span>
                    </div>
                    <div class="control-item">
                        <span class="key">SPACE</span>
                        <span class="action">Fire</span>
                    </div>
                    <div class="control-item">
                        <span class="key">ENTER</span>
                        <span class="action">Pause/Resume</span>
                    </div>
                </div>
            </div>
        `;
        // Get references to UI elements
        this.healthDisplay = document.getElementById('health');
        this.scoreDisplay = document.getElementById('score');
        this.waveDisplay = document.getElementById('wave');
        this.timeDisplay = document.getElementById('survival-time');
    }

    createPauseScreen() {
        this.pauseScreen = document.createElement('div');
        this.pauseScreen.id = 'pauseScreen';
        this.pauseScreen.innerHTML = `
            <h2>Paused</h2>
            <p>Press Enter to Resume</p>
        `;
        this.pauseScreen.style.display = 'none'; // Initially hidden
        document.body.appendChild(this.pauseScreen);
    }

    showMenu() {
        this.menuElement.style.display = 'block';
        this.gameUI.style.display = 'none';
        this.hidePauseScreen(); // Also hide pause screen if game ends while paused
    }

    hideMenu() {
        this.menuElement.style.display = 'none';
        this.gameUI.style.display = 'block';
    }

    updateHealth(health) {
        this.healthDisplay.textContent = `Health: ${health}`;
        this.healthDisplay.style.color = health <= 25 ? 'red' : 'white';
    }

    updateScore(score) {
        this.scoreDisplay.textContent = `Score: ${score}`;
    }

    updateWave(wave) {
        this.waveDisplay.textContent = `Wave: ${wave}`;
    }

    updateSurvivalTime(time) {
        this.timeDisplay.textContent = `Time: ${time.toFixed(2)}s`;
    }

    displaySurvivalTimes(times) {
        this.survivalTimesList.innerHTML = '';
        
        // Sort by score (primary) and time (secondary) if scores are equal
        const sortedTimes = [...times].sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.time - a.time;
        });

        sortedTimes.slice(0, 5).forEach((result, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="survival-record">
                    <span class="rank">#${index + 1}</span>
                    <span class="time">Time: ${result.time.toFixed(2)}s</span>
                    <span class="score">Score: ${result.score}</span>
                </div>
            `;
            this.survivalTimesList.appendChild(li);
        });
    }
    // Create floating damage text in 3D space
    showDamageText(position, damage) {
        const scene = this.gameManager.gameRenderer.getScene();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        // Set canvas properties
        canvas.width = 100;
        canvas.height = 100;
        context.font = 'bold 60px Arial';
        context.fillStyle = 'red';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(damage.toString(), 50, 50);

        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Position sprite and add to scene
        sprite.position.copy(position);
        sprite.position.y += 2;
        sprite.scale.set(2, 2, 1);
        scene.add(sprite);

        // Animate and remove
        const startTime = Date.now();
        const duration = 1000; // 1 second duration

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress < 1) {
                sprite.position.y += 0.01;
                sprite.material.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                scene.remove(sprite);
                sprite.material.dispose();
                sprite.geometry.dispose();
            }
        };

        animate();
    }
    showPauseScreen() {
        if (this.pauseScreen) {
            this.pauseScreen.style.display = 'flex';
        }
    }
    hidePauseScreen() {
        if (this.pauseScreen) {
            this.pauseScreen.style.display = 'none';
        }
    }
    update() {
        if (this.gameManager.gameState === 'playing') {
            this.updateHealth(this.gameManager.player.health);
            this.updateSurvivalTime(this.gameManager.survivalTime);
            // Calculate wave based on survival time or AI count
            const wave = Math.floor(this.gameManager.survivalTime / this.gameManager.spawnInterval) + 1;
            this.updateWave(wave);
            // Calculate score based on eliminated AIs
            const score = (this.gameManager.totalSpawnedAI - this.gameManager.aiPlayers.length) * 100;
            this.updateScore(score);
        }
    }
} 