/**
 * WebGPU Shaders for 3D Pachinko Machine
 * WGSL Shader Code
 */

export const shaderCode = `
// Uniform structures
struct Uniforms {
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>,
}

struct Light {
    position: vec4<f32>,
    color: vec4<f32>,
    cameraPosition: vec4<f32>,
}

// Bindings
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<uniform> light: Light;

// Vertex shader input/output
struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color: vec3<f32>,
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) worldPosition: vec3<f32>,
    @location(1) normal: vec3<f32>,
    @location(2) color: vec3<f32>,
}

// Vertex shader
@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    let worldPosition = uniforms.model * vec4<f32>(input.position, 1.0);
    output.worldPosition = worldPosition.xyz;
    output.position = uniforms.projection * uniforms.view * worldPosition;
    
    // Transform normal
    let normalMatrix = mat3x3<f32>(
        uniforms.model[0].xyz,
        uniforms.model[1].xyz,
        uniforms.model[2].xyz
    );
    output.normal = normalize(normalMatrix * input.normal);
    output.color = input.color;
    
    return output;
}

// Fragment shader
@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    let normal = normalize(input.normal);
    let lightDir = normalize(light.position.xyz - input.worldPosition);
    let viewDir = normalize(light.cameraPosition.xyz - input.worldPosition);
    let halfDir = normalize(lightDir + viewDir);
    
    // Ambient
    let ambient = 0.15;
    
    // Diffuse
    let diff = max(dot(normal, lightDir), 0.0);
    let diffuse = diff * 0.7;
    
    // Specular (Blinn-Phong)
    let spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    let specular = spec * 0.4;
    
    // Rim lighting for metallic effect
    let rim = 1.0 - max(dot(viewDir, normal), 0.0);
    let rimLight = pow(rim, 3.0) * 0.2;
    
    // Combine lighting
    let lighting = ambient + diffuse + specular + rimLight;
    let finalColor = input.color * lighting * light.color.xyz;
    
    // Tone mapping and gamma correction
    let mapped = finalColor / (finalColor + vec3<f32>(1.0));
    let gamma = pow(mapped, vec3<f32>(1.0 / 2.2));
    
    return vec4<f32>(gamma, 1.0);
}
`;
