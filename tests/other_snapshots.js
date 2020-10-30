/*
 * Cypress Snapshots of the others examples
 */


describe('Others examples (screenshot)', () => {

    [''].forEach((example) => {
        it(`Screenshot Mutiples Charts (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/multichart' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('multichart' + example);
        });
    });

    ['1.0.7', '1.0.11'].forEach((example) => {
        it(`Screenshot Demo (${example})`, () => {
            cy.visit('/examples/demos/' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('demo_' + example);
        });
    });

    ['500bars_anime'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/performance/' + example + '/index.html');
            cy.wait(20000);
            cy.screenshot(example);
        });
    });

});