/*
 * Cypress test for querier_es component
 */

describe ('Quierier_ES component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_es="elasticsearch_url: http://localhost:9200; index: git; size: 20"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity babiaxr-piechart="legend: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="slice: Author_name; height: lines_added" position="-3 5 15" rotation="90 0 0"></a-entity>');
            Cypress.$(scene).append(chart);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_es]'));

        // Check attributes
        cy.get('a-entity[babiaxr-querier_es]').invoke('attr', 'babiaxr-querier_es')
            .should('nested.include', {'elasticsearch_url': 'http://localhost:9200'})
            .should('nested.include', {'index': 'git'})
            .should('nested.include', {'size': 20});
    }); 
});

describe('Querier_ES component examples (screenshot)', () => {
    
    ['elasicsearch_local'].forEach((example) => {
        it(`Screenshot Querier ${example} Example`, () => {
            cy.visit('/examples/others/querier_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('querier_' + example);
        });
    });

});