```markdown
# ADDITIONAL IMPLEMENTATION RULES (CRITICAL FIXES)

These rules OVERRIDE previous conflicting instructions and MUST be followed exactly.

---

# A. CAMERA SYSTEM FIXES

## Camera Rotation Restriction

The camera MUST NEVER rotate based on joystick input.

### Forbidden Behaviors
- NO orbit controls
- NO camera yaw rotation
- NO camera pitch rotation during gameplay
- NO camera roll
- NO touch drag camera movement
- NO camera rotation linked to player direction

### Required Camera Behavior
The camera angle must remain FIXED for the entire game session.

The camera ONLY:
- follows player position
- slightly zooms out as hole grows

The camera NEVER rotates.

---

## Fixed Camera Values

### Camera Rotation
Use a permanent fixed rotation.

Example:
- X rotation: -60 degrees
- Y rotation: 0 degrees
- Z rotation: 0 degrees

These values must NEVER change during gameplay.

---

## Camera Follow

Camera movement should ONLY update:
- camera.position.x
- camera.position.z

The camera target should smoothly follow the player.

DO NOT rotate toward movement direction.

---

# B. TRUE 3D ENVIRONMENT REQUIREMENTS

## Important
The game MUST be visually 3D.

The environment MUST NOT look like:
- a flat 2D map
- a top-down sprite game
- a flat mobile board

The player must clearly feel:
- height
- depth
- tower scale
- vertical structures

---

## Building Requirements

### Towers MUST Have Real Height

Buildings must use actual 3D meshes.

Examples:
- BoxGeometry
- Extruded geometry
- Multiple stacked meshes

### Forbidden
- Flat textures pretending to be buildings
- 2D sprites
- billboard towers
- flat rectangles

---

## Building Height Examples

### Small House
Height:
1 - 2 units

### Medium Building
Height:
3 - 5 units

### Tower
Height:
8 - 15 units

Large towers should visibly rise upward from the ground.

---

## Environment Depth

The scene must contain:
- sidewalks with thickness
- curbs
- elevated objects
- shadows
- spacing between buildings

Objects must not appear glued onto a flat texture.

---

# C. GROUND AND BACKGROUND FIXES

## Background Color Restriction

The background MUST NOT be black.

Reason:
The black hole becomes invisible on dark backgrounds.

---

## Required Background Style

Use a bright environment.

Recommended colors:
- light gray streets
- beige sidewalks
- green grass
- blue sky
- bright daytime lighting

---

## Renderer Clear Color

Recommended:
- sky blue
- light cyan
- light pastel tone

Example:
- #87CEEB
- #BFE7FF

The hole must always contrast clearly against the world.

---

## Ground Design

The ground must contain:
- roads
- sidewalks
- grass zones
- intersections
- painted lane markings

Avoid:
- fully dark ground
- fully black surfaces
- empty void background

---

# D. LIGHTING REQUIREMENTS

## Bright Daylight Scene

The game must use strong daylight lighting.

Required lights:
- HemisphereLight
- DirectionalLight

---

## Shadow Usage

Buildings should cast soft shadows.

The hole should remain clearly visible.

Avoid:
- overly dark shadows
- nighttime atmosphere

---

# E. HOLE VISIBILITY FIX

## Hole Outline

The hole should include:
- soft gray outer rim
- subtle edge highlight
- ambient shadow ring

This ensures visibility on all surfaces.

---

## Recommended Hole Visual

Center:
- deep black

Outer edge:
- dark gray gradient

Outer glow:
- very subtle soft shadow

---

# F. JOYSTICK INPUT RULES

## Important Separation

Joystick input controls ONLY:
- player movement

Joystick input MUST NEVER:
- rotate camera
- rotate world
- rotate map
- tilt environment

---

## Touch Input Restriction

Touch dragging outside joystick area must do NOTHING.

Only joystick drag area affects movement.

---

# G. THREE.JS IMPLEMENTATION NOTES

## Forbidden Three.js Systems

DO NOT use:
- OrbitControls
- PointerLockControls
- TrackballControls

Reason:
These rotate the camera.

---

## Recommended Camera Logic

Use:
- fixed PerspectiveCamera
- lerp follow movement

Camera should behave like:
classic mobile hypercasual games.

---

# H. VISUAL TARGET

The final game should visually resemble:
- Hole.io
- Attack Hole
- Crowd City style environments

Meaning:
- colorful
- fully 3D
- miniature city
- bright daylight
- clear depth perception

NOT:
- flat 2D game
- black background prototype
- rotating camera demo

---

# I. FINAL TECHNICAL REQUIREMENTS

## Mandatory
- Fixed-angle camera
- No camera rotation
- Bright environment
- Blue sky background
- Fully 3D buildings
- Visible tower heights
- Clearly visible black hole
- Daylight lighting
- Real depth perception
- No flat 2D appearance

These rules are REQUIRED and override earlier ambiguous instructions.

```
