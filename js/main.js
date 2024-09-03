window.addEventListener('load', () => {
  // Configurar la escena
  const scene = new THREE.Scene();

  // Configurar la cámara
  const camera = new THREE.Camera();
  scene.add(camera);

  // Configurar el renderizador
  const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Configurar AR.js
  const arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam'
  });

  arToolkitSource.init(() => {
      onResize();
  });

  window.addEventListener('resize', () => {
      onResize();
  });

  const arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/data/camera_para.dat',
      detectionMode: 'mono',
      maxDetectionRate: 30,
      canvasWidth: 80 * 3,
      canvasHeight: 60 * 3,
  });

  arToolkitContext.init(() => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  // Agregar un marcador
  const markerRoot = new THREE.Group();
  scene.add(markerRoot);

  const arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
      type: 'pattern',
      patternUrl: 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/data/patt.hiro',
  });

  // Agregar un cubo simple
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  const cube = new THREE.Mesh(geometry, material);
  markerRoot.add(cube);

  // Función de renderizado
  const animate = () => {
      requestAnimationFrame(animate);

      if (arToolkitSource.ready) {
          arToolkitContext.update(arToolkitSource.domElement);
      }

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
  };

  animate();

  // Ajustar el tamaño de la ventana
  function onResize() {
      arToolkitSource.onResizeElement();
      arToolkitSource.copyElementSizeTo(renderer.domElement);

      if (arToolkitContext.arController !== null) {
          arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
      }
  }
});
