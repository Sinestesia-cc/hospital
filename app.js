import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let model, currentModelIndex = 0;
let models = ['models/model1.glb', 'models/model2.glb', 'models/model3.glb'];

init();
animate();

function init() {
    // Escena y Cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Botón AR
    document.body.appendChild(ARButton.createButton(renderer));

    // Luz
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Cargar el primer modelo
    loadModel(models[currentModelIndex]);

    // Interacción de Pantalla Táctil
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);
    
    // Cambiar Modelo con Flechas
    document.getElementById('left-arrow').addEventListener('click', () => changeModel(-1));
    document.getElementById('right-arrow').addEventListener('click', () => changeModel(1));
}

function loadModel(url) {
    const loader = new GLTFLoader();
    loader.load(url, function (gltf) {
        if (model) scene.remove(model); // Eliminar modelo anterior
        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(0, 0, -1);
        scene.add(model);
    });
}

function changeModel(direction) {
    currentModelIndex = (currentModelIndex + direction + models.length) % models.length;
    loadModel(models[currentModelIndex]);
}

let initialTouchDistance = 0;
let initialModelScale = new THREE.Vector3();

function onTouchStart(event) {
    if (event.touches.length === 2) {
        initialTouchDistance = getTouchDistance(event);
        initialModelScale.copy(model.scale);
    }
}

function onTouchMove(event) {
    if (event.touches.length === 2) {
        const currentTouchDistance = getTouchDistance(event);
        const scaleFactor = currentTouchDistance / initialTouchDistance;
        model.scale.set(
            initialModelScale.x * scaleFactor,
            initialModelScale.y * scaleFactor,
            initialModelScale.z * scaleFactor
        );
    } else if (event.touches.length === 1) {
        const touch = event.touches[0];
        const deltaX = touch.movementX || touch.pageX - touch.clientX;
        model.rotation.y -= deltaX * 0.005;
    }
}

function getTouchDistance(event) {
    const dx = event.touches[0].pageX - event.touches[1].pageX;
    const dy = event.touches[0].pageY - event.touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
}
