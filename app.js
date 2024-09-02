import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller;
let model, currentModelIndex = 0;
const models = ['model1.glb', 'model2.glb', 'model3.glb'];

init();
animate();

function init() {
  // Configurar escena
  scene = new THREE.Scene();

  // Configurar cámara
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
  
  // Luz
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);
  
  // Renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  // Botón AR
  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  // Cargar el primer modelo
  loadModel(models[currentModelIndex]);

  // Botones para cambiar modelos
  document.getElementById('left-arrow').addEventListener('click', () => changeModel(-1));
  document.getElementById('right-arrow').addEventListener('click', () => changeModel(1));
}

function loadModel(url) {
  const loader = new GLTFLoader();
  loader.load(url, function (gltf) {
    if (model) scene.remove(model);
    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); // Ajusta el tamaño si es necesario
    scene.add(model);
  });
}

function changeModel(direction) {
  currentModelIndex = (currentModelIndex + direction + models.length) % models.length;
  loadModel(models[currentModelIndex]);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}
