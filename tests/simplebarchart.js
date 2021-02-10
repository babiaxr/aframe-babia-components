/*
 * Cypress test for babiaxr-simplebarchart component
 */

describe ('BabiaXR-Simplebarchart component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'kbn_network','size':10},{'key':'Maria','size':5},{'key':'Dave','size':90},{'key':'Jhon','size':119},{'key':'Sara','size':16},{'key':'Lemar','size':2},{'key':'Dawn','size':1},{'key':'Jesus','size':8},{'key':'Bitergia','size':3},{'key':'URJC','size':6},{'key':'Alice','size':22},{'key':'Pete','size':2},{'key':'Seth','size':6},{'key':'Martin','size':9}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babiaxr-simplebarchart="legend: true; axis: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-simplebarchart]'));
        // Check attributes
        cy.get('a-entity[babiaxr-simplebarchart]').invoke('attr', 'babiaxr-simplebarchart')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babiaxr-simplebarchart="legend: true; axis: true; from: queriertest; x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-simplebarchart]'));

        // Check attributes
        cy.get('a-entity[babiaxr-simplebarchart]').invoke('attr', 'babiaxr-simplebarchart')
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'height': 'size'});
    }); 
});

describe('BabiaXR-Simplebarchart component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Simplebarchart (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/simplebar_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('simplebarchart' + example);
        });
    });
});