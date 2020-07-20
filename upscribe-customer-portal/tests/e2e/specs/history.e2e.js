
describe('History', () => {
  it('has the correct title', () => {
    cy.visit('History')
    cy.title().should('equal', 'Title')
  })
})
