/*
 * Cypress test for babia-bars component
 */

describe ('Babia-Bars component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = `[{"key":"Network","size":10},{"key":"Door","size":5}],
            {"key":"Table","size":90},{"key":"Node","size":119},{"key":"Cable","size":16},
            {"key":"Cloud","size":2},{"key":"Sky","size":1},{"key":"Portrait","size":8},
            {"key":"Chair","size":3},{"key":"Computer","size":6},{"key":"Alias","size":22},
            {"key":"Armchair","size":2},{"key":"Radio","size":6},{"key":"Kangaroo","size":9}]`;
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$("<a-entity babia-bars='legend: true; axis: true; data: "+ data + "' ></a-entity>");
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-bars]'));
        // Check attributes
        cy.get('a-entity[babia-bars]').invoke('attr', 'babia-bars')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babia-bars="legend: true; axis: true; from: queriertest; x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-queryjson]'));
        assert.exists(cy.get('a-entity[babia-bars]'));

        // Check attributes
        cy.get('a-entity[babia-bars]').invoke('attr', 'babia-bars')
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'height': 'size'});
    }); 

    /*
     * Id cannot have spaces, so an implementation that converts keys
       to spaces doesn't work. When we fixed this, we added this test
       to avoid regression.
     */
    it ('Creation with keys which cannot be ids', () => {
        let data = '[{"x_axis":"Name with spaces","height":10},{"x_axis":"Maria","height":5}]';
        let bars = `<a-entity babia-bars='x_axis: key; data: ${data}'></a-entity>`
        console.log("Bars: ", bars)
        // Add components
            cy.get('a-scene').then(scene => {
            let chart = Cypress.$(bars);
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-bars]'));
        // Check bars created
        cy.get('[babia-bar]').should('have.length', 2);
        // Change data for babia-bars
        cy.get('[babia-bars]')
          .invoke('attr', 'babia-bars', 'data: [{"x_axis":"Name with spaces","height":7}]')
          // Check bars created
        cy.get('[babia-bar]').should('have.length', 2);
    });

});

describe('Babia-bars component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Bars (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/bars' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('bars' + example);
        });
    });
});