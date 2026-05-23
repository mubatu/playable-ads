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

## Mandatory End-State Gate

Do not implement the playable until the ending is specified or explicitly
defaulted in this file. The AI must not silently decide that the game ends after
a small number of obstacles, after a timer, or after one success.

Before coding, the AI must know or record defaults for:

- what causes the playable to end,
- what counts as winning,
- whether collision or mistakes cause losing,
- what the end screen says,
- what button or CTA appears,
- where the CTA navigates or how the click should be handled,
- whether replay is allowed,
- whether retry appears on win, lose, both, or neither,
- what happens to input, timers, tutorials, and movement after ending.

If the user has not answered these, ask the next 1-4 questions. If the user wants
the AI to choose, write the chosen defaults and reasons in the decision report.

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
- For runner or obstacle games, does the player win after passing a target
  number of obstacles, surviving for a duration, reaching a score, or reaching a
  finish marker?
- Should the win happen after one success or several steps?
- What visual moment should signal the win?

### Lose

- Can the player lose?
- If yes, what causes loss: timer, enemy reaching base, health reaching zero,
  wrong puzzle move, falling, missing target, or another condition?
- Should losing stop the ad, show a retry, or still lead to the CTA?
- Should retry appear only after losing, or also after winning?
- Should failure be dramatic, funny, soft, or barely emphasized?

### Timer And Progress

- Should there be a visible countdown?
- Should the game end if the timer reaches zero?
- Should progress be shown with a bar, score, count, health, or text?
- If there is no timer, how should the player know how close they are to the end?
- Should the timer pause during intro or tutorial?

### End Screen And CTA

- What should the win screen title say?
- What should the lose screen title say?
- What subtitle should explain the result or next step?
- What CTA button text should be used?
- Where should the CTA navigate?
- Should the CTA appear automatically, after a button press, or after a delay?
- Should there be a replay button, or only the CTA?

## Sensible Defaults

Use these defaults when the user does not care and the decision is low-risk:

- Use a win-first structure unless the user asks for meaningful failure.
- For runner-style games, default to win after 6-8 successful obstacles only if
  the user did not specify an ending, and record why.
- If failure exists, still offer a CTA.
- If the user says "retry only if he loses", do not show retry on the win screen.
- Stop or hide tutorial guidance when the game ends.
- Stop timers and prevent further gameplay input after end state.
- Use a clear button such as `Play Now`, `Install`, `Continue`, or `Try Again`.
- Show the end screen immediately after the final satisfying action.

Defaults must be written with reasons. Example: `CTA copy: Play Now, chosen
because the user did not provide store copy and the ad needs a clear conversion
button.`

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
- CTA destination:
- Replay/reset behavior:
- Gameplay cleanup:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```

## Decision Report - 2026-05-17

- Source: GDD.md and user interview.
- GDD specifies: the loop ends when there are 5 arrows on the conveyor and none of them are being hit.
- User explicitly requested: win by clearing the full board, lose with the jam condition, show Play Now with retry only after losing, and leave the store URL to be configured later.
- Ending model: win or lose.
- Win condition: all arrows on the 8x8 board are cleared.
- Lose condition: 5 arrows are on the conveyor and no conveyor arrow is currently being hit by a same-color shooter.
- Timeout behavior: no timeout by default; the jam state is the lose pressure.
- End-screen title: default win title is `Board Cleared!`; default lose title is `Conveyor Jammed!`.
- End-screen subtitle: default win subtitle is `Great solve - keep clearing puzzles.`; default lose subtitle is `Try a smarter order and keep the arrows moving.`
- CTA copy: `Play Now`.
- CTA trigger: show end overlay immediately after win or lose; CTA activates only when the button is pressed.
- CTA destination: store URL placeholder/config field to be filled later.
- Replay/reset behavior: show Retry only after losing; do not show Retry on the win screen.
- Gameplay cleanup: stop tutorial, block further board input, stop active movement/timers, and keep the final board state visible behind the overlay.
- Defaults chosen by AI and reasons: no countdown because the GDD already defines a clear jam fail state; default copy is short and conversion-friendly because final brand/store copy was not provided; CTA is button-triggered because the user selected a future store URL instead of an immediate navigation target.
- Unresolved or deferred: final store URL and any brand-specific end-screen copy remain deferred until provided.

## Decision Report - 2026-05-17 Correction

- Source: user correction after first implementation pass.
- Lose condition correction: the 5-arrow limit applies to arrows moving on the conveyor loop, not to parked conveyor slots.
- Shooter state correction: an arrow only counts as being hit when a matching shooter can target it while it is passing the shooter row.
- Defaults chosen by AI and reasons: add a short jam grace window so the moving conveyor does not fail on a single frame between shots, while still preserving the GDD's jam fail state.

## Decision Report - 2026-05-17 Shooter Targeting Correction

- Source: user correction after observing an arrow survive despite enough shooter bullets.
- Shooter state correction: a conveyor arrow counts as shootable if any visible unit, not only its lead point, is passing under a matching shooter.
- Lose/jam implication: the jam check uses the same per-unit shootable logic, so a full conveyor does not falsely jam while a trailing unit can still be hit.

## Decision Report - 2026-05-17 Jam Timing Correction

- Source: user correction after observing an instant jam with 5 conveyor arrows that would be destroyed if the game continued.
- Issue found: jam detection checked only whether a unit was exactly shootable on the current frame, which is too strict for a moving conveyor.
- Lose condition correction: a full conveyor jams only when there is no current or imminent shooter match for any conveyor arrow, no release animation is entering the conveyor, and no shooter replacement is in progress.
- Defaults chosen by AI and reasons: preserve the exact per-unit aim rule for shooting, but use broader future-match logic for losing because conveyor arrows need time to reach the shooter row.
