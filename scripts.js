let scene, camera, renderer, reticle;
let controller;

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

    // Crear el retículo para la detección de superficies
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x0f9b0f });
    reticle = new THREE.Mesh(geometry, material);
    reticle.visible = false;
    scene.add(reticle);

    // Configurar el controlador XR para interactuar
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Añadir un botón VR para activar la AR
    document.body.appendChild(VRButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize);
}

function onSelect() {
    if (reticle.visible) {
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.setFromMatrixPosition(reticle.matrix);
        scene.add(cube);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    reticle.visible = false;

    const session = renderer.xr.getSession();

    if (session) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const viewerPose = session.requestAnimationFrame;
        const hitTestSource = session.requestHitTestSource({ space: referenceSpace });

        if (hitTestSource) {
            const hitTestResults = session.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const pose = hit.getPose(referenceSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            }
        }
    }

    renderer.render(scene, camera);
}
