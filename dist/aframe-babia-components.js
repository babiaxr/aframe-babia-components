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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('debug_data', {
    schema: {
        inputEvent: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;

        if (data.input && data.output) {
            listenEvent(data, el);
        }
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update geometry component
         */
        if (data !== oldData) {
            if (data.inputEvent !== oldData.inputEvent) {
                console.log("Change event because from has changed")
                // Remove the event of the old interaction
                el.removeEventListener(data.inputEvent, function (e) { })
                // Listen and map the new event
                listenEvent(data, el);
            }
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let listenEvent = (data, el) => {
    el.addEventListener(data.inputEvent, function (e) {
        // Dispatch/Trigger/Fire the event
        showDebugPlane(data, el)
    });
}

let showDebugPlane = (data, el) => {
    if (!el.querySelector('.debug_data')) {
        // Get data from the attribute of the entity
        let debugPanel = generateDebugPanel(data, el, el.getAttribute('baratariaData'));
        el.appendChild(debugPanel)
    }
}

function generateDebugPanel(data, el, dataToShow) {
    const HEIGHT_PLANE_DEBUG = 10
    const WIDTH_PLANE_DEBUG = 10
    let entity = document.createElement('a-plane');
    entity.setAttribute('color', 'white');
    entity.setAttribute('class', 'debug_data');
    entity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    entity.setAttribute('height', WIDTH_PLANE_DEBUG);
    let parentPos = el.getAttribute("position")
    let parentWidth = 0;
    let parentHeight = 0;
    if (el.getAttribute("geometry")) {
        if (el.components.geometry.data.primitive === "box") {
            parentWidth = el.getAttribute("geometry").width/2
            parentHeight = el.getAttribute("geometry").height/2
        } else if (el.components.geometry.data.primitive === "sphere") {
            parentWidth = el.getAttribute("geometry").radius
        } else {
            parentWidth = 0
            parentHeight = 0
        }
        
    }
    entity.setAttribute('position', { x: parentPos.x + parentWidth + WIDTH_PLANE_DEBUG / 2, y: 0 - parentHeight + HEIGHT_PLANE_DEBUG / 2, z: parentPos.z });

    let textEntity = document.createElement('a-text');
    textEntity.setAttribute('value', JSON.stringify(dataToShow));
    textEntity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    textEntity.setAttribute('height', WIDTH_PLANE_DEBUG);
    textEntity.setAttribute('color', 'black');
    textEntity.setAttribute('position', { x: 0 - entity.getAttribute('width') / 2, y: 0 - el.getAttribute("height") / 2, z: 0 });

    entity.appendChild(textEntity)
    return entity;
}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('filterdata', {
  dependencies: ['querier', 'vismapper'],
  schema: {
    from: { type: 'string' },
    filter: { type: 'string' }
  },

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,

  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function () {
    let data = this.data;
    let el = this.el;

    let querierElement = document.getElementById(data.from)
    if (querierElement.getAttribute('baratariaData')) {
      let dataFromQuerier = JSON.parse(querierElement.getAttribute('baratariaData'));
      // Get if key or filter
      saveEntityData(data, el, dataFromQuerier, data.filter)
    } else {
      // Get if key or filter
      document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
        saveEntityData(data, el, e.detail, data.filter)
        el.setAttribute("filterdata", "dataRetrieved", data.dataRetrieved)
      })
    }
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    let data = this.data;
    let el = this.el;

    // If entry it means that the data changed
    if (data.dataRetrieved !== oldData.dataRetrieved) {
      el.setAttribute("vismapper", "dataToShow", JSON.stringify(data.dataRetrieved))
    }

    if (data.from !== oldData.from) {
      console.log("Change event because from has changed")
      // Remove the event of the old querier
      document.getElementById(data.from).removeEventListener('dataReady' + oldData.from, function (e) { })
      // Listen the event when querier ready
      document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
        saveEntityData(data, el, e.detail[data.filter])
        el.setAttribute("vismapper", "dataToShow", JSON.stringify(data.dataRetrieved))
      });
    }

  },
  /**
  * Called when a component is removed (e.g., via removeAttribute).
  * Generally undoes all modifications to the entity.
  */
  remove: function () { },

  /**
  * Called on each scene tick.
  */
  // tick: function (t) { },

  /**
  * Called when entity pauses.
  * Use to stop or remove any dynamic or background behavior such as events.
  */
  pause: function () { },

  /**
  * Called when entity resumes.
  * Use to continue or add any dynamic or background behavior such as events.
  */
  play: function () { },

})

let saveEntityData = (data, el, dataToSave, filter) => {
  if (filter) {
    data.dataRetrieved = dataToSave[filter]
    el.setAttribute("baratariaData", JSON.stringify(dataToSave[filter]))
  } else {
    data.dataRetrieved = dataToSave
    el.setAttribute("baratariaData", JSON.stringify(dataToSave))
  }
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geo3dbarchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data !== oldData.data) {
            console.log("Generating barchart...")
            generateBarChart(data, el)
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let generateBarChart = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)

        let colorid = 0
        let maxColorId = 0
        let stepX = 0
        let maxX = 0
        let keys_used = {}
        let stepZ = 0
        let maxZ = 0
        let z_axis = {}
        let xaxis_dict = []
        let zaxis_dict = []

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.size; }))

        for (let bar of dataToPrint) {
            // Check if used in order to put the bar in the parent row
            if (keys_used[bar['key']]) {
                stepX = keys_used[bar['key']].posX
                colorid = keys_used[bar['key']].colorid
            } else {
                stepX = maxX
                colorid = maxColorId
                //Save in used
                keys_used[bar['key']] = {
                    "posX": maxX,
                    "colorid": maxColorId
                }

                //Axis dict
                let bar_printed = {
                    colorid: colorid,
                    posX: stepX,
                    key: bar['key']
                }
                xaxis_dict.push(bar_printed)

                maxX += widthBars + widthBars / 4
                maxColorId++
            }

            // Get Z val
            if (z_axis[bar['key2']]) {
                stepZ = z_axis[bar['key2']].posZ
            } else {
                stepZ = maxZ
                //Save in used
                z_axis[bar['key2']] = {
                    "posZ": maxZ
                }

                //Axis dict
                let bar_printed = {
                    colorid: colorid,
                    posZ: stepZ,
                    key: bar['key2']
                }
                zaxis_dict.push(bar_printed)

                maxZ += widthBars + widthBars / 4
            }

            let barEntity = generateBar(bar['size'], widthBars, colorid, stepX, stepZ);

            //Prepare legend
            if (data.legend) {
                showLegend(barEntity, bar)
            }

            element.appendChild(barEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict)
            showZAxis(element, maxZ, zaxis_dict)
            showYAxis(element, maxY)
        }
    }
}

let widthBars = 1

function generateBar(size, width, color, positionX, positionZ) {
    console.log("Generating bar...")
    let entity = document.createElement('a-box');
    entity.setAttribute('color', colors[color]);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    entity.setAttribute('height', size);
    entity.setAttribute('position', { x: positionX, y: size / 2, z: positionZ });
    return entity;
}

function generateLegend(bar) {
    let text = bar['key'] + ': ' + bar['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: bar['size'] / 2 + 1, z: widthBars + 0.1 });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('light', {
        'intensity': 0.3
    });
    return entity;
}

function showLegend(barEntity, bar) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bar);
        this.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bars_printed) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__xaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: xEnd, y: 0, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBars / 2 + widthBars / 4) });
    axis.appendChild(axis_line)

    //Print keys
    bars_printed.forEach(e => {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'left',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBars-5 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bars_printed) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__xaxis', {
        'start': { x: 0, y: 0, z: -(widthBars / 2 + widthBars / 4) },
        'end': { x: 0, y: 0, z: zEnd },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: -widthBars, y: 0, z: 0 });
    axis.appendChild(axis_line)

    //Print keys
    bars_printed.forEach(e => {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: -widthBars-5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: -widthBars, y: yEnd, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBars / 2 + widthBars / 4) });
    axis.appendChild(axis_line)

    for (let i = 0; i <= yEnd; i++) {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': i,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        key.setAttribute('position', { x: -widthBars-5.2, y: i, z: -(widthBars / 2 + widthBars / 4) })
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

let colors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geobubbleschart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data !== oldData.data) {
            console.log("Generating geobubbleschart...")
            generateBubblesChart(data, el)
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let generateBubblesChart = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)

        let colorid = 0
        let maxColorId = 0
        let stepX = 0
        let maxX = 0
        let keys_used = {}
        let stepZ = 0
        let maxZ = 0
        let z_axis = {}
        let xaxis_dict = []
        let zaxis_dict = []

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))

        widthBubbles = Math.max.apply(Math, Object.keys( dataToPrint ).map(function (o) { return dataToPrint[o].radius; }))

        for (let bubble of dataToPrint) {
            // Check if used in order to put the bubble in the parent row
            if (keys_used[bubble['key']]) {
                stepX = keys_used[bubble['key']].posX
                colorid = keys_used[bubble['key']].colorid
            } else {
                stepX = maxX
                colorid = maxColorId
                //Save in used
                keys_used[bubble['key']] = {
                    "posX": maxX,
                    "colorid": maxColorId
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posX: stepX,
                    key: bubble['key']
                }
                xaxis_dict.push(bubble_printed)

                maxX += widthBubbles + widthBubbles / 4
                maxColorId++
            }

            // Get Z val
            if (z_axis[bubble['key2']]) {
                stepZ = z_axis[bubble['key2']].posZ
            } else {
                stepZ = maxZ
                //Save in used
                z_axis[bubble['key2']] = {
                    "posZ": maxZ
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posZ: stepZ,
                    key: bubble['key2']
                }
                zaxis_dict.push(bubble_printed)

                maxZ += widthBubbles + widthBubbles / 4
            }

            let bubbleEntity = generateBubble(bubble['radius'], bubble['height'], widthBubbles, colorid, stepX, stepZ);

            //Prepare legend
            if (data.legend) {
                showLegend(bubbleEntity, bubble)
            }

            element.appendChild(bubbleEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict)
            showZAxis(element, maxZ, zaxis_dict)
            showYAxis(element, maxY)
        }
    }
}

let widthBubbles = 0

function generateBubble(radius, height, width, color, positionX, positionZ) {
    console.log("Generating bubble...")
    let entity = document.createElement('a-sphere');
    entity.setAttribute('color', colors[color]);
    entity.setAttribute('radius', radius);
    entity.setAttribute('position', { x: positionX, y: radius + height, z: positionZ });
    return entity;
}

function generateLegend(bubble) {
    let text = bubble['key'] + ': \n Radius:' + bubble['radius'] + '\nHeight:' + bubble['height'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: bubble['radius'] + 1, z: bubble['radius'] + 0.1 });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('light', {
        'intensity': 0.3
    });
    return entity;
}

function showLegend(bubbleEntity, bubble) {
    bubbleEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bubble);
        this.appendChild(legend);
    });

    bubbleEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bubbles_printed) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__xaxis', {
        'start': { x: -widthBubbles, y: 0, z: 0 },
        'end': { x: xEnd, y: 0, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBubbles / 2 + widthBubbles / 4) });
    axis.appendChild(axis_line)

    //Print keys
    bubbles_printed.forEach(e => {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'left',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBubbles-3.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bubbles_printed) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__xaxis', {
        'start': { x: 0, y: 0, z: -(widthBubbles / 2 + widthBubbles / 4) },
        'end': { x: 0, y: 0, z: zEnd },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: -widthBubbles, y: 0, z: 0 });
    axis.appendChild(axis_line)

    //Print keys
    bubbles_printed.forEach(e => {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: -widthBubbles-5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBubbles, y: 0, z: 0 },
        'end': { x: -widthBubbles, y: yEnd+1, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBubbles / 2 + widthBubbles / 4) });
    axis.appendChild(axis_line)

    for (let i = 0; i <= yEnd; i++) {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': i,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        key.setAttribute('position', { x: -widthBubbles-5.2, y: i, z: -(widthBubbles / 2 + widthBubbles / 4) })
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

let colors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
  }
  
  /**
   * CodeCity component for A-Frame.
   */
  AFRAME.registerComponent('codecity', {
    schema: {
      // Absolute size (width and depth will be used for proportions)
      absolute: {
        type: 'boolean',
        default: false
      },
      width: {
        type: 'number',
        default: 20
      },
      depth: {
        type: 'number',
        default: 20
      },
      // Algoritm to split rectangle in buildings: naive, pivot
      split: {
        type: 'string',
        default: 'naive'
      },
      // Data to visualize
      data: {
        type: 'string',
        default: JSON.stringify({id: "CodeCity", area: 1, height: 1})
      },
      // Field in data items to represent as area
      farea: {
        type: 'string',
        default: 'area'
      },
      // Field in data items to represent as area
      fheight: {
        type: 'string',
        default: 'height'
      },
      // Merged geometries in a single mesh (improves performance)
      merged: {
        type: 'boolean',
        default: true
      },
      // Use buffered geometries (improves performance)
      buffered: {
        type: 'boolean',
        default: false
      },
      // Base: color
      building_color: {
        type: 'color',
        default: '#E6B9A1'
      },
      building_model: {
        type: 'string',
        default: null
      },
      // Base (build it or not)
      base: {
        type: 'boolean',
        default: true
      },
      // Base: thickness
      base_thick: {
        type: 'number',
        default: 0.2
      },
      // Base: color
      base_color: {
        type: 'color',
        default: '#98e690'
      },
      // Size of border around buildings (streets are built on it)
      border: {
        type: 'number',
        default: 1
      },
      // Extra factor for total area with respect to built area
      extra: {
        type: 'number',
        default: 1.4
      },
      // Zone: elevation for each "depth" of quarters, over the previous one
      zone_elevation: {
        type: 'number',
        default: 1
      },
      // Unique color for each zone
      unicolor: {
        type: 'color',
        default: false
      },
      // Show materials as wireframe
      wireframe: {
        type: 'boolean',
        default: false
      },
      colormap: {
        type: 'array',
        default: ['blue', 'green', 'yellow', 'brown', 'orange',
                'magenta', 'grey', 'cyan', 'azure', 'beige', 'blueviolet',
                'coral', 'crimson', 'darkblue', 'darkgrey', 'orchid',
                'olive', 'navy', 'palegreen']
      },
    },
  
    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,
  
    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
      let data = this.data;
      let el = this.el;
  
      this.zone_data = JSON.parse(data.data);
      let zone = new Zone({data: this.zone_data,
                           extra: function(area) {return area*data.extra;},
                           farea: data.farea, fheight: data.fheight});
  
      let width, depth;
      if (data.absolute == true) {
        width = Math.sqrt(zone.areas.canvas) * data.width / data.depth;
        depth = zone.areas.canvas / width;
      } else {
        width = data.width;
        depth = data.depth
      };
  
      // New levels are entities relative (children of the previous level) or not
      let relative = true;
      if (data.merged) {
        relative = false;
      };
      let canvas = new Rectangle({width: width, depth: depth, x: 0, z: 0});
      zone.add_rects({rect: canvas, split: data.split, relative: relative});
      let base = document.createElement('a-entity');
      let visible = true;
      if (data.merged) {
        base.addEventListener('loaded', (e) => {
          if (data.buffered) {
            base.setAttribute('buffer-geometry-merger', {preserveOriginal: true,
                                                         materialColors: true});
            base.setAttribute('material', {vertexColors: 'face'});
          } else {
            base.setAttribute('geometry-merger', {preserveOriginal: true});
            base.setAttribute('material', {vertexColors: 'face'});
          };
        });
        if (data.buffered) {
          visible = true;
        } else {
          visible = false;
        };
      };
      el.appendChild(base);
  
      zone.draw_rects({
          ground: canvas, el: base, base: data.base,
          level: 0, elevation: 0, relative: relative,
          base_thick: data.base_thick,
          wireframe: data.wireframe,
          building_color: data.building_color, base_color: data.base_color,
          model: data.building_model, visible: visible,
          buffered: data.buffered});
    },
  
    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
    },
  
    /**
     * Called when a component is removed (e.g., via removeAttribute).
     * Generally undoes all modifications to the entity.
     */
    remove: function () { },
  
    /**
     * Called on each scene tick.
     */
    // tick: function (t) { },
  
    /**
     * Called when entity pauses.
     * Use to stop or remove any dynamic or background behavior such as events.
     */
    pause: function () { },
  
    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { },
  
  });
  
  /*
   * Autoscale a component
   *
   * Based on code by Don McCurdy, used to autoscale buildings
   * https://stackoverflow.com/questions/49379435/aframe-how-to-reset-default-scale-after-loading-the-gltf-model
   */
  AFRAME.registerComponent('autoscale', {
    schema: {type: 'vec3', default: {x:1, y:1, z:1}},
    init: function () {
      this.scale();
      this.el.addEventListener('object3dset', () => this.scale());
    },
    scale: function () {
      const el = this.el;
      const data = this.data;
      const span = new THREE.Vector3(data.x, data.y, data.z);
      const mesh = el.getObject3D('mesh');
  
      if (!mesh) return;
  
      // Compute bounds.
      const bbox = new THREE.Box3().setFromObject(mesh);
  
      // Normalize scale.
      const scale = span.divide(bbox.getSize());
      mesh.scale.set(scale.x, scale.y, scale.z);
  
      // Recenter.
      const offset = bbox.getCenter().multiply(scale);
      mesh.position.sub(offset);
    }
  });
  
  ///*
  // * geometry-merger component
  // * Code from https://github.com/supermedium/superframe/blob/master/components/geometry-merger/
  // * (sligihtly modified to add property for adding colors to faces in merged mesh)
  // */
  //AFRAME.registerComponent('geometry-merger', {
  //  schema: {
  //    preserveOriginal: {default: false},
  //    materialColors: {default: true}
  //  },
  //
  //  init: function () {
  //    var faceIndexEnd;
  //    var faceIndexStart;
  //    var self = this;
  //
  //    this.geometry = new THREE.Geometry();
  //    this.mesh = new THREE.Mesh(this.geometry);
  //    this.el.setObject3D('mesh', this.mesh);
  //
  //    this.faceIndex = {};  // Keep index of original entity UUID to new face array.
  //    this.vertexIndex = {};  // Keep index of original entity UUID to vertex array.
  //
  //    this.el.object3D.traverse(function (mesh) {
  //      if (mesh.type !== 'Mesh') { return; }
  //      if (mesh === self.mesh) { return; }
  //
  //      self.faceIndex[mesh.parent.uuid] = [
  //        self.geometry.faces.length,
  //        self.geometry.faces.length + mesh.geometry.faces.length - 1
  //      ];
  //
  //      self.vertexIndex[mesh.parent.uuid] = [
  //        self.geometry.vertices.length,
  //        self.geometry.vertices.length + mesh.geometry.vertices.length - 1
  //      ];
  //
  //      // If material color applied to all faces, copy colors to faces
  ////      if (self.data.materialColors && (mesh.material.vertexColors === THREE.NoColors)) {
  ////        let color = mesh.material.color;
  ////        for ( const face of mesh.geometry.faces) {
  ////          face.color.set( color );
  ////        };
  ////      };
  //
  //      // Merge. Use parent's matrix due to A-Frame's <a-entity>(Group-Mesh) hierarchy.
  //      mesh.parent.updateMatrix();
  //      self.geometry.merge(mesh.geometry, mesh.parent.matrix);
  //
  //      // Remove mesh if not preserving.
  //      if (!self.data.preserveOriginal) { mesh.parent.remove(mesh); }
  //    });
  //  }
  //});
  
  //AFRAME.registerComponent('buffer-geometry-merger', {
  //  schema: {
  //    preserveOriginal: {default: false}
  //  },
  //
  //  init: function () {
  //    var geometries = [];
  //    var self = this;
  //
  //    this.el.sceneEl.object3D.updateMatrixWorld()
  //    this.el.object3D.traverse(function (mesh) {
  //      if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; }
  //      mesh.geometry.applyMatrix(mesh.matrixWorld);
  //      geometries.push(mesh.geometry.clone());
  //      // Remove mesh if not preserving.
  //      if (!self.data.preserveOriginal) { mesh.parent.remove(mesh); }
  //    });
  //
  //    const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
  //    this.mesh = new THREE.Mesh(geometry);
  //    this.el.setObject3D('mesh', this.mesh);
  //  }
  //});
  
  /*
   * face-colors component
   * From https://github.com/supermedium/superframe/blob/master/components/geometry-merger/examples/basic/index.html
   */
  AFRAME.registerComponent('face-colors', {
    dependencies: ['geometry'],
    schema: {
      color: {default: '#FFF'}
    },
    init: function () {
      var geometry;
      var i;
      geometry = this.el.getObject3D('mesh').geometry;
      for (i = 0; i < geometry.faces.length; i++) {
        geometry.faces[i].color.set(this.data.color);
      }
      geometry.colorsNeedUpdate = true;
    }
  });
  
  /*
   * Class for storing zone, with all its subzones and items, to show as buildings
   */
  let Zone = class {
    /*
     * Constructor, based on a tree.
     *
     * Each node of the tree must include 'id' and 'children',
     * except if it is a leaf, in wihc case must include 'id'
     * and fields for computing area and height.
     * The tree can also come as a JSON-encoded string.
     *
     * @constructor
     * @param {object} data Tree with data to store in the object
     * @param {function} extra Function to compute extra area for canvas, based on area
     * @param {string} farea Field to consider as area in leaf items
     * @param {string} fheight Field to consider as height in leaf items
     */
    constructor({data, extra=function(area) {return area;},
                 farea='area', fheight='height'}) {
      this.data = data;
      this.id = this.data.id;
      this.extra = extra;
      this.farea = farea;
      this.fheight = fheight;
      this.areas = this.areas_tree();
      // Root element (a-entity) of the codecity for this Zone
      this.el = null;
      // Number of rectangles to be drawn as buildings, but still not in the scene
      this.pending_rects = 0;
    }
  
    /*
     * Compute areas for each node of the subree at node
     *
     *  Annotates each node with:
     *  .area: accumulated area of all children
     *  .inner: area of the inner rectangle (acc. canvas of all children)
     *  .canvas: area of the canvas for this node
     */
    areas_tree({data=this.data, level=0} = {}) {
      let data_node = data;
      let node = {data: data_node};
      if ('children' in data_node) {
        node.inner = 0;
        node.area = 0;
        node.children = [];
        for (const data_child of data_node.children) {
          let child = this.areas_tree({data: data_child, level: level+1});
          node.inner += child.canvas;
          node.area += child.area;
          node.children.push(child);
        };
      } else {
        // Leaf node
        node.area = data_node[this.farea];
        node.inner = node.area;
      };
      node.canvas = this.extra(node.inner, level);
      return node;
    }
  
    /**
     * Add rectangles to a canvas rectangle, according to info in an areas subtree
     *
     * @param {Rectangle} rect Rectangle acting as canvas for the next level
     * @param {Object} area Node of an areas tree, as it was composed by areas_tree()
     */
    add_rects({rect, area=this.areas, relative=true, split='naive'} = {}) {
      // Make this the rectangle for the area, and compute its inner dimensions
      area.rect = rect;
      area.rect.inner(area.canvas, area.inner);
      if ('children' in area) {
        let child_areas = new Values(area.children.map(child => child.canvas),
                                     area.inner);
        let child_rect;
        if (split === 'naive') {
          child_rect = area.rect.split(child_areas, relative);
          console.log("Naive split");
        } else if (split === 'pivot') {
          child_rect = area.rect.split_pivot(child_areas, relative);
          console.log("Pivot split");
        } else {
          throw new Error("CodeCity: Unknwon split method");
        };
        for (const i in area.children) {
          this.add_rects({rect: child_rect[i],
                          area: area.children[i],
                          relative: relative,
                          split: split});
        };
      };
    }
  
    /**
     * Draw all rectangles for an area tree
     *
     * @param {Rectangle} ground Rectangle for the ground
     * @param {DOMElement} el DOM element that will be parent
     * @param {boolean} visible Draw elements with visible meshes
     * @return {number} Number of rectangles drawn
     */
    draw_rects({ground, el, area=this.areas,
                level=0, elevation=0, relative=true,
                base_thick=.2, wireframe=false,
                building_color="red", base_color="green", model=null,
                visible=true, buffered=false}) {
      if (level === 0) {
        this.el = el;
      };
      let pending_rects = this.pending_rects;
      if ('children' in area) {
        // Create base for this area, and go recursively to the next level
        let base = area.rect.box({elevation: elevation,
                                  height: base_thick,
                                  color: base_color, inner: false,
                                  wireframe: wireframe, visible: visible,
                                  buffered: buffered});
        el.appendChild(base);
        let root_el = base;
        if (!relative) { root_el = el };
        for (const child of area.children) {
          let next_elevation = base_thick/2;
          if (!relative) { next_elevation = elevation+base_thick };
          this.draw_rects({ground: area.rect, el: root_el, area: child,
                           level: level+1, elevation: next_elevation,
                           relative: relative,
                           building_color: building_color, base_color: base_color,
                           model: model,
                           base_thick: base_thick, wireframe: wireframe,
                           visible: visible, buffered: buffered});
        };
      } else {
        // Leaf node, create the building
        let height = area.data[this.fheight];
        let box = area.rect.box({height: area.data[this.fheight],
                                 elevation: elevation,
                                 wireframe: wireframe,
                                 color: building_color,
                                 model: model,
                                 visible: visible,
                                 buffered: buffered});
        el.appendChild(box);
      };
    };
  };
  
  
  /**
   * Class for lists (arrays) of values
   */
  let Values = class {
    /*
     * @param {Array} values Array with values (Number)
     */
    constructor(values, total) {
      this.items = values;
      if (typeof(total) !== 'undefined') {
        this.total = total;
      } else {
        this.total = values.reduce((acc, a) => acc+a, 0);
      };
    }
  
    imax () {
      let largest = this.items[0];
      let largest_i = 0;
  
      for (let i = 0; i < this.items.length; i++) {
        if (largest < this.items[i] ) {
            largest = this.items[i];
            largest_i = i;
        };
      };
      return largest_i;
    }
  
    static range(start, length) {
      var indexes = [];
      for (let i = start; i < start+length; i++) {
        indexes.push(i);
      };
      return indexes;
    }
  
    /*
     * Return the scaled area, for a rectangle area, of item i
     *
     * @param {Number} area Total area of the rectangle
     * @param {Integer} item Item number (starting in 0)
     */
    scaled_area(area, item) {
      return this.items[item] * area / this.total;
    }
  
    /*
     * Produce a Values object for items in positions
     *
     * @param {array} positions Positions of items to produce the new Values object
     */
    values_i(positions) {
      let values = [];
      for (const position of positions) {
        values.push(this.items[position])
      };
      return new Values(values);
    }
  
    /**
     * Produce pivot and three regions
     *
     * The array of values will be split in an element (pivot) and
     * three arrays (a1, a2, a3). The function will return the
     * index in the array of values for each of its items in the
     * pivot and the three regions.
     * This function assumes there are at least three items in the object.
     * It also assumes that the rectangle is laying.
     *
     * @return {Object} Pivot and regions, as properties of the object
     */
    pivot_regions(width, depth) {
      if (this.items.length < 3) {
        throw new Error("CodeCity - Values.pivot_regions: less than three items");
      };
      if (width < depth) {
        throw new Error("Codecity - Values.pivot_regions: rectangle should be laying");
      };
      let a1_len, a2_len, a3_len;
      let pivot_i = this.imax();
      if (this.items.lenght == pivot_i + 1) {
        // No items to the right of pivot. a2, a3 empty
        return {pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [], a3: []};
      };
  
      if (this.items.length == pivot_i + 2) {
        // Only one item to the right of pivot. It is a2. a3 is empty.
        return {pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [pivot_i + 1], a3: []};
      };
  
      // More than one item to the right of pivot.
      // Compute a2 so that pivot can be as square as possible
      let area = width * depth;
      let pivot_area = this.scaled_area(area, pivot_i);
      let a2_width_ideal = Math.sqrt(pivot_area);
      let a2_area_ideal = a2_width_ideal * depth - pivot_area;
  
      let a2_area = 0;
      let a2_area_last = a2_area;
      let i = pivot_i + 1;
      while (a2_area < a2_area_ideal && i < this.items.length ) {
        a2_area_last = a2_area;
        a2_area += this.scaled_area(area, i);
        i ++;
      };
      // There are two candidates to be the area closest to the ideal area:
      // the last area computed (long), and the one that was conputed before it (short),
      // provided the last computed one is not the next to the pivot (in that case,
      // the last computed is the next to the pivot, and therefore it needs to be the
      // first in a3.
      let a3_first = i;
      if ((i - 1 > pivot_i) &&
          (Math.abs(a2_area - a2_area_ideal) > Math.abs(a2_area_last - a2_area_ideal))) {
        a3_first = i-1;
      };
  
      a2_len = a3_first - pivot_i - 1;
      a3_len = this.items.length - a3_first;
      return {pivot: pivot_i,
              a1: Values.range(0, pivot_i),
              a2: Values.range(pivot_i + 1, a2_len),
              a3: Values.range(pivot_i + 1 + a2_len, a3_len)};
    }
  
    /*
     * Compute the width for a region, for a rectangle of given width
     * (region is a rectangles with rectangle depth as depth)
     *
     * @param {array} values Position of values belonging to region
     * @param {number} width Width of rectangle
     */
    pivot_region_width(values, width) {
      let region_total = 0;
      for (const i of values) {
        region_total += this.items[i]
      };
      return (region_total / this.total ) * width;
    }
  
  };
  
  /*
   * Rectangles, using AFrame coordinates
   */
  let Rectangle = class {
    /*
     * Build a rectangle, given its parameters
     *
     * @constructor
     * @param {number} width Width (side parallel to X axis)
     * @param {number} depth Depth (side parallel to Z axis)
     * @param {number} x X coordinate
     * @param {number} z Z coordinate
     * @param {boolean} revolved Was the rectangle revolved?
     */
    constructor({width, depth, x = 0, z = 0}) {
      this.width = width;
      this.depth = depth;
      this.x = x;
      this.z = z;
    }
  
    /*
     * Is the rectangle laying, inner dimensions?
     * (is width the longest side?)
     *
     * @return {boolean} True if width is the longest side.
     */
    is_ilaying () {
      let longest = Math.max(this.width, this.depth);
      return (longest == this.width);
    }
  
    /*
     * Add the inner area rectangle, assuming this is the canvas
     * Note: canvas and area are not the real area of canvas and
     * area, but the numbers used to compute the proportion
     * If there si no acanvas, it is assumed that inner is equal to canvas
     *
     * @param {number} canvas Value for area of canvas
     * @param {number} area Value for area of inner
     */
    inner(acanvas, ainner) {
      if (acanvas < ainner) {
        throw "Rectangle.inner: Area for inner rectangle larger than my area"
      };
      if (typeof acanvas !== 'undefined') {
        let ratio = Math.sqrt(ainner/acanvas);
        this.iwidth = ratio * this.width;
        this.idepth = ratio * this.depth;
      } else {
        this.iwidth = this.width;
        this.idepth = this.depth;
      };
    }
  
    /*
     * Reflect (change horizontal for vertical dimensions)
     * Only for width, depth, x, y
     */
    reflect() {
      [this.width, this.depth] = [this.depth, this.width];
      [this.x, this.z] = [this.z, this.x];
    }
  
    /*
     * Return inner dimensions (plus position) as if rectangle was laying.
     *
     * Check if rectangle is laying. If it is not, return dimensions as if
     * reflected (but not reflect it). Last element in the resturned array
     * is a boolean indicating if values were reflected or not.
     *
     * @return {Array} Inner values: [iwidth, idepth, x, y, reflected]
     */
    idims_as_laying() {
      if (this.is_ilaying()) {
        return [this.iwidth, this.idepth, this.x, this.z, false];
      } else {
        return [this.idepth, this.iwidth, this.z, this.x, true];
      };
    }
  
    /*
     * Split according to data in values (array)
     *
     * Split is of the inner rectangle.
     * If relative is true, the coordinates of the resulting rectangle
     * consider the center of the canvas rectangle as 0,0.
     * If relative is false, the coordinates of the resulting rectangle
     * consider the center of the canvas as x,z (coordinates of the
     * rectangle to split.
     *
     * @param {Values} values Values to be used to split the rectangle
     * @param {boolean} relative Result is in relative (center in 0,0) or not
     */
    split(values, relative=true) {
      // Always split on width, as if the rectangle was laying.
      // Use local variables to point to the rigth real dimensions
      let [width, depth, x, z, reflected] = this.idims_as_laying();
      // Ratio to convert a size in a split (part of total)
      let ratio = width / values.total;
      let current_x = -width/2;
      let current_z = 0;
      if (! relative) {
        current_x += x;
        current_z = z;
      };
      let rects = [];
      // Value of fields scaled to fit total canvas
      for (const value of values.items) {
        let sub_width = value * ratio;
        let rect = new Rectangle({width: sub_width, depth: depth,
                              x: current_x + sub_width/2, z: current_z});
        if (reflected) {
          // Dimensions were reflected, reflect back
          rect.reflect();
        };
        rects.push(rect);
        current_x += sub_width;
      };
      return rects;
    }
  
    /*
     * Split according to data in values (array), with the pivot algorithm
     *
     * Split is of the inner rectangle
     */
    split_pivot(values, relative=true) {
      // Always split on width, as if the rectangle was laying.
      // Use local variables to point to the rgith real dimensions
      if (values.items.length <= 2) {
        // Only one or two values, we cannot apply pivot, apply naive
        return this.split(values, relative);
      };
      let [width, depth, x, z, reflected] = this.idims_as_laying();
      if (relative) {
        x = 0;
        z = 0;
      };
      let {pivot, a1, a2, a3} = values.pivot_regions(width, depth);
      // Dimensions for areas (a1, a2, a3)
      let width_a1 = values.pivot_region_width(a1, width);
      let width_a2 = values.pivot_region_width(a2.concat(pivot), width);
      let width_a3 = values.pivot_region_width(a3, width);
      let x_a1 = x - width/2 + width_a1/2;
      let x_a2 = x - width/2 + width_a1 + width_a2/2;
      let x_a3 = x - width/2 + width_a1 + width_a2 + width_a3/2;
  
      let rects = [];
      // Pivot rectangle
      let depth_pivot = values.scaled_area(width*depth, pivot) / width_a2;
      rects[pivot] = new Rectangle({width: width_a2, depth: depth_pivot,
                                    x: x_a2,
                                    z: z + depth/2 - depth_pivot/2});
      // Dimensions for each area (and corresponding rectangle)
      let dim_areas = [
        [a1, width_a1, depth, x_a1, z],
        [a2, width_a2, depth - depth_pivot, x_a2, z - depth_pivot/2 ],
        [a3, width_a3, depth, x_a3, z]];
      for (const [values_i, width_i, depth_i, x_i, z_i] of dim_areas) {
        if (values_i.length > 0) {
          let subrect = new Rectangle({width: width_i, depth: depth_i,
                                       x: x_i, z: z_i});
          subrect.inner();
          // Ensure we add rectangles in the right places
          let subvalues = values.values_i(values_i);
          // Further splits should always be absolute, wrt my coordinates
          let rects_i = subrect.split_pivot(subvalues, false);
          let counter = 0;
          for (const i of values_i) {
            rects[i] = rects_i[counter];
            counter ++;
          };
        };
      };
      if (reflected) {
        // Dimensions were reflected, reflect back
        for (const rect of rects) {
          rect.reflect();
        }
      };
      return rects;
    }
  
    /*
     * Produce a A-Frame building for the rectangle
     *
     * The building is positioned right above the y=0 level.
     * If a model is specified, the corresponding glTF model will be used,
     * scaled to the "box" that would be used. If not, a box will be used.
     *
     * @param {Number} height Height of the box
     * @param {Color} color Color of the box
     * @param {string} model Link to the glTF model
     */
    box({height, elevation=0, color='red', model=null, inner=true,
         wireframe=false, visible=true, buffered=false}) {
      let depth, width;
      if (inner) {
        [depth, width] = [this.idepth, this.iwidth];
      } else {
        [depth, width] = [this.depth, this.width];
      };
      let box = document.createElement('a-entity');
      if (model == null) {
        box.setAttribute('geometry', {
          buffer: buffered,
          primitive: 'box',
          skipCache: true,
          depth: depth,
          width: width,
          height: height
        });
      } else {
        box.setAttribute('gltf-model', model);
        box.setAttribute('autoscale', {
          x: width,
          y: height,
          z: depth
        });
      };
  
      box.setAttribute('position', {x: this.x,
                                    y: elevation+height/2,
                                    z: this.z});
      box.setAttribute('material', {'wireframe': wireframe,
                                    'vertexColors': 'face',
                                    'visible': visible});
      box.setAttribute('face-colors', {'color': color});
      return box;
    }
  
  };
  
  /*
   * Default palette of colors
   */
  const default_colors = ['blue', 'yellow', 'brown', 'orange',
                'magenta', 'darkcyan', 'grey', 'cyan', 'darkred', 'blueviolet',
                'coral', 'crimson', 'darkblue', 'darkgrey', 'orchid',
                'navy', 'palegreen'];
  /*
   * Class for dealing with colors
   */
  let Colors = class {
    /*
     * Builds palette of colors, given a list of colors
     *
     * @constructor
     * @param {color[]} colors Colors to build the palette
     */
    constructor(colors=default_colors) {
      this.colors = colors;
      this.current = -1;
    };
  
    /*
     * Give me the next color
     */
    next(color) {
      if (typeof color !== 'undefined') {
        return color;
      } else {
        this.current = (this.current + 1) % this.colors.length;
        return this.colors[this.current];
      };
    };
  };
  
  
  /*
   * Auxiliary function: produce a random data tree for codecity
   */
  let rnd_producer = function (levels=2, number=3, area=20, height=30) {
    if (levels == 1) {
        return {
          "id": "A",
          "area": Math.random() * area,
          "height": Math.random() * height
        };
    } else if (levels > 1) {
      let children = Array.from({length: number}, function () {
        return rnd_producer(levels-1, number, area, height);
      });
      return {id: "BlockAA", children: children};
    };
  };
  
  if (true) {
    module.exports = {Values, Rectangle, Zone};
  };

/***/ }),
/* 5 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geopiechart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data !== oldData.data) {
            console.log("Generating pie...")
            generatePie(data, el)
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let generatePie = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice['size'];
        }

        let degreeStart = 0;
        let degreeEnd = 0;

        let colorid = 0
        for (let slice of dataToPrint) {
            //Calculate degrees
            degreeEnd = 360 * slice['size'] / totalSize;
            let sliceEntity = generateSlice(degreeStart, degreeEnd, 1, colorid);
            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(sliceEntity, slice)
            }

            element.appendChild(sliceEntity);
            colorid++
        }
    }
}

function generateSlice(theta_start, theta_length, radius, color) {
    console.log("Generating slice...")
    let entity = document.createElement('a-cylinder');
    entity.setAttribute('color', colors[color]);
    entity.setAttribute('theta-start', theta_start);
    entity.setAttribute('theta-length', theta_length);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    return entity;
}

function generateLegend(slice) {
    let text = slice['key'] + ': ' + slice['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: 0, z: -2 });
    entity.setAttribute('rotation', { x: -90, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': slice['key'] + ': ' + slice['size'],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('light', {
        'intensity': 0.3
    });
    return entity;
}

function showLegend(sliceEntity, slice) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(slice);
        this.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}

let colors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]


/***/ }),
/* 6 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geosimplebarchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean', default: false },
        axis: { type: 'boolean', default: true }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data !== oldData.data) {
            console.log("Generating barchart...")
            generateBarChart(data, el)
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let generateBarChart = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)

        let colorid = 0
        let stepX = 0
        let axis_dict = []

        let maxY = Math.max.apply(Math, dataToPrint.map(function(o) { return o.size; }))


        for (let bar of dataToPrint) {
            let barEntity = generateBar(bar['size'], widthBars, colorid, stepX);


            //Prepare legend
            if (data.legend) {
                showLegend(barEntity, bar)
            }

            //Axis dict
            let bar_printed = {
                colorid: colorid,
                posX: stepX,
                key: bar['key']
            }
            axis_dict.push(bar_printed)


            element.appendChild(barEntity);
            //Calculate stepX
            stepX += widthBars + widthBars / 4
            //Increase color id
            colorid++
        }

        //Print axis
        if (data.axis) {
            showXAxis(element, stepX, axis_dict)
            showYAxis(element, maxY)
        }
    }
}

let widthBars = 1

function generateBar(size, width, color, position) {
    console.log("Generating bar...")
    let entity = document.createElement('a-box');
    entity.setAttribute('color', colors[color]);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    entity.setAttribute('height', size);
    entity.setAttribute('position', { x: position, y: size / 2, z: 0 });
    return entity;
}

function generateLegend(bar) {
    let text = bar['key'] + ': ' + bar['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: bar['size'] / 2 + 1, z: widthBars + 0.1 });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': bar['key'] + ': ' + bar['size'],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('light', {
        'intensity': 0.3
    });
    return entity;
}

function showXAxis(parent, xEnd, bars_printed) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__xaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: xEnd, y: 0, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: widthBars / 2 + widthBars / 4 });
    axis.appendChild(axis_line)
    
    //Print keys
    bars_printed.forEach(e => {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: widthBars+5.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showYAxis(parent, yEnd) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: -widthBars, y: yEnd, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: widthBars / 2 + widthBars / 4 });
    axis.appendChild(axis_line)
    
    for (let i = 0; i<=yEnd; i++){
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': i,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        key.setAttribute('position', { x: -widthBars-5.2, y: i, z: widthBars / 2 + widthBars / 4 })
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showLegend(barEntity, bar) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bar);
        this.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}

let colors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]


/***/ }),
/* 7 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('interaction-mapper', {
    schema: {
        input: { type: 'string' },
        output: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;

        if (data.input && data.output) {
            mapEvents(data, el);
        }
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update geometry component
         */
        // If entry it means that the properties changed
        if (data !== oldData) {
            if (data.input !== oldData.input || data.output !== oldData.output) {
                console.log("Change event because from has changed")
                // Remove the event of the old interaction
                el.removeEventListener(oldData.input, function (e) { })
                // Listen and map the new event
                mapEvents(data, el);
            }
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let mapEvents = (data, el) => {
    el.addEventListener(data.input, function (e) {
        // Dispatch/Trigger/Fire the event
        el.emit(data.output, e, false);
    });
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('querier_github', {
    schema: {
        user: { type: 'string' },
        token: { type: 'string' },
        repos: { type: 'array' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;

        if (data.user && (data.repos.length === 0)) {
            requestAllReposFromUser(data, el)
        } else if (data.repos.length > 0) {
            requestReposFromList(data, el)
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let requestReposFromList = (data, el) => {
    let dataOfRepos = {}

    data.repos.forEach((e, i) => {
        // Create a new request object
        let request = new XMLHttpRequest();

        // Create url
        let url = "https://api.github.com/repos/" + data.user + "/" + e + "?_=" + new Date().getTime();

        // Initialize a request
        request.open('get', url, false)
        // Send it
        request.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log("data OK in request.response", el.id)

                // Save data
                let rawData = JSON.parse(request.response)
                dataOfRepos[rawData.name] = rawData;

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
    })

    // Save data
    data.dataRetrieved = dataOfRepos
    el.setAttribute("baratariaData", JSON.stringify(data.dataRetrieved))

    // Dispatch/Trigger/Fire the event
    el.emit("dataReady" + el.id, data.dataRetrieved)
}


let requestAllReposFromUser = (data, el) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Create url
    let url = "https://api.github.com/users/" + data.user + "/repos?_=" + new Date().getTime();

    // Initialize a request
    request.open('get', url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            console.log("data OK in request.response", el.id)

            // Save data
            data.dataRetrieved = allReposParse(JSON.parse(request.response))
            el.setAttribute("baratariaData", JSON.stringify(data.dataRetrieved))

            // Dispatch/Trigger/Fire the event
            el.emit("dataReady" + el.id, data.dataRetrieved)

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
}

let allReposParse = (data) => {
    let dataParsed = {}
    data.forEach((e, i) => {
        dataParsed[e.name] = e
    });
    return dataParsed
}

/***/ }),
/* 9 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('querier_json', {
    schema: {
        url: { type: 'string' },
        embedded: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;

        if (data.url) {
            requestJSONDataFromURL(data, el)
        } else if (data.embedded) {
            parseEmbeddedJSONData(data, el)
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})


let requestJSONDataFromURL = (data, el) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', data.url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            //console.log("data OK in request.response", request.response)

            // Save data
            if (typeof request.response === 'string' || request.response instanceof String) {
                data.dataRetrieved = JSON.parse(request.response)
            } else {
                data.dataRetrieved = request.response
            }
            el.setAttribute("baratariaData", JSON.stringify(data.dataRetrieved))

            // Dispatch/Trigger/Fire the event
            el.emit("dataReady" + el.id, data.dataRetrieved)

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
}

let parseEmbeddedJSONData = (data, el) => {
    // Save data
    data.dataRetrieved = JSON.parse(data.embedded)
    el.setAttribute("baratariaData", data.embedded)

    // Dispatch/Trigger/Fire the event
    el.emit("dataReady" + el.id, data.embedded)
}

/***/ }),
/* 10 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let MAX_SIZE_BAR = 10

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('vismapper', {
    schema: {
        // Data
        dataToShow: { type: 'string' },
        // Geo and charts
        width: { type: 'string' },
        depth: { type: 'string' },
        height: { type: 'string' },
        radius: { type: 'string' },
        // Only for charts
        slice: { type: 'string' },
        x_axis: { type: 'string' },
        z_axis: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () { },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update geometry component
         */
        if (data.dataToShow && data.dataToShow != oldData.dataToShow) {
            let dataJSON = JSON.parse(data.dataToShow)
            if (el.components.geometry) {
                if (el.components.geometry.data.primitive === "box") {
                    el.setAttribute("geometry", "height", (dataJSON[data.height] / 100))
                    el.setAttribute("geometry", "width", dataJSON[data.width] || 2)
                    el.setAttribute("geometry", "depth", dataJSON[data.depth] || 2)
                    let oldPos = el.getAttribute("position")
                    el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height] / 200, z: oldPos.z })
                } else if (el.components.geometry.data.primitive === "sphere") {
                    el.setAttribute("geometry", "radius", (dataJSON[data.radius] / 10000) || 2)
                    let oldPos = el.getAttribute("position")
                    el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height], z: oldPos.z })
                }
            } else if (el.components.geosimplebarchart) {
                let list = generate2Dlist(data, dataJSON, "x_axis")
                el.setAttribute("geosimplebarchart", "data", JSON.stringify(list))
            } else if (el.components.geopiechart) {
                let list = generate2Dlist(data, dataJSON, "slice")
                el.setAttribute("geopiechart", "data", JSON.stringify(list))
            } else if (el.components.geo3dbarchart) {
                let list = generate3Dlist(data, dataJSON, "3dbars")
                el.setAttribute("geo3dbarchart", "data", JSON.stringify(list))
            } else if (el.components.geobubbleschart) {
                let list = generate3Dlist(data, dataJSON, "bubbles")
                el.setAttribute("geobubbleschart", "data", JSON.stringify(list))
            } else if (el.components.geocodecitychart) {
                let list = generateCodecityList(data, dataJSON)
                el.setAttribute("geocodecitychart", "data", JSON.stringify(list))
            }
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let generate2Dlist = (data, dataToProcess, key_type) => {
    let list = []
    Object.values(dataToProcess).forEach(value => {
        let item = {
            "key": value[data[key_type]],
            "size": value[data.height]
        }
        list.push(item)
    });
    return list
}

let generate3Dlist = (data, dataToProcess, chart_type) => {
    let list = []
    if (chart_type === "3dbars") {

        Object.values(dataToProcess).forEach(value => {
            let item = {
                "key": value[data.x_axis],
                "key2": value[data.z_axis],
                "size": value[data.height]
            }
            list.push(item)
        });
    } else if (chart_type === "bubbles") {
        Object.values(dataToProcess).forEach(value => {
            let item = {
                "key": value[data.x_axis],
                "key2": value[data.z_axis],
                "height": value[data.height],
                "radius": value[data.radius]
            }
            list.push(item)
        });
    }
    return list
}

let generateCodecityList = (data, dataToProcess) => {
    let list = []
    Object.values(dataToProcess).forEach(value => {
        let item = {
            "key": value[data.key],
            "height": value[data.height],
            "depth": value[data.depth],
            "width": value[data.width],
            "children": value.children,
            "position": value.position
        }
        list.push(item)
    });
    return list
}

function normalize(val, min, max) { return (val - min) / (max - min); }

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(8)
__webpack_require__(9)
__webpack_require__(10)
__webpack_require__(1)
__webpack_require__(7)
__webpack_require__(0)
__webpack_require__(5)
__webpack_require__(6)
__webpack_require__(2)
__webpack_require__(3)
__webpack_require__(4)



/***/ })
/******/ ]);