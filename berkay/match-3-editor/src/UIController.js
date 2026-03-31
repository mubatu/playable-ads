export class UIController {
    constructor(assetManager, levelManager, interactor, sceneManager) {
        this.assetManager = assetManager;
        this.levelManager = levelManager;
        this.interactor = interactor;
        this.sceneManager = sceneManager;

        this.bindUI();
    }

    bindUI() {
        // Resize Grid
        document.getElementById("btn-resize").addEventListener("click", () => {
            const w = parseInt(document.getElementById("grid-width").value);
            const h = parseInt(document.getElementById("grid-height").value);
            if (w > 0 && h > 0) this.sceneManager.resizeGrid(w, h);
        });

        // Connect Folder
        document.getElementById("btn-project").addEventListener("click", async () => {
            await this.assetManager.connectFolder();
            document.getElementById("folder-status").innerText = "✅ Connected: " + this.assetManager.projectRoot.name;
            this.renderAssets();
        });

        // Add Photo Trigger
        document.getElementById("btn-add-photo").addEventListener("click", () => {
            document.getElementById("file-input").click();
        });

        // File Upload Logic
        document.getElementById("file-input").addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file || !this.assetManager.projectRoot) return alert("Connect project folder first!");

            // 1. Save to disk
            const dir = await this.assetManager.projectRoot.getDirectoryHandle("photos", { create: true });
            const fileHandle = await dir.getFileHandle(file.name, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(file);
            await writable.close();

            // 2. Add to internal memory
            const url = URL.createObjectURL(file);
            this.assetManager.assets.push({ url, name: file.name });
            this.renderAssets();
        });

        // Tools
        document.getElementById("btn-random").addEventListener("click", () => this.randomLevel());
        document.getElementById("btn-clear").addEventListener("click", () => this.levelManager.clear());

        // SAVE BUTTON (The Fixed Version)
        document.getElementById("btn-save").addEventListener("click", async () => {
            await this.saveLevel();
        });
    }

    renderAssets() {
        const container = document.getElementById("asset-list");
        container.innerHTML = "";

        this.assetManager.assets.forEach(asset => {
            const img = document.createElement("img");
            img.src = asset.url;
            img.className = "asset-thumb";
            img.onclick = () => {
                document.querySelectorAll(".asset-thumb").forEach(el => el.style.borderColor = "transparent");
                img.style.borderColor = "#2196F3";
                this.interactor.currentTexture = asset;
            };
            container.appendChild(img);
        });
    }

    randomLevel() {
        const assets = this.assetManager.assets;
        if (!assets.length) return alert("Load photos first!");
        this.levelManager.clear();
        for (let x = 0; x < this.sceneManager.gridWidth; x++) {
            for (let y = 0; y < this.sceneManager.gridHeight; y++) {
                const rand = assets[Math.floor(Math.random() * assets.length)];
                this.levelManager.add(x, y, rand);
            }
        }
    }

    async saveLevel() {
        // 1. Collect Data from the LevelManager Map
        const items = [];
        this.levelManager.grid.forEach((value, key) => {
            const [x, y] = key.split(",").map(Number);
            items.push({
                x: x,
                y: y,
                type: `photos/${value.texture.name}` // Matches your old version's format
            });
        });

        if (items.length === 0) return alert("Level is empty!");

        const levelData = {
            width: this.sceneManager.gridWidth,
            height: this.sceneManager.gridHeight,
            items: items
        };

        const jsonString = JSON.stringify(levelData, null, 2);

        // 2. Use File System API if connected
        if (this.assetManager.projectRoot) {
            try {
                // Check for write permission (Browser security requirement)
                const status = await this.assetManager.projectRoot.requestPermission({ mode: 'readwrite' });
                if (status !== 'granted') return alert("Permission denied to write to folder.");

                const dir = await this.assetManager.projectRoot.getDirectoryHandle("levels", { create: true });
                const fileHandle = await dir.getFileHandle("level.json", { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(jsonString);
                await writable.close();
                alert("Saved to /levels/level.json! ✅");
            } catch (err) {
                console.error("Save failed:", err);
                this.fallbackDownload(jsonString);
            }
        } else {
            this.fallbackDownload(jsonString);
        }
    }

    fallbackDownload(content) {
        const blob = new Blob([content], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "level.json";
        a.click();
        URL.revokeObjectURL(url);
    }
}