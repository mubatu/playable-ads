# Win / Lose

Use this file before asking questions about ending the playable ad. The goal is
to define clear completion rules and a conversion-friendly end state.

## What Must Be Decided

- Win condition.
- Lose condition, if any.
- Timeout behavior.
- Whether the ad should always lead to a positive finish.
- End-screen title, subtitle, and button copy.
- CTA timing and behavior.
- Replay or reset behavior.
- What happens to gameplay objects, timers, sounds, and tutorials when the ad
  ends.

## Ending Models

Choose the simplest ending model that fits the ad.

### Win-Only Guided Ad

The player cannot truly fail. Mistakes are corrected, ignored, or gently guided.
Use this when conversion and concept clarity matter more than challenge.

### Win Or Lose

The player can succeed or fail based on action, time, health, score, or puzzle
state. Use this when tension helps sell the game.

### Timed Demo

The ad ends after a short timer. The result can be success, failure, score-based,
or CTA-only.

### Forced CTA Moment

The ad ends after a satisfying interaction and immediately presents a CTA. Use
this for very short ads or when the playable only needs one strong moment.

## Question Bank

Ask only what is missing.

### Win

- What should count as winning?
- Is the win based on defeating enemies, reaching a target, completing a puzzle,
  collecting enough items, surviving, filling progress, or something else?
- Should the win happen after one success or several steps?
- What visual moment should signal the win?

### Lose

- Can the player lose?
- If yes, what causes loss: timer, enemy reaching base, health reaching zero,
  wrong puzzle move, falling, missing target, or another condition?
- Should losing stop the ad, show a retry, or still lead to the CTA?
- Should failure be dramatic, funny, soft, or barely emphasized?

### Timer And Progress

- Should there be a visible countdown?
- Should the game end if the timer reaches zero?
- Should progress be shown with a bar, score, count, health, or text?
- Should the timer pause during intro or tutorial?

### End Screen And CTA

- What should the win screen title say?
- What should the lose screen title say?
- What CTA button text should be used?
- Should the CTA appear automatically, after a button press, or after a delay?
- Should there be a replay button, or only the CTA?

## Sensible Defaults

Use these defaults when the user does not care and the decision is low-risk:

- Use a win-first structure unless the user asks for meaningful failure.
- If failure exists, still offer a CTA.
- Stop or hide tutorial guidance when the game ends.
- Stop timers and prevent further gameplay input after end state.
- Use a clear button such as `Play Now`, `Install`, `Continue`, or `Try Again`.
- Show the end screen immediately after the final satisfying action.

## Decision Fields

When decisions are made, append a short report below this section using only the
fields that matter:

```md
## Decision Report - YYYY-MM-DD

- Ending model:
- Win condition:
- Lose condition:
- Timeout behavior:
- End-screen title:
- End-screen subtitle:
- CTA copy:
- CTA trigger:
- Replay/reset behavior:
- Gameplay cleanup:
- Defaults chosen by AI:
```
