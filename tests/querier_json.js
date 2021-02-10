/*
 * Cypress test for querier_json component
 */

describe('Querier_JSON component examples (screenshot)', () => {
    
    ['_querier'].forEach((example) => {
        it(`Screenshot Mutiples Charts (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/multichart' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('multichart' + example);
        });
    });

});