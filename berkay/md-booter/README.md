# MD Booter Notes

Use `mark-downs/001-booter.md` as the entry point. The generated AI must stay
inside the current `game-name/` folder and use only that folder's `mark-downs/`,
`index.html`, `src/`, and user-provided local assets.

## Important Implementation Checks

- Read the current game folder's `README.md` before implementation if it exists.
- If `HandTutorial` is used, the `assetUrl` must point to a recognizable hand or
  pointer asset. Do not generate a vague blob-like SVG and call it a hand.
- If no hand asset exists inside the game folder, ask the user for one or record
  a clear fallback decision before implementation.
- Use the polished `words-of-w` style hand asset for new games: local
  `src/assets/hand-1.svg`, 256x256, warm skin gradient, orange sleeve, drop
  shadow, clear palm, and distinct raised fingers.
- Save user-provided reference images under the current game's `src/assets/`
  folder and cite the local path in markdown decisions.
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
