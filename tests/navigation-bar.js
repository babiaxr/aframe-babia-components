/*
 * Cypress test for navigator-bar component
 */

describe ('Navigation Bar component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babia-queryjson="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity id="bar" babiaxr-simplebarchart="legend: true; axis: true" babia-filter="from: queriertest" babiaxr-vismapper="x_axis: name; height: size"></a-entity>');
            Cypress.$(scene).append(chart);
            let bar = Cypress.$('<a-entity babiaxr-navigation-bar = "size: 5; to: right; points_by_line: 1; commits: [{date: 01/30/2003, commit: datatest}]"></a-entity>');
            Cypress.$(scene).append(bar);
            let controller = Cypress.$('<a-entity babiaxr-event-controller = "navigation: navigationbar; targets: [{id: bar}]"></a-entity>');
            Cypress.$(scene).append(controller);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-queryjson]'));
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));
        assert.exists(cy.get('a-entity[babiaxr-navigation-bar]'));

        // Check attributes
        cy.get('a-entity[babiaxr-navigation-bar]').invoke('attr', 'babiaxr-navigation-bar')
            .should('nested.include', {'size': 5})
            .should('nested.include', {'to': 'right'})
            .should('nested.include', {'points_by_line': 1})
            .should('nested.include', {'commits': '[{date: 01/30/2003, commit: datatest}]'});
    }); 
});