/*
 * Cypress test for vismapper component
 */

describe ('Vismapper component', () => {

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
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));
        assert.exists(cy.get('#Panel-scene'));

        // Check attributes
        cy.get('a-entity[babiaxr-vismapper]').invoke('attr', 'babiaxr-vismapper')
            .should('nested.include', {'ui': true})
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'height': 'size'});
    }); 
});

describe('Vismapper component examples (screenshot)', () => {
    
    it('Screenshot', () => {
        cy.visit('/examples/vismapper/simplebar_chart_querier/index.html');
        cy.wait(3000);
        cy.screenshot('vismapper');
    });
});