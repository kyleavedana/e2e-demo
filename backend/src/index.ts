import { Express, Request, Response, json } from "express";
import cors from "cors";
import WebSocket from "ws";

const app: Express = require("express")();
const port = process.env.PORT || 3100;

export interface Coin {
  id: number;
  name: string;
  price: number;
}

export interface Inventory {
  coinId: number;
  amountOwned: number;
}

let time = 0;
const coins: Coin[] = [];
const inventory: Inventory[] = [];

const resetData = () => {
  time = 0;
  coins.length = 0;
  coins.push(
    { id: 1, name: "USD", price: 1 },
    { id: 2, name: "CoinA", price: 100 },
    { id: 3, name: "CoinB", price: 100 },
    { id: 4, name: "CoinC", price: 100 },
    { id: 5, name: "CoinD", price: 100 }
  );
  inventory.length = 0;
  inventory.push(
    { coinId: 1, amountOwned: 1000 },
    { coinId: 2, amountOwned: 0 },
    { coinId: 3, amountOwned: 0 },
    { coinId: 4, amountOwned: 0 },
    { coinId: 5, amountOwned: 0 }
  );
};

const getAllData = () => JSON.stringify({ coins, inventory, time });

resetData();

const updateCoins = () => {
  time++;
  // Price changes randomly
  coins[1].price += Math.round(Math.random() * 10 - 5);
  // Price always grows forever by 1
  coins[2].price += 1;
  // Price surges to 200 but crashes immediately back to 100
  coins[3].price += coins[3].price < 200 ? 10 : -100;
  // Price changes based on how many of this coin you currently own
  // If you own an even number then the price doubles, if odd, the price halves
  coins[4].price = Math.round(
    coins[4].price * (inventory[4].amountOwned % 2 === 0 ? 2 : 0.5)
  );
};

app.use(cors()); // Enable CORS for all routes
app.use(json()); // Add this line to parse JSON request bodies

app.get("/get-coins", (req: Request, res: Response) => {
  res.json(coins);
});

app.get("/get-inventory", (req: Request, res: Response) => {
  res.json(inventory);
});

app.post("/purchase-coin", (req: Request, res: Response) => {
  const coinId = req.body.coinId;
  const amount = req.body.amount;

  // Find the coin in the coins array
  const coin = coins.find((c) => c.id === coinId);

  if (!coin) {
    return res.status(404).json({ error: "Coin not found" });
  }

  // Calculate the total price
  const totalPrice = coin.price * amount;

  // Check if the user has enough balance
  const userBalance = inventory.find((c) => c.coinId === 1)?.amountOwned || 0;
  if (totalPrice > userBalance) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // If selling, check we have enough of that coin to sell
  if (
    amount < 0 &&
    inventory.find((c) => c.coinId === coinId)!.amountOwned < Math.abs(amount)
  ) {
    return res.status(400).json({ error: "Not enough coins to sell" });
  }

  // Deduct the purchased amount from the user's balance
  inventory.find((c) => c.coinId === 1)!.amountOwned -= totalPrice;

  // Add the purchased coins to the user's inventory
  const existingCoin = inventory.find((c) => c.coinId === coinId);
  if (existingCoin) {
    existingCoin.amountOwned += amount;
  } else {
    inventory.push({ coinId, amountOwned: amount });
  }

  res.json({ success: true, inventory });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Start the client to view SDET Test");
});

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws: WebSocket) => {
  resetData();

  // Send initial coin prices to the client
  ws.send(getAllData());

  // Simulate price updates every 5 seconds
  const priceUpdateInterval = setInterval(() => {
    updateCoins();
    ws.send(getAllData());
  }, 5000);

  ws.on("close", () => {
    clearInterval(priceUpdateInterval);
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});
