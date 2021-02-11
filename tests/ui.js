/*
 * Cypress test for babia-ui component
 */

describe('BabiaXR-Simplebarchart component examples (screenshot)', () => {

    ['3dcylinder', 'pie', 'simplebar', 'basic_treegenerator', '3dbars'].forEach((example) => {
        it(`Screenshot Simplebarchart (${example})`, () => {
            cy.visit('/examples/ui/'+ example + '/index.html');
            cy.wait(5000);
            cy.screenshot('ui_' + example);
        });
    });
});