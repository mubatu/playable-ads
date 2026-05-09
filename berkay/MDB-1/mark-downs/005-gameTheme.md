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

### Scene And Assets

- Should the scene use flat sprites, simple 3D geometry, imported models, or a
  mix?
- Is a static background enough, or should the environment contain interactive
  objects?
- Are there existing assets in the project that should be reused?
- Can placeholders be used until final assets are provided?
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

## Decision Fields

When decisions are made, append a short report below this section using only the
fields that matter:

```md
## Decision Report - YYYY-MM-DD

- Theme:
- Environment:
- Mood/color palette:
- Camera presentation:
- Required assets:
- Placeholder strategy:
- Intro copy:
- Tutorial copy:
- Win/lose copy:
- CTA copy:
- Sound direction:
- Constraints:
- Defaults chosen by AI:
```
