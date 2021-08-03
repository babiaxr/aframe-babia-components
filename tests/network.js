describe('Babia-Network component examples (screenshot)', () => {

    [''].forEach((example) => {
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/network_chart.html');
            cy.wait(5000);
            cy.screenshot('network_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/network_large_chart.html');
            cy.wait(5000);
            cy.screenshot('network_large_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/network_nodes_links_chart.html');
            cy.wait(5000);
            cy.screenshot('network_nodes_links_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/network_nodes_links_directed_chart.html');
            cy.wait(5000);
            cy.screenshot('network_nodes_links_directed_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/network_chart' + example + '/network_random_chart.html');
            cy.wait(5000);
            cy.screenshot('network_random_chart' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts_querier'+ example+ '/network_chart_querier' + example + '/network_chart_querier.html');
            cy.wait(5000);
            cy.screenshot('network_chart_querier' + example);
        });
        it(`Screenshot Network (${example})`, () => {
            cy.visit('/examples/charts_querier'+ example+ '/network_chart_querier' + example + '/network_chart_querier_nodes_links.html');
            cy.wait(5000);
            cy.screenshot('network_chart_querier_nodes_links' + example);
        });
    });
});