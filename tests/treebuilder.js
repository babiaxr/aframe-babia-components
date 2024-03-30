/*
 * Cypress test for treebuilder component
 */

describe ('Tree builder component', () => {

    beforeEach(() => {
        cy.visit('/tests/index.html');
      });

    it ('Creation', () => {
        cy.get('a-scene').then(scene => {

            // Add components
            let data = Cypress.$(
                `<a-entity babia-treebuilder='field: name; split_by: /;
                data:
                    [{"name": "One", "fieldA": 110, "fieldB": 10},
                     {"name": "Two", "fieldA": 120, "fieldB": 20},
                     {"name": "Three", "fieldA": 130, "fieldB": 30}]'>
                </a-entity>`
                );
            Cypress.$(scene).append(data);      //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-treebuilder]'));

        // Check attributes
        cy.get('a-entity[babia-treebuilder]')
            .its('0.components.babia-treebuilder.notiBuffer.data')
            .should('deep.equal',
                [{"name": "One", "fieldA": 110, "fieldB": 10, uid: "One/One"},
                 {"name": "Two", "fieldA": 120, "fieldB": 20, uid: "Two/Two"},
                 {"name": "Three", "fieldA": 130, "fieldB": 30, uid: "Three/Three"}]
                 );      
    }); 

    it ('Build root', () => {
        cy.get('a-scene').then(scene => {

            // Add components
            let data = Cypress.$(
                `<a-entity babia-treebuilder='field: name; split_by: /;
                build_root: true; data:
                    [{"name": "One", "fieldA": 110, "fieldB": 10},
                     {"name": "Two", "fieldA": 120, "fieldB": 20},
                     {"name": "Three", "fieldA": 130, "fieldB": 30}]'>
                </a-entity>`
                );
            Cypress.$(scene).append(data);      //appendchild
        });
        
        // Test entities existence
        assert.exists(cy.get('a-entity[babia-treebuilder]'));

        // Check attributes
        cy.get('a-entity[babia-treebuilder]')
            .its('0.components.babia-treebuilder.notiBuffer.data')
            .should('deep.equal',
                [{"name": "Main", "id": "", "children": [
                    {"name": "One", "fieldA": 110, "fieldB": 10, uid: "One/One"},
                    {"name": "Two", "fieldA": 120, "fieldB": 20, uid: "Two/Two"},
                    {"name": "Three", "fieldA": 130, "fieldB": 30, uid: "Three/Three"}
                ]}]);      
    }); 

});

