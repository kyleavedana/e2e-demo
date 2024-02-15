describe("onLoad", () => {
  it("should begin with a $1000 USD balance", () => {
    cy.visit("http://localhost:5173");
    cy.contains("div", "USD Balance: $").should((element) => {
      const textContent = element.text().trim();
      expect(textContent).to.equal("USD Balance: $1000");
    });
  });
  it("should have for coin options available", () => {
    cy.visit("http://localhost:5173/");
    cy.get(".ticket-name").should("have.length", 4);
    cy.get(".ticket-name").then((elements) => {
      const textSet = new Set<string>();
      elements.each((index, element) => {
        const innerText = Cypress.$(element).text().trim();
        expect(textSet.has(innerText)).to.be.false;
        textSet.add(innerText);
      });
    });
  });
});

describe("after buying three coins", () => {
  it("coins owned has incremented by the quantity provided", () => {
    cy.visit("http://localhost:5173/");
    cy.get(".ticket-name").contains("CoinA").parent().find("input").type("3");
    cy.get(".ticket-name")
      .contains("CoinA")
      .parent()
      .contains("button", "Buy")
      .click();
    cy.get(".inventory-item")
      .contains("div", "CoinA")
      .parent()
      .then((parentElement) => {
        const coinsOwned = parentElement.find("div").eq(1).text().trim();
        expect(coinsOwned).to.equal("Coins owned: 3");
      });
  });
});
