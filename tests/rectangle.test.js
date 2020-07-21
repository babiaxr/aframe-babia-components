/* global assert, setup, suite, test */
require('aframe');
let Rectangle = require('../geocodecityjschart.js').Rectangle;
let Values = require('../geocodecityjschart.js').Values;

var sceneFactory = require('./helpers').sceneFactory;
var get_pos = require('./helpers').get_pos;
var get_size = require('./helpers').get_size;

//suite('codecity component', function () {
//  var component;
//  var el;

//  setup(function (done) {
//    el = entityFactory();
//    el.addEventListener('componentinitialized', function (evt) {
//      if (evt.detail.name !== 'codecity') { return; }
//      component = el.components['codecity'];
//      done();
//    });
//    el.setAttribute('codecity', {});
//  });
//});

suite ('Rectangle', function () {

  suite('Construct', function () {
    test('simple', function () {
      let rect = new Rectangle({width: 10, depth: 20, x: 3, z: 4});
      assert.equal(rect.width, 10);
      assert.equal(rect.depth, 20);
      assert.equal(rect.x, 3);
      assert.equal(rect.z, 4);
    });

    test('all', function () {
      let rect = new Rectangle({width: 10, depth: 20, x: 3, z: 4, revolved: true});
      assert.equal(rect.width, 10);
      assert.equal(rect.depth, 20);
      assert.equal(rect.x, 3);
      assert.equal(rect.z, 4);
    });
  });

  suite('Laying', function () {

    let rect_laying = new Rectangle({width: 20, depth: 10, x: 3, z: 4});
    let rect_standing = new Rectangle({width: 10, depth: 20, x: 3, z: 4});

    test('simple', function () {
      let result = rect_laying.is_ilaying();
      assert.equal(result, true);
      result = rect_standing.is_ilaying();
      assert.equal(result, false);
    });
  });

  suite('Inner', function () {

    let rect1 = new Rectangle({width: 20, depth: 10, x: 3, z: 4});
    let rect2 = new Rectangle({width: 10, depth: 20, x: 3, z: 4});

    test('Simple', function () {
      rect1.inner(2,1);
      assert.closeTo(rect1.iwidth, 14.142, 0.001);
      assert.closeTo(rect1.idepth, 7.071, 0.001);
      rect2.inner(2,1);
      assert.closeTo(rect2.iwidth, 7.071, 0.001);
      assert.closeTo(rect2.idepth, 14.142, 0.001);
    });

    test('Repeat', function () {
      rect1.inner(4,1);
      assert.closeTo(rect1.iwidth, 10, 0.001);
      assert.closeTo(rect1.idepth, 5, 0.001);
    });
  });

  suite('Reflect', function () {

    let rect = new Rectangle({width: 20, depth: 10, x: 3, z: 4});

    test('simple', function () {
      rect.reflect();
      assert.include(rect, {width: 10, depth: 20, x: 4, z: 3});
    });
  });

  suite('Split', function () {

    let rect1 = new Rectangle({width: 30, depth: 12, x: 3, z: 4});
    [rect1.iwidth, rect1.idepth] = [20, 10];
    let rect2 = new Rectangle({width: 15, depth: 27, x: 3, z: 4});
    [rect2.iwidth, rect2.idepth] = [10, 20];

    test('Simple', function () {
      let rects = rect1.split(new Values([8,2]));
      assert.include(rects[0], {width: 16, depth: 10, x: -2, z: 0});
      assert.include(rects[1], {width: 4, depth: 10, x: 8, z: 0});
      rects = rect1.split(new Values([100]));
      assert.include(rects[0], {width: 20, depth: 10, x: 0, z: 0});
      assert.equal(rects.length, 1);
      rects = rect1.split(new Values([80,20]));
      assert.include(rects[0], {width: 16, depth: 10, x: -2, z: 0});
      assert.include(rects[1], {width: 4, depth: 10, x: 8, z: 0});
      rects = rect1.split(new Values([20,80]));
      assert.include(rects[0], {width: 4, depth: 10, x: -8, z: 0});
      assert.include(rects[1], {width: 16, depth: 10, x: 2, z: 0});
    });

    test('Simple (absolute)', function () {
      let rects = rect1.split(new Values([8,2]), false);
      assert.include(rects[0], {width: 16, depth: 10, x: 1, z: 4});
      assert.include(rects[1], {width: 4, depth: 10, x: 11, z: 4});
      rects = rect1.split(new Values([80,20]), false);
      assert.include(rects[0], {width: 16, depth: 10, x: 1, z: 4});
      assert.include(rects[1], {width: 4, depth: 10, x: 11, z: 4});
      rects = rect1.split(new Values([20,80]), false);
      assert.include(rects[0], {width: 4, depth: 10, x: -5, z: 4});
      assert.include(rects[1], {width: 16, depth: 10, x: 5, z: 4});
    });

    test('Laying', function () {
      let rects = rect2.split(new Values([8,2]));
      assert.include(rects[0], {width: 10, depth: 16, x: 0, z: -2});
      assert.include(rects[1], {width: 10, depth: 4, x: 0, z: 8});
    });

    test('Laying (absolute)', function () {
      let rects = rect2.split(new Values([8,2]), false);
      assert.include(rects[0], {width: 10, depth: 16, x: 3, z: 2});
      assert.include(rects[1], {width: 10, depth: 4, x: 3, z: 12});
    });

  });

  suite('Split_pivot', function () {

    let rect1 = new Rectangle({width: 30, depth: 12, x: 3, z: 4});
    [rect1.iwidth, rect1.idepth] = [20, 10];
    let rect2 = new Rectangle({width: 15, depth: 27, x: 3, z: 4});
    [rect2.iwidth, rect2.idepth] = [10, 20];
    let rect3 = new Rectangle({width: 20, depth: 15, x: 2, z: 3});
    [rect3.iwidth, rect3.idepth] = [15, 11];
    let rect4 = new Rectangle({width: 20, depth: 15, x: 2, z: 3});
    [rect4.iwidth, rect4.idepth] = [17, 11];
    let rect5 = new Rectangle({width: 11, depth: 15, x: 2, z: 3});
    [rect5.iwidth, rect5.idepth] = [11, 15];
    let rect6 = new Rectangle({width: 25, depth: 17, x: 2, z: 3});
    [rect6.iwidth, rect6.idepth] = [23, 15];

    test('Two or less (relative coords)', function () {
      let rects = rect1.split_pivot(new Values([10]));
      assert.include(rects[0], {width: 20, depth: 10, x: 0, z: 0});
      rects = rect1.split_pivot(new Values([8,2]));
      assert.include(rects[0], {width: 16, depth: 10, x: -2, z: 0});
      assert.include(rects[1], {width: 4, depth: 10, x: 8, z: 0});
      rects = rect1.split_pivot(new Values([80,20]));
      assert.include(rects[0], {width: 16, depth: 10, x: -2, z: 0});
      assert.include(rects[1], {width: 4, depth: 10, x: 8, z: 0});
      rects = rect2.split_pivot(new Values([80,20]));
      assert.include(rects[0], {width: 10, depth: 16, x: 0, z: -2});
      assert.include(rects[1], {width: 10, depth: 4, x: 0, z: 8});
    });

    test('Two or less (absolute coords)', function () {
      let rects = rect1.split_pivot(new Values([10]), false);
      assert.include(rects[0], {width: 20, depth: 10, x: 3, z: 4});
      rects = rect1.split_pivot(new Values([8,2]), false);
      assert.include(rects[0], {width: 16, depth: 10, x: 1, z: 4});
      assert.include(rects[1], {width: 4, depth: 10, x: 11, z: 4});
      rects = rect2.split_pivot(new Values([8,2]), false);
      assert.include(rects[0], {width: 10, depth: 16, x: 3, z: 2});
      assert.include(rects[1], {width: 10, depth: 4, x: 3, z: 12});
    });

    test('Three rectangles', function () {
      let rects = rect1.split_pivot(new Values([15,45,140]));
      assert.include(rects[0], {width: 6, depth: 2.5, x: -7, z: -3.75});
      assert.include(rects[1], {width: 6, depth: 7.5, x: -7, z: 1.25});
      assert.include(rects[2], {width: 14, depth: 10, x: 3, z: 0});

      rects = rect1.split_pivot(new Values([140,15,45]));
      assert.include(rects[0], {width: 14, depth: 10, x: -3, z: 0});
      assert.include(rects[1], {width: 6, depth: 2.5, x: 7, z: -3.75});
      assert.include(rects[2], {width: 6, depth: 7.5, x: 7, z: 1.25});

      rects = rect3.split_pivot(new Values([55, 100, 10]));
      assert.include(rects[0], {width: 5, depth: 11, x: -5, z: 0});
      assert.include(rects[1], {width: 10, depth: 10, x: 2.5, z: 0.5});
      assert.include(rects[2], {width: 10, depth: 1, x: 2.5, z: -5});
    });

    test('Four rectangles', function () {
      rects = rect3.split_pivot(new Values([40, 15, 100, 10]));
      assert.include(rects[0], {width: 5, depth: 8, x: -5, z: -1.5});
      assert.include(rects[1], {width: 5, depth: 3, x: -5, z: 4});
      assert.include(rects[2], {width: 10, depth: 10, x: 2.5, z: 0.5});
      assert.include(rects[3], {width: 10, depth: 1, x: 2.5, z: -5});

      rects = rect3.split_pivot(new Values([100, 10, 40, 15]));
      assert.include(rects[0], {width: 10, depth: 10, x: -2.5, z: 0.5});
      assert.include(rects[1], {width: 10, depth: 1, x: -2.5, z: -5});
      assert.include(rects[2], {width: 5, depth: 8, x: 5, z: -1.5});
      assert.include(rects[3], {width: 5, depth: 3, x: 5, z: 4});

      rects = rect4.split_pivot(new Values([55, 100, 10, 22]));
      assert.include(rects[0], {width: 5, depth: 11, x: -6, z: 0});
      assert.include(rects[1], {width: 10, depth: 10, x: 1.5, z: 0.5});
      assert.include(rects[2], {width: 10, depth: 1, x: 1.5, z: -5});
      assert.include(rects[3], {width: 2, depth: 11, x: 7.5, z: 0});
    });

    test('Four rectangles (stand)', function () {
      rects = rect5.split_pivot(new Values([40, 15, 100, 10]));
      assert.include(rects[0], {width: 8, depth: 5, x: -1.5, z: -5});
      assert.include(rects[1], {width: 3, depth: 5, x: 4, z: -5});
      assert.include(rects[2], {width: 10, depth: 10, x: 0.5, z: 2.5});
      assert.include(rects[3], {width: 1, depth: 10, x: -5, z: 2.5});
    });

    test('More than four rectangles (stand)', function () {
      rects = rect6.split_pivot(new Values([144, 36, 40, 15, 100, 10]));
      assert.include(rects[0], {width: 12, depth: 12, x: -5.5, z: 1.5});
      assert.include(rects[1], {width: 12, depth: 3, x: -5.5, z: -6});
      assert.include(rects[2], {width: 8, depth: 5, x: 4.5, z: -5});
      assert.include(rects[3], {width: 3, depth: 5, x: 10, z: -5});
      assert.include(rects[4], {width: 10, depth: 10, x: 6.5, z: 2.5});
      assert.include(rects[5], {width: 1, depth: 10, x: 1, z: 2.5});
    });

  });

  suite('Box', function () {
    var scene;

    setup(function () {
      scene = sceneFactory();
    });

    test('Simple', function () {
      let rect = new Rectangle({width: 20, depth: 10, x: 3, z: 4});
      rect.inner(10, 10);
      let box = rect.box({height: 10});
      scene.appendChild(box);
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 3, y: 5, z: 4});
      assert.include(get_size(entities[0]),
                     {depth: 10, width: 20, height: 10});
    });

    test('Elevation', function () {
      let rect = new Rectangle({width: 20, depth: 10, x: 3, z: 4});
      rect.inner(10, 10);
      let box = rect.box({height: 10, elevation: 1});
      scene.appendChild(box);
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 3, y: 6, z: 4});
      assert.include(get_size(entities[0]),
                     {depth: 10, width: 20, height: 10});
    });

  });

  suite('Base', function () {
    var scene;

    setup(function () {
      scene = sceneFactory();
    });

    test('simple', function () {
      let rect = new Rectangle({width: 20, depth: 10, x: 3, z: 4});
      rect.inner(10, 10); 
      let base = rect.box({height: 0.5}); 
      scene.appendChild(base);
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 3, y: 0.25, z: 4});
      assert.include(get_size(entities[0]),
                     {depth: 10, width: 20, height: 0.5});
    });

  });

});
