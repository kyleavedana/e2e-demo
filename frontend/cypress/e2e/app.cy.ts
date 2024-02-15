const BASEURL = "http://localhost:5173";
const COINOPTION = "CoinA";

describe("onLoad", () => {
  it("should begin with a $1000 USD balance", () => {
    cy.visit(BASEURL);
    cy.contains("div", "USD Balance: $").should((element) => {
      const textContent = element.text().trim();
      expect(textContent).to.equal("USD Balance: $1000");
    });
  });
  it("should have for coin options available", () => {
    cy.visit("http://localhost:5173/");
    cy.get(".ticket-name").should("have.length", 4);
    cy.checkUniqueInnerText(".ticket-name");
  });
});

describe("after buying three coins", () => {
  const buyCoins = async (coinOption: string) => {
    cy.get(".ticket-name")
      .contains(coinOption)
      .parent()
      .find("input")
      .type("3");
    cy.get(".ticket-name")
      .contains(coinOption)
      .parent()
      .contains("button", "Buy")
      .click();
  };

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
    cy.visit(BASEURL);
    await buyCoins(COINOPTION);
    cy.get(".inventory-item")
      .contains("div", COINOPTION)
      .parent()
      .then((parentElement) => {
        const coinsOwned = getValue(
          parentElement,
          { selector: "div", order: 1 },
          ["Coins owned: "]
        );
        expect(coinsOwned).to.equal(3);
      });
  });
  it("market value correctly reflects the cost per coin", async () => {
    cy.visit(BASEURL);
    await buyCoins(COINOPTION);

    cy.get(".ticket-name")
      .contains(COINOPTION)
      .parent()
      .then((parentElement) => {
        const price = getValue(
          parentElement,
          {
            selector: ".ticket-price",
          },
          [" / coins", "$"]
        );

        cy.get(".inventory-item")
          .contains("div", COINOPTION)
          .parent()
          .then((parentElement1) => {
            const coinsOwned = getValue(
              parentElement1,
              { selector: "div", order: 1 },
              ["Coins owned: "]
            );

            const marketValue = getValue(
              parentElement1,
              { selector: "div", order: 2 },
              ["Market value: $"]
            );

            if (typeof price !== "number") throw new Error("NaN");
            expect(marketValue).to.equal(coinsOwned * price);
          });
      });
  });
});
