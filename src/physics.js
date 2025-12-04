/**
 * Simple Physics Engine for Pachinko
 * Handles ball physics, collisions, and gravity
 */

import { vec3 } from './math.js';

export class Physics {
    constructor() {
        this.gravity = -15; // Gravity acceleration (stronger for game feel)
        this.restitution = 0.6; // Bounce factor
        this.friction = 0.98; // Air/rolling friction
        this.bodies = [];
        this.staticBodies = []; // Pins and walls
    }

    addBody(body) {
        this.bodies.push(body);
        return body;
    }

    addStaticBody(body) {
        this.staticBodies.push(body);
        return body;
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }

    clearBodies() {
        this.bodies = [];
    }

    update(deltaTime) {
        // Fixed timestep for stable physics
        const fixedDelta = Math.min(deltaTime, 1/60);
        
        for (const body of this.bodies) {
            if (body.isStatic) continue;

            // Apply gravity
            body.velocity[1] += this.gravity * fixedDelta;

            // Apply friction
            body.velocity[0] *= this.friction;
            body.velocity[2] *= this.friction;

            // Update position
            body.position[0] += body.velocity[0] * fixedDelta;
            body.position[1] += body.velocity[1] * fixedDelta;
            body.position[2] += body.velocity[2] * fixedDelta;

            // Check collisions with static bodies (pins, walls)
            for (const staticBody of this.staticBodies) {
                this.checkCollision(body, staticBody);
            }

            // Add slight random perturbation for more interesting physics
            if (Math.abs(body.velocity[0]) > 0.1 || Math.abs(body.velocity[1]) > 0.1) {
                body.velocity[0] += (Math.random() - 0.5) * 0.1;
            }
        }
    }

    checkCollision(ball, staticBody) {
        if (staticBody.type === 'sphere') {
            this.sphereVsSphere(ball, staticBody);
        } else if (staticBody.type === 'box') {
            this.sphereVsBox(ball, staticBody);
        } else if (staticBody.type === 'cylinder') {
            this.sphereVsCylinder(ball, staticBody);
        }
    }

    sphereVsSphere(ball, pin) {
        const dx = ball.position[0] - pin.position[0];
        const dy = ball.position[1] - pin.position[1];
        const dz = ball.position[2] - pin.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDist = ball.radius + pin.radius;

        if (distance < minDist && distance > 0) {
            // Collision detected
            const nx = dx / distance;
            const ny = dy / distance;
            const nz = dz / distance;

            // Separate ball from pin
            const overlap = minDist - distance;
            ball.position[0] += nx * overlap;
            ball.position[1] += ny * overlap;
            ball.position[2] += nz * overlap;

            // Reflect velocity
            const dot = ball.velocity[0] * nx + ball.velocity[1] * ny + ball.velocity[2] * nz;
            ball.velocity[0] -= 2 * dot * nx * this.restitution;
            ball.velocity[1] -= 2 * dot * ny * this.restitution;
            ball.velocity[2] -= 2 * dot * nz * this.restitution;

            // Callback for scoring/sound
            if (ball.onCollision) {
                ball.onCollision(pin);
            }
        }
    }

    sphereVsCylinder(ball, cylinder) {
        // Simplified cylinder collision (vertical cylinder)
        const dx = ball.position[0] - cylinder.position[0];
        const dz = ball.position[2] - cylinder.position[2];
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
        const minDist = ball.radius + cylinder.radius;

        // Check if ball is within cylinder height
        const withinHeight = ball.position[1] >= cylinder.position[1] - cylinder.height / 2 &&
                            ball.position[1] <= cylinder.position[1] + cylinder.height / 2;

        if (horizontalDistance < minDist && withinHeight && horizontalDistance > 0) {
            // Collision detected
            const nx = dx / horizontalDistance;
            const nz = dz / horizontalDistance;

            // Separate ball from cylinder
            const overlap = minDist - horizontalDistance;
            ball.position[0] += nx * overlap;
            ball.position[2] += nz * overlap;

            // Reflect velocity (only horizontal components)
            const dot = ball.velocity[0] * nx + ball.velocity[2] * nz;
            ball.velocity[0] -= 2 * dot * nx * this.restitution;
            ball.velocity[2] -= 2 * dot * nz * this.restitution;

            if (ball.onCollision) {
                ball.onCollision(cylinder);
            }
        }
    }

    sphereVsBox(ball, box) {
        // Find closest point on box to ball center
        const closestX = Math.max(box.min[0], Math.min(ball.position[0], box.max[0]));
        const closestY = Math.max(box.min[1], Math.min(ball.position[1], box.max[1]));
        const closestZ = Math.max(box.min[2], Math.min(ball.position[2], box.max[2]));

        const dx = ball.position[0] - closestX;
        const dy = ball.position[1] - closestY;
        const dz = ball.position[2] - closestZ;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < ball.radius && distance > 0) {
            // Collision detected
            const nx = dx / distance;
            const ny = dy / distance;
            const nz = dz / distance;

            // Separate ball from box
            const overlap = ball.radius - distance;
            ball.position[0] += nx * overlap;
            ball.position[1] += ny * overlap;
            ball.position[2] += nz * overlap;

            // Reflect velocity
            const dot = ball.velocity[0] * nx + ball.velocity[1] * ny + ball.velocity[2] * nz;
            ball.velocity[0] -= 2 * dot * nx * this.restitution;
            ball.velocity[1] -= 2 * dot * ny * this.restitution;
            ball.velocity[2] -= 2 * dot * nz * this.restitution;

            if (ball.onCollision) {
                ball.onCollision(box);
            }
        } else if (distance === 0) {
            // Ball center is inside box, push it out
            ball.position[1] += ball.radius;
            ball.velocity[1] = Math.abs(ball.velocity[1]) * this.restitution;
        }
    }
}

// Physics body class
export class PhysicsBody {
    constructor(options = {}) {
        this.position = options.position || [0, 0, 0];
        this.velocity = options.velocity || [0, 0, 0];
        this.radius = options.radius || 0.2;
        this.mass = options.mass || 1;
        this.isStatic = options.isStatic || false;
        this.type = options.type || 'sphere';
        this.onCollision = null;
        this.onScore = null;
        this.userData = options.userData || {};
        
        // For box collision
        if (options.min && options.max) {
            this.min = options.min;
            this.max = options.max;
        }
        
        // For cylinder
        this.height = options.height || 1;
    }
}
