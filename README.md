# Snake Game

A simple browser-based Snake game built with React, TypeScript, and Tailwind CSS.

This repository is meant to be a fun public Symphony demo template. Fork it, create the demo issues, and let Symphony work through a more visual feature backlog than the canonical todo harness.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to play.

## Symphony Demo

Create the curated demo issues on your fork:

```bash
./scripts/create_issues.sh --label agent
```

That seeds a small backlog covering:

- a real gameplay bug
- a responsive layout issue
- a persistence feature
- two input/control improvements
- a cleanup/refactor task

The fixtures live in [fixtures/demo-issues.json](/home/mirekl/Symphony_Repositories/symphony-demo-snake/fixtures/demo-issues.json).

If you want to seed issues into a different repo name than the current `origin`, pass `--repo OWNER/REPO`.

## How to Play

- Click **Start** to begin
- Use **arrow keys** to control the snake
- Eat the red food to grow and score points
- Don't hit the walls or yourself!

## Tech Stack

- React 19
- TypeScript
- Tailwind CSS
- Vite

---

## TODOs

The following issues and improvements need to be addressed:

### Bugs

- [ ] Food can spawn on top of the snake body
- [ ] Player can queue multiple direction changes between ticks, causing the snake to reverse into itself
- [ ] The game grid is not responsive — it overflows on small screens

### Features

- [ ] Add a pause/resume button (and `Space` key binding)
- [ ] Add difficulty levels that increase the snake speed as the score grows
- [ ] Add WASD key support as alternative controls
- [ ] Add touch/swipe controls for mobile devices
- [ ] Add a persistent high score (save to localStorage)
- [ ] Add different food types with varying point values
- [ ] Add a "wall wrap" mode where the snake appears on the opposite side instead of dying

### Code Quality

- [ ] Extract game constants (grid size, cell size, speed) into a config file
- [ ] Extract game logic (movement, collision detection) out of the React component into a pure module
- [ ] Add unit tests for the game logic (collision detection, movement, food spawning)
- [ ] Add an ESLint + Prettier configuration

### Visual Polish

- [ ] Add smooth movement animation instead of grid-snapping
- [ ] Add a trailing effect or gradient to the snake body
- [ ] Add a particle effect when food is eaten
- [ ] Add sound effects (eating, game over)
- [ ] Improve the game over screen with a restart countdown

## Fixture Notes

The demo issues intentionally avoid broad redesign asks. They are small enough for a single Symphony run to handle, but varied enough to show gameplay fixes, polish, and refactoring.
