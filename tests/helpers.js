/* global suite */

/**
 * Helper method to create a scene,
 * add scene to document.
 *
 * @returns {object} An `<a-scene>` element.
 */
function sceneFactory (opts) {
  var scene = document.createElement('a-scene');
  var assets = document.createElement('a-assets');

  scene.appendChild(assets);

  opts = opts || {};

  if (opts.assets) {
    opts.assets.forEach(function (asset) {
      assets.appendChild(asset);
    });
  }

  document.body.appendChild(scene);
  return scene;
}
module.exports.sceneFactory = sceneFactory;

/**
 * Helper method to create a scene, create an entity, add entity to scene,
 * add scene to document.
 *
 * Deprecated in favor of elFactory.
 *
 * @returns {object} An `<a-entity>` element.
 */
function entityFactory (opts) {
  var scene = document.createElement('a-scene');
  var assets = document.createElement('a-assets');
  var entity = document.createElement('a-entity');

  scene.appendChild(assets);
  scene.appendChild(entity);

  opts = opts || {};

  if (opts.assets) {
    opts.assets.forEach(function (asset) {
      assets.appendChild(asset);
    });
  }

  document.body.appendChild(scene);
  return entity;
}
module.exports.entityFactory = entityFactory;

/**
 * A more robust entity factory that resolves once stuff is loaded without having to wait
 * on fragile asynchrony.
 *
 * @returns {Promise}
 */
module.exports.elFactory = function (opts) {
  let entity = entityFactory(opts);
  return new Promise(resolve => {
    if (entity.sceneEl) {
      if (entity.sceneEl.hasLoaded) { return resolve(entity); }
      entity.sceneEl.addEventListener('loaded', () => { resolve(entity); });
      return;
    }
    entity.addEventListener('nodeready', () => {
      if (entity.sceneEl.hasLoaded) { return resolve(entity); }
      entity.sceneEl.addEventListener('loaded', () => { resolve(entity); });
    });
  });
};

/**
 * Creates and attaches a mixin element (and an `<a-assets>` element if necessary).
 *
 * @param {string} id - ID of mixin.
 * @param {object} obj - Map of component names to attribute values.
 * @param {Element} scene - Indicate which scene to apply mixin to if necessary.
 * @returns {object} An attached `<a-mixin>` element.
 */
module.exports.mixinFactory = function (id, obj, scene) {
  var mixinEl = document.createElement('a-mixin');
  mixinEl.setAttribute('id', id);
  Object.keys(obj).forEach(function (componentName) {
    mixinEl.setAttribute(componentName, obj[componentName]);
  });

  var assetsEl = scene ? scene.querySelector('a-assets') : document.querySelector('a-assets');
  assetsEl.appendChild(mixinEl);

  return mixinEl;
};

/**
 * Test that is only run locally and is skipped on CI.
 */
module.exports.getSkipCISuite = function () {
  if (window.__env__.TEST_ENV === 'ci') {
    return suite.skip;
  } else {
    return suite;
  }
};

/**
 * Get position of a A-Frame entity
 *
 * @param {DOMElement} el DOM element corresponding to the entity
 * @return {Vector3} Position of the entity in the scene
 */
module.exports.get_pos = function(el) {
//  return el.object3D.position;
  return el.components.position.attrValue;
};

/**
 * Get size (width, height, depth) of a A-Frame entity
 *
 * @param {DOMElement} el DOM element corresponding to the entity
 * @return {Object} Size of the entity in the scene
 */
module.exports.get_size = function(el) {
  return el.components.geometry.attrValue;
};

/**
 * Assert if fields in expected are close to same fields in actual
 *
 * @param {Object} actual
 * @param {Object} expected
 * @param {Number} delta
 */
module.exports.assert_includeCloseTo = function(actual, expected, delta=0.001) {
  for (const field in expected) {
    assert.closeTo (actual[field], expected[field], delta, "Not close enough:" + field);
  };
};