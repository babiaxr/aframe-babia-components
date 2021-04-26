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
            cy.wait(10000);
            cy.screenshot('demo_' + example);
        });
    });

    ['500bars_anime', '500bars_100anime', '500simplebars_100anime'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/performance/' + example + '/index.html');
            cy.wait(20000);
            cy.screenshot(example);
        });
    });

    ['boats', 'boats_plan_view', 'boats2', 'boats_plan_view2', 'boats_city', 'boats_city_plan_view', 'boats_temporal'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/boats/' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot(example);
        });
    });

    ['boats_new_element', 'boats_new_quarter', 'boats_treegenerator', 'boats_resize', 'boats_quarter_resize', 'boats_quarter_resize2'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/boats/' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot(example);
        });
    });

});