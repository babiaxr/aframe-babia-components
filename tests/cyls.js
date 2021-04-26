/*
 * Cypress test for babia-cyls component
 */

describe ('babia-cyls component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'Andrea','height':20,'radius':4},{'key':'Jesus','height':40,'radius':2},{'key':'David','height':30,'radius':1},{'key':'David','height':20,'radius':3}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babia-cyls="legend: true; axis: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-cyls]'));
        // Check attributes
        cy.get('a-entity[babia-cyls]').invoke('attr', 'babia-cyls')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babia-cyls="legend: true; axis: true;from: queriertest; x_axis: name; height: size; radius: height"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-queryjson]'));
        assert.exists(cy.get('a-entity[babia-cyls]'));

        // Check attributes
        cy.get('a-entity[babia-cyls]').invoke('attr', 'babia-cyls')
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'height': 'size'})
            .should('nested.include', {'radius': 'height'});
    }); 
});

describe('Babia-Cyls component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Cyls (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/cyls' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('cyls' + example);
        });
    });
});