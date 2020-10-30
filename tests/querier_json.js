/*
 * Cypress test for querier_json component
 */

describe ('Quierier_JSON component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity babiaxr-simplebarchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="ui: true; x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));

        // Check attributes
        cy.get('a-entity[babiaxr-querier_json]').invoke('attr', 'babiaxr-querier_json')
            .should('nested.include', {'url': './data.json'});
    }); 
});

describe('Querier_JSON component examples (screenshot)', () => {
    

    ['json_url'].forEach((example) => {
        it(`Screenshot Querier ${example} Example`, () => {
            cy.visit('/examples/others/querier_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('querier_' + example);
        });
    });

    ['_querier'].forEach((example) => {
        it(`Screenshot Mutiples Charts (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/multichart' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('multichart' + example);
        });
    });

});