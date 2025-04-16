import { GameRenderer } from './renderer.js';
import { GameManager } from './game_manager.js';

let gameRenderer, gameManager;

function init() {
    // Initialize renderer
    gameRenderer = new GameRenderer().init();
    // Initialize game manager with renderer
    gameManager = new GameManager(gameRenderer);
}
// Initialize everything on page load
window.addEventListener('load', init);
