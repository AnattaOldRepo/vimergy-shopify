
describe('One Time Product Add', () => {
  it('has the correct title', () => {
    cy.visit('One Time Product Add')
    cy.title().should('equal', 'Title')
  })
})
