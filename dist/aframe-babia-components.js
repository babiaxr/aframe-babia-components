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
    model: {
      type: 'string',
      default: null
    },
    items: {
      type: 'string',
      default: JSON.stringify(
        [{ "id": "A", "area": 3, "height": 5 },
        { "id": "B", "area": 5, "height": 4 },
        { "id": "C", "area": 1, "height": 3 },
        { "id": "D", "area": 6, "height": 2 },
        { "id": "E", "area": 4, "height": 6 },
        { "id": "F", "area": 3, "height": 1 },
        { "id": "G", "area": 2, "height": 5 },
        { "id": "H", "area": 1, "height": 3 }]
      )
    },
    // Field (of each item) to use as area for buildings
    farea: {
      type: 'string',
      default: 'area'
    },
    // Field (of each item) to use as height for buildings
    fheight: {
      type: 'string',
      default: 'height'
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
    streets: {
      type: 'boolean',
      default: true
    },
    // Base: street thickness
    streets_thick: {
      type: 'number',
      default: .3
    },
    // Base: street width
    streets_width: {
      type: 'number',
      default: 1
    },
    // Base: street color
    streets_color: {
      type: 'color',
      default: 'black'
    },
    // Color for all buildings (if undefined, random colors)
    color: {
      type: 'color',
      default: undefined
    },
    colormap: {
      type: 'array',
      default: ['grey']
    },
    // Show legend building
    legend_building: {
      type: 'boolean',
      default: true
    },
    // Show legend quarter
    legend_block: {
      type: 'boolean',
      default: true
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

    let split;
    if (data.algorithm == 'naive') {
      split = naive_split;
    } else {
      split = pivot_split;
    };

    if (data.items instanceof Items) {
      this.items = data.items;
    } else {
      console.log("Block: converting items to Items", typeof data.items);
      this.items = new Items(data.items);
    };
    this.base_el = cc_block(this.el, this.items, data.width, data.depth,
      data.base_thick, data.base_color,
      data.streets, data.streets_thick, data.streets_width, data.streets_color,
      split, data.farea, data.fheight, data.color, data.model, data.legend_building, data.legend_block);
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
 * Default items for the quarter component
 * Mainly for testing.
 */
const quarter_items = [
  {
    "block": "BlockA",
    "blocks": [{
      "block": "BlockA1",
      "items": [{ "id": "A1A", "area": 2, "height": 1 },
      { "id": "A1B", "area": 5, "height": 4 },
      { "id": "A1C", "area": 4, "height": 6 },
      { "id": "A1D", "area": 6, "height": 2 }]
    },
    {
      "block": "BlockA2",
      "items": [{ "id": "A2A", "area": 1, "height": 3 },
      { "id": "A2B", "area": 5, "height": 6 },
      { "id": "A2C", "area": 8, "height": 4 }]
    },
    {
      "block": "BlockA3",
      "items": [{ "id": "A3A", "area": 4, "height": 7 },
      { "id": "A3B", "area": 5, "height": 3 },
      { "id": "A3C", "area": 8, "height": 1 }]
    }
    ]
  },
  {
    "block": "BlockB",
    "blocks": [{
      "block": "BlockB1",
      "items": [{ "id": "B1A", "area": 3, "height": 5 },
      { "id": "B1B", "area": 5, "height": 4 },
      { "id": "B1C", "area": 1, "height": 3 },
      { "id": "B1D", "area": 6, "height": 2 },
      { "id": "B1E", "area": 4, "height": 6 },
      { "id": "B1F", "area": 3, "height": 1 },
      { "id": "B1G", "area": 2, "height": 5 },
      { "id": "B1H", "area": 1, "height": 3 }]
    },
    {
      "block": "BlockB2",
      "items": [{ "id": "B2A", "area": 2, "height": 9 },
      { "id": "B2B", "area": 6, "height": 3 },
      { "id": "B2C", "area": 1, "height": 3 },
      { "id": "B2D", "area": 8, "height": 1 },
      { "id": "B2E", "area": 3, "height": 6 },
      { "id": "B2F", "area": 1, "height": 7 }]
    },
    {
      "block": "Block3",
      "items": [{ "id": "B3A", "area": 6, "height": 2 },
      { "id": "B3B", "area": 8, "height": 4 },
      { "id": "B3C", "area": 3, "height": 6 }]
    },
    {
      "block": "Block4",
      "items": [{ "id": "B4A", "area": 2, "height": 9 },
      { "id": "B4B", "area": 6, "height": 1 },
      { "id": "B4C", "area": 7, "height": 6 },
      { "id": "B4D", "area": 8, "height": 5 },
      { "id": "B4E", "area": 3, "height": 6 },
      { "id": "B4F", "area": 9, "height": 4 }]
    },
    {
      "block": "Block5",
      "items": [{ "id": "B5A", "area": 2, "height": 9 },
      { "id": "B5B", "area": 6, "height": 3 },
      { "id": "B5C", "area": 5, "height": 8 },
      { "id": "B5D", "area": 5, "height": 7 }]
    },
    {
      "block": "Block6",
      "items": [{ "id": "B6A", "area": 2, "height": 9 },
      { "id": "B6B", "area": 6, "height": 3 },
      { "id": "B6C", "area": 2, "height": 6 },
      { "id": "B6D", "area": 4, "height": 1 },
      { "id": "B6E", "area": 6, "height": 6 },
      { "id": "B6F", "area": 1, "height": 7 }]
    }
    ]
  }
];

/**
 * CodeCity quarter component for A-Frame, composed of several blocks.
 */
AFRAME.registerComponent('codecity-quarter', {
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
    model: {
      type: 'string',
      default: null
    },
    // Algoritm to place buildings: naive, pivot
    algorithm: {
      type: 'string',
      default: 'pivot'
    },
    // Data to visualize
    items: {
      type: 'string',
      default: JSON.stringify(quarter_items)
    },
    // Base: thickness
    base_thick: {
      type: 'number',
      default: 1
    },
    // Base: color
    base_color: {
      type: 'color',
      default: '#667C26'
    },
    // Base: color (for blocks)
    base_block_color: {
      type: 'color',
      default: '#7A903A'
    },
    // Base: with surrounding streets
    streets: {
      type: 'boolean',
      default: true
    },
    // Base: street thickness
    streets_thick: {
      type: 'number',
      default: 0.3
    },
    // Base: street width
    streets_width: {
      type: 'number',
      default: 1
    },
    // Base: street color
    streets_color: {
      type: 'color',
      default: '#728C00'
    },
    // Size of border around buildings (streets are built on it)
    border: {
      type: 'number',
      default: 1
    },
    // Extra factor for total area with respect to built area
    extra: {
      type: 'number',
      default: 1.1
    },
    // Quarter: elevation for each "depth" of quarters, over the previous one
    quarter_elevation: {
      type: 'number',
      default: 1
    },
    // Unique color for each block
    unicolor: {
      type: 'color',
      default: false
    },
    colormap: {
      type: 'array',
      default: ['grey']
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

  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function (oldData) {
    let data = this.data;
    let el = this.el;

    if (data !== oldData) {
      let split;
      if (data.algorithm == 'naive') {
        split = naive_split;
      } else {
        split = pivot_split;
      };

      console.log("CodeCity Quarter: Init");
      if (data.items instanceof ItemsTree) {
        this.tree = data.items;
      } else {
        console.log("Quarter: converting items to ItemsTree",
          typeof data.items);
        this.tree = new ItemsTree(data.items);
      }

      let items = this.tree.items('area', 'extra', data.border, data.extra);
      console.log("Tree, items:", this.tree, items);

      let width, depth;
      if (data.absolute == true) {
        width = Math.sqrt((data.width * this.tree.acc_extra) / data.depth);
        depth = this.tree.acc_extra / width;
      } else {
        width = data.width;
        depth = data.depth
      };
      let base_rect = new Rectangle({
        width: width, height: depth,
        x: 0, y: 0
      });
      let base_arect = base_rect.aframe(new ARectangle({}));
      this.base_el = base_arect.insert_box_fixed({
        el: this.el,
        height: data.base_thick,
        y: 0,
        color: data.base_color
      });
      if (data.streets) {
        base_arect.build_streets({
          height: data.streets_thick,
          width: data.streets_width,
          y: data.base_thick / 2 - data.streets_thick / 2,
          color: data.streets_color
        });
      };

      let inner_rects = split({
        rectangle: base_rect, items: items,
        field: 'extra'
      });
      console.log("Quarter rects:", inner_rects);
      let colors = new Colors();
      let color = undefined;
      for (const rect of inner_rects) {
        if ('items' in rect.item) {
          console.log("Items found:", rect.item.id, rect.item.items);
          let proportion = rect.item.items.acc / rect.item.items.acc_extra;
          let minor_rect = rect.proportional(proportion);
          if (data.unicolor) {
            color = colors.next();
          };
          console.log("Block color:", data.unicolor, color);
          this.insert_block(this.base_el, base_arect, minor_rect, color);
        } else {
          console.log("Blocks found:", rect.item.id, rect.item.blocks);
          let proportion = rect.item.blocks.acc / rect.item.blocks.acc_extra;
          let minor_rect = rect.proportional(proportion);
          //showLegendQuarter(this.base_el, "test", null, this.data.base_thick)
          this.insert_quarter(this.base_el, base_arect, minor_rect);

        };
      };
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

  /**
   * Utility function: insert a codecity-block as a child of an element.
   */
  insert_block: function (el, base_arect, rect, color) {
    let data = this.data;

    console.log("Color, model", color, data.model, this.data);
    let block_el = document.createElement('a-entity');
    let arect = rect.aframe(base_arect);
    block_el.setAttribute('codecity-block', {
      items: rect.item.items,
      farea: data.farea,
      fheight: data.fheight,
      algorithm: data.algorithm,
      width: arect.width,
      depth: arect.depth,
      base_thick: data.base_thick,
      base_color: data.base_block_color,
      streets: data.streets,
      streets_thick: data.streets_thick,
      streets_width: data.streets_width * .6,
      streets_color: data.streets_color,
      color: color,
      model: data.model
    });
    block_el.setAttribute('position', {
      x: arect.x,
      y: data.quarter_elevation,
      z: arect.z
    });
    el.appendChild(block_el);
  },

  /**
   * Utility function: insert a codecity-quarter as a child of an element.
   */
  insert_quarter: function (el, base_arect, rect) {
    let data = this.data;

    let quarter_el = document.createElement('a-entity');
    let arect = rect.aframe(base_arect);
    quarter_el.setAttribute('codecity-quarter', {
      items: rect.item.blocks,
      farea: data.farea,
      fheight: data.fheight,
      algorithm: data.algorithm,
      width: arect.width,
      depth: arect.depth,
      base_thick: data.base_thick,
      base_color: data.base_color,
      base_block_color: data.base_block_color,
      streets: data.streets,
      streets_thick: data.streets_thick,
      streets_width: data.streets_width * .6,
      streets_color: data.streets_color,
      border: data.border * .6,
      extra: data.extra,
      quarter_elevation: data.quarter_elevation,
      unicolor: data.unicolor,
      model: data.model
    });
    quarter_el.setAttribute('position', {
      x: arect.x,
      y: data.quarter_elevation,
      z: arect.z
    });
    el.appendChild(quarter_el);
  }
});

/*
 * Autoscale a component
 *
 * Based on code by Don McCurdy, used to autoscale buildings
 * https://stackoverflow.com/questions/49379435/aframe-how-to-reset-default-scale-after-loading-the-gltf-model
 */
AFRAME.registerComponent('autoscale', {
  schema: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
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

/**
 * This function adds the needed events in order to activate/deactivate the legend
 */
function showLegend(buildingEntity, text, model, base_el) {
  let legend;
  buildingEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1, y: 1.2, z: 1 });
    let parentPos = buildingEntity.getAttribute("position")
    legend = generateLegend(text, this, parentPos, model);
    base_el.appendChild(legend);
  });

  buildingEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    base_el.removeChild(legend);
  });
}

/**
 * This function adds the needed events in order to activate/deactivate the legend of the quarter
 */
function showLegendQuarter(buildingEntity, text, model = null, thick) {
  let legend;
  let activated = false;
  buildingEntity.addEventListener('click', function () {
    if (!activated) {
      this.setAttribute('geometry', 'height', '20');
      this.setAttribute('material', { opacity: 0.8 });
      legend = generateLegend(text, this, { x: 0, y: 0, z: 0 }, model);
      activated = true;
      this.appendChild(legend);
    } else {
      this.setAttribute('geometry', 'height', thick);
      this.setAttribute('scale', { x: 1, y: 1, z: 1 });
      this.setAttribute('material', { opacity: 1.0 });
      activated = false;
      this.removeChild(legend);
    }
  });
}

/**
 * This function generate a plane at the top of the building with the desired text
 */
function generateLegend(text, buildingEntity, parentPos, model) {
  let width = 2;
  if (text.length > 16)
    width = text.length / 8;

  let height;
  if (model == null) {
    height = buildingEntity.getAttribute('geometry').height
  } else {
    height = buildingEntity.getAttribute("autoscale").y
  }

  let entity = document.createElement('a-plane');

  entity.setAttribute('position', { x: parentPos.x, y: parentPos.y + height / 2 + 1, z: parentPos.z });
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
  /*entity.setAttribute('light', {
    'intensity': 0.3
  });*/
  return entity;
}


/*
 * Build a block in a DOM element
 */
let cc_block = function (el, items, width, depth,
  base_thick, base_color,
  streets, streets_thick, streets_width, streets_color,
  split = naive_split, farea = 'area', fheight = 'height',
  color = undefined, model = model, legend_building, legend_block) {
  console.log("CodeCity Block: Init");
  // Build a Cartesian rectangle for the aspect ratio (width, depth),
  // which will be the base for the block, and will (later) provide
  // A-Frame coordinates for the inner buildings.
  // Build the base box from it.
  let base_rect = new Rectangle({
    width: width, height: depth,
    x: 0, y: 0
  });
  let base_arect = base_rect.aframe(new ARectangle({}));
  let base_el = base_arect.insert_box_fixed({
    el: el,
    height: base_thick,
    y: 0,
    color: base_color
  });
  if (streets) {
    base_arect.build_streets({
      height: streets_thick,
      width: streets_width,
      y: base_thick / 2 - streets_thick / 2,
      color: streets_color
    });
  };

  // Build inner rectangles, splitting the base according to items.
  // Build A-Frame rectangles for all of them, and the corresponding,
  // A-Frame boxes, inserting them in the base.
  let inner_rects = split({
    rectangle: base_rect, items: items,
    field: farea
  });
  let buildings_el = [];
  let colors = new Colors();
  for (const rect of inner_rects) {
    let arect = rect.aframe(base_arect);
    acolor = colors.next(color);
    let building = arect.build_box({
      fheight: fheight,
      y: base_thick / 2,
      color: acolor,
      model: model
    });
    //console.log("Building:", building);
    if (legend_building) {
      showLegend(building, rect.item.id, model, base_el)
    }
    buildings_el.push(building);
    base_el.appendChild(building);
  };
  if (legend_block) {
    showLegendQuarter(base_el, "test", null, base_thick)
  }
  return base_el;
};



/*
 * Class for storing items to show as buildings
 */
let Items = class {
  /*
   * Build, based on an object with items
   *
   * @constructor
   * @param {object} items Items to store in the object
   */
  constructor(items) {
    if (typeof items == 'string') {
      this.items = JSON.parse(items);
    } else {
      this.items = items;
    };
    this.length = this.items.length;
  }

  /*
   * Sum values of field 'field' for items.
   *
   * @param {string} field Field to consider for computing the sum
   * @return {number} Sum of values
   */
  sum(field = 'area') {
    return this.items.reduce(function (acc, item) { return acc + item[field]; }, 0);
  }

  /*
   * Annotate accumulated (sum) value of field 'field' for items.
   * If the rectangle were square, the extra area for allowing for
   * surrounding streets of width 'border' would be
   * (SQRT(area) + 2*border)^2.
   * Parameter 'extra' is a factor for allowing for even a larger area.
   *
   * @param {string} field Field to consider for computing the sum
   * @param {number} border Width of border (street width)
   * @param {number} extra Extra factor, for accounting for streets
   * @return {number} Sum of values
   */
  accumulated(field = 'area', border, extra = 1.2) {
    this.acc = this.sum(field);
    this.acc_extra = Math.pow((Math.sqrt(this.acc) + 2 * border), 2) * extra;
    return [this.acc, this.acc_extra];
  }


  /*
   * Compute the largest element in an array, and its index
   *
   * @typedef {Object} Element Element of Items object
   * @property {object} largest The largest item
   * @property {number} largest_i The index of the largest item
   *
   * @param {string} field Field to consider for computing max
   * @return {Element} Maximum item, and its index
   */
  max(field = 'area') {
    let largest = this.items[0];
    let largest_i = 0;

    for (let i = 0; i < this.length; i++) {
      if (largest[field] < this.items[i][field]) {
        largest = this.items[i];
        largest_i = i;
      };
    };
    return { largest: largest, largest_i: largest_i };
  }

  /*
   * Split list of items in three lists, given a pivot area
   *
   * @typedef {Object} PivotedList Result of spliting items list
   * @property {Object} pivot The pivot item
   * @property {Items[]} items1 Three arrays of items, produced by the pivot algo
   *
   * The algorithm produces:
   * - pivot is the item with the largest (area) value
   * - items is the list of three Items objects
   *     . items[0] is items before pivot
   *     . items[1] is the next items after pivot, so that
   *       pivot is close to square
   *       (width of rectangle for items[1] is the same as of pivot)
   *     . items[2] is the other items to the right of pivot
   *
   * @param {number} height Height of enclosing stretched rectangle
   * @param {string} field Field to consider for spliting
   * @return {PivotedList} Pivot and lists produced by the algorithm
   */
  pivot_largest(height, field) {
    let a1_len, a2_len, a3_len;
    let items = this.items;
    let { largest, largest_i } = this.max(field);

    let pivot_i = largest_i;
    a1_len = pivot_i;

    if (this.length == pivot_i + 1) {
      // No items to the right of pivot. a2, a3 empty
      return {
        pivot: items[pivot_i],
        items: [new Items(items.slice(0, a1_len)),
        new Items([]),
        new Items([])]
      };
    };

    if (this.length == pivot_i + 2) {
      // Only one item to the right of pivot. It is a2. a3 is empty.
      return {
        pivot: items[pivot_i],
        items: [new Items(items.slice(0, a1_len)),
        new Items(items.slice(pivot_i + 1, pivot_i + 2)),
        new Items([])]
      };
    };

    // More than one item to the right of pivot.
    // Compute a2 so that pivot can be as square as possible
    let pivot_area = items[pivot_i][field];
    let a2_width_ideal = Math.sqrt(pivot_area);
    let a2_area_ideal = a2_width_ideal * height - pivot_area;

    let a2_area = 0;
    let i = pivot_i + 1;
    while (a2_area < a2_area_ideal && i < this.length) {
      var a2_area_last = a2_area;
      a2_area += this.items[i][field];
      i++;
    };
    // There are two candidates to be the area closest to the ideal area:
    // the last area computed (long), and the one that was conputed before it (short),
    // providing the last computed is not the next to the pivot (in that case,
    // the last computed is the next to the pivot, and therefore it needs to be the
    // first in a3.
    if (Math.abs(a2_area - a2_area_ideal) < Math.abs(a2_area_last - a2_area_ideal)) {
      var a3_first = i;
    } else if (i - 1 > pivot_i) {
      var a3_first = i - 1;
    } else {
      var a3_first = i;
    };

    a2_len = a3_first - pivot_i - 1;
    a3_len = this.length - a3_first

    return {
      pivot: items[pivot_i],
      items: [new Items(items.slice(0, a1_len)),
      new Items(items.slice(pivot_i + 1,
        pivot_i + 1 + a2_len)),
      new Items(items.slice(pivot_i + 1 + a2_len,
        pivot_i + 1 + a2_len + a3_len))]
    };
  }

  /*
   * Compute fraction with respect to a total.
   *
   * Produces the fraction of total that corresponds to
   * the sum of items, using field.
   *
   * @param {number} total Total for computing the fraction
   * @param {string} field Field to consider
   * @return {number} Fraction
   */
  fraction(total, field) {
    let area = this.sum(field);
    return area / total;
  }
};

/*
 * Class for storing items tree to show as quarters / buildings
 */

let ItemsTree = class {
  /*
   * Build, based on an object with items, items of items, etc.
   *
   * The data used to instantiate the class (items) is structured
   * as an array of objects. Each of these objects has always
   * a property 'block', which is an id for the block, and
   * one of two other properties:
   * 'blocks' (which will be an array of other blocks, with the
   * same structure), or 'items', which will be
   * an array of objects with the same structure,
   * or an array of final data.
   * Final data should have at least 'id', and two fields to
   * act as area and height.
   *
   * @constructor
   * @param {object} items Items to store in the object
   */
  constructor(items) {
    let raw_items;
    if (typeof items == 'string') {
      if (items.endsWith('json')){
        raw_items = requestJSONDataFromURL(items);
      }else{
        raw_items = JSON.parse(items);
      }
    } else {
      raw_items = items;
    };
    console.log("Raw items:", raw_items);
    this.tree = [];
    for (const item of raw_items) {
      if ('blocks' in item) {
        this.tree.push({
          block: item.block,
          blocks: new ItemsTree(item.blocks)
        });
      } else {
        this.tree.push({
          block: item.block,
          items: new Items(item.items)
        });
      };
    };
    this.length = this.tree.length;
  }

  /*
   * Annotate trees with accumulated value of field 'field' for items.
   *
   * @param {string} field Field to consider for computing the sum
   * @param {number} border Width of border (street width)
   * @param {number} extra Extra factor, for accounting for streets
   * @return {number} Sum of values
   */
  accumulated(field = 'area', border, extra = 1.2) {
    this.acc = 0;
    this.acc_extra = 0;
    for (const item of this.tree) {
      let acc, acc_extra;
      if ('blocks' in item) {
        [item.acc, item.acc_extra] = item.blocks.accumulated(field, border * .6, extra);
        //        item.acc_extra = Math.pow((Math.sqrt(item.acc_extra) + 2*border), 2) * extra;
      } else {
        [item.acc, item.acc_extra] = item.items.accumulated(field, border * .6, extra);
      };
      this.acc += item.acc;
      this.acc_extra += item.acc_extra;
    };
    return [this.acc, this.acc_extra];
  }

  /*
   * Produce an Items object from the top level of a treee.
   *
   * Annotate the tree with accumulated data for field,
   * and produce an Items object with the top level data.
   * Each item is a dictionary {block, area}, with area being
   * the accumulated value for the subtree, if the level corresponds
   * to blocks, or regular (leaf) items, if not.
   *
   * @param {string} field Field to consider for computing the sum
   * @param {number} extra Extra factor, for accounting for streets
   * @return {Items} Items object.
   */
  items(field = 'area', afield = 'extra', border = 0, extra = 1.2) {
    this.accumulated(field, border, extra);
    let tree_items = [];
    for (const item of this.tree) {
      console.log("Item:", item);
      if ('blocks' in item) {
        tree_items.push({
          id: item.block, area: item.acc,
          extra: item.acc_extra, blocks: item.blocks
        });
      } else {
        tree_items.push({
          id: item.block, area: item.acc,
          extra: item.acc_extra, items: item.items
        });
      };
    };
    return new Items(tree_items);
  }
};

/*
 * Class for representing A-Frame rectangles
 *
 * An A-Frame rectangle is a rectangle that can be used as a base
 * for a box entity. It lives in the XZ plane,
 * with sides parallel to the A-Frame coordinates axis.
 * Length of sides are width (assummed to be parallel to X axis),
 * and depth (assumed to be parallel to Z axis).
 * Position coordinates are (x,z), representing the position
 * of the center of the rectangle (as is usual in A-Frame).
 */
let ARectangle = class {
  /*
   * Build a rectangle, given its parameters
   *
   * @constructor
   * @param {number} width Width (side parallel to X axis)
   * @param {number} depth Depth (side parallel to Z axis)
   * @param {number} x X coordinate
   * @param {number} y Z coordinate
   * @param {object} item Item with data corresponding to this rectangle
   */
  constructor({ width, depth, x = 0, z = 0, item }) {
    this.width = width;
    this.depth = depth;
    this.x = x;
    this.z = z;
    this.item = item;
  }

  /*
   * Build A-Frame box with this rectangle as base, fixed height
   *
   * @param {number} height Height of the box
   * @param {number} y Y coordinate of the box
   * @param {color} color A-Frame color for the box
   * @return {DOMElement} A-Frame entity as a DOM Element
   */
  build_box_fixed({ height, y, color, model, id, rawArea }) {
    // console.log("Build_box_fixed:", height, y, color);
    let box = document.createElement('a-entity');
    if (id){
      box.setAttribute('id', id)
    }
    if (rawArea){
      box.setAttribute('babiaxr-rawarea', rawArea)
    }
    if (model == null) {
      box.setAttribute('geometry', {
        primitive: 'box',
        depth: this.depth,
        width: this.width,
        height: height
      });
      box.setAttribute('material', { 'color': color });
    } else {
      box.setAttribute('gltf-model', model);
      box.setAttribute('autoscale', {
        x: this.width,
        y: height,
        z: this.depth
      });
    };
    box.setAttribute('position', {
      x: this.x,
      y: y + height / 2,
      z: this.z
    });
    return box;
  }

  /*
   * Build A-Frame box with this rectangle as base, height from item
   *
   * @param {string} fheight Field (of item) with height of the box
   * @param {number} y Y coordinate of the box
   * @param {color} color A-Frame color for the box
   * @return {DOMElement} A-Frame entity as a DOM Element
   */
  build_box({ fheight, y, color, model }) {
    // console.log("Build_box:", fheight, y, color);
    return this.build_box_fixed({
      height: this.item[fheight],
      y: y, color: color,
      model: model,
      id: this.item.id,
      rawArea: this.item.area
    });
  }

  /*
   * Insert A-Frame box with this rectangle as base, fixed height
   *
   * @param {DOMElement} el Insert the box in this element
   * @param {number} height Height of the box
   * @param {number} y Y coordinate of the box
   * @param {color} color A-Frame color for the box
   * @return {DOMElement} A-Frame entity as a DOM Element
   */
  insert_box_fixed({ el, height, y, color }) {
    this.el = this.build_box_fixed({ height: height, y: y, color: color })
    el.appendChild(this.el);
    return this.el;
  }

  /*
   * Build streets around the box
   *
   * @param {number} height Height of the box (ignore fheight)
   * @param {number} y Y coordinate of the box
   * @param {color} color A-Frame color for the box
   * @return {DOMElement} A-Frame entity as a DOM Element
   */
  build_streets({ height, width, y, color }) {
    let arects = [
      new ARectangle({
        width: this.width + width * 2, depth: width,
        x: 0,
        z: - this.depth / 2 - width / 2
      }),
      new ARectangle({
        width: this.width + width * 2, depth: width,
        x: 0,
        z: this.depth / 2 + width / 2
      }),
      new ARectangle({
        width: width, depth: this.depth + width * 2,
        x: - this.width / 2 - width / 2,
        z: 0
      }),
      new ARectangle({
        width: width, depth: - this.depth - width * 2,
        x: this.width / 2 + width / 2,
        z: 0
      })
    ];
    for (const arect of arects) {
      let el = arect.insert_box_fixed({
        el: this.el, height: height,
        y: y, color: color,
        id: ""
      });
    };
  }
};

/*
 * Class for representing (cartesian) rectangles
 *
 * A cartesian rectangle is a rectangle, living in a 2D world,
 * with sides parallel to the coordinates axis.
 * Length of sides are width (assummed to be parallel to X axis),
 * and height (assumed to be parallel to Y axis).
 * Position coordinates are (x,y), representing the position
 * of the bottom left corner of the rectangle.
 */
let Rectangle = class {
  /*
   * Build a rectangle, given its parameters
   *
   * @constructor
   * @param {number} width Width (side parallel to X axis)
   * @param {number} height Height (side parallel to Y axis)
   * @param {number} x X coordinate
   * @param {number} y Y coordinate
   * @param {object} item Item with data corresponding to this rectangle
   */
  constructor({ width, height, x = 0, y = 0, item }) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.item = item;
  }

  /*
   * Revolve a rectangle
   *
   * Produce a new rectangle, with exchanged width and height, and x and y
   *
   * @return {Rectangle} Revolved rectangle
   */
  revolve() {
    let rectangle = new Rectangle({
      width: this.height, height: this.width,
      x: this.y, y: this.x, item: this.item
    });
    return rectangle;
  }

  /*
   * Is width the longest side?
   *
   * @return {boolean} True if width is the longest side.
   */
  longest_width() {
    let longest = Math.max(this.width, this.height);
    return (longest == this.width);
  }

  /*
   * Produce a proportional rectangle
   *
   * A proportional rectangle is one inscribed in this one, with the same
   * center, and sides proportional.
   *
   * @param {number} proportion
   */
  proportional(proportion) {
    return new Rectangle({
      width: this.width * proportion,
      height: this.height * proportion,
      x: this.x + this.width * (1 - proportion) / 2,
      y: this.y + this.height * (1 - proportion) / 2,
      item: this.item
    });
  }

  /*
   * Build A-Frame rectangle for a Cartesian rectangle
   *
   * The parent is a A-Frame rectangle in which we can 'insert' our
   * rectangle, with coordinates relative to it.
   *
   * Cartesian coordinates consider x,y in the bottom left corner of the
   * rectangle, while A-Frame coordinates consider x,z in the center of it.
   * So, we need to map Cartesian 0,0 to the center of the parent,
   * and Cartesian x,y to the center of the rectangle, relative to that center
   * of the parent, as x,z.
   *
   * @param {ARectangle} parent Parent A-Frame rectangle
   * @return {ARectangle} A-Frame rectangle corresponding to this Cartesian rectangle
   */
  aframe(parent) {
    let pwidth = parent.width;
    let x, z;
    if (pwidth) {
      x = this.x + this.width / 2 - pwidth / 2;
    } else {
      x = this.x;
    };
    let pdepth = parent.depth;
    if (pdepth) {
      z = -1 * (this.y + this.height / 2 - pdepth / 2);
    } else {
      z = -this.y;
    };
    return new ARectangle({ width: this.width, depth: this.height, x: x, z: z, item: this.item });
  }
};

/*
 * Class for representing (stretched, cartesian) rectangles
 *
 * This is a Rectangle object in which width is always the longest
 * dimension (except for squares, obviously).
 * I will include a propriety to know whether the original
 * Rectangle used to build it had to be rotated or not
 */
let Stretched = class {
  /*
   * Builds a stretched rectangle, given a Rectangle
   *
   * @constructor
   * @param {Rectangle} rectangle Rectangle from which it is built
   */
  constructor(rectangle) {
    if (rectangle.longest_width()) {
      this.revolved = false;
      this.rectangle = Object.assign(new Rectangle({}), rectangle);
    } else {
      this.revolved = true;
      this.rectangle = rectangle.revolve();
    };
  }

  /*
   * Split the streched rectangle proportionally to items
   * The property named by the 'field' argument will be used
   * as the value for the proportion.
   *
   * @param {Items} items Items to use for the splitting
   * @param {string} field Field of each item to use for proportion
   * @return {Rectangle[]} Rectangles produced by the split
   */
  split_proportional(items, field = 'area') {
    // ratio to convert a size in a split (part of total)
    let ratio = this.rectangle.width / items.sum(field);
    // value of fields scaled to fit total, plus original complete item
    let splits = items.items.map(function (item) {
      return { width: ratio * item[field], item: item };
    });
    // x for rectangles start with x for the base rectangle
    let current_x = this.rectangle.x;
    let rects = [];
    // Let's now compute the proportional rectangles,
    // by building one after the other, following the width side
    for (const split of splits) {
      let x = current_x;
      current_x += split.width;
      let rect = new Rectangle({
        width: split.width,
        height: this.rectangle.height,
        x: x, y: this.rectangle.y,
        item: split.item
      });
      // If the base rectangle was revolved, re-revolve rectangles
      if (this.revolved) {
        rects.push(rect.revolve());
      } else {
        rects.push(rect);
      };
    };
    return rects;
  }

  /*
   * Split the streched rectangle according to the list of pivot items
   *
   * @typedef {Object} PivotedList Result of spliting items list
   * @property {Object} pivot The pivot item
   * @property {Items[]} items1 Three arrays of items, produced by the pivot algo
   *
   * See Items.pivot_largest for details
   *
   * @typedef {Object} PivotedRects Result of spliting rectangle
   * @property {Rectangle} pivot_rect The pivot rectangle
   * @property {Rectangle[]} rects Array of Rectangle 1, 2 and 3
   *
   * The property named by the 'field' argument will be used
   * as the value for the proportion.
   *
   * @param {PivotedList} pivot_items Items to use for the splitting
   * @param {string} field Field of each item to use for proportion
   * @return {PivotedRects} Rectangles produced by the split
   */
  split_pivot(pivot_items, field = 'area') {
    let { pivot, items } = pivot_items;

    let rect1, pivot_rect, rect2, rect3;
    let rect1_width, rect2_width, rect3_width;

    let base_area = pivot[field] + items[0].sum(field) + items[1].sum(field)
      + items[2].sum(field);
    let base_rect = this.rectangle;

    // Compute rect1
    if (items[0].length > 0) {
      rect1_width = items[0].fraction(base_area, field) * base_rect.width;
      rect1 = new Rectangle({
        width: rect1_width,
        height: base_rect.height,
        x: base_rect.x, y: base_rect.y
      });
      if (this.revolved) {
        rect1 = rect1.revolve();
      };
    } else {
      rect1 = null;
      rect1_width = 0;
    };

    // Compute rect2 and pivot_rect
    let items2pivot = new Items([pivot, ...items[1].items]);
    rect2_width = items2pivot.fraction(base_area, field) * base_rect.width;
    let pivot_height = base_rect.height * pivot[field] / items2pivot.sum(field);
    let rect2_height = base_rect.height - pivot_height;
    pivot_rect = new Rectangle({
      width: rect2_width,
      height: pivot_height,
      x: base_rect.x + rect1_width,
      y: base_rect.y + rect2_height,
      item: pivot
    });
    if (this.revolved) {
      pivot_rect = pivot_rect.revolve();
    };

    if (items[1].length > 0) {
      rect2 = new Rectangle({
        width: rect2_width, height: rect2_height,
        x: base_rect.x + rect1_width,
        y: base_rect.y
      });
      if (this.revolved) {
        rect2 = rect2.revolve();
      };
    } else {
      rect2 = null;
    };

    // Compute rect3
    if (items[2].length > 0) {
      rect3_width = items[2].fraction(base_area, field) * base_rect.width;
      rect3 = new Rectangle({
        width: rect3_width, height: base_rect.height,
        x: base_rect.x + rect1_width + rect2_width,
        y: base_rect.y
      });
      if (this.revolved) {
        rect3 = rect3.revolve();
      };
    } else {
      rect3 = null;
    }

    return { pivot_rect: pivot_rect, rects: [rect1, rect2, rect3] };
  }

};

/*
 * Default palette of colors
 */
 const default_colors = ['#E5E1D6']
const default_colors_2 = ['blue', 'yellow', 'brown', 'orange',
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
  constructor(colors = default_colors) {
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
 * Naive algorithm for splitting a rectangle, given a list of items
 *
 * This just splits the rectangle in adjacent rectangles,
 * proportional to the areas of the items in the list.
 * It is assumed that the longest side of the
 * rectangle will be the basis for the proportional split.
 * Ths list of items will include a field 'area', that will
 * be the value used for the proportional splitting.
 *
 * @param {Rectangle} rectangle Rectangle to split
 * @param {Items} items Items to use for subrectangles
 * @param {string} field Field of each item to consider for splitting
 * @return {Rectangle[]} List of subrectangles produced by the split
 */
let naive_split = function ({ rectangle, items, field }) {
  console.log("Naive_split:", items.length, rectangle, items, field);
  let base_rect = new Stretched(rectangle)
  let rects = base_rect.split_proportional(items, field);
  console.log("Naive_split (rects):", rects);
  return rects;
};



/*
 * Pivot algorigthm for splitting a rectangle, given a list of items
 * http://cvs.cs.umd.edu/~ben/papers/Shneiderman2001Ordered.pdf
 *
 * Works recursively, by spliting the rectangle in a pivot item,
 * and three lists of items.
 *
 * @param {Rectangle} rectangle Rectangle to split
 * @param {Items} items Items to use for subrectangles
 * @param {string} field Field of each item to consider for splitting
 * @return {Rectangle[]} List of subrectangles produced by the split
 */
//let calls = 0;
let pivot_split = function ({ rectangle, items, field, depth = 0 }) {
  console.log("Pivot split: ", depth, items.length, rectangle, items, field);
  // Control to avoid excesive recursion
  //  calls ++;
  //  if (calls > 20) {
  //    console.log("20 calls reached, finishing");
  //    return;
  //  };
  if (items.length <= 2) {
    // Only one or two items, we cannot apply pivot, apply naive
    return naive_split({
      rectangle: rectangle, items: items,
      field: field
    });
  };
  let base_rect = new Stretched(rectangle);
  console.log("Stretched:", base_rect);
  let pivot_items = items.pivot_largest(base_rect.rectangle.height, field);
  let { pivot_rect, rects } = base_rect.split_pivot(pivot_items, field);

  console.log("Pivot_rect, rects:", pivot_rect, rects);
  let subrects = [pivot_rect];
  for (const i of [0, 1, 2]) {
    if (pivot_items.items[i].length > 0) {
      let split_rects = pivot_split({
        rectangle: rects[i],
        items: pivot_items.items[i],
        field: field, depth: depth + 1
      });
      subrects = subrects.concat(split_rects);
    };
  };
  console.log("Pivot split (rects):", depth, subrects);
  return subrects;
}


/*
 * Below this line, some testing code that should be moved to a proper test suite.
 */

let items_data = [{ "id": "A", "area": 3, "height": 5 },
{ "id": "B", "area": 5, "height": 4 },
{ "id": "C", "area": 1, "height": 3 },
{ "id": "D", "area": 6, "height": 2 },
{ "id": "E", "area": 4, "height": 6 },
{ "id": "F", "area": 3, "height": 1 },
{ "id": "G", "area": 2, "height": 5 },
{ "id": "H", "area": 1, "height": 3 }]

let items = new Items(items_data);
//console.log("Items length:", items.length);
//console.log("Sum items (area):", items.sum())
//console.log("Sum items (height):", items.sum('height'));
//
//let rect = new Rectangle({width: 10, height: 20, x: 3, y: 4});
//console.log("Rectangle test:", rect);
//let srect = new Stretched(rect);
//console.log("Streched rectangle test:", srect);
//srect = new Stretched(new Rectangle({width: 20, height: 10,
//                                     x: 2, y: 3}));
//console.log("Streched rectangle test 2:", srect);
//let rects = naive_split({rectangle: rect, items: items});
//console.log("Naive split test:", rect, rects);
//rect = new Rectangle({width: 15, height: 5, x: 2, y: 5});
//rects = naive_split({rectangle: rect, items: items, field: 'area'});
//console.log("Naive split test 2:", rect, rects);
//
rect = new Rectangle({ width: 10, height: 2.5, x: 0, y: 0 });
//srect = new Stretched(rect);
//let prects = srect.split_pivot({pivot: items_data[3],
//                                items: [new Items(items_data.slice(0,3)),
//                                        new Items(items_data.slice(4,6)),
//                                        new Items(items_data.slice(6,8))]
//});
//console.log("Pivot split rects:", prects);
//
//prects = srect.split_pivot({pivot: items_data[0],
//                            items: [new Items(items_data.slice(1,4)),
//                                    new Items(items_data.slice(4,7)),
//                                    new Items(items_data.slice(7,8))]
//});
//console.log("Pivot split rects:", prects);
//
//rects = pivot_split({rectangle: rect, items: items, field: 'area'});
//console.log("Pivot split:", rect, items, rects);


let items_def = [{
  "block": "BlockA",
  "blocks": [{
    "block": "BlockA1",
    "items": [{ "id": "A1A", "area": 2, "height": 1 },
    { "id": "A1B", "area": 5, "height": 4 },
    { "id": "A1C", "area": 4, "height": 6 },
    { "id": "A1D", "area": 6, "height": 2 }]
  },
  {
    "block": "BlockA2",
    "items": [{ "id": "A2A", "area": 1, "height": 3 },
    { "id": "A2B", "area": 5, "height": 6 },
    { "id": "A2C", "area": 8, "height": 4 }]
  },
  {
    "block": "BlockA3",
    "items": [{ "id": "A3A", "area": 4, "height": 7 },
    { "id": "A3B", "area": 5, "height": 3 },
    { "id": "A3C", "area": 8, "height": 1 }]
  }
  ]
},
{
  "block": "BlockB",
  "blocks": [{
    "block": "BlockB1",
    "items": [{ "id": "B1A", "area": 3, "height": 5 },
    { "id": "B1B", "area": 5, "height": 4 },
    { "id": "B1C", "area": 1, "height": 3 },
    { "id": "B1D", "area": 6, "height": 2 },
    { "id": "B1E", "area": 4, "height": 6 },
    { "id": "B1F", "area": 3, "height": 1 },
    { "id": "B1G", "area": 2, "height": 5 },
    { "id": "B1H", "area": 1, "height": 3 }]
  },
  {
    "block": "BlockB2",
    "items": [{ "id": "B2A", "area": 2, "height": 9 },
    { "id": "B2B", "area": 6, "height": 3 },
    { "id": "B2C", "area": 1, "height": 3 },
    { "id": "B2D", "area": 8, "height": 1 },
    { "id": "B2E", "area": 3, "height": 6 },
    { "id": "B2F", "area": 1, "height": 7 }]
  },
  {
    "block": "Block3",
    "items": [{ "id": "B3A", "area": 6, "height": 2 },
    { "id": "B3B", "area": 8, "height": 4 },
    { "id": "B3C", "area": 3, "height": 6 }]
  },
  {
    "block": "Block4",
    "items": [{ "id": "B4A", "area": 2, "height": 9 },
    { "id": "B4B", "area": 6, "height": 1 },
    { "id": "B4C", "area": 7, "height": 6 },
    { "id": "B4D", "area": 8, "height": 5 },
    { "id": "B4E", "area": 3, "height": 6 },
    { "id": "B4F", "area": 9, "height": 4 }]
  },
  {
    "block": "Block5",
    "items": [{ "id": "B5A", "area": 2, "height": 9 },
    { "id": "B5B", "area": 6, "height": 3 },
    { "id": "B5C", "area": 5, "height": 8 },
    { "id": "B5D", "area": 5, "height": 7 }]
  },
  {
    "block": "Block6",
    "items": [{ "id": "B6A", "area": 2, "height": 9 },
    { "id": "B6B", "area": 6, "height": 3 },
    { "id": "B6C", "area": 2, "height": 6 },
    { "id": "B6D", "area": 4, "height": 1 },
    { "id": "B6E", "area": 6, "height": 6 },
    { "id": "B6F", "area": 1, "height": 7 }]
  }
  ]
}
];

//tree = new ItemsTree(items);
//console.log(tree);
//total = tree.accumulated('area');
//items = tree.items('area', true);
//console.log(items, tree);

let rnd_producer = function (levels = 2, number = 3, area = 20, height = 30) {
  if (levels == 1) {
    let items = Array.from({ length: number }, function () {
      return {
        "id": "BlockA",
        "area": Math.random() * area,
        "height": Math.random() * height
      };
    });
    console.log("Levels, items:", levels, items)
    return items;
  } else if (levels == 2) {
    let blocks = Array.from({ length: number }, function () {
      return {
        "block": "BlockA",
        "items": rnd_producer(levels - 1, number, area, height)
      };
    });
    console.log("Levels, blocks:", levels, blocks)
    return blocks;
  } else {
    let blocks = Array.from({ length: number }, function () {
      return {
        "block": "BlockA",
        "blocks": rnd_producer(levels - 1, number, area, height)
      };
    });
    console.log("Levels, blocks:", levels, blocks)
    return blocks;
  };
};

/**
 * Request a JSON url
 * @param {*} data 
 * @param {*} el 
 */
let requestJSONDataFromURL = (items) => {
  let raw_items
  // Create a new request object
  let request = new XMLHttpRequest();

  // Initialize a request
  request.open('get', items, false)
  // Send it
  request.onload = function () {
      if (this.status >= 200 && this.status < 300) {
          //console.log("data OK in request.response", request.response)

          // Save data
          if (typeof request.response === 'string' || request.response instanceof String) {
            raw_items = JSON.parse(request.response)
          } else {
            raw_items = request.response
          }
          

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

  if (raw_items.time_evolution){
    raw_items = requestJSONDataFromURL(raw_items.init_data)
  }
  return raw_items
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