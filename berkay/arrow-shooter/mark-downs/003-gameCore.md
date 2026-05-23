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

## Decision Report - 2026-05-17

- Source: GDD.md and user interview.
- GDD specifies: Arrow-Shooter is a portrait mobile casual puzzle at 1080x1920 where players tap arrows on an 8x8 configurable grid, send movable arrows to a conveyor, and color-matched top shooters reduce arrow length until arrows disappear for points.
- User explicitly requested: use the GDD's 8x8 board and clear the board to win.
- Concept: Tap valid colored arrows out of an 8x8 board so matching shooters can destroy them before the conveyor jams.
- Core loop: evaluate the blocked board, tap an arrow with a valid exit path, move it to the conveyor, let same-color shooters hit it, score when it disappears, and repeat until the board is cleared or the conveyor jams.
- First player action: tap a highlighted valid arrow.
- Control method: single-tap selection, chosen from the GDD's touch action and mobile playable needs.
- Camera/scene style: fixed portrait orthographic 2.5D board view.
- Player entity: the player controls board arrow selection rather than a character.
- Targets/obstacles: colored arrow paths on the grid, top shooter slots, shooter bullet counts, and a conveyor that can hold up to 5 moving arrows.
- Challenge count/spawn rule: authored 8x8 puzzle state; clear every board arrow for completion. Shooter replacements come from a queue when a shooter's bullets are spent.
- Collision model: grid occupancy/path blocking for arrow exit checks; tap hit areas can be slightly larger than visible arrows for mobile forgiveness.
- Object pooling: use pooling for repeated temporary bullets, hit particles, and score/feedback effects; static board arrows do not need pooling because they are authored puzzle pieces with stable lifetime.
- Resources/progress values: score, cleared arrow count, remaining board arrows, conveyor occupancy, shooter bullets, and shooter queue.
- Feedback: tactile scale pop on tap, invalid tap shake, shooter hit flashes, arrow shrink/destruction particles, score text, and clear win/jam lose feedback.
- Tutorial guidance: first valid arrow receives hand/tap guidance and visual highlight, then tutorial is dismissed on first interaction.
- Session length: target roughly 20-30 seconds, chosen because a full 8x8 playable puzzle needs more room than a one-shot demo but should remain ad-sized.
- Reusable module notes: use the existing scene setup and UI patterns for portrait rendering/HUD; use the shared hand tutorial pattern from Block Blast with a local hand asset; use object pooling for repeated bullets and particles.
- Defaults chosen by AI and reasons: fixed orthographic 2.5D camera because it keeps the grid readable on mobile; forgiving tap areas because accurate finger selection matters more than strict geometry; 20-30 second target because the user selected a full 8x8 clear-all goal.
- Unresolved or deferred: exact authored starting board, arrow colors/lengths, shooter queue order, and bullet counts can be tuned during implementation as long as the board is solvable and demonstrates the GDD loop.

## Decision Report - 2026-05-17 Correction

- Source: user correction after first implementation pass.
- User explicitly requested: arrows do not park on the conveyor; they move continuously around the grid and are shot only when passing in front of shooters. Arrows are not one unit long; each arrow can be 3, 4, or n connected units long.
- Core loop correction: released arrows enter a moving conveyor loop around the grid instead of occupying fixed conveyor slots.
- Arrow length correction: board arrows are multi-cell connected pieces, and their conveyor health/visible length is based on their unit count.
- Shooter interaction correction: shooters only target matching-color arrows while those arrows are in the top shooter zone on the moving conveyor.
- Challenge correction: conveyor capacity still counts arrows currently on the moving belt, but arrows keep circulating until destroyed or the jam fail state triggers.
- Defaults chosen by AI and reasons: use authored multi-cell arrow shapes of length 2-4 for the short playable because it demonstrates variable-length arrows without making the first ad puzzle too dense.

## Decision Report - 2026-05-17 Visual/Motion Correction

- Source: user correction after reviewing the conveyor/arrow readability pass.
- User explicitly requested: remove the overlapping instruction text, make arrow units more rectangular, connect units with narrower grey squares, bend arrows at those connector joints on conveyor corners, allow board arrows to be tapped even if a conveyor arrow is moving in front of the exit, show shooter bullet counts, and animate a queued shooter into place instead of instantly replacing a spent shooter.
- Arrow visual correction: board arrows now use elongated colored unit bodies with grey connector pieces so direction and multi-unit length read more clearly.
- Conveyor motion correction: conveyor arrows sample each visible unit and connector independently along the loop path, so the chain bends around corners rather than rotating as one rigid piece.
- Tap/path correction: board exit checks consider only arrows still occupying the grid; arrows already moving on the conveyor do not block a board arrow's touch/exit eligibility.
- Shooter correction: each shooter displays a numeric remaining bullet badge, and spent shooters animate out before the next queued shooter moves into the slot.
- Defaults chosen by AI and reasons: use simple geometry/text sprites for the bullet count and shooter replacement animation because no final art assets were provided and the ad needs the mechanic to read immediately.

## Decision Report - 2026-05-17 Shooter Targeting Correction

- Source: user correction after observing a 3-unit arrow survive a 5-bullet shooter pass.
- Issue found: shooter targeting checked only the arrow lead point and fired on a cooldown, so trailing units could pass the shooter without being treated as separate shootable targets.
- User explicitly requested: the shooter should shoot every arrow unit it can.
- Shooter targeting correction: every visible unit of a matching conveyor arrow is now considered shootable while that unit is inside the shooter zone.
- Bullet accounting correction: hits are reserved when bullets are fired, not only after impact, so a 5-bullet shooter can commit multiple shots to a multi-unit arrow during the same pass without over-targeting units already scheduled to be hit.
- Defaults chosen by AI and reasons: use a short per-shooter fire interval so the mechanic reads as rapid shooting while preserving visible bullet travel.

## Decision Report - 2026-05-17 Layout/Aim Correction

- Source: user correction after reviewing shooter/conveyor overlap and early shooting.
- User explicitly requested: move the grid downward, make it smaller, prevent shooter/conveyor overlap, show bullets sent by shooters, and only shoot a unit when it is exactly in front of the shooter.
- Layout correction: board cell size was reduced and the board was moved downward so the conveyor and shooter row have clearer separation.
- Projectile correction: shooter projectiles were enlarged so fired bullets are visible during travel, not only represented by the remaining bullet count.
- Aim correction: shooter targeting now uses a narrow aim line around the top conveyor path and a tight X threshold under the shooter, replacing the earlier broad pre-pass zone.
- Defaults chosen by AI and reasons: keep a small tolerance around the aim line rather than requiring mathematically exact equality, because frame timing and continuous movement need a tiny window to avoid missed shots.

## Decision Report - 2026-05-17 Sequential Unit Hit Correction

- Source: user correction after observing one bullet appear to destroy all 3 arrow units.
- Issue found: the shooter could reserve multiple hits before the first projectile landed, so several unit removals happened as one rapid burst.
- User explicitly requested: first shoot the arrow head, reduce length by one, then shoot the next unit, reduce length by one, and continue unit by unit.
- Shooter targeting correction: each arrow exposes only its current surviving head unit as a valid target.
- Hit sequencing correction: an arrow with an in-flight bullet cannot receive another reserved hit until that bullet lands and removes exactly one unit.
- Length correction: consumed head units are hidden from the front of the arrow chain, leaving the next physical unit to become the next shootable head.

## Decision Report - 2026-05-17 Tail Shrink Correction

- Source: user correction after reviewing unit removal direction.
- User explicitly requested: the length of the arrow should decrease from the tail, not from the head.
- Length correction: bullets still target the arrow unit aligned with the shooter, but each successful hit removes one visible unit from the tail end of the arrow.
- Sequencing correction: the arrow still accepts only one in-flight hit at a time, so length decreases one tail unit per landed bullet.

## Decision Report - 2026-05-17 Conveyor Entry Correction

- Source: user correction after reviewing how arrows leave the grid.
- User explicitly requested: when an arrow moves from grid onto conveyor, it should not move as a whole stick; it should animate like it turns around conveyor corners. The arrow should also be blocked if another arrow moving on the conveyor blocks its exit path.
- Entry animation correction: released arrows now convert their units to world-space and animate each unit separately onto the conveyor path, with grey connectors recomputed between units during entry.
- Exit blocking correction: before release, the game checks the arrow's exit corridor against visible units already moving on the conveyor; if a conveyor unit occupies that corridor, the board arrow stays blocked.
- Defaults chosen by AI and reasons: use a small corridor radius around the exit lane because the visible arrow units have thickness and should not appear to clip through each other.

## Decision Report - 2026-05-17 Config Extraction

- Source: user request to match the Block Blast config-folder pattern.
- User explicitly requested: make Arrow-Shooter use a config folder like `games/block-blast/`, and place data such as level design and arrow speed there.
- Config correction: `src/config/game-config.json` now stores board size, board position, conveyor speed/capacity/spacing, shooter aim/fire settings, tutorial asset path, copy, shooter slots/queues, and the authored arrow layout.
- Implementation correction: `main.js` now loads `src/config/game-config.json` through the shared config loader before building the board and shared geometries.
- Defaults chosen by AI and reasons: keep matching defaults in code as a fallback so the playable can still initialize if config loading fails during development.

## Decision Report - 2026-05-17 Snake Path Exit Correction

- Source: user correction after a red arrow was reported blocked even though a nearby yellow arrow was not on its actual path.
- User explicitly requested: arrows should move like snakes, so a nearby arrow should not block unless it occupies the path to the conveyor.
- Exit-path correction: board exit checks now search from the arrow head through available grid cells to any conveyor edge, treating the arrow's own body as passable because the body follows the head.
- Blocking correction: other arrows block only when they occupy the searched route, not merely because they sit beside the arrow or near another unit.
- Conveyor entry correction: the chosen exit side from the path search is used to choose the conveyor entry point.

## Decision Report - 2026-05-17 Snake Movement Correction

- Source: user correction after arrows still appeared to jump directly from grid to conveyor.
- User explicitly requested: arrows should move on the grid to the final destination, and only move like a snake where the head moves first and the body follows.
- Movement correction: release animation now builds a full route from tail to head, then through the found head path on the grid, then onto the conveyor entry.
- Body-follow correction: each arrow unit samples the same route behind the head, so the body follows the head through the grid path instead of easing directly to the conveyor.
- Blocking rule: if the head path search fails, the arrow remains blocked and does not start movement.

## Decision Report - 2026-05-17 Release Rotation Correction

- Source: user correction after observing that the arrow head did not face its movement direction while leaving the grid.
- Issue found: grid-release route rotation used the generic math angle convention where 0 radians faces right, while the arrow art uses 0 radians facing up.
- Rotation correction: release-route sampling now uses the same up-facing arrow rotation formula as conveyor movement, so the head faces the direction of travel on grid exits and turns.
