---
to: "tests/e2e/specs/<%= h.page(path) %>.e2e.js"
---

describe('<%= h.inflection.titleize(path.replace(/-/g, '_')) %>', () => {
  it('has the correct title', () => {
    cy.visit('<%= h.inflection.titleize(path.replace(/-/g, '_')) %>')
    cy.title().should('equal', 'Title')
  })
})
