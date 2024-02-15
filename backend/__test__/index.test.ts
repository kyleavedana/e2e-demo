import request from "superwstest";
import { Inventory } from "../src";

describe("testing the endpoints", () => {
  afterEach(() => request.closeAll());

  it("should output successful response payload from purchase-coin after a buy order is placed", async () => {
    let response = await request("http://localhost:3100").get("/get-inventory");
    const inventory: Inventory[] = response.body;

    const { coinId } = inventory[0];
    const amount = 3;

    response = await request("http://localhost:3100")
      .post("/purchase-coin")
      .send({ coinId, amount });

    const status = response.body.success;
    expect(status).toEqual(true);
  });
});
