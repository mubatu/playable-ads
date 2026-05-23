````markdown
# Hole.io Playable Ad - Game Design Document (GDD)

## 1. Overview

### Game Title
Hole.io Playable Ad

### Genre
Arcade / Casual / Hypercasual

### Platform
- Mobile Web Playable Ad
- Built with Three.js
- Responsive for portrait mobile screens

### Gameplay Summary
The player controls a black hole on the ground using a virtual joystick. The hole moves around a small city environment and consumes objects smaller than its current size. As the hole eats objects, it grows larger, allowing it to consume larger buildings and structures.

The playable ad lasts exactly 30 seconds.

At the end of the timer:
- Gameplay stops
- A result overlay appears
- Two buttons are shown:
  - "Play Again"
  - "Download Now"

Both buttons redirect the user to:
- https://google.com

---

# 2. Core Gameplay Loop

1. Player touches and drags joystick
2. Hole moves on the ground
3. Hole collides with consumable objects
4. If object size <= hole size:
   - Object gets sucked into hole
   - Object disappears
   - Hole grows slightly
5. Larger objects become consumable over time
6. Player continues consuming objects until timer ends
7. End screen appears with CTA buttons

---

# 3. Game Rules

## Consumption Rule
An object can only be consumed if:
- object.width <= hole.diameter

If object is too large:
- collision does nothing
- object remains in world

---

# 4. Play Session Structure

## Total Duration
30 seconds

## Flow
### Phase 1 — Tutorial (0s - 3s)
- Hand tutorial appears
- Demonstrates dragging joystick
- Text appears:
  "Move to eat objects"

### Phase 2 — Gameplay (3s - 30s)
- Free movement
- Player consumes objects
- Hole grows

### Phase 3 — End Screen (30s)
- Gameplay freezes
- Dark transparent overlay appears
- Final score shown
- Buttons appear:
  - Play Again
  - Download Now

Both buttons open:
https://google.com

---

# 5. Player Controller

## Player Entity
The player is a circular black hole rendered on the ground plane.

### Visual Properties
- Pure black center
- Soft edge gradient
- Slight shadow around edges
- Flat on ground surface

### Initial Size
Diameter: 1.5 units

### Growth
Hole diameter increases slightly after each consumed object.

Example:
- Small object:
  +0.05 size
- Medium object:
  +0.1 size
- Large object:
  +0.2 size

Maximum size:
10 units

---

# 6. Movement System

## Input Method
Virtual Joystick

## Joystick Placement
Bottom-left corner of screen.

## Joystick Components

### Base Circle
- Semi-transparent gray
- Fixed position

### Stick Knob
- White inner circle
- Moves within base radius

---

# 7. Joystick Mechanics

## Touch Input
When player touches joystick:
- Capture touch position
- Calculate drag vector

## Movement
Hole movement direction:
normalized joystick vector

Movement speed:
- Constant speed
- Example: 5 units/sec

## Rotation
Hole does NOT rotate.

---

# 8. Tutorial Hand Animation

## Purpose
Teach player to move joystick.

## Tutorial Sequence

### Step 1
Joystick shown idle.

### Step 2
Animated hand icon appears above joystick.

### Step 3
Hand moves diagonally while dragging joystick knob.

### Step 4
Hole moves accordingly.

### Step 5
Tutorial loops for 3 seconds.

### Step 6
Tutorial fades out automatically.

---

# 9. Camera

## Camera Type
Third-person top-down perspective.

## Camera Behavior
- Camera follows hole smoothly
- Slight lag interpolation

## Camera Angle
- Tilted downward around 60 degrees

## Camera Distance
- Dynamic based on hole size
- Larger hole = camera zooms out slightly

---

# 10. Environment

## Map Style
Miniature low-poly city.

## Ground
- Flat square plane
- Bright city colors
- Sidewalk patterns
- Roads

---

# 11. Consumable Objects

## Categories

### Small Props
Consumable immediately:
- Traffic cones
- Benches
- Mailboxes
- Trees
- Street lamps

### Medium Structures
Require medium hole size:
- Cars
- Food stalls
- Small houses
- Trucks

### Large Structures
Require large hole size:
- Office buildings
- Towers
- Apartments

---

# 12. Object Consumption Animation

When object is consumed:

1. Object scales down
2. Object moves downward
3. Object disappears
4. Particle effect appears
5. Hole grows slightly

Animation duration:
0.2 - 0.4 seconds

---

# 13. Physics

## Collision System
Simple distance-based collision detection.

## Rules
If:
distance(player, object) < holeRadius

AND

object.size <= hole.size

Then:
consume object

---

# 14. Scoring System

## Score Gain
Player gains score per consumed object.

Example:
- Small prop: 10
- Medium object: 50
- Large building: 200

## UI
Score displayed at top center.

Format:
SCORE: XXXX

---

# 15. Timer System

## Countdown
Starts at:
30

Displayed at top-right corner.

Format:
00:30

Timer decreases every second.

---

# 16. UI Layout

## Top Center
Score text

## Top Right
Timer text

## Bottom Left
Virtual joystick

## Center
Gameplay area

---

# 17. End Screen

## Trigger
Activated immediately when timer reaches 0.

## Overlay
- Dark semi-transparent fullscreen background

## Elements

### Title
"Time's Up!"

### Final Score
Large text showing total score

### Buttons
1. Play Again
2. Download Now

---

# 18. Button Behavior

## Play Again
- Reloads playable ad scene
- OR restarts gameplay state
- Redirects to:
https://google.com

## Download Now
Redirects to:
https://google.com

---

# 19. Audio

## Background Music
- Light energetic arcade loop

## Sound Effects
### Consume Sound
Soft vacuum pop

### Growth Sound
Low bass expansion sound

### UI Click
Simple tap sound

---

# 20. Visual Effects

## Hole Edge Shader
Subtle animated dark gradient.

## Particle Effects
Small debris particles when objects are consumed.

## Scale Bounce
Hole slightly pulses when growing.

---

# 21. Performance Requirements

## Target FPS
60 FPS on mobile devices.

## Optimization Rules
- Low-poly meshes
- Texture atlases
- Object pooling
- Frustum culling
- Minimal shadows

---

# 22. Three.js Technical Structure

## Suggested Scene Hierarchy

Scene
├── Camera
├── Lights
├── Ground
├── EnvironmentObjects
├── PlayerHole
├── UI
│   ├── Score
│   ├── Timer
│   ├── Joystick
│   └── TutorialHand
└── EndScreen

---

# 23. Game State System

## States

### TutorialState
- Hand animation active
- Movement enabled

### GameplayState
- Full gameplay

### EndState
- Input disabled
- Overlay shown

---

# 24. Win/Lose Condition

There is no losing condition.

Goal:
Consume as many objects as possible before timer ends.

---

# 25. Art Direction

## Style
- Bright
- Clean
- Casual
- Low-poly
- Cartoon-like

## Color Palette
- Vibrant city colors
- Dark black hole
- Bright UI buttons

---

# 26. Responsive Design

Playable ad must:
- Work on portrait mobile screens
- Scale UI automatically
- Maintain joystick placement on all aspect ratios

---

# 27. Object Spawn Layout

Objects should be distributed by size zones.

## Near Spawn
Small objects

## Mid Map
Medium objects

## Far Areas
Large buildings

This creates progression naturally.

---

# 28. Player Progression

## Early Game
Consume tiny props.

## Mid Game
Consume cars and houses.

## Late Game
Consume towers and large buildings.

---

# 29. Suggested Three.js Systems

## Rendering
WebGLRenderer

## Lighting
- HemisphereLight
- DirectionalLight

## Controls
Custom mobile joystick system.

## Animation
requestAnimationFrame loop.

---

# 30. Playable Ad Goals

The playable ad should:
- Be immediately understandable
- Feel satisfying within seconds
- Show growth progression quickly
- Encourage install interaction
- End with strong CTA buttons

---

# 31. Important Gameplay Feel

The game must feel:
- Smooth
- Fast
- Addictive
- Satisfying
- Easy to understand instantly

The hole growth progression should happen rapidly enough that the player reaches large buildings before the 30-second timer ends.

---

# 32. Required Features Checklist

## Mandatory Features
- Virtual joystick
- Moving hole
- Object consumption
- Size-based eating mechanic
- Hole growth
- Score system
- Timer
- Hand tutorial
- End screen
- Play Again button
- Download Now button
- Redirect to google.com
- Three.js compatible structure
- Mobile responsive layout

```
````
