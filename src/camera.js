/**
 * Camera for 3D scene
 * Handles view and projection matrices
 */

import { mat4, vec3 } from './math.js';

// Camera configuration constants
const DEFAULT_RADIUS = 15;
const DEFAULT_THETA = 0;
const DEFAULT_PHI = 0.3;
const MIN_RADIUS = 5;
const MAX_RADIUS = 30;
const MIN_PHI = -Math.PI / 3;
const MAX_PHI = Math.PI / 2.5;
const FIELD_OF_VIEW = Math.PI / 4; // 45 degrees

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Camera position in spherical coordinates
        this.radius = DEFAULT_RADIUS;
        this.theta = DEFAULT_THETA; // horizontal angle
        this.phi = DEFAULT_PHI; // vertical angle
        
        // Camera target (what we're looking at)
        this.target = [0, 3, 0];
        
        // Matrices
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        
        // Track canvas size for efficient projection updates
        this.lastWidth = canvas.clientWidth;
        this.lastHeight = canvas.clientHeight;
        
        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    rotate(deltaTheta, deltaPhi) {
        this.theta += deltaTheta;
        this.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, this.phi + deltaPhi));
        this.updateViewMatrix();
    }

    zoom(delta) {
        this.radius = Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, this.radius + delta));
        this.updateViewMatrix();
    }

    setTarget(x, y, z) {
        this.target = [x, y, z];
        this.updateViewMatrix();
    }

    getPosition() {
        const x = this.radius * Math.cos(this.phi) * Math.sin(this.theta);
        const y = this.radius * Math.sin(this.phi);
        const z = this.radius * Math.cos(this.phi) * Math.cos(this.theta);
        return [
            this.target[0] + x,
            this.target[1] + y,
            this.target[2] + z
        ];
    }

    updateViewMatrix() {
        const position = this.getPosition();
        mat4.lookAt(
            this.viewMatrix,
            position,
            this.target,
            [0, 1, 0] // up vector
        );
    }

    updateProjectionMatrix() {
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        mat4.perspective(this.projectionMatrix, FIELD_OF_VIEW, aspect, 0.1, 100);
        this.lastWidth = this.canvas.clientWidth;
        this.lastHeight = this.canvas.clientHeight;
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        // Only update projection if canvas size has changed
        if (this.canvas.clientWidth !== this.lastWidth || 
            this.canvas.clientHeight !== this.lastHeight) {
            this.updateProjectionMatrix();
        }
        return this.projectionMatrix;
    }
}
