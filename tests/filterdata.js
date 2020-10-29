/*
 * Cypress test for filterdata component
 */

describe ('Filterdata component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity babiaxr-simplebarchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest; filter: name=David" babiaxr-vismapper="ui: true; x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-filterdata]'));
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));

        // Check attributes
        cy.get('a-entity[babiaxr-filterdata]').invoke('attr', 'babiaxr-filterdata')
            .should('nested.include', {'from': 'queriertest'})
            .should('nested.include', {'filter': 'name=David'});
    }); 
});
