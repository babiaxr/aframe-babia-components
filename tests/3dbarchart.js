/*
 * Cypress test for babiaxr-3dbarchart component
 */

describe ('BabiaXR-3Dbarchart component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Simple Creation', () => {
        let data = "[{'key':'David','key2':'2019','size':90},{'key':'David','key2':'2018','size':8},{'key':'David','key2':'2017','size':70},{'key':'David','key2':'2016','size':65},{'key':'David','key2':'2015','size':5},{'key':'Pete','key2':'2011','size':80},{'key':'Pete','key2':'2014','size':7},{'key':'Josh','key2':'2016','size':65},{'key':'Josh','key2':'2015','size':55},{'key':'Jesus','key2':'2016','size':90},{'key':'Jesus','key2':'2011','size':80},{'key':'Jesus','key2':'2014','size':75},{'key':'Jesus','key2':'2016','size':60},{'key':'Jesus','key2':'2015','size':5},{'key':'Jesus','key2':'2016','size':95},{'key':'Steve','key2':'2016','size':90},{'key':'Steve','key2':'2017','size':8},{'key':'Steve','key2':'2014','size':7},{'key':'Steve','key2':'2013','size':60},{'key':'Moreno','key2':'2015','size':45},{'key':'Jesus','key2':'2019','size':100},{'key':'Pete','key2':'2019','size':10}]";
        cy.get('a-scene').then(scene => {
            // Add components     
            let chart = Cypress.$('<a-entity babiaxr-3dbarchart="legend: true; axis: true; data: '+ data + '" ></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-3dbarchart]'));
        // Check attributes
        cy.get('a-entity[babiaxr-3dbarchart]').invoke('attr', 'babiaxr-3dbarchart')
            .should('nested.include', {'legend': true})
            .should('nested.include', {'axis': true})
            .should('nested.include', {'data': data});
    });


    it ('Querier Creation', () => {
        cy.get('a-scene').then(scene => {
            // Add components
            let data = Cypress.$('<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>');
            Cypress.$(scene).append(data);      
            let chart = Cypress.$('<a-entity babiaxr-3dbarchart="legend: true; axis: true" babiaxr-filterdata="from: queriertest" babiaxr-vismapper="x_axis: name; z_axis: name2; height: size"></a-entity>');
            Cypress.$(scene).append(chart); //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babiaxr-querier_json]'));
        assert.exists(cy.get('a-entity[babiaxr-3dbarchart]'));
        assert.exists(cy.get('a-entity[babiaxr-vismapper]'));

        // Check attributes
        cy.get('a-entity[babiaxr-3dbarchart]').invoke('attr', 'babiaxr-vismapper')
            .should('nested.include', {'ui': false})
            .should('nested.include', {'x_axis': 'name'})
            .should('nested.include', {'z_axis': 'name2'})
            .should('nested.include', {'height': 'size'});
    }); 
});

describe('BabiaXR-3Dbarchart component examples (screenshot)', () => {

    ['', '_querier'].forEach((example) => {
        it(`Screenshot 3Dbarchart (${example})`, () => {
            cy.visit('/examples/charts'+ example+ '/3dbars_chart' + example + '/index.html');
            cy.wait(15000);
            cy.screenshot('3dbarschart' + example);
        });
    });
});