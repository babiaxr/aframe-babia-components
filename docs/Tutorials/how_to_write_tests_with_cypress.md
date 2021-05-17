---
linktitle: "how_to_write_tests_with_cypress"
date: 2021-04-27T12:40:05+02:00
title: How to write tests with Cypress
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "test", "guide", "cypress"]
---

## Write end to end tests 
In order to learn how to write end to end tests in Cypress, follow the [first steps in Cypress](https://docs.cypress.io/guides/getting-started/writing-your-first-test#Write-your-first-test).

If you run tests that take screenshots, these will be saved at the _/tests/screenshots/_ directory inside the defined folder.

If you run tests that take videos, these will be saved at the _/tests/videos_ directory.

>Note: When performing a complete testing (`npm run test`), the content of the screenshots and videos directories will be deleted and updated, so be careful if you are using this directory to store any media not coming from tests, since it will be deleted. If performing only individual tests (`npm run devtest`), the new screenshots and videos will be added to the directories, but nothing will be deleted.

## Write component tests
In order to learn how to write component tests in Cypress, follow the [Component Testing](https://docs.cypress.io/guides/component-testing/introduction#What-is-Component-Testing) guidelines.

--------

## How to write tests in Babia

### Creation tests

1. Write a message that describes the component you are testing.

2. Visit page before each test.

3. Start test  declaration with `it()`. Declare it describing the test you are performing, in this case "Creation".

**First part: test appending component:**

1. Get container entity (scene usually) (`cy.get(entity)`), then create and append the component. 

2. Make an assertion (`assert.exists(cy.get(babia-component))`).

**Second part: test component attributes existance:**

1. Get component (`cy.get(a-entity[babia-component])`), then invoke attributes. 

2. Make an assertion (`should('nested.include',{'attribute-name': attribute-value})`).


```javascript
describe('Babia-component', () => {

  beforeEach(() => {
    cy.visit('/tests/index.html');
  });

  it('Creation', () => {
    cy.get('a-scene').then(scene => {
      let wall = Cypress.$('<a-entity babia-component></a-entity>');
      Cypress.$(scene).append(babia-component);
    });
    assert.exists(cy.get('a-entity[babia-component]'));
    cy.get('a-entity[babia-component]').invoke('attr', 'babia-component')
      .should('nested.include',{'attr1': 10})
      .should('nested.include',{'attr2': 0.3})
  });

});
```
-----
### Screenshots

1. Write a message that describes the example you are testing, in this case, add "screenshot".

2. Go through all the examples you want to take screenshots of and start the test declaration with `it()`. Declare it describing the test you are performing, in this case "Screenshot + example".

3. Visit page (`cy.visit()`).

4. Wait to render page (`cy.wait()`).

5. Take screenshot (`cy.screenshot()`).

```javascript

describe('Babia-component examples (screenshot)', () => {

  ['example_1', 'example_2', 'example_3'].forEach((example) => {
    it(`Screenshot (${example})`, () => {
      cy.visit('/examples/.../component/' + example + '.html'); // Visit example
      cy.wait(3000); // Wait some seconds to render all
      cy.screenshot(example); // Take screenshot
    });
  });
});
```

-----

Read more about contributing with us: https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/CONTRIBUTING.md

Links:

[Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)
