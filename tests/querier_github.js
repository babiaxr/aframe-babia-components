/*
 * Cypress test for querier_github component
 */

describe ('Quierier_Github component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$(' <a-entity id="queriertest" babiaxr-querier_github="user: dlumbrer;"></a-entity>');
            Cypress.$(scene).append(data);      //appendchild
            let chart = Cypress.$('<a-entity geometry="primitive: box;" material="color:navy;" babiaxr-filterdata="from: queriertest; filter: kbn_searchtables" babiaxr-vismapper="width: open_issues; depth: open_issues; height: size"></a-entity>');
            Cypress.$(scene).append(chart);
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_github]'));

        // Check attributes
        cy.get('a-entity[babiaxr-querier_github]').invoke('attr', 'babiaxr-querier_github')
            .should('nested.include', {'user': 'dlumbrer'});
    }); 
});

describe('Querier_ES component examples (screenshot)', () => {
    
    ['github_all_repos', 'github_list_repos'].forEach((example) => {
        it(`Screenshot Querier ${example} Example`, () => {
            cy.visit('/examples/others/querier_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('querier_' + example);
        });
    });

    ['bubbles_github', 'github_username_keyboard'].forEach((example) => {
        it(`Screenshot ${example} Example`, () => {
            cy.visit('/examples/others/' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot(example);
        });
    });

});