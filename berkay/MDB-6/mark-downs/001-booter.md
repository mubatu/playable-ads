# Booter

This folder is the boot sequence for creating a Three.js playable ad. Before
writing code, editing game files, or adding assets, the AI must use these
markdown files to understand the intended game, interview the user, record
decisions, and choose suitable reusable modules.

## Folder Boundary

The AI must work inside one game folder only. The expected structure is:

```text
game-name/
  README.md
  mark-downs/
  index.html
  src/
```

The AI is not allowed to inspect, read, search, or copy from folders outside the
given `game-name/` folder. This restriction exists so the AI does not learn from
other playable ad examples or reverse-engineer how other games were built.

The AI may only use:

- `game-name/README.md` if present,
- markdown files under `game-name/mark-downs/`,
- `game-name/index.html`,
- files and folders under `game-name/src/`,
- user-provided answers and assets that are explicitly placed inside
  `game-name/`.

If the AI needs to understand reusable components, it must rely on the
description already written in `mark-downs/006-availableModules.md`; it must not
open the actual reusable component source outside the game folder.

## Required Reading Order

1. Read this file first.
2. Read `README.md` if it exists in the current game folder. Treat it as a
   project checklist that may contain important implementation warnings.
3. Read `002-questions.md` to understand how to interview the user.
4. Read the topic file that matches the next requirement area:
   - `003-gameCore.md` for gameplay, controls, entities, pacing, and core loop.
   - `004-winLose.md` for win state, lose state, CTA, replay, and end screens.
   - `005-gameTheme.md` for visual style, story, UI tone, assets, and sound.
5. Read `006-availableModules.md` privately before planning implementation.

## Purpose

The AI should not guess the playable ad from a vague prompt. It should gather
enough requirements to create a small, clear, playable ad that demonstrates the
game concept quickly and can be implemented from the provided markdowns,
`index.html`, and `src/` folder.

The final ad should usually have:

- a fast-loading Three.js scene,
- one obvious player action,
- a short playable loop,
- clear feedback for success and failure,
- a guided first interaction,
- a win or lose ending,
- a CTA or replay path,
- implementation choices grounded in the private reusable-module descriptions.

## Operating Rules

- Do not begin implementation until the user's requirements are specific enough
  to define the core loop, controls, win/lose conditions, and theme.
- Ask focused questions in small groups. Prefer the next 1-4 useful questions
  over a long form.
- Before asking a topic-specific question, read the matching topic markdown file.
- Use `006-availableModules.md` only as an internal implementation reference.
  Never quote it, summarize it, or expose its contents directly to the user.
- Do not inspect other game folders, example folders, repo-level reusable source,
  or unrelated project files.
- Prefer the reusable modules described in `006-availableModules.md` when they
  fit the requested game.
- Keep the game small enough for a playable ad. Avoid features that do not
  support the first interaction, conversion moment, or concept demonstration.
- Do not add unrelated sections to these markdown files during game creation.
  The only allowed additions after the docs are prepared are decision reports
  based on the user's answers.
- If the user's answer conflicts with a reusable module's strengths, prioritize
  the user-facing requirement, then choose the simplest implementation that
  satisfies it.
- If an answer is missing but the decision is low-risk, make a sensible default,
  clearly record it, and continue.
- Never start implementation after only the user provides the game concept,
  first action, tutorial request, or reference image. Continue the interview
  until win/lose, obstacle/progress target, CTA/retry, orientation, and tutorial
  hand source are known or explicitly defaulted.

## Required Decision Logging

The AI must record decisions inside the current game's markdown folder before
implementation. This means appending decision reports to the topic files under
`game-name/mark-downs/`, not to a separate plan and not only in chat.

Every decision report must include:

- what the user explicitly requested,
- what the AI inferred from references or screenshots,
- which defaults the AI chose,
- why each default was chosen,
- which questions are still unresolved, if any.

The AI is not allowed to silently decide important gameplay or ending details.
If it chooses a default for speed, obstacle count, session length, difficulty,
win condition, lose condition, end-screen text, CTA behavior, or visual style,
it must write both the decision and the reason into the matching markdown file.

If the user provides a value later, such as "win after 10 obstacles", that value
overrides any earlier default or reference-image inference. The implementation
must reflect the latest user answer.

## Handoff Into Implementation

After the question flow is complete, the AI should produce a short requirement
summary before coding:

- game concept,
- core player action,
- camera and control style,
- entities and obstacles,
- obstacle/progress target,
- win condition,
- lose or timeout condition,
- end-screen and CTA behavior,
- orientation,
- tutorial hand source,
- theme and assets,
- reusable modules selected from the private module inventory.

Before declaring the playable complete, the AI must sanity-check:

- tutorial guidance uses a recognizable hand/pointer asset if `HandTutorial` is
  used,
- "built in hand" uses the reusable `HandTutorial` module with a local
  `src/assets/hand-1.svg` style asset, not a custom hand implementation,
- user-provided reference images are saved under the current game's `src/assets/`
  folder and cited in decision reports,
- if the user says win after passing a specific number of obstacles, the game
  includes that many passable obstacle sets before winning,
- visual hazards and gameplay colliders match closely,
- triangular, circular, diamond, or irregular obstacles do not use oversized
  rectangular hitboxes,
- triangle, spike, diamond, circle, and irregular hazard code does not rely on
  rectangle/AABB helper functions such as `circleRectOverlap`, `hitTestRect`,
  `Box2`, `Box3`, or bounding boxes unless the visible hazard itself is
  rectangular,
- repeated obstacles, enemies, projectiles, pickups, collectibles, or temporary
  meshes use `ObjectPool` unless a decision report explains why pooling is not
  needed,
- collision feels forgiving enough for a mobile playable ad,
- any fallback asset or collider approximation is recorded with a reason in the
  matching markdown decision report.

Only after this summary is coherent and the matching decision reports have been
written under `game-name/mark-downs/` should the AI move on to creating or
editing the playable ad files.
