/*
 * Cypress test for terrain component
 */

describe ('Terrain component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {    
            // Add components
            let data = Cypress.$('<a-entity babiaxr-terrain= " width: 20; height: 20; segmentsHeight: 1; segmentsWidth: 1; data: 0, 3, 6"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-terrain]'));

        // Check attributes
        cy.get('a-entity[babiaxr-terrain]').invoke('attr', 'babiaxr-terrain')
            .should('nested.include', {'width': 20})
            .should('nested.include', {'height': 20})
            .should('nested.include', {'segmentsHeight': 1})
            .should('nested.include', {'segmentsWidth': 1});
    }); 
});

describe('Terrain component examples (screenshot)', () => {

    ['basic', 'filled'].forEach((example) => {
        it(`Screenshot Elevation ${example} Example`, () => {
            cy.visit('/examples/elevation/elevation ' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('elevation_' + example);
        });
    });

});