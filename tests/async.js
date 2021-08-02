/*
 * Cypress test for async component
 */

describe ('Async components', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Async Components: Querier and Visualizer', () => {
        /* Add components */
        cy.get('a-scene').then(scene => {
            // Querier 1
            let querier = Cypress.$('<a-entity id="queriertest" babia-async-querier="url: ./data_1.json;"></a-entity>');
            Cypress.$(scene).append(querier);  
            // Visualizer
            let vis = Cypress.$('<a-entity id="vis" async-visualizer="from: queriertest"></a-entity>');
            Cypress.$(scene).append(vis);
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest'));
        assert.exists(cy.get('#vis'));
        // Visualizer label
        assert.exists(cy.get('a-text'));

        // Check attributes
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_1.json'})
        cy.get('#vis').invoke('attr', 'async-visualizer')
            .should('nested.include', {'from': 'queriertest'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, South Korea, China, Equatorial Guinea, Germany and France.')

        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-async-querier', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_2.json'})        
        
        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Italy, Guinea, Belgium, USA, Mexico and Croatia.')
        
        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-async-querier', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_1.json'})        
        
        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, South Korea, China, Equatorial Guinea, Germany and France.')

        /* Add new querier */
        cy.get('a-scene').then(scene => {
            // Querier 2
            let querier2 = Cypress.$('<a-entity id="queriertest2" babia-async-querier="url: ./data_2.json;"></a-entity>');
            Cypress.$(scene).append(querier2); 
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest2'));
        
        // Check attributes
        cy.get('#queriertest2').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_2.json'})

        // Change visualizer from (Also tests if visualizer gets data from already existing data in querier)
        cy.get('#vis').then(function($input){
            $input[0].setAttribute('async-visualizer', { 'from': 'queriertest2'})
        })
        cy.get('#vis').invoke('attr', 'async-visualizer')
            .should('nested.include', {'from': 'queriertest2'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Italy, Guinea, Belgium, USA, Mexico and Croatia.')
        
    }); 

    it ('Async Components: Querier, Filter and Visualizer', () => {
        /* Add components */
        cy.get('a-scene').then(scene => {
            // Querier 1
            let querier = Cypress.$('<a-entity id="queriertest" babia-async-querier="url: ./data_1.json;"></a-entity>');
            Cypress.$(scene).append(querier); 
            // Filter 1
            let filter = Cypress.$('<a-entity id="filtertest" babia-async-filter="from: queriertest;  filter: continent=Europe"></a-entity>');
            Cypress.$(scene).append(filter);  
            // Visualizer
            let vis = Cypress.$('<a-entity id="vis" async-visualizer="from: filtertest"></a-entity>');
            Cypress.$(scene).append(vis);
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest'));
        assert.exists(cy.get('#filtertest'));
        assert.exists(cy.get('#vis'));
        // Visualizer label
        assert.exists(cy.get('a-text'));

        // Check attributes
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_1.json'})
        cy.get('#filtertest').invoke('attr', 'babia-async-filter')
            .should('nested.include', {'from': 'queriertest'})
            .should('nested.include', {'filter': 'continent=Europe'})
        cy.get('#vis').invoke('attr', 'async-visualizer')
            .should('nested.include', {'from': 'filtertest'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, Germany and France.')

        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-async-querier', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_2.json'})        
        
        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Italy, Belgium and Croatia.')
        
        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-async-querier', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_1.json'})        
        
        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, Germany and France.')

        /* Add new querier and filter */
        cy.get('a-scene').then(scene => {
            // Querier 2
            let querier2 = Cypress.$('<a-entity id="queriertest2" babia-async-querier="url: ./data_2.json;"></a-entity>');
            Cypress.$(scene).append(querier2); 
            // Filter 2
            let filter2 = Cypress.$('<a-entity id="filtertest2" babia-async-filter="from: queriertest2;  filter: continent=Europe"></a-entity>');
            Cypress.$(scene).append(filter2);
        });

        // Test entities existence
        assert.exists(cy.get('#queriertest2'));
        assert.exists(cy.get('#filtertest2'));
        
        // Check attributes
        cy.get('#queriertest2').invoke('attr', 'babia-async-querier')
            .should('nested.include', {'url': './data_2.json'})
        cy.get('#filtertest2').invoke('attr', 'babia-async-filter')
            .should('nested.include', {'from': 'queriertest2'})
        
        // Change visualizer from (Also tests if visualizer gets data from already existing data in filter)
        cy.get('#vis').then(function($input){
            $input[0].setAttribute('async-visualizer', { 'from': 'filtertest2'})
        })
        cy.get('#vis').invoke('attr', 'async-visualizer')
            .should('nested.include', {'from': 'filtertest2'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Italy, Belgium and Croatia.')

        // Change filter from (Also tests if filter gets data from already existing data in querier)
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-async-filter', { 'from': 'queriertest'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-async-filter')
            .should('nested.include', {'from': 'queriertest'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, Germany and France.')

        // Change filter filter
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-async-filter', { 'filter': 'continent=Asia'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-async-filter')
            .should('nested.include', {'filter': 'continent=Asia'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: South Korea and China.')
    }); 
});
