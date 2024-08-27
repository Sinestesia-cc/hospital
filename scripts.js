let currentModel = 'model1';
let scene, camera, renderer;
let reticle, controller, raycaster;
let models = {};
let hotspots = [];
let tooltip = document.getElementById('tooltip');

init();
animate();

function init() {
    // Configuración básica de Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    
    raycaster = new THREE.Raycaster();

    // Detección de superficie
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    reticle = new THREE.Mesh(geometry, material);
    reticle.visible = false;
    scene.add(reticle);
    
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Carga de modelos
    const loader = new THREE.GLTFLoader();
    loader.load('models/model1.glb', (gltf) => { models['model1'] = gltf.scene; });
    loader.load('models/model2.glb', (gltf) => { models['model2'] = gltf.scene; });
    loader.load('models/model3.glb', (gltf) => { models['model3'] = gltf.scene; });

    document.body.appendChild(VRButton.createButton(renderer));
}

function onSelect() {
    if (reticle.visible) {
        const model = models[currentModel].clone();
        model.position.setFromMatrixPosition(reticle.matrix);
        scene.add(model);
        
        // Crear un hotspot
        createHotspot(model, "Este es un hotspot sobre el modelo.");
    }
}

function createHotspot(model, infoText) {
    // Crear una esfera pequeña como hotspot
    const hotspotGeometry = new THREE
