# Hungry Shark - Game Design Document (GDD)

## 1. Game Overview

### Title

Hungry Shark

### Genre

Arcade / Endless Survival / Action

### Platform

Mobile (iOS / Android)

### Core Gameplay Fantasy

The player controls a constantly moving shark in a large underwater world. The shark must continuously eat fish, sea creatures, humans, and other objects to survive, grow stronger, and achieve high scores while avoiding threats.

The gameplay is fast, chaotic, satisfying, and reward-driven.

---

# 2. Core Gameplay Loop

1. Spawn as a shark
2. Swim through the ocean
3. Eat smaller creatures and objects
4. Earn score and coins
5. Maintain hunger meter
6. Avoid mines, jellyfish, submarines, and larger enemies
7. Activate Gold Rush by eating enough prey
8. Survive as long as possible
9. Upgrade shark stats and unlock larger sharks
10. Repeat

---

# 3. Main Gameplay Mechanics

## 3.1 Shark Movement

### Controls

* Left side joystick controls movement direction
* Shark rotates toward movement direction
* Boost button increases movement speed temporarily

### Movement Behavior

* Shark always has forward momentum
* Turning is smooth and fluid
* Boost consumes energy meter
* Shark can move in all directions underwater

### Physics Feel

* Movement should feel heavy but responsive
* Shark has slight inertia
* Camera smoothly follows shark

---

# 4. Hunger System

## Hunger Meter

The shark constantly loses hunger over time.

### Rules

* Eating fills hunger meter
* If hunger reaches zero:

    * Shark slowly loses health
    * Eventually dies

### Design Purpose

Creates constant pressure to keep attacking and moving.

---

# 5. Eating System

## Edible Targets

### Small Fish

* One-bite prey
* Common
* Low score

### Medium Fish

* Require larger shark
* Higher score

### Humans

* Swim near surface
* High score value
* Blood effects when eaten

### Birds

* Fly above water
* Can be jumped at

### Boats

* Humans can fall into water
* Some boats attack player

### Sea Animals

Examples:

* Turtles
* Crabs
* Stingrays
* Dolphins
* Seals

### Enemy Sharks

* Smaller sharks can be eaten
* Larger sharks are dangerous

---

# 6. Shark Growth System

## Shark Sizes

Progression example:

1. Small Shark
2. Reef Shark
3. Hammerhead
4. Tiger Shark
5. Great White
6. Megalodon

Each shark tier:

* Larger size
* Higher health
* Faster eating
* Access to bigger prey
* Better destruction power

---

# 7. Gold Rush Mechanic

## Activation

Gold Rush activates after eating enough prey quickly.

## Effects

* Everything turns gold
* Bonus score multiplier
* Shark becomes extremely powerful
* Coins appear everywhere
* Music intensifies

## Visual Effects

* Golden lighting
* Strong particle effects
* Screen glow
* Fast-paced camera shake

---

# 8. Health System

## Damage Sources

* Mines
* Jellyfish
* Enemy sharks
* Harpoons
* Submarines
* Electric traps

## Health Recovery

* Eating restores health
* Larger prey restores more

---

# 9. Enemy Types

## Human Divers

* Swim underwater
* Some carry harpoons

## Submarines

* Fire torpedoes
* Patrol underwater

## Military Boats

* Shoot bullets
* Drop explosives

## Giant Creatures

* Boss-like threats
* Huge damage

---

# 10. Ocean World Design

## World Structure

Large open underwater map with depth variation.

### Areas

#### Surface Zone

* Boats
* Humans
* Birds
* Beaches

#### Coral Reef

* Dense fish population
* Bright colors

#### Open Ocean

* Large predators
* Deep blue atmosphere

#### Deep Sea

* Dark environment
* Dangerous creatures
* Rare rewards

#### Arctic Area

* Icebergs
* Seals
* Cold atmosphere

#### Sunken Ruins

* Treasure
* Hidden tunnels

---

# 11. Environment Interaction

## Breakable Objects

* Cages
* Wooden docks
* Small boats
* Barrels

## Explosive Objects

* Mines
* Fuel barrels

## Water Surface Interaction

* Shark can leap out of water
* Splash effects
* Wave simulation

---

# 12. Progression System

## Currency

Coins earned during gameplay.

## Upgrade Categories

### Bite

Increases attack power.

### Speed

Improves swimming speed.

### Boost

Increases boost duration.

### Health

Increases survivability.

---

# 13. Mission System

## Example Missions

* Eat 20 humans
* Survive 10 minutes
* Reach Gold Rush 5 times
* Destroy submarines
* Explore deep sea

Rewards:

* Coins
* Gems
* Shark unlocks

---

# 14. Collectibles

## Coins

Main progression currency.

## Gems

Premium currency.

## Treasure Chests

Hidden rewards around map.

## Letters

Collect letters to spell words for bonuses.

---

# 15. Cosmetic System

## Shark Skins

* Golden shark
* Robotic shark
* Zombie shark
* Fire shark

## Accessories

* Hats
* Lasers
* Jetpacks
* Armor

Accessories may provide gameplay bonuses.

---

# 16. Power-Ups

## Speed Boost

Temporary high speed.

## Invincibility

Ignore all damage briefly.

## Coin Magnet

Automatically attracts coins.

## Mega Bite

Can eat larger enemies.

---

# 17. Camera Design

## Camera Style

Third-person side-follow camera.

### Behavior

* Smooth tracking
* Slight zoom-out at high speed
* Dynamic shake during impacts
* Keeps shark centered

---

# 18. Visual Style

## Art Direction

Stylized arcade realism.

### Key Characteristics

* Bright underwater colors
* Exaggerated effects
* Large readable silhouettes
* Strong contrast

## Water Rendering

* Caustic lighting
* Fog underwater
* Bubbles
* Light rays

---

# 19. Audio Design

## Music

Fast-paced arcade soundtrack.

### Dynamic Audio

* Calm exploration music underwater
* Intense combat music during danger
* Special Gold Rush music

## Sound Effects

* Crunching bites
* Water splashes
* Explosions
* Shark roars
* Coin collection sounds

---

# 20. UI Design

## Gameplay HUD

### Elements

* Health bar
* Hunger bar
* Boost meter
* Coin counter
* Score
* Gold Rush meter

## Menu Screens

* Shark selection
* Upgrade screen
* Mission screen
* Store
* Settings

---

# 21. Monetization

## Free-to-Play Systems

### Ads

* Rewarded revive ads
* Bonus coin ads

### In-App Purchases

* Gems
* Shark packs
* Cosmetic skins

---

# 22. Technical Scene Setup (For 3D Engine Implementation)

## World Setup

### Environment

* Large underwater terrain
* Multiple depth layers
* Animated fish schools
* Dynamic lighting

## Shark Controller

* Rigidbody movement
* Smooth rotation interpolation
* Animation blending

## UI Implementation Constraints

All gameplay status bars (Health, Hunger, Boost, Gold Rush) must use screen-space UI anchored to the viewport edges and occupy 100% of the available screen width. Under no circumstances should these bars be rendered as partial-width widgets, centered panels, or floating UI elements.

## Spawn System

Continuously spawns:

* Fish
* Humans
* Boats
* Enemies
* Coins

Based on:

* Player location
* Current depth
* Shark level

---

# 23. Difficulty Scaling

Game difficulty increases over time.

## Scaling Parameters

* Faster enemy spawn
* More dangerous enemies
* Reduced food density
* Increased hazards

---

# 24. Retention Features

## Daily Rewards

Login streak rewards.

## Events

Limited-time sharks and missions.

## Leaderboards

Global high scores.

## Achievements

Long-term progression goals.

---

# 25. Target Player Experience

The player should feel:

* Powerful
* Fast
* Constantly hungry
* Rewarded for aggression
* Excited by chaos and destruction

The game should maintain nonstop momentum and satisfying feedback at all times.

---

# 26. Success Metrics

## KPI Targets

* High session replayability
* Short but addictive sessions
* Strong upgrade motivation
* Frequent reward feedback

---

# 27. Summary

Hungry Shark is an arcade survival experience focused on:

* Fluid underwater movement
* Constant eating and growth
* High-speed destruction
* Reward-heavy progression
* Chaotic action gameplay

The game succeeds by making the player feel like an unstoppable predator in a living underwater ecosystem.
