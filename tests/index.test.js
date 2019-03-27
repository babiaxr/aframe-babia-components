/* global assert, setup, suite, test */
require('aframe');
require('../index.js');
let entityFactory = require('./helpers').entityFactory;

suite('babia component', function () {
  let component;
  let el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'babia') { return; }
      component = el.components['babia'];
      done();
    });
    el.setAttribute('babia', {});
  });

  suite('foo property', function () {
    test('is good', function () {
      assert.equal(1, 1);
    });
  });
});
