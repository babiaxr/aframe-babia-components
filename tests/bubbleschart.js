/*
 * Cypress test for babiaxr-Bubbleschart component
 */

describe ('BabiaXR-Bubbleschart component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'Andrea','key2':'2018','height':15,'radius':2},{'key':'Jesus','key2':'2018','height':3,'radius':5},{'key':'David','key2':'2021','height':5,'radius':1},{'key':'Jesus','key2':'2020','height':25,'radius':1},{'key':'Jesus','key2':'2021','height':10,'radius':4},{'key':'Andrea','key2':'2020','height':6,'radius':4},{'key':'David','key2':'2019','height':17,'radius':3}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babiaxr-bubbleschart="legend: true; axis: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-bubbleschart]'));
        // Check attributes
        cy.get('a-entity[babiaxr-bubbleschart]').invoke('attr', 'babiaxr-bubbleschart')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babiaxr-bubbleschart="legend: true; axis: true; from: queriertest; x_axis: name; z_axis: name2; height: size; radius: height"></a-entity>');
            Cypress.$(scene).append(chart); 
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-bubbleschart]'));

        // Check attributes
        cy.get('a-entity[babiaxr-bubbleschart]').invoke('attr', 'babiaxr-bubbleschart')
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'z_axis': 'name2'})
            .should('nested.include', {'height': 'size'})
            .should('nested.include', {'radius': 'height'});
    }); 
});

describe('BabiaXR-Bubbleschart component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Bubblesrchart (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/bubbles_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('bubbleschart' + example);
        });
    });
});