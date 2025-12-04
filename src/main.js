/**
 * WebGPU 3D Pachinko Machine
 * Main entry point
 */

import { Renderer } from './renderer.js';
import { PachinkoMachine } from './pachinko.js';
import { Physics } from './physics.js';
import { Camera } from './camera.js';

class PachinkoGame {
    constructor() {
        this.canvas = document.getElementById('webgpu-canvas');
        this.renderer = null;
        this.pachinko = null;
        this.physics = null;
        this.camera = null;
        this.score = 0;
        this.ballsRemaining = 10;
        this.launchPower = 0;
        this.isCharging = false;
        this.lastTime = 0;
        this.isRunning = false;
    }

    async init() {
        // Check WebGPU support
        if (!navigator.gpu) {
            this.showError();
            return false;
        }

        try {
            // Initialize renderer
            this.renderer = new Renderer(this.canvas);
            await this.renderer.init();

            // Initialize camera
            this.camera = new Camera(this.canvas);

            // Initialize physics
            this.physics = new Physics();

            // Initialize pachinko machine
            this.pachinko = new PachinkoMachine(this.renderer, this.physics);
            await this.pachinko.init();

            // Setup UI
            this.setupUI();
            this.setupControls();

            this.isRunning = true;
            return true;
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError();
            return false;
        }
    }

    showError() {
        document.getElementById('error-message').classList.remove('hidden');
        document.getElementById('ui-overlay').classList.add('hidden');
    }

    setupUI() {
        this.scoreElement = document.getElementById('score');
        this.ballsElement = document.getElementById('balls-remaining');
        this.powerFill = document.getElementById('power-fill');
        this.launchBtn = document.getElementById('launch-btn');
    }

    setupControls() {
        // Launch button
        this.launchBtn.addEventListener('click', () => this.launchBall());

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isCharging && !e.repeat) {
                this.startCharging();
                e.preventDefault();
            }
            if (e.code === 'KeyR') {
                this.resetGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isCharging) {
                this.releaseBall();
                e.preventDefault();
            }
        });

        // Mouse controls for camera
        let isDragging = false;
        let lastX = 0, lastY = 0;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                this.camera.rotate(deltaX * 0.005, deltaY * 0.005);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Zoom with scroll
        this.canvas.addEventListener('wheel', (e) => {
            this.camera.zoom(e.deltaY * 0.01);
            e.preventDefault();
        });

        // Touch controls for mobile
        let touchStartX = 0, touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;
                this.camera.rotate(deltaX * 0.005, deltaY * 0.005);
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
            e.preventDefault();
        });
    }

    startCharging() {
        if (this.ballsRemaining <= 0) return;
        this.isCharging = true;
        this.launchPower = 0;
    }

    releaseBall() {
        if (!this.isCharging) return;
        this.isCharging = false;
        this.launchBall(this.launchPower);
        this.launchPower = 0;
        this.powerFill.style.width = '0%';
    }

    launchBall(power = 0.5) {
        if (this.ballsRemaining <= 0) return;

        const ball = this.pachinko.launchBall(power);
        if (ball) {
            this.ballsRemaining--;
            this.ballsElement.textContent = this.ballsRemaining;

            // Listen for score events
            ball.onScore = (points) => {
                this.addScore(points);
            };
        }
    }

    addScore(points) {
        this.score += points;
        this.scoreElement.textContent = this.score;
        
        // Add visual feedback
        const panel = document.getElementById('score-panel');
        panel.classList.add('score-update');
        setTimeout(() => panel.classList.remove('score-update'), 500);
    }

    resetGame() {
        this.score = 0;
        this.ballsRemaining = 10;
        this.scoreElement.textContent = this.score;
        this.ballsElement.textContent = this.ballsRemaining;
        this.pachinko.reset();
    }

    update(deltaTime) {
        if (!this.isRunning) return;

        // Update charging power
        if (this.isCharging) {
            this.launchPower = Math.min(1, this.launchPower + deltaTime * 0.5);
            this.powerFill.style.width = (this.launchPower * 100) + '%';
        }

        // Update physics
        this.physics.update(deltaTime);

        // Update pachinko machine (balls, etc.)
        this.pachinko.update(deltaTime);
    }

    render() {
        if (!this.isRunning) return;

        // Get view and projection matrices from camera
        const viewMatrix = this.camera.getViewMatrix();
        const projectionMatrix = this.camera.getProjectionMatrix();

        // Render the scene
        this.renderer.render(this.pachinko.getRenderables(), viewMatrix, projectionMatrix);
    }

    gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize and start the game
async function main() {
    const game = new PachinkoGame();
    const initialized = await game.init();
    if (initialized) {
        game.start();
        console.log('Pachinko game started!');
    }
}

main();
