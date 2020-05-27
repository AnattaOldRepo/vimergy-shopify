
describe('Cancel', () => {
  it('has the correct title', () => {
    cy.visit('Cancel')
    cy.title().should('equal', 'Title')
  })
})
