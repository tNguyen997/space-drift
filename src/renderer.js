import * as THREE from 'three';

export class GameRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.light = null;
    }
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 40, 80);
        this.camera.lookAt(0, 0, 0);
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        // Add lighting
        this.light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.light);
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        return this;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    getScene() {
        return this.scene;
    }
    getCamera() {
        return this.camera;
    }
    // Clean up scene except camera
    cleanScene() {
        for (let i = this.scene.children.length - 1; i >= 0; i--) {
            const obj = this.scene.children[i];
            if (obj !== this.camera) {
                this.scene.remove(obj);
            }
        }
    }
} 