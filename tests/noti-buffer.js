/*
 * Cypress test for NotiBuffer with QueryJson, Filter and Babia-Bars
 */

describe ('Async components', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('NotiBuffer with QueryJson and Babia-Bars', () => {
        // Add components
        cy.get('a-scene').then(scene => {
            // Querier 1
            let querier = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data_1.json;"></a-entity>');
            Cypress.$(scene).append(querier);  
            // Bars
            let bars = Cypress.$('<a-entity id="bars" babia-bars="from: queriertest; height: population"></a-entity>');
            Cypress.$(scene).append(bars);
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest'));
        assert.exists(cy.get('#bars'));

        // Check attributes
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})
        cy.get('#bars').invoke('attr', 'babia-bars')
            .should('nested.include', {'from': 'queriertest'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Spain","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Asia","country":"South Korea","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18},
                {"continent":"Asia","country":"China","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18},
                {"continent":"Africa","country":"Equatorial Guinea","population": 1.403,"partial": 0.076,"partial%":5.45,"complete": 0.072,"complete%":5.10},
                {"continent":"Europe","country":"Germany","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"France","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );
        

        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})        
        
        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Italy","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Africa","country":"Guinea","population": 1.403,"partial": 0.076,"partial%":5.45,"complete": 0.072,"complete%":5.10},
                {"continent":"Europe","country":"Belgium","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"America","country":"USA","population": 331.003,"partial": 32.65,"partial%":9.76,"complete": 135.09,"complete%":40.39},
                {"continent":"America","country":"Mexico","population": 331.003,"partial": 32.65,"partial%":9.76,"complete": 135.09,"complete%":40.39},
                {"continent":"Europe","country":"Croatia","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})        
        
        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Spain","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Asia","country":"South Korea","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18},
                {"continent":"Asia","country":"China","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18},
                {"continent":"Africa","country":"Equatorial Guinea","population": 1.403,"partial": 0.076,"partial%":5.45,"complete": 0.072,"complete%":5.10},
                {"continent":"Europe","country":"Germany","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"France","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );


        /* Add new querier */
        cy.get('a-scene').then(scene => {
            // Querier 2
            let querier2 = Cypress.$('<a-entity id="queriertest2" babia-queryjson="url: ./data_2.json;"></a-entity>');
            Cypress.$(scene).append(querier2); 
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest2'));
        
        // Check attributes
        cy.get('#queriertest2').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})

        // Change bars from (Also tests if bars gets data from already existing data in querier)
        cy.get('#bars').then(function($input){
            $input[0].setAttribute('babia-bars', { 'from': 'queriertest2'})
        })
        cy.get('#bars').invoke('attr', 'babia-bars')
            .should('nested.include', {'from': 'queriertest2'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Italy","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Africa","country":"Guinea","population": 1.403,"partial": 0.076,"partial%":5.45,"complete": 0.072,"complete%":5.10},
                {"continent":"Europe","country":"Belgium","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"America","country":"USA","population": 331.003,"partial": 32.65,"partial%":9.76,"complete": 135.09,"complete%":40.39},
                {"continent":"America","country":"Mexico","population": 331.003,"partial": 32.65,"partial%":9.76,"complete": 135.09,"complete%":40.39},
                {"continent":"Europe","country":"Croatia","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );
    }); 

    it ('NotiBuffer with QueryJson, Filter and Babia-Bars', () => {
        /* Add components */
        cy.get('a-scene').then(scene => {
            // Querier 1
            let querier = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data_1.json;"></a-entity>');
            Cypress.$(scene).append(querier); 
            // Filter 1
            let filter = Cypress.$('<a-entity id="filtertest" babia-filter="from: queriertest;  filter: continent=Europe"></a-entity>');
            Cypress.$(scene).append(filter);  
            // Bars
            let bars = Cypress.$('<a-entity id="bars" babia-bars="from: filtertest; height: population"></a-entity>');
            Cypress.$(scene).append(bars);
        });
        
        // Test entities existence
        assert.exists(cy.get('#queriertest'));
        assert.exists(cy.get('#filtertest'));
        assert.exists(cy.get('#bars'));

        // Check attributes
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})
        cy.get('#filtertest').invoke('attr', 'babia-filter')
            .should('nested.include', {'from': 'queriertest'})
            .should('nested.include', {'filter': 'continent=Europe'})
        cy.get('#bars').invoke('attr', 'babia-bars')
            .should('nested.include', {'from': 'filtertest'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Spain","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Europe","country":"Germany","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"France","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})        
        
        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Italy","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Europe","country":"Belgium","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"Croatia","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})        

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Spain","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Europe","country":"Germany","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"France","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        /* Add new querier and filter */
        cy.get('a-scene').then(scene => {
            // Querier 2
            let querier2 = Cypress.$('<a-entity id="queriertest2" babia-queryjson="url: ./data_2.json;"></a-entity>');
            Cypress.$(scene).append(querier2); 
            // Filter 2
            let filter2 = Cypress.$('<a-entity id="filtertest2" babia-filter="from: queriertest2;  filter: continent=Europe"></a-entity>');
            Cypress.$(scene).append(filter2);
        });

        // Test entities existence
        assert.exists(cy.get('#queriertest2'));
        assert.exists(cy.get('#filtertest2'));
        
        // Check attributes
        cy.get('#queriertest2').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})
        cy.get('#filtertest2').invoke('attr', 'babia-filter')
            .should('nested.include', {'from': 'queriertest2'})
        
        // Change bars from (Also tests if bars gets data from already existing data in filter)
        cy.get('#bars').then(function($input){
            $input[0].setAttribute('babia-bars', { 'from': 'filtertest2'})
        })
        cy.get('#bars').invoke('attr', 'babia-bars')
            .should('nested.include', {'from': 'filtertest2'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Italy","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Europe","country":"Belgium","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"Croatia","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        // Change filter from (Also tests if filter gets data from already existing data in querier)
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-filter', { 'from': 'queriertest'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-filter')
            .should('nested.include', {'from': 'queriertest'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Europe", "country":"Spain","population": 46.755,"partial": 8.90,"partial%":19.04, "complete": 8.80,"complete%":18.83},
                {"continent":"Europe","country":"Germany","population": 83.784,"partial": 21.57,"partial%":25.75,"complete": 14.62,"complete%":17.44},
                {"continent":"Europe","country":"France","population": 65.274,"partial": 14.32,"partial%":21.20,"complete": 11.01,"complete%":16.30}]
            );

        // Change filter filter
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-filter', { 'filter': 'continent=Asia'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-filter')
            .should('nested.include', {'filter': 'continent=Asia'})

        // Check bars newData value
        cy.get('#bars')
            .its('0.components.babia-bars.newData')
            .should('deep.equal', [{"continent":"Asia","country":"South Korea","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18},
                {"continent":"Asia","country":"China","population": 51.269,"partial": 3.26,"partial%":6.36,"complete": 2.14,"complete%":4.18}]
            );
    }); 
});
