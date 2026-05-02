```markdown
# Game Design Document (GDD): Car Match - Traffic Puzzle

## 1. Concept and Overview
**Game Title:** Car Match - Traffic Puzzle
**Developer:** Grand Games A.Ş.
**Genre:** Casual Puzzle / Match-3 & Traffic Hybrid
**Platform:** Mobile (iOS, Android)
**Target Audience:** Casual gamers looking for a relaxing, visually stimulating, and mentally engaging short-session puzzle experience.
**Core Concept:** A stress-relieving puzzle game that combines traffic management with match-3 mechanics. Players strategically sort and line up cars to resolve traffic jams and clear complex puzzle boards.

## 2. Gameplay Mechanics
**Core Loop:**
*   **Tap to Collect:** The player taps on a car to move it into a limited-capacity holder (tray) at the bottom of the screen. 
*   **Match-3:** To clear cars from the board, players must match three cars of the same color within the holder.
*   **Strategic Movement:** Players can only collect cars that have at least one open edge. They must think ahead and plan their moves so they do not overfill the holder before making a match.

**Obstacles & Board Elements:**
*   **Static & Dynamic Obstacles:** Levels feature varied obstacles such as tunnels, boxes, brick walls, and elevators to increase difficulty.
*   **Hidden & Layered Vehicles:** Some mechanics include two-story garages where vehicles are loaded and slowly revealed to the player. Keys must also be collected to unlock specific side garages.
*   **Special Abilities:** Certain types of cars possess unique special abilities to help clear out the traffic jams. 

**Tactical Boosters:**
Players have access to a standard set of in-game power-ups to help them escape tight spots:
*   **Undo:** Reverts the previous move.
*   **Super Undo:** Allows the player to stash cars away for later use.
*   **Shuffle:** Rearranges the cars on the board.
*   **Magnet:** Automatically pulls matching cars to make clearing the board easier.

## 3. Metagame & Dynamics
**Progression & Difficulty:**
*   **Onboarding:** Instead of dragging players through long, restricted tutorials, the game rapidly unlocks the UI, all boosters, and the core menus almost immediately. The first 50 levels serve as a safe learning space with very low fail rates.
*   **Difficulty Scaling:** After the initial levels, the game introduces steep difficulty spikes with "Super Hard" and "Ultra Hard" levels. These bottlenecks challenge players and act as monetization drivers.

**Live-Ops & Events:**
The game heavily relies on auto-restarting, continuous metagame events inspired by the *Royal Match* and *Match Factory* templates:
*   **Daily Quests:** Includes tasks such as completing 7 consecutive levels to earn a bonus chest.
*   **Competitive Events:** Leaderboard-based tournaments like *Street Race* (collecting flags), *Canyon Road*, *Endless Coast*, and *Endless Loafer*.
*   **Progression Tracks:** *Skylift* (step-by-step milestones) and a Season/Battle Pass feature.

## 4. Art & Audio Direction (Aesthetics)
**Visual Style:**
*   **High Polish 3D Aesthetics:** The game relies on a vivid, bright, and modern graphical aesthetic. The high production quality sets it apart as a "premium" alternative to its competitors.
*   **Character Design (Cars):** The vehicles are heavily stylized and cute—resembling Pixar-style VW Beetles, Mini Coopers, BMWs, and Ferraris. They exhibit personality, such as opening their eyes when they are unblocked and ready to be tapped. 

## 5. Monetization Strategy
**Model:** Freemium (Ad-supported with In-App Purchases)
*   **In-App Purchases (IAP):** The game monetizes heavily through end-of-round continues (paying to maintain a win streak or bypass a failed level), premium currency sales, boosters, and a $0.99 starter pack.
*   **Advertising:** Players encounter mandatory interstitial ads that typically start around level 15 to 26. Rewarded ads are also available to gain extra lives and extend sessions. 
*   **Friction Points:** User sentiment analysis indicates that aggressive ad-loads and perceived "pay-to-win" difficulty spikes in later progression (past level 20) are the primary sources of player frustration.

## 6. Marketing & User Acquisition (UA)
*   **Targeting:** The game appeals to casual puzzle players aiming for a satisfying "clearing" mechanic.
*   **Current Challenges:** Despite having a 9/10 product polish, the UA strategy relies on a very small pool of creatives (mostly direct gameplay footage) which leads to high Cost Per Install (CPI) and difficulties in long-term scaling against giants in the puzzle genre.
*   **Growth Levers:** To improve long-term retention and UA, the introduction of a broader variety of marketing creatives (UGC, AI-variations) and deeper meta-progression systems (e.g., city building or extensive car customization) are recommended. 
```