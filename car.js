import * as THREE from './three.js-master/build/three.module.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';


const container = document.getElementById('car-viewer');
console.log('car.js loaded');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0400ff);

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
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

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
    console.log('Car loaded');
  },
  undefined,
  (e) => console.error(e)
);

// Render
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
