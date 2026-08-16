const express = require("express");
const path = require("path");
const { board, chanceCards } = require("./board-data");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// In-memory game save slots (simple full-stack persistence demo)
const savedGames = {};

// GET the board layout (Indian cities, prices, rents)
app.get("/api/board", (req, res) => {
  res.json({ board, chanceCards });
});

// Draw a random chance card
app.get("/api/chance", (req, res) => {
  const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
  res.json(card);
});

// Save a game state under a room code
app.post("/api/game/:room", (req, res) => {
  const { room } = req.params;
  savedGames[room] = { state: req.body, savedAt: Date.now() };
  res.json({ ok: true, room });
});

// Load a game state
app.get("/api/game/:room", (req, res) => {
  const { room } = req.params;
  const saved = savedGames[room];
  if (!saved) return res.status(404).json({ ok: false, error: "No saved game found" });
  res.json({ ok: true, ...saved });
});

app.listen(PORT, () => {
  console.log(`Business 3D Game server running at http://localhost:${PORT}`);
});
