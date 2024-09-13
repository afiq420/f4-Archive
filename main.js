import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('canvas-container');

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera setup
const camera = new THREE.PerspectiveCamera(100, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(3, 7, 9);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Orbit controls for camera movement
const controls = new OrbitControls(camera, renderer.domElement);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
scene.add(directionalLight);

let model;
let time = 0;
const verticalAmplitude = 1;
const horizontalAmplitude = 1;
const frequency = 1;

// Function for oblique V motion
function obliqueVMotion(t) {
    t = t % 4;
    if (t < 1) {
        return { x: t * horizontalAmplitude, y: t * verticalAmplitude };
    } else if (t < 2) {
        t = t - 1;
        return { x: horizontalAmplitude - t * horizontalAmplitude, y: verticalAmplitude - t * verticalAmplitude };
    } else if (t < 3) {
        t = t - 2;
        return { x: -t * horizontalAmplitude, y: t * verticalAmplitude };
    } else {
        t = t - 3;
        return { x: -horizontalAmplitude + t * horizontalAmplitude, y: verticalAmplitude - t * verticalAmplitude };
    }
}

//Load the 3D model
const loader = new GLTFLoader();
loader.load(
    '/scene.gltf',
    function (gltf) {
        model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        scene.add(model);
    },
    undefined,
    function (error) {
        console.error('An error occurred while loading the model', error);
    }
);

// Animation function
function animate() {
    requestAnimationFrame(animate);
    time += 0.03;

    if (model) {
        const newPosition = obliqueVMotion(time * frequency);
        model.position.x = newPosition.x;
        model.position.y = newPosition.y;
        model.rotation.y += 0.04;
        
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Audio setup
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

// Load audio file but wait for user interaction to play
audioLoader.load(
  'maxwellTheme.mp3',
  (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);

    // Start audio after user clicks anywhere on the page
    window.addEventListener('click', () => {
        if (!sound.isPlaying) {
            sound.play();
        }
    });
  },
  undefined,
  (error) => {
    console.error('An error occurred while loading the audio file:', error);
  }
);
