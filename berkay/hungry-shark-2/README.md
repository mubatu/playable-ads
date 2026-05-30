# MD Booter Notes

Use `mark-downs/001-booter.md` as the entry point. The generated AI must edit
only the current `game-name/` folder, but it may read and import from the
repo-level `reusables/` folder and may inspect `games/block-blast/` as the
approved example for folder structure and reusable-module usage.

## Important Implementation Checks

- Read the current game folder's `README.md` before implementation if it exists.
- Read the current game folder's `GDD.md` before asking the user questions if it
  exists. Use it to avoid asking for details that are already specified.
- Read the relevant source files under `reusables/` before using reusable
  modules. Treat `mark-downs/006-availableModules.md` as the inventory and the
  source files as the implementation contract.
- Use `games/block-blast/` as the approved reference for how a playable imports
  reusable modules, organizes `src/js/`, loads config, and connects UI/tutorial
  systems. Do not copy its puzzle mechanics unless the requested game needs
  them.
- Do not implement after only the concept/reference-image prompt. Continue the
  interview until win/lose, obstacle/progress target, retry/CTA, orientation, and
  tutorial hand source are known or explicitly defaulted.
- If `HandTutorial` is used, the `assetUrl` must point to a recognizable hand or
  pointer asset. Do not generate a vague blob-like SVG and call it a hand.
- "Built in hand" means use the reusable `HandTutorial` module with a local
  `src/assets/hand-1.svg` copied exactly from the "Default Built-In Hand SVG"
  template in `mark-downs/005-gameTheme.md`.
- If no hand asset exists inside the game folder, ask the user for one or record
  a clear fallback decision before implementation.
- Do not approximate, simplify, redraw, inline, or replace the default hand SVG.
- Save user-provided reference images under the current game's `src/assets/`
  folder and cite the local path in markdown decisions.
- If the user says the player wins after passing `N` obstacles, implement `N`
  passable obstacle sets. Do not reduce the target because the sketch shows fewer
  example obstacles.
- For obstacles, gameplay colliders must match the visible shape. Do not use a
  full rectangle hitbox for triangles, diamonds, circles, or irregular hazards.
- Do not use rectangle/AABB helpers such as `circleRectOverlap`, `hitTestRect`,
  `Box2`, `Box3`, or bounding boxes as the final hit test for triangular,
  diamond, circular, or irregular hazards.
- Prefer forgiving colliders that are slightly smaller than the visible hazard.
  Invisible collision areas are not acceptable in a playable ad.
- Use `ObjectPool` for repeated runtime objects such as runner obstacles,
  enemies, projectiles, pickups, collectibles, and temporary meshes.
- Record hand-asset and collision-shape choices, plus reasons, in the current
  game's markdown decision reports.
