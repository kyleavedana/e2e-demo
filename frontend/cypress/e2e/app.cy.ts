const BASEURL = "http://localhost:5173";
const COINOPTION = "CoinA";
const COINQUANTITY = 3;
const classes = {
  ticketName: ".ticket-name",
  inventoryItem: ".inventory-item",
};

describe("onLoad", () => {
  it("should begin with a $1000 USD balance", () => {
    // Go to homepage
    cy.visit(BASEURL);
    // Check USD Balance
    cy.contains("div", "USD Balance: $").should((element) => {
      const textContent = element.text().trim();
      expect(textContent).to.equal("USD Balance: $1000");
    });
  });
  it("should have for coin options available", () => {
    // Go to homepage
    cy.visit(BASEURL);
    // Check length of coin options
    cy.get(classes.ticketName).should("have.length", 4);
    // Check if all options are unique
    cy.checkUniqueInnerText(classes.ticketName);
  });
});

describe("after buying three coins", () => {
  /**
   *
   * A simple function for coin purchase
   * @param {string} coinOption e.g. CoinA, CoinB, etc.
   *
   */
  const buyCoins = async (coinOption: string) => {
    cy.get(classes.ticketName)
      .contains(coinOption)
      .parent()
      .find("input")
      .type(`${COINQUANTITY}`);
    cy.get(classes.ticketName)
      .contains(coinOption)
      .parent()
      .contains("button", "Buy")
      .click();
  };

  /**
   * Gets the value of a number as part of text of an element within a parent
   *
   * @param {JQuery<HTMLElement>} parentElement
   * @param {{
   *       selector?: string;
   *       order?: number;
   *     }} {
   *       selector,
   *       order,
   *     }
   * @param {string[]} stringsToRemove Replace all matched strings with empty string
   * @return {*}  {number}
   */
  const getValue = (
    parentElement: JQuery<HTMLElement>,
    {
      selector,
      order,
    }: {
      selector?: string;
      order?: number;
    },
    stringsToRemove: string[]
  ): number => {
    let element = parentElement;
    if (selector.trim() !== "") {
      element = element.find(selector);
    }
    if (order) {
      element = element.eq(order);
    }
    let stringValue = element.text().trim();
    if (Array.isArray(stringsToRemove) && stringsToRemove.length) {
      stringsToRemove.forEach((item) => {
        stringValue = stringValue.replace(item, "");
      });
    }
    const numberValue = parseInt(stringValue);
    return numberValue;
  };

  it("coins owned has incremented by the quantity provided", async () => {
    // Go to homepage
    cy.visit(BASEURL);
    // Purchase coins
    await buyCoins(COINOPTION);
    // Get coins owned
    cy.get(classes.inventoryItem)
      .contains("div", COINOPTION)
      .parent()
      .then(async (parentElement) => {
        const coinsOwned = getValue(
          parentElement,
          { selector: "div", order: 1 },
          ["Coins owned: "]
        );
        expect(coinsOwned).to.equal(COINQUANTITY);
        await buyCoins(COINOPTION);
        // Get new coins owned
        const newCoinsOwned = getValue(
          parentElement,
          { selector: "div", order: 1 },
          ["Coins owned: "]
        );
        expect(newCoinsOwned).to.equal(COINQUANTITY * 2);
      });
  });
  it("market value correctly reflects the cost per coin", async () => {
    // Go to homepage
    cy.visit(BASEURL);
    // Purchase coins
    await buyCoins(COINOPTION);

    cy.get(classes.ticketName)
      .contains(COINOPTION)
      .parent()
      .then((parentElement) => {
        // Get ticket price
        const price = getValue(
          parentElement,
          {
            selector: ".ticket-price",
          },
          [" / coins", "$"]
        );

        cy.get(classes.inventoryItem)
          .contains("div", COINOPTION)
          .parent()
          .then((parentElement1) => {
            // Get coins owned
            const coinsOwned = getValue(
              parentElement1,
              { selector: "div", order: 1 },
              ["Coins owned: "]
            );
            // Get market value
            const marketValue = getValue(
              parentElement1,
              { selector: "div", order: 2 },
              ["Market value: $"]
            );
            // Validate
            if (typeof price !== "number") throw new Error("NaN");
            expect(marketValue).to.equal(coinsOwned * price);
          });
      });
  });
});
