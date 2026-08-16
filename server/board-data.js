// Indian "Business" game board - 28 tiles going around a square track
// Tile types: start, city, chance, tax, jail, parking
const board = [
  { id: 0, type: "start", name: "START", info: "Collect ₹2000 on passing" },

  { id: 1, type: "city", name: "Jaipur", group: "pink", price: 600, rent: 40, color: "#e91e8c" },
  { id: 2, type: "city", name: "Lucknow", group: "pink", price: 600, rent: 40, color: "#e91e8c" },
  { id: 3, type: "chance", name: "Chance" },
  { id: 4, type: "city", name: "Patna", group: "pink", price: 800, rent: 60, color: "#e91e8c" },
  { id: 5, type: "tax", name: "Income Tax", amount: 200 },
  { id: 6, type: "city", name: "Bhopal", group: "cyan", price: 1000, rent: 80, color: "#00bcd4" },
  { id: 7, type: "city", name: "Indore", group: "cyan", price: 1000, rent: 80, color: "#00bcd4" },

  { id: 8, type: "jail", name: "Just Visiting" },

  { id: 9, type: "city", name: "Ahmedabad", group: "orange", price: 1200, rent: 100, color: "#ff9800" },
  { id: 10, type: "city", name: "Surat", group: "orange", price: 1200, rent: 100, color: "#ff9800" },
  { id: 11, type: "chance", name: "Chance" },
  { id: 12, type: "city", name: "Pune", group: "orange", price: 1400, rent: 120, color: "#ff9800" },
  { id: 13, type: "city", name: "Nagpur", group: "yellow", price: 1600, rent: 140, color: "#ffc107" },
  { id: 14, type: "city", name: "Chennai", group: "yellow", price: 1600, rent: 140, color: "#ffc107" },
  { id: 15, type: "city", name: "Hyderabad", group: "yellow", price: 1800, rent: 160, color: "#ffc107" },

  { id: 16, type: "parking", name: "Free Parking" },

  { id: 17, type: "city", name: "Kolkata", group: "green", price: 2000, rent: 180, color: "#4caf50" },
  { id: 18, type: "city", name: "Kochi", group: "green", price: 2000, rent: 180, color: "#4caf50" },
  { id: 19, type: "chance", name: "Chance" },
  { id: 20, type: "city", name: "Bengaluru", group: "green", price: 2200, rent: 200, color: "#4caf50" },
  { id: 21, type: "tax", name: "Luxury Tax", amount: 300 },
  { id: 22, type: "city", name: "Delhi", group: "blue", price: 2500, rent: 250, color: "#3f51b5" },
  { id: 23, type: "city", name: "Gurgaon", group: "blue", price: 2600, rent: 260, color: "#3f51b5" },

  { id: 24, type: "jail", name: "Go To Jail" },

  { id: 25, type: "city", name: "Chandigarh", group: "red", price: 2800, rent: 280, color: "#f44336" },
  { id: 26, type: "chance", name: "Chance" },
  { id: 27, type: "city", name: "Mumbai", group: "red", price: 3000, rent: 300, color: "#f44336" },
];

const chanceCards = [
  { text: "Metro fare rebate! Collect ₹100", amount: 100 },
  { text: "Traffic challan fine. Pay ₹150", amount: -150 },
  { text: "Diwali bonus! Collect ₹300", amount: 300 },
  { text: "Property tax due. Pay ₹200", amount: -200 },
  { text: "You won a business award! Collect ₹250", amount: 250 },
  { text: "Repairs on your properties. Pay ₹100", amount: -100 },
  { text: "IPL sponsorship deal! Collect ₹400", amount: 400 },
  { text: "Donation to charity. Pay ₹50", amount: -50 },
];

module.exports = { board, chanceCards };
