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
- Orientation: portrait, landscape, or responsive.
- Reference images saved under the game assets folder.
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
- If the user provides a reference image, save a copy inside the current game
  folder, preferably under `src/assets/`, and reference that local path in the
  decision report.
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

- "Built in hand" means the reusable `HandTutorial` module with a local built-in
  hand asset under `src/assets/`. It does not mean drawing a custom CSS hand,
  using emoji/text, or writing a separate tutorial system.
- Do not generate an abstract or blob-like SVG and pass it to `HandTutorial`.
- For built-in hands, use the exact default hand SVG template in this file.
  Save it as local `src/assets/hand-1.svg` and pass that file to
  `HandTutorial.assetUrl`.
- If no user asset is provided and the user asks for a built-in hand, create or
  copy local `src/assets/hand-1.svg` from the template below and use it through
  `HandTutorial.assetUrl`.
- Do not approximate the default hand, simplify it, convert it to a tiny inline
  data URL, redraw it with different paths, or create a new hand design.
- If no hand asset exists, ask the user for one or record a fallback decision
  before implementation.
- If the AI creates a fallback asset, it must be a simple, recognizable pointer
  hand with clear index finger, thumb, palm, outline, and contrast. Avoid vague
  mitten shapes.
- After creating a fallback hand asset, visually sanity-check it at the size used
  by `HandTutorial` and record why it is acceptable.
- Set `assetUrl`, `size`, `anchor`, and optional `rotation` so the fingertip, not
  the palm center, points at the intended tap/drag target.

### Default Built-In Hand SVG

When the user asks for a built-in hand, create `src/assets/hand-1.svg` with this
exact content:

```svg
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="0" y="0" width="256" height="256" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#09111C" flood-opacity="0.36"/>
    </filter>
    <linearGradient id="sleeve" x1="74" y1="160" x2="140" y2="240" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFB970"/>
      <stop offset="1" stop-color="#F06B4F"/>
    </linearGradient>
    <linearGradient id="hand" x1="100" y1="28" x2="184" y2="188" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFF5E0"/>
      <stop offset="1" stop-color="#F0D5B1"/>
    </linearGradient>
  </defs>
  <g filter="url(#shadow)">
    <path d="M76 154C76 140.745 86.7452 130 100 130H141C154.255 130 165 140.745 165 154V181C165 194.255 154.255 205 141 205H100C86.7452 205 76 194.255 76 181V154Z" fill="url(#sleeve)"/>
    <path d="M101.503 40.375C101.503 31.8847 108.387 25 116.878 25C125.368 25 132.253 31.8847 132.253 40.375V102.188H136.503V31.375C136.503 22.8847 143.387 16 151.878 16C160.368 16 167.253 22.8847 167.253 31.375V104.938H171.503V42.125C171.503 33.6347 178.387 26.75 186.878 26.75C195.368 26.75 202.253 33.6347 202.253 42.125V126.929C202.253 158.481 176.671 184.063 145.119 184.063H127.454C91.5398 184.063 62.4113 154.934 62.4113 119.02V89.5625C62.4113 80.542 69.7232 73.23 78.7438 73.23C87.7643 73.23 95.0763 80.542 95.0763 89.5625V109.375H101.503V40.375Z" fill="url(#hand)"/>
    <path d="M95.0762 109.375H101.503V145.313C101.503 153.804 94.6186 160.688 86.1284 160.688C77.6381 160.688 70.7534 153.804 70.7534 145.313V119.02C70.7534 113.731 75.0409 109.444 80.3291 109.444H95.0762V109.375Z" fill="url(#hand)"/>
    <path d="M130.253 106.188V39.375C130.253 32.6805 124.822 27.25 118.128 27.25C111.433 27.25 106.003 32.6805 106.003 39.375V120.625" stroke="#E7C49C" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M164.003 104.938V31.875C164.003 25.1805 158.572 19.75 151.878 19.75C145.183 19.75 139.753 25.1805 139.753 31.875V102.188" stroke="#E7C49C" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M198.503 127V42.625C198.503 35.9305 193.072 30.5 186.378 30.5C179.683 30.5 174.253 35.9305 174.253 42.625V105.875" stroke="#E7C49C" stroke-width="4.5" stroke-linecap="round"/>
  </g>
</svg>
```

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
- Saved reference assets:
- Orientation:
- Intro copy:
- Tutorial copy:
- Win/lose copy:
- CTA copy:
- Sound direction:
- Constraints:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```
