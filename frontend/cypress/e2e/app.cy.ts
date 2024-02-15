const BASEURL = "http://localhost:5173";

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
  const buyCoins = async () => {
    cy.get(".ticket-name").contains("CoinA").parent().find("input").type("3");
    cy.get(".ticket-name")
      .contains("CoinA")
      .parent()
      .contains("button", "Buy")
      .click();
  };

  it("coins owned has incremented by the quantity provided", async () => {
    cy.visit(BASEURL);
    await buyCoins();
    cy.get(".inventory-item")
      .contains("div", "CoinA")
      .parent()
      .then((parentElement) => {
        const coinsOwned = parentElement.find("div").eq(1).text().trim();
        expect(coinsOwned).to.equal("Coins owned: 3");
      });
  });
  it("market value correctly reflects the cost per coin", async () => {
    cy.visit(BASEURL);
    await buyCoins();

    cy.get(".ticket-name")
      .contains("CoinA")
      .parent()
      .then((parentElement1) => {
        let price: string | number = parentElement1
          .find(".ticket-price")
          .text()
          .trim()
          .replace(" / coins", "")
          .replace("$", "");
        price = parseInt(price);

        cy.get(".inventory-item")
          .contains("div", "CoinA")
          .parent()
          .then((parentElement) => {
            let coinsOwned: string | number = parentElement
              .find("div")
              .eq(1)
              .text()
              .trim()
              .replace("Coins owned: ", "");
            coinsOwned = parseInt(coinsOwned);

            let marketValue: string | number = parentElement
              .find("div")
              .eq(2)
              .text()
              .trim()
              .replace("Market value: $", "");
            marketValue = parseInt(marketValue);

            if (typeof price !== "number") throw new Error("NaN");
            expect(marketValue).to.equal(coinsOwned * price);
          });
      });
  });
});
