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
- whether replay is allowed,
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
- Should the CTA appear automatically, after a button press, or after a delay?
- Should there be a replay button, or only the CTA?

## Sensible Defaults

Use these defaults when the user does not care and the decision is low-risk:

- Use a win-first structure unless the user asks for meaningful failure.
- For runner-style games, default to win after 6-8 successful obstacles only if
  the user did not specify an ending, and record why.
- If failure exists, still offer a CTA.
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
- Replay/reset behavior:
- Gameplay cleanup:
- Defaults chosen by AI and reasons:
- Unresolved or deferred:
```

## Decision Report - 2026-05-09

- Source: user interview
- Ending model: Win or lose (classic tension).
- Win condition: Player successfully passes **10** obstacles (gaps).
- Lose condition: Collision with any obstacle solid, **floor**, or **ceiling**.
- Timeout behavior: None; no countdown timer unless added later.
- End-screen title: **You did it!** (win) / **Nice try!** (lose) — short, neutral playable-ad tone; subtitles below.
- End-screen subtitle: Win: short praise + hint to download. Lose: encourage retry or download.
- CTA copy: **Download Now** on both win and lose; opens **Google** as the placeholder store URL (`https://www.google.com`).
- CTA trigger: User taps **Download Now** (button press only).
- Replay/reset behavior: **Retry** appears **only on lose**; resets run and returns to gameplay without a second tap-to-start gate. Win screen has **Download Now** only (no retry).
- Gameplay cleanup: Stop scrolling and flap input when an end state is shown; hide in-run HUD as appropriate; overlays use DOM above the canvas.
- Defaults chosen by AI and reasons: Exact subtitle strings chosen for clarity where the user did not provide literal copy; store target is Google per user request.
- Unresolved or deferred: None.
