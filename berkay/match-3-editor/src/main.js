import { SceneManager } from "./SceneManager.js";
import { AssetManager } from "./AssetManager.js";
import { LevelManager } from "./LevelManager.js";
import { GridInteractor } from "./GridInteractor.js";
import { UIController } from "./UIController.js";

const GRID_WIDTH = 10;
const GRID_HEIGHT = 6;

const sceneManager = new SceneManager(GRID_WIDTH, GRID_HEIGHT);
const assetManager = new AssetManager();
const levelManager = new LevelManager(sceneManager.scene, assetManager);
const interactor = new GridInteractor(sceneManager, levelManager);

// Pass all dependencies, including sceneManager for resizing
const ui = new UIController(assetManager, levelManager, interactor, sceneManager);

// Keyboard shortcuts
window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") levelManager.undo();
    if (e.ctrlKey && e.key === "y") levelManager.redo();
});

// One single render loop!
function animate() {
    requestAnimationFrame(animate);
    sceneManager.render();
}

animate();Z