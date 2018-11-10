describe('Smoke Test', () => {
  it('Makes sure the Projects app starts', () => {
    cy.visit('http://localhost:3333').contains('Projects')
  })
})
