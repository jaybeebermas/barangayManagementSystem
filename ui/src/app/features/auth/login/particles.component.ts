import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

const MEDUSAE_CONFIG = {
  cursor: {
    radius: 0.065,
    strength: 3,
    dragFactor: 0.015
  },
  halo: {
    outerOscFrequency: 2.6,
    outerOscAmplitude: 0.76,
    radiusBase: 2.4,
    radiusAmplitude: 0.5,
    shapeAmplitude: 0.75,
    rimWidth: 1.8,
    outerStartOffset: 0.4,
    outerEndOffset: 2.2,
    scaleX: 1.3,
    scaleY: 1
  },
  particles: {
    baseSize: 0.016,
    activeSize: 0.044,
    blobScaleX: 1,
    blobScaleY: 0.6,
    rotationSpeed: 0.1,
    rotationJitter: 0.2,
    cursorFollowStrength: 1,
    oscillationFactor: 1,
    colorBase: '#0000ff',
    colorOne: '#4285f5',
    colorTwo: '#eb4236',
    colorThree: '#faba03'
  },
  background: {
    color: '#ffffff'
  }
};

@Component({
  selector: 'app-particles',
  standalone: true,
  template: `<canvas #rendererCanvas class="medusae-canvas"></canvas>`,
  styles: [`
    .medusae-canvas {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      display: block;
      z-index: 1; /* Renders in background, but above the html body */
      pointer-events: none;
      background: #ffffff; /* BreathDearMedusae white background */
    }
  `]
})
export class ParticlesComponent implements OnInit, OnDestroy {
  @ViewChild('rendererCanvas', { static: true }) rendererCanvas!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private geometry!: THREE.PlaneGeometry;
  private material!: THREE.ShaderMaterial;
  private mesh!: THREE.InstancedMesh;
  private animationFrameId?: number;
  private readonly clock = new THREE.Clock();
  private readonly countX = 100;
  private readonly countY = 55;
  private readonly pointer = new THREE.Vector2(0, 0);
  private readonly mouse = new THREE.Vector2(0, 0);
  private hovering = true;

  constructor(private ngZone: NgZone) { }

  ngOnInit(): void {
    this.initThree();
    this.initMedusae();

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private initThree(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(MEDUSAE_CONFIG.background.color);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.rendererCanvas.nativeElement,
      antialias: true,
      alpha: false
    });

    this.renderer.setClearColor(MEDUSAE_CONFIG.background.color, 1);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private initMedusae(): void {
    const count = this.countX * this.countY;

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.geometry.setAttribute('aOffset', new THREE.InstancedBufferAttribute(this.createOffsets(count), 3));
    this.geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(this.createRandoms(count), 1));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: this.mouse },
        uOuterOscFrequency: { value: MEDUSAE_CONFIG.halo.outerOscFrequency },
        uOuterOscAmplitude: { value: MEDUSAE_CONFIG.halo.outerOscAmplitude },
        uHaloRadiusBase: { value: MEDUSAE_CONFIG.halo.radiusBase },
        uHaloRadiusAmplitude: { value: MEDUSAE_CONFIG.halo.radiusAmplitude },
        uHaloShapeAmplitude: { value: MEDUSAE_CONFIG.halo.shapeAmplitude },
        uHaloRimWidth: { value: MEDUSAE_CONFIG.halo.rimWidth },
        uHaloOuterStartOffset: { value: MEDUSAE_CONFIG.halo.outerStartOffset },
        uHaloOuterEndOffset: { value: MEDUSAE_CONFIG.halo.outerEndOffset },
        uHaloScaleX: { value: MEDUSAE_CONFIG.halo.scaleX },
        uHaloScaleY: { value: MEDUSAE_CONFIG.halo.scaleY },
        uParticleBaseSize: { value: MEDUSAE_CONFIG.particles.baseSize },
        uParticleActiveSize: { value: MEDUSAE_CONFIG.particles.activeSize },
        uBlobScaleX: { value: MEDUSAE_CONFIG.particles.blobScaleX },
        uBlobScaleY: { value: MEDUSAE_CONFIG.particles.blobScaleY },
        uParticleRotationSpeed: { value: MEDUSAE_CONFIG.particles.rotationSpeed },
        uParticleRotationJitter: { value: MEDUSAE_CONFIG.particles.rotationJitter },
        uParticleOscillationFactor: { value: MEDUSAE_CONFIG.particles.oscillationFactor },
        uParticleColorBase: { value: new THREE.Color(MEDUSAE_CONFIG.particles.colorBase) },
        uParticleColorOne: { value: new THREE.Color(MEDUSAE_CONFIG.particles.colorOne) },
        uParticleColorTwo: { value: new THREE.Color(MEDUSAE_CONFIG.particles.colorTwo) },
        uParticleColorThree: { value: new THREE.Color(MEDUSAE_CONFIG.particles.colorThree) }
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uOuterOscFrequency;
        uniform float uOuterOscAmplitude;
        uniform float uHaloRadiusBase;
        uniform float uHaloRadiusAmplitude;
        uniform float uHaloShapeAmplitude;
        uniform float uHaloRimWidth;
        uniform float uHaloOuterStartOffset;
        uniform float uHaloOuterEndOffset;
        uniform float uHaloScaleX;
        uniform float uHaloScaleY;
        uniform float uParticleBaseSize;
        uniform float uParticleActiveSize;
        uniform float uBlobScaleX;
        uniform float uBlobScaleY;
        uniform float uParticleRotationSpeed;
        uniform float uParticleRotationJitter;
        uniform float uParticleOscillationFactor;

        varying vec2 vUv;
        varying float vSize;
        varying vec2 vPos;

        attribute vec3 aOffset;
        attribute float aRandom;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);

          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));

          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        void main() {
          vUv = uv;

          vec3 pos = aOffset;
          float driftSpeed = uTime * 0.15;

          float dx = sin(driftSpeed + pos.y * 0.5) + sin(driftSpeed * 0.5 + pos.y * 2.0);
          float dy = cos(driftSpeed + pos.x * 0.5) + cos(driftSpeed * 0.5 + pos.x * 2.0);

          pos.x += dx * 0.25;
          pos.y += dy * 0.25;

          vec2 relToMouse = pos.xy - uMouse;
          vec2 haloScale = max(vec2(uHaloScaleX, uHaloScaleY), vec2(0.0001));
          float distFromMouse = length(relToMouse / haloScale);
          vec2 dirToMouse = normalize(relToMouse + vec2(0.0001, 0.0));

          float shapeFactor = noise(dirToMouse * 2.0 + vec2(0.0, uTime * 0.1));
          float breathCycle = sin(uTime * 0.8);
          float baseRadius = uHaloRadiusBase + breathCycle * uHaloRadiusAmplitude;
          float currentRadius = baseRadius + (shapeFactor * uHaloShapeAmplitude);
          float rimInfluence = smoothstep(uHaloRimWidth, 0.0, abs(distFromMouse - currentRadius));

          vec2 pushDir = normalize(relToMouse + vec2(0.0001, 0.0));
          float pushAmt = (breathCycle * 0.5 + 0.5) * 0.5;

          pos.xy += pushDir * pushAmt * rimInfluence;
          pos.z += rimInfluence * 0.3 * sin(uTime);

          float outerInfluence = smoothstep(baseRadius + uHaloOuterStartOffset, baseRadius + uHaloOuterEndOffset, distFromMouse);
          float outerOsc = sin(uTime * uOuterOscFrequency + pos.x * 0.6 + pos.y * 0.6);
          pos.xy += normalize(relToMouse + vec2(0.0001, 0.0)) * outerOsc * uOuterOscAmplitude * outerInfluence;

          float baseSize = uParticleBaseSize + (sin(uTime + pos.x) * 0.003);
          float currentScale = baseSize + (rimInfluence * uParticleActiveSize);
          float stretch = rimInfluence * 0.02;

          vec3 transformed = position;
          transformed.x *= (currentScale + stretch) * uBlobScaleX;
          transformed.y *= currentScale * uBlobScaleY;

          vSize = rimInfluence;
          vPos = pos.xy;

          float dirLen = max(length(relToMouse), 0.0001);
          vec2 dir = relToMouse / dirLen;
          float oscPhase = aRandom * 6.28318530718;
          float osc = 0.5 + 0.5 * sin(
            uTime * (0.25 + uParticleOscillationFactor * 0.35) + oscPhase
          );
          float speedScale = mix(0.55, 1.35, osc) * (0.8 + uParticleOscillationFactor * 0.2);
          float jitterScale = mix(0.7, 1.45, osc) * (0.85 + uParticleOscillationFactor * 0.15);
          float jitter = sin(
            uTime * uParticleRotationSpeed * speedScale + pos.x * 0.35 + pos.y * 0.35
          ) * (uParticleRotationJitter * jitterScale);
          vec2 perp = vec2(-dir.y, dir.x);
          vec2 jitteredDir = normalize(dir + perp * jitter);
          mat2 rot = mat2(jitteredDir.x, jitteredDir.y, -jitteredDir.y, jitteredDir.x);
          transformed.xy = rot * transformed.xy;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos + transformed, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uParticleColorBase;
        uniform vec3 uParticleColorOne;
        uniform vec3 uParticleColorTwo;
        uniform vec3 uParticleColorThree;

        varying vec2 vUv;
        varying float vSize;
        varying vec2 vPos;

        void main() {
          vec2 center = vec2(0.5);
          vec2 pos = abs(vUv - center) * 2.0;

          float d = pow(pow(pos.x, 2.6) + pow(pos.y, 2.6), 1.0 / 2.6);
          float alpha = 1.0 - smoothstep(0.8, 1.0, d);

          if (alpha < 0.01) discard;

          float t = uTime * 1.2;
          float p1 = sin(vPos.x * 0.8 + t);
          float p2 = sin(vPos.y * 0.8 + t * 0.8 + p1);

          vec3 activeColor = mix(uParticleColorOne, uParticleColorTwo, p1 * 0.5 + 0.5);
          activeColor = mix(activeColor, uParticleColorThree, p2 * 0.5 + 0.5);

          vec3 finalColor = mix(uParticleColorBase, activeColor, smoothstep(0.1, 0.8, vSize));
          float finalAlpha = alpha * mix(0.4, 0.95, vSize);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, count);
    this.scene.add(this.mesh);
  }

  private createOffsets(count: number): Float32Array {
    const offsets = new Float32Array(count * 3);
    const gridWidth = 40;
    const gridHeight = 22;
    const jitter = 0.25;
    let index = 0;

    for (let y = 0; y < this.countY; y++) {
      for (let x = 0; x < this.countX; x++) {
        const u = x / (this.countX - 1);
        const v = y / (this.countY - 1);

        offsets[index * 3] = (u - 0.5) * gridWidth + (Math.random() - 0.5) * jitter;
        offsets[index * 3 + 1] = (v - 0.5) * gridHeight + (Math.random() - 0.5) * jitter;
        offsets[index * 3 + 2] = 0;
        index++;
      }
    }

    return offsets;
  }

  private createRandoms(count: number): Float32Array {
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      randoms[i] = Math.random();
    }

    return randoms;
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();
    this.material.uniforms['uTime'].value = elapsedTime;

    if (this.hovering) {
      const viewport = this.getViewportSize();
      const baseX = (this.pointer.x * viewport.width) / 2;
      const baseY = (this.pointer.y * viewport.height) / 2;
      const jitterRadius = Math.min(viewport.width, viewport.height) * MEDUSAE_CONFIG.cursor.radius;
      const jitterX = (Math.sin(elapsedTime * 0.35) + Math.sin(elapsedTime * 0.77 + 1.2)) * 0.5;
      const jitterY = (Math.cos(elapsedTime * 0.31) + Math.sin(elapsedTime * 0.63 + 2.4)) * 0.5;
      const targetX = (baseX + jitterX * jitterRadius * MEDUSAE_CONFIG.cursor.strength) * MEDUSAE_CONFIG.particles.cursorFollowStrength;
      const targetY = (baseY + jitterY * jitterRadius * MEDUSAE_CONFIG.cursor.strength) * MEDUSAE_CONFIG.particles.cursorFollowStrength;

      this.mouse.x += (targetX - this.mouse.x) * MEDUSAE_CONFIG.cursor.dragFactor;
      this.mouse.y += (targetY - this.mouse.y) * MEDUSAE_CONFIG.cursor.dragFactor;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private getViewportSize(): { width: number; height: number } {
    const distance = Math.abs(this.camera.position.z);
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * distance;

    return {
      width: height * this.camera.aspect,
      height
    };
  }

  @HostListener('window:resize')
  onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    this.hovering = true;
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  @HostListener('document:mouseleave')
  onDocumentLeave(): void {
    this.hovering = false;
  }

  @HostListener('document:mouseenter')
  onDocumentEnter(): void {
    this.hovering = true;
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.scene?.remove(this.mesh);
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }
}
