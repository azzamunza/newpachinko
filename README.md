# 🎰 WebGPU 3D Pachinko Machine

A modern 3D Pachinko machine built with WebGPU for high-performance graphics rendering in the browser.

![Pachinko Game](https://img.shields.io/badge/WebGPU-Enabled-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **WebGPU Rendering**: Utilizes the modern WebGPU API for high-performance 3D graphics
- **Real-time Physics**: Custom physics engine with ball collision detection and realistic bouncing
- **Interactive Camera**: Mouse/touch controls for rotating and zooming the view
- **Scoring System**: Multiple slot zones with different point values
- **Power Launch**: Hold SPACE to charge up launch power

## 🎮 Controls

| Control | Action |
|---------|--------|
| **SPACE** (hold) | Charge launch power |
| **SPACE** (release) | Launch ball |
| **Mouse drag** | Rotate camera |
| **Scroll wheel** | Zoom in/out |
| **R** | Reset game |
| **Click "Launch Ball"** | Quick launch with medium power |

## 🚀 Getting Started

### Prerequisites

- A WebGPU-compatible browser:
  - Chrome 113+ (recommended)
  - Edge 113+
  - Firefox (with WebGPU flag enabled)

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/azzamunza/newpachinko.git
   cd newpachinko
   ```

2. Serve the files using any local HTTP server:
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js (npx):
   ```bash
   npx serve .
   ```
   
   Using VS Code Live Server extension or any other static file server.

3. Open your browser and navigate to `http://localhost:8000`

## 🏗️ Project Structure

```
newpachinko/
├── index.html          # Main HTML file
├── styles.css          # UI styling
├── src/
│   ├── main.js         # Entry point and game loop
│   ├── renderer.js     # WebGPU rendering pipeline
│   ├── shaders.js      # WGSL shader code
│   ├── pachinko.js     # Pachinko machine geometry and logic
│   ├── physics.js      # Physics simulation
│   ├── camera.js       # Camera controls
│   ├── geometry.js     # 3D geometry generation
│   └── math.js         # Matrix and vector utilities
└── README.md
```

## 🎯 Scoring

| Slot | Points |
|------|--------|
| Outer slots | 10 points |
| Inner slots | 50 points |
| Gold slots | 100 points |
| **Center (Jackpot)** | **500 points** |

## 🔧 Technical Details

### WebGPU Pipeline

The renderer uses a custom WebGPU pipeline with:
- Vertex shader for 3D transformations
- Fragment shader with Blinn-Phong lighting
- Depth testing for proper 3D rendering
- Dynamic uniform buffers for matrices and lighting

### Physics Engine

Custom physics implementation featuring:
- Gravity simulation
- Sphere-to-sphere collision (ball vs pins)
- Sphere-to-box collision (ball vs walls)
- Sphere-to-cylinder collision (ball vs vertical pins)
- Velocity reflection with restitution (bounce)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with the [WebGPU API](https://gpuweb.github.io/gpuweb/)
- Inspired by traditional Japanese Pachinko machines