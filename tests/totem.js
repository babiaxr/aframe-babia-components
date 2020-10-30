/*
 * Cypress test for totem component
 */

describe ('Totem component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity id="bars" babiaxr-simplebarchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="ui: true; x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart);
            let totem = Cypress.$('<a-entity babiaxr-totem="charts_id: [{id: bars, type: babiaxr-simplebarchart}]; data_list: [{data: Data 1, path: ./data.json}]"></a-entity>');
            Cypress.$(scene).append(totem);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-totem]'));

        // Check attributes
        cy.get('a-entity[babiaxr-totem]').invoke('attr', 'babiaxr-totem')
            .should('nested.include', {'charts_id': '[{id: bars, type: babiaxr-simplebarchart}]'})
            .should('nested.include', {'data_list': '[{data: Data 1, path: ./data.json}]'});
    }); 
});

describe('Totem component examples (screenshot)', () => {
    
    ['1', '1_querier', '2', '2_querier'].forEach((example) => {
        it(`Screenshot Totem ${example} Example`, () => {
            cy.visit('/examples/totems/totem_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('totem_' + example);
        });
    });

});