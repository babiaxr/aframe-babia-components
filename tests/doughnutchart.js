/*
 * Cypress test for babiaxr-doughnutchart component
 */

describe ('BabiaXR-Doughnutchart component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'kbn_network','size':10},{'key':'Maria','size':5},{'key':'Dave','size':9},{'key':'Jhon','size':12},{'key':'Sara','size':16},{'key':'Lemar','size':2},{'key':'Dawn','size':1},{'key':'Jesus','size':8},{'key':'Bitergia','size':3},{'key':'URJC','size':6},{'key':'Alice','size':22},{'key':'Pete','size':2},{'key':'Seth','size':6},{'key':'Martin','size':9}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babiaxr-doughnutchart="legend: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-doughnutchart]'));
        // Check attributes
        cy.get('a-entity[babiaxr-doughnutchart]').invoke('attr', 'babiaxr-doughnutchart')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babiaxr-doughnutchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="slice: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-doughnutchart]'));
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));

        // Check attributes
        cy.get('a-entity[babiaxr-doughnutchart]').invoke('attr', 'babiaxr-vismapper')
            .should('nested.include', {'ui': false})
            .should('nested.include', {'slice': 'name'})
            .should('nested.include', {'height': 'size'});
    }); 
});

describe('BabiaXR-Doughnutchart component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Doughnutchart (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/doughnut_chart' + example + '/index.html');
            cy.wait(15000);
            cy.screenshot('doughnutchart' + example);
        });
    });
});