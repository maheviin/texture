import * as THREE from './three.js-master/build/three.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js';


const container = document.getElementById('car-viewer');
if (!container) console.error('No #car-viewer element found');
console.log('car.js loaded', container && container.clientWidth, container && container.clientHeight);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0400ff);

// Reference to the loaded car model so textures can be applied later
let carModel = null;

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 6);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
container.appendChild(renderer.domElement);

// Responsive sizing
function resize() {
  const w = Math.max(1, container.clientWidth);
  const h = Math.max(1, container.clientHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
}
window.addEventListener('resize', resize, { passive: true });
resize();

// Light
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 1);
dir.position.set(5, 5, 5);
scene.add(dir);

// Load model
const loader = new GLTFLoader();
loader.load(
  './car/scene.gltf',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);
    scene.add(model);
    // keep a reference so textures can be applied later
    carModel = model;
    console.log('Car loaded');

    // Fit camera to model bounds
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const fitHeightDistance = maxDim / (2 * Math.tan(fov / 2));
    const distance = fitHeightDistance * 1.2; // factor to pad

    camera.position.set(center.x, center.y + maxDim * 0.25, center.z + distance);
    camera.near = Math.max(0.1, distance / 100);
    camera.far = distance * 100;
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    // Update controls target if present
    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
    // Ensure canvas sized after model placed
    resize();
  },
  undefined,
  (e) => console.error(e)
);

// Render
// Orbit controls so user can inspect the car
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Texture loader + handler
const textureLoader = new THREE.TextureLoader();

window.addEventListener('texture-selected', (ev) => {
  const src = ev && ev.detail && ev.detail.src;
  if (!src) return;
  if (!carModel) {
    console.warn('Texture selected but model is not loaded yet');
    return;
  }

  console.log('Loading texture:', src);
  textureLoader.load(
    src,
    (tex) => {
      // GLTF albedo should be sRGB
      tex.encoding = THREE.sRGBEncoding;
      // glTF texture orientation expects flipY = false when applied to GLTF materials
      tex.flipY = false;

      carModel.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (!mat) return;
          // apply as base color / map
          if ('map' in mat) {
            mat.map = tex;
            // clear any color tint so texture displays accurately
            if (mat.color) mat.color.set(0xffffff);
            mat.needsUpdate = true;
          }
        });
      });

      console.log('Texture applied');
    },
    undefined,
    (err) => console.error('Texture load error', err)
  );
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
