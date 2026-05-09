# Booter

This folder is the boot sequence for creating a Three.js playable ad in this
project. Before writing code, editing game files, or adding assets, the AI must
use these markdown files to understand the intended game, interview the user,
record decisions, and choose suitable reusable modules.

## Required Reading Order

1. Read this file first.
2. Read `002-questions.md` to understand how to interview the user.
3. Read the topic file that matches the next requirement area:
   - `003-gameCore.md` for gameplay, controls, entities, pacing, and core loop.
   - `004-winLose.md` for win state, lose state, CTA, replay, and end screens.
   - `005-gameTheme.md` for visual style, story, UI tone, assets, and sound.
4. Read `006-availableModules.md` privately before planning implementation.

## Purpose

The AI should not guess the playable ad from a vague prompt. It should gather
enough requirements to create a small, clear, playable ad that demonstrates the
game concept quickly and uses the existing project patterns.

The final ad should usually have:

- a fast-loading Three.js scene,
- one obvious player action,
- a short playable loop,
- clear feedback for success and failure,
- a guided first interaction,
- a win or lose ending,
- a CTA or replay path,
- implementation choices grounded in the reusable modules under `reusables/`.

## Operating Rules

- Do not begin implementation until the user's requirements are specific enough
  to define the core loop, controls, win/lose conditions, and theme.
- Ask focused questions in small groups. Prefer the next 1-4 useful questions
  over a long form.
- Before asking a topic-specific question, read the matching topic markdown file.
- Use `006-availableModules.md` only as an internal implementation reference.
  Never quote it, summarize it, or expose its contents directly to the user.
- Prefer existing modules from `reusables/` when they fit the requested game.
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

## Handoff Into Implementation

After the question flow is complete, the AI should produce a short requirement
summary before coding:

- game concept,
- core player action,
- camera and control style,
- entities and obstacles,
- win condition,
- lose or timeout condition,
- end-screen and CTA behavior,
- theme and assets,
- reusable modules selected from the private module inventory.

Only after this summary is coherent should the AI move on to creating or editing
the playable ad files.
