/*
 * Cypress test for debug-data component
 */

describe ('Debug-Data component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let geometry = Cypress.$('<a-entity geometry="primitive: box;" material="color:navy;" babiaxr-filterdata="from: queriertest; filter: kbn_searchtables" babiaxr-vismapper="width: open_issues; depth: open_issues; height: size" babiaxr-interaction-mapper="input: mouseenter; output: debugevent" babiaxr-debug-data="inputEvent: debugevent"></a-entity>');
            Cypress.$(scene).append(geometry);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-debug-data]'));

        // Check attributes
        cy.get('a-entity[babiaxr-debug-data]').invoke('attr', 'babiaxr-debug-data')
            .should('nested.include', {'inputEvent': 'debugevent'});
    }); 
});

describe('Debug-Data component examples (screenshot)', () => {
    
    ['json_embedded_debug'].forEach((example) => {
        it(`Screenshot Querier ${example} Example`, () => {
            cy.visit('/examples/others/querier_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('querier_' + example);
        });
    });

});