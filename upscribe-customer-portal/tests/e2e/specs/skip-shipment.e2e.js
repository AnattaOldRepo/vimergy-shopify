
describe('Skip Shipment', () => {
  it('has the correct title', () => {
    cy.visit('Skip Shipment')
    cy.title().should('equal', 'Title')
  })
})
