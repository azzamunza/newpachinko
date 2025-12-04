/**
 * Camera for 3D scene
 * Handles view and projection matrices
 */

import { mat4, vec3 } from './math.js';

export class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Camera position in spherical coordinates
        this.radius = 15;
        this.theta = 0; // horizontal angle
        this.phi = 0.3; // vertical angle
        
        // Camera target (what we're looking at)
        this.target = [0, 3, 0];
        
        // Matrices
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
        
        // Limits
        this.minRadius = 5;
        this.maxRadius = 30;
        this.minPhi = -Math.PI / 3;
        this.maxPhi = Math.PI / 2.5;
        
        this.updateMatrices();
    }

    rotate(deltaTheta, deltaPhi) {
        this.theta += deltaTheta;
        this.phi = Math.max(this.minPhi, Math.min(this.maxPhi, this.phi + deltaPhi));
        this.updateMatrices();
    }

    zoom(delta) {
        this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius + delta));
        this.updateMatrices();
    }

    setTarget(x, y, z) {
        this.target = [x, y, z];
        this.updateMatrices();
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

    updateMatrices() {
        const position = this.getPosition();
        
        // View matrix (lookAt)
        mat4.lookAt(
            this.viewMatrix,
            position,
            this.target,
            [0, 1, 0] // up vector
        );

        // Projection matrix (perspective)
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const fov = Math.PI / 4; // 45 degrees
        mat4.perspective(this.projectionMatrix, fov, aspect, 0.1, 100);
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        this.updateMatrices(); // Update on every frame for aspect ratio changes
        return this.projectionMatrix;
    }
}
