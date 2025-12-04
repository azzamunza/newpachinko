/**
 * Geometry generation utilities
 * Creates vertices for various 3D shapes
 */

export class Geometry {
    /**
     * Create a box (cube) mesh
     * @param {number} width - Width (X axis)
     * @param {number} height - Height (Y axis)  
     * @param {number} depth - Depth (Z axis)
     * @param {number[]} color - RGB color array [r, g, b]
     * @returns {Float32Array} Vertex data (position, normal, color)
     */
    static createBox(width, height, depth, color) {
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;
        const [r, g, b] = color;
        
        // 6 faces, 2 triangles each, 3 vertices per triangle = 36 vertices
        const vertices = new Float32Array([
            // Front face
            -hw, -hh, hd,  0, 0, 1,  r, g, b,
            hw, -hh, hd,   0, 0, 1,  r, g, b,
            hw, hh, hd,    0, 0, 1,  r, g, b,
            -hw, -hh, hd,  0, 0, 1,  r, g, b,
            hw, hh, hd,    0, 0, 1,  r, g, b,
            -hw, hh, hd,   0, 0, 1,  r, g, b,
            
            // Back face
            hw, -hh, -hd,  0, 0, -1,  r, g, b,
            -hw, -hh, -hd, 0, 0, -1,  r, g, b,
            -hw, hh, -hd,  0, 0, -1,  r, g, b,
            hw, -hh, -hd,  0, 0, -1,  r, g, b,
            -hw, hh, -hd,  0, 0, -1,  r, g, b,
            hw, hh, -hd,   0, 0, -1,  r, g, b,
            
            // Top face
            -hw, hh, hd,   0, 1, 0,  r, g, b,
            hw, hh, hd,    0, 1, 0,  r, g, b,
            hw, hh, -hd,   0, 1, 0,  r, g, b,
            -hw, hh, hd,   0, 1, 0,  r, g, b,
            hw, hh, -hd,   0, 1, 0,  r, g, b,
            -hw, hh, -hd,  0, 1, 0,  r, g, b,
            
            // Bottom face
            -hw, -hh, -hd, 0, -1, 0,  r, g, b,
            hw, -hh, -hd,  0, -1, 0,  r, g, b,
            hw, -hh, hd,   0, -1, 0,  r, g, b,
            -hw, -hh, -hd, 0, -1, 0,  r, g, b,
            hw, -hh, hd,   0, -1, 0,  r, g, b,
            -hw, -hh, hd,  0, -1, 0,  r, g, b,
            
            // Right face
            hw, -hh, hd,   1, 0, 0,  r, g, b,
            hw, -hh, -hd,  1, 0, 0,  r, g, b,
            hw, hh, -hd,   1, 0, 0,  r, g, b,
            hw, -hh, hd,   1, 0, 0,  r, g, b,
            hw, hh, -hd,   1, 0, 0,  r, g, b,
            hw, hh, hd,    1, 0, 0,  r, g, b,
            
            // Left face
            -hw, -hh, -hd, -1, 0, 0,  r, g, b,
            -hw, -hh, hd,  -1, 0, 0,  r, g, b,
            -hw, hh, hd,   -1, 0, 0,  r, g, b,
            -hw, -hh, -hd, -1, 0, 0,  r, g, b,
            -hw, hh, hd,   -1, 0, 0,  r, g, b,
            -hw, hh, -hd,  -1, 0, 0,  r, g, b,
        ]);
        
        return vertices;
    }

    /**
     * Create a sphere mesh
     * @param {number} radius - Sphere radius
     * @param {number} segments - Number of horizontal segments
     * @param {number} rings - Number of vertical rings
     * @param {number[]} color - RGB color array
     * @returns {Float32Array} Vertex data
     */
    static createSphere(radius, segments, rings, color) {
        const [r, g, b] = color;
        const vertices = [];
        
        for (let ring = 0; ring < rings; ring++) {
            const theta1 = (ring / rings) * Math.PI;
            const theta2 = ((ring + 1) / rings) * Math.PI;
            
            for (let seg = 0; seg < segments; seg++) {
                const phi1 = (seg / segments) * Math.PI * 2;
                const phi2 = ((seg + 1) / segments) * Math.PI * 2;
                
                // Four corners of the quad
                const p1 = this.spherePoint(radius, theta1, phi1);
                const p2 = this.spherePoint(radius, theta1, phi2);
                const p3 = this.spherePoint(radius, theta2, phi1);
                const p4 = this.spherePoint(radius, theta2, phi2);
                
                const n1 = this.normalize(p1);
                const n2 = this.normalize(p2);
                const n3 = this.normalize(p3);
                const n4 = this.normalize(p4);
                
                // First triangle
                vertices.push(
                    ...p1, ...n1, r, g, b,
                    ...p3, ...n3, r, g, b,
                    ...p2, ...n2, r, g, b
                );
                
                // Second triangle
                vertices.push(
                    ...p2, ...n2, r, g, b,
                    ...p3, ...n3, r, g, b,
                    ...p4, ...n4, r, g, b
                );
            }
        }
        
        return new Float32Array(vertices);
    }

    /**
     * Create a cylinder mesh
     * @param {number} radius - Cylinder radius
     * @param {number} height - Cylinder height
     * @param {number} segments - Number of segments around the circumference
     * @param {number[]} color - RGB color array
     * @returns {Float32Array} Vertex data
     */
    static createCylinder(radius, height, segments, color) {
        const [r, g, b] = color;
        const vertices = [];
        const halfHeight = height / 2;
        
        for (let i = 0; i < segments; i++) {
            const angle1 = (i / segments) * Math.PI * 2;
            const angle2 = ((i + 1) / segments) * Math.PI * 2;
            
            const x1 = Math.cos(angle1) * radius;
            const z1 = Math.sin(angle1) * radius;
            const x2 = Math.cos(angle2) * radius;
            const z2 = Math.sin(angle2) * radius;
            
            const nx1 = Math.cos(angle1);
            const nz1 = Math.sin(angle1);
            const nx2 = Math.cos(angle2);
            const nz2 = Math.sin(angle2);
            
            // Side quad (2 triangles)
            vertices.push(
                x1, -halfHeight, z1,  nx1, 0, nz1,  r, g, b,
                x2, -halfHeight, z2,  nx2, 0, nz2,  r, g, b,
                x1, halfHeight, z1,   nx1, 0, nz1,  r, g, b,
                
                x2, -halfHeight, z2,  nx2, 0, nz2,  r, g, b,
                x2, halfHeight, z2,   nx2, 0, nz2,  r, g, b,
                x1, halfHeight, z1,   nx1, 0, nz1,  r, g, b
            );
            
            // Top cap
            vertices.push(
                0, halfHeight, 0,     0, 1, 0,  r, g, b,
                x1, halfHeight, z1,   0, 1, 0,  r, g, b,
                x2, halfHeight, z2,   0, 1, 0,  r, g, b
            );
            
            // Bottom cap
            vertices.push(
                0, -halfHeight, 0,    0, -1, 0,  r, g, b,
                x2, -halfHeight, z2,  0, -1, 0,  r, g, b,
                x1, -halfHeight, z1,  0, -1, 0,  r, g, b
            );
        }
        
        return new Float32Array(vertices);
    }

    static spherePoint(radius, theta, phi) {
        return [
            radius * Math.sin(theta) * Math.cos(phi),
            radius * Math.cos(theta),
            radius * Math.sin(theta) * Math.sin(phi)
        ];
    }

    static normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
    }
}
