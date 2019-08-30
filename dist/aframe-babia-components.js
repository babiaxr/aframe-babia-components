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
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
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
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geocodecitychart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
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
            console.log("Generating geocodecitychart...")
            generateCity(data, el)
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

let generateCity = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)

        let colorid = 0

        for (let entity of dataToPrint) {

            let buildingEntity = generateBuildEntity(element, entity, colorid, data.legend);
            colorid++

        }

    }
}

let widthBubbles = 0

function generateBuildEntity(parent, entityData, color, legend) {
    console.log("Generating building...")
    let entity = document.createElement('a-entity');
    entity.setAttribute('geometry', 'primitive: box');
    entity.setAttribute('material', 'color: ' + colors[color]);
    entity.setAttribute('geometry', 'width', entityData['width']);
    entity.setAttribute('geometry', 'depth', entityData['depth']);
    entity.setAttribute('geometry', 'height', entityData['height']);
    entity.setAttribute('position', { x: entityData.position.x, y: entityData.position.y + entityData['height'] / 2, z: entityData.position.z });
    if (entityData['children']) {
        let keys = Object.keys(entityData['children'])
        if (legend) {
            showLegendDistrict(entity, entityData)
        }
        for (let child_key of keys) {
            generateBuildEntity(parent, entityData.children[child_key], color++, legend)
        }
    } else {
        //Prepare legend
        if (legend) {
            showLegend(entity, entityData)
        }
    }
    parent.appendChild(entity);
    return entity;
}

function generateLegend(entityData, buildingEntity) {
    let text = entityData['key']

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: buildingEntity.getAttribute('geometry').height / 2 + 1, z: 0 });
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

function showLegend(buildingEntity, entity) {
    buildingEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1, y: 1.2, z: 1 });
        legend = generateLegend(entity, this);
        this.appendChild(legend);
    });

    buildingEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}

function showLegendDistrict(buildingEntity, entity) {
    buildingEntity.addEventListener('mouseenter', function () {
        this.setAttribute('geometry', 'height', '10');
        this.setAttribute('material', {opacity: 0.8});
        legend = generateLegend(entity, this);
        this.appendChild(legend);
    });

    buildingEntity.addEventListener('mouseleave', function () {
        this.setAttribute('geometry', 'height', '0.1');
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.setAttribute('material', {opacity: 1.0});
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
/* 5 */
/***/ (function(module, exports) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * CodeCity block component for A-Frame.
 */
AFRAME.registerComponent('codecity-block', {
    schema: {
        width: {
            type: 'number',
            default: 10
        },
        depth: {
            type: 'number',
            default: 10
        },
        // Algoritm to place buildings: naive, pivot
        algorithm: {
            type: 'string',
            default: 'pivot'
        },

        data: {
            type: 'string',
            default: '[{"id": "A", "area": 3, "height": 5},\
                   {"id": "B", "area": 5, "height": 4},\
                   {"id": "C", "area": 1, "height": 3},\
                   {"id": "D", "area": 6, "height": 2},\
                   {"id": "E", "area": 4, "height": 6},\
                   {"id": "F", "area": 3, "height": 1},\
                   {"id": "G", "area": 2, "height": 5},\
                   {"id": "H", "area": 1, "height": 3}]'
        },
        // Base: thickness
        base_thick: {
            type: 'number',
            default: 1
        },
        // Base: color
        base_color: {
            type: 'color',
            default: 'red'
        },
        // Base: with surrounding streets
        base_streets: {
            type: 'boolean',
            default: true
        },
        // Base: street thickness
        base_streets_thick: {
            type: 'number',
            default: 0.5
        },
        // Base: street width
        base_streets_width: {
            type: 'number',
            default: 1
        },
        // Base: street width
        base_streets_color: {
            type: 'color',
            default: 'black'
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

        let algo;
        if (data.algorithm == 'naive') {
            algo = naive_algo;
        } else {
            algo = pivot_algo;
        };

        console.log("CodeCity Block: Init");
        this.items = JSON.parse(data.data)
        this.base_rect = {
            'depth': data.depth, 'width': data.width, 'id': 'base',
            'aframe_x': 0, 'aframe_z': 0
        };
        this.base = insert_box(el, this.base_rect, data.base_thick,
            0, data.base_color);
        if (data.base_streets === true) {
            // Build streets for the base
            this.streets = insert_base_streets(el, data.width, data.depth,
                data.base_thick,
                data.base_streets_width, data.base_streets_thick, data.base_street_color);
            el.setAttribute('total_width', data.width + 2 * data.base_streets_width);
            el.setAttribute('total_depth', data.depth + 2 * data.base_streets_width);
        } else {
            el.setAttribute('total_width', data.width);
            el.setAttribute('total_depth', data.depth);
        };
        console.log("XXX:", el.getAttribute('total_width'));

        let rect_buildings = algo(this.base_rect, { x: 0, z: 0 }, this.items);
        let color_i = 0;
        for (const rect of rect_buildings) {
            color_i = (color_i + 1) % data.colormap.length;
            insert_box(this.base, rect, data.thick, data.base_thick / 2,
                data.colormap[color_i]);
        };
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
    play: function () { }
});

/**
 * CodeCity quarter component for A-Frame, composed of several blocks.
 */
AFRAME.registerComponent('codecity-quarter', {
    schema: {
        width: {
            type: 'number',
            default: 20
        },
        depth: {
            type: 'number',
            default: 20
        },
        // Algoritm to place buildings: naive, pivot
        algorithm: {
            type: 'string',
            default: 'pivot'
        },
        // Data to visualize
        data: {
            type: 'string',
            default: '[{ "type": "quarter", "quarter": "Quarter1", "data": [\
          {"block": "Block1",\
           "type": "block",\
           "data": [{"id": "1A", "area": 3, "height": 5},\
                   {"id": "1B", "area": 5, "height": 4},\
                   {"id": "1C", "area": 1, "height": 3},\
                   {"id": "1D", "area": 6, "height": 2},\
                   {"id": "1E", "area": 4, "height": 6},\
                   {"id": "1F", "area": 3, "height": 1},\
                   {"id": "1G", "area": 2, "height": 5},\
                   {"id": "1H", "area": 1, "height": 3}]},\
          {"block": "Block2",\
           "type": "block",\
           "data": [{"id": "2A", "area": 2, "height": 9},\
                   {"id": "2B", "area": 6, "height": 3},\
                   {"id": "2C", "area": 1, "height": 3},\
                   {"id": "2D", "area": 8, "height": 1},\
                   {"id": "2E", "area": 3, "height": 6},\
                   {"id": "2F", "area": 1, "height": 7}]},\
          {"block": "Block3",\
           "type": "block",\
           "data": [{"id": "3A", "area": 6, "height": 2},\
                   {"id": "3B", "area": 8, "height": 4},\
                   {"id": "3C", "area": 3, "height": 6}]},\
          {"block": "Block4",\
           "type": "block",\
           "data": [{"id": "4A", "area": 2, "height": 9},\
                   {"id": "4B", "area": 6, "height": 1},\
                   {"id": "4C", "area": 7, "height": 6},\
                   {"id": "4D", "area": 8, "height": 5},\
                   {"id": "4E", "area": 3, "height": 6},\
                   {"id": "4F", "area": 9, "height": 4}]},\
          {"block": "Block5",\
           "type": "block",\
           "data": [{"id": "5A", "area": 2, "height": 9},\
                   {"id": "5B", "area": 6, "height": 3},\
                   {"id": "5C", "area": 5, "height": 8},\
                   {"id": "5D", "area": 5, "height": 7}]},\
          {"block": "Block6",\
           "type": "block",\
           "data": [{"id": "6A", "area": 2, "height": 9},\
                   {"id": "6B", "area": 6, "height": 3},\
                   {"id": "6C", "area": 2, "height": 6},\
                   {"id": "6D", "area": 4, "height": 1},\
                   {"id": "6E", "area": 6, "height": 6},\
                   {"id": "6F", "area": 1, "height": 7}]}\
          ]}, \
          { "type": "quarter", "quarter": "Quarter2", "data": [\
            {"block": "Block1",\
             "type": "block",\
             "data": [{"id": "1A", "area": 3, "height": 5},\
                     {"id": "1B", "area": 5, "height": 4},\
                     {"id": "1C", "area": 1, "height": 3},\
                     {"id": "1D", "area": 6, "height": 2},\
                     {"id": "1E", "area": 4, "height": 6},\
                     {"id": "1F", "area": 3, "height": 1},\
                     {"id": "1G", "area": 2, "height": 5},\
                     {"id": "1H", "area": 1, "height": 3}]},\
            {"block": "Block2",\
             "type": "block",\
             "data": [{"id": "2A", "area": 2, "height": 9},\
                     {"id": "2B", "area": 6, "height": 3},\
                     {"id": "2C", "area": 1, "height": 3},\
                     {"id": "2D", "area": 8, "height": 1},\
                     {"id": "2E", "area": 3, "height": 6},\
                     {"id": "2F", "area": 1, "height": 7}]},\
            {"block": "Block6",\
             "type": "block",\
             "data": [{"id": "6A", "area": 2, "height": 9},\
                     {"id": "6B", "area": 6, "height": 3},\
                     {"id": "6C", "area": 2, "height": 6},\
                     {"id": "6D", "area": 4, "height": 1},\
                     {"id": "6E", "area": 6, "height": 6},\
                     {"id": "6F", "area": 1, "height": 7}]}\
            ]}]'
        },
        // Base: thickness
        base_thick: {
            type: 'number',
            default: 1
        },
        // Base: color
        base_color: {
            type: 'color',
            default: 'red'
        },
        // Base: with surrounding streets
        base_streets: {
            type: 'boolean',
            default: true
        },
        // Base: street thickness
        base_streets_thick: {
            type: 'number',
            default: 0.5
        },
        // Base: street width
        base_streets_width: {
            type: 'number',
            default: 1
        },
        // Base: street width
        base_streets_color: {
            type: 'color',
            default: 'black'
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

        let algo;
        if (data.algorithm == 'naive') {
            algo = naive_algo;
        } else {
            algo = pivot_algo;
        };

        console.log("CodeCity Quarter: Init");
        this.items = JSON.parse(data.data)

        let items = produce_items(this.items);
        console.log("Quarter items:", items);

        this.base_rect = {
            'depth': data.depth, 'width': data.width, 'id': 'base',
            'aframe_x': 0, 'aframe_z': 0
        };
        this.base = insert_box(el, this.base_rect, data.base_thick,
            0, data.base_color);
        if (data.base_streets === true) {
            // Build streets for the base
            this.streets = insert_base_streets(el, data.width, data.depth,
                data.base_thick,
                data.base_streets_width, data.base_streets_thick, data.base_street_color);
            el.setAttribute('total_width', data.width + 2 * data.base_streets_width);
            el.setAttribute('total_depth', data.depth + 2 * data.base_streets_width);
        } else {
            el.setAttribute('total_width', data.width);
            el.setAttribute('total_depth', data.depth);
        };

        let rect_quarters = algo(this.base_rect, { x: 0, z: 0 }, items);
        console.log("Quarter rectangles:", rect_quarters);

        let y = 1;
        for (const rect of rect_quarters) {
            let quarter = document.createElement('a-entity');
            quarter.setAttribute('codecity-' + rect.type, {
                width: rect.width,
                depth: rect.depth,
                data: JSON.stringify(rect.height),
                base_streets: false
            });
            quarter.setAttribute('position', {
                x: -(rect.x + rect.width / 2 - data.width / 2),
                y: y,
                z: rect.z + rect.depth / 2 - data.depth / 2
            });
            this.base.appendChild(quarter);
        };
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
    play: function () { }
});

/*
 * Produce items, like those for a block, computing those for a quarter
 */
let produce_items = function (quarter_items) {
    items = []
    for (const qitem of quarter_items) {
        item = {
            'id': (qitem.block) ? qitem.block : qitem.quarter,
            'area': get_recursive_area(qitem),
            'type': qitem.type,
            'height': qitem.data
        };
        items.push(item);
    };
    return items;
};

/** 
 * Get recursive area when quarter of quarters
 */
let get_recursive_area = function (item) {
    let total_area = 0
    if (item.type === "quarter") {
        for (const subitem of item.data) {
            total_area += get_recursive_area(subitem)
        }
    } else if (item.type === "block") {
        total_area = item.data.reduce(function (acc, a) { return acc + a.area; }, 0)
    }
    return total_area
}

/**
 * Get the position dimension for a geometry dimension
 */
let pos_dim = { 'depth': 'z', 'width': 'x' };

/**
 * Add A-Frame coordinates to a rectangle using XZ coordinates.
 * XZ coordinates consider 0,0 in the bottom left corner of a rectangle
 * A-Frame coordinates consider 0,0 in the center of the enclosing (parent)
 * DOM element, therefore for adding the coordinates, we need the parent
 * element.
 * @param {Object} rectangle
 * @param {DOMObject} parent
 */
let aframe_coord = function (rectangle, parent) {
    console.log("Parent geometry:", parent.getAttribute('geometry'));
    let pwidth = parent.getAttribute('width');
    if (pwidth) {
        rectangle.aframe_x = rectangle.x + rectangle.width / 2 - pwidth / 2;
    } else {
        rectangle.aframe_x = rectangle.x;
    };
    let pdepth = parent.getAttribute('depth');
    if (pdepth) {
        rectangle.aframe_z = -1 * (rectangle.z + rectangle.depth / 2 - pdepth / 2);
    } else {
        rectangle.aframe_z = rectangle.z;
    };
};

/**
 * Insert a box in the DOM, after creating it, as an a-box.
 *  The box is in XZ coordinates (from the bottom left corner).
 *  Inserts also properties depth and width, to propagate them
 *  to other entities that could live within this one
 *  (for example, buildings in a base).
 *  Returns the inserted element.
 */
let insert_box = function (element, rectangle, height, y, color) {
    aframe_coord(rectangle, element);
    let box = document.createElement('a-entity');

    let building_height;
    if (typeof rectangle.height !== 'undefined') {
        building_height = rectangle.height;
    } else {
        building_height = height;
    };

    box.setAttribute('geometry', {
        primitive: 'box',
        depth: rectangle.depth,
        width: rectangle.width,
        height: building_height
    });
    box.setAttribute('position', {
        x: rectangle.aframe_x,
        y: y + building_height / 2,
        z: rectangle.aframe_z
    });
    box.setAttribute('material', { 'color': color });
    box.setAttribute('id', rectangle.id);
    // These two needed to propagate the shape of the rectangle
    box.setAttribute('depth', rectangle.depth);
    box.setAttribute('width', rectangle.width);
    element.appendChild(box);
    return box;
};

/*
 *  Insert a box with A-Frame coordinates
 *  Only width, depth, aframe_x and aframe_z are used from rectangle
 */
let insert_box_aframe = function (element, rectangle, height, y, color) {
    let box = document.createElement('a-entity');

    box.setAttribute('geometry', {
        primitive: 'box',
        depth: rectangle.depth,
        width: rectangle.width,
        height: height
    });
    box.setAttribute('position', {
        x: rectangle.aframe_x,
        y: y,
        z: rectangle.aframe_z
    });
    box.setAttribute('material', { 'color': color });
    box.setAttribute('id', rectangle.id);
    // These two needed to propagate the shape of the rectangle
    box.setAttribute('depth', rectangle.depth);
    box.setAttribute('width', rectangle.width);
    element.appendChild(box);
    return box;
};

/*
 * Insert streets surrounding a base
 */
let insert_base_streets = function (el, base_width, base_depth, base_thick,
    street_width, street_thick, street_color) {
    let rects = [
        {
            'depth': street_width, 'width': base_width + street_width * 2, 'id': 'street_a',
            'aframe_x': 0, 'aframe_z': (base_depth + street_width) / 2
        },
        {
            'depth': street_width, 'width': base_width + street_width * 2, 'id': 'street_b',
            'aframe_x': 0, 'aframe_z': -(base_depth + street_width) / 2
        },
        {
            'depth': base_depth + street_width * 2, 'width': street_width, 'id': 'street_c',
            'aframe_x': (base_width + street_width) / 2, 'aframe_z': 0
        },
        {
            'depth': base_depth + street_width * 2, 'width': street_width, 'id': 'street_d',
            'aframe_x': -(base_width + street_width) / 2, 'aframe_z': 0
        }
    ];
    let streets = [];
    for (const rect of rects) {
        let street = insert_box_aframe(el, rect, base_thick / 2 - street_thick / 2,
            street_thick, 'black');
        streets.push(street);
    };
    return streets;
};

// Compute some parameters for a rectangle
// These parameters refer to the longest and shortest dimension:
//  long_dim, short_dim: depth or width
//  long, short: lenght of long and short sides
let parameters = function (rectangle) {
    // length of longest dimenstion of the rectangle
    var params = {}
    let longest = Math.max(rectangle['depth'], rectangle['width']);
    if (longest == rectangle['depth']) {
        params['long_dim'] = 'depth';
        params['short_dim'] = 'width';
    } else {
        params['long_dim'] = 'width';
        params['short_dim'] = 'depth';
    };
    params['long'] = longest;
    params['short'] = rectangle[params['short_dim']];
    return params
};

// Get the sum of all the values (numbers) in an array
let sum_array = function (values) {
    return values.reduce(function (acc, a) { return acc + a; }, 0);
};

// Split total, proportionally, according to values in sizes array
let split_proportional = function (total, sizes) {
    // sum of all sizes
    let sum_sizes = sum_array(sizes);
    // ratio to convert a size in a split (part of total)
    let ratio = total / sum_sizes;
    // sizes reduced to fit total
    return sizes.map(function (a) { return ratio * a });
};

// Naive algorithm for placing buildings on a rectangle
// Naive algo is too naive: just take the longest dimension of rectangle,
// split it proportionally to the areas (value of each item), and produce a set of
// adjacent rectangles, thus proportional to the areas.

let naive_algo = function (rectangle, origin, items) {
    let rect_params = parameters(rectangle);
    console.log("Naive rect_params:", rect_params);
    let values = items.map(function (item) { return item.area; });
    let lengths = split_proportional(rect_params['long'], values);
    console.log("Naive lenghts:", lengths);

    let long_dim = rect_params['long_dim'];
    let short_dim = rect_params['short_dim'];
    // The position in the splitted dimension
    let current_pos = origin[pos_dim[long_dim]];
    let buildings = lengths.map(function (a, i) {
        pos_long_dim = current_pos;
        current_pos += a;
        let rect = build_rect(rect_params, a, rect_params.short,
            pos_long_dim, origin[pos_dim[short_dim]]);
        let building = build_building(rect, items[i]);
        return building;
    });
    console.log("Naive algo buildings:", buildings);
    return buildings;
}

// Compute the largest element in an array, and its index
// Returns [element, index]
// Assumes list is not empty
function max_value(values) {
    let largest = values[0];
    let largest_i = 0;

    for (let i = 0; i < values.length; i++) {
        if (largest < values[i]) {
            largest = values[i];
            largest_i = i;
        }
    };
    return [largest, largest_i];
}

// Split list of areas in three lists, given a pivot area
// Returns pivot, a1_len, a2_len, a3_len
// pivot: index of pivot item
// an_len: length of list an (n being 1, 2, or 3)
// pivot is the largest element in areas
// a1 is all elements in areas before the pivot
// a2 is the next elements in areas after pivot, so that
// pivot is close to square (width of a2 is the same as of a2)
// a3 is the other elements in areas to the right of a2
function split_pivot_largest(depth, areas) {
    var pivot, a1_len, a2_len, a3_len;
    let [largest, largest_i] = max_value(areas);

    pivot = largest_i;
    a1_len = pivot;

    if (areas.length == pivot + 1) {
        // No items to the right of pivot. a2, a3 empty
        return [pivot, a1_len, 0, 0];
    };

    if (areas.length == pivot + 2) {
        // Only one item to the right of pivot. It is a2. a3 is empty.
        return [pivot, a1_len, 1, 0];
    };

    // More than one item to the right of pivot.
    // Compute a2 so that pivot can be as square as possible
    let pivot_area = areas[pivot];
    let a2_width_ideal = Math.sqrt(pivot_area);
    let a2_area_ideal = a2_width_ideal * depth - pivot_area;

    let a2_area = 0;
    let i = pivot + 1;
    while (a2_area < a2_area_ideal && i < areas.length) {
        var a2_area_last = a2_area;
        a2_area += areas[i];
        i++;
    };
    // There are two candidates to be the area closest to the ideal area:
    // the last area computed (long), and the one that was conputed before it (short),
    // providing the last computed is not the next to the pivot (in that case,
    // the last computed is the next to the pivot, and therefore it needs to be the
    // first in a3.
    if (Math.abs(a2_area - a2_area_ideal) < Math.abs(a2_area_last - a2_area_ideal)) {
        var a3_first = i;
    } else if (i - 1 > pivot) {
        var a3_first = i - 1;
    } else {
        var a3_first = i;
    };

    a2_len = a3_first - pivot - 1;
    a3_len = areas.length - a3_first

    return [pivot, a1_len, a2_len, a3_len];
}

// Compute widths for one of the three regions of the pivot algorithm
// depth: depth of the rectangle
// areas: areas (values) in the region
function compute_width(depth, areas) {
    if (areas.length == 0) {
        return 0;
    } else {
        area = sum_array(areas);
        return area / depth;
    };
}

// Build rectangle object, based on its parameters
function build_rect(rect_params, long, short, long_pos, short_pos) {
    return {
        [rect_params['long_dim']]: long,
        [rect_params['short_dim']]: short,
        [pos_dim[rect_params['long_dim']]]: long_pos,
        [pos_dim[rect_params['short_dim']]]: short_pos
    };
}

// Get a building, ready to draw, from its base rectangle and its item
function build_building(rectangle, item) {
    let building = Object.assign({}, rectangle);
    building.height = item.height;
    building.id = item.id;
    building.type = item.type;
    return building;
}

// Produce buildings following the pivot algorithm
// http://cvs.cs.umd.edu/~ben/papers/Shneiderman2001Ordered.pdf
function pivot_algo(rectangle, origin, items) {
    console.log("Length of items to rectangulize: ", items.length);
    // Control to avoid excesive recursion
    //  calls ++;
    //  if (calls > 20) {
    //    console.log("20 calls reached, finishing");
    //    return;
    //  };
    if (items.length <= 2) {
        // Only one or two items, we cannot apply pivot, apply naive
        return naive_algo(rectangle, origin, items);
    };
    // Compute parameters (dimensions for the short and long sides)
    // of the enclosing rectangle
    let rect_params = parameters(rectangle);
    let long_dim = rect_params['long_dim'];
    let short_dim = rect_params['short_dim'];
    let long_pos = pos_dim[rect_params['long_dim']];
    let short_pos = pos_dim[rect_params['short_dim']];

    // Build an array with values in items
    let values = items.map(function (item) { return item.area; });
    // Build an array with areas proportional to values, fitting the rectangle
    let areas = split_proportional(rect_params['long'] * rect_params['short'], values);

    // Compute pivot, and number of elements (length) for the three zones
    let [pivot, a1_len, a2_len, a3_len] = split_pivot_largest(rect_params['short'], areas);
    //  console.log("Pivot algo results:", pivot, items[pivot], items.slice(0, a1_len),
    //              items.slice(pivot+1, pivot+1+a2_len),
    //              items.slice(items.length-a3_len));

    let zones = [];

    // Compute data for zone 1
    let a1_width = 0;
    if (a1_len > 0) {
        let a1_slice = [0, a1_len];
        a1_width = compute_width(rect_params['short'], areas.slice(...a1_slice));
        let a1_depth = rect_params['short'];
        let a1_origin = [origin[long_pos], origin[short_pos]];
        let a1_rect = build_rect(rect_params, a1_width, a1_depth, ...a1_origin);
        let zone1 = { rect: a1_rect, items: items.slice(...a1_slice) };
        zones.push(zone1);
        console.log("Zone1: ", zone1);
    };

    // Compute data for zone 2 and pivot
    let a2_slice = [pivot + 1, pivot + a2_len + 1];
    let a2pivot_slice = [pivot, pivot + a2_len + 1];
    let a2_width = compute_width(rect_params['short'], areas.slice(...a2pivot_slice));
    let pivot_depth = areas[pivot] / a2_width;
    let a2_depth = rect_params['short'] - pivot_depth;
    let pivot_origin = [origin[long_pos] + a1_width, origin[short_pos] + a2_depth];
    let a2_origin = [origin[long_pos] + a1_width, origin[short_pos]];
    let pivot_rect = build_rect(rect_params, a2_width, pivot_depth, ...pivot_origin);

    if (a2_len > 0) {
        let a2_rect = build_rect(rect_params, a2_width, a2_depth, ...a2_origin);
        zone2 = { rect: a2_rect, items: items.slice(...a2_slice) }
        zones.push(zone2);
        console.log("Zone2: ", zone2);
    };

    // Compute data for zone 3
    let a3_width = 0;
    if (a3_len > 0) {
        let a3_slice = [items.length - a3_len];
        a3_width = compute_width(rect_params['short'], areas.slice(...a3_slice));
        let a3_depth = rect_params['short'];
        let a3_origin = [origin[long_pos] + a1_width + a2_width, origin[short_pos]];
        let a3_rect = build_rect(rect_params, a3_width, a3_depth, ...a3_origin);
        let zone3 = { rect: a3_rect, items: items.slice(...a3_slice) };
        zones.push(zone3);
        console.log("Zone3: ", zone3);
    };

    // Get subrects, by recursively running the algorithm in all the zones
    pivot_building = build_building(pivot_rect, items[pivot]);
    let buildings = [pivot_building];
    for (const zone of zones) {
        let zone_buildings = pivot_algo(zone.rect, { x: zone.rect.x, z: zone.rect.z }, zone.items);
        buildings = buildings.concat(zone_buildings);
    };
    console.log("Buildings:", buildings);
    return buildings;
}

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
/* 7 */
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
/* 8 */
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
/* 9 */
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
/* 10 */
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
/* 11 */
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
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(9)
__webpack_require__(10)
__webpack_require__(11)
__webpack_require__(1)
__webpack_require__(8)
__webpack_require__(0)
__webpack_require__(6)
__webpack_require__(7)
__webpack_require__(2)
__webpack_require__(3)
__webpack_require__(4)
__webpack_require__(5)



/***/ })
/******/ ]);