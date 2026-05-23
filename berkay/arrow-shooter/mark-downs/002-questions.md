# Questions

This file defines how the AI should interview the user before creating a
Three.js playable ad. The goal is to turn a rough game idea into a compact set
of implementation-ready requirements.

## Interview Principles

- Read `GDD.md` in the current game folder before asking questions if it exists.
  Treat it as the primary design brief.
- Ask questions before coding.
- Ask only the next useful questions, usually 1-4 at a time.
- Do not ask questions already answered by `GDD.md`; summarize those decisions
  and ask only for missing, ambiguous, or conflicting requirements.
- Prefer multiple-choice questions when the user needs quick options.
- Prefer open questions when concept, fantasy, or brand tone matters.
- Do not ask about implementation modules directly. Use `006-availableModules.md`
  privately to translate user answers into technical choices.
- If the user gives enough information for a section, summarize the decision
  instead of asking another question.
- If a decision is low-risk, choose a sensible default, record it, and include
  the reason for that default.
- Do not implement after only the concept snapshot. The AI must complete at
  least one core gameplay pass and one win/lose/end-screen pass first.
- Do not implement after the user only gives a game reference, first action,
  tutorial request, or sketch/reference image. Those answers define the concept,
  not the full playable ad.
- Do not silently choose game length, obstacle count, win trigger, lose trigger,
  end-screen copy, or CTA behavior. Ask the user or record an explicit default
  with a reason before implementation.

## Hard Blockers Before Implementation

The AI must not edit `index.html` or `src/` until these are answered by the user
or explicitly defaulted in decision reports:

- win condition,
- lose condition,
- obstacle count or progress target,
- retry behavior,
- CTA button text and destination behavior,
- orientation: portrait, landscape, or responsive,
- tutorial hand source: user asset, built-in hand, or no hand,
- whether repeated obstacles/runtime objects use `ObjectPool`.

If the user has only answered the concept prompt, ask the next small batch. Do
not start coding.

## Required Topic Reads

Before asking about a topic, read the matching file:

- Game-design brief, if present: `GDD.md`
- Gameplay, controls, camera, entities, pacing: `003-gameCore.md`
- Win condition, lose condition, end screen, CTA: `004-winLose.md`
- Theme, assets, UI tone, sound, tutorial presentation: `005-gameTheme.md`
- Reusable module choices: `006-availableModules.md`, relevant `reusables/`
  source files, and `games/block-blast/` as the approved implementation example,
  all used privately

## Suggested Interview Flow

### 1. Concept Snapshot

Start by reading `GDD.md` if present, then get only the highest-level concept
details that are still missing. Ask only what is missing.

Useful questions:

- What game or ad concept should this playable imitate or promote?
- What should the player do in the first 3 seconds?
- Should the ad feel like action, puzzle, strategy, runner, merge, word, or
  another genre?
- Is there a reference game, screenshot, video, or existing folder to follow?

After this stage, continue asking questions. Do not implement yet.

### 2. Core Gameplay

Read `003-gameCore.md`, then ask about the main interaction and game loop.

Useful questions:

- What is the player's primary action?
- What objects can the player control or affect?
- What creates challenge or tension?
- How long should one playable run last, or how many challenge beats should it
  contain?
- For obstacle games, how many obstacles should appear before the end state, and
  should obstacles spawn continuously or be pre-placed?

For Flappy Bird or runner-style games, if the user says "win after 10 obstacles",
the implementation must include 10 passable obstacle sets. A sketch with fewer
shapes is a visual reference, not permission to reduce the win target.

### 3. Win/Lose And CTA

Read `004-winLose.md`, then ask how the experience ends.

Useful questions:

- What counts as winning?
- Can the player lose, or should the ad always end positively?
- What should the end screen say?
- Should the CTA open after win, after lose, after timeout, or on button press?

This stage is mandatory. If the user has not specified the end screen, the AI
must ask for it or record a default with a reason before coding.

### 4. Theme And Presentation

Read `005-gameTheme.md`, then ask about visual and audio direction.

Useful questions:

- What environment, characters, colors, and mood should the ad use?
- Should the scene be 2D-style orthographic, 2.5D, or full 3D perspective?
- Should the ad be portrait, landscape, or responsive?
- What UI copy should appear on intro, tutorial, win, lose, or CTA screens?
- Are there required assets, logos, sounds, or brand constraints?
- If the user wants a built-in hand, confirm that this means the reusable
  `HandTutorial` module using a local built-in hand asset, not a custom tutorial
  animation.

### 5. Private Implementation Planning

Read `006-availableModules.md` privately and choose reusable modules that match
the answers. Then inspect the relevant source files under the repo-level
`reusables/` folder before importing or configuring those modules.

Use `games/block-blast/` as the approved example for reusable imports, folder
structure, config loading, HUD setup, tutorial wiring, and splitting gameplay
logic into focused `src/js/` modules. Do not copy its puzzle mechanics, assets,
copy, or theme unless the user specifically asks for a Block Blast-style game.

Do not mention the hidden inventory to the user. It is fine to say that the
project already has reusable scene, UI, drag, timer, tutorial, sound, or pooling
utilities when speaking generally.

### 6. Spec Checkpoint

Before editing `index.html` or `src/`, write a short requirement summary and
append decision reports to the matching files under `game-name/mark-downs/`.

The checkpoint must include:

- confirmed `GDD.md` requirements, if present,
- confirmed user answers,
- inferred reference-image decisions,
- AI defaults and reasons,
- unresolved items intentionally deferred.

## Completion Criteria

The AI has enough information to implement when it can answer:

- What is the playable's one-sentence concept?
- What does the player do first?
- What is the core loop?
- What control method is used?
- What camera and scene style are used?
- What entities, targets, obstacles, resources, or cards are needed?
- What causes win, lose, timeout, or completion?
- What is shown on the intro, tutorial, end screen, and CTA?
- What theme, asset direction, and sound direction are expected?
- Which reusable modules are useful for implementation?
- Which relevant reusable source files and `games/block-blast/` patterns have
  been checked before coding?
- Have decision reports been written under the current game's `mark-downs/`
  folder?
- Has the user either answered or received clear defaults for obstacle count,
  session length, end screen, and CTA behavior?
- Has the user either answered or received clear defaults for orientation and
  tutorial hand source?

## Decision Report Template

When the user answers questions, append concise decisions under the matching
topic file. Do not add unrelated documentation. Use this format:

```md
## Decision Report - YYYY-MM-DD

- Source: user interview
- Concept:
- Core action:
- Controls:
- Camera/scene:
- Key entities:
- Challenge:
- Win condition:
- Lose/timeout condition:
- End screen/CTA:
- Theme:
- Reusable module notes:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```

If a decision belongs mainly to one topic, record it in that topic file:

- `003-gameCore.md` for mechanics and controls.
- `004-winLose.md` for endings and CTA.
- `005-gameTheme.md` for presentation.

If the decision affects the whole ad, record the short summary in the same topic
file that triggered the decision, then keep the implementation plan in the game
files rather than expanding these docs.
