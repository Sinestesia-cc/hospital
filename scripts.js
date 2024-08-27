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
    const hotspotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const hotspotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);

    // Posiciona el hotspot encima del modelo (puedes ajustar la posición)
    hotspot.position.set(0, 0.5, 0);
    model.add(hotspot);

    // Guardar información del hotspot
    hotspot.userData.infoText = infoText;
    hotspots.push(hotspot);

    // Añadir evento de clic
    hotspot.onClick = function() {
        showTooltip(infoText);
    };
}

function showTooltip(text) {
    tooltip.innerText = text;
    tooltip.style.display = 'block';
}

function hideTooltip() {
    tooltip.style.display = 'none';
}

function selectModel(modelId) {
    currentModel = modelId;
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    reticle.visible = false;
    const session = renderer.xr.getSession();

    if (session) {
        const frame = renderer.xr.getFrame();
        const referenceSpace = renderer.xr.getReferenceSpace();
        const viewerPose = frame.getViewerPose(referenceSpace);

        if (viewerPose) {
            const hitTestResults = frame.getHitTestResults(session.requestHitTestSource());

            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            }
        }
    }

    // Detectar si un hotspot fue seleccionado
    if (controller) {
        raycaster.setFromCamera({ x: 0, y: 0 }, camera);
        const intersects = raycaster.intersectObjects(hotspots);

        if (intersects.length > 0) {
            intersects[0].object.onClick();
        } else {
            hideTooltip();
        }
    }

    renderer.render(scene, camera);
}
