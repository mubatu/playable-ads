# Game Design Document: Royale Clone (3D Web Implementation)

## 1. Game Overview
*Royale Clone* is a real-time, multiplayer strategy game where players collect and upgrade cards, then deploy them in a battle arena to destroy the opponent's towers while defending their own. The game is designed for a Three.js-based 3D environment with an isometric perspective.

## 2. Core Game Mechanics

### 2.1. The Elixir System
- **Resource:** Elixir is the primary resource used to play cards.
- **Generation:** Elixir generates automatically over time (e.g., 1 unit every 2.8 seconds).
- **Capacity:** Players have a maximum capacity of 10 Elixir.
- **Double Elixir:** During the final 60 seconds of a match, generation speed doubles.

### 2.2. Card and Deck System
- **Deck:** A player brings 8 unique cards into battle.
- **Cycle:** When a card is played, it moves to the back of the queue. Only 4 cards are available in the hand at any time.
- **Types:**
    - **Troops:** Moveable units with HP and Damage (e.g., Knight, Archers).
    - **Buildings:** Stationary units with a lifespan (e.g., Cannon, Tesla).
    - **Spells:** Immediate effect on a targeted area (e.g., Fireball, Arrows).

### 2.3. Combat Logic
- **Targeting:** Units have a preferred target (Ground, Air, or Buildings).
- **Aggro Range:** Units detect enemies within a specific radius and pathfind toward them.
- **Win Condition:** Destroying the opponent’s "King Tower" results in an immediate win (3 crowns). Otherwise, the player with the most towers destroyed at the end of the timer wins.

---

## 3. Scene Composition (Three.js Technical Specification)

To reconstruct this scene in Three.js, use the following spatial and visual parameters.

### 3.1. Coordinate System & Scale
- **Unit Scale:** 1 Three.js unit = 1 Arena Tile.
- **Arena Dimensions:** The playable area is approximately **18 units (X-axis)** by **30 units (Z-axis)**.
- **Orientation:** The ground plane lies on the **XZ plane**. The **Y-axis** represents height/altitude.

### 3.2. Camera Setup
- **Type:** `THREE.OrthographicCamera` or `THREE.PerspectiveCamera` with a very low FOV (20-30°) to minimize distortion.
- **Position:** `[0, 25, 20]` looking at `[0, 0, 0]`.
- **Rotation:** Tilted approximately 60 degrees down on the X-axis to achieve the iconic "2.5D" isometric look.

### 3.3. Environment Elements (The Map)
1.  **The Ground (Mesh):**
    - A flat `PlaneGeometry` with a green `MeshStandardMaterial`.
    - Divided by a central **River** (Z=0).
    - Two **Bridges** crossing the river at `X = -5` and `X = 5`.
2.  **Towers (Object3D):**
    - **King Tower:** Located at `[0, 0, 13]` (Player) and `[0, 0, -13]` (Opponent).
    - **Princess Towers:** Two per side, located at `[+/- 6, 0, 9]` (Player) and `[+/- 6, 0, -9]` (Opponent).
3.  **The Grid:**
    - Implement a logical grid of 1x1 units for card placement validation.
    - Deployment is restricted to the player's half of the arena unless a tower is destroyed.

### 3.4. Lighting & Visual Style
- **AmbientLight:** High intensity (approx. 0.8) for a bright, vibrant feel.
- **DirectionalLight:** Positioned at `[10, 20, 10]` to cast sharp, clean shadows (`castShadow = true`) onto the arena floor.
- **Materials:** Use `MeshStandardMaterial` with `roughness: 0.7` and `metalness: 0.1` to maintain a stylized, non-metallic "cartoon" look.

---

## 4. Entity Behavior Specs for AI Implementation

### 4.1. Unit Movement
- **Translation:** Units update their `position.x` and `position.z` every frame based on a `speed` variable.
- **Rotation:** Units must use `mesh.lookAt(targetPosition)` to face their current waypoint or target.
- **Pathfinding:** Use a simple A* algorithm or waypoint system. Units move toward the nearest bridge, then toward the nearest enemy tower.

### 4.2. Spawning Logic
- **Input:** On click/touch, project a ray (`THREE.Raycaster`) from the camera to the XZ plane to get grid coordinates.
- **Instancing:** Use `GLTFLoader` to instantiate pre-loaded models at the raycast intersection point.
- **Feedback:** Highlight the 1x1 grid cell under the cursor with a ghost-transparent version of the model before placement.

### 4.3. VFX and UI
- **Projectiles:** Spells (like Fireball) should follow a parabolic arc (quadratic bezier curve) from the spawn point to the target `Vector3`.
- **Health Bars:** Use `Sprite` objects with a `CanvasTexture` parented to each unit, positioned at `Y = 2` above the unit mesh to always face the camera.