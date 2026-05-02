# Clash Royale - Game Design Document (GDD)

## 1. Game Overview

**Title:** Clash Royale (Recreated)
**Genre:** Real-time strategy (RTS), Tower Defense, PvP Arena
**Platform:** Web (Three.js), Mobile

**Core Loop:**

* Player deploys units using elixir
* Units auto-navigate and attack
* Destroy enemy towers
* Win by destroying more towers or enemy King Tower

---

## 2. Core Gameplay Mechanics

### 2.1 Arena Layout

The battlefield is a **rectangular arena divided into two halves**:

* Bottom side → Player
* Top side → Opponent

#### Dimensions (Normalized for Three.js)

* Width: `10 units`
* Height: `20 units`

#### Key Sections:

| Section     | Y Range | Description               |
| ----------- | ------- | ------------------------- |
| Player Side | 0 → 9   | Player deployment zone    |
| River       | 9 → 11  | Impassable except bridges |
| Enemy Side  | 11 → 20 | Enemy deployment zone     |

#### Bridges:

* Left bridge at X ≈ 3
* Right bridge at X ≈ 7
* Width: ~1.5 units

---

### 2.2 Towers

Each side has 3 towers:

#### King Tower

* Position:

    * Player: `(5, 1)`
    * Enemy: `(5, 19)`
* High HP
* Activates only when attacked or Princess Tower destroyed

#### Princess Towers (2)

* Player:

    * Left: `(2, 3)`
    * Right: `(8, 3)`
* Enemy:

    * Left: `(2, 17)`
    * Right: `(8, 17)`

#### Tower Behavior

* Auto-target nearest enemy within range
* Attack interval: ~1 sec
* Projectile-based attacks

---

### 2.3 Units (Cards)

Each card spawns a unit.

#### Unit Properties:

```json
{
  "health": number,
  "damage": number,
  "attackSpeed": number,
  "range": number,
  "movementSpeed": number,
  "targetType": "ground | air | both",
  "collisionRadius": number
}
```

#### Behavior:

* Move toward nearest valid target
* If no units → target towers
* Use simple pathfinding:

    * Straight line
    * Must cross river via bridges

---

### 2.4 Elixir System

* Max: 10
* Regen: 1 elixir / second
* Double elixir in last 60 seconds

---

### 2.5 Match Flow

1. Match starts (3 minutes)
2. Players deploy units using cards
3. Units fight automatically
4. Towers destroyed → score increases
5. End conditions:

    * Most towers destroyed
    * King Tower destroyed → instant win

---

## 3. Three.js Scene Definition

### 3.1 Scene Structure

```js
scene
 ├── arenaGroup
 ├── unitsGroup
 ├── projectilesGroup
 ├── uiOverlay (HTML/CSS)
```

---

### 3.2 Camera Setup

```js
camera.position.set(5, 15, 20);
camera.lookAt(5, 10, 0);
```

* Perspective camera
* Slight top-down angle (~45°)

---

### 3.3 Lighting

```js
AmbientLight (soft global light)
DirectionalLight (sun-like)
```

---

### 3.4 Arena Geometry

#### Ground

```js
PlaneGeometry(10, 20)
```

* Material: green (grass)

#### River

```js
PlaneGeometry(10, 2)
position.y = 10
color: blue
```

#### Bridges

```js
BoxGeometry(1.5, 0.2, 1)
positions:
  (3, 10)
  (7, 10)
```

---

### 3.5 Towers (Meshes)

Each tower:

```js
Group
 ├── base (CylinderGeometry)
 ├── top (ConeGeometry)
```

#### Example:

```js
tower.position.set(x, y, 0)
```

---

### 3.6 Units

Each unit is:

```js
Mesh (Box or Capsule)
```

#### Movement:

```js
unit.position.lerp(targetPosition, speed * delta)
```

#### Pathfinding:

* Move straight
* If near river:

    * Snap path to nearest bridge

---

### 3.7 Projectiles

```js
SphereGeometry(0.1)
```

* Move from source → target
* On hit:

    * Reduce HP
    * Destroy projectile

---

## 4. Game Systems

### 4.1 Targeting System

Priority:

1. Closest enemy in range
2. If none → nearest tower

---

### 4.2 Collision System

* Circle-based collision:

```js
distance < (r1 + r2)
```

---

### 4.3 Health System

```js
if (health <= 0) {
  destroy(object)
}
```

---

### 4.4 AI Behavior

Enemy:

* Random or scripted card placement
* Mirror player timing for simplicity

---

## 5. UI System

### 5.1 Card Bar

* 4 visible cards
* Click to select
* Click arena to deploy

### 5.2 Elixir Bar

* Horizontal progress bar
* Updates every frame

### 5.3 Timer

* Countdown from 180 seconds

---

## 6. Controls

| Action      | Input       |
| ----------- | ----------- |
| Select Card | Click       |
| Deploy Unit | Click arena |
| Camera      | Static      |

---

## 7. Game Loop

```js
function gameLoop(delta) {
  updateElixir(delta)
  updateUnits(delta)
  updateProjectiles(delta)
  updateCollisions()
  updateTowers(delta)
  render()
}
```

---

## 8. Win Conditions

* Destroy enemy King Tower → instant win
* Timer ends → most towers wins

---

## 9. Visual Style

* Cartoonish
* Bright colors
* Simple geometry:

    * Boxes (units)
    * Cylinders (towers)
    * Planes (arena)

---

## 10. Minimal Data Example

```json
{
  "cards": [
    {
      "name": "Knight",
      "cost": 3,
      "health": 100,
      "damage": 10
    }
  ]
}
```

---

## 11. Implementation Notes (Important for AI)

* Use **world coordinates (X, Y)** as 2D plane
* Z axis only for height (visual depth)
* All gameplay logic runs in **2D space**
* Rendering is **3D representation of 2D logic**
* Keep physics simple (no rigid bodies needed)

---

## 12. Summary

To recreate:

1. Build arena plane (10x20)
2. Add river + bridges
3. Place 6 towers at fixed coordinates
4. Implement unit spawning + movement
5. Add targeting + attack system
6. Implement elixir + UI
7. Run real-time loop

---
