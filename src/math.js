/**
 * Math utilities for 3D graphics
 * Simple matrix and vector operations
 */

export const mat4 = {
    create() {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    },

    identity(out) {
        out[0] = 1; out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0; out[5] = 1; out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0; out[10] = 1; out[11] = 0;
        out[12] = 0; out[13] = 0; out[14] = 0; out[15] = 1;
        return out;
    },

    multiply(out, a, b) {
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
        out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return out;
    },

    translate(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
        return out;
    },

    scale(out, a, v) {
        const x = v[0], y = v[1], z = v[2];
        out[0] = a[0] * x; out[1] = a[1] * x; out[2] = a[2] * x; out[3] = a[3] * x;
        out[4] = a[4] * y; out[5] = a[5] * y; out[6] = a[6] * y; out[7] = a[7] * y;
        out[8] = a[8] * z; out[9] = a[9] * z; out[10] = a[10] * z; out[11] = a[11] * z;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
        return out;
    },

    rotateX(out, a, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

        out[0] = a[0]; out[1] = a[1]; out[2] = a[2]; out[3] = a[3];
        out[4] = a10 * c + a20 * s;
        out[5] = a11 * c + a21 * s;
        out[6] = a12 * c + a22 * s;
        out[7] = a13 * c + a23 * s;
        out[8] = a20 * c - a10 * s;
        out[9] = a21 * c - a11 * s;
        out[10] = a22 * c - a12 * s;
        out[11] = a23 * c - a13 * s;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];

        return out;
    },

    rotateY(out, a, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];

        out[0] = a00 * c - a20 * s;
        out[1] = a01 * c - a21 * s;
        out[2] = a02 * c - a22 * s;
        out[3] = a03 * c - a23 * s;
        out[4] = a[4]; out[5] = a[5]; out[6] = a[6]; out[7] = a[7];
        out[8] = a00 * s + a20 * c;
        out[9] = a01 * s + a21 * c;
        out[10] = a02 * s + a22 * c;
        out[11] = a03 * s + a23 * c;
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];

        return out;
    },

    rotateZ(out, a, rad) {
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];

        out[0] = a00 * c + a10 * s;
        out[1] = a01 * c + a11 * s;
        out[2] = a02 * c + a12 * s;
        out[3] = a03 * c + a13 * s;
        out[4] = a10 * c - a00 * s;
        out[5] = a11 * c - a01 * s;
        out[6] = a12 * c - a02 * s;
        out[7] = a13 * c - a03 * s;
        out[8] = a[8]; out[9] = a[9]; out[10] = a[10]; out[11] = a[11];
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];

        return out;
    },

    perspective(out, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect;
        out[1] = 0; out[2] = 0; out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0; out[7] = 0;
        out[8] = 0; out[9] = 0;
        out[10] = (far + near) / (near - far);
        out[11] = -1;
        out[12] = 0; out[13] = 0;
        out[14] = (2 * far * near) / (near - far);
        out[15] = 0;
        return out;
    },

    lookAt(out, eye, center, up) {
        const x0 = eye[0], y0 = eye[1], z0 = eye[2];
        const x1 = center[0], y1 = center[1], z1 = center[2];
        const upx = up[0], upy = up[1], upz = up[2];

        let zx = x0 - x1;
        let zy = y0 - y1;
        let zz = z0 - z1;

        let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz);
        zx *= len; zy *= len; zz *= len;

        let xx = upy * zz - upz * zy;
        let xy = upz * zx - upx * zz;
        let xz = upx * zy - upy * zx;

        len = Math.sqrt(xx * xx + xy * xy + xz * xz);
        if (len) {
            len = 1 / len;
            xx *= len; xy *= len; xz *= len;
        }

        let yx = zy * xz - zz * xy;
        let yy = zz * xx - zx * xz;
        let yz = zx * xy - zy * xx;

        len = Math.sqrt(yx * yx + yy * yy + yz * yz);
        if (len) {
            len = 1 / len;
            yx *= len; yy *= len; yz *= len;
        }

        out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
        out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
        out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
        out[12] = -(xx * x0 + xy * y0 + xz * z0);
        out[13] = -(yx * x0 + yy * y0 + yz * z0);
        out[14] = -(zx * x0 + zy * y0 + zz * z0);
        out[15] = 1;

        return out;
    }
};

export const vec3 = {
    create() {
        return new Float32Array([0, 0, 0]);
    },

    fromValues(x, y, z) {
        return new Float32Array([x, y, z]);
    },

    add(out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
    },

    subtract(out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
    },

    scale(out, a, s) {
        out[0] = a[0] * s;
        out[1] = a[1] * s;
        out[2] = a[2] * s;
        return out;
    },

    normalize(out, a) {
        const len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
        if (len > 0) {
            out[0] = a[0] / len;
            out[1] = a[1] / len;
            out[2] = a[2] / len;
        }
        return out;
    },

    length(a) {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    },

    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    },

    cross(out, a, b) {
        out[0] = a[1] * b[2] - a[2] * b[1];
        out[1] = a[2] * b[0] - a[0] * b[2];
        out[2] = a[0] * b[1] - a[1] * b[0];
        return out;
    },

    distance(a, b) {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const dz = b[2] - a[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
};
