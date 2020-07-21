/* global assert, setup, suite, test */
require('aframe');
let Values = require('../geocodecityjschart.js').Values;

suite('Values', function () {

  suite('Construct', function () {
    test('simple', function () {
      let values = new Values([1,2,3,4,5]);
      assert.deepEqual(values.items, [1,2,3,4,5]);
      assert.equal(values.total, 15);
    });

    test('total', function () {
      let values = new Values([1,2,3,4,5], 12);
      assert.deepEqual(values.items, [1,2,3,4,5]);
      assert.equal(values.total, 12);
    });
  });

  suite('Max', function () {
    test('simple', function () {
      let values = new Values([1,2,6,3,4,5]);
      let max_i = values.imax();
      assert.equal(max_i, 2);
      values = new Values([1]);
      max_i = values.imax();
      assert.equal(max_i, 0);
    });
  });

  suite('Range', function () {
    test('simple', function () {
      let indexes = Values.range(1, 1);
      assert.deepEqual(indexes, [1]);
      indexes = Values.range(1, 3);
      assert.deepEqual(indexes, [1, 2, 3]);
      indexes = Values.range(3, 2);
      assert.deepEqual(indexes, [3, 4]);
    });
  });

  suite('Scaled_area', function () {
    test('Simple', function () {
      let values = new Values([1,2,6]);
      let area = values.scaled_area(18, 0);
      assert.equal(area, 2);
      area = values.scaled_area(27, 2);
      assert.equal(area, 18);
    });
  });

  suite('Values_i', function () {
    test('Simple', function () {
      let values = new Values([1,2,6]);
      let n_values = values.values_i([0,2]);
      assert.equal(n_values.items[0], 1);
      assert.equal(n_values.items[1], 6);
    });
  });

  suite('Pivot_regions', function () {
    test('Simple', function () {
      let values = new Values([1,2,6]);
      let {pivot, a1, a2, a3} = values.pivot_regions(10, 8);
      assert.equal(pivot, 2);
      assert.deepEqual(a1, [0,1]);
      assert.deepEqual(a2, []);
      assert.deepEqual(a3, []);

      values = new Values([1,2,6,3,4,5]);
      ({pivot, a1, a2, a3} = values.pivot_regions(10, 8));
      assert.equal(pivot, 2);
      assert.deepEqual(a1, [0,1]);
      assert.deepEqual(a2, [3]);
      assert.deepEqual(a3, [4,5]);

      values = new Values([1,2,6,1,4,5]);
      ({pivot, a1, a2, a3} = values.pivot_regions(10, 8));
      assert.equal(pivot, 2);
      assert.deepEqual(a1, [0,1]);
      assert.deepEqual(a2, [3,4]);
      assert.deepEqual(a3, [5]);
    });

    test('Standing rectangle', function () {
      let values = new Values([1,2,6,4,5]);
      assert.throws(function(){values.pivot_regions(8, 10);},/Values.pivot_regions/);
    });

    test('Too few items', function () {
      values = new Values([1,2]);
      assert.throws(function(){values.pivot_regions(10, 8);},/Values.pivot_regions/);
    });
  });

  suite('Pivot_region_width', function () {
    test('Simple', function () {
      let values = new Values([2,2,6,4,5,1]);
      let width = values.pivot_region_width([1,2,3], 20);
      assert.equal(width, 12);
      width = values.pivot_region_width([1,2,3], 40);
      assert.equal(width, 24);
      width = values.pivot_region_width([1,2,3], 10);
      assert.equal(width, 6);
    });

    test('Single', function () {
      let values = new Values([2,2,6,4,5,1]);
      let width = values.pivot_region_width([4], 20);
      assert.equal(width, 5);
      width = values.pivot_region_width([4], 10);
      assert.equal(width, 2.5);
    });
  });

});