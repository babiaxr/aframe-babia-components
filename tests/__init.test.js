/* global sinon, setup, teardown */

/**
 * __init.test.js is run before every test case.
 */
window.debug = true;
let AScene = require('aframe').AScene

navigator.getVRDisplays = function () {
  let resolvePromise = Promise.resolve();
  let mockVRDisplay = {
    requestPresent: resolvePromise,
    exitPresent: resolvePromise,
    getPose: function () { return {orientation: null, position: null}; },
    requestAnimationFrame: function () { return 1; }
  };
  return Promise.resolve([mockVRDisplay]);
};

setup(function () {
  this.sinon = sinon.sandbox.create();
  // Stubs to not create a WebGL context since Travis CI runs headless.
  this.sinon.stub(AScene.prototype, 'render');
  this.sinon.stub(AScene.prototype, 'resize');
  this.sinon.stub(AScene.prototype, 'setupRenderer');
});

teardown(function () {
  // Clean up any attached elements.
  let attachedEls = ['canvas', 'a-assets', 'a-scene'];
  let els = document.querySelectorAll(attachedEls.join(','));
  for (let i = 0; i < els.length; i++) {
    els[i].parentNode.removeChild(els[i]);
  }
  this.sinon.restore();
});
