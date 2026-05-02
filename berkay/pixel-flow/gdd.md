```markdown
# Game Design Document (GDD): Pixel Flow!

## 1. Concept and Overview
**Game Title:** Pixel Flow!
**Developer:** Loom Games A.Ş. (Turkish studio)
**Genre:** Casual Puzzle / Arcade / Color Shooter
**Platform:** Mobile (iOS, Android)
**Target Audience:** Casual gamers who enjoy fast-paced, bite-sized action-puzzles, but specifically higher-intent players willing to invest attention, timing, and mastery rather than passive play.
**Core Concept:** A satisfying color-matching puzzle game that relies on a unique conveyor-belt mechanic, unit persistence, and "flow management". Players tap to deploy units (pigs) to destroy pixel blocks of the same color, actively managing limited space and unit ammunition to clear the board.

## 2. Gameplay Mechanics
**Core Loop:**
*   **Tap to Deploy:** Players use simple one-tap controls to send a pig from a 5-slot waiting queue onto a conveyor belt.
*   **Color Matching (Auto-Aim):** Once on the conveyor, the pig automatically shoots downwards, but will only hit and destroy pixel blocks that match its own color.
*   **Ammo & Unit Persistence:** Each pig has a specific ammunition count displayed above its head. If a pig does not use all its ammo, it leaves the board and slips into one of the 5 waiting slots at the bottom, adding a strategic layer of queue management.
*   **Conveyor Capacity:** The conveyor belt has limited space. Overcrowding it disrupts the rhythm and leads to delays, forcing players to manage the flow and order of their units carefully.
*   **Slinging & Dexterity:** Unlike passive puzzles, *Pixel Flow!* requires fast execution under space pressure. Fast players can chain actions, temporarily push past the tray limit, and recover from near-failure.

## 3. Metagame & Dynamics
**Progression & Difficulty:**
*   **Deterministic Level Design:** Boards are fully deterministic and do not rely on randomness to save the player. If a player fails, it is due to wrong sequencing or timing, demanding actual learning and improvement.
*   **Difficulty Scaling:** Early levels serve as relaxing time-killers, but the game quickly scales into intricate mazes and punishing difficulty spikes. Some late-game mechanics, like double blocks that consume two slots, make dexterity and timing mandatory.
*   **High Engagement:** Because the game demands focus rather than passive tapping, it concentrates engagement among highly invested players, resulting in an average of an hour of daily play across roughly 10 sessions.

## 4. Art & Audio Direction (Aesthetics)
**Visual Style:**
*   **Aesthetic:** The game utilizes a distinct pixel-art aesthetic for its puzzle blocks, providing a satisfying, "crunchy" cleanup feeling that sets it apart from 3D competitors.
*   **Character Design:** To maintain broad appeal, the game relies on familiar, cute, superhero-adjacent characters with cartoon proportions, primarily featuring pigs and cats.
*   **Haptic Feedback:** The game relies heavily on instant responsiveness; every tap and cleared pixel provides highly satisfying tactile and visual feedback.

## 5. Monetization Strategy
**Model:** Freemium (Ad-supported with In-App Purchases)
*   **Aggressive Advertising:** Ads are intentionally intrusive, heavily targeting invested players after level 20. Players face interstitials upon level failure and optionally after winning. 
*   **No Pay-to-Skip:** Rewarded ads are strictly limited to extra lives in the menu. The game deliberately refuses to offer rewarded shortcuts that bypass puzzle difficulty, protecting its core challenge loop.
*   **In-App Purchases (IAP):** The aggressive ad strategy exists to create pressure, actively driving highly-engaged players toward the "Remove Ads" IAP, which converts exceptionally well. Other monetized items include a "Golden Pass" and coin packages.

## 6. Marketing, Live-Ops, & UA
*   **Commercial Performance:** The game scaled exceptionally fast, reaching ~$500K daily revenue (approximately $180M yearly run rate) and ~200K daily downloads within four months of launch.
*   **User Acquisition (UA):** The game maintains healthy margins by diversifying its geographic mix (e.g., ~9% revenue from the US, 5% from the UK) rather than relying exclusively on high-CPI Tier-1 Western markets.
*   **Current Frictions & Threats:** Despite its high grossing position, the game suffers from a 'terrible' user sentiment profile due to critical bugs (loading screen freezes, constant crashes) and reported billing fraud regarding lost 'No Ads' purchases. Furthermore, rapid cloning by competitors (like *Color Pixel Shooter*) threatens its market share.
*   **Growth Levers:** Halting feature development to fix stability and billing bugs is an immediate priority. Long-term LTV growth could be supported by introducing meta-game expansions (like building/decorating) or competitive ammo-efficiency leaderboards to fend off rising competitors.
```