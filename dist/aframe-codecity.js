/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/city.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/city.js":
/*!*********************!*\
  !*** ./src/city.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('charts', {
  schema: {
    repository: { type: 'string', default: 'https://github.com/dlumbrer/VBoard' },
    token: { type: 'string' },
    folder: { type: 'string' }
  },

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,

  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function init() {
    //this.loader = new THREE.FileLoader();
    // Create a new request object
    var request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', 'https://api.github.com/repos/dlumbrer/VBoard/git/trees/integration-aframedc?recursive=1');
    // Send it
    request.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    request.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    request.send();
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function update(newData) {
    var data = this.data;
    if (newData != null && newData.dataPoints) {
      this.loader.load(newData.dataPoints, this.onDataLoaded.bind(this));
    } else if (data.dataPoints) {
      this.loader.load(data.dataPoints, this.onDataLoaded.bind(this));
    } else if (data.type === "totem") {
      generateTotem(data, this.el);
    }
  },
  /**
  * Called when a component is removed (e.g., via removeAttribute).
  * Generally undoes all modifications to the entity.
  */
  remove: function remove() {},

  /**
  * Called on each scene tick.
  */
  // tick: function (t) { },

  /**
  * Called when entity pauses.
  * Use to stop or remove any dynamic or background behavior such as events.
  */
  pause: function pause() {},

  /**
  * Called when entity resumes.
  * Use to continue or add any dynamic or background behavior such as events.
  */
  play: function play() {},

  onDataLoaded: function onDataLoaded(file) {
    var dataPoints = void 0;
    try {
      dataPoints = JSON.parse(file);
    } catch (e) {
      throw new Error('Can\'t parse JSON file. Maybe is not a valid JSON file');
    }

    var properties = this.data;
    var element = this.el;

    startAxisGeneration(element, properties, dataPoints);

    // Legend and pop Up
    var popUp = void 0;
    var show_popup_condition = properties.show_popup_info && properties.type !== "pie" && !properties.pie_doughnut;
    var show_legend_condition = properties.show_legend_info;
    var legend_title = void 0;
    var legend_sel_text = void 0;
    var legend_all_text = void 0;
    var legend_properties = void 0;

    if (show_legend_condition && dataPoints.length > 0) {
      legend_properties = getLegendProperties(dataPoints, properties, element);
      legend_title = generateLegendTitle(legend_properties);
      legend_sel_text = generateLegendSelText(legend_properties, dataPoints[0], properties);
      legend_all_text = generateLegendAllText(legend_properties, getLegendText(dataPoints, dataPoints[0], properties));
      element.appendChild(legend_title);
      element.appendChild(legend_sel_text);
      element.appendChild(legend_all_text);
    }

    // Properties for Pie Chart
    var pie_angle_start = 0;
    var pie_angle_end = 0;
    var pie_total_value = 0;

    if (properties.type === "pie") {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = dataPoints[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          pie_total_value += point['size'];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    //Chart generation
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var point = _step2.value;

        var entity = void 0;
        if (properties.type === "bar") {
          entity = generateBar(point);
        } else if (properties.type === "cylinder") {
          entity = generateCylinder(point);
        } else if (properties.type === "pie") {
          pie_angle_end = 360 * point['size'] / pie_total_value;
          if (properties.pie_doughnut) {
            entity = generateDoughnutSlice(point, pie_angle_start, pie_angle_end, properties.pie_radius);
          } else {
            entity = generateSlice(point, pie_angle_start, pie_angle_end, properties.pie_radius);
          }
          pie_angle_start += pie_angle_end;
        } else {
          entity = generateBubble(point);
        }

        entity.addEventListener('mouseenter', function () {
          this.setAttribute('scale', { x: 1.3, y: 1.3, z: 1.3 });
          if (show_popup_condition) {
            popUp = generatePopUp(point, properties);
            element.appendChild(popUp);
          }
          if (!show_legend_condition) return;
          element.removeChild(legend_sel_text);
          element.removeChild(legend_all_text);
          legend_sel_text = generateLegendSelText(legend_properties, point, properties);
          legend_all_text = generateLegendAllText(legend_properties, getLegendText(dataPoints, point, properties));
          element.appendChild(legend_sel_text);
          element.appendChild(legend_all_text);
        });

        entity.addEventListener('mouseleave', function () {
          this.setAttribute('scale', { x: 1, y: 1, z: 1 });
          if (show_popup_condition) {
            element.removeChild(popUp);
          }
        });

        element.appendChild(entity);
      };

      for (var _iterator2 = dataPoints[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
});

function getPosition(element) {
  var position = { x: 0, y: 0, z: 0 };
  if (element.attributes.position == null) return position;

  var myPos = element.attributes.position.value.split(" ");
  if (myPos[0] !== "" && myPos[0] != null) position['x'] = myPos[0];
  if (myPos[1] !== "" && myPos[1] != null) position['y'] = myPos[1];
  if (myPos[2] !== "" && myPos[2] != null) position['z'] = myPos[2];
  return position;
}

function getRotation(element) {
  var rotation = { x: 0, y: 0, z: 0 };
  if (element.attributes.rotation == null) return rotation;
  var myPos = element.attributes.rotation.value.split(" ");
  if (myPos[0] !== "" && myPos[0] != null) rotation['x'] = myPos[0];
  if (myPos[1] !== "" && myPos[1] != null) rotation['y'] = myPos[1];
  if (myPos[2] !== "" && myPos[2] != null) rotation['z'] = myPos[2];
  return rotation;
}

function generatePopUp(point, properties) {
  var correction = 0;
  if (properties.type === "bar" || properties.type === "cylinder") correction = point['size'] / 2;

  var text = point['label'] + ': ' + point['y'];

  var width = 2;
  if (text.length > 16) width = text.length / 8;

  var entity = document.createElement('a-plane');
  entity.setAttribute('position', { x: point['x'] + correction, y: point['y'] + 3, z: point['z'] });
  entity.setAttribute('height', '2');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
    'value': 'DataPoint:\n\n' + text,
    'align': 'center',
    'width': 6,
    'color': 'black'
  });
  entity.setAttribute('light', {
    'intensity': 0.3
  });
  return entity;
}

function getLegendProperties(dataPoints, properties, element) {
  var height = 2;
  if (dataPoints.length - 1 > 6) height = (dataPoints.length - 1) / 3;

  var max_width_text = properties.show_legend_title.length;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = dataPoints[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var point = _step3.value;

      var point_text = point['label'] + ': ';
      if (properties.type === 'pie') {
        point_text += point['size'];
      } else {
        point_text += point['y'];
      }
      if (point_text.length > max_width_text) max_width_text = point_text.length;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var width = 2;
  if (max_width_text > 9) width = max_width_text / 4.4;

  var chart_position = getPosition(element);
  var position_tit = { x: properties.show_legend_position.x - chart_position.x, y: properties.show_legend_position.y - chart_position.y + height / 2 + 0.5, z: properties.show_legend_position.z - chart_position.z };
  var position_sel_text = { x: properties.show_legend_position.x - chart_position.x, y: properties.show_legend_position.y - chart_position.y + height / 2, z: properties.show_legend_position.z - chart_position.z };
  var position_all_text = { x: properties.show_legend_position.x - chart_position.x, y: properties.show_legend_position.y - chart_position.y, z: properties.show_legend_position.z - chart_position.z };

  var chart_rotation = getRotation(element);
  var rotation = { x: properties.show_legend_rotation.x - chart_rotation.x, y: properties.show_legend_rotation.y - chart_rotation.y, z: properties.show_legend_rotation.z - chart_rotation.z };

  return { height: height, width: width, title: properties.show_legend_title, rotation: rotation, position_tit: position_tit, position_sel_text: position_sel_text, position_all_text: position_all_text };
}

function getLegendText(dataPoints, point, properties) {
  var text = "";

  var auxDataPoints = dataPoints.slice();
  var index = auxDataPoints.indexOf(point);
  auxDataPoints.splice(index, 1);

  for (var i = 0; i < auxDataPoints.length; i++) {
    if (properties.type === 'pie') {
      text += auxDataPoints[i]['label'] + ': ' + auxDataPoints[i]['size'];
    } else {
      text += auxDataPoints[i]['label'] + ': ' + auxDataPoints[i]['y'];
    }
    if (i !== auxDataPoints.length - 1) text += "\n";
  }

  return text;
}

function generateLegendTitle(legendProperties) {
  var entity = document.createElement('a-plane');
  entity.setAttribute('position', legendProperties.position_tit);
  entity.setAttribute('rotation', legendProperties.rotation);
  entity.setAttribute('height', '0.5');
  entity.setAttribute('width', legendProperties.width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text__title', {
    'value': legendProperties.title,
    'align': 'center',
    'width': '8',
    'color': 'black'
  });
  return entity;
}

function generateLegendSelText(legendProperties, point, properties) {
  var value = "";
  if (properties.type === 'pie') {
    value = point['size'];
  } else {
    value = point['y'];
  }

  var entity = document.createElement('a-plane');
  entity.setAttribute('position', legendProperties.position_sel_text);
  entity.setAttribute('rotation', legendProperties.rotation);
  entity.setAttribute('height', '0.5');
  entity.setAttribute('width', legendProperties.width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text__title', {
    'value': point['label'] + ': ' + value,
    'align': 'center',
    'width': '7',
    'color': point['color']
  });
  entity.setAttribute('light', {
    'intensity': '0.3'
  });
  return entity;
}

function generateLegendAllText(legendProperties, text) {
  var entity = document.createElement('a-plane');
  entity.setAttribute('position', legendProperties.position_all_text);
  entity.setAttribute('rotation', legendProperties.rotation);
  entity.setAttribute('height', legendProperties.height);
  entity.setAttribute('width', legendProperties.width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text__title', {
    'value': text,
    'align': 'center',
    'width': '6',
    'color': 'black'
  });
  entity.setAttribute('light', {
    'intensity': '0.3'
  });
  return entity;
}

function generateSlice(point, theta_start, theta_length, radius) {
  var entity = document.createElement('a-cylinder');
  entity.setAttribute('color', point['color']);
  entity.setAttribute('theta-start', theta_start);
  entity.setAttribute('theta-length', theta_length);
  entity.setAttribute('side', 'double');
  entity.setAttribute('radius', radius);
  return entity;
}

function generateDoughnutSlice(point, position_start, arc, radius) {
  var entity = document.createElement('a-torus');
  entity.setAttribute('color', point['color']);
  entity.setAttribute('rotation', { x: 90, y: 0, z: position_start });
  entity.setAttribute('arc', arc);
  entity.setAttribute('side', 'double');
  entity.setAttribute('radius', radius);
  entity.setAttribute('radius-tubular', radius / 4);
  return entity;
}

function generateBubble(point) {
  var entity = document.createElement('a-sphere');
  entity.setAttribute('position', { x: point['x'], y: point['y'], z: point['z'] });
  entity.setAttribute('color', point['color']);
  entity.setAttribute('radius', point['size']);
  return entity;
}

function generateBuilding(point) {
  var entity = document.createElement('a-box');
  entity.setAttribute('position', { x: point['x'] + point['size'] / 2, y: point['y'] / 2, z: point['z'] }); //centering graph
  entity.setAttribute('color', point['color']);
  entity.setAttribute('height', point['y']);
  entity.setAttribute('depth', point['size']);
  entity.setAttribute('width', point['size']);
  return entity;
}

function generateBar(point) {
  var entity = document.createElement('a-box');
  entity.setAttribute('position', { x: point['x'] + point['size'] / 2, y: point['y'] / 2, z: point['z'] }); //centering graph
  entity.setAttribute('color', point['color']);
  entity.setAttribute('height', point['y']);
  entity.setAttribute('depth', point['size']);
  entity.setAttribute('width', point['size']);
  return entity;
}

function generateCylinder(point) {
  var entity = document.createElement('a-cylinder');
  entity.setAttribute('position', { x: point['x'] + point['size'] / 2, y: point['y'] / 2, z: point['z'] }); //centering graph
  entity.setAttribute('color', point['color']);
  entity.setAttribute('height', point['y']);
  entity.setAttribute('radius', point['size'] / 2);
  return entity;
}

var removeAllChildren = function removeAllChildren(element, children) {
  children.forEach(function (child) {
    element.el.removeChild(child);
  });
};

function generateTotemTitle(width, position) {
  var entity = document.createElement('a-plane');
  entity.setAttribute('position', position);
  entity.setAttribute('scale', { x: 1, y: 1, z: 0.01 });
  entity.setAttribute('height', '0.5');
  entity.setAttribute('color', 'blue');
  entity.setAttribute('width', width);
  entity.setAttribute('text__title', {
    'value': 'Select dataSource:',
    'align': 'center',
    'width': '9',
    'color': 'white'
  });
  return entity;
}

function generateTotemSlice(properties, entity_id_list, dataPoints_path) {
  var entity = document.createElement('a-plane');
  entity.setAttribute('position', properties.position);
  entity.setAttribute('scale', { x: 1, y: 1, z: 0.01 });
  entity.setAttribute('height', '0.5');
  entity.setAttribute('width', properties.width);
  entity.setAttribute('text__title', {
    'value': properties.name,
    'align': 'center',
    'width': '8',
    'color': 'black'
  });

  entity.addEventListener('click', function () {
    console.log(dataPoints_path);
    var entity_list = entity_id_list.split(',');
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = entity_list[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var id = _step4.value;

        var el = document.querySelector('#' + id).components.charts;
        removeAllChildren(el, el.el.getChildEntities());
        el.update({ dataPoints: dataPoints_path });
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  });
  return entity;
}

function getTotemWidth(dataPoints_list) {
  var max_width = 0;
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = dataPoints_list[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var dataPoints = _step5.value;

      var name = dataPoints.split('/')[dataPoints.split('/').length - 1];
      if (name.length > max_width) max_width = name.length;
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5.return) {
        _iterator5.return();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  var width = 2;
  if (max_width > 9) width = max_width / 4.4;
  return width;
}

function generateTotem(properties, element) {
  if (properties.dataPoints_list === '') return;

  var dataPoints_list = properties.dataPoints_list.split(',');
  var position = getPosition(element);
  var width = getTotemWidth(dataPoints_list);
  element.appendChild(generateTotemTitle(width, position));
  var offset = 0.75;
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = dataPoints_list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var dataPoints = _step6.value;

      var dataProperties = {};
      dataProperties['position'] = { x: position.x, y: parseInt(position.y) - offset, z: position.z };
      dataProperties['name'] = dataPoints.split('/')[dataPoints.split('/').length - 1];
      dataProperties['width'] = width;
      element.appendChild(generateTotemSlice(dataProperties, properties.entity_id_list, dataPoints));
      offset += 0.65;
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }
}

function startAxisGeneration(element, properties, dataPoints) {
  if (!properties.axis_visible || properties.type === "pie") return;

  if (properties.axis_length === 0) {
    var adaptive_props = getAdaptiveAxisProperties(dataPoints);
    properties.axis_length = adaptive_props.max;
    if (properties.axis_negative) properties.axis_negative = adaptive_props.has_negative;
  }

  if (properties.axis_grid || properties.axis_grid_3D) {
    generateGridAxis(element, properties);
  } else {
    generateAxis(element, properties);
  }
}

function generateAxis(element, properties) {
  var axis_length = properties.axis_length;
  var axis_position = properties.axis_position;
  var axis_color = properties.axis_color;

  var tick_separation = properties.axis_tick_separation;
  var tick_length = properties.axis_tick_length;
  var tick_color = properties.axis_tick_color;

  var axis_negative = properties.axis_negative;
  var axis_negative_offset = 0;

  var axis_text = properties.axis_text;
  var axis_text_color = properties.axis_text_color;
  var axis_text_size = properties.axis_text_size;

  var _arr = ['x', 'y', 'z'];
  for (var _i = 0; _i < _arr.length; _i++) {
    var axis = _arr[_i];

    var line_end = { x: axis_position.x, y: axis_position.y, z: axis_position.z };
    line_end[axis] = axis_length + axis_position[axis];

    var line_start = { x: axis_position.x, y: axis_position.y, z: axis_position.z };

    if (axis_negative) {
      axis_negative_offset = axis_length + 1;
      line_start[axis] = -axis_length + axis_position[axis];
    }

    var axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__' + axis, {
      'start': line_start,
      'end': line_end,
      'color': axis_color
    });

    for (var tick = tick_separation - axis_negative_offset; tick <= axis_length; tick += tick_separation) {
      var tick_start = void 0;
      var tick_end = void 0;

      if (axis === 'x') {
        tick_start = { x: axis_position.x + tick, y: axis_position.y - tick_length, z: axis_position.z };
        tick_end = { x: axis_position.x + tick, y: axis_position.y + tick_length, z: axis_position.z };
      } else if (axis === 'y') {
        tick_start = { x: axis_position.x, y: axis_position.y + tick, z: axis_position.z - tick_length };
        tick_end = { x: axis_position.x, y: axis_position.y + tick, z: axis_position.z + tick_length };
      } else {
        tick_start = { x: axis_position.x - tick_length, y: axis_position.y, z: axis_position.z + tick };
        tick_end = { x: axis_position.x + tick_length, y: axis_position.y, z: axis_position.z + tick };
      }

      axis_line.setAttribute('line__' + tick, {
        'start': tick_start,
        'end': tick_end,
        'color': tick_color
      });

      if (axis_text) {
        var _axis_text = document.createElement('a-text');
        _axis_text.setAttribute('position', tick_start);

        if (axis === 'x') {
          _axis_text.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 5
          });
        } else if (axis === 'y') {
          _axis_text.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 4
          });
        } else {
          _axis_text.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 4.5
          });
        }

        element.appendChild(_axis_text);
      }
    }
    element.appendChild(axis_line);
  }
}

function generateGridAxis(element, properties) {
  var axis_length = properties.axis_length;
  var axis_position = properties.axis_position;
  var axis_color = properties.axis_color;

  var axis_negative = properties.axis_negative;
  var axis_negative_offset = 0;
  var axis_negative_limit = 0;
  var axis_grid_3D = properties.axis_grid_3D;

  var axis_text = properties.axis_text;
  var axis_text_color = properties.axis_text_color;
  var axis_text_size = properties.axis_text_size;

  var _arr2 = ['x', 'y', 'z'];
  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var axis = _arr2[_i2];

    var line_end = { x: axis_position.x, y: axis_position.y, z: axis_position.z };
    line_end[axis] = axis_length + axis_position[axis];

    var line_start = { x: axis_position.x, y: axis_position.y, z: axis_position.z };

    if (axis_negative) {
      axis_negative_offset = axis_length;
      axis_negative_limit = axis_length + 1;
      line_start[axis] = -axis_length + axis_position[axis];
    }

    var axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__' + axis, {
      'start': line_start,
      'end': line_end,
      'color': axis_color
    });

    for (var tick = 1 - axis_negative_limit; tick <= axis_length; tick++) {
      var tick_start = void 0;
      var tick_end = void 0;
      var grid_start = void 0;
      var grid_end = void 0;

      if (axis === 'x') {
        tick_start = { x: axis_position.x + tick, y: axis_position.y - axis_negative_offset, z: axis_position.z };
        tick_end = { x: axis_position.x + tick, y: axis_position.y + axis_length, z: axis_position.z };
        grid_start = { x: axis_position.x + tick, y: axis_position.y, z: axis_position.z - axis_negative_offset };
        grid_end = { x: axis_position.x + tick, y: axis_position.y, z: axis_position.z + axis_length };
      } else if (axis === 'y') {
        tick_start = { x: axis_position.x, y: axis_position.y + tick, z: axis_position.z - axis_negative_offset };
        tick_end = { x: axis_position.x, y: axis_position.y + tick, z: axis_position.z + axis_length };
        grid_start = { x: axis_position.x - axis_negative_offset, y: axis_position.y + tick, z: axis_position.z };
        grid_end = { x: axis_position.x + axis_length, y: axis_position.y + tick, z: axis_position.z };
      } else {
        tick_start = { x: axis_position.x - axis_negative_offset, y: axis_position.y, z: axis_position.z + tick };
        tick_end = { x: axis_position.x + axis_length, y: axis_position.y, z: axis_position.z + tick };
        grid_start = { x: axis_position.x, y: axis_position.y - axis_negative_offset, z: axis_position.z + tick };
        grid_end = { x: axis_position.x, y: axis_position.y + axis_length, z: axis_position.z + tick };
      }

      if (axis_text) {
        var _axis_text2 = document.createElement('a-text');
        _axis_text2.setAttribute('position', tick_end);

        if (axis === 'x') {
          _axis_text2.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 5
          });
        } else if (axis === 'y') {
          _axis_text2.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 4
          });
        } else {
          _axis_text2.setAttribute('text__' + tick, {
            'value': Math.round(tick * 100) / 100,
            'width': axis_text_size,
            'color': axis_text_color,
            'xOffset': 4.5
          });
        }

        element.appendChild(_axis_text2);
      }

      axis_line.setAttribute('line__' + tick, {
        'start': tick_start,
        'end': tick_end,
        'color': axis_color
      });

      axis_line.setAttribute('line__' + tick + axis_length, {
        'start': grid_start,
        'end': grid_end,
        'color': axis_color
      });

      if (!axis_grid_3D) continue;
      for (var grid = 1 - axis_negative_offset; grid <= axis_length; grid++) {
        var sub_grid_start = void 0;
        var sub_grid_end = void 0;

        if (axis === 'x') {
          sub_grid_start = { x: axis_position.x + tick, y: axis_position.y - axis_negative_offset, z: axis_position.z + grid };
          sub_grid_end = { x: axis_position.x + tick, y: axis_position.y + axis_length, z: axis_position.z + grid };
        } else if (axis === 'y') {
          sub_grid_start = { x: axis_position.x + grid, y: axis_position.y + tick, z: axis_position.z - axis_negative_offset };
          sub_grid_end = { x: axis_position.x + grid, y: axis_position.y + tick, z: axis_position.z + axis_length };
        } else {
          sub_grid_start = { x: axis_position.x - axis_negative_offset, y: axis_position.y + grid, z: axis_position.z + tick };
          sub_grid_end = { x: axis_position.x + axis_length, y: axis_position.y + grid, z: axis_position.z + tick };
        }

        axis_line.setAttribute('line__' + tick + grid + axis_length, {
          'start': sub_grid_start,
          'end': sub_grid_end,
          'color': axis_color
        });
      }
    }
    element.appendChild(axis_line);
  }
}

function getAdaptiveAxisProperties(dataPoints) {
  var max = 0;
  var has_negative = false;

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = dataPoints[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var point = _step7.value;

      if (point.x < 0 || point.y < 0 || point.z < 0) has_negative = true;

      var point_x = Math.abs(point.x);
      var point_y = Math.abs(point.y);
      var point_z = Math.abs(point.z);

      if (point_x > max) max = point_x;
      if (point_y > max) max = point_y;
      if (point_z > max) max = point_z;
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  return { max: max, has_negative: has_negative };
}

/***/ })

/******/ });
//# sourceMappingURL=aframe-codecity.js.map