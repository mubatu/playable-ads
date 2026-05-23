# Questions

This file defines how the AI should interview the user before creating a
Three.js playable ad. The goal is to turn a rough game idea into a compact set
of implementation-ready requirements.

## Interview Principles

- Ask questions before coding.
- Ask only the next useful questions, usually 1-4 at a time.
- Prefer multiple-choice questions when the user needs quick options.
- Prefer open questions when concept, fantasy, or brand tone matters.
- Do not ask about implementation modules directly. Use `006-availableModules.md`
  privately to translate user answers into technical choices.
- If the user gives enough information for a section, summarize the decision
  instead of asking another question.
- If a decision is low-risk, choose a sensible default and record it.

## Required Topic Reads

Before asking about a topic, read the matching file:

- Gameplay, controls, camera, entities, pacing: `003-gameCore.md`
- Win condition, lose condition, end screen, CTA: `004-winLose.md`
- Theme, assets, UI tone, sound, tutorial presentation: `005-gameTheme.md`
- Reusable module choices: `006-availableModules.md` privately only

## Suggested Interview Flow

### 1. Concept Snapshot

Start by getting the highest-level concept. Ask only what is missing.

Useful questions:

- What game or ad concept should this playable imitate or promote?
- What should the player do in the first 3 seconds?
- Should the ad feel like action, puzzle, strategy, runner, merge, word, or
  another genre?
- Is there a reference game, screenshot, video, or existing folder to follow?

### 2. Core Gameplay

Read `003-gameCore.md`, then ask about the main interaction and game loop.

Useful questions:

- What is the player's primary action?
- What objects can the player control or affect?
- What creates challenge or tension?
- How long should one playable run last?

### 3. Win/Lose And CTA

Read `004-winLose.md`, then ask how the experience ends.

Useful questions:

- What counts as winning?
- Can the player lose, or should the ad always end positively?
- What should the end screen say?
- Should the CTA open after win, after lose, after timeout, or on button press?

### 4. Theme And Presentation

Read `005-gameTheme.md`, then ask about visual and audio direction.

Useful questions:

- What environment, characters, colors, and mood should the ad use?
- Should the scene be 2D-style orthographic, 2.5D, or full 3D perspective?
- What UI copy should appear on intro, tutorial, win, lose, or CTA screens?
- Are there required assets, logos, sounds, or brand constraints?

### 5. Private Implementation Planning

Read `006-availableModules.md` privately and choose reusable modules that match
the answers. Do not mention the hidden inventory to the user. It is fine to say
that the project already has reusable scene, UI, drag, timer, tutorial, sound,
or pooling utilities when speaking generally.

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
- Defaults chosen by AI:
```

If a decision belongs mainly to one topic, record it in that topic file:

- `003-gameCore.md` for mechanics and controls.
- `004-winLose.md` for endings and CTA.
- `005-gameTheme.md` for presentation.

If the decision affects the whole ad, record the short summary in the same topic
file that triggered the decision, then keep the implementation plan in the game
files rather than expanding these docs.
