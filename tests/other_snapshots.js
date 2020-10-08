/*
 * Cypress Snapshots of the others examples
 */


describe('Others examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
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

    ['basic', 'filled'].forEach((example) => {
        it(`Screenshot Elevation ${example} Example`, () => {
            cy.visit('/examples/elevation/elevation ' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('elevation_' + example);
        });
    });

    ['elasicsearch_local', 'github_all_repos', 'github_list_repos', 'json_embedded_debug', 'json_url'].forEach((example) => {
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

    ['1', '1_querier', '2', '2_querier'].forEach((example) => {
        it(`Screenshot Totem ${example} Example`, () => {
            cy.visit('/examples/totems/totem_' + example + '/index.html');
            cy.wait(3000);
            cy.screenshot('totem_' + example);
        });
    });

    ['multi_charts', 'simplebar_chart'].forEach((example) => {
        it(`Screenshot ${example} Example with Navigation Bar`, () => {
            cy.visit('/examples/ui_nav_bar/' + example + '_with_ui/index.html');
            cy.wait(6000);
            cy.screenshot(example + 'with_ui');
        });
    });

    ['500bars_anime'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/performance/' + example + '/index.html');
            cy.wait(20000);
            cy.screenshot(example);
        });
    });

    ['basic', 'time_evolution_angular'].forEach((example) => {
        it(`Screenshot Performance ${example} Example`, () => {
            cy.visit('/examples/codecityjs/' + example + '/index.html');
            cy.wait(8000);
            cy.screenshot('codecity_'+ example);
        });
    });
});