# Game Core

Use this file before asking questions about gameplay, controls, camera, entities,
systems, pacing, or difficulty. The goal is to define a small playable loop that
can be understood immediately and implemented cleanly in Three.js.

## What Must Be Decided

- Game concept in one sentence.
- Main player action.
- Control method.
- Camera and scene style.
- Core loop.
- Player-controlled entity or cursor.
- Targets, enemies, obstacles, pickups, cards, words, or resources.
- Number of challenge beats before the playable ends.
- Whether obstacles are pre-placed, spawned over time, or generated endlessly.
- Collision shape for each obstacle, enemy, pickup, and player.
- Whether repeated gameplay objects should use `ObjectPool`.
- Feedback for correct and incorrect actions.
- Difficulty curve during the short ad.
- Tutorial or first-action guidance.
- Approximate session length.

## Core Loop Checklist

A playable ad should usually follow this shape:

1. Show a clear situation.
2. Prompt one obvious action.
3. Let the player perform that action.
4. Give immediate visual, UI, sound, or motion feedback.
5. Increase tension or reveal the next target.
6. End with win, lose, timeout, or CTA.

If the game idea has more than one loop, choose the simplest loop that best sells
the concept.

## Question Bank

Ask only the questions that are needed for the current user. Do not ask the full
list at once.

### Concept

- What is the one-sentence game concept?
- Is this based on an existing game, genre, or ad reference?
- What should the player understand within the first 3 seconds?
- What should feel satisfying: destroying, collecting, matching, upgrading,
  dodging, deploying, solving, racing, or something else?

### Player Action

- What is the player's primary action?
- Should the action be tap, drag, swipe, joystick movement, card selection,
  word selection, timed click, or another input?
- Does the player control one object, many units, a board, a cursor, or UI cards?
- Should controls be instant, physics-like, grid-based, or path-based?

### Camera And Scene

- Should the game use an orthographic 2D/2.5D look or a perspective 3D camera?
- Is the scene top-down, side-view, isometric, over-the-shoulder, or front-facing?
- Should the camera stay fixed, follow a player, pan through the level, or zoom
  for the finish?
- Should the ad prioritize portrait layout, landscape layout, or responsive
  behavior for both?

### Entities And Systems

- What are the key entities the player interacts with?
- Are there enemies, obstacles, resources, projectiles, cards, lanes, bridges,
  tiles, letters, or collectibles?
- If there are obstacles, how many should the player face in the playable ad?
- Should obstacles be manually placed for a designed path, spawned at intervals,
  or generated continuously until the ending condition?
- If the user gives a win target such as "pass 10 obstacles", should all 10 be
  generated from the start, spawned over time, or pooled/reused as they scroll?
- Should obstacle spacing, size, speed, or shape change over time?
- What should the collision shape be for each visual hazard: circle, rectangle,
  capsule, triangle, polygon, or a deliberately smaller forgiving hit area?
- What values need to be tracked: score, health, timer, progress, elixir, unit
  count, word progress, combo, or distance?
- Does anything need to spawn, move, collide, merge, attack, pathfind, or pool?
- For repeated obstacles, enemies, projectiles, pickups, collectibles, or other
  temporary meshes, how will object pooling be used?

### Pacing And Difficulty

- How long should one run last?
- Should the run end after a fixed number of obstacles, a score target, a timer,
  or a scripted final moment?
- Should the game become harder over time or stay simple?
- What mistake can the player make?
- Should failure be possible, or should the ad guide the player toward success?
- Does the player need a tutorial hand, intro overlay, countdown, or first move
  hint?

## Required Clarifications Before Coding

Do not implement gameplay until these are answered or explicitly defaulted with
reasons in a decision report:

- start trigger,
- primary input,
- player movement behavior,
- challenge object count or spawning rule,
- exact relationship between the win target and the number of passable obstacles,
- session length or progress target,
- failure collision behavior,
- collision shape and forgiveness for the player and each obstacle type,
- object pooling decision for repeated gameplay objects,
- success condition handoff to the win/lose spec.

## Collision Rules

Visual shape and collision shape must match closely enough that the player never
feels hit by empty space.

- Do not use full rectangular bounding boxes for triangular, diamond, circular,
  or irregular hazards unless the visible art is also rectangular.
- Do not implement triangle/spike or diamond collisions with rectangle/AABB
  helpers such as `circleRectOverlap`, `hitTestRect`, `Box2`, `Box3`, bounding
  boxes, or pipe-style top/bottom rectangles. These still behave like square
  colliders even if the mesh looks triangular.
- For triangle/spike hazards, use triangle-aware collision, polygon collision, or
  smaller conservative colliders that sit inside the visible spike.
- For circles, use circle collision.
- For diamonds or rotated shapes, use polygon collision or multiple smaller
  colliders that approximate the visible solid area.
- Prefer forgiving hit areas in playable ads. It is better for the collider to be
  slightly smaller than the visible hazard than larger.
- When using Three.js meshes, do not assume the mesh geometry's bounding box is a
  fair gameplay collider. Define 2D gameplay colliders explicitly in the same
  coordinate space as the player.
- For polygon hazards, store collider vertices in gameplay/world coordinates and
  test the player circle against the polygon edges/interior. AABB prechecks are
  allowed only as a broad-phase optimization; they must not be the final hit
  result for non-rectangular hazards.
- During implementation review, search the gameplay code for rectangle collision
  helper names and confirm none are used as the final collider for triangular,
  diamond, circular, or irregular hazards.
- Record the chosen collider type and forgiveness reason in the decision report.

## Object Pool Rules

Repeated gameplay objects should use the reusable `ObjectPool` module instead of
being created and destroyed continuously.

- Use `ObjectPool` for repeated obstacles, enemies, projectiles, pickups,
  collectibles, floating text, or other temporary meshes.
- For runner-style obstacle games, obstacle sets should come from a pool. When an
  obstacle leaves the screen, release it back to the pool and reset it for reuse.
- Avoid allocating new geometries/materials in the main game loop.
- Create shared geometries/materials when possible, and reset position, visible
  state, gameplay data, and collider data when reusing pooled objects.
- If pooling is intentionally skipped because the object count is tiny and static,
  record that reason in the decision report.

## Obstacle Count Rules

The number of visible shapes in a reference sketch is not automatically the
number of obstacles in the playable. A sketch may define obstacle style or layout
patterns while the user separately defines the win target.

- If the user says the player wins after passing `N` obstacles, the game must
  allow the player to pass `N` obstacle sets before the win screen.
- Do not reduce a user-provided target such as 10 obstacles to 3 because the
  reference image contains 3 example beats.
- If only 3 obstacle styles are drawn, reuse those styles through spawning or
  pooling until the target count is reached.
- Record whether the game uses authored obstacles, procedural spawning, or pooled
  repeated obstacle styles.

## Sensible Defaults

Use these defaults when the user does not care and the choice is low-risk:

- Session length: 15-30 seconds.
- Obstacle/challenge count: 6-8 beats for a short skill ad, unless the user asks
  for a one-shot demo or an endless runner.
- Obstacle spawning: timed spawning for runner-style games; hand-placed obstacles
  only when the user provides a specific layout reference.
- Object pooling: use `ObjectPool` for repeated runtime objects such as runner
  obstacles, enemies, projectiles, pickups, and collectibles.
- Camera: orthographic 2.5D for simple touch-first playables.
- First interaction: visible tutorial hand or intro overlay.
- Controls: tap or drag for broad mobile accessibility.
- Collision forgiveness: player and hazards use colliders about 10-20% smaller
  than the visible art for skill-based mobile playables.
- Feedback: scale pop, particles, progress bar, sound cue, and short text.
- Difficulty: one easy first success, then one small escalation.

Defaults must be written with reasons. Example: `Obstacle count: 6, chosen
because the user did not specify length and this gives enough repeated practice
for a short playable ad.`

## Decision Fields

When decisions are made, append a short report below this section using only the
fields that matter:

```md
## Decision Report - YYYY-MM-DD

- Concept:
- Core loop:
- First player action:
- Control method:
- Camera/scene style:
- Player entity:
- Targets/obstacles:
- Challenge count/spawn rule:
- Collision model:
- Object pooling:
- Resources/progress values:
- Feedback:
- Tutorial guidance:
- Session length:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```

## Decision Report - 2026-05-09

- Source: user interview
- Concept: Flappy Bird–style side scroller; bird on the left; jagged triangular / diamond gap obstacles (per user sketch—not rectangular pipes).
- Core loop: Show scene + hand hint → first tap starts run and is also flap → player clears scrolling gaps; count passes toward win; one hit ends run.
- First player action: Tap / click to start (same input as flap).
- Control method: Discrete flap impulse on each tap (classic Flappy-style).
- Camera/scene style: Side-view 2D/2.5D, orthographic-friendly framing; **portrait** (see theme report).
- Player entity: Simple bird (circle head, body, wing)—visual can follow sketch minimalism.
- Targets/obstacles: Scrolling gap sets; variety includes top/bottom spikes and a middle floating diamond gap (from reference); **10** distinct gap passes required for win.
- Challenge count/spawn rule: **Win after passing 10 obstacles** (10 gap passes). Obstacles spawn/scroll continuously until win or lose (not a single fixed on-screen set only).
- Collision model: Lose on contact with **obstacles, floor, and ceiling**. Colliders must match **visible** triangular/diamond shapes—no full AABB/rectangle hitbox as the sole test for non-rectangular hazards; slightly forgiving (smaller than art) per README.
- Object pooling: **Use `ObjectPool`** for repeated scrolling obstacle pieces/gap sets—required for this ad unless a later report documents an exception.
- Feedback: Immediate death stop on lose; brief success feedback on win; UI overlays per win/lose doc.
- Tutorial guidance: **Hand** points at screen until first tap; first tap starts gameplay and removes tutorial.
- Session length: Short playable; ends at 10 clears or first collision.
- Defaults chosen by AI and reasons:
  - **Scroll direction / motion:** Obstacles move toward the bird (classic Flappy readability) unless implementation file already fixes the opposite—either is acceptable if feel matches sketch; default toward bird.
  - **Difficulty curve:** Mild constant scroll speed for ad length (no aggressive ramp) unless playtest feels too easy—record if changed during implementation.
- Unresolved or deferred:
  - User reference PNG was not found under the game folder at decision time; re-save sketch to `src/assets/` if a local file is required for traceability.
