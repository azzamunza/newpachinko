/**
 * WebGPU Renderer
 * Handles all WebGPU rendering operations
 */

import { shaderCode } from './shaders.js';
import { mat4 } from './math.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.pipeline = null;
        this.depthTexture = null;
        this.uniformBuffer = null;
        this.uniformBindGroup = null;
        this.lightBuffer = null;
    }

    async init() {
        // Request adapter and device
        const adapter = await navigator.gpu.requestAdapter({
            powerPreference: 'high-performance'
        });
        
        if (!adapter) {
            throw new Error('WebGPU adapter not found');
        }

        this.device = await adapter.requestDevice();

        // Setup canvas context
        this.context = this.canvas.getContext('webgpu');
        this.format = navigator.gpu.getPreferredCanvasFormat();
        
        this.context.configure({
            device: this.device,
            format: this.format,
            alphaMode: 'premultiplied'
        });

        // Handle resize
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Create pipeline
        await this.createPipeline();

        // Create uniform buffers
        this.createUniformBuffers();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * dpr;
        this.canvas.height = this.canvas.clientHeight * dpr;

        // Recreate depth texture
        if (this.depthTexture) {
            this.depthTexture.destroy();
        }

        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
    }

    async createPipeline() {
        const shaderModule = this.device.createShaderModule({
            code: shaderCode
        });

        // Create pipeline layout
        this.uniformBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.FRAGMENT,
                    buffer: { type: 'uniform' }
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [this.uniformBindGroupLayout]
        });

        this.pipeline = this.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: 'vertexMain',
                buffers: [
                    {
                        arrayStride: 36, // 3 floats position + 3 floats normal + 3 floats color = 9 * 4 bytes
                        attributes: [
                            { shaderLocation: 0, offset: 0, format: 'float32x3' },  // position
                            { shaderLocation: 1, offset: 12, format: 'float32x3' }, // normal
                            { shaderLocation: 2, offset: 24, format: 'float32x3' }  // color
                        ]
                    }
                ]
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fragmentMain',
                targets: [{ format: this.format }]
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        });
    }

    createUniformBuffers() {
        // Create uniform buffer for matrices (model-view-projection)
        // 64 bytes for model matrix + 64 bytes for view matrix + 64 bytes for projection matrix
        this.uniformBuffer = this.device.createBuffer({
            size: 192,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Create light uniform buffer
        // Light position (16 bytes) + Light color (16 bytes) + Camera position (16 bytes)
        this.lightBuffer = this.device.createBuffer({
            size: 48,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Create bind group
        this.uniformBindGroup = this.device.createBindGroup({
            layout: this.uniformBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.uniformBuffer } },
                { binding: 1, resource: { buffer: this.lightBuffer } }
            ]
        });

        // Set default light
        const lightData = new Float32Array([
            5.0, 10.0, 5.0, 1.0,  // Light position
            1.0, 0.95, 0.9, 1.0,   // Light color (warm white)
            0.0, 5.0, 15.0, 1.0    // Camera position
        ]);
        this.device.queue.writeBuffer(this.lightBuffer, 0, lightData);
    }

    createVertexBuffer(vertices) {
        const buffer = this.device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Float32Array(buffer.getMappedRange()).set(vertices);
        buffer.unmap();
        return buffer;
    }

    createIndexBuffer(indices) {
        const buffer = this.device.createBuffer({
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });
        new Uint16Array(buffer.getMappedRange()).set(indices);
        buffer.unmap();
        return buffer;
    }

    render(renderables, viewMatrix, projectionMatrix) {
        const commandEncoder = this.device.createCommandEncoder();
        
        const renderPassDescriptor = {
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(this.pipeline);

        // Render each object
        for (const renderable of renderables) {
            // Update model matrix
            const matrices = new Float32Array(48);
            matrices.set(renderable.modelMatrix, 0);
            matrices.set(viewMatrix, 16);
            matrices.set(projectionMatrix, 32);
            
            this.device.queue.writeBuffer(this.uniformBuffer, 0, matrices);

            passEncoder.setBindGroup(0, this.uniformBindGroup);
            passEncoder.setVertexBuffer(0, renderable.vertexBuffer);
            
            if (renderable.indexBuffer) {
                passEncoder.setIndexBuffer(renderable.indexBuffer, 'uint16');
                passEncoder.drawIndexed(renderable.indexCount);
            } else {
                passEncoder.draw(renderable.vertexCount);
            }
        }

        passEncoder.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    updateLightPosition(x, y, z) {
        const lightData = new Float32Array([x, y, z, 1.0]);
        this.device.queue.writeBuffer(this.lightBuffer, 0, lightData);
    }

    updateCameraPosition(x, y, z) {
        const cameraData = new Float32Array([x, y, z, 1.0]);
        this.device.queue.writeBuffer(this.lightBuffer, 32, cameraData);
    }
}
