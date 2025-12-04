/**
 * Pachinko Machine
 * Creates and manages the pachinko machine geometry and game logic
 */

import { mat4 } from './math.js';
import { PhysicsBody } from './physics.js';
import { Geometry } from './geometry.js';

export class PachinkoMachine {
    constructor(renderer, physics) {
        this.renderer = renderer;
        this.physics = physics;
        this.renderables = [];
        this.balls = [];
        this.pins = [];
        this.slots = [];
        
        // Machine dimensions
        this.width = 6;
        this.height = 12;
        this.depth = 0.8;
        
        // Colors
        this.colors = {
            frame: [0.15, 0.1, 0.05],      // Dark wood
            backBoard: [0.08, 0.08, 0.12], // Dark blue-black
            pin: [0.9, 0.7, 0.2],          // Gold
            ball: [0.95, 0.95, 0.98],      // Silver
            slot: [0.8, 0.2, 0.2],         // Red
            jackpot: [1.0, 0.84, 0.0],     // Gold
            divider: [0.6, 0.6, 0.65]      // Silver gray
        };
    }

    async init() {
        this.createBackBoard();
        this.createFrame();
        this.createPins();
        this.createSlots();
        this.createLauncher();
    }

    createBackBoard() {
        // Main back panel
        const vertices = Geometry.createBox(
            this.width, this.height, 0.1,
            this.colors.backBoard
        );
        
        const modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0, this.height / 2, -this.depth / 2]);
        
        this.addRenderable(vertices, modelMatrix);
    }

    createFrame() {
        const frameThickness = 0.3;
        const frameDepth = this.depth;
        
        // Left frame
        const leftFrame = Geometry.createBox(
            frameThickness, this.height, frameDepth,
            this.colors.frame
        );
        const leftMatrix = mat4.create();
        mat4.translate(leftMatrix, leftMatrix, [-this.width / 2 - frameThickness / 2, this.height / 2, 0]);
        this.addRenderable(leftFrame, leftMatrix);
        
        // Right frame
        const rightFrame = Geometry.createBox(
            frameThickness, this.height, frameDepth,
            this.colors.frame
        );
        const rightMatrix = mat4.create();
        mat4.translate(rightMatrix, rightMatrix, [this.width / 2 + frameThickness / 2, this.height / 2, 0]);
        this.addRenderable(rightFrame, rightMatrix);
        
        // Top frame
        const topFrame = Geometry.createBox(
            this.width + frameThickness * 2, frameThickness, frameDepth,
            this.colors.frame
        );
        const topMatrix = mat4.create();
        mat4.translate(topMatrix, topMatrix, [0, this.height + frameThickness / 2, 0]);
        this.addRenderable(topFrame, topMatrix);
        
        // Bottom frame
        const bottomFrame = Geometry.createBox(
            this.width + frameThickness * 2, frameThickness, frameDepth,
            this.colors.frame
        );
        const bottomMatrix = mat4.create();
        mat4.translate(bottomMatrix, bottomMatrix, [0, -frameThickness / 2, 0]);
        this.addRenderable(bottomFrame, bottomMatrix);
        
        // Add physics walls
        const wallThickness = 0.5;
        
        // Left wall
        this.physics.addStaticBody(new PhysicsBody({
            type: 'box',
            isStatic: true,
            min: [-this.width / 2 - wallThickness, 0, -this.depth],
            max: [-this.width / 2, this.height, this.depth]
        }));
        
        // Right wall
        this.physics.addStaticBody(new PhysicsBody({
            type: 'box',
            isStatic: true,
            min: [this.width / 2, 0, -this.depth],
            max: [this.width / 2 + wallThickness, this.height, this.depth]
        }));
        
        // Back wall
        this.physics.addStaticBody(new PhysicsBody({
            type: 'box',
            isStatic: true,
            min: [-this.width / 2, 0, -this.depth - wallThickness],
            max: [this.width / 2, this.height, -this.depth / 2]
        }));
        
        // Front glass (transparent, but physics)
        this.physics.addStaticBody(new PhysicsBody({
            type: 'box',
            isStatic: true,
            min: [-this.width / 2, 0, this.depth / 2],
            max: [this.width / 2, this.height, this.depth]
        }));
    }

    createPins() {
        const pinRadius = 0.12;
        const pinHeight = 0.4;
        const rowSpacing = 0.9;
        const colSpacing = 0.7;
        const startY = this.height - 2;
        const endY = 2;
        
        let row = 0;
        for (let y = startY; y > endY; y -= rowSpacing) {
            const offset = (row % 2) * (colSpacing / 2);
            const numPins = Math.floor(this.width / colSpacing) - 1;
            
            for (let i = 0; i < numPins; i++) {
                const x = -this.width / 2 + colSpacing + i * colSpacing + offset;
                
                // Create pin geometry (cylinder)
                const pinVertices = Geometry.createCylinder(
                    pinRadius, pinHeight, 12,
                    this.colors.pin
                );
                
                const pinMatrix = mat4.create();
                mat4.translate(pinMatrix, pinMatrix, [x, y, 0]);
                this.addRenderable(pinVertices, pinMatrix);
                
                // Add physics body
                const pinBody = new PhysicsBody({
                    type: 'cylinder',
                    position: [x, y, 0],
                    radius: pinRadius,
                    height: pinHeight,
                    isStatic: true,
                    userData: { type: 'pin' }
                });
                this.physics.addStaticBody(pinBody);
                this.pins.push(pinBody);
            }
            row++;
        }
    }

    createSlots() {
        const numSlots = 7;
        const slotWidth = this.width / numSlots;
        const slotHeight = 1.5;
        const dividerWidth = 0.1;
        
        // Slot point values (center slots are worth more)
        const pointValues = [10, 50, 100, 500, 100, 50, 10];
        const slotColors = [
            this.colors.slot,
            this.colors.slot,
            this.colors.jackpot,
            [0.2, 0.8, 0.2], // Green jackpot
            this.colors.jackpot,
            this.colors.slot,
            this.colors.slot
        ];
        
        for (let i = 0; i < numSlots; i++) {
            const x = -this.width / 2 + slotWidth / 2 + i * slotWidth;
            
            // Slot back
            const slotVertices = Geometry.createBox(
                slotWidth - dividerWidth, slotHeight, 0.1,
                slotColors[i]
            );
            const slotMatrix = mat4.create();
            mat4.translate(slotMatrix, slotMatrix, [x, slotHeight / 2, -this.depth / 2 + 0.1]);
            this.addRenderable(slotVertices, slotMatrix);
            
            // Dividers between slots
            if (i < numSlots - 1) {
                const dividerVertices = Geometry.createBox(
                    dividerWidth, slotHeight, this.depth,
                    this.colors.divider
                );
                const dividerMatrix = mat4.create();
                mat4.translate(dividerMatrix, dividerMatrix, [
                    x + slotWidth / 2,
                    slotHeight / 2,
                    0
                ]);
                this.addRenderable(dividerVertices, dividerMatrix);
                
                // Physics for divider
                this.physics.addStaticBody(new PhysicsBody({
                    type: 'box',
                    isStatic: true,
                    min: [x + slotWidth / 2 - dividerWidth / 2, 0, -this.depth],
                    max: [x + slotWidth / 2 + dividerWidth / 2, slotHeight, this.depth]
                }));
            }
            
            // Store slot info for scoring
            this.slots.push({
                x: x,
                minX: x - slotWidth / 2,
                maxX: x + slotWidth / 2,
                points: pointValues[i]
            });
        }
        
        // Floor
        this.physics.addStaticBody(new PhysicsBody({
            type: 'box',
            isStatic: true,
            min: [-this.width / 2, -1, -this.depth],
            max: [this.width / 2, 0, this.depth],
            userData: { type: 'floor' }
        }));
    }

    createLauncher() {
        // Launch tube on the right side
        const tubeWidth = 0.5;
        const tubeHeight = this.height - 1;
        
        const tubeVertices = Geometry.createBox(
            tubeWidth, tubeHeight, this.depth,
            [0.3, 0.3, 0.35]
        );
        const tubeMatrix = mat4.create();
        mat4.translate(tubeMatrix, tubeMatrix, [
            this.width / 2 + 0.5,
            tubeHeight / 2 + 0.5,
            0
        ]);
        this.addRenderable(tubeVertices, tubeMatrix);
    }

    addRenderable(vertices, modelMatrix) {
        const vertexBuffer = this.renderer.createVertexBuffer(vertices);
        this.renderables.push({
            vertexBuffer,
            vertexCount: vertices.length / 9, // 9 floats per vertex
            modelMatrix
        });
    }

    launchBall(power = 0.5) {
        const ballRadius = 0.18;
        
        // Launch position (top right of the machine)
        const launchX = this.width / 2 - 0.5;
        const launchY = this.height - 0.5;
        const launchZ = 0;
        
        // Launch velocity (upward and left with some randomness)
        const baseVelocity = 5 + power * 10;
        const velocityX = -baseVelocity * 0.5 + (Math.random() - 0.5) * 2;
        const velocityY = baseVelocity * 0.3;
        const velocityZ = 0;
        
        // Create ball physics body
        const ballBody = new PhysicsBody({
            position: [launchX, launchY, launchZ],
            velocity: [velocityX, velocityY, velocityZ],
            radius: ballRadius,
            mass: 1,
            type: 'sphere'
        });
        
        // Create ball visual
        const ballVertices = Geometry.createSphere(
            ballRadius, 16, 12,
            this.colors.ball
        );
        
        const ball = {
            body: ballBody,
            vertices: ballVertices,
            vertexBuffer: this.renderer.createVertexBuffer(ballVertices),
            vertexCount: ballVertices.length / 9,
            modelMatrix: mat4.create(),
            scored: false,
            onScore: null
        };
        
        // Collision callback
        ballBody.onCollision = (other) => {
            // Could add sound effects here
        };
        
        this.physics.addBody(ballBody);
        this.balls.push(ball);
        
        return ball;
    }

    update(deltaTime) {
        // Update ball positions and check for scoring
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            
            // Update model matrix based on physics position
            mat4.identity(ball.modelMatrix);
            mat4.translate(ball.modelMatrix, ball.modelMatrix, ball.body.position);
            
            // Check if ball has fallen into a slot
            if (!ball.scored && ball.body.position[1] < 0.5) {
                const x = ball.body.position[0];
                for (const slot of this.slots) {
                    if (x >= slot.minX && x <= slot.maxX) {
                        ball.scored = true;
                        if (ball.onScore) {
                            ball.onScore(slot.points);
                        }
                        break;
                    }
                }
            }
            
            // Remove balls that have fallen off
            if (ball.body.position[1] < -2) {
                this.physics.removeBody(ball.body);
                this.balls.splice(i, 1);
            }
        }
    }

    getRenderables() {
        // Return all static renderables plus ball renderables
        const allRenderables = [...this.renderables];
        
        for (const ball of this.balls) {
            allRenderables.push({
                vertexBuffer: ball.vertexBuffer,
                vertexCount: ball.vertexCount,
                modelMatrix: ball.modelMatrix
            });
        }
        
        return allRenderables;
    }

    reset() {
        // Remove all balls
        for (const ball of this.balls) {
            this.physics.removeBody(ball.body);
        }
        this.balls = [];
    }
}
