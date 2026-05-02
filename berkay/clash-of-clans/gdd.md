# Game Design Document (GDD)

## Project: Clash of Clans (Simplified Replica for Web / Three.js)

---

## 1. Overview

**Genre:** Real-time strategy / Base-building
**Platform:** Web (Three.js)
**Perspective:** Isometric / angled top-down
**Core Loop:**

1. Build and upgrade structures
2. Train units
3. Attack other bases
4. Collect resources
5. Repeat

---

## 2. Core Gameplay Systems

### 2.1 Resources

* **Gold**

    * Used for: defensive buildings, walls
* **Elixir**

    * Used for: troops, army buildings
* **Gems**

    * Premium currency (skip timers)

#### Storage Rules

* Each resource has:

    * Storage buildings
    * Max capacity
* Overflow is lost

---

### 2.2 Base Building System

#### Grid System

* The world is a **2D grid projected in 3D**
* Tile size: `1 x 1 units`
* Grid example:

```
[ (0,0), (1,0), (2,0) ]
[ (0,1), (1,1), (2,1) ]
```

#### Placement Rules

* Each building occupies:

    * 1x1 (small)
    * 2x2 (medium)
    * 3x3 (large)
* Cannot overlap
* Must snap to grid

---

### 2.3 Buildings

#### Types

1. **Resource Buildings**

    * Gold Mine
    * Elixir Collector

2. **Storage**

    * Gold Storage
    * Elixir Storage

3. **Defensive**

    * Cannon → single target
    * Archer Tower → ranged

4. **Army**

    * Barracks → trains units

5. **Town Hall**

    * Central building
    * Determines progression

---

### 2.4 Unit System

#### Properties

Each unit has:

```
health
damage
attackRange
attackSpeed
movementSpeed
targetPreference
```

#### Example Unit

* Barbarian:

    * Melee
    * Targets nearest building

---

### 2.5 Combat System

#### Flow

1. Player deploys units
2. Units auto-navigate
3. Units attack nearest valid target
4. Buildings defend automatically

#### Targeting Logic

```
if preferredTarget exists:
    attack closest preferred
else:
    attack nearest building
```

---

### 2.6 Pathfinding

* Use **A*** on grid
* Obstacles:

    * Buildings
    * Walls

Units:

* Recalculate path when blocked
* Can destroy walls

---

### 2.7 Upgrade System

* Each building has:

    * Level
    * Upgrade cost
    * Upgrade time

Example:

```
Cannon Level 1 → Level 2
Cost: 1000 Gold
Time: 60 seconds
```

---

## 3. Scene Design (Three.js Implementation)

### 3.1 Camera Setup

* Type: **Orthographic or Perspective**
* Angle:

  ```
  rotation.x = -45°
  rotation.y = 45°
  ```
* Position:

  ```
  (x: 20, y: 20, z: 20)
  ```

Camera must:

* Always look at center `(0,0,0)`
* Allow:

    * Zoom
    * Pan

---

### 3.2 Ground / Terrain

#### Base Plane

* Geometry:

  ```
  PlaneGeometry(width, height)
  ```
* Rotation:

  ```
  rotateX(-Math.PI / 2)
  ```

#### Material

* Grass texture
* Slight color variation

#### Grid Visualization

* Optional helper:

    * GridHelper OR custom tile lines

---

### 3.3 Grid System Representation

Internally:

```
grid[x][y] = {
  occupied: boolean,
  building: reference | null
}
```

World position mapping:

```
worldX = gridX * tileSize
worldZ = gridY * tileSize
```

---

### 3.4 Buildings (3D Representation)

#### Geometry

* Simple box-based models:

    * Town Hall → large cube
    * Cannon → cylinder + base

#### Placement

```
mesh.position.set(
  gridX * tileSize,
  height / 2,
  gridY * tileSize
)
```

#### Visual States

* Normal
* Selected (highlight)
* Under construction (semi-transparent)

---

### 3.5 Units (Troops)

#### Representation

* Low-poly characters OR capsules
* Animated using:

    * Position interpolation

#### Movement

```
unit.position.lerp(targetPosition, deltaTime * speed)
```

---

### 3.6 Projectiles

* Geometry: small spheres
* Movement:

```
projectile.position += direction * speed
```

* On hit:

    * Destroy projectile
    * Apply damage

---

### 3.7 Lighting

* Ambient Light:

  ```
  intensity ~ 0.6
  ```

* Directional Light:

  ```
  position: (10, 20, 10)
  casts shadow
  ```

---

### 3.8 Shadows

* Enabled for:

    * Buildings
    * Units

```
renderer.shadowMap.enabled = true
```

---

## 4. Input System

### Mouse Controls

* Left Click:

    * Select building
    * Place building

* Drag:

    * Move camera

* Scroll:

    * Zoom

---

## 5. UI Layer

### Elements

* Resource counters (top bar)
* Build menu (bottom)
* Unit deploy buttons

---

## 6. Game Loop (Core Logic)

```
function gameLoop():
    updateUnits()
    updateProjectiles()
    handleCombat()
    renderScene()
```

---

## 7. State Management

### Game States

* Build Mode
* Attack Mode
* Idle

---

## 8. AI Behavior

### Defensive Buildings

```
if enemy in range:
    shoot closest
```

### Units

```
find target
move to target
attack
```

---

## 9. Performance Considerations

* Use instancing for repeated meshes
* Limit active units
* Pool projectiles

---

## 10. MVP Scope

Must include:

* Grid placement
* 2 building types
* 1 unit type
* Basic combat
* Camera movement

---

## 11. Notes for Three.js AI Implementation

To correctly construct the scene:

1. Create:

    * Scene
    * Camera (angled)
    * Renderer

2. Add:

    * Ground plane
    * Grid logic

3. Implement:

    * Object-to-grid mapping
    * Mouse raycasting for placement

4. Maintain:

    * `grid[][]` data structure
    * Entity lists (units, buildings)

5. Use:

    * Raycaster to detect clicked tiles
    * World ↔ grid conversion

---

## 12. Example Coordinate Conversion

```
function gridToWorld(x, y):
    return (x * tileSize, 0, y * tileSize)

function worldToGrid(x, z):
    return (floor(x / tileSize), floor(z / tileSize))
```

---

## 13. Expansion Ideas

* Walls with connectivity logic
* Multiplayer sync
* Animation system
* Particle effects

---

## Final Note

This document is structured so that an AI or developer can:

* Understand game rules
* Build systems independently
* Reconstruct the full scene in Three.js using grid-based placement and object mapping
