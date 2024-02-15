describe("onLoad", () => {
  it("should begin with a $1000 USD balance", () => {
    cy.visit("http://localhost:5173");
  });
});
