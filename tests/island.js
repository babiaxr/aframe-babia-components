/*
 * Cypress Snapshots of the islands examples
 */


describe('Islands examples (screenshot)', () => {

    ['islands', 'islands_plan_view', 'islands2', 'islands_plan_view2'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/islands/' + example + '/index.html');
            cy.wait(1000);
            cy.screenshot(example);
        });
    });

    ['islands_new_element', 'islands_new_quarter', 'islands_resize', 'islands_quarter_resize', 'islands_temporal'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/islands/' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot(example);
        });
    });

    ['island_codecity', 'island_codecity_plan_view'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/islands/' + example + '/index.html');
            cy.wait(2000);
            cy.screenshot(example);
        });
    });

});