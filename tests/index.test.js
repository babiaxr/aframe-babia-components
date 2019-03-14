/* global assert, setup, suite, test */
require('aframe');
require('../index.js');
let entityFactory = require('./helpers').entityFactory;

suite('visdata component', function () {
  let component;
  let el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'visdata') { return; }
      component = el.components['visdata'];
      done();
    });
    el.setAttribute('visdata', {});
  });

  suite('foo property', function () {
    test('is good', function () {
      assert.equal(1, 1);
    });
  });
});
