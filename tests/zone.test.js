/* global assert, setup, suite, test */
require('aframe');
let Zone = require('../geocodecityjschart.js').Zone;
let Rectangle = require('../geocodecityjschart.js').Rectangle;

var sceneFactory = require('./helpers').sceneFactory;
var get_pos = require('./helpers').get_pos;
var get_size = require('./helpers').get_size;
var assert_includeCloseTo = require('./helpers').assert_includeCloseTo;

/*
 * Some zone data.
 */
zone_data =
  {"id": "Root",
   "children":
    [{"id": "BlockA",
      "children": [{"id": "BlockA0",
                "children": [{"id": "A0A", "area": 2, 'max_area': 2, "height": 1}]},
               {"id": "BlockA1",
                "children": [{"id": "A1A", "area": 2, 'max_area': 2, "height": 1},
                            {"id": "A1B", "area": 5, 'max_area': 5, "height": 4},
                            {"id": "A1C", "area": 4, 'max_area': 4, "height": 6},
                            {"id": "A1D", "area": 6, 'max_area': 6, "height": 2}]},
               {"id": "BlockA2",
                "children": [{"id": "A2A", "area": 1, 'max_area': 1, "height": 3},
                            {"id": "A2B", "area": 5, 'max_area': 5, "height": 6},
                            {"id": "A2C", "area": 8, 'max_area': 8, "height": 4}]},
               {"id": "BlockA3",
                "children": [{"id": "A3A", "area": 4, 'max_area': 4, "height": 7},
                            {"id": "A3B", "area": 5, 'max_area': 5, "height": 3},
                            {"id": "A3C", "area": 8, 'max_area': 8, "height": 1}]}
              ]},
     {"id": "BlockB",
      "children": [{"id": "BlockB1",
                "children": [{"id": "B1A", "area": 3, 'max_area': 3, "height": 5},
                            {"id": "B1B", "area": 5, 'max_area': 5, "height": 4},
                            {"id": "B1C", "area": 1, 'max_area': 1, "height": 3},
                            {"id": "B1D", "area": 6, 'max_area': 6, "height": 2},
                            {"id": "B1E", "area": 4, 'max_area': 4, "height": 6},
                            {"id": "B1F", "area": 3, 'max_area': 3, "height": 1},
                            {"id": "B1G", "area": 2, 'max_area': 2, "height": 5},
                            {"id": "B1H", "area": 1, 'max_area': 1, "height": 3}]},
               {"id": "BlockB2",
                "children": [{"id": "B2A", "area": 2, 'max_area': 2, "height": 9},
                            {"id": "B2B", "area": 6, 'max_area': 6, "height": 3},
                            {"id": "B2C", "area": 1, 'max_area': 1, "height": 3},
                            {"id": "B2D", "area": 8, 'max_area': 8, "height": 1},
                            {"id": "B2E", "area": 3, 'max_area': 3, "height": 6},
                            {"id": "B2F", "area": 1, 'max_area': 1, "height": 7}]},
               {"id": "Block3",
                "children": [{"id": "B3A", "area": 6, 'max_area': 6, "height": 2},
                            {"id": "B3B", "area": 8, 'max_area': 8, "height": 4},
                            {"id": "B3C", "area": 3, 'max_area': 3, "height": 6}]},
               {"id": "Block4",
                "children": [{"id": "B4A", "area": 2, 'max_area': 2, "height": 9},
                            {"id": "B4B", "area": 6, 'max_area': 6, "height": 1},
                            {"id": "B4C", "area": 7, 'max_area': 7, "height": 6},
                            {"id": "B4D", "area": 8, 'max_area': 8, "height": 5},
                            {"id": "B4E", "area": 3, 'max_area': 3, "height": 6},
                            {"id": "B4F", "area": 9, 'max_area': 9, "height": 4}]},
               {"id": "Block5",
                "children": [{"id": "B5A", "area": 2, 'max_area': 2, "height": 9},
                            {"id": "B5B", "area": 6, 'max_area': 6, "height": 3},
                            {"id": "B5C", "area": 5, 'max_area': 5, "height": 8},
                            {"id": "B5D", "area": 5, 'max_area': 5, "height": 7}]},
               {"id": "Block6",
                "children": [{"id": "B6A", "area": 2, 'max_area': 2, "height": 9},
                            {"id": "B6B", "area": 6, 'max_area': 6, "height": 3},
                            {"id": "B6C", "area": 2, 'max_area': 2, "height": 6},
                            {"id": "B6D", "area": 4, 'max_area': 4, "height": 1},
                            {"id": "B6E", "area": 6, 'max_area': 6, "height": 6},
                            {"id": "B6F", "area": 1, 'max_area': 1, "height": 7}]}
              ]}
    ]
  };

suite('Zone', function () {

  suite('construct', function () {
    test('simple', function () {
      let zone = new Zone({data: zone_data});
      assert.deepInclude(zone.data, zone_data);
      assert.equal(zone.id, zone_data.id);
    });

//    test('json', function () {
//      let zone_json = JSON.stringify(zone_data);
//      let zone = new Zone(zone_json);
//      assert.deepInclude(zone.data, zone_data);
//      assert.equal(zone.id, zone_data.id);
//    });

  });

  suite('Areas', function () {
    test('Leaf', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0]});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 2, inner: 2, canvas: 2}); 
      assert.notProperty(areas, 'children');
    });

    test('Leaf with extra', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0],
                           extra: function(area) {return area*1.5;}});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 2, inner: 2, canvas: 3});
      assert.notProperty(areas, 'children');
    });

    test('Two levels', function () {
      let zone = new Zone({data: zone_data.children[0].children[0]});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 2, inner: 2, canvas: 2});
      assert.property(areas, 'children');
      assert.include(areas.children[0].data, zone_data.children[0].children[0].children[0]);
      zone = new Zone({data: zone_data.children[0].children[1]});
      areas = zone.areas_tree();
      assert.include(areas, {area: 17, inner: 17, canvas: 17});
      assert.property(areas, 'children');
      assert.include(areas.children[0].data, zone_data.children[0].children[1].children[0]);
      assert.include(areas.children[2].data, zone_data.children[0].children[1].children[2]);
    });

    test('Two levels with extra', function () {
      let zone = new Zone({data: zone_data.children[0].children[0],
                           extra: function(area) {return area*1.5;}});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 2, inner: 3, canvas: 4.5});
      assert.property(areas, 'children');
      assert.include(areas.children[0].data, zone_data.children[0].children[0].children[0]);
    });

    test('Three levels', function () {
      let zone = new Zone({data: zone_data.children[0]});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 50, inner: 50, canvas: 50});
      zone = new Zone({data: zone_data.children[1]});
      areas = zone.areas_tree();
      assert.include(areas, {area: 137, inner: 137, canvas: 137});
    });

    test('Three levels with extra', function () {
      let zone = new Zone({data: zone_data.children[0],
                           extra: function(area) {return area*1.5;}});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 50, inner: 112.5, canvas: 168.75});
      zone = new Zone({data: zone_data.children[1]});
      areas = zone.areas_tree();
      assert.include(areas, {area: 137, inner: 137, canvas: 137});
    });

    test('Four levels', function () {
      let zone = new Zone({data: zone_data});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 187, inner: 187, canvas: 187});
    });

    test('farea', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0],
                           fmaxarea: 'height'});
      let areas = zone.areas_tree();
      assert.include(areas, {max_area: 1, inner: 1, canvas: 1});

      zone = new Zone({data: zone_data, fmaxarea: 'height'});
      areas = zone.areas_tree();
      assert.include(areas, {area: 187, inner: 198, canvas: 198});
    });

    test('extra', function () {
      extra_func = function (area) {return area * 1.5};
      let zone = new Zone({data: zone_data.children[0].children[0].children[0],
                           extra: extra_func});
      let areas = zone.areas_tree();
      assert.include(areas, {area: 2, inner: 2, canvas: 3});
    });

  });

  suite('Add rects', function () {
    test('Leaf', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0]});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      assert.include(zone.areas.rect, {width: 10, depth: 5, x: 2, z: 3,
                                              iwidth: 10, idepth: 5}); //iwidth
    });

    test('Leaf (with extra)', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0],
                           extra: function(area) {return area*1.5;}});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      assert_includeCloseTo(zone.areas.rect, {width: 10, depth: 5, x: 2, z: 3,
                                       iwidth: 8.165, idepth: 4.082});
    });

    test('Two levels', function () {
      let zone = new Zone({data: zone_data.children[0].children[0]});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      assert.include(zone.areas.rect, {width: 10, depth: 5, x: 2, z: 3,
                                       iwidth: 10, idepth: 5});
      assert.include(zone.areas.children[0].rect,
                     {width: 10, depth: 5, x: 0, z: 0,
                      iwidth: 10, idepth: 5});

      zone = new Zone({data: zone_data.children[0].children[1]});
      canvas = new Rectangle({width: 17, depth: 13, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      assert.include(zone.areas.rect, {width: 17, depth: 13, x: 2, z: 3,
                                       iwidth: 17, idepth: 13});
      assert.include(zone.areas.children[0].rect,
                     {width: 2, depth: 13, x: -7.5, z: 0,
                      iwidth: 2, idepth: 13});
      assert.include(zone.areas.children[1].rect,
                     {width: 5, depth: 13, x: -4, z: 0,
                      iwidth: 5, idepth: 13});
    });

    test('Two levels (absolute)', function () {
      let zone = new Zone({data: zone_data.children[0].children[0]});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas, relative: false});
      assert.include(zone.areas.rect, {width: 10, depth: 5, x: 2, z: 3,
                                       iwidth: 10, idepth: 5});
      assert.include(zone.areas.children[0].rect,
                     {width: 10, depth: 5, x: 2, z: 3,
                      iwidth: 10, idepth: 5});

      zone = new Zone({data: zone_data.children[0].children[1]});
      canvas = new Rectangle({width: 17, depth: 13, x: 2, z: 3});
      zone.add_rects({rect: canvas, relative: false});
      assert.include(zone.areas.rect, {width: 17, depth: 13, x: 2, z: 3,
                                       iwidth: 17, idepth: 13});
      assert.include(zone.areas.children[0].rect,
                     {width: 2, depth: 13, x: -5.5, z: 3,
                      iwidth: 2, idepth: 13});
      assert.include(zone.areas.children[1].rect,
                     {width: 5, depth: 13, x: -2, z: 3,
                      iwidth: 5, idepth: 13});
    });

    test('Two levels, stand', function () {
      let zone = new Zone({data: zone_data.children[0].children[1]});
      let canvas = new Rectangle({width: 5, depth: 17, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      assert.include(zone.areas.rect, {width: 5, depth: 17, x: 2, z: 3,
                                       iwidth: 5, idepth: 17});
      assert.include(zone.areas.children[0].rect,
                     {width: 5, depth: 2, x: 0, z: -7.5,
                      iwidth: 5, idepth: 2});
      assert.include(zone.areas.children[1].rect,
                     {width: 5, depth: 5, x: 0, z: -4,
                      iwidth: 5, idepth: 5});
    });

    test('Two levels, stand (absolute)', function () {
      let zone = new Zone({data: zone_data.children[0].children[1]});
      let canvas = new Rectangle({width: 5, depth: 17, x: 2, z: 3});
      zone.add_rects({rect: canvas, relative: false});
      assert.include(zone.areas.rect, {width: 5, depth: 17, x: 2, z: 3,
                                       iwidth: 5, idepth: 17});
      assert.include(zone.areas.children[0].rect,
                     {width: 5, depth: 2, x: 2, z: -4.5,
                      iwidth: 5, idepth: 2});
      assert.include(zone.areas.children[1].rect,
                     {width: 5, depth: 5, x: 2, z: -1,
                      iwidth: 5, idepth: 5});
    });

    test('Three levels, stand', function () {
      let zone = new Zone({data: zone_data.children[0]});
      let canvas = new Rectangle({width: 34, depth: 50, x: 0, z: 0});
      zone.add_rects({rect: canvas});
      assert.include(zone.areas.rect, {width: 34, depth: 50, x: 0, z: 0}); //width
      assert.include(zone.areas.children[0].rect,
                     {width: 34, depth: 2, x: 0, z: -24});
      assert.include(zone.areas.children[1].rect,
                     {width: 34, depth: 17, x: 0, z: -14.5});
      assert.include(zone.areas.children[1].children[0].rect,
                     {width: 4, depth: 17, x: -15, z: 0});
    });

    test('Three levels, stand (absolute)', function () {
      let zone = new Zone({data: zone_data.children[0]});
      let canvas = new Rectangle({width: 34, depth: 50, x: 0, z: 0});
      zone.add_rects({rect: canvas, relative: false});
      assert.include(zone.areas.rect, {width: 34, depth: 50, x: 0, z: 0});
      assert.include(zone.areas.children[0].rect,
                     {width: 34, depth: 2, x: 0, z: -24});
      assert.include(zone.areas.children[1].rect,
                     {width: 34, depth: 17, x: 0, z: -14.5});
      assert.include(zone.areas.children[1].children[0].rect,
                     {width: 4, depth: 17, x: -15, z: -14.5});
    });

  });

  suite('Draw rects', function () {
    var scene;

    setup(function () {
      scene = sceneFactory();
    });

    test('Leaf', function () {
      let zone = new Zone({data: zone_data.children[0].children[0].children[0]});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      zone.draw_rects({ground: canvas, el: scene});
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 2, y: 0.5, z: 3});
      assert.include(get_size(entities[0]),
                     {width: 10, depth: 5, height: 1}); //width
    });

    test('Two levels', function () {
      let zone = new Zone({data: zone_data.children[0].children[0]});
      let canvas = new Rectangle({width: 10, depth: 5, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      zone.draw_rects({ground: canvas, el: scene, base: false});
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 2, y: 0.1, z: 3});
      assert.include(get_size(entities[0]),
                     {width: 10, depth: 5, height: 0.2});
      assert.include(get_pos(entities[1]), {x: 0, y: 0.6, z: 0}); //x
      assert.include(get_size(entities[1]),
                     {width: 10, depth: 5, height: 1});
    });

    test('Two levels (more children)', function () {
      let zone = new Zone({data: zone_data.children[0].children[1]});
      let canvas = new Rectangle({width: 5, depth: 17, x: 2, z: 3});
      zone.add_rects({rect: canvas});
      zone.draw_rects({ground: canvas, el: scene, base: false});
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 2, y: 0.1, z: 3});
      assert.include(get_size(entities[0]),
                     {width: 5, depth: 17, height: 0.2});
      assert.include(get_pos(entities[1]), {x: 0, y: 0.6, z: -7.5}); //z
      assert.include(get_size(entities[1]),
                     {width: 5, depth: 2, height: 1});
      assert.include(get_pos(entities[2]), {x: 0, y: 2.1, z: -4});
      assert.include(get_size(entities[2]),
                     {width: 5, depth: 5, height: 4});
    });

    test('Two levels (more children) (absolute)', function () {
      let zone = new Zone({data: zone_data.children[0].children[1]});
      let canvas = new Rectangle({width: 5, depth: 17, x: 2, z: 3});
      zone.add_rects({rect: canvas, relative: false});
      zone.draw_rects({ground: canvas, el: scene, base: false});
      let entities = document.querySelectorAll('a-entity');
      assert.include(get_pos(entities[0]), {x: 2, y: 0.1, z: 3});
      assert.include(get_size(entities[0]),
                     {width: 5, depth: 17, height: .2});
      assert.include(get_pos(entities[1]), {x: 2, y: 0.6, z: -4.5}); //z
      assert.include(get_size(entities[1]),
                     {width: 5, depth: 2, height: 1});
      assert.include(get_pos(entities[2]), {x: 2, y: 2.1, z: -1});
      assert.include(get_size(entities[2]),
                     {width: 5, depth: 5, height: 4});
    });

  });
});
