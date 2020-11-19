/*
 * Cypress test for codecity component
 */

describe ('Codecity component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {

            // Add components
            let data = Cypress.$('<a-entity position="0 0 -3" babiaxr-codecity="width: 20; depth: 20; streets: true; color: green; extra: 1.5; base_thick: 0.3; split: naive; fmaxarea: area"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-codecity]'));

        // Check attributes
        cy.get('a-entity[babiaxr-codecity]').invoke('attr', 'babiaxr-codecity')
            .should('nested.include', {'width': 20})
            .should('nested.include', {'depth': 20})
            .should('nested.include', {'streets': 'true'})
            .should('nested.include', {'color': 'green'})
            .should('nested.include', {'extra': 1.5})
            .should('nested.include', {'base_thick': 0.3})
            .should('nested.include', {'split': 'naive' })
            .should('nested.include', {'fmaxarea': 'area'});
    }); 
});

describe('Codecity component examples (screenshot)', () => {

    ['basic', 'time_evolution_angular', 'perceval', 'sortinghat'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/codecityjs/' + example + '/index.html');
            cy.wait(8000);
            cy.screenshot('codecity_'+ example);
        });
    });

});