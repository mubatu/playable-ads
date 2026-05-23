# MD Booter Notes

Use `mark-downs/001-booter.md` as the entry point. The generated AI must stay
inside the current `game-name/` folder and use only that folder's `mark-downs/`,
`index.html`, `src/`, and user-provided local assets.

## Important Implementation Checks

- If `HandTutorial` is used, the `assetUrl` must point to a recognizable hand or
  pointer asset. Do not generate a vague blob-like SVG and call it a hand.
- If no hand asset exists inside the game folder, ask the user for one or record
  a clear fallback decision before implementation.
- For obstacles, gameplay colliders must match the visible shape. Do not use a
  full rectangle hitbox for triangles, diamonds, circles, or irregular hazards.
- Prefer forgiving colliders that are slightly smaller than the visible hazard.
  Invisible collision areas are not acceptable in a playable ad.
- Record hand-asset and collision-shape choices, plus reasons, in the current
  game's markdown decision reports.
