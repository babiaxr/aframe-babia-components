/*
 * Cypress test for babiaxr-3dcylinderchart component
 */

describe ('BabiaXR-Cylinderchart component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'Andrea','height':20,'radius':4},{'key':'Jesus','height':40,'radius':2},{'key':'David','height':30,'radius':1},{'key':'David','height':20,'radius':3}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babiaxr-cylinderchart="legend: true; axis: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-cylinderchart]'));
        // Check attributes
        cy.get('a-entity[babiaxr-cylinderchart]').invoke('attr', 'babiaxr-cylinderchart')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babiaxr-cylinderchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="x_axis: name; height: size; radius: height"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-cylinderchart]'));
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));

        // Check attributes
        cy.get('a-entity[babiaxr-cylinderchart]').invoke('attr', 'babiaxr-vismapper')
            .should('nested.include', {'ui': false})
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'height': 'size'})
            .should('nested.include', {'radius': 'height'});
    }); 
});

describe('BabiaXR-Cylinderchart component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Cylinderchart (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/cylinder_chart' + example + '/index.html');
            cy.wait(15000);
            cy.screenshot('cylinderchart' + example);
        });
    });
});