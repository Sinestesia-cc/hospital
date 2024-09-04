let currentModelIndex = 0;
const models = ['#model1', '#model2', '#model3'];

AFRAME.registerComponent('model-handler', {
    init: function () {
        this.el.addEventListener('model-loaded', this.onModelLoaded.bind(this));
    },
    onModelLoaded: function () {
        document.querySelector('#current-model').setAttribute('visible', 'true');
    }
});

window.onload = function () {
    const modelContainer = document.querySelector('#model-container');
    const currentModel = document.querySelector('#current-model');
    const prevButton = document.querySelector('#prev-model');
    const nextButton = document.querySelector('#next-model');

    function switchModel(direction) {
        currentModelIndex = (currentModelIndex + direction + models.length) % models.length;
        currentModel.setAttribute('gltf-model', models[currentModelIndex]);
    }

    prevButton.addEventListener('click', () => switchModel(-1));
    nextButton.addEventListener('click', () => switchModel(1));

    // Initialize AR
    const arSystem = document.querySelector('a-scene').systems['arjs'];
    arSystem.arReady.then(() => {
        modelContainer.setAttribute('visible', 'true');
    });
};