# Game Theme

Use this file before asking questions about art direction, story, UI tone,
assets, sound, copy, or presentation. The goal is to make the playable ad feel
coherent without letting theme choices make the scope too large.

## What Must Be Decided

- Visual theme and environment.
- Character, object, or brand fantasy.
- Mood and color palette.
- Camera feel and composition.
- UI style and text tone.
- Required intro, tutorial, win, lose, and CTA copy.
- Asset sources or placeholder strategy.
- How reference images should be interpreted.
- Tutorial hand asset source and expected appearance.
- Sound direction.
- Performance and file-size expectations.

## Presentation Checklist

A playable ad theme should answer:

- What world is the player in?
- What does the player want?
- What visual element should attract attention first?
- What makes success feel rewarding?
- What UI words guide the player?
- What assets must be real, and what can be simple shapes/placeholders?

## Question Bank

Ask only what is missing.

### Visual Concept

- What is the theme or setting?
- Should the ad look cute, realistic, arcade, fantasy, military, royal, sci-fi,
  toy-like, minimal, or something else?
- What colors should dominate?
- Are there characters, props, logos, or environments that must appear?
- Should this match an existing game folder, screenshot, or brand style?
- If the user provides a sketch or reference image, which parts should be copied:
  shapes, layout, colors, obstacle style, character style, UI, or mood?

### Scene And Assets

- Should the scene use flat sprites, simple 3D geometry, imported models, or a
  mix?
- Is a static background enough, or should the environment contain interactive
  objects?
- Are there existing assets in the project that should be reused?
- Can placeholders be used until final assets are provided?
- If a reference image is rough, should the AI preserve the rough geometry or
  clean it into polished game shapes?
- If a hand tutorial is needed, is there a hand/pointer asset inside the game
  folder, or should the AI ask for one before using `HandTutorial`?
- Should the ad support portrait, landscape, or both?

### UI And Copy

- What should the intro title and subtitle say?
- What should the tutorial prompt say?
- What labels, counters, health bars, progress bars, cards, or buttons are
  needed?
- What should the win, lose, and CTA text say?
- Should copy feel urgent, playful, competitive, heroic, or simple?

### Sound And Feedback

- Should the ad include sound effects?
- What actions need sound: tap, drag, deploy, collect, hit, wrong move, win,
  lose, CTA?
- Should there be looping background music, or only short effects?
- Should sound wait for the first user interaction?

### Constraints

- Is there a file-size limit?
- Are there brand, platform, legal, or store restrictions?
- Should the implementation avoid external network assets?
- Should visuals be simple enough to run smoothly on low-end mobile devices?

## Sensible Defaults

Use these defaults when the user does not care and the decision is low-risk:

- Use bright, high-contrast visuals.
- Keep important objects large and readable on mobile.
- Use simple geometry, CSS UI, and compressed textures where possible.
- Use placeholders for missing assets, but name them clearly in code/config.
- Use short UI copy: one instruction, one result line, one CTA.
- Use sound effects only after user interaction to avoid autoplay problems.
- Interpret rough sketches as gameplay/layout references unless the user says
  they are final art.

## Tutorial Hand Asset Rules

If using `HandTutorial`, the hand image must read unmistakably as a hand or
pointer at mobile size.

- Do not generate an abstract or blob-like SVG and pass it to `HandTutorial`.
- Prefer a user-provided hand/pointer asset placed inside the current game
  folder.
- If no hand asset exists, ask the user for one or record a fallback decision
  before implementation.
- If the AI creates a fallback asset, it must be a simple, recognizable pointer
  hand with clear index finger, thumb, palm, outline, and contrast. Avoid vague
  mitten shapes.
- After creating a fallback hand asset, visually sanity-check it at the size used
  by `HandTutorial` and record why it is acceptable.
- Set `assetUrl`, `size`, `anchor`, and optional `rotation` so the fingertip, not
  the palm center, points at the intended tap/drag target.

Defaults must be written with reasons. Example: `Obstacle style: sharp triangles,
chosen because the user's sketch shows repeated triangular hazards.`

## Decision Fields

When decisions are made, append a short report below this section using only the
fields that matter:

```md
## Decision Report - YYYY-MM-DD

- Theme:
- Environment:
- Mood/color palette:
- Camera presentation:
- Reference interpretation:
- Required assets:
- Placeholder strategy:
- Tutorial hand asset:
- Intro copy:
- Tutorial copy:
- Win/lose copy:
- CTA copy:
- Sound direction:
- Constraints:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```

## Decision Report - 2026-05-09

- Source: user interview + reference sketch
- Theme: Minimal arcade Flappy-like; geometry-forward look inspired by the user’s line sketch (readable silhouettes, not photorealistic).
- Environment: Abstract side-scrolling corridor; simple sky/void background; hazards as dark or high-contrast shapes matching spike/diamond language from the sketch.
- Mood/color palette: Bright, high-contrast, mobile-readable; palette can stay simple (e.g. light background, bold hazard color) unless user supplies brand colors later.
- Camera presentation: Fixed side-view orthographic framing; bird stays near fixed screen X while obstacles move.
- Reference interpretation: Use sketch as layout and shape language (triangular gaps, central diamond, two-path middle section), not as final marketing art—clean up into clear game geometry.
- Required assets: User reference saved at `src/assets/reference-level-sketch.png` for layout/art direction during build.
- Placeholder strategy: Simple Three.js meshes or extruded shapes for bird and hazards until final sprites/models are provided.
- Tutorial hand asset: User requested a visible hand; no dedicated hand PNG was provided. Before or during implementation, add a clear pointer-hand image under `src/assets/` (user-supplied preferred) sized/anchored for fingertip-on-target. If none supplied, create a simple high-contrast hand/pointer asset and validate at `HandTutorial` display size.
- Intro copy: Minimal or none—first screen is “tap to start” implied by hand; optional one-line “Tap to fly” if space allows.
- Tutorial copy: Implicit via hand motion toward tap area; optional short text “Tap!”
- Win/lose copy: See `004-winLose.md` decision report for placeholder titles/subtitles.
- CTA copy: See `004-winLose.md` (default “Play Now”).
- Sound direction: Optional light flap/hit/win SFX after first user gesture (avoid autoplay); no music required for v1.
- Constraints: Keep draw calls and textures light for low-end mobile; avoid external network assets unless user requests.
- What the user explicitly requested: Flappy Bird imitation; hand teaches tapping; start on first click; reference image for level ideas.
- Defaults chosen by AI and reasons: Sketch-driven minimal style keeps scope small and matches reference; bright readable palette follows playable-ad defaults.
- Unresolved or deferred: Brand logo placement; exact colors/fonts; final hand image file name and dimensions once asset is finalized.
