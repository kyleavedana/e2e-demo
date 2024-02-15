import request from "superwstest";
import { Inventory, Coin } from "../src";

const DOMAIN = "localhost:3100";

describe("testing the endpoints", () => {
  afterEach(() => request.closeAll());

  it("should output successful response payload from purchase-coin after a buy order is placed", async () => {
    let response = await request(`http://${DOMAIN}`).get("/get-inventory");
    const inventory: Inventory[] = response.body;

    const { coinId } = inventory[0];
    const amount = 3;

    response = await request(`http://${DOMAIN}`)
      .post("/purchase-coin")
      .send({ coinId, amount });

    const status = response.body.success;
    expect(status).toEqual(true);
  });
});

describe("testing the websocket", () => {
  afterEach(() => request.closeAll());

  it("test that CoinB increments by one dollar with each message over a period of time", async () => {
    await request("ws://localhost:3100")
      .ws("/")
      .expectJson((data) => {
        const result: {
          coins: Coin[];
          inventory: Inventory[];
          time: number;
        } = data;

        const coinB = result.coins.find((coin) => coin.name === "CoinB");

        expect(coinB?.price).toEqual(100);
      })
      .wait(5000)
      .expectJson((data) => {
        const result: {
          coins: Coin[];
          inventory: Inventory[];
          time: number;
        } = data;

        const coinB = result.coins.find((coin) => coin.name === "CoinB");

        expect(coinB?.price).toEqual(101);
      });
  }, 10000);

  it("test that `inventory.<coinId>.amountOwned` correctly reflects inventory following a `purchase-coin` execution", async () => {
    await request("ws://localhost:3100")
      .ws("/")
      .expectJson()
      .exec(async () => {
        let response = await request(`http://${DOMAIN}`).get("/get-inventory");
        const inventory: Inventory[] = response.body;

        const { coinId } = inventory[1];
        const amount = 3;

        response = await request(`http://${DOMAIN}`)
          .post("/purchase-coin")
          .send({ coinId, amount });
      })
      .wait(5000)
      .expectJson((data) => {
        const result: {
          coins: Coin[];
          inventory: Inventory[];
          time: number;
        } = data;
        const amountOwned = result.inventory[1].amountOwned;
        expect(amountOwned).toEqual(3);
      });
  }, 10000);
});
