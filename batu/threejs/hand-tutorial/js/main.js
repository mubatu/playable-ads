(function () {
    'use strict';

    const sceneRoot = document.getElementById('scene-root');
    const gestureEl = document.getElementById('gesture');
    const spaceEl = document.getElementById('space');
    const durationEl = document.getElementById('duration');
    const loopDelayEl = document.getElementById('loop-delay');
    const sizeEl = document.getElementById('size');
    const rotationEl = document.getElementById('rotation');
    const anchorXEl = document.getElementById('anchor-x');
    const anchorYEl = document.getElementById('anchor-y');
    const showTrailEl = document.getElementById('show-trail');
    const followDirectionEl = document.getElementById('follow-direction');
    const flipXEl = document.getElementById('flip-x');
    const assetGalleryEl = document.getElementById('asset-gallery');
    const assetInputEl = document.getElementById('asset-input');
    const pickStartEl = document.getElementById('pick-start');
    const pickEndEl = document.getElementById('pick-end');
    const resetPointsEl = document.getElementById('reset-points');
    const copyConfigEl = document.getElementById('copy-config');
    const previewEl = document.getElementById('config-preview');
    const startReadoutEl = document.getElementById('start-readout');
    const endReadoutEl = document.getElementById('end-readout');
    const durationValueEl = document.getElementById('duration-value');
    const loopDelayValueEl = document.getElementById('loop-delay-value');
    const sizeValueEl = document.getElementById('size-value');
    const rotationValueEl = document.getElementById('rotation-value');
    const anchorXValueEl = document.getElementById('anchor-x-value');
    const anchorYValueEl = document.getElementById('anchor-y-value');
    const builtInAssets = [
        { id: 'hand-1', label: 'Hand 1', path: 'assets/hand-1.svg' },
        { id: 'hand-2', label: 'Hand 2', path: 'assets/hand-2.png' },
        { id: 'hand-3', label: 'Hand 3', path: 'assets/hand-3.png' }
    ];

    const demoScene = new HandTutorialDemoScene(sceneRoot);
    const defaultAsset = builtInAssets[0];
    const defaultPoints = demoScene.getDefaultPoints(spaceEl.value);
    const state = {
        picker: null,
        assetUrl: defaultAsset.path,
        assetConfigPath: './' + defaultAsset.path,
        objectUrl: null,
        selectedBuiltInAssetId: defaultAsset.id,
        from: defaultPoints.from,
        to: defaultPoints.to
    };

    const tutorial = new HandTutorial({
        container: sceneRoot,
        renderer: demoScene.renderer,
        camera: demoScene.camera,
        assetUrl: state.assetUrl,
        gesture: gestureEl.value,
        from: state.from,
        to: state.to,
        duration: parseFloat(durationEl.value),
        loopDelay: parseFloat(loopDelayEl.value),
        size: parseFloat(sizeEl.value),
        rotation: parseFloat(rotationEl.value),
        anchor: {
            x: parseFloat(anchorXEl.value),
            y: parseFloat(anchorYEl.value)
        },
        showTrail: showTrailEl.checked,
        followDirection: followDirectionEl.checked,
        flipX: flipXEl.checked
    });

    tutorial.play();
    demoScene.setMarkers(state.from, state.to, spaceEl.value);

    function clonePoint(point) {
        return {
            space: point.space,
            x: point.x,
            y: point.y,
            z: point.z
        };
    }

    function renderAssetGallery() {
        let index;

        for (index = 0; index < builtInAssets.length; index += 1) {
            const asset = builtInAssets[index];
            const button = document.createElement('button');
            const thumb = document.createElement('span');
            const image = document.createElement('img');
            const label = document.createElement('span');

            button.type = 'button';
            button.className = 'asset-card';
            button.dataset.assetId = asset.id;

            thumb.className = 'asset-card__thumb';
            image.src = asset.path;
            image.alt = asset.label;
            label.className = 'asset-card__label';
            label.textContent = asset.label;

            thumb.appendChild(image);
            button.appendChild(thumb);
            button.appendChild(label);
            assetGalleryEl.appendChild(button);
        }
    }

    function syncAssetGalleryState() {
        const buttons = assetGalleryEl.querySelectorAll('.asset-card');
        let index;

        for (index = 0; index < buttons.length; index += 1) {
            buttons[index].classList.toggle(
                'is-selected',
                buttons[index].dataset.assetId === state.selectedBuiltInAssetId
            );
        }
    }

    function selectBuiltInAsset(assetId) {
        let index;
        let asset = null;

        for (index = 0; index < builtInAssets.length; index += 1) {
            if (builtInAssets[index].id === assetId) {
                asset = builtInAssets[index];
                break;
            }
        }

        if (!asset) {
            return;
        }

        if (state.objectUrl) {
            URL.revokeObjectURL(state.objectUrl);
            state.objectUrl = null;
        }

        assetInputEl.value = '';
        state.selectedBuiltInAssetId = asset.id;
        state.assetUrl = asset.path;
        state.assetConfigPath = './' + asset.path;
        syncAssetGalleryState();
        applyTutorialConfig();
    }

    function formatPoint(point) {
        if (!point) {
            return '-';
        }

        if (point.space === 'world') {
            return '(' + point.x.toFixed(2) + ', ' + point.y.toFixed(2) + ', ' + point.z.toFixed(2) + ')';
        }

        return '(' + point.x.toFixed(2) + ', ' + point.y.toFixed(2) + ')';
    }

    function buildConfigSnippet(config) {
        const from = config.from;
        const to = config.to;

        return [
            'const tutorial = new HandTutorial({',
            '  container: renderer.domElement.parentElement,',
            '  renderer: renderer,',
            '  camera: camera,',
            "  assetUrl: '" + config.assetConfigPath + "',",
            "  gesture: '" + config.gesture + "',",
            '  duration: ' + config.duration.toFixed(2) + ',',
            '  loopDelay: ' + config.loopDelay.toFixed(2) + ',',
            '  size: ' + Math.round(config.size) + ',',
            '  rotation: ' + config.rotation.toFixed(0) + ',',
            '  followDirection: ' + String(config.followDirection) + ',',
            '  flipX: ' + String(config.flipX) + ',',
            '  showTrail: ' + String(config.showTrail) + ',',
            '  anchor: { x: ' + config.anchor.x.toFixed(2) + ', y: ' + config.anchor.y.toFixed(2) + ' },',
            '  from: { space: \'' + from.space + '\', x: ' + from.x.toFixed(2) + ', y: ' + from.y.toFixed(2) + (from.space === 'world' ? ', z: ' + from.z.toFixed(2) : '') + ' },',
            '  to: { space: \'' + to.space + '\', x: ' + to.x.toFixed(2) + ', y: ' + to.y.toFixed(2) + (to.space === 'world' ? ', z: ' + to.z.toFixed(2) : '') + ' }',
            '});',
            'tutorial.play();'
        ].join('\n');
    }

    function setPickerMode(mode) {
        state.picker = mode;
        pickStartEl.classList.toggle('is-active', mode === 'start');
        pickEndEl.classList.toggle('is-active', mode === 'end');
    }

    function syncUiState() {
        const isTap = gestureEl.value === 'tap';
        durationValueEl.textContent = parseFloat(durationEl.value).toFixed(2) + 's';
        loopDelayValueEl.textContent = parseFloat(loopDelayEl.value).toFixed(2) + 's';
        sizeValueEl.textContent = Math.round(parseFloat(sizeEl.value)) + 'px';
        rotationValueEl.textContent = parseFloat(rotationEl.value).toFixed(0) + 'deg';
        anchorXValueEl.textContent = parseFloat(anchorXEl.value).toFixed(2);
        anchorYValueEl.textContent = parseFloat(anchorYEl.value).toFixed(2);
        pickEndEl.disabled = isTap;
        showTrailEl.disabled = isTap;
        followDirectionEl.disabled = isTap;

        if (isTap) {
            showTrailEl.checked = false;
            followDirectionEl.checked = false;
        }
    }

    function getCurrentConfig() {
        const gesture = gestureEl.value;
        const from = clonePoint(state.from);
        const to = gesture === 'tap' ? clonePoint(state.from) : clonePoint(state.to);

        return {
            container: sceneRoot,
            renderer: demoScene.renderer,
            camera: demoScene.camera,
            assetUrl: state.assetUrl,
            assetConfigPath: state.assetConfigPath,
            gesture: gesture,
            from: from,
            to: to,
            duration: parseFloat(durationEl.value),
            loopDelay: parseFloat(loopDelayEl.value),
            size: parseFloat(sizeEl.value),
            rotation: parseFloat(rotationEl.value),
            anchor: {
                x: parseFloat(anchorXEl.value),
                y: parseFloat(anchorYEl.value)
            },
            showTrail: showTrailEl.checked,
            followDirection: followDirectionEl.checked,
            flipX: flipXEl.checked
        };
    }

    function applyTutorialConfig() {
        syncUiState();

        const config = getCurrentConfig();
        tutorial.setConfig(config);
        tutorial.play();

        demoScene.setMarkers(config.from, config.to, spaceEl.value);
        startReadoutEl.textContent = formatPoint(config.from);
        endReadoutEl.textContent = formatPoint(config.to);
        previewEl.textContent = buildConfigSnippet(config);
        syncAssetGalleryState();
    }

    function resetPoints() {
        const defaults = demoScene.getDefaultPoints(spaceEl.value);
        state.from = defaults.from;
        state.to = defaults.to;
        applyTutorialConfig();
    }

    function animate(now) {
        requestAnimationFrame(animate);
        demoScene.update(now);
        tutorial.update(now);
    }

    sceneRoot.addEventListener('pointerdown', function (event) {
        if (!state.picker) {
            return;
        }

        const point = demoScene.pickPoint(event, spaceEl.value);

        if (!point) {
            return;
        }

        if (state.picker === 'start') {
            state.from = point;
        } else if (state.picker === 'end') {
            state.to = point;
        }

        setPickerMode(null);
        applyTutorialConfig();
    });

    gestureEl.addEventListener('change', applyTutorialConfig);
    durationEl.addEventListener('input', applyTutorialConfig);
    loopDelayEl.addEventListener('input', applyTutorialConfig);
    sizeEl.addEventListener('input', applyTutorialConfig);
    rotationEl.addEventListener('input', applyTutorialConfig);
    anchorXEl.addEventListener('input', applyTutorialConfig);
    anchorYEl.addEventListener('input', applyTutorialConfig);
    showTrailEl.addEventListener('change', applyTutorialConfig);
    followDirectionEl.addEventListener('change', applyTutorialConfig);
    flipXEl.addEventListener('change', applyTutorialConfig);

    spaceEl.addEventListener('change', function () {
        resetPoints();
    });

    pickStartEl.addEventListener('click', function () {
        setPickerMode(state.picker === 'start' ? null : 'start');
    });

    pickEndEl.addEventListener('click', function () {
        if (gestureEl.value === 'tap') {
            return;
        }

        setPickerMode(state.picker === 'end' ? null : 'end');
    });

    resetPointsEl.addEventListener('click', function () {
        setPickerMode(null);
        resetPoints();
    });

    assetInputEl.addEventListener('change', function (event) {
        const file = event.target.files && event.target.files[0];

        if (state.objectUrl) {
            URL.revokeObjectURL(state.objectUrl);
            state.objectUrl = null;
        }

        if (!file) {
            state.assetUrl = defaultAsset.path;
            state.assetConfigPath = './' + defaultAsset.path;
            state.selectedBuiltInAssetId = defaultAsset.id;
            applyTutorialConfig();
            return;
        }

        state.objectUrl = URL.createObjectURL(file);
        state.selectedBuiltInAssetId = null;
        state.assetUrl = state.objectUrl;
        state.assetConfigPath = './assets/' + file.name;
        applyTutorialConfig();
    });

    assetGalleryEl.addEventListener('click', function (event) {
        const button = event.target.closest('.asset-card');

        if (!button) {
            return;
        }

        selectBuiltInAsset(button.dataset.assetId);
    });

    copyConfigEl.addEventListener('click', function () {
        const text = previewEl.textContent;

        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }

        navigator.clipboard.writeText(text).then(function () {
            copyConfigEl.textContent = 'Copied';
            window.setTimeout(function () {
                copyConfigEl.textContent = 'Copy config';
            }, 1100);
        });
    });

    window.addEventListener('beforeunload', function () {
        if (state.objectUrl) {
            URL.revokeObjectURL(state.objectUrl);
        }
    });

    renderAssetGallery();
    applyTutorialConfig();
    animate(performance.now());
})();
