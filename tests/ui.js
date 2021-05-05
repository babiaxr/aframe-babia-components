/*
 * Cypress test for babia-ui component
 */

describe('Babia-UI component examples (screenshot)', () => {

    ['cylsmap', 'pie', 'bars', 'city_treegenerator', 'boats_treegenerator', 'ui_treegenerator', 'barsmap'].forEach((example) => {
        it(`Screenshot UI(${example})`, () => {
            cy.visit('/examples/ui/'+ example + '/index.html');
            cy.wait(5000);
            cy.screenshot('ui_' + example);
        });
    });
});