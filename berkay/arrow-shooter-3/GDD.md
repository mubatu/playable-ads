### Game Overview

- **Title:** Arrow-Shooter 3D
- **Genre:** Casual puzzle playable ad
- **Platform:** Mobile web playable, portrait first
- **Target resolution:** 1080x1920 responsive portrait
- **Core fantasy:** The player frees snake-like colored arrows from a grid, sends them onto a moving conveyor around the board, and watches matching colored shooters destroy the arrows unit by unit.
- **Implementation expectation:** This GDD is the complete design source. Do not rely on sibling game folders or previous implementations. The AI may use reusable modules from `reusables/` and may inspect `games/block-blast/` only for general project structure, config loading, HUD/tutorial wiring, and reusable-module integration patterns.

---

### High-Level Playable Goal

Create a short, readable 3D playable ad where the player clears an 8x8 board by tapping arrows that can snake their way out to a conveyor. The player wins by clearing every arrow from the board and conveyor. The player loses only when the conveyor is full and no arrow on it can be destroyed by current or imminent matching shooters.

The ad must be compact, instantly understandable, and focused on one action: **tap a valid arrow**.

---

### Core Gameplay Loop

1. **Evaluate:** The player sees an 8x8 grid filled with multi-unit colored arrows. Shooters sit above the board. A conveyor loop surrounds the grid.
2. **Tap:** The player taps an arrow head or body.
3. **Path Check:** The selected arrow moves only if its head has a valid path through the grid to any conveyor edge.
4. **Snake Movement:** The arrow head travels along the found grid path first. The body follows the same path like a snake. The arrow does not teleport or move as one rigid stick.
5. **Conveyor Entry:** After exiting the grid, the arrow joins the moving conveyor loop around the board. Units and connectors continue bending around conveyor corners.
6. **Shooting:** Shooters fire at matching-color arrow units only when a unit is directly in front of that shooter. Each bullet removes one unit from the arrow's tail after impact.
7. **Repeat:** Freed arrows open new grid paths for other arrows. The player keeps tapping valid arrows until all arrows are cleared or the conveyor jams.

---

### Board And Arrow Rules

#### Grid

- The board is an **8x8 configurable grid**.
- Grid size, cell size, board position, and level layout must be data-driven through a JSON config file.
- Empty cells are traversable.
- Cells occupied by other board arrows block pathfinding.
- Cells occupied by the selected arrow's own body do **not** block that arrow, because the body follows the head.

#### Arrows

- Arrows are colored snake-like chains made of connected units.
- Arrow lengths vary. Examples: 2 units, 3 units, 4 units, or any configured number.
- Arrow shapes do not have to be straight. They can turn through grid cells.
- Every arrow has:
  - a color,
  - a head direction,
  - an ordered list of occupied cells,
  - a current length equal to its remaining visible units.
- The head must visibly face the direction it is moving.
- The arrow body must follow the exact route taken by the head.
- Arrow units should be rectangular, not square, so the direction and body flow are readable.
- Units should be connected by narrower grey connector blocks.

#### Valid Movement

An arrow may move only if:

- its head can find a path through grid cells to the conveyor,
- that path does not pass through other board arrows,
- the conveyor is not at capacity,
- no visible conveyor arrow unit is physically blocking the selected arrow's exit corridor.

An arrow must not be blocked just because another arrow is adjacent or near it. It is blocked only if another arrow occupies the actual path.

---

### Snake Pathfinding

Pathfinding starts from the selected arrow head.

Rules:

- The search begins at the cell in front of the head direction.
- If the head is already at an edge and can leave immediately, that counts as a valid path.
- The arrow's own cells are treated as passable.
- Other arrows' cells are treated as blocked.
- The head may route around obstacles if there is space.
- The selected exit side should determine where the arrow joins the conveyor.
- If no path exists, the arrow shakes or gives feedback and does not move.

Movement animation:

- Build a route from the arrow's current body chain, through the head path, then onto the conveyor.
- The head advances first.
- Each following unit samples the same route behind the head.
- Connectors are recomputed between adjacent units during movement.
- The arrow must bend through turns instead of rotating as one rigid object.

---

### Conveyor Rules

- The conveyor is a continuous loop around the grid.
- It moves arrows continuously; arrows do not park in slots.
- The conveyor has a capacity of **5 arrows**.
- The conveyor speed must be configurable.
- Arrows on the conveyor move as snake chains:
  - each unit samples the conveyor path independently,
  - grey connectors bridge units,
  - the chain bends around conveyor corners.
- A board arrow cannot enter the conveyor if a visible conveyor unit blocks its exit corridor.

---

### Shooter Rules

#### Shooter Setup

- Shooters are placed above the top conveyor lane.
- Each shooter has:
  - a color,
  - a bullet count,
  - a queue of future shooter colors.
- Default shooter bullet count: **5**, configurable.
- Shooter slots and queues must be configurable.

#### Shooting Behavior

- Shooters only shoot arrows of the same color.
- A shooter may shoot only when a visible arrow unit is directly in front of the shooter's aim line.
- Do not shoot early while a unit is approaching the aim line.
- Use a tight configurable aim threshold for X and Y alignment.
- Fired bullets must be visible as projectiles traveling from the shooter to the target unit.
- A bullet should hit one unit only.
- An arrow should accept only one in-flight hit at a time, so unit removal is readable and sequential.

#### Arrow Length Reduction

- The bullet targets the unit that is aligned with the shooter.
- When the bullet lands, the arrow's length decreases by **one unit from the tail**, not from the head.
- Example:
  - a 3-unit arrow passes a matching shooter,
  - shooter fires at the aligned unit,
  - bullet lands,
  - tail unit disappears,
  - next bullet can then be fired,
  - tail shortens again,
  - when no units remain, the arrow disappears and score is awarded.

#### Shooter Replacement

- When a shooter uses all bullets, it is considered spent.
- A spent shooter should not instantly change color.
- Instead:
  - animate the spent shooter out of the slot,
  - take the next color from its queue,
  - animate the new shooter into the slot,
  - refill its bullets.

---

### Win, Lose, Score, And CTA

#### Score

- Each fully destroyed arrow awards **10 points**.
- Score should be visible in the HUD.

#### Win Condition

- The player wins when:
  - all board arrows have left the grid,
  - all conveyor arrows have been destroyed,
  - no active bullets or release animations remain.

#### Lose Condition

- The player loses when:
  - the conveyor contains 5 arrows,
  - no bullet is currently in flight,
  - no release animation is entering the conveyor,
  - no shooter replacement is in progress,
  - and there is no current or future match between any conveyor arrow color and any active shooter with bullets.

Important: do **not** lose simply because no unit is exactly under a shooter on the current frame. A full conveyor may still be safe if matching arrows will soon reach matching shooters.

#### End Screen

- Win title: `Board Cleared!`
- Lose title: `Conveyor Jammed!`
- CTA button: `Play Now`
- Retry should appear only after losing.
- CTA destination should be configurable and may be empty during development.

---

### 3D Visual Direction

The game must be implemented as a real 3D presentation, not a flat 2D board.

#### Camera

- Use a configurable perspective camera.
- Portrait composition should remain readable and tap-friendly.
- Suggested default:
  - FOV around 38 degrees,
  - camera angled above the board,
  - target centered near the board.

#### Scene

- Dark, clean, high-contrast 3D stage.
- Bright arrows should pop from the background.
- Use lighting, shadows, and mild depth/fog where helpful.
- Keep performance suitable for mobile playable ads.

#### Board

- Raised 3D board panel.
- Individual 3D cells with depth.
- Cells should remain readable as an 8x8 grid.

#### Arrows

- Arrow head is an extruded or 3D arrow shape.
- Arrow head size must be configurable.
- Body units are raised rectangular 3D pieces.
- Connectors are narrower grey 3D pieces.
- Arrows should cast/receive shadows where reasonable.

#### Conveyor

- Conveyor should read as a 3D rail or track around the grid.
- Corners should be visible.
- Arrows should bend around the conveyor path.

#### Shooters

- Shooters should be 3D objects with:
  - a base,
  - a barrel/muzzle,
  - color-coded material,
  - visible numeric bullet count.
- Bullets should be visible 3D projectiles.

---

### Config Requirements

Use a config folder like:

```text
src/config/game-config.json
```

The following must be configurable:

- board rows and columns,
- cell size,
- board position,
- arrow head scale,
- camera FOV, position, and target,
- 3D visual depth values,
- conveyor capacity,
- conveyor speed,
- conveyor unit spacing,
- conveyor exit-block radius,
- jam grace/timing,
- shooter Y position,
- shooter aim thresholds,
- shooter bullet count,
- shooter fire interval,
- shooter slots and queues,
- full level arrow layout,
- tutorial hand asset path,
- CTA destination,
- HUD and end-screen copy.

The AI may keep safe code defaults as a fallback, but the playable should normally load values from `src/config/game-config.json`.

---

### Tutorial And HUD

- Use a recognizable hand/pointer tutorial for the first valid arrow tap.
- If using the shared hand tutorial utility, use a local hand asset path.
- Tutorial should dismiss after first user interaction.
- HUD should show:
  - score,
  - arrows left,
  - conveyor occupancy, e.g. `3/5`.
- Avoid mid-screen text that overlaps the board, shooters, or conveyor.

---

### Implementation Notes For AI

- Treat this GDD as the complete source of game behavior.
- Do not inspect or copy sibling implementations of this game.
- You may inspect `reusables/` for shared modules and `games/block-blast/` for general config-loading and project-structure patterns.
- Use Three.js.
- Use object pooling for repeated bullets, particles, and other temporary runtime objects.
- Prefer simple generated 3D geometry over external art assets unless assets are explicitly provided.
- Keep all edits inside the current game folder, except for reading allowed reusable/reference files.

---

### Acceptance Checklist

The playable is correct when:

- the scene is visibly 3D with perspective, depth, lighting, and shadows,
- arrows are multi-unit chains with heads, bodies, and grey connectors,
- the head moves first and body follows through the grid like a snake,
- arrows only move if the head has a valid path to the conveyor,
- conveyor arrows bend around corners,
- conveyor exit can be blocked by visible conveyor units,
- shooters fire only at matching-color units directly in front of them,
- each bullet removes exactly one tail unit after impact,
- shooter replacement is animated,
- full conveyor does not falsely jam while matching arrows can still be destroyed,
- score, win, lose, CTA, retry, and tutorial behavior are present,
- level and tuning values are configurable from `src/config/game-config.json`.
