# Hungry Shark - Playable Ad Game

A fast-paced arcade endless-survival game where you control a hungry shark in the ocean. Eat to survive, grow stronger, and achieve the highest score!

## Game Overview

- **Genre:** Arcade / Endless Survival / Action
- **Platform:** Mobile (iOS / Android) - Browser-based
- **Core Mechanic:** Control a constantly-moving shark, eat prey to maintain hunger and stay alive

## Features

### Gameplay
- **Movement Control:** Left-side joystick controls shark direction
- **Boost Button:** Right-side button for temporary speed boost
- **Hunger System:** Shark continuously loses hunger; must eat to survive
- **Health System:** Avoid enemies and hazards or take damage
- **Scoring System:** Earn points by eating various prey types
- **Gold Rush Mode:** Eat 12+ prey quickly to activate bonus scoring period (3x multiplier)

### Entities
- **Small Fish:** Common prey (1 point, restores 15 hunger)
- **Medium Fish:** Larger prey (5 points, restores 30 hunger)
- **Humans:** High-value targets (25 points, restores 50 hunger)
- **Jellyfish:** Dangerous - avoid or take 15 damage
- **Mines:** Hazardous obstacles - take 25 damage on contact
- **Coins:** Bonus collectibles (1 point each)

### UI Elements
- Health bar (top-left, red)
- Hunger bar (top-left, orange)
- Score display (top-center, large white text)
- Gold Rush meter (bottom-center, fills toward activation)
- Intro screen with Play button
- Game Over screen with final score and restart button
- Tutorial hand gesture (teaches joystick movement)

## Controls

| Action | Control |
|--------|---------|
| Move Shark | Left joystick (tap and drag) |
| Activate Boost | Right button (tap) |
| Play | Intro screen Play button |
| Restart | Game Over screen Restart button |

## Technical Details

### Architecture
- **Three.js 3D Engine** for rendering
- **Modular JavaScript** with separate concerns (movement, spawning, collision, UI)
- **Config-driven Design** (game-config.json) for easy tuning
- **Reusable Components** from centralized reusables folder

### Key Systems
- **Game Loop:** 60 FPS target with delta-time updates
- **Entity Management:** Spawning, updating, and collision detection
- **Camera:** Smooth follow of shark with zoom based on speed
- **UI:** Config-based HUD built from reusable components
- **Input:** Virtual joystick for movement, buttons for boost/play/restart

## Setup & Running

### Prerequisites
- Node.js and npm
- Local dev server (Vite)

### Installation
```bash
cd berkay/hungry-shark-4
npm install
```

### Development
```bash
npx vite --port 5000
# Open http://127.0.0.1:5000 in browser
```

### Build for Production
```bash
npm run build
```

## Game Configuration

Edit `src/config/game-config.json` to adjust:
- World dimensions and camera properties
- Shark starting stats (health, hunger, speed)
- Spawner settings (entity density, max counts)
- Scoring values (points per prey type)
- Gold Rush parameters (threshold, duration, multiplier)
- Hunger decay rate and damage thresholds
- Collision damage values

## File Structure

```
src/
├── js/
│   ├── main.js              # Entry point and game loop
│   ├── GameState.js         # Game state and reset logic
│   ├── SharkController.js   # Shark movement and physics
│   ├── Interaction.js       # Input handling (joystick, buttons)
│   ├── WorldBuilder.js      # World/environment setup
│   ├── EntityFactory.js     # Create game entities
│   ├── Spawner.js           # Spawn entities dynamically
│   ├── Collision.js         # Collision detection and responses
│   ├── HungerSystem.js      # Hunger decay and restoration
│   ├── CameraController.js  # Camera following logic
│   ├── GoldRush.js          # Gold Rush activation and effects
│   ├── Hud.js               # UI building and updates
│   └── Tutorial.js          # Tutorial hand gesture
├── config/
│   └── game-config.json     # Game settings and balancing
├── css/
│   └── style.css            # UI and layout styling
└── assets/
    └── hand.png             # Tutorial hand asset
```

## Gameplay Tips

1. **Stay Moving:** Hunger depletes constantly - keep eating to survive
2. **Avoid Hazards:** Jellyfish and mines deal damage
3. **Go for Gold:** Eat many prey quickly to activate Gold Rush for 3x score
4. **Use Boost Wisely:** Boost gives speed but has a cooldown
5. **Collect Coins:** Coins from eaten prey provide bonus points

## Performance

- **Target FPS:** 60 FPS on mobile devices
- **Entity Limit:** ~30 entities per type for smooth performance
- **Memory:** Efficient pooling and cleanup of entities

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Credits

Built with:
- Three.js for 3D rendering
- Reusable UI components from centralized library
- Vite for development and building

## Future Enhancements

- [ ] Audio system (bites, coin collection, Gold Rush theme)
- [ ] Advanced enemy AI (submarines with torpedoes)
- [ ] Shark progression/tier unlocks
- [ ] More entity types (dolphins, submarines, boats)
- [ ] Particle effects for eating and damage
- [ ] Leaderboards
- [ ] Daily missions and rewards
- [ ] Shark cosmetics/skins

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-30
