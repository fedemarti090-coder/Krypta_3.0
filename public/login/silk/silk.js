import * as THREE from '../../../node_modules/three/build/three.module.js';

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

export class Silk {
  constructor(container, options = {}) {
    if (!container) throw new Error('Se requiere un elemento contenedor HTML.');

    this.container = typeof container === 'string' ? document.querySelector(container) : container;

    this.options = {
      speed: 5,
      scale: 1,
      color: '#5227FF',
      noiseIntensity: 1.5,
      rotation: 0,
      ...options
    };

    this.rafId = null;
    this.init();
  }

  hexToNormalizedRGB(hex) {
    const h = hex.replace('#', '').trim();
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    ];
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 1;

    this.clock = new THREE.Clock();

    const rgb = this.hexToNormalizedRGB(this.options.color);
    this.uniforms = {
      uSpeed: { value: this.options.speed },
      uScale: { value: this.options.scale },
      uNoiseIntensity: { value: this.options.noiseIntensity },
      uColor: { value: new THREE.Color(...rgb) },
      uRotation: { value: this.options.rotation },
      uTime: { value: 0 }
    };

    const geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.domElement.className = 'silk-canvas';

    this.container.appendChild(this.renderer.domElement);

    this.bindEvents();
    this.handleResize();
    this.animate();
  }

  updatePlaneScale() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    const aspect = width / height;

    // Calcolo esatto per coprire il viewport della PerspectiveCamera alla distanza z = 1
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const viewportHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.z;
    const viewportWidth = viewportHeight * aspect;

    this.mesh.scale.set(viewportWidth, viewportHeight, 1);
  }

  setOptions(newOptions = {}) {
    Object.assign(this.options, newOptions);

    this.uniforms.uSpeed.value = this.options.speed;
    this.uniforms.uScale.value = this.options.scale;
    this.uniforms.uNoiseIntensity.value = this.options.noiseIntensity;
    this.uniforms.uRotation.value = this.options.rotation;

    if (newOptions.color) {
      const rgb = this.hexToNormalizedRGB(this.options.color);
      this.uniforms.uColor.value.setRGB(...rgb);
    }
  }

  handleResize = () => {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h, false);
    this.updatePlaneScale();
  };

  bindEvents() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', this.handleResize);
    }
  }

  animate = () => {
    const delta = this.clock.getDelta();
    this.uniforms.uTime.value += 0.1 * delta;

    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(this.animate);
  };

  destroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    else window.removeEventListener('resize', this.handleResize);

    if (this.material) this.material.dispose();
    if (this.mesh) this.mesh.geometry.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement === this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}