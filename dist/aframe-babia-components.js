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
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
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
        let debugPanel = generateDebugPanel(data, el, el.getAttribute('babiaData'));
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
* Component for A-Frame.
*/
AFRAME.registerComponent('event-controller', {
    schema: {
        navigation : {type : 'string'},
        target : { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {},

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        el = this.el
        let data = this.data
        
        navigation = data.navigation
        chart = data.target

        time_evol(navigation)
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

let el
let navigation
let chart
var data_array
var data_array_reverse = [] 
let current
let last
let reverse = false
let first_time = true

function time_evol(navigation){ 
    let commits = document.getElementById(navigation).getAttribute('ui-navigation-bar').commits
    if (commits && first_time){
        data_array = JSON.parse(commits)
        for ( let i in data_array){
            data_array_reverse.push(data_array[i]) 
        }
        data_array_reverse.reverse() 
        
        // First current
        showDate(0)
        current = data_array[0]
        last = '0'
        first_time = false
        controls()
    }
}

function play(array){
    let i = 0
    for (let x in array){
        if (array[x] == current){
            i = parseInt(x) + 1
        }
    }

    let loop = setInterval( function() {
        if (i < array.length){
            current = array[i]

            if (reverse){
               let x = (array.length - 1) - i
               showDate(x)
               last = x
            } else {
                showDate(i)
                last = i
            }
            
            changeChart()
            i++

            document.addEventListener('babiaxrStop', function () {
                clearInterval(loop)
            })
            if ( i == array.length){
                let pause_button = document.getElementsByClassName('babiaxrPause')[0]
                pause_button.emit('click')
            }
        } else {
            el.emit('babiaxrStop')
        }
    }, 3000)
}

function skip(destination){
    for ( let x in data_array ) {
        if (data_array[x] == current){
            if ((destination == 'next') && (x < data_array.length - 1)){
                x++
            } else if ((destination == 'prev') && (x >= 1)){
                x--
            }
            current = data_array[x]
            showDate(x)
            last = x
            break
        }
    }
    changeChart()
}

function changePoint(point){
    for (let x in data_array ) {
        if (data_array[x].commit == point.commit){
            current = data_array[x]
            showDate(x)
            last = x
            break
        }
    }
    changeChart()
}

function changeChart(){
    let data= document.getElementById(current.commit).getAttribute('babiadata')
    let entity = document.getElementById(chart)
    entity.setAttribute('vismapper', 'dataToShow', data)
}

function controls(){
    play(data_array)

    document.addEventListener('babiaxrShow', function (event) {
        changePoint(event.detail.data)
        el.emit('babiaxrStop')
    })

    document.addEventListener('babiaxrContinue', function () {
        console.log('PLAY')
        if (reverse){
            play(data_array_reverse)
        } else {
            play(data_array)
        }
    })

    document.addEventListener('babiaxrToPresent', function () {
        console.log('TO PRESENT')
        reverse = false
        el.emit('babiaxrStop')
        play(data_array)
    })

    document.addEventListener('babiaxrToPast', function () {
        console.log('TO PAST')
        reverse = true
        el.emit('babiaxrStop')
        play(data_array_reverse)
    })

    document.addEventListener('babiaxrSkipNext', function () {
        console.log('SKIP NEXT')
        el.emit('babiaxrStop')
        skip('next')
    })

    document.addEventListener('babiaxrSkipPrev', function () {
        console.log('SKIP PREV')
        el.emit('babiaxrStop')
        skip('prev')
    })
}

function showDate(i){
    let entities = document.getElementsByClassName('babiaxrTimeBar')[0].children
    if (last || last == 0 ){
        let pointToHide = entities[last]
        pointToHide.emit('removeinfo')
    }
    let pointToShow = entities[i]
    pointToShow.emit('showinfo')
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
    if (querierElement.getAttribute('babiaData')) {
      let dataFromQuerier = JSON.parse(querierElement.getAttribute('babiaData'));
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
    el.setAttribute("babiaData", JSON.stringify(dataToSave[filter]))
  } else {
    data.dataRetrieved = dataToSave
    el.setAttribute("babiaData", JSON.stringify(dataToSave))
  }
}

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
AFRAME.registerComponent('geo3dbarchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        animation: {type: 'boolean', default: false},
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
        titlePosition: {type: 'string', default: "0 0 0"},
        scale: {type: 'number'},
        heightMax: {type: 'number'}
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
            //remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
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
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale
        const heightMax = data.heightMax

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
        let animation = data.animation

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.size; }))
        if (scale) {
            maxY = maxY / scale
        } else if (heightMax){
            valueMax = maxY
            proportion = heightMax / maxY
            maxY = heightMax
        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

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

            let barEntity = generateBar(bar['size'], widthBars, colorid, stepX, stepZ, palette, animation, scale);

            //Prepare legend
            if (data.legend) {
                showLegend(barEntity, bar, element)
            }

            chart_entity.appendChild(barEntity);

            //Print Title
            let title_3d = showTitle(title, font, color, title_position);
            element.appendChild(title_3d);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict, palette)
            showZAxis(element, maxZ, zaxis_dict, palette)
            showYAxis(element, maxY, scale)
        }
    }
}

let widthBars = 1
let proportion
let valueMax

function generateBar(size, width, colorid, positionX, positionZ, palette, animation, scale) {
    let color = getColor(colorid, palette)
    console.log("Generating bar...")
    if (scale) {
        size = size / scale
    } else if (proportion){
        size = proportion * size
    }

    let entity = document.createElement('a-box');
    entity.setAttribute('color', color);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    // Add animation
    if (animation){
        var duration = 4000
        var increment = 10 * size / duration 
        var height = 0
        var id = setInterval(animation, 10);
        function animation() {
            if (height >= size) {
                clearInterval(id);
            } else {
                height += increment;
                entity.setAttribute('height', height);
                entity.setAttribute('position', { x: positionX, y: height / 2, z: positionZ }); 
            }  
        }
    } else {
        entity.setAttribute('height', size);
        entity.setAttribute('position', { x: positionX, y: size / 2, z: positionZ });
    }
    return entity;
}

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
}

function generateLegend(bar, barEntity) {
    let text = bar['key'] + ': ' + bar['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let barPosition = barEntity.getAttribute('position')
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: barPosition.x, y: 2 * barPosition.y + 1, z: barPosition.z + widthBars + 0.1 });
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
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(barEntity, bar, element) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bar, barEntity);
        element.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bars_printed, palette) {
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
        let color = getColor(e.colorid, palette)
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': e.key,
            'align': 'left',
            'width': 10,
            'color': color
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBars-5 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bars_printed, palette) {
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
        let color = getColor(e.colorid, palette)
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': color
        });
        key.setAttribute('position', { x: -widthBars-5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd, scale) {
    let axis = document.createElement('a-entity');
    let yLimit = yEnd
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: -widthBars, y: yEnd, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBars / 2 + widthBars / 4) });
    axis.appendChild(axis_line)

    if (proportion){
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    }   
    for (let i = 0; i<=yLimit; i++){
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod-1)
        if (!proportion || (proportion && i%pow === 0)){  
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale){
                key.setAttribute('text', {'value': value * scale})
                key.setAttribute('position', { x: -widthBars-5.2, y: value, z: -(widthBars / 2 + widthBars / 4) })
            } else {
                key.setAttribute('position', { x: -widthBars-5.2, y: i * proportion, z: -(widthBars / 2 + widthBars / 4) })
            }     
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showTitle(title, font, color, position){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = position.split(" ") 
    entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
    entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
    {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
    {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
    {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
    {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
    {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
    {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
    {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
    {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]


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
AFRAME.registerComponent('geo3dcylinderchart', {
  schema: {
    data: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: { type: 'boolean', default: false},
    palette: {type: 'string', default: 'ubuntu'},
    title: {type: 'string'},
    titleFont: {type: 'string'},
    titleColor: {type: 'string'},
    titlePosition: {type: 'string', default: "0 0 0"},
    scale: {type: 'number'},
    heightMax: {type: 'number'},
    radiusMax: {type: 'number'},
  },

      /**
    * Set if component needs multiple instancing.
    */
   multiple: false,

      /**
    * Called once when component is attached. Generally for initial setup.
    */
  init: function () {
    let el = this.el;
    let data = this.data;
  },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
  update: function (oldData) {
    let el = this.el;
    let data = this.data;


    /**
     * Update or create chart component
     */
    if (data.data !== oldData.data) {
      //remove previous chart
      while (this.el.firstChild)
        this.el.firstChild.remove();
      console.log("Generating Cylinder...")
      generateCylinderChart(data, el)
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

let generateCylinderChart = (data, element) => {
  if (data.data) {
    const dataToPrint = JSON.parse(data.data)
    const palette = data.palette
    const title = data.title
    const font = data.titleFont
    const color = data.titleColor
    const title_position = data.titlePosition
    const scale = data.scale
    const heightMax = data.heightMax
    const radiusMax = data.radiusMax

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
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o.radius; }))
    if (scale) {
        maxY = maxY / scale
        maxRadius = maxRadius / scale
    } else if (heightMax || radiusMax){
        if (heightMax){
          valueMax = maxY
          proportion = heightMax / maxY
          maxY = heightMax
        }
        if (radiusMax){
          stepMax = maxRadius
          radius_scale = radiusMax / maxRadius
          maxRadius = radiusMax
        }
    }

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
        // Check if used in order to put the cylinder in the parent row
        if (keys_used[cylinder['key']]) {
            stepX = keys_used[cylinder['key']].posX
            colorid = keys_used[cylinder['key']].colorid
        } else {
            stepX = maxX
            colorid = maxColorId
            //Save in used
            keys_used[cylinder['key']] = {
                "posX": maxX,
                "colorid": maxColorId
            }

            //Axis dict
            let cylinder_printed = {
                colorid: colorid,
                posX: stepX,
                key: cylinder['key']
            }
            xaxis_dict.push(cylinder_printed)

            maxX += 2 * maxRadius + 1
            maxColorId++
        }

        // Get Z val
        if (z_axis[cylinder['key2']]) {
            stepZ = z_axis[cylinder['key2']].posZ
        } else {
            stepZ = maxZ
            //Save in used
            z_axis[cylinder['key2']] = {
                "posZ": maxZ
            }

            //Axis dict
            let cylinder_printed = {
                colorid: colorid,
                posZ: stepZ,
                key: cylinder['key2']
            }
            zaxis_dict.push(cylinder_printed)

            maxZ += 2 * maxRadius + 1
        }

        let cylinderEntity = generateCylinder(cylinder['height'], cylinder['radius'], colorid, palette, stepX, stepZ, animation, scale);
        
        //Prepare legend
        if (data.legend) {
            showLegend(cylinderEntity, cylinder, element)
        }

        chart_entity.appendChild(cylinderEntity, element)
        
        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }

    // Axis
    if (data.axis) {
        showXAxis(element, maxX, xaxis_dict, palette)
        showZAxis(element, maxZ, zaxis_dict)
        showYAxis(element, maxY, scale)
    }
  }
}

let maxRadius
let proportion
let valueMax
let radius_scale
let stepMax

function generateCylinder(height, radius, colorid, palette, positionX, positionZ, animation, scale) {
  let color = getColor(colorid, palette)
  let entity = document.createElement('a-cylinder');
  if (scale) {
      height = height / scale
      radius = radius / scale
  } else if (proportion || radius_scale){
      if (proportion){
        height = proportion * height
      }
      if (radius_scale){
        radius = radius_scale * radius
      }
  }
  entity.setAttribute('color', color);
  entity.setAttribute('height', 0);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation){
    var duration = 4000
    var increment = 20 * height / duration 
    var size = 0
    var id = setInterval(animation, 1);
    function animation() {
        if (size >= height) {
            clearInterval(id);
        } else {
            size += increment;
            entity.setAttribute('height', size);
            entity.setAttribute('position', { x: positionX, y: size / 2, z: positionZ }); 
        }  
    }
  } else {
    entity.setAttribute('height', height);
    entity.setAttribute('position', { x: positionX, y: height / 2, z: positionZ });
  }
  return entity;
}

function getColor(colorid, palette){
  let color
  for (let i in colors){
      if(colors[i][palette]){
          color = colors[i][palette][colorid%4]
      }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
      'start': { x: -maxRadius-1, y: 0, z: -maxRadius },
      'end': { x: xEnd, y: 0, z: -maxRadius },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0.1, z: - 1 });
  axis.appendChild(axis_line)
  
  //Print keys
  cylinder_printed.forEach(e => {
      let key = document.createElement('a-entity');
      let color = getColor(e.colorid, palette)
      key.setAttribute('text', {
          'value': e.key,
          'align': 'left',
          'width': 30,
          'color': color
      });
      key.setAttribute('position', { x: e.posX, y: 0.1, z: -maxRadius - 16.5 })
      key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
      axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}

function showYAxis(parent, yEnd, scale) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
      'start': { x: -maxRadius, y: 0, z: 0 },
      'end': { x: -maxRadius, y: yEnd, z: 0 },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius-1});
  axis.appendChild(axis_line)

  if (proportion){
      yLimit = yLimit / proportion
      var mod = Math.floor(Math.log10(valueMax))
  } 
  for (let i = 0; i<=yLimit; i++){
      let key = document.createElement('a-entity');
      let value = i
      let pow = Math.pow(10, mod-1)
      if (!proportion || (proportion && i%pow === 0)){  
          key.setAttribute('text', {
              'value': value,
              'align': 'right',
              'width': 10,
              'color': 'white '
          });
          if (scale){
              key.setAttribute('text', {'value': value * scale})
              key.setAttribute('position', { x: -maxRadius - 6.5, y: value, z: -maxRadius - 1 })
          } else if (proportion){
              key.setAttribute('position', { x: -maxRadius - 6.5, y: i * proportion, z: -maxRadius - 1 })
          } else {
              key.setAttribute('position', {x: -maxRadius - 6.5, y: i, z: -maxRadius - 1})
          }     
      }
      axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showZAxis(parent, zEnd, cylinder_printed) {
  let axis = document.createElement('a-entity');
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
      'start': { x: -maxRadius, y: 0.1, z: 0 },
      'end': { x: -maxRadius, y: 0.1, z: zEnd + maxRadius},
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1 , y: 0, z: -maxRadius - 1 });
  axis.appendChild(axis_line)

  //Print keys
  cylinder_printed.forEach(e => {
      let key = document.createElement('a-entity');
      key.setAttribute('text', {
          'value': e.key,
          'align': 'right',
          'width': 30,
          'color': '#ffffff'
      });
      key.setAttribute('position', { x: -maxRadius - 16.5, y: 0.1, z: e.posZ })
      key.setAttribute('rotation', { x: -90, y: 0.1, z: 0 });
      axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}


function showLegend(cylinderEntity, cylinder, element) {
  cylinderEntity.addEventListener('mouseenter', function () {
      this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
      legend = generateLegend(cylinder, cylinderEntity);
      element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
      this.setAttribute('scale', { x: 1, y: 1, z: 1 });
      element.removeChild(legend);
  });
}

function generateLegend(cylinder, cylinderEntity) {
  let text = ''
  let lines = []
  lines.push(cylinder['key'] + ' ' + cylinder['key2'] + '\n');
  lines.push('Height: ' + cylinder['height'] + '\n');
  lines.push('Radius: ' + cylinder['radius'])
  let width = 5;
  for (let line of lines){
    if ((line.length > 10) && (width < line.length / 2)){
      width = line.length / 2;
    }
    text += line
  }

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', { x: cylinderPosition.x, y: 2 * cylinderPosition.y + 3, 
                                    z: cylinderPosition.z + cylinder['radius'] / 2});
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '4');
  entity.setAttribute('width', width );
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
      'value': text,
      'align': 'center',
      'width': 20,
      'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showTitle(title, font, color, position){
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry',{
      value : title,
  });
  if (font){
      entity.setAttribute('text-geometry', {
          font: font,
      })
  }
  if (color){
      entity.setAttribute('material' ,{
          color : color
      })
  }
  var position = position.split(" ") 
  entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
  entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
  entity.classList.add("babiaxrTitle")
  return entity;
}

let colors = [
  {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
  {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
  {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
  {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
  {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
  {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
  {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
  {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
  {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]

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
AFRAME.registerComponent('geobubbleschart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        animation: {type: 'boolean', default: false},
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
        titlePosition: {type: 'string', default: "0 0 0"},
        scale: {type: 'number'},
        heightMax: {type: 'number'},
        radiusMax: {type: 'number'},
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
            //remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
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
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale
        const heightMax = data.heightMax
        const radiusMax = data.radiusMax

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
        let animation = data.animation

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))
        widthBubbles = Math.max.apply(Math, Object.keys( dataToPrint ).map(function (o) { return dataToPrint[o].radius; }))
        if (scale) {
            maxY = maxY / scale
            widthBubbles = widthBubbles / scale
        } else if (heightMax || radiusMax){
            if (heightMax){
              valueMax = maxY
              proportion = heightMax / maxY
              maxY = heightMax
            }
            if (radiusMax){
              stepMax = widthBubbles
              radius_scale = radiusMax / widthBubbles
              widthBubbles = radiusMax
            }
        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

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

                maxX += 2 * widthBubbles
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

                maxZ += 2 * widthBubbles
            }

            let bubbleEntity = generateBubble(bubble['radius'], bubble['height'], widthBubbles, colorid, palette, stepX, stepZ, animation, scale);

            //Prepare legend
            if (data.legend) {
                showLegend(bubbleEntity, bubble, element)
            }

            chart_entity.appendChild(bubbleEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict)
            showZAxis(element, maxZ, zaxis_dict)
            showYAxis(element, maxY, scale)
        }

        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }
}

let widthBubbles = 0
let proportion
let valueMax
let radius_scale
let stepMax

function generateBubble(radius, height, width, colorid, palette, positionX, positionZ, animation, scale) {
    let color = getColor(colorid, palette)
    console.log("Generating bubble...")
    if (scale) {
        height = height / scale
        radius = radius / scale
    } else if (proportion || radius_scale){
        if (proportion){
          height = proportion * height
        }
        if (radius_scale){
          radius = radius_scale * radius
        }
    }
    let entity = document.createElement('a-sphere');
    entity.setAttribute('color', color);
    entity.setAttribute('radius', radius);
    // Add Animation
  if (animation) {
    let from = positionX.toString() + " " + radius.toString() + " " + positionZ.toString()
    let to = positionX.toString() + " " + (radius + height).toString() + " " + positionZ.toString()
    entity.setAttribute('animation__position',{
      'property': 'position',
      'from': from,
      'to': to,
      'dur': '3000',
      'easing': 'linear',
    })
  } else {
    entity.setAttribute('position', { x: positionX, y: radius + height, z: positionZ });
  }
    return entity;
}

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
}

function generateLegend(bubble, bubbleEntity) {
    let text = bubble['key'] + ': \n Radius:' + bubble['radius'] + '\nHeight:' + bubble['height'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let bubblePosition = bubbleEntity.getAttribute('position')
    let bubbleRadius = parseFloat(bubbleEntity.getAttribute('radius'))
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: bubblePosition.x, y: bubblePosition.y + bubbleRadius + 1,
                                      z: bubblePosition.z + 0.1 });
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
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(bubbleEntity, bubble, element) {
    bubbleEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bubble, bubbleEntity);
        element.appendChild(legend);
    });

    bubbleEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bubbles_printed, palette) {
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
        let color = getColor(e.colorid, palette)
        key.setAttribute('text', {
            'value': e.key,
            'align': 'left',
            'width': 10,
            'color': color
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBubbles-3.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bubbles_printed, palette) {
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
        let color = getColor(e.colorid, palette)
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': color
        });
        key.setAttribute('position', { x: -widthBubbles-5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd, scale) {
    let axis = document.createElement('a-entity');
    let yLimit = yEnd
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBubbles, y: 0, z: 0 },
        'end': { x: -widthBubbles, y: yLimit, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBubbles / 2 + widthBubbles / 4) });
    axis.appendChild(axis_line)

    if (proportion){
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    } 
    for (let i = 0; i<=yLimit; i++){
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod-1)
        if (!proportion || (proportion && i%pow === 0)){  
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale){
                key.setAttribute('text', {'value': value * scale})
                key.setAttribute('position', { x: -widthBubbles-5.2, y: value, z: -(widthBubbles / 2 + widthBubbles / 4) })
            } else if (proportion){
                key.setAttribute('position', { x: -widthBubbles-5.2, y: i * proportion, z: -(widthBubbles / 2 + widthBubbles / 4)})
            } else {
                key.setAttribute('position', { x: -widthBubbles-5.2, y: i, z: -(widthBubbles / 2 + widthBubbles / 4)})
            }     
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showTitle(title, font, color, position){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = position.split(" ") 
    entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
    entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
    {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
    {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
    {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
    {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
    {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
    {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
    {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
    {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]


/***/ }),
/* 6 */
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
            default: JSON.stringify({ id: "CodeCity", area: 1, height: 1 })
        },
        // Field in data items to represent as area
        farea: {
            type: 'string',
            default: 'area'
        },
        // Field in data items to represent as max_area
        fmaxarea: {
            type: 'string',
            default: 'max_area'
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
        // Titles on top of the buildings when hovering
        titles: {
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
        // Time evolution time changing between snapshots
        time_evolution_delta: {
            type: 'number',
            default: 8000
        },
        // Time evolution time changing between snapshots
        time_evolution_init: {
            type: 'string',
            default: 'data_0'
        },
        // Time evolution direction
        time_evolution_past_present: {
            type: 'boolean',
            default: false
        },
        // ui navbar UD
        ui_navbar: {
            type: 'string',
            default: ""
        }
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        this.loader = new THREE.FileLoader();
        let data = this.data;
        let el = this.el;

        if (typeof data.data == 'string') {
            if (data.data.endsWith('json')) {
                raw_items = requestJSONDataFromURL(data);
            } else {
                raw_items = JSON.parse(data.data);
            }
        } else {
            raw_items = data.data;
        };

        deltaTimeEvolution = data.time_evolution_delta

        this.zone_data = raw_items;
        let zone = new Zone({
            data: this.zone_data,
            extra: function (area) { return area * data.extra; },
            farea: data.farea, fheight: data.fheight, fmaxarea: data.fmaxarea
        });

        let width, depth;
        if (data.absolute == true) {
            width = Math.sqrt(zone.areas.canvas) * data.width / data.depth;
            depth = zone.areas.canvas / width;
        } else {
            width = data.width;
            depth = data.depth
        };

        // New levels are entities relative (children of the previous level) or not
        let merged = data.merged;
        let relative = true;
        if (merged) {
            relative = false;
        };
        let canvas = new Rectangle({ width: width, depth: depth, x: 0, z: 0 });
        zone.add_rects({ rect: canvas, split: data.split, relative: relative });
        let base = document.createElement('a-entity');
        this.base = base;
        let visible = true;
        if (merged) {
            base.addEventListener('loaded', (e) => {
                if (data.building_model) {
                    console.log("In loaded, model:", base);
                    base.setAttribute('gltf-buffer-geometry-merger', { preserveOriginal: true });
                } else if (data.buffered) {
                    console.log("In loaded, buffered:", base);
                    base.setAttribute('material', { vertexColors: 'vertex' });
                    base.setAttribute('buffer-geometry-merger2', { preserveOriginal: true });
                } else {
                    console.log("In loaded, unbuffered:", base);
                    base.setAttribute('geometry-merger', { preserveOriginal: true });
                    base.setAttribute('material', { vertexColors: 'face' });
                };
            });
            if (data.buffered) {
                visible = false;
            } else {
                visible = false;
            };
        };

        console.log("Init (relative, buffered, merged):", relative, data.buffered, merged);
        zone.draw_rects({
            ground: canvas, el: base, base: data.base,
            level: 0, elevation: 0, relative: relative,
            base_thick: data.base_thick,
            wireframe: data.wireframe,
            building_color: data.building_color, base_color: data.base_color,
            model: data.building_model, visible: visible,
            buffered: data.buffered, titles: data.titles
        });
        el.appendChild(base);

        // Time Evolution starts
        if (time_evolution) {
            time_evolution_past_present = data.time_evolution_past_present
            dateBar(data)
            time_evol()
        }
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
    // pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }

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

AFRAME.registerComponent('gltf-buffer-geometry-merger', {
    schema: {
        preserveOriginal: { default: false }
    },

    init: function () {
        let self = this;
        let models = 0;
        this.el.object3D.traverse(function (mesh) {
            if (mesh.type == 'Group') {
                for (component in mesh.el.components) {
                    if (component == 'gltf-model') {
                        models++;
                    };
                };
            };
        });

        this.el.addEventListener('model-loaded', function (e) {
            models--;
            if (models <= 0) {
                self.el.setAttribute('buffer-geometry-merger2',
                    { preserveOriginal: self.data.preserveOriginal });
            };
        });
    }
});

/*
 * Merge buffered geometries in elements in the subtree
 *
 * Based on buffer-geometry-merger
 * https://www.npmjs.com/package/aframe-geometry-merger-component
 */

AFRAME.registerComponent('buffer-geometry-merger2', {
    schema: {
        preserveOriginal: { default: false }
    },

    init: function () {
        var geometries = [];
        var material = null;
        let self = this;
        console.log("Init");

        self.el.object3D.updateMatrixWorld();
        self.el.object3D.traverse(function (mesh) {
            if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; };
            let geometry = mesh.geometry.clone();
            if (material == null) {
                material = mesh.material.clone();
            };
            let currentMesh = mesh;
            while (currentMesh !== self.el.object3D) {
                geometry.applyMatrix(currentMesh.parent.matrix);
                currentMesh = currentMesh.parent;
            }
            geometries.push(geometry);
            // Remove mesh if not preserving.
            if (!self.data.preserveOriginal) { mesh.parent.remove(mesh); }
        });

        const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        self.mesh = new THREE.Mesh(geometry, material);
        self.el.setObject3D('mesh', self.mesh);
    },


});

//AFRAME.registerComponent('buffer-geometry-merger2', {
//  schema: {
//    preserveOriginal: {default: false}
//  },
//
//  init: function () {
//    var geometries = [];
//    let self = this;
//
//    this.el.object3D.updateMatrixWorld();
//    this.el.object3D.traverse(function (mesh) {
//      if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; }
//      let geometry = mesh.geometry.clone();
//      let currentMesh = mesh;
//      while (currentMesh !== self.el.object3D) {
//        geometry.applyMatrix(currentMesh.parent.matrix);
//        currentMesh = currentMesh.parent;
//      }
//      geometries.push(geometry);
//      mesh.parent.remove(mesh);
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
        color: { default: '#FFF' }
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
 * vertex-colors-buffer component
 * Copied from https://github.com/supermedium/superframe/blob/master/components/geometry-merger/examples/buffer/vertex-colors-buffer.js
 */
var colorHelper = new THREE.Color();

AFRAME.registerComponent('vertex-colors-buffer', {
    schema: {
        baseColor: { type: 'color' },
        itemSize: { default: 3 }
    },

    update: function (oldData) {
        var colors;
        var data = this.data;
        var i;
        var el = this.el;
        var geometry;
        var mesh;
        var self = this;

        mesh = this.el.getObject3D('mesh');

        if (!mesh || !mesh.geometry) {
            el.addEventListener('object3dset', function reUpdate(evt) {
                if (evt.detail.type !== 'mesh') { return; }
                el.removeEventListener('object3dset', reUpdate);
                self.update(oldData);
            });
            return;
        }

        geometry = mesh.geometry;

        // Empty geometry.
        if (!geometry.attributes.position) {
            console.warn('Geometry has no vertices', el);
            return;
        }

        if (!geometry.attributes.color) {
            geometry.addAttribute('color',
                new THREE.BufferAttribute(
                    new Float32Array(geometry.attributes.position.array.length), 3
                )
            );
        }

        colors = geometry.attributes.color.array;

        // TODO: For some reason, incrementing loop by 3 doesn't work. Need to do by 4 for glTF.
        colorHelper.set(data.baseColor);
        for (i = 0; i < colors.length; i += data.itemSize) {
            colors[i] = colorHelper.r;
            colors[i + 1] = colorHelper.g;
            colors[i + 2] = colorHelper.b;
        }

        geometry.attributes.color.needsUpdate = true;
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
    constructor({ data, extra = function (area) { return area; },
        farea = 'area', fmaxarea = 'max_area', fheight = 'height' }) {
        this.data = data;
        this.id = this.data.id;
        this.extra = extra;
        this.farea = farea;
        this.fmaxarea = fmaxarea;
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
    areas_tree({ data = this.data, level = 0 } = {}) {
        let data_node = data;
        let node = { data: data_node };
        if ('children' in data_node) {
            node.inner = 0;
            node.area = 0;
            node.children = [];
            for (const data_child of data_node.children) {
                let child = this.areas_tree({ data: data_child, level: level + 1 });
                node.inner += child.canvas;
                node.area += child.area;
                node.children.push(child);
            };
        } else {
            // Leaf node
            node.area = data_node[this.farea];
            node.max_area = data_node[this.fmaxarea]
            node.inner = node.max_area;
            node.inner_real = node.area;
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
    add_rects({ rect, area = this.areas, relative = true, split = 'naive' } = {}) {
        // Make this the rectangle for the area, and compute its inner dimensions
        area.rect = rect;
        area.rect.inner(area.canvas, area.inner, area.inner_real);
        if ('children' in area) {
            let child_areas = new Values(area.children.map(child => child.canvas),
                area.inner);
            let child_rect;
            if (split === 'naive') {
                child_rect = area.rect.split(child_areas, relative);
                // console.log("Naive split");
            } else if (split === 'pivot') {
                child_rect = area.rect.split_pivot(child_areas, relative);
                // console.log("Pivot split");
            } else {
                throw new Error("CodeCity: Unknwon split method");
            };
            for (const i in area.children) {
                this.add_rects({
                    rect: child_rect[i],
                    area: area.children[i],
                    relative: relative,
                    split: split
                });
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
    draw_rects({ ground, el, area = this.areas,
        level = 0, elevation = 0, relative = true,
        base_thick = .2, wireframe = false,
        building_color = "red", base_color = "green", model = null,
        visible = true, buffered = false, titles = true }) {
        if (level === 0) {
            this.el = el;
        };
        let pending_rects = this.pending_rects;
        if ('children' in area) {
            // Create base for this area, and go recursively to the next level
            let base = area.rect.box({
                elevation: elevation,
                height: base_thick,
                color: base_color, inner: false,
                wireframe: wireframe, visible: visible,
                buffered: buffered,
                id: area.data['id'],
                rawarea: 0
            });
            el.appendChild(base);
            let root_el = base;
            if (!relative) { root_el = el };
            for (const child of area.children) {
                let next_elevation = base_thick / 2;
                if (!relative) { next_elevation = elevation + base_thick };
                this.draw_rects({
                    ground: area.rect, el: root_el, area: child,
                    level: level + 1, elevation: next_elevation,
                    relative: relative,
                    building_color: building_color, base_color: base_color,
                    model: model,
                    base_thick: base_thick, wireframe: wireframe,
                    visible: visible, buffered: buffered, titles: titles
                });
            };
        } else {
            // Leaf node, create the building
            let height = area.data[this.fheight];
            let box = area.rect.box({
                height: area.data[this.fheight],
                elevation: elevation,
                wireframe: wireframe,
                color: building_color,
                model: model,
                visible: visible,
                buffered: buffered,
                id: area.data['id'],
                rawarea: area.data[this.farea],
                inner_real: true
            });
            box.setAttribute('class', 'mouseentertitles');
            el.appendChild(box);

            // Titles
            if (titles) {
                let legend;
                box.addEventListener('mouseenter', function () {
                    let oldGeometry = box.getAttribute('geometry')
                    this.setAttribute('geometry', {
                        height: oldGeometry.height + 0.1,
                        depth: oldGeometry.depth + 0.1,
                        width: oldGeometry.width + 0.1
                    });
                    this.setAttribute('material', {
                        'visible': true
                    });
                    legend = generateLegend(this.getAttribute("id"), this, null);
                    this.appendChild(legend)
                })

                box.addEventListener('mouseleave', function () {
                    let oldGeometry = this.getAttribute('geometry')
                    this.setAttribute('geometry', {
                        height: oldGeometry.height - 0.1,
                        depth: oldGeometry.depth - 0.1,
                        width: oldGeometry.width - 0.1
                    });
                    this.setAttribute('material', {
                        'visible': false
                    });
                    this.removeChild(legend)
                })
            }
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
        if (typeof (total) !== 'undefined') {
            this.total = total;
        } else {
            this.total = values.reduce((acc, a) => acc + a, 0);
        };
    }

    imax() {
        let largest = this.items[0];
        let largest_i = 0;

        for (let i = 0; i < this.items.length; i++) {
            if (largest < this.items[i]) {
                largest = this.items[i];
                largest_i = i;
            };
        };
        return largest_i;
    }

    static range(start, length) {
        var indexes = [];
        for (let i = start; i < start + length; i++) {
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
            return {
                pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [], a3: []
            };
        };

        if (this.items.length == pivot_i + 2) {
            // Only one item to the right of pivot. It is a2. a3 is empty.
            return {
                pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [pivot_i + 1], a3: []
            };
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
        while (a2_area < a2_area_ideal && i < this.items.length) {
            a2_area_last = a2_area;
            a2_area += this.scaled_area(area, i);
            i++;
        };
        // There are two candidates to be the area closest to the ideal area:
        // the last area computed (long), and the one that was conputed before it (short),
        // provided the last computed one is not the next to the pivot (in that case,
        // the last computed is the next to the pivot, and therefore it needs to be the
        // first in a3.
        let a3_first = i;
        if ((i - 1 > pivot_i) &&
            (Math.abs(a2_area - a2_area_ideal) > Math.abs(a2_area_last - a2_area_ideal))) {
            a3_first = i - 1;
        };

        a2_len = a3_first - pivot_i - 1;
        a3_len = this.items.length - a3_first;
        return {
            pivot: pivot_i,
            a1: Values.range(0, pivot_i),
            a2: Values.range(pivot_i + 1, a2_len),
            a3: Values.range(pivot_i + 1 + a2_len, a3_len)
        };
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
        return (region_total / this.total) * width;
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
    constructor({ width, depth, x = 0, z = 0 }) {
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
    is_ilaying() {
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
    inner(acanvas, ainner, ainner_real) {
        if (acanvas < ainner) {
            throw "Rectangle.inner: Area for inner rectangle larger than my area"
        };
        if (typeof acanvas !== 'undefined') {
            let ratio = Math.sqrt(ainner / acanvas);
            this.iwidth = ratio * this.width;
            this.idepth = ratio * this.depth;
            if (ainner_real) {
                // The area to print may be less than the max area (of the past)
                let ratio_real = Math.sqrt(ainner_real / acanvas);
                this.iwidth_real = ratio_real * this.width;
                this.idepth_real = ratio_real * this.depth;
            }
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
    split(values, relative = true) {
        // Always split on width, as if the rectangle was laying.
        // Use local variables to point to the rigth real dimensions
        let [width, depth, x, z, reflected] = this.idims_as_laying();
        // Ratio to convert a size in a split (part of total)
        let ratio = width / values.total;
        let current_x = -width / 2;
        let current_z = 0;
        if (!relative) {
            current_x += x;
            current_z = z;
        };
        let rects = [];
        // Value of fields scaled to fit total canvas
        for (const value of values.items) {
            let sub_width = value * ratio;
            let rect = new Rectangle({
                width: sub_width, depth: depth,
                x: current_x + sub_width / 2, z: current_z
            });
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
    split_pivot(values, relative = true) {
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
        let { pivot, a1, a2, a3 } = values.pivot_regions(width, depth);
        // Dimensions for areas (a1, a2, a3)
        let width_a1 = values.pivot_region_width(a1, width);
        let width_a2 = values.pivot_region_width(a2.concat(pivot), width);
        let width_a3 = values.pivot_region_width(a3, width);
        let x_a1 = x - width / 2 + width_a1 / 2;
        let x_a2 = x - width / 2 + width_a1 + width_a2 / 2;
        let x_a3 = x - width / 2 + width_a1 + width_a2 + width_a3 / 2;

        let rects = [];
        // Pivot rectangle
        let depth_pivot = values.scaled_area(width * depth, pivot) / width_a2;
        rects[pivot] = new Rectangle({
            width: width_a2, depth: depth_pivot,
            x: x_a2,
            z: z + depth / 2 - depth_pivot / 2
        });
        // Dimensions for each area (and corresponding rectangle)
        let dim_areas = [
            [a1, width_a1, depth, x_a1, z],
            [a2, width_a2, depth - depth_pivot, x_a2, z - depth_pivot / 2],
            [a3, width_a3, depth, x_a3, z]];
        for (const [values_i, width_i, depth_i, x_i, z_i] of dim_areas) {
            if (values_i.length > 0) {
                let subrect = new Rectangle({
                    width: width_i, depth: depth_i,
                    x: x_i, z: z_i
                });
                subrect.inner();
                // Ensure we add rectangles in the right places
                let subvalues = values.values_i(values_i);
                // Further splits should always be absolute, wrt my coordinates
                let rects_i = subrect.split_pivot(subvalues, false);
                let counter = 0;
                for (const i of values_i) {
                    rects[i] = rects_i[counter];
                    counter++;
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
    box({ height, elevation = 0, color = 'red', model = null, inner = true,
        wireframe = false, visible = true, buffered = false, id = "", rawarea = 0, inner_real = false }) {
        let depth, width;
        if (inner_real) {
            [depth, width] = [this.idepth_real, this.iwidth_real];
        } else if (inner) {
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

        box.setAttribute('position', {
            x: this.x,
            y: elevation + height / 2,
            z: this.z
        });
        if (model == null) {
            if (buffered) {
                box.setAttribute('vertex-colors-buffer', { 'baseColor': color });
                box.setAttribute('material', { 'visible': visible });
            } else {
                box.setAttribute('material', {
                    'wireframe': wireframe,
                    'vertexColors': 'face',
                    'visible': visible
                });
                box.setAttribute('face-colors', { 'color': color });
            };
        };
        box.setAttribute('id', id);
        box.setAttribute('babiaxr-rawarea', rawarea);



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
 * Auxiliary function: produce a random data tree for codecity
 */
let rnd_producer = function (levels = 2, number = 3, area = 20, height = 30) {
    if (levels == 1) {
        return {
            "id": "A",
            "area": Math.random() * area,
            "height": Math.random() * height
        };
    } else if (levels > 1) {
        let children = Array.from({ length: number }, function () {
            return rnd_producer(levels - 1, number, area, height);
        });
        return { id: "BlockAA", children: children };
    };
};

if (true) {
    module.exports = { Values, Rectangle, Zone };
};


/**
 * Request a JSON url
 */
let requestJSONDataFromURL = (data) => {
    let items = data.data
    let raw_items
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', items, false)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            ////// console.log("data OK in request.response", request.response)
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

    // If time evolution
    if (raw_items.time_evolution) {
        main_json = raw_items
        time_evolution = true
        time_evolution_commit_by_commit = raw_items.time_evolution_commit_by_commit

        // Get first tree
        let first_tree = raw_items.data_files.find(o => o.key_tree === "data_0_tree");
        raw_items = first_tree["data_0_tree"]
        initItems = first_tree["data_0"]

        // Items of the time evolution
        let navbarData = []
        for (let i = 0; i < main_json.data_files.length; i++) {
            let array_of_tree_to_retrieve = "data_" + i
            timeEvolutionItems[array_of_tree_to_retrieve] = main_json.data_files[i]
            navbarData.push({
                date: new Date(main_json.data_files[i].date * 1000).toLocaleDateString(),
                commit: main_json.data_files[i].key,
                data: i
            })
        }

        // Navbar if defined
        if (data.ui_navbar) {
            ui_navbar = data.ui_navbar
            document.getElementById(ui_navbar).setAttribute("ui-navigation-bar", "commits", JSON.stringify(navbarData.reverse()))
        }

        // Change init tree if needed
        if (data.time_evolution_init !== "data_0") {
            let key
            if (timeEvolutionItems[data.time_evolution_init][data.time_evolution_init + "_allfiles"]) {
                key = data.time_evolution_init + "_allfiles"
            } else {
                key = data.time_evolution_init
            }

            let leafEntities = findLeafs(raw_items['children'], {})

            timeEvolutionItems[data.time_evolution_init][key].forEach((item) => {
                if (leafEntities[item.id]) {
                    leafEntities[item.id].height = item.height
                    leafEntities[item.id].area = item.area
                    leafEntities[item.id].max_area = item.max_area
                }
                //changeBuildingLayout(item)
            })

            index = parseInt(data.time_evolution_init.split("_")[1])
        }


    }
    return raw_items
}

let time_evolution = false
let time_evolution_commit_by_commit = false
let ui_navbar = undefined
let timeEvolutionItems = {}
let dateBarEntity
let deltaTimeEvolution = 8000
let main_json = {}
let initItems = undefined
let changedItems = []
let index = 0
let timeEvolTimeout = undefined


/**
 *  This function generate a plane with date of files
 */
let dateBar = (data) => {
    // get entity codecity
    let component
    if (document.getElementById('scene')) {
        component = document.getElementById('scene')
    } else {
        component = document.getElementsByTagName('a-scene')
        // Others
        let entities = document.getElementsByTagName('a-entity')
        /*for (let i in entities)
        {
            if (entities[i].attributes && entities[i].attributes['geocodecity']){
                component = entities[i]
            }
        }*/
    }

    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrDateBar')
    entity.setAttribute('position', { x: -13, y: 10, z: -3 })
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('material', {
        color: 'black'
    })
    entity.setAttribute('height', 0.5)
    entity.setAttribute('width', 2)
    entity.setAttribute('scale', { x: 1, y: 1, z: 1 })

    let text = "Date: " + new Date(timeEvolutionItems[data.time_evolution_init].date * 1000).toLocaleDateString()
    if (timeEvolutionItems[data.time_evolution_init].commit_sha) {
        text += "\n\nCommit: " + timeEvolutionItems[data.time_evolution_init].commit_sha
    }
    entity.setAttribute('text-geometry', {
        value: text,
    });

    dateBarEntity = entity
    component.appendChild(entity)

}

/**
 * This function generate a plane at the top of the building with the desired text
 */
let generateLegend = (text, buildingEntity, model) => {
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

    entity.setAttribute('position', { x: 0, y: height / 2 + 1, z: 0 });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('material', { 'side': 'double' });
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black',
    });
    /*entity.setAttribute('light', {
      'intensity': 0.3
    });*/
    return entity;
}

function time_evol() {
    const maxFiles = Object.keys(timeEvolutionItems).length

    let i = 0

    if (ui_navbar) {
        // Events from the navbar
        document.addEventListener('babiaxrToPast', function () {
            time_evolution_past_present = false
        })
        document.addEventListener('babiaxrToPresent', function () {
            time_evolution_past_present = true
        })
        document.addEventListener('babiaxrStop', function () {
            clearInterval(timeEvolTimeout)
        })
        document.addEventListener('babiaxrContinue', function () {
            timeEvolTimeout = setTimeout(function () {

                loopLogic(maxFiles, i)

                if (i < maxFiles - 1) {
                    loop();
                }
            }, deltaTimeEvolution);
        })
        document.addEventListener('babiaxrSkipNext', function () {
            time_evolution_past_present = false
            clearInterval(timeEvolTimeout)
            i--
            index--
            changeCity()
        })
        document.addEventListener('babiaxrSkipPrev', function () {
            time_evolution_past_present = true
            clearInterval(timeEvolTimeout)
            i++
            index++
            changeCity()
        })
        document.addEventListener('babiaxrShow', function (event) {
            clearInterval(timeEvolTimeout)
            eventData = event.detail.data
            i = eventData.data
            index = i - 1
            changeCity()
        })

    }
    let loop = () => {
        timeEvolTimeout = setTimeout(function () {

            loopLogic(maxFiles, i)



            if (i < maxFiles - 1) {
                loop();
            }
        }, deltaTimeEvolution);
    }

    let doIt = () => {
        loop();
    }

    doIt();

}

let loopLogic = (maxFiles, i) => {
    console.log("Loop number", i)

    changeCity()

    if (time_evolution_past_present) {
        index--
        if (index == 0) {
            console.log("finished")
        }
        i--
    } else {
        index++
        i++;
        if (index > maxFiles - 1) {
            index = 0
        }
    }

}

let changeCity = () => {
    let key = "data_" + (index + 1)
    let key2
    if (time_evolution_past_present) {
        key2 = "data_reverse_" + (index + 1)
    } else {
        key2 = "data_" + (index + 1)
    }


    // Change Date
    let text = "Date: " + new Date(timeEvolutionItems[key].date * 1000).toLocaleDateString()
    if (timeEvolutionItems[key].commit_sha) {
        text += "\n\nCommit: " + timeEvolutionItems[key].commit_sha
    }
    dateBarEntity.setAttribute('text-geometry', 'value', text)

    changedItems = []
    if (timeEvolutionItems[key][key2]) {
        timeEvolutionItems[key][key2].forEach((item) => {
            changeBuildingLayout(item)
        })
    } else {
        timeEvolutionItems[key][key].forEach((item) => {
            changeBuildingLayout(item)
        })
    }

    // Put height 0 those that not exists
    if (!time_evolution_commit_by_commit) {
        initItems.forEach((item) => {
            if (!changedItems.includes(item.id)) {
                let prevPos = document.getElementById(item.id).getAttribute("position")
                let prevHeight = document.getElementById(item.id).getAttribute("geometry").height
                document.getElementById(item.id).setAttribute("geometry", "height", -0.1)
                document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (-0.1 / 2), z: prevPos.z })
            }
        })
    }
    updateCity()
}

let changeBuildingLayout = (item) => {
    if (document.getElementById(item.id) != undefined && item.area != 0.0) {

        // Add to changed items
        changedItems.push(item.id)

        // Get old data in order to do the math
        let prevPos = document.getElementById(item.id).getAttribute("position")
        let prevWidth = document.getElementById(item.id).getAttribute("geometry").width
        let prevDepth = document.getElementById(item.id).getAttribute("geometry").depth
        let prevHeight = document.getElementById(item.id).getAttribute("geometry").height
        let oldRawArea = parseFloat(document.getElementById(item.id).getAttribute("babiaxr-rawarea"))

        // Calculate Aspect Ratio
        let reverseWidthDepth = false
        let AR = prevWidth / prevDepth
        if (AR < 1) {
            reverseWidthDepth = true
            AR = prevDepth / prevWidth
        }

        // New area that depends on the city
        let newAreaDep = (item.area * (prevDepth * prevWidth)) / oldRawArea

        // New size for the building based on the AR and the Area depend
        let newWidth = Math.sqrt(newAreaDep * AR)
        let newDepth = Math.sqrt(newAreaDep / AR)
        if (reverseWidthDepth) {
            newDepth = Math.sqrt(newAreaDep * AR)
            newWidth = Math.sqrt(newAreaDep / AR)
        }


        // Write the new values
        document.getElementById(item.id).setAttribute("babiaxr-rawarea", item.area)
        document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
        document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
        document.getElementById(item.id).setAttribute("geometry", "height", item.height)
        document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (item.height / 2), z: prevPos.z })
    }
}

let updateCity = () => {
    console.log("Changing city")
    document.getElementById('codecity').children[0].removeAttribute('geometry-merger')
    document.getElementById('codecity').children[0].removeAttribute('material')
    document.getElementById('codecity').children[0].setAttribute('geometry-merger', { preserveOriginal: true })
    document.getElementById('codecity').children[0].setAttribute('material', { vertexColors: 'face' });
}

let findLeafs = (data, entities) => {
    data.forEach((item) => {
        if (item['children']) {
            findLeafs(item['children'], entities)
        } else {
            entities[item.id] = item
        }
    })
    return entities
}   

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
AFRAME.registerComponent('geocylinderchart', {
  schema: {
    data: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: {type: 'boolean', default: false},
    palette: {type: 'string', default: 'ubuntu'},
    title: {type: 'string'},
    titleFont: {type: 'string'},
    titleColor: {type: 'string'},
    titlePosition: {type: 'string', default: "0 0 0"},
    scale: {type: 'number'},
    heightMax: {type: 'number'},
    radiusMax: {type: 'number'},
  },

      /**
    * Set if component needs multiple instancing.
    */
   multiple: false,

      /**
    * Called once when component is attached. Generally for initial setup.
    */
  init: function () {
    let el = this.el;
    let data = this.data;
  },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
  update: function (oldData) {
    let el = this.el;
    let data = this.data;


    /**
     * Update or create chart component
     */
    if (data.data !== oldData.data) {
      //remove previous chart
      while (this.el.firstChild)
        this.el.firstChild.remove();
      console.log("Generating Cylinder...")
      generateCylinderChart(data, el)
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

let generateCylinderChart = (data, element) => {
  if (data.data){
    const dataToPrint = JSON.parse(data.data)
    const palette = data.palette
    const title = data.title
    const font = data.titleFont
    const color = data.titleColor
    const title_position = data.titlePosition
    const scale = data.scale
    const heightMax = data.heightMax
    const radiusMax = data.radiusMax

    let colorid = 0
    let stepX = 0
    let lastradius = 0
    let axis_dict = []
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; })) 
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o.radius; }))
    if (scale) {
        maxY = maxY / scale
        maxRadius = maxRadius / scale
    } else if (heightMax || radiusMax){
        if (heightMax){
          valueMax = maxY
          proportion = heightMax / maxY
          maxY = heightMax
        }
        if (radiusMax){
          stepMax = maxRadius
          radius_scale = radiusMax / maxRadius
          maxRadius = radiusMax
        }
    }

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
      let radius = cylinder['radius']
      let height = cylinder['height']

      if (cylinder !== dataToPrint[0]) {
        //Calculate stepX
        if (scale) {
          stepX += lastradius + radius / scale + 1
        } else if (radiusMax) {
          stepX += lastradius + radius * radius_scale + 1
        } else {
          stepX += lastradius + radius + 1  
        }
        
      } else {
        if (scale){
          firstradius = radius / scale
        } else if (radiusMax) {
          firstradius = radius * radius_scale
        } else {
          firstradius = radius
        }
      }

      let cylinderEntity = generateCylinder(height, radius, colorid, palette, stepX, animation, scale)
      chart_entity.appendChild(cylinderEntity);

      //Prepare legend
      if (data.legend) {
        showLegend(cylinderEntity, cylinder, element)
      }

      //Axis dict
      let cylinder_printed = {
        colorid: colorid,
        posX: stepX,
        key: cylinder['key']
      }
      axis_dict.push(cylinder_printed)

      // update lastradius
      if (!scale && !radius_scale){
        lastradius = radius
      } else {
        if (scale){
          lastradius = radius / scale
        } else {
          lastradius = radius_scale * radius
        }
      }
      
      //Increase color id
      colorid++
    }

    //Print axis
    if (data.axis) {
      showXAxis(element, stepX + lastradius, axis_dict, palette)
      showYAxis(element, maxY, scale)
    }

    //Print Title
    let title_3d = showTitle(title, font, color, title_position);
    element.appendChild(title_3d);

  }
}

let firstradius
let maxRadius
let proportion
let valueMax
let radius_scale
let stepMax

function generateCylinder(height, radius, colorid, palette, position, animation, scale) {
  let color = getColor(colorid, palette)
  let entity = document.createElement('a-cylinder');
  if (scale) {
      height = height / scale
      radius = radius / scale
  } else if (proportion || radius_scale){
    if (proportion){
      height = proportion * height
    }
    if (radius_scale){
      radius = radius_scale * radius
    }
  }
  entity.setAttribute('color', color);
  entity.setAttribute('height', 0);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation){
    var duration = 4000
    var increment = 20 * height / duration 
    var size = 0
    var id = setInterval(animation, 1);
    function animation() {
        if (size >= height) {
            clearInterval(id);
        } else {
            size += increment;
            entity.setAttribute('height', size);
            entity.setAttribute('position', { x: position, y: size / 2, z: 0 }); 
        }  
    }
  } else {
    entity.setAttribute('height', height);
    entity.setAttribute('position', { x: position, y: height / 2, z: 0 });
  }
  return entity;
}

function getColor(colorid, palette){
  let color
  for (let i in colors){
      if(colors[i][palette]){
          color = colors[i][palette][colorid%4]
      }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
      'start': { x: -firstradius, y: 0, z: 0 },
      'end': { x: xEnd, y: 0, z: 0 },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1 });
  axis.appendChild(axis_line)
  
  //Print keys
  cylinder_printed.forEach(e => {
      let key = document.createElement('a-entity');
      let color = getColor(e.colorid, palette)
      key.setAttribute('text', {
          'value': e.key,
          'align': 'right',
          'width': 20,
          'color': color
      });
      key.setAttribute('position', { x: e.posX, y: 0.1, z: maxRadius + 11.5 })
      key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
      axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}

function showYAxis(parent, yEnd, scale) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
      'start': { x: -firstradius, y: 0, z: 0 },
      'end': { x: -firstradius, y: yEnd, z: 0 },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1});
  axis.appendChild(axis_line)

  if (proportion){
    yLimit = yLimit / proportion
    var mod = Math.floor(Math.log10(valueMax))
  }   
  for (let i = 0; i<=yLimit; i++){
      let key = document.createElement('a-entity');
      let value = i
      let pow = Math.pow(10, mod-1)
      if (!proportion || (proportion && i%pow === 0)){  
        key.setAttribute('text', {
            'value': value,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        if (scale){
            key.setAttribute('text', {'value': value * scale})
            key.setAttribute('position', { x: -maxRadius-5.2, y: value, z: maxRadius + 1})
        } else if (proportion){
            key.setAttribute('position', {x: -maxRadius-5.2, y: i * proportion, z: maxRadius + 1})
        } else {
            key.setAttribute('position', {x: -maxRadius-5.2, y: i, z: maxRadius + 1})
        }      
    }
      axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showLegend(cylinderEntity, cylinder, element) {
  cylinderEntity.addEventListener('mouseenter', function () {
      this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
      legend = generateLegend(cylinder, cylinderEntity);
      element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
      this.setAttribute('scale', { x: 1, y: 1, z: 1 });
      element.removeChild(legend);
  });
}

function generateLegend(cylinder, cylinderEntity) {
  let text = cylinder['key'] + ': ' + cylinder['height'];
  let width = 5;
  if (text.length > 16)
      width = text.length / 2;

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', { x: cylinderPosition.x, y: 2 * cylinderPosition.y + 2,
                                    z: cylinderPosition.z + maxRadius + 0.5 });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '1.5');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
      'value': cylinder['key'] + ': ' + cylinder['height'],
      'align': 'center',
      'width': 20,
      'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showTitle(title, font, color, position){
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry',{
      value : title,
  });
  if (font){
      entity.setAttribute('text-geometry', {
          font: font,
      })
  }
  if (color){
      entity.setAttribute('material' ,{
          color : color
      })
  }
  var position = position.split(" ") 
  entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
  entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
  entity.classList.add("babiaxrTitle")
  return entity;
}

let colors = [
  {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
  {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
  {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
  {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
  {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
  {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
  {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
  {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
  {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]

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
AFRAME.registerComponent('geodoughnutchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
        titlePosition: {type: 'string', default: "0 0 0"},
        animation: {type: 'boolean', default: false},
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
            //remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating pie...")
            generateDoughnut(data, el)
            loaded = true
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
   tick: function (t, delta) {
        if (animation && loaded ){
            let elements = document.getElementsByClassName('babiaxrChart')[0].children
            for (let slice in slice_array){
                let delay = slice_array[slice].delay
                let max_arc = slice_array[slice].arc
                let arc = parseFloat(elements[slice].getAttribute('arc'))
                if ((t >= delay) && ( arc < max_arc )){
                    arc += 360 * delta / total_durtation
                    if (arc > max_arc){
                        arc = max_arc
                    }
                    elements[slice].setAttribute('arc', arc)
                }
            }
        }
    },

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

let animation
let slice_array = []
let loaded = false
let total_durtation = 4000

let generateDoughnut = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        animation = data.animation

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice['size'];
        }

        let degreeStart = 0;
        let degreeEnd = 0;

        let colorid = 0

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')
        chart_entity.setAttribute('rotation', {y: 90})

        element.appendChild(chart_entity)

        let prev_delay = 0
        for (let slice of dataToPrint) {
            //Calculate degrees
            degreeEnd = 360 * slice['size'] / totalSize;

            let sliceEntity
            if (animation){
                let duration_slice = total_durtation * degreeEnd / 360
                slice_array.push({
                    arc : degreeEnd,
                    duration: duration_slice,
                    delay : prev_delay
                })
                prev_delay += duration_slice;
                sliceEntity = generateDoughnutSlice(degreeStart, 0.01, 1, colorid, palette);
            } else {
                sliceEntity = generateDoughnutSlice(degreeStart, degreeEnd, 1, colorid, palette);
            }

            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(sliceEntity, slice, element)
            }

            chart_entity.appendChild(sliceEntity);
            colorid++
        }

        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }
}

function generateDoughnutSlice(position_start, arc, radius, colorid, palette) {
    let color = getColor(colorid, palette)
    console.log("Generating slice...")
    let entity = document.createElement('a-torus');
    entity.setAttribute('color', color);
    entity.setAttribute('rotation', {x: 90, y: 0, z: position_start})
    entity.setAttribute('arc', arc);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    entity.setAttribute('radius-tubular', radius/4);
    return entity;
}

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
}

function generateLegend(slice) {
    let text = slice['key'] + ': ' + slice['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: 1, z: -2 });
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
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(sliceEntity, slice, element) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(slice);
        element.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = position.split(" ") 
    entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
    entity.setAttribute('rotation', {x: -90, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
    {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
    {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
    {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
    {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
    {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
    {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
    {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
    {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]


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
AFRAME.registerComponent('geopiechart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
        titlePosition: {type: 'string', default: "0 0 0"},
        animation: {type: 'boolean', default: false},
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
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating pie...")
            generatePie(data, el)
            loaded = true
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
    tick: function (t, delta) {
        if (animation && loaded ){
            let elements = document.getElementsByClassName('babiaxrChart')[0].children
            for (let slice in slice_array){
                let delay = slice_array[slice].delay
                let max_length = slice_array[slice].degreeLenght
                let theta_length = parseFloat(elements[slice].getAttribute('theta-length'))
                if ((t >= delay) && ( theta_length < max_length )){
                    theta_length += 360 * delta / total_durtation
                    if (theta_length > max_length){
                        theta_length = max_length
                    }
                    elements[slice].setAttribute('theta-length', theta_length)
                }
            }
        }
     },

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

let animation
let slice_array = []
let loaded = false
let total_durtation = 4000

let generatePie = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        animation = data.animation

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice['size'];
        }

        let degreeStart = 0;
        let degreeEnd = 0;

        let colorid = 0

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

        let prev_delay = 0
        for (let slice of dataToPrint) {
            //Calculate degrees        
            degreeEnd = 360 * slice['size'] / totalSize;

            let sliceEntity
            if (animation){
                let duration_slice = total_durtation * degreeEnd / 360
                slice_array.push({
                    degreeLenght : degreeEnd,
                    duration: duration_slice,
                    delay : prev_delay
                })
                prev_delay += duration_slice;
                sliceEntity = generateSlice(degreeStart, 0.01, 1, colorid, palette);
            } else {
                sliceEntity = generateSlice(degreeStart, degreeEnd, 1, colorid, palette);
            }
            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(sliceEntity, slice, element)
            }

            chart_entity.appendChild(sliceEntity);
            colorid++
        }

        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }
}

function generateSlice(theta_start, theta_length, radius, colorid, palette) {
    let color = getColor(colorid, palette)
    console.log("Generating slice...")
    let entity = document.createElement('a-cylinder');
    entity.setAttribute('color', color);
    entity.setAttribute('theta-start', theta_start);
    entity.setAttribute('theta-length', theta_length);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    return entity;
}

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
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
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(sliceEntity, slice, element) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(slice);
        element.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = position.split(" ") 
    entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
    entity.setAttribute('rotation', {x: -90, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
    {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
    {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
    {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
    {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
    {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
    {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
    {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
    {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]



   

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
AFRAME.registerComponent('geosimplebarchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean', default: false },
        axis: { type: 'boolean', default: true },
        animation: {type: 'boolean', default: false},
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
        titlePosition: {type: 'string', default: "0 0 0"},
        scale: {type: 'number'},
        heightMax: {type: 'number'},
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {},

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
            while (this.el.firstChild)
                this.el.firstChild.remove();
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
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale
        const heightMax = data.heightMax

        let colorid = 0
        let stepX = 0
        let axis_dict = []
        let animation = data.animation

        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);

        let maxY = Math.max.apply(Math, dataToPrint.map(function(o) { return o.size; }))
        if (scale) {
            maxY = maxY / scale
        } else if (heightMax){
            valueMax = maxY
            proportion = heightMax / maxY
            maxY = heightMax
        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)


        for (let bar of dataToPrint) {

            let barEntity = generateBar(bar['size'], widthBars, colorid, stepX, palette, animation, scale);

            //Prepare legend
            if (data.legend) {
                showLegend(barEntity, bar, element)
            }

            //Axis dict
            let bar_printed = {
                colorid: colorid,
                posX: stepX,
                key: bar['key']
            }
            axis_dict.push(bar_printed)


            chart_entity.appendChild(barEntity);
            //Calculate stepX
            stepX += widthBars + widthBars / 4
            //Increase color id
            colorid++
        }

        //Print axis
        if (data.axis) {
            showXAxis(element, stepX, axis_dict, palette)
            showYAxis(element, maxY, scale)
        }

    }
}

let widthBars = 1
let proportion
let valueMax

function generateBar(size, width, colorid, position, palette, animation, scale) {
    let color = getColor(colorid, palette)
    console.log("Generating bar...")
    if (scale) {
        size = size / scale
    } else if (proportion){
        size = proportion * size
    }
    let entity = document.createElement('a-box');
    entity.setAttribute('color', color);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    entity.setAttribute('height', 0);
    entity.setAttribute('position', { x: position, y: 0, z: 0 });
    // Add animation
    if (animation){
        var duration = 4000
        var increment = 10 * size / duration 
        var height = 0
        var id = setInterval(animation, 10);
        function animation() {
            if (height >= size) {
                clearInterval(id);
            } else {
                height += increment;
                entity.setAttribute('height', height);
                entity.setAttribute('position', { x: position, y: height / 2, z: 0 }); 
            }  
        }
    } else {
        entity.setAttribute('height', size);
        entity.setAttribute('position', { x: position, y: size / 2, z: 0 });
    }

    return entity;
}

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
}

function generateLegend(bar, barEntity) {
    let text = bar['key'] + ': ' + bar['size'];
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;
        let barPosition = barEntity.getAttribute('position')
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: barPosition.x, y: 2 * barPosition.y + 1, 
                                      z: barPosition.z + widthBars + 0.1 });
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
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showXAxis(parent, xEnd, bars_printed, palette) {
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
        let color = getColor(e.colorid, palette)
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': color
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: widthBars+5.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showYAxis(parent, yEnd, scale) {
    let axis = document.createElement('a-entity');
    let yLimit = yEnd
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: -widthBars, y: yEnd, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: widthBars / 2 + widthBars / 4 });
    axis.appendChild(axis_line)
    if (proportion){
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    }   
    for (let i = 0; i<=yLimit; i++){
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod-1)
        if (!proportion || (proportion && i%pow === 0)){  
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale){
                key.setAttribute('text', {'value': value * scale})
                key.setAttribute('position', { x: -widthBars-5.2, y: value, z: widthBars / 2 + widthBars / 4 })
            } else if (proportion){
                key.setAttribute('position', { x: -widthBars-5.2, y: i * proportion, z: widthBars / 2 + widthBars / 4 })
            } else {
                key.setAttribute('position', {x: -widthBars-5.2, y: i, z: widthBars / 2 + widthBars / 4})
            }     
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showLegend(barEntity, bar, element) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bar, barEntity);
        element.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = position.split(" ") 
    entity.setAttribute('position', {x: position[0], y: position[1], z: position[2]})
    entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
    {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
    {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
    {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
    {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
    {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
    {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
    {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
    {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]

/***/ }),
/* 11 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geototemchart', {
    schema: {
        charts_id: { type: 'string' },
        data_list: { type: 'string' },
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
        my_id = el.id
        if (data) {
            charts_id.push({
                id: el.id,
                charts_id: JSON.parse(data.charts_id)
            })
            if (data.data_list) {
                dataToPrint_list = JSON.parse(data.data_list)
                loadFiles(dataToPrint_list)
            }
        }
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        el = this.el;
        /**
         * Update or create chart component
         */
        if (data !== oldData) {
            //Remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating totemchart...")
            generateTotemChart(el)
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

let data_files = []
let charts_id = []
let my_id
let dataToPrint_list
let el

let generateTotemChart = (element) => {
    if (data_files) {
        // Totem Data
        generateTotemData(element, dataToPrint_list)
    }
}


function loadFiles(list) {
    let loader = new THREE.FileLoader();
    // Load Data
    for (let item of list) {
        if (item.from_querier) {
            let querierElement = document.getElementById(item.from_querier)
            if (querierElement.getAttribute('babiaData')) {
                let dataFromQuerier = JSON.parse(querierElement.getAttribute('babiaData'));
                data_files.push({
                    file: dataFromQuerier,
                    path: item.from_querier
                })
            } else {
                // Get if key or filter
                querierElement.addEventListener('dataReady' + item.from_querier, function (e) {
                    data_files.push({
                        file: e.detail,
                        path: item.from_querier
                    })
                })
            }

        } else if (item.path) {
            let file = item.path
            loader.load(file,
                // onLoad callback
                function (data) {
                    data_files.push({
                        file: data,
                        path: file
                    })
                },
                // onProgress callback
                function (xhr) {
                    console.log(file.toString() + ': ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },

                // onError callback
                function (err) {
                    console.error('An error happened');
                }
            );
        }
    }

}

function generateTotemData(element, list) {
    console.log('Generating Totem...')
    let position_y = 7.5
    // Change List's height 
    if (list.length % 2 == 1) {
        let increment = Math.trunc(list.length / 2)
        position_y += increment
    }

    let position_x = -3
    let position_z = 6
    let rotation_y = 0

    //Get Width
    let width = getWidthTotem(list)

    // Generate Title

    let entity = document.createElement
    generateTotemTitle(element, position_x, position_y, position_z, rotation_y, width, 'Select Data')
    position_y -= 1

    // Generate List of Charts
    generateTotem(element, position_x, position_y, position_z, rotation_y, width, list)
}

function generateTotemTitle(element, x, y, z, rotation_y, width, title) {

    let entity = document.createElement('a-plane')
    entity.setAttribute('class', 'title')
    entity.setAttribute('position', { x: x, y: y, z: z })
    entity.setAttribute('rotation', { x: 0, y: rotation_y, z: 0 })
    entity.setAttribute('height', 1)
    entity.setAttribute('width', width)
    entity.setAttribute('color', 'blue')
    entity.setAttribute('text', {
        'value': title,
        'align': 'center',
        'width': '10',
        'color': 'white'
    })
    element.appendChild(entity)
}

function generateTotem(element, x, y, z, rotation, width, list, list_used) {
    // Generate List of Items
    for (let item of list) {
        // For data
        if (item.data) {
            item = item.data
        }
        let entity = document.createElement('a-plane')
        entity.setAttribute('position', { x: x, y: y, z: z })
        entity.setAttribute('rotation', { x: 0, y: rotation, z: 0 })
        entity.setAttribute('height', 1)
        entity.setAttribute('width', width)
        entity.setAttribute('text', {
            'value': item,
            'align': 'center',
            'width': '10',
        })
        entity.setAttribute('color', 'white')
        entity.setAttribute('text', {
            'color': 'black'
        })

        element.appendChild(entity)
        y -= 1

        entity.addEventListener('click', function () {
            let id_totem = entity.parentElement.id
            let children = entity.parentElement.children
            list_used = item
            for (let i of list) {
                if ((i.path || i.from_querier) && (list_used == i.data)) {
                    updateEntity(i.path || i.from_querier, id_totem)
                }
            }
            for (let child in children) {
                if (children[child] === entity) {
                    entity.setAttribute('color', 'black')
                    entity.setAttribute('text', {
                        'color': 'white'
                    })
                } else if (!children[child].id) {
                    if (children[child].className !== "title") {
                        children[child].setAttribute('color', 'white')
                        children[child].setAttribute('text', {
                            'color': 'black'
                        })
                    }
                }
            }
        })
    }
}

function getWidthTotem(list) {
    let width = 5
    for (let line of list) {
        if (line.data) {
            line = line.data
        }
        if ((line.length > 10) && (width < line.length / 4)) {
            width = line.length / 4
        }
    }
    return width;
}

function updateEntity(data, id_totem) {
    let entity = getEntity(id_totem)
    for (let totem in charts_id) {
        if (id_totem == charts_id[totem].id) {
            let charts = charts_id[totem].charts_id
            for (obj in charts) {
                let type = charts[obj].type
                let id = charts[obj].id
                let new_data
                for (let file in data_files) {
                    if (data_files[file].path == data) {
                        new_data = data_files[file].file
                        //entity.setAttribute('geototemchart', { 'data' : data_files[file].file })

                        if (type === "vismapper") {
                            document.getElementById(id).setAttribute(type, "dataToShow", JSON.stringify(new_data))
                        } else {
                            document.getElementById(id).setAttribute(type, "data", new_data)
                        }
                    }
                }
            }
        }
    }
}

function getEntity(id) {
    let entity = document.getElementById(id)
    return entity
}



/***/ }),
/* 12 */
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
/* 13 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('querier_es', {
    schema: {
        elasticsearch_url: { type: 'string' },
        index: { type: 'string' },
        query: { type: 'string' },
        size: { type: 'int', default: 10 },
        user: { type: 'string' },
        password: { type: 'string' }
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

        if (data.elasticsearch_url && data.index) {
            requestJSONDataFromES(data, el)
        } else {
            console.error("elasicsearch_url, index and body must be defined")
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        if (data.elasticsearch_url !== oldData.elasticsearch_url || 
            data.index !== oldData.index || 
            data.query !== oldData.query ||
            data.size !== oldData.size) {
            requestJSONDataFromES(data, el)
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


let requestJSONDataFromES = (data, el) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', `${data.elasticsearch_url}/${data.index}/_search?size=${data.size}&${data.query}`)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            // Save data
            if (typeof request.response === 'string' || request.response instanceof String) {
                dataRaw = JSON.parse(request.response).hits.hits
                data.dataRetrieved = {}
                for (let i = 0; i < dataRaw.length; i++) {
                    data.dataRetrieved[i] = dataRaw[i]._source
                }
            } else {
                data.dataRetrieved = request.response
            }
            el.setAttribute("babiaData", JSON.stringify(data.dataRetrieved))

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


/***/ }),
/* 14 */
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
    el.setAttribute("babiaData", JSON.stringify(data.dataRetrieved))

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
            el.setAttribute("babiaData", JSON.stringify(data.dataRetrieved))

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
/* 15 */
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
            el.setAttribute("babiaData", JSON.stringify(data.dataRetrieved))

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
    el.setAttribute("babiaData", data.embedded)

    // Dispatch/Trigger/Fire the event
    el.emit("dataReady" + el.id, data.embedded)
}

/***/ }),
/* 16 */
/***/ (function(module, exports) {

AFRAME.registerComponent('terrain-elevation', {
    schema: {
      width: {type: 'number', default: 1},
      height: {type: 'number', default: 1},
      segmentsHeight: {type: 'number', default: 1},
      segmentsWidth: {type: 'number', default: 1},
      data: {type: 'array'},
      color: {type: 'string', default: '0xdddddd'},
      filled: {type: 'boolean', default: false}
    },
  
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        var data = this.data;
        var el = this.el;

        var vertices = data.data
        console.log("Vertices:")
        console.log(vertices)

        // Create geometry.
        this.geometry = new THREE.PlaneGeometry(data.width, data.height, data.segmentsHeight, data.segmentsWidth);
        for (var i = 0, l = this.geometry.vertices.length; i < l; i++) {
            this.geometry.vertices[i].z = vertices[i];
        }
  
      // Create material.
        var color = data.color
        if (data.filled){
          this.material = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: false
          });
        } else {
          this.material = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: true
          }); 
        }

      // Create mesh.
      this.mesh = new THREE.Mesh(this.geometry, this.material);
  
      // Set mesh on entity.
      el.setObject3D('mesh', this.mesh);
    }
  });

/***/ }),
/* 17 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let points
let play_button
let pause_button
let player
let el

AFRAME.registerComponent('ui-navigation-bar', {
    schema: {
        commits: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
   multiple: false,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        let data = this.data
        el = this.el
        points = JSON.parse(data.commits)
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

   update: function (oldData) {
       let time_bar = createTimeBar(points)
       this.el.appendChild(time_bar)
       player = createPlayer()
       this.el.appendChild(player)
   },

    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
   remove: function () {},

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
   pause: function () {},

   /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
   play: function () {},

})


function createTimeBar(elements){
    let timebar_entity = document.createElement('a-entity')
    timebar_entity.classList.add('babiaxrTimeBar')

    let posX = 0
    let stepX = 5 / (elements.length - 1)

    elements.forEach(i => {
        let point = createTimePoint(i)
        point.setAttribute('position', {x: posX, y: 0, z: 0});
        posX += stepX
        timebar_entity.appendChild(point)
    });

    // Add Line
    let bar_line = document.createElement('a-entity')
    bar_line.setAttribute('line',{
        start : '0 0 0',
        end : '5 0 0',
        color : '#FF0000',
    })
    timebar_entity.appendChild(bar_line)
    return timebar_entity
}

function createTimePoint(point){
    let entity = document.createElement('a-sphere')
    entity.setAttribute('radius', 0.05)
    entity.setAttribute('material', {color: '#FF0000'})
    showInfo(entity, point)
    setPoint(entity, point)
    return entity
}

function setPoint(element, data){
    element.addEventListener('click', function(){
        console.log('click')
        el.emit('babiaxrShow', {data: data})
        if (document.getElementsByClassName('babiaxrPause')[0]){
            player.removeChild(pause_button)
            player.appendChild(play_button)
        }
    });
}

function showInfo(element, data){
    let legend
    element.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        //legend = generateLegend(data);
        //this.appendChild(legend);
    });

    element.addEventListener('showinfo', function () {
        legend = generateLegend(data);
        this.appendChild(legend);
    });

    element.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        //this.removeChild(legend);
    });

    element.addEventListener('removeinfo', function () {
        this.removeChild(legend);
    });
}

function generateLegend (data) {
    let text = ''
    let lines = []
    lines.push('Date: ' + data['date'] + '\n');
    lines.push('commit: ' + data['commit'] + '\n');
    let width = 1;
    for (let line of lines){
      if ((line.length > 10) && (width < line.length / 2)){
        width = line.length / 7;
      }
      text += line
    }

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: 0.4, z: 0 })
    entity.setAttribute('scale', { x: 0.5, y: 0.5, z: 1 })
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('material', { opacity: 0.6 })
    return entity;
}

function createPlayer(){
    // New entity player and then create buttons
    let player_entity = document.createElement('a-entity')
    player_entity.classList.add('babiaxrPlayer')

    play_button = playButton(player_entity)
    play_button.setAttribute('position', {x: 2.35, y: -0.65, z: 0})

    pause_button = pauseButton()
    pause_button.setAttribute('position', {x: 2.35, y: -0.65 , z: 0})
    player_entity.appendChild(pause_button)

    let rewind_button = rewindButton()
    rewind_button.setAttribute('position', {x: 1.25, y: -0.65 , z: 0})
    player_entity.appendChild(rewind_button)

    let forward_button = forwardButton()
    forward_button.setAttribute('position', {x: 3.7, y: -0.65 , z: 0})
    player_entity.appendChild(forward_button)

    let skip_prev_button = skipPreviousButton()
    skip_prev_button.setAttribute('position', {x: 1.95, y: -0.65 , z: 0})
    player_entity.appendChild(skip_prev_button)

    let skip_next_button = skipNextButton()
    skip_next_button.setAttribute('position', {x: 3, y: -0.65 , z: 0})
    player_entity.appendChild(skip_next_button)

    return player_entity
}

function playButton(player){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPlay')
    let vertices = [[0, 0, 0], [0, 3, 0], [2.5, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrContinue')

    return entity
}

function rewindButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    entity.setAttribute('rotation', {x: 0, y: 180, z: 0})

    // Event
    emitEvents(entity, 'babiaxrToPast')

    return entity
}

function forwardButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrToPresent')

    return entity
}

function skipPreviousButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrSkipPrev')
    let vertices = [[0, 0, 0], [0, 3, 0], [1, 1.5, 0], [1, 3, 0], [2, 1.5, 0], [2, 3, 0], [2.5, 3, 0],
                    [2.5, 0, 0], [2, 0, 0], [2, 1.5, 0], [1, 0, 0], [1, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    entity.setAttribute('rotation', {x: 0, y: 180, z: 0})

    // Event
    emitEvents(entity, 'babiaxrSkipPrev')

    return entity
}

function skipNextButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrSkipNext')
    let vertices = [[0, 0, 0], [0, 3, 0], [1, 1.5, 0], [1, 3, 0], [2, 1.5, 0], [2, 3, 0], [2.5, 3, 0],
                    [2.5, 0, 0], [2, 0, 0], [2, 1.5, 0], [1, 0, 0], [1, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrSkipNext')

    return entity
}

function pauseButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPause')
    let vertices_1 = [[0, 0, 0], [0, 3, 0], [1, 3, 0], [1, 0, 0], [0, 0, 0]];
    let vertices_2 = [[1.5, 0, 0],[1.5, 3, 0], [2.5, 3, 0], [2.5, 0, 0], [1.5, 0, 0]];
    let button = merge_model(vertices_1, vertices_2);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrStop')

    return entity
}

function load_model(vertices){
    let vertices_len = vertices.length;

    let array_extrude = []
    const scale = 0.11
    for ( i = 0; i < vertices_len; i++ ) {
        let x = scale * vertices[i][0];
        let y = scale * vertices[i][1];
        let z = scale * vertices[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude.push(vector);
    }

    let fig_form = new  THREE.Shape(array_extrude)
    let extrude_data = {
        depth : 0.05,
        bevelEnabled : false,
        bevelSegments : 1,
        steps : 1,
        bevelThickness: 1,
    };

    // Material
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: false } );

    let geometry_extrude = new THREE.ExtrudeGeometry(fig_form, extrude_data);
    let mesh_extrude = new THREE.Mesh(geometry_extrude, material)

    return mesh_extrude
}

function merge_model(vertices1, vertices2){
    let vertices1_len = vertices1.length;
    let vertices2_len = vertices2.length;

    let array_extrude1 = []
    let array_extrude2 = []
    const scale = 0.11
    for ( i = 0; i < vertices1_len; i++ ) {
        let x = scale * vertices1[i][0];
        let y = scale * vertices1[i][1];
        let z = scale * vertices1[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude1.push(vector);
    }
    for ( i = 0; i < vertices2_len; i++ ) {
        let x = scale * vertices2[i][0];
        let y = scale * vertices2[i][1];
        let z = scale * vertices2[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude2.push(vector);
    }

    // Figura
    let fig_form1 = new  THREE.Shape(array_extrude1)
    let fig_form2 = new  THREE.Shape(array_extrude2)

    let extrude_data = {
        depth : 0.05,
        bevelEnabled : false,
        bevelSegments : 1,
        steps : 1,
        bevelThickness: 1,
    };

    // Material
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: false } );

    // Hacer un merge de dos figuras
    let geometry_extrude1 = new THREE.ExtrudeGeometry(fig_form1, extrude_data);
    let geometry_extrude2 = new THREE.ExtrudeGeometry(fig_form2, extrude_data);
    let mesh_extrude1 = new THREE.Mesh(geometry_extrude1, material);
    mesh_extrude1.updateMatrix();
    geometry_extrude2.merge(mesh_extrude1.geometry, mesh_extrude1.matrix);
    let mesh_extrude2 = new THREE.Mesh(geometry_extrude2, material);

    return mesh_extrude2;
}

function emitEvents(element, event_name){
    element.addEventListener('click', function () {
        if (element.classList == 'babiaxrPlay'){
            player.removeChild(element)
            player.appendChild(pause_button)
        } else if (element.classList == 'babiaxrPause'){
            player.removeChild(pause_button)
            player.appendChild(play_button)
        } else if ((element.classList == 'babiaxrSkipNext') || (element.classList == 'babiaxrSkipPrev')){
            if (document.getElementsByClassName('babiaxrPause')[0]){
                player.removeChild(pause_button)
                player.appendChild(play_button)
            }
        }
        console.log('Emit..... ' + event_name)
        el.emit(event_name)
    });
}


/***/ }),
/* 18 */
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
            } else if (el.components.geocylinderchart) {
                let list = generate2Dlist(data, dataJSON, "x_axis", "cylinder")
                el.setAttribute("geocylinderchart", "data", JSON.stringify(list))
            } else if (el.components.geopiechart) {
                let list = generate2Dlist(data, dataJSON, "slice")
                el.setAttribute("geopiechart", "data", JSON.stringify(list))
            } else if (el.components.geodoughnutchart) {
                let list = generate2Dlist(data, dataJSON, "slice")
                el.setAttribute("geodoughnutchart", "data", JSON.stringify(list))
            } else if (el.components.geo3dbarchart) {
                let list = generate3Dlist(data, dataJSON, "3dbars")
                el.setAttribute("geo3dbarchart", "data", JSON.stringify(list))
            } else if (el.components.geobubbleschart) {
                let list = generate3Dlist(data, dataJSON, "bubbles")
                el.setAttribute("geobubbleschart", "data", JSON.stringify(list))
            } else if (el.components.geo3dcylinderchart) {
                let list = generate3Dlist(data, dataJSON, "3dcylinder")
                el.setAttribute("geo3dcylinderchart", "data", JSON.stringify(list))
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

let generate2Dlist = (data, dataToProcess, key_type, chart_type) => {
    let list = []
    if (Array.isArray(dataToProcess)) {
        list = dataToProcess
    } else {
        if (chart_type === "cylinder") {
            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data[key_type]],
                    "height": value[data.height],
                    "radius": value[data.radius]
                }
                list.push(item)
            });
        } else {
            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data[key_type]],
                    "size": value[data.height]
                }
                list.push(item)
            });
        }
    }
    return list
}

let generate3Dlist = (data, dataToProcess, chart_type) => {
    let list = []
    if (Array.isArray(dataToProcess)) {
        list = dataToProcess
    } else {
        if (chart_type === "3dbars") {

            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data.x_axis],
                    "key2": value[data.z_axis],
                    "size": value[data.height]
                }
                list.push(item)
            });
        } else if (chart_type === "bubbles" || chart_type === "3dcylinder") {
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(14)
__webpack_require__(15)
__webpack_require__(13)
__webpack_require__(18)
__webpack_require__(2)
__webpack_require__(12)
__webpack_require__(0)
__webpack_require__(9)
__webpack_require__(10)
__webpack_require__(3)
__webpack_require__(5)
__webpack_require__(6)
__webpack_require__(7)
__webpack_require__(4)
__webpack_require__(8)
__webpack_require__(11)
__webpack_require__(16)
__webpack_require__(17)
__webpack_require__(1)

/***/ })
/******/ ]);