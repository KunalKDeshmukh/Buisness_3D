# 🏙️ Business 3D — Indian Cities Edition

A full-stack 3D "Business" board game (the Indian version of Monopoly), featuring
Indian cities as properties, a Three.js 3D board with animated dice, and a
Node.js/Express backend.

## Tech Stack
- **Backend:** Node.js + Express (serves the board/city data via a REST API, draws
  Chance cards, and stores saved games in memory)
- **Frontend:** Three.js (3D board, tiles, tokens, animated dice), vanilla JS game
  logic, plain HTML/CSS UI overlay

## Features
- 2–6 player hotseat multiplayer
- 3D board built from real Indian cities: Mumbai, Delhi, Bengaluru, Chennai,
  Kolkata, Hyderabad, Pune, Jaipur, Lucknow, Ahmedabad, and more — grouped into
  color sets like the original board game
- Animated rolling 3D dice
- Buy properties, collect rent, pay tax, draw Chance cards
- Bankruptcy and win detection
- Orbit camera (drag to rotate, scroll to zoom)

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser to:
   ```
   http://localhost:3000
   ```
4. Add 2–6 players, click **Start Game**, and take turns clicking **Roll Dice**
   on the same screen (pass-and-play / hotseat style).

## Project Structure
```
business-game/
├── package.json
├── server/
│   ├── server.js        # Express server + REST API
│   └── board-data.js    # Indian city board layout, prices, rents, Chance cards
└── public/
    ├── index.html        # Page shell + UI overlay
    ├── style.css         # Styling
    └── game.js            # Three.js 3D scene + full game logic
```

## API Endpoints
- `GET  /api/board` — returns the board layout (cities, prices, rents) and Chance card deck
- `GET  /api/chance` — draws a random Chance card
- `POST /api/game/:room` — saves a game state snapshot in memory
- `GET  /api/game/:room` — loads a previously saved game state

## Customizing
Edit `server/board-data.js` to change city names, prices, rents, or add more
Chance cards — the frontend pulls everything dynamically from the API, so no
frontend changes are needed for basic data tweaks.
