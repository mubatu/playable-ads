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
- Should obstacle spacing, size, speed, or shape change over time?
- What values need to be tracked: score, health, timer, progress, elixir, unit
  count, word progress, combo, or distance?
- Does anything need to spawn, move, collide, merge, attack, pathfind, or pool?

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
- session length or progress target,
- failure collision behavior,
- success condition handoff to the win/lose spec.

## Sensible Defaults

Use these defaults when the user does not care and the choice is low-risk:

- Session length: 15-30 seconds.
- Obstacle/challenge count: 6-8 beats for a short skill ad, unless the user asks
  for a one-shot demo or an endless runner.
- Obstacle spawning: timed spawning for runner-style games; hand-placed obstacles
  only when the user provides a specific layout reference.
- Camera: orthographic 2.5D for simple touch-first playables.
- First interaction: visible tutorial hand or intro overlay.
- Controls: tap or drag for broad mobile accessibility.
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
- Resources/progress values:
- Feedback:
- Tutorial guidance:
- Session length:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```
