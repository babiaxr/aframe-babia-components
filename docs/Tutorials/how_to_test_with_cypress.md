---
linktitle: "how_to_test_with_cypress"
date: 2021-04-27T12:40:05+02:00
title: How to test with Cypress
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "test", "guide", "cypress"]
---

Currently, we use `Cypress` Test Runner.

In order to test code in this project, just create a testing file into the directory `/tests` or modify an existing one. These files must be named like:
```
your-test.js
```
-----
## End to end testing

Before you start end to end testing, remember you must be open you ssl server.

>Note: The "baseUrl" specified in cypress.json must be equal to the url of the server launched.

### Individually run integration tests

To start testing, execute the next command:
```
npm run devtest
```
This will open the Cypress Test Runner with all the test files available. Choose the test file you want to run.

### Test all the project

To start testing, execute the next command:
```
npm run test
```

If you want to test only one browser (`firefox` or `chrome`):
```
npm run test:firefox
```
or 
```
npm run test:chrome
```
>Note: When performing this complete testing, the content of the screenshots directory will be deleted and updated, so be careful if you are using this directory to store any media not coming from tests, since it will be deleted.

------

## Component testing

If you are looking for a way to test a component in isolation, without needing to open a URL, check
[Component Testing in Cypress](https://docs.cypress.io/guides/component-testing/introduction#What-is-Component-Testing)

-----

Read more about contributing with us: https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/CONTRIBUTING.md

Links:

[Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

