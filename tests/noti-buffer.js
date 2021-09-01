/*
 * Cypress test for NotiBuffer with QueryJson, Filter and Babia-Bars
 */

describe ('Async components', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('NotiBuffer with QueryJson and Babia-Bars', () => {
        /* Add components */
        let bars;
        cy.get('a-scene').then(scene => {
            // Querier 1
            let querier = Cypress.$('<a-entity id="queriertest" babia-queryjson="url: ./data_1.json;"></a-entity>');
            Cypress.$(scene).append(querier);  
            // Bars
            bars = Cypress.$('<a-entity id="bars" babia-bars="from: queriertest; height: population"></a-entity>');
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

        
        
        // TODO: Check bars data value



        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})        
        


        // TODO: Check bars data value
        


        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})        
        


        // TODO: Check bars data value



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



        // TODO: Check bars data value
        


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



        // TODO: Check bars data value



        // Change querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_2.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_2.json'})        
        


        // TODO: Check bars data value
        


        // Change again querier url
        cy.get('#queriertest').then(function($input){
            $input[0].setAttribute('babia-queryjson', { 'url': './data_1.json'})
        })
        cy.get('#queriertest').invoke('attr', 'babia-queryjson')
            .should('nested.include', {'url': './data_1.json'})        
        


        // TODO: Check bars data value



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



        // TODO: Check bars data value



        // Change filter from (Also tests if filter gets data from already existing data in querier)
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-filter', { 'from': 'queriertest'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-filter')
            .should('nested.include', {'from': 'queriertest'})

        // Check visualizer label value
        cy.get('a-text').invoke('attr', 'value').should('eq', 'New data: Spain, Germany and France.')

        // Change filter filter
        cy.get('#filtertest2').then(function($input){
            $input[0].setAttribute('babia-filter', { 'filter': 'continent=Asia'})
        })
        cy.get('#filtertest2').invoke('attr', 'babia-filter')
            .should('nested.include', {'filter': 'continent=Asia'})


        // TODO: Check bars data value
    }); 
});
