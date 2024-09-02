import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller;
let model, currentModelIndex = 0;
let models = ['models/model1.glb', 'models/model2.glb', 'models/model3.glb'];

init();
animate();

function init() {
  // Escena
  scene = new THREE.Scene();

  // Cámara
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

  // Interacción táctil
  document.getElementById('left-arrow').addEventListener('click', () => changeModel(-1));
  document.getElementById('right-arrow').addEventListener('click', () => changeModel(1));

  // Controlador para hit-test
  controller = renderer.xr.getController(0);
  controller.addEventListener('select', onSelect);
  scene.add(controller);
}

function loadModel(url) {
  const loader = new GLTFLoader();
  loader.load(url, function (gltf) {
    if (model) scene.remove(model);
    model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2); // Ajusta el tamaño según sea necesario
    scene.add(model);
  });
}

function changeModel(direction) {
  currentModelIndex = (currentModelIndex + direction + models.length) % models.length;
  loadModel(models[currentModelIndex]);
}

function onSelect() {
  if (model) {
    const session = renderer.xr.getSession();
    const refSpace = renderer.xr.getReferenceSpace();
    const frame = session.requestAnimationFrame();

    if (frame) {
      const viewerSpace = session.requestReferenceSpace('viewer');
      const hitTestSource = session.requestHitTestSource({ space: viewerSpace });

      hitTestSource.then(source => {
        const hitTestResults = frame.getHitTestResults(source);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(refSpace);

          model.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
          model.rotation.set(pose.transform.orientation.x, pose.transform.orientation.y, pose.transform.orientation.z);
        }
      });
    }
  }
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}
