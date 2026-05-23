### **Game Overview**
* **Title:** Arrow-Shooter
* **Genre:** Casual Puzzle
* **Platform:** Mobile (iOS / Android)
* **Resolution:** 1080x1920
* **Logline:** A hyper-casual block puzzle game where players tap on arrows on the grid to make them tour around the grid to get hit by shooters at the top.

---

### **Core Gameplay Loop**
1.  **Evaluate:** The player looks at the 8x8 (configurable) grid and there are shooters on top of the grid with bullets on them.
2.  **Place:** The player touches on an arrow which can move out to the conveyor around the grid without crashing on other arrows.
3.  **Clear & Score:** Arrows and shooters have colors. Shooters can only hit the arrows with the same color. Arrow length decreases when hit by a shooter. When an arrow disappears, player gets 10 points.
4.  **Repeat:** The player keeps touching on arrows to clear the entire board. The conveyor allows 5 arrows moving on it at a time. If none of the arrows are being hit and there are 5 arrows on conveyor, loop ends.

---

### **Mechanics**
* **The Grid:** An 8x8 (configurable) board. There are arrows with various lengths on it.
* **The Arrows:** Shapes made of connected colored lines. These lines doesnt have to be linear.
* **Spawn System:** Once the bullets on a shooter ends, new shooter from the queue is placed to shoot.
* **Arrow Clearing:** An arrow can only move to conveyor if it has a path to the conveyor. While the arrows move to the conveyor, they open up space for other arrows that could not get out before.
* **Fail State:** The game ends when there are 5 arrows on the conveyor and none of them are being hit.

---

### **Art Direction**
* **Visuals:** Clean, flat, and vibrant 3D UI. The background is typically dark to make the brightly colored arrows "pop" off the screen. 
* **Game Feel (Juice):** Clicking on arrows should feel tactile. Clearing lines should trigger satisfying particle effects and screen shake, emphasizing the destroy

---

### **Progression**
* **Progression:** There are no levels to beat. The primary motivation is intrinsically tied to beating personal high scores.