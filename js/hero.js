/**
 * Hero animation module (Three.js r155+)
 *
 * Usage example:
 * import { initHero } from './hero.js';
 * const canvas = document.querySelector('#hero');
 * const controls = initHero(canvas, {
 *   background: '#06090f',
 *   colorPrimary: 0x7aa2ff,
 *   cubeSize: 0.9,
 *   urls: {
 *     printer: '/assets/models/printer.glb',
 *     scanner: '/assets/models/scanner.glb',
 *     part: '/assets/models/part.glb',
 *     env: '/assets/env/industrial.hdr'
 *   },
 *   skipOnClick: false
 * });
 * controls.pause();
 * controls.resume();
 * controls.destroy();
 */

import {
  AmbientLight,
  Box3,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  EquirectangularReflectionMapping,
  SRGBColorSpace,
  TorusGeometry,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const DECODER_PATH = 'https://www.gstatic.com/draco/v1/decoders/';
const POINT_COUNT = 1600;
const DPR_LIMIT = 1.5;
const LOOP_PHASES = ['idle', 'toPrinter', 'printing', 'toScanner', 'scanning', 'toCube', 'loopPause'];
const HERO_ARIA_LABEL = '3D hero animation: design→print→scan cycle';
const easeInOutCubic = (t) => (t < 0.5
  ? 4 * t * t * t
  : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smoothStep = (edge0, edge1, x) => {
  const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const DEFAULTS = {
  background: '#05070b',
  colorPrimary: 0x7aa2ff,
  cubeSize: 1,
  urls: {},
  durations: {
    idle: 3,
    toPrinter: 1.5,
    printing: 4,
    toScanner: 1.2,
    scanning: 4,
    toCube: 1.5,
    loopPause: 1
  },
  reducedMotion: undefined,
  skipOnClick: true
};

const tmpBox = new Box3();
const tmpVec3 = new Vector3();

function cloneOptions(options) {
  const merged = {
    ...DEFAULTS,
    ...options,
    urls: { ...DEFAULTS.urls, ...options?.urls },
    durations: { ...DEFAULTS.durations, ...options?.durations }
  };
  merged.cubeSize = MathUtils.clamp(merged.cubeSize ?? DEFAULTS.cubeSize, 0.6, 1.5);
  return merged;
}

function prefersReducedMotion(options) {
  if (typeof window === 'undefined') return false;
  if (typeof options.reducedMotion === 'boolean') return options.reducedMotion;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  return media.matches;
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2')) ||
      !!(canvas.getContext('webgl'));
  } catch (err) {
    return false;
  }
}

function createFallbackImage(canvas, background, colorPrimary) {
  const placeholder = document.createElement('canvas');
  const size = 256;
  placeholder.width = size;
  placeholder.height = size;
  const ctx = placeholder.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = background === 'transparent' ? 'rgba(0,0,0,0)' : background;
  ctx.fillRect(0, 0, size, size);
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0a0d16');
  gradient.addColorStop(1, '#131a2c');
  ctx.fillStyle = gradient;
  ctx.fillRect(size * 0.15, size * 0.15, size * 0.7, size * 0.7);
  ctx.strokeStyle = `#${colorPrimary.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = size * 0.05;
  ctx.strokeRect(size * 0.18, size * 0.18, size * 0.64, size * 0.64);
  const img = new Image();
  img.alt = HERO_ARIA_LABEL;
  img.src = placeholder.toDataURL('image/png');
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  canvas.replaceWith(img);
  return img;
}

function setObjectOpacity(object, opacity) {
  object.traverse?.((child) => {
    if ('material' in child && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if ('opacity' in mat) {
          mat.transparent = true;
          mat.opacity = MathUtils.clamp(opacity, 0, 1);
        }
      }
    }
  });
}

function disposeObject(object) {
  if (!object) return;
  object.traverse?.((child) => {
    if ('geometry' in child && child.geometry) {
      child.geometry.dispose();
    }
    if ('material' in child && child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of materials) {
        if (mat.map) mat.map.dispose?.();
        if (mat.lightMap) mat.lightMap.dispose?.();
        if (mat.normalMap) mat.normalMap.dispose?.();
        if (mat.aoMap) mat.aoMap.dispose?.();
        if (mat.metalnessMap) mat.metalnessMap.dispose?.();
        if (mat.roughnessMap) mat.roughnessMap.dispose?.();
        if (mat.envMap && mat.envMap.isTexture) mat.envMap.dispose?.();
        mat.dispose?.();
      }
    }
  });
}

function setMaterialColor(object, color) {
  object.traverse?.((child) => {
    if ('material' in child && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      for (const mat of mats) {
        if ('color' in mat && mat.color?.isColor) {
          mat.color.lerp(new Color(color), 0.6);
        }
      }
    }
  });
}

function translateToGround(object) {
  tmpBox.setFromObject(object);
  const offset = tmpBox.min.y;
  if (Number.isFinite(offset)) {
    object.position.y -= offset;
  }
}

function randomInCube(size) {
  return new Vector3(
    (Math.random() - 0.5) * size,
    (Math.random() - 0.5) * size,
    (Math.random() - 0.5) * size
  );
}

class HeroExperience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {ReturnType<typeof cloneOptions>} options
   */
  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.durations = options.durations;
    this.colorPrimary = options.colorPrimary;
    this.preferReduced = prefersReducedMotion(options);
    this.destroyed = false;
    this.manualPaused = false;
    this.hoverPaused = false;
    this.skipEnabled = options.skipOnClick !== false;
    this.elapsed = 0;
    this.lastTime = 0;
    this.phaseDurations = LOOP_PHASES.map((name) => this.durations[name]);
    this.totalDuration = this.phaseDurations.reduce((a, b) => a + b, 0);
    this.phaseOffsets = [];
    let accum = 0;
    for (const duration of this.phaseDurations) {
      this.phaseOffsets.push(accum);
      accum += duration;
    }

    this.pointerHandlers = {
      enter: () => {
        this.hoverPaused = true;
      },
      leave: () => {
        this.hoverPaused = false;
      },
      click: () => {
        if (!this.skipEnabled) return;
        this.advancePhase();
      }
    };
    this.resizeHandler = () => this.handleResize();

    this.pointState = {
      reveal: 0,
      positions: null,
      cubeTargets: null,
      attribute: null,
      drawCount: 0,
      mode: 'part'
    };

    this.objects = {
      cube: null,
      printer: null,
      scanner: null,
      part: null,
      partContainer: new Group(),
      pointCloud: null,
      beam: null,
      printHead: null
    };

    this.fallbackImage = null;

    this.init();
  }

  init() {
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', HERO_ARIA_LABEL);

    if (!isWebGLAvailable()) {
      this.fallbackImage = createFallbackImage(this.canvas, this.options.background, this.options.colorPrimary);
      return;
    }

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: this.options.background === 'transparent'
    });
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(this.options.background === 'transparent' ? 0x000000 : new Color(this.options.background), this.options.background === 'transparent' ? 0 : 1);

    const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    this.renderer.setPixelRatio(dpr);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, 1, 0.1, 30);
    this.camera.position.set(3, 2.3, 3.6);
    this.camera.lookAt(0, 0.7, 0);

    this.scene.add(new AmbientLight(0x1b1f2a, 0.6));
    const keyLight = new DirectionalLight(0xffffff, 1.25);
    keyLight.position.set(2.5, 4.2, 3);
    const rimLight = new DirectionalLight(0x88aaff, 0.9);
    rimLight.position.set(-3, 2.2, -2.5);
    this.scene.add(keyLight, rimLight);

    this.setupObjects();
    this.attachListeners();
    this.handleResize();

    this.loadEnvironment();
    this.loadAssets();

    this.lastTime = performance.now();
    if (this.preferReduced) {
      this.renderStaticFrame();
      return;
    }

    this.start();
  }

  attachListeners() {
    this.canvas.addEventListener('pointerenter', this.pointerHandlers.enter);
    this.canvas.addEventListener('pointerleave', this.pointerHandlers.leave);
    this.canvas.addEventListener('click', this.pointerHandlers.click);
    window.addEventListener('resize', this.resizeHandler);
  }

  detachListeners() {
    this.canvas.removeEventListener('pointerenter', this.pointerHandlers.enter);
    this.canvas.removeEventListener('pointerleave', this.pointerHandlers.leave);
    this.canvas.removeEventListener('click', this.pointerHandlers.click);
    window.removeEventListener('resize', this.resizeHandler);
  }

  setupObjects() {
    // Cube placeholder
    const cubeGeo = new BoxGeometry(this.options.cubeSize, this.options.cubeSize, this.options.cubeSize, 1, 1, 1);
    const cubeMat = new MeshStandardMaterial({
      color: this.colorPrimary,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 1
    });
    const cube = new Mesh(cubeGeo, cubeMat);
    cube.name = 'HeroCube';
    this.scene.add(cube);
    this.objects.cube = cube;

    // Printer fallback
    const printer = this.buildPrinterFallback();
    setObjectOpacity(printer, 0);
    this.scene.add(printer);
    this.objects.printer = printer;

    // Scanner fallback
    const scanner = this.buildScannerFallback();
    setObjectOpacity(scanner, 0);
    this.scene.add(scanner);
    this.objects.scanner = scanner;

    // Part container & fallback geometry
    this.scene.add(this.objects.partContainer);
    const fallbackPart = this.buildPartFallback();
    this.setPartObject(fallbackPart);

    // Point cloud
    const points = this.createPointCloud();
    points.visible = false;
    this.scene.add(points);
    this.objects.pointCloud = points;

    // Scanning beam
    const beamGeo = new PlaneGeometry(0.02, 1.6, 1, 1);
    const beamMat = new MeshStandardMaterial({
      color: new Color(this.colorPrimary).multiplyScalar(1.3),
      emissive: new Color(this.colorPrimary).multiplyScalar(0.25),
      transparent: true,
      opacity: 0,
      roughness: 0.2,
      metalness: 0
    });
    const beam = new Mesh(beamGeo, beamMat);
    beam.rotation.y = Math.PI / 2;
    beam.position.set(0.55, 0.8, 0);
    this.scene.add(beam);
    this.objects.beam = beam;

    // Print head placeholder
    const headGeo = new BoxGeometry(0.2, 0.1, 0.2, 1, 1, 1);
    const headMat = new MeshStandardMaterial({
      color: new Color(this.colorPrimary).offsetHSL(0, -0.1, -0.1),
      roughness: 0.25,
      metalness: 0.35,
      transparent: true,
      opacity: 1
    });
    const head = new Mesh(headGeo, headMat);
    head.position.set(0, 1.1, 0);
    this.scene.add(head);
    this.objects.printHead = head;
  }

  buildPrinterFallback() {
    const group = new Group();
    const mat = new MeshStandardMaterial({
      color: this.colorPrimary,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 1
    });

    const base = new Mesh(new BoxGeometry(1.6, 0.1, 1.2, 1, 1, 1), mat);
    base.position.y = 0.05;
    const frame = new Mesh(new BoxGeometry(1.5, 1.4, 0.1, 1, 1, 1), mat);
    frame.position.set(0, 0.85, -0.55);
    const gantryLeft = new Mesh(new BoxGeometry(0.1, 1.4, 1.2, 1, 1, 1), mat);
    gantryLeft.position.set(-0.75, 0.85, 0);
    const gantryRight = gantryLeft.clone();
    gantryRight.position.x = 0.75;
    const topBar = new Mesh(new BoxGeometry(1.5, 0.1, 1.2, 1, 1, 1), mat);
    topBar.position.set(0, 1.55, 0);

    group.add(base, frame, gantryLeft, gantryRight, topBar);
    group.position.set(0, 0, 0);
    group.visible = true;
    return group;
  }

  buildScannerFallback() {
    const group = new Group();
    const mat = new MeshStandardMaterial({
      color: new Color(this.colorPrimary).offsetHSL(0.02, -0.1, 0.05),
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 1
    });
    const base = new Mesh(new CylinderGeometry(0.5, 0.6, 0.15, 24), mat);
    base.position.y = 0.075;
    const pillar = new Mesh(new BoxGeometry(0.18, 1.6, 0.18, 1, 1, 1), mat);
    pillar.position.set(-0.4, 0.95, 0);
    const arch = new Mesh(new TorusGeometry(0.9, 0.08, 12, 48, Math.PI * 1.1), mat);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 1.4, 0);
    const body = new Mesh(new BoxGeometry(1.2, 0.35, 0.8, 1, 1, 1), mat);
    body.position.set(0.2, 1.6, 0);
    group.add(base, pillar, arch, body);
    return group;
  }

  buildPartFallback() {
    const geo = new TorusKnotGeometry(0.28, 0.09, 128, 16);
    const mat = new MeshStandardMaterial({
      color: new Color(this.colorPrimary).offsetHSL(0, -0.08, 0.12),
      roughness: 0.3,
      metalness: 0.15,
      transparent: true,
      opacity: 1
    });
    const mesh = new Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    translateToGround(mesh);
    mesh.position.y += 0.02;
    return mesh;
  }

  createPointCloud() {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(POINT_COUNT * 3);
    const revealOrder = new Float32Array(POINT_COUNT);
    for (let i = 0; i < POINT_COUNT; i++) {
      const v = randomInCube(this.options.cubeSize * 0.6);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y + 0.3;
      positions[i * 3 + 2] = v.z;
      revealOrder[i] = Math.random();
    }
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('reveal', new BufferAttribute(revealOrder, 1));
    geometry.setDrawRange(0, 0);

    const material = new PointsMaterial({
      color: new Color(this.colorPrimary).offsetHSL(0.05, -0.1, 0.1),
      size: 0.02 * Math.min(window.devicePixelRatio || 1, DPR_LIMIT),
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.pointState.positions = new Float32Array(POINT_COUNT * 3);
    this.pointState.cubeTargets = new Float32Array(POINT_COUNT * 3);
    this.pointState.attribute = geometry.getAttribute('position');
    this.pointState.drawCount = 0;

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  setPartObject(object) {
    if (this.objects.part) {
      this.objects.partContainer.remove(this.objects.part);
      disposeObject(this.objects.part);
    }
    this.objects.part = object;
    translateToGround(object);
    object.position.y += 0.02;
    this.objects.partContainer.add(object);

    this.updatePartBounds();
    this.populatePointCloud();
    setMaterialColor(object, this.colorPrimary);
  }

  updatePartBounds() {
    tmpBox.setFromObject(this.objects.part);
    this.partBounds = tmpBox.clone();
    this.partHeight = Math.max(this.partBounds.max.y - this.partBounds.min.y, 0.001);
  }

  populatePointCloud() {
    if (!this.objects.pointCloud) return;
    const geometry = this.objects.pointCloud.geometry;
    const positions = this.pointState.positions;
    const cubeTargets = this.pointState.cubeTargets;
    if (!positions || !cubeTargets) return;
    const src = this.collectSurfaceSamples();
    for (let i = 0; i < POINT_COUNT; i++) {
      const s = src[i % src.length];
      positions[i * 3] = s.x;
      positions[i * 3 + 1] = s.y;
      positions[i * 3 + 2] = s.z;
      const cube = randomInCube(this.options.cubeSize * 0.48);
      cubeTargets[i * 3] = cube.x;
      cubeTargets[i * 3 + 1] = cube.y + this.options.cubeSize * 0.5;
      cubeTargets[i * 3 + 2] = cube.z;
    }
    this.applyPointPositions(positions);
    geometry.setDrawRange(0, 0);
    this.pointState.drawCount = 0;
    this.pointState.mode = 'part';
  }

  collectSurfaceSamples() {
    const samples = [];
    this.objects.part.traverse?.((child) => {
      if (!child.isMesh) return;
      const geo = child.geometry;
      if (!geo) return;
      const position = geo.attributes.position;
      if (!position) return;
      for (let i = 0; i < position.count; i += Math.ceil(position.count / (POINT_COUNT / 2))) {
        tmpVec3.fromBufferAttribute(position, i).applyMatrix4(child.matrixWorld);
        samples.push(tmpVec3.clone());
        if (samples.length >= POINT_COUNT / 2) break;
      }
    });
    if (samples.length === 0) {
      samples.push(new Vector3(0, 0.4, 0));
    }
    return samples;
  }

  applyPointPositions(source) {
    const attr = this.pointState.attribute;
    if (!attr) return;
    attr.array.set(source);
    attr.needsUpdate = true;
  }

  loadEnvironment() {
    const envUrl = this.options.urls?.env;
    if (!envUrl) return;
    const loader = new RGBELoader();
    loader.load(envUrl, (texture) => {
      texture.mapping = EquirectangularReflectionMapping;
      this.scene.environment = texture;
    });
  }

  loadAssets() {
    const { printer, scanner, part } = this.options.urls || {};
    const loader = new GLTFLoader();
    if (DRACOLoader) {
      const draco = new DRACOLoader();
      draco.setDecoderPath(DECODER_PATH);
      loader.setDRACOLoader(draco);
      this.dracoLoader = draco;
    }

    const promises = [];
    if (printer) {
      promises.push(this.loadGLTF(loader, printer).then((gltf) => {
        const object = gltf.scene || gltf.scenes?.[0];
        if (!object) return;
        setMaterialColor(object, this.colorPrimary);
        setObjectOpacity(object, 0);
        object.position.set(0, 0, 0);
        this.scene.add(object);
        this.scene.remove(this.objects.printer);
        disposeObject(this.objects.printer);
        this.objects.printer = object;
      }).catch(() => {}));
    }

    if (scanner) {
      promises.push(this.loadGLTF(loader, scanner).then((gltf) => {
        const object = gltf.scene || gltf.scenes?.[0];
        if (!object) return;
        setMaterialColor(object, this.colorPrimary);
        setObjectOpacity(object, 0);
        object.position.set(0, 0, 0);
        this.scene.add(object);
        this.scene.remove(this.objects.scanner);
        disposeObject(this.objects.scanner);
        this.objects.scanner = object;
      }).catch(() => {}));
    }

    if (part) {
      promises.push(this.loadGLTF(loader, part).then((gltf) => {
        const object = gltf.scene || gltf.scenes?.[0];
        if (!object) return;
        setMaterialColor(object, this.colorPrimary);
        this.setPartObject(object);
      }).catch(() => {}));
    }

    Promise.all(promises).finally(() => {
      if (this.preferReduced) {
        this.renderStaticFrame();
      }
    });
  }

  loadGLTF(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  renderStaticFrame() {
    this.updateIdle(0);
    setObjectOpacity(this.objects.cube, 1);
    this.objects.cube.rotation.set(Math.PI / 6, Math.PI / 4, 0);
    this.objects.cube.scale.setScalar(this.options.cubeSize);
    if (this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  start() {
    if (this.raf) cancelAnimationFrame(this.raf);
    const loop = () => {
      if (this.destroyed) return;
      this.raf = requestAnimationFrame(loop);
      this.update();
    };
    this.raf = requestAnimationFrame(loop);
  }

  update() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    if (!this.isPaused()) {
      this.elapsed += dt;
    }
    const cycleTime = this.elapsed % this.totalDuration;
    const { phase, progress } = this.resolvePhase(cycleTime);

    this.applyPhase(phase, progress, dt, cycleTime);

    this.renderer.render(this.scene, this.camera);
  }

  isPaused() {
    return this.manualPaused || this.hoverPaused;
  }

  resolvePhase(time) {
    for (let i = LOOP_PHASES.length - 1; i >= 0; i--) {
      const start = this.phaseOffsets[i];
      const duration = this.phaseDurations[i];
      if (time >= start) {
        const progress = duration > 0 ? (time - start) / duration : 0;
        return { phase: LOOP_PHASES[i], progress: MathUtils.clamp(progress, 0, 1) };
      }
    }
    return { phase: 'idle', progress: 0 };
  }

  applyPhase(phase, progress, dt, cycleTime) {
    switch (phase) {
      case 'idle':
        this.updateIdle(cycleTime);
        break;
      case 'toPrinter':
        this.updateToPrinter(progress);
        break;
      case 'printing':
        this.updatePrinting(progress, dt);
        break;
      case 'toScanner':
        this.updateToScanner(progress);
        break;
      case 'scanning':
        this.updateScanning(progress, dt);
        break;
      case 'toCube':
        this.updateToCube(progress, dt);
        break;
      case 'loopPause':
        this.updateLoopPause(progress);
        break;
      default:
        this.updateIdle(cycleTime);
        break;
    }
  }

  updateIdle(time) {
    const cube = this.objects.cube;
    const t = time + 10;
    const rotationSpeed = 0.25;
    cube.visible = true;
    cube.material.opacity = 1;
    cube.scale.setScalar(this.options.cubeSize * (1 + Math.sin(t * 1.2) * 0.02));
    cube.rotation.y = t * rotationSpeed;
    cube.rotation.x = Math.sin(t * 0.7) * 0.25 + 0.3;
    cube.rotation.z = Math.cos(t * 0.5) * 0.1;

    setObjectOpacity(this.objects.printer, 0);
    setObjectOpacity(this.objects.scanner, 0);
    this.objects.partContainer.visible = false;
    this.objects.partContainer.rotation.set(0, 0, 0);
    this.objects.pointCloud.visible = false;
    this.objects.pointCloud.material.opacity = 0;
    this.objects.beam.material.opacity = 0;
    this.objects.printHead.visible = false;
  }

  updateToPrinter(progress) {
    const eased = easeInOutCubic(progress);
    const cube = this.objects.cube;
    cube.visible = true;
    cube.scale.setScalar(this.options.cubeSize * MathUtils.lerp(1, 0.8, eased));
    cube.material.opacity = MathUtils.lerp(1, 0, eased);

    const printer = this.objects.printer;
    setObjectOpacity(printer, eased);
    printer.visible = true;

    this.objects.partContainer.visible = true;
    this.objects.partContainer.scale.set(1, 0.001 + eased * 0.2, 1);
    this.objects.partContainer.position.y = 0;
    this.objects.printHead.visible = eased > 0.1;
    this.objects.pointCloud.visible = false;
    this.objects.pointCloud.material.opacity = 0;
  }

  updatePrinting(progress, dt) {
    const eased = easeInOutCubic(progress);
    const printer = this.objects.printer;
    setObjectOpacity(printer, 1);
    printer.visible = true;
    this.objects.cube.material.opacity = 0;
    this.objects.cube.visible = false;

    const growth = Math.max(eased, 0.02);
    this.objects.partContainer.visible = true;
    this.objects.partContainer.scale.set(1, growth, 1);
    this.objects.partContainer.position.y = 0;

    const head = this.objects.printHead;
    head.visible = true;
    const noiseTime = this.elapsed * 0.7;
    const radius = 0.45;
    const speed = 0.9;
    head.position.x = Math.sin(noiseTime * speed) * radius * 0.6;
    head.position.z = Math.cos(noiseTime * speed * 1.2) * radius * 0.6;
    head.position.y = 0.5 + growth * this.partHeight + Math.sin(noiseTime) * 0.05;

    this.objects.pointCloud.visible = false;
    this.objects.pointCloud.material.opacity = 0;
    this.objects.beam.material.opacity = 0;
  }

  updateToScanner(progress) {
    const eased = easeInOutCubic(progress);
    setObjectOpacity(this.objects.printer, 1 - eased);
    setObjectOpacity(this.objects.scanner, eased);
    this.objects.scanner.visible = true;
    this.objects.partContainer.visible = true;
    this.objects.partContainer.scale.set(1, 1, 1);
    this.objects.cube.visible = false;
    this.objects.printHead.visible = false;

    const basePos = new Vector3(3, 2.3, 3.6);
    const targetPos = new Vector3(2.8, 2.4, 3.4);
    this.camera.position.lerpVectors(basePos, targetPos, eased);
    this.camera.lookAt(0, 0.7, 0);
  }

  updateScanning(progress, dt) {
    const eased = easeInOutCubic(progress);
    setObjectOpacity(this.objects.printer, 0);
    setObjectOpacity(this.objects.scanner, 1);
    this.objects.partContainer.visible = true;
    this.objects.pointCloud.visible = true;

    if (this.pointState.mode !== 'part' && this.pointState.positions) {
      this.applyPointPositions(this.pointState.positions);
      this.objects.pointCloud.geometry.setDrawRange(0, 0);
      this.pointState.drawCount = 0;
      this.pointState.mode = 'part';
    }

    const beamMat = this.objects.beam.material;
    beamMat.opacity = Math.min(1, eased * 1.2);
    const beamHeight = this.partHeight + 0.6;
    this.objects.beam.scale.y = beamHeight;
    const beamTravel = eased * beamHeight;
    this.objects.beam.position.y = beamTravel - beamHeight * 0.5 + 0.3;

    const returnPhase = smoothStep(0.7, 1, eased);
    this.objects.pointCloud.geometry.setDrawRange(0, Math.floor(POINT_COUNT * eased));
    this.pointState.drawCount = Math.floor(POINT_COUNT * eased);
    const material = this.objects.pointCloud.material;
    material.opacity = MathUtils.lerp(0.15, 0.95, eased);

    const rotationBase = Math.PI * 0.5 * eased;
    this.objects.partContainer.rotation.y = rotationBase + returnPhase * Math.PI * 0.5;

    const wobble = Math.sin(this.elapsed * 1.5) * 0.04;
    this.objects.pointCloud.rotation.y = this.objects.partContainer.rotation.y;
    this.objects.pointCloud.position.y = wobble * 0.5;
  }

  updateToCube(progress, dt) {
    const eased = easeInOutCubic(progress);
    setObjectOpacity(this.objects.scanner, 1 - eased);
    this.objects.partContainer.visible = true;
    this.objects.pointCloud.visible = true;

    const attr = this.pointState.attribute;
    if (attr && this.pointState.positions && this.pointState.cubeTargets) {
      const source = this.pointState.positions;
      const targets = this.pointState.cubeTargets;
      for (let i = 0; i < attr.count; i++) {
        const idx = i * 3;
        const sx = source[idx];
        const sy = source[idx + 1];
        const sz = source[idx + 2];
        const tx = targets[idx];
        const ty = targets[idx + 1];
        const tz = targets[idx + 2];
        attr.array[idx] = MathUtils.lerp(sx, tx, eased);
        attr.array[idx + 1] = MathUtils.lerp(sy, ty, eased);
        attr.array[idx + 2] = MathUtils.lerp(sz, tz, eased);
      }
      attr.needsUpdate = true;
    }

    this.objects.pointCloud.material.opacity = MathUtils.lerp(0.9, 0.1, eased);
    this.objects.pointCloud.geometry.setDrawRange(0, this.pointState.drawCount);

    const cube = this.objects.cube;
    cube.visible = true;
    cube.material.opacity = Math.min(1, eased * 1.1);
    cube.scale.setScalar(this.options.cubeSize * MathUtils.lerp(0.85, 1, eased));
    cube.rotation.y += dt * 0.6;

    setObjectOpacity(this.objects.partContainer, 1 - eased);
    this.objects.partContainer.visible = eased < 0.95;
    this.objects.beam.material.opacity = Math.max(0, 0.3 - eased);
    if (eased >= 0.99) {
      this.pointState.mode = 'cube';
    }
  }

  updateLoopPause(progress) {
    const cube = this.objects.cube;
    cube.visible = true;
    cube.material.opacity = 1;
    cube.scale.setScalar(this.options.cubeSize);
    cube.rotation.x = Math.PI / 6;
    cube.rotation.y = Math.PI / 4;
    cube.rotation.z = 0;

    setObjectOpacity(this.objects.printer, 0);
    setObjectOpacity(this.objects.scanner, 0);
    this.objects.pointCloud.visible = false;
    this.objects.partContainer.visible = false;
    this.objects.beam.material.opacity = 0;
  }

  advancePhase() {
    const cycleTime = this.elapsed % this.totalDuration;
    let index = LOOP_PHASES.findIndex((name, i) => cycleTime >= this.phaseOffsets[i] && cycleTime < this.phaseOffsets[i] + this.phaseDurations[i]);
    if (index === -1) index = 0;
    const nextIndex = (index + 1) % LOOP_PHASES.length;
    const delta = (this.phaseOffsets[nextIndex] ?? this.totalDuration) - cycleTime;
    if (delta <= 0) {
      this.elapsed += this.totalDuration - cycleTime + 0.001;
    } else {
      this.elapsed += delta + 0.001;
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    const width = this.canvas.clientWidth || 1;
    const height = this.canvas.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  pause() {
    this.manualPaused = true;
  }

  resume() {
    this.manualPaused = false;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.detachListeners();
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.renderer) {
      this.renderer.dispose();
    }
    disposeObject(this.scene);
    if (this.scene?.environment && this.scene.environment.isTexture) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
    if (this.fallbackImage) {
      this.fallbackImage.remove();
    }
  }
}

/**
 * Initialize hero animation for provided canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Partial<typeof DEFAULTS>} [options]
 */
export function initHero(canvas, options = {}) {
  const merged = cloneOptions(options);
  if (merged.background === 'transparent') {
    canvas.classList.add('hero--transparent');
  }
  const experience = new HeroExperience(canvas, merged);
  return {
    destroy: () => experience.destroy(),
    pause: () => experience.pause(),
    resume: () => experience.resume()
  };
}

let observer = null;

function ensureAutoInit() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (observer) return;
  const canvases = Array.from(document.querySelectorAll('canvas[data-hero]'));
  const records = new Map();

  const getActiveCount = () => Array.from(records.values()).filter((r) => r.running).length;
  const tryActivateNext = () => {
    for (const [canvas, record] of records) {
      if (record.running) continue;
      if (!record.pending) continue;
      if (getActiveCount() >= 2) break;
      if (!record.instance) {
        record.instance = initHero(canvas, {});
      }
      record.instance.resume?.();
      record.running = true;
      record.pending = false;
    }
  };

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const canvas = /** @type {HTMLCanvasElement} */ (entry.target);
      const record = records.get(canvas) ?? { instance: null, running: false, pending: false };
      if (!records.has(canvas)) records.set(canvas, record);

      if (entry.isIntersecting) {
        if (!record.instance && getActiveCount() < 2) {
          record.instance = initHero(canvas, {});
          record.running = true;
          record.pending = false;
        } else if (record.instance) {
          if (getActiveCount() < 2) {
            record.instance.resume?.();
            record.running = true;
            record.pending = false;
          } else {
            record.pending = true;
          }
        } else {
          record.pending = true;
        }
      } else {
        if (record.instance && record.running) {
          record.instance.pause?.();
          record.running = false;
        }
        record.pending = false;
      }
    }
    tryActivateNext();
  }, { threshold: 0.25 });

  canvases.forEach((canvas) => {
    records.set(canvas, { instance: null, running: false, pending: false });
    observer.observe(canvas);
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    ensureAutoInit();
  } else {
    window.addEventListener('DOMContentLoaded', ensureAutoInit, { once: true });
  }
}

