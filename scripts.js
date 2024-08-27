let currentModel = 'model1';
let scene, camera, renderer;
let reticle, controller;
let models = {};
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
        model.scale.set(0.5, 0.5, 0.5);  // Ajusta el tamaño del modelo si es necesario
        scene.add(model);
    }
}

function selectModel(modelId) {
    currentModel = modelId;
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    reticle.visible = false;

    if (renderer.xr.isPresenting) {
        const session = renderer.xr.getSession();
        const viewerSpace = renderer.xr.getReferenceSpace();
        const viewerPose = session.getViewerPose(viewerSpace);

        if (viewerPose) {
            const hitTestSource = session.requestHitTestSource({ space: viewerSpace });

            if (hitTestSource) {
                const hitTestResults = session.getHitTestResults(hitTestSource);
                if (hitTestResults.length > 0) {
                    const hit = hitTestResults[0];
                    const pose = hit.getPose(viewerSpace);

                    reticle.visible = true;
                    reticle.matrix.fromArray(pose.transform.matrix);
                }
            }
        }
    }

    renderer.render(scene, camera);
}
