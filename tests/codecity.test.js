
var entityFactory = require('./helpers').entityFactory;

suite('CodeCity component', function () {
  var component;
  var el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('Creation', () => {
    test('Simple', function () {
      el.setAttribute('codecity', {width: 7, depth: 7,
                                   data: JSON.stringify({id: "A", area: 3, height: 1})});
      assert.equal(el.getAttribute('codecity').width, 7);
    });

    test('Empty', function () {
      el.setAttribute('codecity', '');
    });

  });

});