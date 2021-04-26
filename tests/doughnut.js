/*
 * Cypress test for babia-doughnut component
 */

describe ('Babia-Doughnut component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'kbn_network','size':10},{'key':'Maria','size':5},{'key':'Dave','size':9},{'key':'Jhon','size':12},{'key':'Sara','size':16},{'key':'Lemar','size':2},{'key':'Dawn','size':1},{'key':'Jesus','size':8},{'key':'Bitergia','size':3},{'key':'URJC','size':6},{'key':'Alice','size':22},{'key':'Pete','size':2},{'key':'Seth','size':6},{'key':'Martin','size':9}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babia-doughnut="legend: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-doughnut]'));
        // Check attributes
        cy.get('a-entity[babia-doughnut]').invoke('attr', 'babia-doughnut')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babia-doughnut="legend: true; axis: true; from: queriertest; key: name; size: size" babia-filter="from: queriertest" babiaxr-vismapper="slice: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-queryjson]'));
        assert.exists(cy.get('a-entity[babia-doughnut]'));

        // Check attributes
        cy.get('a-entity[babia-doughnut]').invoke('attr', 'babia-doughnut')
            .should('nested.include', {'key': 'name'})
            .should('nested.include', {'size': 'size'});
    }); 
});

describe('BabiaXR-Doughnut component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Doughnut (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/doughnut' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('doughnut' + example);
        });
    });
});