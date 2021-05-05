describe('Babia-Network component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('network_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_large_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('network_large_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_nodes_links_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('network_nodes_links_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_random_chart' + example + '/index.html');
            cy.wait(5000);
            cy.screenshot('network_random_chart' + example);
        });
    });
});