describe("onLoad", () => {
  it("should begin with a $1000 USD balance", () => {
    cy.visit("http://localhost:5173");
    cy.contains("div", "USD Balance: $").should((element) => {
      const textContent = element.text().trim();
      expect(textContent).to.equal("USD Balance: $1000");
    });
  });
});
