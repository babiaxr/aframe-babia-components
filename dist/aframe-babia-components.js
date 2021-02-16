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
/******/ 	return __webpack_require__(__webpack_require__.s = 23);
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
AFRAME.registerComponent('babiaxr-filterdata', {
  dependencies: ['babiaxr-querier'],
  schema: {
    from: { type: 'string' },
    filter: { type: 'string' },
    // data, for debugging, highest priority
    data: { type: 'string' }
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
    let self = this;

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      let rawData = parseEmbeddedJSONData(data.data)

      // Filtering, save the references
      let dataFiltered = filterData(data, rawData)
      self.babiaData = dataFiltered
      self.babiaMetadata = {
        id: self.babiaMetadata.id++
      }

      // Dispatch interested events
      dataReadyToSend("babiaData", self)
    } else {

      if (data.from !== oldData.from) {
        // Unregister for old querier
        if(self.querierComponent) { self.querierComponent.unregister(el) }
        

        // Register for the new one
        findQuerier(data, el, self)

        // Attach to the event of the querier
        el.addEventListener('babiaQuerierDataReady', function (e) {
          // Get the data from the info of the event (propertyName)
          self.querierDataPropertyName = e.detail
          let rawData = self.querierComponent[self.querierDataPropertyName]

          // Filtering, save the references
          let dataFiltered = filterData(data, rawData)
          self.babiaData = dataFiltered
          self.babiaMetadata = {
            id: self.babiaMetadata.id++
          }

          // Dispatch interested events
          dataReadyToSend("babiaData", self)
        });

        // Register to the querier
        self.querierComponent.register(el)
      }

      // If changed filter (is mandatory, so it has been defined, first time is undefined)
      if (oldData.filter && data.filter !== oldData.filter) {
        // Get again the raw data from the querier
        let rawData = self.querierComponent[self.querierDataPropertyName]

        // Filtering, save the new references
        let dataFiltered = filterData(data, rawData)
        self.babiaData = dataFiltered
        self.babiaMetadata = {
          id: self.babiaMetadata.id++
        }

        // Dispatch interested events
        dataReadyToSend("babiaData", self)
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

  /**
   * Querier component target
   */
  querierComponent: undefined,

  /**
   * Property of the querier where the data is saved
   */
  querierDataPropertyName: "babiaData",

  /**
   * Where the data is gonna be stored
   */
  babiaData: undefined,

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /**
   * Register function
   */
  register: function (interestedElem) {
    let el = this.el
    this.interestedElements.push(interestedElem)

    // Send the latest version of the data
    if (this.babiaData) {
      dispatchEventOnElement(interestedElem, "babiaData")
    }
  },

  /**
   * Unregister function
   */
  unregister: function (interestedElem) {
    const index = this.interestedElements.indexOf(interestedElem)

    // Remove from the interested elements if still there
    if (index > -1) {
      this.interestedElements.splice(index, 1);
    }
  },

  /**
   * Interested elements
   */
  interestedElements: [],
})


let filterData = (data, rawData) => {
  let filter = data.filter.split('=')
  if (filter[0] && filter[1]) {
    let dataFiltered = rawData.filter((key) => key[filter[0]] == filter[1])
    return dataFiltered
  } else {
    console.error("Error on filter, please use key=value syntax")
    return []
  }
}

let findQuerier = (data, el, self) => {
  if (data.from) {
    // Save the reference to the querier
    let querierElement = document.getElementById(data.from)
    if (querierElement.components['babiaxr-querier_json']) {
      self.querierComponent = querierElement.components['babiaxr-querier_json']
    } else if (querierElement.components['babiaxr-querier_es']) {
      self.querierComponent = querierElement.components['babiaxr-querier_es']
    } else if (querierElement.components['babiaxr-querier_github']) {
      self.querierComponent = querierElement.components['babiaxr-querier_github']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier in the same element and register
    if (el.components['babiaxr-querier_json']) {
      self.querierComponent = el.components['babiaxr-querier_json']
    } else if (el.components['babiaxr-querier_es']) {
      self.querierComponent = el.components['babiaxr-querier_es']
    } else if (el.components['babiaxr-querier_github']) {
      self.querierComponent = el.components['babiaxr-querier_github']
    } else {
      // Look for a querier in the scene
      if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
      } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
}

let parseEmbeddedJSONData = (embedded) => {
  let dataRetrieved = JSON.parse(embedded)
  return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
    dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaFilterDataReady", propertyName)
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
AFRAME.registerComponent('babiaxr-treegenerator', {
    schema: {
        from: { type: 'string' },
        field: { type: 'string' },
        split_by: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' }
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
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let rawData = parseEmbeddedJSONData(data.data)

            // Generating tree, save the references
            let dataTreeFormat = generateTree(data, rawData)
            self.babiaData = dataTreeFormat
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch interested events
            dataReadyToSend("babiaData", self)
        } else {

            if (data.from !== oldData.from) {
                // Unregister for old querier/filterdata
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    // Get again the raw data from the querier/filterdata
                    self.dataComponentDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

                    // Generate Tree, save the new references
                    let dataTreeFormat = generateTree(data, rawData)
                    self.babiaData = dataTreeFormat
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }

                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed splitter (is mandatory, so it has been defined, first time is undefined)
            if ((oldData.split_by && data.split_by !== oldData.split_by)
                || (oldData.field && data.field !== oldData.field)) {
                // Get again the raw data from the querier/filterdata
                let rawData = self.dataComponent[self.dataComponentDataPropertyName]

                // Generate Tree, save the new references
                let dataTreeFormat = generateTree(data, rawData)
                self.babiaData = dataTreeFormat
                self.babiaMetadata = {
                    id: self.babiaMetadata.id++
                }

                // Dispatch interested events
                dataReadyToSend("babiaData", self)
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

    /**
    * Querier/filterdata component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier/filterdata where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,

    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],
})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}


function generateTree(data, paths) {
    let tree = [];

    for (let i = 0; i < paths.length; i++) {
        let path = paths[i][data.field].split(data.split_by);
        let currentLevel = tree;
        for (let j = 0; j < path.length; j++) {
            // Check if starts with the split char
            if (!path[j]) {
                continue
            }

            let part = path[j];

            let existingPath = findWhere(currentLevel, 'id', part);

            if (existingPath) {
                currentLevel = existingPath.children;
            } else {
                let newPart = {}
                if (j === path.length - 1) {
                    newPart = paths[i]
                } else {
                    newPart['children'] = []
                }
                newPart['id'] = part
                

                currentLevel.push(newPart);
                currentLevel = newPart.children;
            }
        }
    }
    return tree;

    function findWhere(array, key, value) {
        t = 0; // t is used as a counter
        while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue

        if (t < array.length) {
            return array[t]
        } else {
            return false;
        }
    }
}

let parseEmbeddedJSONData = (embedded) => {
    let dataRetrieved = JSON.parse(embedded)
    return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaTreeDataReady", propertyName)
}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let MAX_SIZE_BAR = 10

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-ui', {
    schema: {
        target: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        console.log("WELCOME TO UI: Control your data.")
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this
        let data = this.data
        let el = this.el

        // Find the component
        let eventName = findVisualizerComponent(data, self) 

        // Find querier components
        findQuerierComponents(self)

        // Target component properties
        if (self.targetComponent.visProperties) { 
            self.targetComponentVisProperties = self.targetComponent.visProperties
        }

        // Assign new eventName
        self.targetComponentEventName = eventName

        // Attach to the events of the target component
        el.addEventListener(self.targetComponentEventName, function _listener(e) {
            console.log("Visualizer is Updated.")
            updateInterfaceEventCallback(self, e)
        });

        // Register for the new one
        self.targetComponent.register(el)
    },

    targetComponent: undefined,
    targetComponentEventName: undefined,
    targetComponentVisProperties: undefined,
    dataMetrics: undefined,
    interface: undefined,
    dataQueriers: undefined,

     /**
     * Property of the visualizer where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

})

let findQuerierComponents = (self) => {
    self.dataQueriers = []
    // All queriers and filterdatas of the scene
    document.querySelectorAll('[babiaxr-querier_json]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
    document.querySelectorAll('[babiaxr-querier_es]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
    document.querySelectorAll('[babiaxr-querier_github]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
    document.querySelectorAll('[babiaxr-filterdata]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
}

let findVisualizerComponent = (data, self) => {
    let eventName = "babiaVisualizerUpdated"
    if (data.target) {
        // Save the reference to the querier or filterdata
        let targetElement = document.getElementById(data.target)
        if (targetElement != null) { 
            if (targetElement.components['babiaxr-simplebarchart']) {
                self.targetComponent = targetElement.components['babiaxr-simplebarchart']
            } else if (targetElement.components['babiaxr-3dbarchart']) {
                self.targetComponent = targetElement.components['babiaxr-3dbarchart']
            } else if (targetElement.components['babiaxr-cylinderchart']) {
                self.targetComponent = targetElement.components['babiaxr-cylinderchart']
            } else if (targetElement.components['babiaxr-3dcylinderchart']) {
                self.targetComponent = targetElement.components['babiaxr-3dcylinderchart']
            } else if (targetElement.components['babiaxr-piechart']) {
                self.targetComponent = targetElement.components['babiaxr-piechart']
            } else if (targetElement.components['babiaxr-doughnutchart']) {
                self.targetComponent = targetElement.components['babiaxr-doughnutchart']
            } else if (targetElement.components['babiaxr-bubbleschart']) {
                self.targetComponent = targetElement.components['babiaxr-bubbleschart']
            } else if (targetElement.components['babiaxr-city']) {
                self.targetComponent = targetElement.components['babiaxr-city']
            } else if (targetElement.components['babiaxr-island']) {
                self.targetComponent = targetElement.components['babiaxr-island']
            } else {
                console.error("Visualizer not found.")
                return
            }
        } else {
            console.error("Target not exist.")
            return
        }
    } else {
        console.error("Error: Target not inserted. ")
        return
    }
    return eventName
}

let updateInterfaceEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    if(self.targetComponent[e.detail].data){
        // Inserted data manually in the visualizer 
        getDataMetrics(self, JSON.parse(self.targetComponent[e.detail].data), self.targetComponentVisProperties)
    } else {
        getDataMetrics(self, self.targetComponent[e.detail], self.targetComponentVisProperties)
    }
    
    while (self.el.firstChild)
        self.el.firstChild.remove();
    // Generate interface
    console.log('Generating interface...')
    self.interface = generateInterface(self, self.dataMetrics, self.el)

    document.addEventListener('controllerconnected', (event) => {
        self.el.setAttribute('visible', false)
        // event.detail.name ----> which VR controller
        controller = event.detail.name;
        let hand = event.target.getAttribute(controller).hand
        if (hand === 'left'){
            let hand_entity = document.getElementById(event.target.id)
            let scale = 0.03
            self.interface = generateInterface(self, self.dataMetrics, hand_entity)
            self.interface.setAttribute('scale', {x: scale, y: scale, z: scale}) 
            self.interface.setAttribute('position', {x: -scale * self.interface.width / 2, y: scale * self.interface.height /2, z: -0.1})
            self.interface.setAttribute('rotation', {x: -60}) 
            openCloseMenu(event.detail.component.el.id, self.interface)
        }    
    });

}

let getDataMetrics = (self, data, properties) =>{
    self.dataMetrics=[]

    // Create structure
    let number_properties = ['height', 'radius', 'width', 'size', 'farea', 'fheight', 'area', 'depth']
    let number_metrics = []
    let last_child

    if(self.targetComponent.attrName == 'babiaxr-city')
    {
        // Get last child of the tree
        last_child = getLastChild(data)
    } else if (self.targetComponent.attrName == 'babiaxr-island'){
        last_child = getLastChild(data[0])
    } else { 
        last_child = data[0] 
    }

    Object.keys(last_child).forEach(metric => {
        if (typeof last_child[metric] == 'number'){
            number_metrics.push(metric)

        }
    });

    properties.forEach(property => {
        if (number_properties.includes(property)){
            self.dataMetrics.push({property: property, metrics: number_metrics})
        } else {
            self.dataMetrics.push({property: property, metrics: Object.keys(data[0])})
        }
    });   
}

let getLastChild = (data) =>{
    if (data.children){
        child = getLastChild(data.children[0])
    } else { 
        child = data
    }
    return child
}

let generateInterface = (self, metrics, parent) =>{
    self.interface = document.createElement('a-entity')
    self.interface.id = "babia-menu"

    let posY = 0
    let posX = 0
    let maxX = 0

    // Data files
    if (self.dataQueriers.length > 1) { 
        let button = createProperty("Data", posX, posY)
        self.interface.appendChild(button)
        self.dataQueriers.forEach(data => {
            posX += 3.25
            let button = createDataSelect(self, data, posX, posY)
            button.classList.add("babiaxraycasterclass")
            self.interface.appendChild(button) 
        });
    }
    --posY
    posX = 0 

    // Properties and metrics
    metrics.forEach(property => {
        let button = createProperty(property.property, posX, posY)
        self.interface.appendChild(button)
        property.metrics.forEach(metric => {
            posX += 3.25
            let button = createMetric(self, property.property, metric, posX, posY)
            button.classList.add("babiaxraycasterclass")
            self.interface.appendChild(button)
        });
        --posY
        if(maxX < posX) { maxX = posX }
        posX = 0  
    });
 
    self.interface.width = maxX + 3;
    self.interface.height = Math.abs(posY)

    self.interface.setAttribute('position', { x: -self.interface.width / 2, y: self.interface.height, z: 0})
    parent.appendChild(self.interface)

    return self.interface
}

let createMetric = (self, property, metric, positionX, positionY) =>{
    let entity = document.createElement('a-box')
    entity.property = property
    entity.metric = metric
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': metric,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    if (self.targetComponent.data[property] == metric){
        entity.setAttribute('color', '#AAAAAA')
    }
    
    selection_events(entity, self.targetComponent, false)

    return entity
}

let selection_events = (entity, visualizer, isData) =>{
    entity.addEventListener('mouseenter', function(){
        entity.children[0].setAttribute('text', {color: '#FFFFFF'})
        entity.setAttribute('color', '#333333')
    });

    if (isData){
        entity.addEventListener('mouseleave', function(){
            entity.children[0].setAttribute('text', {color: 'black'})  
            if(visualizer.data.from == entity.from) {
                entity.setAttribute('color', '#AAAAAA')
            } else if(visualizer.data.from == "" || visualizer.data.from != entity.from) {
                entity.setAttribute('color', '#FFFFFF')
            }
        });  
    } else {
        entity.addEventListener('mouseleave', function(){
            entity.children[0].setAttribute('text', {color: 'black'})  
            if (visualizer.data[entity.property] == entity.metric){
                entity.setAttribute('color', '#AAAAAA')
            } else {
                entity.setAttribute('color', '#FFFFFF')
            }
        });
    }

    entity.addEventListener('click', function(){
        // Change parameters
        if(entity.property && entity.metric) {
            visualizer.el.setAttribute(visualizer.attrName, entity.property, entity.metric)
        // Change selected querier in visualializer (from)
        } else if (entity.from) {
            visualizer.el.setAttribute(visualizer.attrName, "from", entity.from )
        }
    });

}

let createProperty = (property, positionX, positionY) =>{
    let entity = document.createElement('a-plane')
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('text', {
        'value': property,
        'align': 'center',
        'width': '10',
        'color': '#FFFFFF'
    })
    entity.setAttribute('color', 'black')
    return entity
}

let createDataSelect = (self, id, positionX, positionY) =>{
    let entity = document.createElement('a-box')
    entity.from = id;
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': id,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    if (self.targetComponent.data.from && self.targetComponent.data.from == id){
        entity.setAttribute('color', '#AAAAAA')
    } else {
        entity.setAttribute('color', '#FFFFFF')
    }
    
    selection_events(entity, self.targetComponent, true)

    return entity
}

let openCloseMenu = (hand_id, entity_menu) =>{
    let menu_opened = true
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function(){
        if (menu_opened){
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
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
AFRAME.registerComponent('babiaxr-debug-data', {
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
    if (!el.querySelector('.debug-data')) {
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
/* 4 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* Component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-event-controller', {
    schema: {
        navigation : {type : 'string'},
        targets : { type: 'string' },
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
        charts = JSON.parse(data.targets)

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
let charts
var data_array
var data_array_reverse = [] 
let current
let last
let reverse = false
let first_time = true
let firts_point = 0

function time_evol(navigation){ 
    let commits = document.getElementById(navigation).getAttribute('babiaxr-navigation-bar').commits
    if (commits && first_time){
        data_array = JSON.parse(commits)
        for ( let i in data_array){
            data_array_reverse.push(data_array[i]) 
        }
        data_array_reverse.reverse() 
        
        // First current
        if (reverse){
            let position = (data_array.length - 1) - firts_point
            current = data_array_reverse[firts_point]
            last = position
        } else {
            current = data_array[firts_point]
            last = firts_point
        }
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
    for (let i in charts){
        let entity = document.getElementById(charts[i].id)
        if (entity){
            entity.setAttribute('babiaxr-vismapper', 'dataToShow', data)
        }
    }
}

function controls(){
    if (reverse){
        play(data_array_reverse)
    } else {
        play(data_array)
    }
    
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
/* 5 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-interaction-mapper', {
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
/* 6 */
/***/ (function(module, exports) {


var debug = AFRAME.utils.debug;
var coordinates = AFRAME.utils.coordinates;

var warn = debug('components:look-at:warn');
var isCoordinates = coordinates.isCoordinates || coordinates.isCoordinate;

delete AFRAME.components['look-at'];

/**
 * Look-at component.
 *
 * Modifies rotation to either track another entity OR do a one-time turn towards a position
 * vector.
 *
 * If tracking an object via setting the component value via a selector, look-at will register
 * a behavior to the scene to update rotation on every tick.
 */
AFRAME.registerComponent('look-at', {
  schema: {
    default: '0 0 0',

    parse: function (value) {
      // A static position to look at.
      if (isCoordinates(value) || typeof value === 'object') {
        return coordinates.parse(value);
      }
      // A selector to a target entity.
      return value;
    },

    stringify: function (data) {
      if (typeof data === 'object') {
        return coordinates.stringify(data);
      }
      return data;
    }
  },

  init: function () {
    this.target3D = null;
    this.vector = new THREE.Vector3();
    this.cameraListener = AFRAME.utils.bind(this.cameraListener, this);
    this.el.addEventListener('componentinitialized', this.cameraListener);
    this.el.addEventListener('componentremoved', this.cameraListener);
  },

  /**
   * If tracking an object, this will be called on every tick.
   * If looking at a position vector, this will only be called once (until further updates).
   */
  update: function () {
    var self = this;
    var target = self.data;
    var targetEl;

    // No longer looking at anything (i.e., look-at="").
    if (!target || (typeof target === 'object' && !Object.keys(target).length)) {
      return self.remove();
    }

    // Look at a position.
    if (typeof target === 'object') {
      return this.lookAt(new THREE.Vector3(target.x, target.y, target.z));
    }

    // Assume target is a string.
    // Query for the element, grab its object3D, then register a behavior on the scene to
    // track the target on every tick.
    targetEl = self.el.sceneEl.querySelector(target);
    if (!targetEl) {
      warn('"' + target + '" does not point to a valid entity to look-at');
      return;
    }
    if (!targetEl.hasLoaded) {
      return targetEl.addEventListener('loaded', function () {
        self.beginTracking(targetEl);
      });
    }
    return self.beginTracking(targetEl);
  },

  tick: (function () {
    var vec3 = new THREE.Vector3();

    return function (t) {
      // Track target object position. Depends on parent object keeping global transforms up
      // to state with updateMatrixWorld(). In practice, this is handled by the renderer.
      var target3D = this.target3D;
      if (target3D) {
        target3D.getWorldPosition(vec3);
        this.lookAt(vec3);
      }
    }
  })(),

  remove: function () {
    this.el.removeEventListener('componentinitialized', this.cameraListener);
    this.el.removeEventListener('componentremoved', this.cameraListener);
  },

  beginTracking: function (targetEl) {
    this.target3D = targetEl.object3D;
  },

  cameraListener: function (e) {
    if (e.detail && e.detail.name === 'camera') {
      this.update();
    }
  },

  lookAt: function (position) {
    var vector = this.vector;
    var object3D = this.el.object3D;

    if (this.el.getObject3D('camera')) {
      // Flip the vector to -z, looking away from target for camera entities. When using
      // lookat from THREE camera objects, this is applied for you, but since the camera is
      // nested into a Object3D, we need to apply this manually.
      vector.subVectors(object3D.position, position).add(object3D.position);
    } else {
      vector.copy(position);
    }

    object3D.lookAt(vector);
  }
});

/***/ }),
/* 7 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let points
let size
let play_button
let pause_button
let player
let el
let last_color
let point_color
let to
let start
let max_points

AFRAME.registerComponent('babiaxr-navigation-bar', {
    schema: {
        commits: { type: 'string' },
        size: { type: 'number', default: '5'},
        points_by_line: {type: 'number', default: '5'},
        to: {type: 'string', default: 'left'},
        start_point: {type: 'number', default: '0'},
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
        size = data.size
        to = data.to
        start = data.start_point 
        max_points = data.points_by_line
        let time_bar = createTimeBar(points, size, max_points)
        this.el.appendChild(time_bar)
        player = createPlayer()
        this.el.appendChild(player)
        setStart()
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


function createTimeBar(elements, size, maxpoints){
    let timebar_entity = document.createElement('a-entity')
    timebar_entity.classList.add('babiaxrTimeBar')

    let posX = 0
    let posY = (Math.ceil((elements.length / maxpoints)) / 5) - 0.2
    let stepX = size / (maxpoints - 1)
    let last_posX = 0
    let lines = 1

    for (let i in elements){
        
        let point = createTimePoint(elements[i])
        point.classList.add('babiaxraycasterclass');
        point.setAttribute('position', {x: posX, y: posY, z: 0});
        timebar_entity.appendChild(point)

        let x = i % maxpoints
        if ((x == maxpoints-1) && (i != elements.length - 1)) {
            lines++
            posY -= 0.2
            posX = 0
        } else if (i != elements.length - 1){
            posX += stepX
        }
        last_posX = posX
    };

    // Add Line 
    for (let i = 0; i < lines; i++){
        let bar_line = document.createElement('a-entity')      
        if ((last_posX != 0 && i == 0) || (max_points == 1) ){  
            bar_line.setAttribute('line',{
                start : '0 ' + posY + ' 0',
                end : last_posX + ' ' + posY + ' 0',
                color : '#FF0000',
            })  
        } else if ((last_posX == 0 && i == 0)){
            bar_line.setAttribute('line',{
                start : '0 ' + posY + ' 0',
                end : last_posX + ' ' + posY + ' 0',
                color : '#FF0000',
            })    
        } else {
            bar_line.setAttribute('line',{
                start : '0 ' + posY + ' 0',
                end : size + ' ' + posY + ' 0',
                color : '#FF0000',
            }) 
        }
        posY += 0.2
        timebar_entity.appendChild(bar_line)  
    } 

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

function setStart(){
    let points = document.getElementsByClassName('babiaxrTimeBar')[0].children
    for (let i in points){
        if ((i == start)){
            points[i].emit('showinfo')
        }
    }
}

function setPoint(element, data){
    element.addEventListener('click', function(){
        this.setAttribute('material', {color : '#00AA00'})
        point_color = this.getAttribute('material').color
        el.emit('babiaxrShow', {data: data})
        if (document.getElementsByClassName('babiaxrPause')[0]){
            player.removeChild(pause_button)
            player.appendChild(play_button)
        }
    });
}

function showInfo(element, data){
    let legend
    let legend2
    element.addEventListener('mouseenter', function () {
        point_color = this.getAttribute('material').color
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 })
        this.setAttribute('material', {color : '#AAAA00'})
        legend2 = generateLegend(data)
        this.appendChild(legend2)
    });

    element.addEventListener('showinfo', function () {
        legend = generateLegend(data)
        this.setAttribute('material', {color : '#00AA00'})
        this.appendChild(legend)
    });

    element.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 })
        this.setAttribute('material', {color: point_color})
        this.removeChild(legend2)
    });

    element.addEventListener('removeinfo', function () {
        if(legend){
            this.removeChild(legend)
            this.setAttribute('material', {color: '#FF0000'})
        }
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
    entity.setAttribute('position', { x: 0, y: 0.4, z: 0.1 })
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

    let player_entity = document.createElement('a-entity')
    player_entity.classList.add('babiaxrPlayer')
    player_entity.setAttribute('position', {x: (size - 5)/2, y: 0, z: 0})
    player_entity.classList.add('babiaxraycasterclass');

    play_button = playButton(player_entity)
    play_button.setAttribute('position', {x: 2.35, y: -0.65, z: 0})
    play_button.classList.add('babiaxraycasterclass');

    pause_button = pauseButton()
    pause_button.setAttribute('position', {x: 2.35, y: -0.65 , z: 0})
    pause_button.classList.add('babiaxraycasterclass');
    player_entity.appendChild(pause_button)

    let rewind_button = rewindButton()
    rewind_button.setAttribute('position', {x: 1.25, y: -0.65 , z: 0})
    rewind_button.classList.add('babiaxraycasterclass');
    player_entity.appendChild(rewind_button)

    let forward_button = forwardButton()
    forward_button.setAttribute('position', {x: 3.7, y: -0.65 , z: 0})
    forward_button.classList.add('babiaxraycasterclass');
    player_entity.appendChild(forward_button)

    let skip_prev_button = skipPreviousButton()
    skip_prev_button.setAttribute('position', {x: 1.95, y: -0.65 , z: 0})
    skip_prev_button.classList.add('babiaxraycasterclass');
    player_entity.appendChild(skip_prev_button)

    let skip_next_button = skipNextButton()
    skip_next_button.setAttribute('position', {x: 3, y: -0.65 , z: 0})
    skip_next_button.classList.add('babiaxraycasterclass');
    player_entity.appendChild(skip_next_button)

    return player_entity
}

function playButton(player){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPlay')
    let vertices = [[0, 0, 0], [0, 3, 0], [2.5, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Events
    emitEvents(entity, 'babiaxrContinue')
    mouseOver(entity)

    return entity
}

function rewindButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrRewind')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    entity.setAttribute('rotation', {x: 0, y: 180, z: 0})
    if (to == 'left'){
        entity.object3DMap.mesh.material.color = { r: 85/255, g: 85/255, b: 85/255 }
    }

    // Events
    emitEvents(entity, 'babiaxrToPast')
    mouseOver(entity)

    return entity
}

function forwardButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrForward')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    if (to == 'right'){
        entity.object3DMap.mesh.material.color = { r: 85/255, g: 85/255, b: 85/255 }
    }

    // Events
    emitEvents(entity, 'babiaxrToPresent')
    mouseOver(entity)

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

    // Events
    emitEvents(entity, 'babiaxrSkipPrev')
    mouseOver(entity)

    return entity
}

function skipNextButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrSkipNext')
    let vertices = [[0, 0, 0], [0, 3, 0], [1, 1.5, 0], [1, 3, 0], [2, 1.5, 0], [2, 3, 0], [2.5, 3, 0],
                    [2.5, 0, 0], [2, 0, 0], [2, 1.5, 0], [1, 0, 0], [1, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Events
    emitEvents(entity, 'babiaxrSkipNext')
    mouseOver(entity)

    return entity
}

function pauseButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPause')
    let vertices_1 = [[0, 0, 0], [0, 3, 0], [1, 3, 0], [1, 0, 0], [0, 0, 0]];
    let vertices_2 = [[1.5, 0, 0],[1.5, 3, 0], [2.5, 3, 0], [2.5, 0, 0], [1.5, 0, 0]];
    let button = merge_model(vertices_1, vertices_2);
    entity.setObject3D('mesh', button);

    // Events
    emitEvents(entity, 'babiaxrStop')
    mouseOver(entity)

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

function mouseOver(element){
    element.addEventListener('mouseenter', function(){
        last_color = Object.assign({}, this.object3DMap.mesh.material.color)
        this.object3DMap.mesh.material.color = {r: 170/255, g: 170/255, b: 170/255}
    })

    element.addEventListener('mouseleave', function(){
        this.object3DMap.mesh.material.color = last_color
    })
}

function emitEvents(element, event_name){
    element.addEventListener('click', function () {
        if (element.classList.contains('babiaxrPlay')){
            player.removeChild(element)
            player.appendChild(pause_button)
        } else if (element.classList.contains('babiaxrPause')){
            player.removeChild(pause_button)
            player.appendChild(play_button)
        } else if ((element.classList.contains('babiaxrSkipNext')) || (element.classList.contains('babiaxrSkipPrev'))){
            if (document.getElementsByClassName('babiaxrPause')[0]){
                player.removeChild(pause_button)
                player.appendChild(play_button)
            }
        } else if (element.classList.contains('babiaxrForward')){
            last_color = { r: 85/255, g: 85/255, b: 85/255 }
            let button = document.getElementsByClassName('babiaxrRewind')[0]
            button.object3DMap.mesh.material.color = { r: 255/255, g: 255/255, b: 255/255 }
        } else if (element.classList.contains('babiaxrRewind')){
            last_color = { r: 85/255, g: 85/255, b: 85/255 }
            let button = document.getElementsByClassName('babiaxrForward')[0]
            button.object3DMap.mesh.material.color = { r: 255/255, g: 255/255, b: 255/255 }
        }
        console.log('Emit..... ' + event_name)
        el.emit(event_name)
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
AFRAME.registerComponent('babiaxr-totem', {
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

        entity.classList.add("babiaxraycasterclass")
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

                        if (type === "babiaxr-vismapper") {
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
/* 9 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-querier_es', {
    schema: {
        elasticsearch_url: { type: 'string' },
        index: { type: 'string' },
        query: { type: 'string' },
        size: { type: 'int', default: 10 },
        user: { type: 'string' },
        password: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' }
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
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            parseEmbeddedJSONData(data.data, el, self)
        } else {
            if (data.elasticsearch_url !== oldData.elasticsearch_url ||
                data.index !== oldData.index ||
                data.query !== oldData.query ||
                data.size !== oldData.size) {
                if (data.elasticsearch_url && data.index) {
                    requestJSONDataFromES(data, el, self)
                } else {
                    console.error("elasicsearch_url and index must be defined")
                    return
                }
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

    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],
})


let requestJSONDataFromES = (data, el, self) => {
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
                let dataRetrieved = []
                for (let i = 0; i < dataRaw.length; i++) {
                    dataRetrieved[i] = dataRaw[i]._source
                }
            } else {
                // Why this case
                let dataRetrieved = []
                console.error("Unexpected response", request.response)
            }

            // Save
            self.babiaData = dataRetrieved
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch/Trigger/Fire the event
            dataReadyToSend("babiaData", self)

        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
            console.error("Error during requesting data", this.status, xhr.statusText)
        }
    };
    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
        console.error("Error during requesting data", this.status, xhr.statusText)
    };
    request.send();
}

let parseEmbeddedJSONData = (embedded, el, self) => {
    // Save data
    let dataRetrieved = JSON.parse(embedded)
    self.babiaData = dataRetrieved
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaQuerierDataReady", propertyName)
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
AFRAME.registerComponent('babiaxr-querier_github', {
    schema: {
        user: { type: 'string' },
        token: { type: 'string' },
        repos: { type: 'array' },
        // data, for debugging, highest priority
        data: { type: 'string' }
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
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            parseEmbeddedJSONData(data.data, el, self)
        } else {
            if (oldData.user !== data.user || oldData.repos !== data.repos || oldData.token !== data.token) {
                if (data.user && (data.repos.length === 0)) {
                    requestAllReposFromUser(data, el, self)
                } else if (data.repos.length > 0) {
                    requestReposFromList(data, el, self)
                }
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

    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],

})

let requestReposFromList = (data, el, self) => {
    let dataOfRepos = []

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
                dataOfRepos.push(rawData);

            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
                console.error("Error during requesting data", this.status, xhr.statusText)
            }
        };
        request.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
            console.error("Error during requesting data", this.status, xhr.statusText)
        };
        request.send();
    })

    // Save data
    self.babiaData = dataOfRepos
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}


let requestAllReposFromUser = (data, el, self) => {
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
            self.babiaData = allReposParse(JSON.parse(request.response))
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch/Trigger/Fire the event
            dataReadyToSend("babiaData", self)

        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
            console.error("Error during requesting data", this.status, xhr.statusText)
        }
    };
    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
        console.error("Error during requesting data", this.status, xhr.statusText)
    };
    request.send();
}

let allReposParse = (data) => {
    let dataParsed = []
    data.forEach((e, i) => {
        dataParsed.push(e)
    });
    return dataParsed
}

let parseEmbeddedJSONData = (embedded, el, self) => {
    // Save data
    let dataRetrieved = JSON.parse(embedded)
    self.babiaData = dataRetrieved
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaQuerierDataReady", propertyName)
}

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
AFRAME.registerComponent('babiaxr-querier_json', {
    schema: {
        url: { type: 'string' },
        embedded: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' }
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
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            parseEmbeddedJSONData(data.data, el, self)
        } else {
            if (oldData.url !== data.url) {
                requestJSONDataFromURL(data, el, self)
            } else if (oldData.embedded !== data.embedded) {
                parseEmbeddedJSONData(data.embedded, el, self)
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

    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],
})


let requestJSONDataFromURL = (data, el, self) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', data.url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            // Save data
            let dataRetrieved
            if (typeof request.response === 'string' || request.response instanceof String) {
                dataRetrieved = JSON.parse(request.response)
            } else {
                dataRetrieved = request.response
            }

            // Check if a list
            if (!Array.isArray(dataRetrieved)) {
                console.error("Data must be an array")
                return
            }

            // Save
            self.babiaData = dataRetrieved
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch/Trigger/Fire the event
            dataReadyToSend("babiaData", self)

        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
            console.error("Error during requesting data", this.status, xhr.statusText)
        }
    };
    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
        console.error("Error during requesting data", this.status, xhr.statusText)
    };
    request.send();
}

let parseEmbeddedJSONData = (embedded, el, self) => {
    // Save data
    let dataRetrieved = JSON.parse(embedded)
    self.babiaData = dataRetrieved
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaQuerierDataReady", propertyName)
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
AFRAME.registerComponent('babiaxr-3dbarchart', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        x_axis: { type: 'string', default: 'x_axis' },
        z_axis: { type: 'string', default: 'z_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: false },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        scale: { type: 'number' },
        heightMax: { type: 'number' }
    },
    
    /**
     * List of visualization properties
     */
    visProperties: ['height', 'x_axis', 'z_axis'],

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
        const self = this;
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            // From data embedded, save it anyway
            self.babiaData = self.data
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            while (self.el.firstChild)
                self.el.firstChild.remove();
            console.log("Generating barchart from data...")
            self.chart = generateBarChart(self.data, JSON.parse(self.data.data), self.el, self.widthBars, self.proportion, self.valueMax)

            // Dispatch interested events because I updated my visualization
            dataReadyToSend("babiaData", self)

        } else {

            // If changed from, need to re-register to the new data component
            if (data.from !== oldData.from) {
                // Unregister for old querier
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    attachNewDataEventCallback(self, e)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating barchart...")
                self.chart = generateBarChart(self.data, self.babiaData, self.el, self.widthBars, self.proportion, self.valueMax)
                            
                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
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

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Duration of the animation if activated
     */
    widthBars: 1,

    /**
     * Proportion of the bars
     */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.babiaData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Generate chart
    while (self.el.firstChild)
        self.el.firstChild.remove();
    console.log("Generating barchart...")
    self.chart = generateBarChart(self.data, rawData, self.el, self.widthBars, self.proportion, self.valueMax)

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)
}

let generateBarChart = (data, dataRetrieved, element, widthBars, proportion, valueMax) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
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

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))
        if (scale) {
            maxY = maxY / scale
        } else if (heightMax) {
            valueMax = maxY
            proportion = heightMax / maxY
            maxY = heightMax
        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

        for (let bar of dataToPrint) {
            // Check if used in order to put the bar in the parent row
            if (keys_used[bar[data.x_axis]]) {
                stepX = keys_used[bar[data.x_axis]].posX
                colorid = keys_used[bar[data.x_axis]].colorid
            } else {
                stepX = maxX
                colorid = maxColorId
                //Save in used
                keys_used[bar[data.x_axis]] = {
                    "posX": maxX,
                    "colorid": maxColorId
                }

                //Axis dict
                let bar_printed = {
                    colorid: colorid,
                    posX: stepX,
                    key: bar[data.x_axis]
                }
                xaxis_dict.push(bar_printed)

                maxX += widthBars + widthBars / 4
                maxColorId++
            }

            // Get Z val
            if (z_axis[bar[data.z_axis]]) {
                stepZ = z_axis[bar[data.z_axis]].posZ
            } else {
                stepZ = maxZ
                //Save in used
                z_axis[bar[data.z_axis]] = {
                    "posZ": maxZ
                }

                //Axis dict
                let bar_printed = {
                    colorid: colorid,
                    posZ: stepZ,
                    key: bar[data.z_axis]
                }
                zaxis_dict.push(bar_printed)

                maxZ += widthBars + widthBars / 4
            }

            let barEntity = generateBar(bar[data.height], widthBars, colorid, stepX, stepZ, palette, animation, scale, proportion);
            barEntity.classList.add("babiaxraycasterclass")

            //Prepare legend
            if (data.legend) {
                showLegend(data, barEntity, bar, element, widthBars)
            }

            chart_entity.appendChild(barEntity);

            //Print Title
            let title_3d = showTitle(title, font, color, title_position);
            element.appendChild(title_3d);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict, palette, widthBars)
            showZAxis(element, maxZ, zaxis_dict, palette, widthBars)
            showYAxis(element, maxY, scale, widthBars, proportion, valueMax)
        }
    }
}


function generateBar(size, width, colorid, positionX, positionZ, palette, animation, scale, proportion) {
    let color = getColor(colorid, palette)
    console.log("Generating bar...")
    if (scale) {
        size = size / scale
    } else if (proportion) {
        size = proportion * size
    }

    let entity = document.createElement('a-box');
    entity.setAttribute('color', color);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    // Add animation
    if (animation) {
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

function getColor(colorid, palette) {
    let color
    for (let i in colors) {
        if (colors[i][palette]) {
            color = colors[i][palette][colorid % 4]
        }
    }
    return color
}

function generateLegend(data, bar, barEntity, widthBars) {
    let text = bar[data.x_axis] + ': ' + bar[data.height];

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

function showLegend(data, barEntity, bar, element, widthBars) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data, bar, barEntity, widthBars);
        element.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bars_printed, palette, widthBars) {
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
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBars - 5 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bars_printed, palette, widthBars) {
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
        key.setAttribute('position', { x: -widthBars - 5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd, scale, widthBars, proportion, valueMax) {
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

    if (proportion) {
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    }
    for (let i = 0; i <= yLimit; i++) {
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod - 1)
        if (!proportion || (proportion && i % pow === 0)) {
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale) {
                key.setAttribute('text', { 'value': value * scale })
                key.setAttribute('position', { x: -widthBars - 5.2, y: value, z: -(widthBars / 2 + widthBars / 4) })
            } else {
                key.setAttribute('position', { x: -widthBars - 5.2, y: i * proportion, z: -(widthBars / 2 + widthBars / 4) })
            }
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showTitle(title, font, color, position) {
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry', {
        value: title,
    });
    if (font) {
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color) {
        entity.setAttribute('material', {
            color: color
        })
    }
    var position = position.split(" ")
    entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
    { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
    { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
    { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
    { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
    { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
    { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
    { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
    { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
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
AFRAME.registerComponent('babiaxr-3dcylinderchart', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    z_axis: { type: 'string', default: 'z_axis' },
    from: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: { type: 'boolean', default: false },
    palette: { type: 'string', default: 'ubuntu' },
    title: { type: 'string' },
    titleFont: { type: 'string' },
    titleColor: { type: 'string' },
    titlePosition: { type: 'string', default: "0 0 0" },
    scale: { type: 'number' },
    heightMax: { type: 'number' },
    radiusMax: { type: 'number' },
  },
    
  /**
  * List of visualization properties
  */
  visProperties: ['height', 'radius', 'x_axis', 'z_axis'],

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
    const self = this
    let el = this.el;
    let data = this.data;

    /**
     * Update or create chart component
    */

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      // From data embedded, save it anyway
      self.babiaData = self.data
      self.babiaMetadata = {
          id: self.babiaMetadata.id++
      }

      while (self.el.firstChild)
        self.el.firstChild.remove();
      console.log("Generating 3Dcylynderchart from data...")
      self.chart = generateCylinderChart(self.data, JSON.parse(data.data), self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)

      // Dispatch interested events because I updated my visualization
      dataReadyToSend("babiaData", self)

    } else {

      // If changed from, need to re-register to the new data component
      if (data.from !== oldData.from) {
        // Unregister for old querier
        if (self.dataComponent) { self.dataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        let eventName = findDataComponent(data, el, self)
        // If changed to filterdata or to querier
        if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
          el.removeEventListener(self.dataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.dataComponentEventName = eventName

        // Attach to the events of the data component
        el.addEventListener(self.dataComponentEventName, _listener = (e) => {
          attachNewDataEventCallback(self, e)
        });

        // Register for the new one
        self.dataComponent.register(el)
        return
      }

      // If changed whatever, re-print with the current data
      if (data !== oldData && self.babiaData) {
        while (self.el.firstChild)
              self.el.firstChild.remove();
          console.log("Generating Cylinder...")
          self.chart = generateCylinderChart(self.data, self.babiaData, self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)
          
          // Dispatch interested events because I updated my visualization
          dataReadyToSend("babiaData", self)
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

  /**
  * Register function when I'm updated
  */
  register: function (interestedElem) {
      let el = this.el
      this.interestedElements.push(interestedElem)

      // Send the latest version of the data
      if (this.babiaData) {
          dispatchEventOnElement(interestedElem, "babiaData")
      }
  },

  /**
   * Unregister function when I'm updated
   */
  unregister: function (interestedElem) {
      const index = this.interestedElements.indexOf(interestedElem)

      // Remove from the interested elements if still there
      if (index > -1) {
          this.interestedElements.splice(index, 1);
      }
  },

  /**
   * Interested elements when I'm updated
   */
  interestedElements: [],

  /**
  * Querier component target
  */
  dataComponent: undefined,

  /**
   * Property of the querier where the data is saved
   */
  dataComponentDataPropertyName: "babiaData",

  /**
   * Event name to difference between querier and filterdata
   */
  dataComponentEventName: undefined,


  /**
   * Where the data is gonna be stored
   */
  babiaData: undefined,

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /**
   * Proportion of the bars
   */
  proportion: undefined,

  /**
   * Value max
   */
  valueMax: undefined,

  /**
   * Max radius
   */
  maxRadius: undefined,

  /**
   * Max radius
   */
  radius_scale: undefined,

})

let findDataComponent = (data, el, self) => {
  let eventName = "babiaQuerierDataReady"
  if (data.from) {
    // Save the reference to the querier or filterdata
    let dataElement = document.getElementById(data.from)
    if (dataElement.components['babiaxr-filterdata']) {
      self.dataComponent = dataElement.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (dataElement.components['babiaxr-querier_json']) {
      self.dataComponent = dataElement.components['babiaxr-querier_json']
    } else if (dataElement.components['babiaxr-querier_es']) {
      self.dataComponent = dataElement.components['babiaxr-querier_es']
    } else if (dataElement.components['babiaxr-querier_github']) {
      self.dataComponent = dataElement.components['babiaxr-querier_github']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier or filterdata in the same element and register
    if (el.components['babiaxr-filterdata']) {
      self.dataComponent = el.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (el.components['babiaxr-querier_json']) {
      self.dataComponent = el.components['babiaxr-querier_json']
    } else if (el.components['babiaxr-querier_es']) {
      self.dataComponent = el.components['babiaxr-querier_es']
    } else if (el.components['babiaxr-querier_github']) {
      self.dataComponent = el.components['babiaxr-querier_github']
    } else {
      // Look for a querier or filterdata in the scene
      if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
        eventName = "babiaFilterDataReady"
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
      } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
  return eventName
}

let attachNewDataEventCallback = (self, e) => {
  // Get the data from the info of the event (propertyName)
  self.dataComponentDataPropertyName = e.detail
  let rawData = self.dataComponent[self.dataComponentDataPropertyName]

  self.babiaData = rawData
  self.babiaMetadata = {
    id: self.babiaMetadata.id++
  }

  //remove previous chart
  while (self.el.firstChild)
    self.el.firstChild.remove();
  console.log("Generating Cylinder...")
  self.chart = generateCylinderChart(self.data, rawData, self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)

  // Dispatch interested events because I updated my visualization
  dataReadyToSend("babiaData", self)
}

let generateCylinderChart = (data, dataRetrieved, element, maxRadius, proportion, valueMax, radius_scale) => {
  let stepMax
  if (dataRetrieved) {
    const dataToPrint = dataRetrieved
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

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    if (scale) {
      maxY = maxY / scale
      maxRadius = maxRadius / scale
    } else if (heightMax || radiusMax) {
      if (heightMax) {
        valueMax = maxY
        proportion = heightMax / maxY
        maxY = heightMax
      }
      if (radiusMax) {
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
      if (keys_used[cylinder[data.x_axis]]) {
        stepX = keys_used[cylinder[data.x_axis]].posX
        colorid = keys_used[cylinder[data.x_axis]].colorid
      } else {
        stepX = maxX
        colorid = maxColorId
        //Save in used
        keys_used[cylinder[data.x_axis]] = {
          "posX": maxX,
          "colorid": maxColorId
        }

        //Axis dict
        let cylinder_printed = {
          colorid: colorid,
          posX: stepX,
          key: cylinder[data.x_axis]
        }
        xaxis_dict.push(cylinder_printed)

        maxX += 2 * maxRadius + 1
        maxColorId++
      }

      // Get Z val
      if (z_axis[cylinder[data.z_axis]]) {
        stepZ = z_axis[cylinder[data.z_axis]].posZ
      } else {
        stepZ = maxZ
        //Save in used
        z_axis[cylinder[data.z_axis]] = {
          "posZ": maxZ
        }

        //Axis dict
        let cylinder_printed = {
          colorid: colorid,
          posZ: stepZ,
          key: cylinder[data.z_axis]
        }
        zaxis_dict.push(cylinder_printed)

        maxZ += 2 * maxRadius + 1
      }

      let cylinderEntity = generateCylinder(cylinder[data.height], cylinder[data.radius], colorid, palette, stepX, stepZ, animation, scale, proportion, radius_scale);
      cylinderEntity.classList.add("babiaxraycasterclass")

      //Prepare legend
      if (data.legend) {
        showLegend(data, cylinderEntity, cylinder, element)
      }

      chart_entity.appendChild(cylinderEntity, element)

      //Print Title
      let title_3d = showTitle(title, font, color, title_position);
      element.appendChild(title_3d);
    }

    // Axis
    if (data.axis) {
      showXAxis(element, maxX, xaxis_dict, palette, maxRadius)
      showZAxis(element, maxZ, zaxis_dict, maxRadius)
      showYAxis(element, maxY, scale, maxRadius, proportion, valueMax)
    }
  }
}



function generateCylinder(height, radius, colorid, palette, positionX, positionZ, animation, scale, proportion, radius_scale) {
  let color = getColor(colorid, palette)
  let entity = document.createElement('a-cylinder');
  if (scale) {
    height = height / scale
    radius = radius / scale
  } else if (proportion || radius_scale) {
    if (proportion) {
      height = proportion * height
    }
    if (radius_scale) {
      radius = radius_scale * radius
    }
  }
  entity.setAttribute('color', color);
  entity.setAttribute('height', 0);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation) {
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

function getColor(colorid, palette) {
  let color
  for (let i in colors) {
    if (colors[i][palette]) {
      color = colors[i][palette][colorid % 4]
    }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette, maxRadius) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
    'start': { x: -maxRadius - 1, y: 0, z: -maxRadius },
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

function showYAxis(parent, yEnd, scale, maxRadius, proportion, valueMax) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
    'start': { x: -maxRadius, y: 0, z: 0 },
    'end': { x: -maxRadius, y: yEnd, z: 0 },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius - 1 });
  axis.appendChild(axis_line)

  if (proportion) {
    yLimit = yLimit / proportion
    var mod = Math.floor(Math.log10(valueMax))
  }
  for (let i = 0; i <= yLimit; i++) {
    let key = document.createElement('a-entity');
    let value = i
    let pow = Math.pow(10, mod - 1)
    if (!proportion || (proportion && i % pow === 0)) {
      key.setAttribute('text', {
        'value': value,
        'align': 'right',
        'width': 10,
        'color': 'white '
      });
      if (scale) {
        key.setAttribute('text', { 'value': value * scale })
        key.setAttribute('position', { x: -maxRadius - 6.5, y: value, z: -maxRadius - 1 })
      } else if (proportion) {
        key.setAttribute('position', { x: -maxRadius - 6.5, y: i * proportion, z: -maxRadius - 1 })
      } else {
        key.setAttribute('position', { x: -maxRadius - 6.5, y: i, z: -maxRadius - 1 })
      }
    }
    axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showZAxis(parent, zEnd, cylinder_printed, maxRadius) {
  let axis = document.createElement('a-entity');
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
    'start': { x: -maxRadius, y: 0.1, z: 0 },
    'end': { x: -maxRadius, y: 0.1, z: zEnd + maxRadius },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius - 1 });
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


function showLegend(data, cylinderEntity, cylinder, element) {
  cylinderEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    legend = generateLegend(data, cylinder, cylinderEntity);
    element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    element.removeChild(legend);
  });
}

function generateLegend(data, cylinder, cylinderEntity) {
  let text = ''
  let lines = []
  lines.push(cylinder[data.x_axis] + ' ' + cylinder[data.z_axis] + '\n');
  lines.push('Height: ' + cylinder[data.height] + '\n');
  lines.push('Radius: ' + cylinder[data.radius])
  let width = 5;
  for (let line of lines) {
    if ((line.length > 10) && (width < line.length / 2)) {
      width = line.length / 2;
    }
    text += line
  }

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {
    x: cylinderPosition.x, y: 2 * cylinderPosition.y + 3,
    z: cylinderPosition.z + cylinder[data.radius] / 2
  });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '4');
  entity.setAttribute('width', width);
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

function showTitle(title, font, color, position) {
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry', {
    value: title,
  });
  if (font) {
    entity.setAttribute('text-geometry', {
      font: font,
    })
  }
  if (color) {
    entity.setAttribute('material', {
      color: color
    })
  }
  var position = position.split(" ")
  entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
  entity.classList.add("babiaxrTitle")
  return entity;
}

let colors = [
  { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
  { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
  { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
  { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
  { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
  { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
  { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
  { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
  { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaVisualizerUpdated", propertyName)
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
AFRAME.registerComponent('babiaxr-bubbleschart', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        radius: { type: 'string', default: 'radius' },
        x_axis: { type: 'string', default: 'x_axis' },
        z_axis: { type: 'string', default: 'z_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: false },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        scale: { type: 'number' },
        heightMax: { type: 'number' },
        radiusMax: { type: 'number' },
    },
        
    /**
     * List of visualization properties
     */
    visProperties: ['height', 'radius', 'x_axis', 'z_axis'],

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
        const self = this;
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        // Highest priority to data
    if (data.data && oldData.data !== data.data) {
        // From data embedded, save it anyway
        self.babiaData = self.data
        self.babiaMetadata = {
            id: self.babiaMetadata.id++
        }

        while (self.el.firstChild)
          self.el.firstChild.remove();
        console.log("Generating 3Dcylynderchart from data...")
        self.chart = generateBubblesChart(self.data, JSON.parse(self.data.data), self.el, self.proportion, self.valueMax, self.widthBubbles, self.radius_scale)
  
        // Dispatch interested events because I updated my visualization
        dataReadyToSend("babiaData", self)

      } else {
  
        // If changed from, need to re-register to the new data component
        if (data.from !== oldData.from) {
          // Unregister for old querier
          if (self.dataComponent) { self.dataComponent.unregister(el) }
  
          // Find the component and get if querier or filterdata by the event               
          let eventName = findDataComponent(data, el, self)
          // If changed to filterdata or to querier
          if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
            el.removeEventListener(self.dataComponentEventName, _listener, true)
          }
          // Assign new eventName
          self.dataComponentEventName = eventName
  
          // Attach to the events of the data component
          el.addEventListener(self.dataComponentEventName, _listener = (e) => {
            attachNewDataEventCallback(self, e)
          });
  
          // Register for the new one
          self.dataComponent.register(el)
          return
        }
  
        // If changed whatever, re-print with the current data
        if (data !== oldData && self.babiaData) {
          while (self.el.firstChild)
                self.el.firstChild.remove();
            console.log("Generating Cylinder...")
            self.chart = generateBubblesChart(self.data, self.babiaData, self.el, self.proportion, self.valueMax, self.widthBubbles, self.radius_scale)
        
            // Dispatch interested events because I updated my visualization
            dataReadyToSend("babiaData", self)
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

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
    * Proportion of the bars
    */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

    /**
     * Width of the bubbles
     */
    widthBubbles: 0,

    /**
     * Max radius
     */
    radius_scale: undefined,

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },
})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
      // Save the reference to the querier or filterdata
      let dataElement = document.getElementById(data.from)
      if (dataElement.components['babiaxr-filterdata']) {
        self.dataComponent = dataElement.components['babiaxr-filterdata']
        eventName = "babiaFilterDataReady"
      } else if (dataElement.components['babiaxr-querier_json']) {
        self.dataComponent = dataElement.components['babiaxr-querier_json']
      } else if (dataElement.components['babiaxr-querier_es']) {
        self.dataComponent = dataElement.components['babiaxr-querier_es']
      } else if (dataElement.components['babiaxr-querier_github']) {
        self.dataComponent = dataElement.components['babiaxr-querier_github']
      } else {
        console.error("Problem registering to the querier")
        return
      }
    } else {
      // Look for a querier or filterdata in the same element and register
      if (el.components['babiaxr-filterdata']) {
        self.dataComponent = el.components['babiaxr-filterdata']
        eventName = "babiaFilterDataReady"
      } else if (el.components['babiaxr-querier_json']) {
        self.dataComponent = el.components['babiaxr-querier_json']
      } else if (el.components['babiaxr-querier_es']) {
        self.dataComponent = el.components['babiaxr-querier_es']
      } else if (el.components['babiaxr-querier_github']) {
        self.dataComponent = el.components['babiaxr-querier_github']
      } else {
        // Look for a querier or filterdata in the scene
        if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
          eventName = "babiaFilterDataReady"
        } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
        } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
        } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
        } else {
          console.error("Error, querier not found")
          return
        }
      }
    }
    return eventName
  }
  
  let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]
  
    self.babiaData = rawData
    self.babiaMetadata = {
      id: self.babiaMetadata.id++
    }
  
    //remove previous chart
    while (self.el.firstChild)
      self.el.firstChild.remove();
    console.log("Generating Bubbles...")
    self.chart = generateBubblesChart(self.data, rawData, self.el, self.proportion, self.valueMax, self.widthBubbles, self.radius_scale)
    
    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)  
}


let generateBubblesChart = (data, dataRetrieved, element, proportion, valueMax, widthBubbles, radius_scale) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale
        const heightMax = data.heightMax
        const radiusMax = data.radiusMax

        let stepMax
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

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
        widthBubbles = Math.max.apply(Math, Object.keys(dataToPrint).map(function (o) { return dataToPrint[o][data.radius]; }))
        if (scale) {
            maxY = maxY / scale
            widthBubbles = widthBubbles / scale
        } else if (heightMax || radiusMax) {
            if (heightMax) {
                valueMax = maxY
                proportion = heightMax / maxY
                maxY = heightMax
            }
            if (radiusMax) {
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
            if (keys_used[bubble[data.x_axis]]) {
                stepX = keys_used[bubble[data.x_axis]].posX
                colorid = keys_used[bubble[data.x_axis]].colorid
            } else {
                stepX = maxX
                colorid = maxColorId
                //Save in used
                keys_used[bubble[data.x_axis]] = {
                    "posX": maxX,
                    "colorid": maxColorId
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posX: stepX,
                    key: bubble[data.x_axis]
                }
                xaxis_dict.push(bubble_printed)

                maxX += 2 * widthBubbles
                maxColorId++
            }

            // Get Z val
            if (z_axis[bubble[data.z_axis]]) {
                stepZ = z_axis[bubble[data.z_axis]].posZ
            } else {
                stepZ = maxZ
                //Save in used
                z_axis[bubble[data.z_axis]] = {
                    "posZ": maxZ
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posZ: stepZ,
                    key: bubble[data.z_axis]
                }
                zaxis_dict.push(bubble_printed)

                maxZ += 2 * widthBubbles
            }

            let bubbleEntity = generateBubble(bubble[data.radius], bubble[data.height], widthBubbles, colorid, palette, stepX, stepZ, animation, scale, proportion, radius_scale);
            bubbleEntity.classList.add("babiaxraycasterclass")

            //Prepare legend
            if (data.legend) {
                showLegend(data, bubbleEntity, bubble, element)
            }

            chart_entity.appendChild(bubbleEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict, palette, widthBubbles)
            showZAxis(element, maxZ, zaxis_dict, palette, widthBubbles)
            showYAxis(element, maxY, scale, proportion, valueMax, widthBubbles)
        }

        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }
}


function generateBubble(radius, height, width, colorid, palette, positionX, positionZ, animation, scale, proportion, radius_scale) {
    let color = getColor(colorid, palette)
    console.log("Generating bubble...")
    if (scale) {
        height = height / scale
        radius = radius / scale
    } else if (proportion || radius_scale) {
        if (proportion) {
            height = proportion * height
        }
        if (radius_scale) {
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
        entity.setAttribute('animation__position', {
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

function getColor(colorid, palette) {
    let color
    for (let i in colors) {
        if (colors[i][palette]) {
            color = colors[i][palette][colorid % 4]
        }
    }
    return color
}

function generateLegend(data, bubble, bubbleEntity) {
    let text = bubble[data.x_axis] + ': \n Radius:' + bubble[data.radius] + '\nHeight:' + bubble[data.height];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let bubblePosition = bubbleEntity.getAttribute('position')
    let bubbleRadius = parseFloat(bubbleEntity.getAttribute('radius'))
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', {
        x: bubblePosition.x, y: bubblePosition.y + bubbleRadius + 1,
        z: bubblePosition.z + 0.1
    });
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

function showLegend(data, bubbleEntity, bubble, element) {
    bubbleEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data, bubble, bubbleEntity);
        element.appendChild(legend);
    });

    bubbleEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bubbles_printed, palette, widthBubbles) {
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
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBubbles - 3.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bubbles_printed, palette, widthBubbles) {
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
        key.setAttribute('position', { x: -widthBubbles - 5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}


function showYAxis(parent, yEnd, scale, proportion, valueMax, widthBubbles) {
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

    if (proportion) {
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    }
    for (let i = 0; i <= yLimit; i++) {
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod - 1)
        if (!proportion || (proportion && i % pow === 0)) {
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale) {
                key.setAttribute('text', { 'value': value * scale })
                key.setAttribute('position', { x: -widthBubbles - 5.2, y: value, z: -(widthBubbles / 2 + widthBubbles / 4) })
            } else if (proportion) {
                key.setAttribute('position', { x: -widthBubbles - 5.2, y: i * proportion, z: -(widthBubbles / 2 + widthBubbles / 4) })
            } else {
                key.setAttribute('position', { x: -widthBubbles - 5.2, y: i, z: -(widthBubbles / 2 + widthBubbles / 4) })
            }
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showTitle(title, font, color, position) {
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry', {
        value: title,
    });
    if (font) {
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color) {
        entity.setAttribute('material', {
            color: color
        })
    }
    var position = position.split(" ")
    entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
    { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
    { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
    { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
    { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
    { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
    { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
    { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
    { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * CodeCity component for A-Frame.
 */
AFRAME.registerComponent('babiaxr-city', {
    schema: {
        from: { type: 'string' },
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
            type: 'string'
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
        // Titles on top of the buildings when hovering
        titles: {
            type: 'boolean',
            default: true
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
        time_evolution_animation: {
            type: 'boolean',
            default: true
        },
        time_evolution_color: {
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
    init: function () { },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
        let data = this.data;
        let el = this.el;
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            // Get from the json or embedded
            let rawData
            if (typeof data.data == 'string') {
                if (data.data.endsWith('json')) {
                    rawData = requestJSONDataFromURL(data);
                } else {
                    rawData = parseEmbeddedJSONData(data.data)
                }
            } else {
                rawData = data.data;
            };
            // And save it            
            self.babiaData = rawData
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Create city
            self.chart = generateCity(self, rawData)

        } else {

            if (data.from !== oldData.from) {
                // Unregister for old treegenerator
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Register for the new one
                findTreeGenerator(data, el, self)

                // Attach to the event of the querier
                el.addEventListener('babiaTreeDataReady', function (e) {
                    // Get the data from the info of the event (propertyName)
                    self.querierDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.querierDataPropertyName]
                    self.babiaData = rawData[0]
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }

                    // Create city
                    self.chart = generateCity(self, rawData[0])

                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)
                });

                // Register to the querier
                self.dataComponent.register(el)
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating city...")
                self.chart = generateCity(self, self.babiaData)

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
            }
        }

        return



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
    play: function () { },

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * List of visualization properties
     */
    visProperties: ['fheight', 'farea'],
});

let generateCity = (self, raw_items) => {
    self.loader = new THREE.FileLoader();
    let data = self.data;
    let el = self.el;
    currentColor = data.building_color;
    let rootCodecityEntity = el;

    el.emit('babiaxr-dataLoaded', { data: raw_items, codecity: true })

    deltaTimeEvolution = data.time_evolution_delta

    self.zone_data = raw_items;
    let zone = new Zone({
        data: self.zone_data,
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
    let relative = false;
    let canvas = new Rectangle({ width: width, depth: depth, x: 0, z: 0 });
    zone.add_rects({ rect: canvas, split: data.split, relative: relative });
    let base = document.createElement('a-entity');
    self.base = base;
    let visible = true;

    zone.draw_rects({
        ground: canvas, el: base, base: data.base,
        level: 0, elevation: 0, relative: relative,
        base_thick: data.base_thick,
        wireframe: data.wireframe,
        building_color: data.building_color, base_color: data.base_color,
        model: data.building_model, visible: visible,
        titles: data.titles, rootCodecityEntity: rootCodecityEntity
    });
    el.appendChild(base);

    // Time Evolution starts
    /*if (time_evolution) {
        time_evolution_past_present = data.time_evolution_past_present
        time_evolution_animation = data.time_evolution_animation
        time_evolution_color = data.time_evolution_color
        dateBar(data)
        time_evol()
    }*/

}

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
        visible = true, titles = true, rootCodecityEntity }) {
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
                id: area.data['id'],
                rawarea: 0
            });

            // Titles on quarters
            if (titles) {
                let legend;
                let transparentBox;
                base.addEventListener('click', function () {
                    if (legend) {
                        rootCodecityEntity.removeChild(transparentBox)
                        rootCodecityEntity.removeChild(legend)
                        legend = undefined
                        transparentBox = undefined
                    } else {
                        transparentBox = document.createElement('a-entity');
                        let oldGeometry = base.getAttribute('geometry')
                        let boxPosition = base.getAttribute("position")
                        transparentBox.setAttribute('geometry', {
                            height: oldGeometry.height + 10,
                            depth: oldGeometry.depth,
                            width: oldGeometry.width
                        });
                        transparentBox.setAttribute('position', boxPosition)
                        transparentBox.setAttribute('material', {
                            'visible': true,
                            'opacity': 0.4
                        });
                        legend = generateLegend(this.getAttribute("id"), oldGeometry.height + 10, boxPosition, null, rootCodecityEntity);
                        rootCodecityEntity.appendChild(legend)
                        rootCodecityEntity.appendChild(transparentBox)
                    }
                })

            }

            base.setAttribute('class', 'babiaxraycasterclass');
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
                    visible: visible, titles: titles, rootCodecityEntity: rootCodecityEntity
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
                id: area.data['id'],
                rawarea: area.data[this.farea],
                inner_real: true
            });
            box.setAttribute('class', 'babiaxraycasterclass');
            el.appendChild(box);

            // Titles
            if (titles) {
                let legend;
                let legendBox;
                let alreadyActive = false;
                box.addEventListener('click', function () {
                    if (alreadyActive) {
                        rootCodecityEntity.removeChild(legend)
                        rootCodecityEntity.removeChild(legendBox)
                        legend = undefined
                        legendBox = undefined
                        alreadyActive = false
                    } else {
                        alreadyActive = true
                    }

                })

                box.addEventListener('mouseenter', function () {
                    if (!alreadyActive) {
                        legendBox = document.createElement('a-entity');
                        let oldGeometry = box.getAttribute('geometry')
                        let boxPosition = box.getAttribute("position")
                        legendBox.setAttribute('position', boxPosition)
                        legendBox.setAttribute('material', {
                            'visible': true
                        });
                        legendBox.setAttribute('geometry', {
                            height: oldGeometry.height + 0.1,
                            depth: oldGeometry.depth + 0.1,
                            width: oldGeometry.width + 0.1
                        });
                        legend = generateLegend(this.getAttribute("id"), oldGeometry.height + 0.1, boxPosition, null, rootCodecityEntity);
                        rootCodecityEntity.appendChild(legend)
                        rootCodecityEntity.appendChild(legendBox)
                    }
                })

                box.addEventListener('mouseleave', function () {
                    if (!alreadyActive && legend) {
                        rootCodecityEntity.removeChild(legend)
                        rootCodecityEntity.removeChild(legendBox)
                        legend = undefined
                        legendBox = undefined
                    }
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
        wireframe = false, visible = true, id = "", rawarea = 0, inner_real = false }) {
        let depth, width;
        if (inner_real) {
            [depth, width] = [this.idepth_real, this.iwidth_real];
        } else if (inner) {
            [depth, width] = [this.idepth, this.iwidth];
        } else {
            [depth, width] = [this.depth, this.width];
        };
        let box = document.createElement('a-entity');
        box.setAttribute('geometry', {
            primitive: 'box',
            skipCache: true,
            depth: depth,
            width: width,
            height: height,
        });

        box.setAttribute('material', { 'color': color });

        box.setAttribute('position', {
            x: this.x,
            y: elevation + height / 2,
            z: this.z
        });
        box.setAttribute('id', id);
        box.setAttribute('babiaxr-rawarea', rawarea);
        return box;
    }

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
                commit: main_json.data_files[i].commit_sha,
                data: i
            })
        }

        // Navbar if defined
        if (data.ui_navbar) {
            if (data.time_evolution_past_present) {
                last_uinavbar = parseInt(data.time_evolution_init.split("_")[1])
            } else {
                last_uinavbar = main_json.data_files.length - 1
            }
            ui_navbar = data.ui_navbar
            document.getElementById(ui_navbar).setAttribute("babiaxr-navigation-bar", "commits", JSON.stringify(navbarData.reverse()))
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
let time_evolution_animation = true
let time_evolution_color = false
let time_evolution_commit_by_commit = false
let ui_navbar = undefined
let last_uinavbar = undefined
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

// TODO: legend scale fix
let countDecimals = function (value) {
    if(Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0; 
}


/**
 * This function generate a plane at the top of the building with the desired text
 */
let generateLegend = (text, heightItem, boxPosition, model, rootCodecityEntity) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height = heightItem

    let entity = document.createElement('a-plane');

    entity.setAttribute('look-at', "[camera]")
    entity.setAttribute('position', { x: boxPosition.x, y: boxPosition.y + height / 2 + 1, z: boxPosition.z });
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

    // Check scale
    let scaleParent = rootCodecityEntity.getAttribute("scale")
    if (scaleParent && (scaleParent.x !== scaleParent.y || scaleParent.x !== scaleParent.z)) {
        let scalefixes = Math.max(...[countDecimals(scaleParent.x), countDecimals(scaleParent.y), countDecimals(scaleParent.z)]) - 1
        let multiplyer = Math.pow(10, scalefixes)
        entity.setAttribute('scale', { x: (1 / scaleParent.x)/multiplyer, y: (1 / scaleParent.y)/multiplyer, z: (1 / scaleParent.z)/multiplyer });

    }

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
            showLegendUiNavBar(maxFiles - index - 1)
            last_uinavbar = maxFiles - index - 1
            i--
            index--

            changeCity()
        })
        document.addEventListener('babiaxrSkipPrev', function () {
            time_evolution_past_present = true
            clearInterval(timeEvolTimeout)
            showLegendUiNavBar(maxFiles - index - 3)
            last_uinavbar = maxFiles - index - 3
            i++
            index++
            changeCity()
        })
        document.addEventListener('babiaxrShow', function (event) {
            clearInterval(timeEvolTimeout)
            eventData = event.detail.data
            i = eventData.data
            showLegendUiNavBar(maxFiles - i - 1)
            last_uinavbar = maxFiles - i - 1
            index = i - 1
            changeCity(true)
        })

    }
    let loop = () => {
        timeEvolTimeout = setTimeout(function () {

            if (ui_navbar) {
                showLegendUiNavBar(maxFiles - index - 2)
            }
            last_uinavbar = maxFiles - index - 2

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

let changeCity = (bigStepCommitByCommit) => {
    let key = "data_" + (index + 1)

    //key2 only for commit by commit analysis
    let key2
    if (bigStepCommitByCommit) {
        key2 = "data_" + (index + 1) + "_allfiles"
    } else {
        if (time_evolution_past_present) {
            key2 = "data_reverse_" + (index + 1)
        } else {
            key2 = "data_" + (index + 1)
        }
    }


    // Change Date
    let text = "Date: " + new Date(timeEvolutionItems[key].date * 1000).toLocaleDateString()
    if (timeEvolutionItems[key].commit_sha) {
        text += "\n\nCommit: " + timeEvolutionItems[key].commit_sha
    }
    dateBarEntity.setAttribute('text-geometry', 'value', text)

    changedItems = []

    // Change color by date
    if (time_evolution_color) {
        // Change color
        currentColorPercentage += 5
        if (currentColorPercentage !== 80) {
            currentColor = getNewBrightnessColor(currentColor, currentColorPercentage)
        } else {
            colorEvolutionArrayStartingPoint++
            if (colorEvolutionArrayStartingPoint > colorEvolutionArray.length - 1) {
                colorEvolutionArrayStartingPoint = 0
            }
            currentColor = colorEvolutionArray[colorEvolutionArrayStartingPoint]
            currentColorPercentage = 20
        }
    }

    // Check if commit by commit or time snapshots (time snapshots = same key)
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
                // Put it to opacity 0.3 and black color
                dissapearBuildingAnimation(item.id)
            }
        })
    }
    updateCity()
}

let currentColorPercentage = 20
let currentColor
let colorEvolutionArray = ["#000066", "#006600", "#666600", "#660000"]
let colorEvolutionArrayStartingPoint = 0

let changeBuildingLayout = (item) => {
    if (document.getElementById(item.id) != undefined && item.area != 0.0) {
        // Add to changed items
        changedItems.push(item.id)

        // Get old data in order to do the math
        let prevPos = document.getElementById(item.id).getAttribute("position")
        let oldX = document.getElementById(item.id).getAttribute("position").x
        let oldY = document.getElementById(item.id).getAttribute("position").y
        let oldZ = document.getElementById(item.id).getAttribute("position").z
        let prevWidth = document.getElementById(item.id).getAttribute("geometry").width
        let prevDepth = document.getElementById(item.id).getAttribute("geometry").depth
        let prevHeight = document.getElementById(item.id).getAttribute("geometry").height
        let oldRawArea = parseFloat(document.getElementById(item.id).getAttribute("babiaxr-rawarea"))

        if (prevHeight.toFixed(6) !== item.height.toFixed(6) || oldRawArea.toFixed(6) !== item.area.toFixed(6)) {
            //Change color
            if (time_evolution_color) { document.getElementById(item.id).setAttribute('material', { 'color': currentColor }); }

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

            if (time_evolution_animation) {
                // Change area with animation
                let duration = 500
                if (newWidth > prevWidth || newDepth > prevDepth) {
                    let incrementWidth = 20 * (newWidth - prevWidth) / duration
                    let incrementDepth = 20 * (newDepth - prevDepth) / duration
                    let sizeWidth = prevWidth
                    let sizeDepth = prevDepth
                    let idIncA = setInterval(function () { animationAreaIncrease() }, 1);
                    function animationAreaIncrease() {
                        if (sizeWidth >= newWidth || sizeDepth >= newDepth) {
                            document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                            clearInterval(idIncA);
                        } else {
                            sizeWidth += incrementWidth;
                            sizeDepth += incrementDepth
                            document.getElementById(item.id).setAttribute("geometry", "width", sizeWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", sizeDepth)
                        }
                    }
                } else if (newWidth < prevWidth || newDepth < prevDepth) {
                    let incrementWidth = 20 * (prevWidth - newWidth) / duration
                    let incrementDepth = 20 * (prevDepth - newDepth) / duration
                    let sizeWidth = prevWidth
                    let sizeDepth = prevDepth
                    let idDecA = setInterval(function () { animationAreaDecrease() }, 1);
                    function animationAreaDecrease() {
                        if (sizeWidth <= newWidth || sizeDepth <= newDepth) {
                            document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                            clearInterval(idDecA);
                        } else {
                            sizeWidth -= incrementWidth;
                            sizeDepth -= incrementDepth
                            document.getElementById(item.id).setAttribute("geometry", "width", sizeWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", sizeDepth)
                        }
                    }
                }

                // Change height with animation
                if (item.height < 0) {
                    // Has to dissapear
                    dissapearBuildingAnimation(item.id)
                } else if (item.height > prevHeight) {
                    let increment = 20 * (item.height - prevHeight) / duration
                    let size = prevHeight
                    let idIncH = setInterval(function () { animationHeightIncrease() }, 1);
                    function animationHeightIncrease() {
                        if (size >= item.height) {
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (item.height / 2), z: oldZ })
                            clearInterval(idIncH);
                        } else {
                            size += increment;
                            document.getElementById(item.id).setAttribute("geometry", 'height', size);
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (size / 2), z: oldZ })
                        }
                    }
                } else if (item.height < prevHeight) {
                    let increment = 20 * (prevHeight - item.height) / duration
                    let size = prevHeight
                    let idDecH = setInterval(function () { animationHeightDecrease() }, 1);
                    function animationHeightDecrease() {
                        if (size <= item.height) {
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (item.height / 2), z: oldZ })
                            clearInterval(idDecH);
                        } else {
                            size -= increment;
                            document.getElementById(item.id).setAttribute("geometry", 'height', size);
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (size / 2), z: oldZ })
                        }
                    }
                }
            } else {
                document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                document.getElementById(item.id).setAttribute("geometry", "height", item.height)
                document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (item.height / 2), z: prevPos.z })
            }
        }
    }
}

let dissapearBuildingAnimation = (itemId) => {
    // Put it to opacity 0.3 and black color
    let oldColor = document.getElementById(itemId).getAttribute('material').color
    document.getElementById(itemId).setAttribute('material', { 'color': 'black' });
    document.getElementById(itemId).setAttribute('material', { 'opacity': '0.3' });
    let dissapearId = setInterval(function () { dissapearBuilding() }, 1000);
    function dissapearBuilding() {
        let prevPos = document.getElementById(itemId).getAttribute("position")
        let prevHeight = document.getElementById(itemId).getAttribute("geometry").height
        document.getElementById(itemId).setAttribute("geometry", "height", -0.1)
        document.getElementById(itemId).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (-0.1 / 2), z: prevPos.z })
        document.getElementById(itemId).setAttribute('material', { 'color': oldColor });
        document.getElementById(itemId).setAttribute('material', { 'opacity': '1.0' });
        clearInterval(dissapearId);
    }
}

let updateCity = () => {
    console.log("Changing city")
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

let showLegendUiNavBar = (i) => {
    let entities = document.getElementsByClassName('babiaxrTimeBar')[0].children
    if (last_uinavbar || last_uinavbar == 0) {
        let pointToHide = entities[last_uinavbar]
        pointToHide.emit('removeinfo')
    }
    let pointToShow = entities[i]
    pointToShow.emit('showinfo')
}

function getNewBrightnessColor(rgbcode, brightness) {
    let r = parseInt(rgbcode.slice(1, 3), 16),
        g = parseInt(rgbcode.slice(3, 5), 16),
        b = parseInt(rgbcode.slice(5, 7), 16),
        HSL = rgbToHsl(r, g, b),
        RGB;

    RGB = hslToRgb(HSL[0], HSL[1], brightness / 100);
    rgbcode = '#'
        + convertToTwoDigitHexCodeFromDecimal(RGB[0])
        + convertToTwoDigitHexCodeFromDecimal(RGB[1])
        + convertToTwoDigitHexCodeFromDecimal(RGB[2]);

    return rgbcode;
}

function convertToTwoDigitHexCodeFromDecimal(decimal) {
    let code = Math.round(decimal).toString(16);

    (code.length > 1) || (code = '0' + code);
    return code;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

let parseEmbeddedJSONData = (embedded) => {
    let dataRetrieved = JSON.parse(embedded)
    return dataRetrieved
}


let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

let findTreeGenerator = (data, el, self) => {
    if (data.from) {
        // Save the reference to the querier
        let querierElement = document.getElementById(data.from)
        if (querierElement.components['babiaxr-treegenerator']) {
            self.dataComponent = querierElement.components['babiaxr-treegenerator']
        } else {
            console.error("Problem registering to the treegenerator")
            return
        }
    } else {
        // Look for a querier in the same element and register
        if (el.components['babiaxr-treegenerator']) {
            self.dataComponent = el.components['babiaxr-treegenerator']
        } else {
            // Look for a querier in the scene
            if (document.querySelectorAll("[babiaxr-treegenerator]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-treegenerator]")[0].components['babiaxr-treegenerator']
            } else {
                console.error("Error, treegenerator not found")
                return
            }
        }
    }
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let rootCodecityEntity

/**
 * CodeCity component for A-Frame.
 */
AFRAME.registerComponent('babiaxr-codecity', {
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
        // Titles on top of the buildings when hovering
        titles: {
            type: 'boolean',
            default: true
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
        time_evolution_animation: {
            type: 'boolean',
            default: true
        },
        time_evolution_color: {
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
    init: function () { },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
        this.loader = new THREE.FileLoader();
        let data = this.data;
        let el = this.el;
        currentColor = data.building_color;
        rootCodecityEntity = el;

        if (typeof data.data == 'string') {
            if (data.data.endsWith('json')) {
                raw_items = requestJSONDataFromURL(data);
            } else {
                raw_items = JSON.parse(data.data);
            }
        } else {
            raw_items = data.data;
        };

        el.emit('babiaxr-dataLoaded', { data: raw_items, codecity: true })

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
        let relative = false;
        let canvas = new Rectangle({ width: width, depth: depth, x: 0, z: 0 });
        zone.add_rects({ rect: canvas, split: data.split, relative: relative });
        let base = document.createElement('a-entity');
        this.base = base;
        let visible = true;

        zone.draw_rects({
            ground: canvas, el: base, base: data.base,
            level: 0, elevation: 0, relative: relative,
            base_thick: data.base_thick,
            wireframe: data.wireframe,
            building_color: data.building_color, base_color: data.base_color,
            model: data.building_model, visible: visible,
            titles: data.titles
        });
        el.appendChild(base);

        // Time Evolution starts
        if (time_evolution) {
            time_evolution_past_present = data.time_evolution_past_present
            time_evolution_animation = data.time_evolution_animation
            time_evolution_color = data.time_evolution_color
            dateBar(data)
            time_evol()
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
    // pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }

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
        visible = true, titles = true }) {
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
                id: area.data['id'],
                rawarea: 0
            });

            // Titles on quarters
            if (titles) {
                let legend;
                let transparentBox;
                base.addEventListener('click', function () {
                    if (legend) {
                        rootCodecityEntity.removeChild(transparentBox)
                        rootCodecityEntity.removeChild(legend)
                        legend = undefined
                        transparentBox = undefined
                    } else {
                        transparentBox = document.createElement('a-entity');
                        let oldGeometry = base.getAttribute('geometry')
                        let boxPosition = base.getAttribute("position")
                        transparentBox.setAttribute('geometry', {
                            height: oldGeometry.height + 10,
                            depth: oldGeometry.depth,
                            width: oldGeometry.width
                        });
                        transparentBox.setAttribute('position', boxPosition)
                        transparentBox.setAttribute('material', {
                            'visible': true,
                            'opacity': 0.4
                        });
                        legend = generateLegend(this.getAttribute("id"), oldGeometry.height + 10, boxPosition, null, rootCodecityEntity);
                        rootCodecityEntity.appendChild(legend)
                        rootCodecityEntity.appendChild(transparentBox)
                    }
                })

            }

            base.setAttribute('class', 'babiaxraycasterclass');
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
                    visible: visible, titles: titles
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
                id: area.data['id'],
                rawarea: area.data[this.farea],
                inner_real: true
            });
            box.setAttribute('class', 'babiaxraycasterclass');
            el.appendChild(box);

            // Titles
            if (titles) {
                let legend;
                let legendBox;
                let alreadyActive = false;
                box.addEventListener('click', function () {
                    if (alreadyActive) {
                        rootCodecityEntity.removeChild(legend)
                        rootCodecityEntity.removeChild(legendBox)
                        legend = undefined
                        legendBox = undefined
                        alreadyActive = false
                    } else {
                        alreadyActive = true
                    }

                })

                box.addEventListener('mouseenter', function () {
                    if (!alreadyActive) {
                        legendBox = document.createElement('a-entity');
                        let oldGeometry = box.getAttribute('geometry')
                        let boxPosition = box.getAttribute("position")
                        legendBox.setAttribute('position', boxPosition)
                        legendBox.setAttribute('material', {
                            'visible': true
                        });
                        legendBox.setAttribute('geometry', {
                            height: oldGeometry.height + 0.1,
                            depth: oldGeometry.depth + 0.1,
                            width: oldGeometry.width + 0.1
                        });
                        legend = generateLegend(this.getAttribute("id"), oldGeometry.height + 0.1, boxPosition, null, rootCodecityEntity);
                        rootCodecityEntity.appendChild(legend)
                        rootCodecityEntity.appendChild(legendBox)
                    }
                })

                box.addEventListener('mouseleave', function () {
                    if (!alreadyActive && legend) {
                        rootCodecityEntity.removeChild(legend)
                        rootCodecityEntity.removeChild(legendBox)
                        legend = undefined
                        legendBox = undefined
                    }
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
        wireframe = false, visible = true, id = "", rawarea = 0, inner_real = false }) {
        let depth, width;
        if (inner_real) {
            [depth, width] = [this.idepth_real, this.iwidth_real];
        } else if (inner) {
            [depth, width] = [this.idepth, this.iwidth];
        } else {
            [depth, width] = [this.depth, this.width];
        };
        let box = document.createElement('a-entity');
        box.setAttribute('geometry', {
            primitive: 'box',
            skipCache: true,
            depth: depth,
            width: width,
            height: height,
        });

        box.setAttribute('material', { 'color': color });

        box.setAttribute('position', {
            x: this.x,
            y: elevation + height / 2,
            z: this.z
        });
        box.setAttribute('id', id);
        box.setAttribute('babiaxr-rawarea', rawarea);
        return box;
    }

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
                commit: main_json.data_files[i].commit_sha,
                data: i
            })
        }

        // Navbar if defined
        if (data.ui_navbar) {
            if (data.time_evolution_past_present) {
                last_uinavbar = parseInt(data.time_evolution_init.split("_")[1])
            } else {
                last_uinavbar = main_json.data_files.length - 1
            }
            ui_navbar = data.ui_navbar
            document.getElementById(ui_navbar).setAttribute("babiaxr-navigation-bar", "commits", JSON.stringify(navbarData.reverse()))
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
let time_evolution_animation = true
let time_evolution_color = false
let time_evolution_commit_by_commit = false
let ui_navbar = undefined
let last_uinavbar = undefined
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
let generateLegend = (text, heightItem, boxPosition, model, rootCodecityEntity) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height = heightItem

    let entity = document.createElement('a-plane');

    entity.setAttribute('look-at', "[camera]")
    entity.setAttribute('position', { x: boxPosition.x, y: boxPosition.y + height / 2 + 1, z: boxPosition.z });
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

    // Check scale
    let scaleParent = rootCodecityEntity.getAttribute("scale")
    if (scaleParent && (scaleParent.x !== scaleParent.y || scaleParent.x !== scaleParent.z)) {
        entity.setAttribute('scale', { x: 1 / scaleParent.x, y: 1 / scaleParent.y, z: 1 / scaleParent.z });
    }

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
            showLegendUiNavBar(maxFiles - index - 1)
            last_uinavbar = maxFiles - index - 1
            i--
            index--

            changeCity()
        })
        document.addEventListener('babiaxrSkipPrev', function () {
            time_evolution_past_present = true
            clearInterval(timeEvolTimeout)
            showLegendUiNavBar(maxFiles - index - 3)
            last_uinavbar = maxFiles - index - 3
            i++
            index++
            changeCity()
        })
        document.addEventListener('babiaxrShow', function (event) {
            clearInterval(timeEvolTimeout)
            eventData = event.detail.data
            i = eventData.data
            showLegendUiNavBar(maxFiles - i - 1)
            last_uinavbar = maxFiles - i - 1
            index = i - 1
            changeCity(true)
        })

    }
    let loop = () => {
        timeEvolTimeout = setTimeout(function () {

            if (ui_navbar) {
                showLegendUiNavBar(maxFiles - index - 2)
            }
            last_uinavbar = maxFiles - index - 2

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

let changeCity = (bigStepCommitByCommit) => {
    let key = "data_" + (index + 1)

    //key2 only for commit by commit analysis
    let key2
    if (bigStepCommitByCommit) {
        key2 = "data_" + (index + 1) + "_allfiles"
    } else {
        if (time_evolution_past_present) {
            key2 = "data_reverse_" + (index + 1)
        } else {
            key2 = "data_" + (index + 1)
        }
    }


    // Change Date
    let text = "Date: " + new Date(timeEvolutionItems[key].date * 1000).toLocaleDateString()
    if (timeEvolutionItems[key].commit_sha) {
        text += "\n\nCommit: " + timeEvolutionItems[key].commit_sha
    }
    dateBarEntity.setAttribute('text-geometry', 'value', text)

    changedItems = []

    // Change color by date
    if (time_evolution_color) {
        // Change color
        currentColorPercentage += 5
        if (currentColorPercentage !== 80) {
            currentColor = getNewBrightnessColor(currentColor, currentColorPercentage)
        } else {
            colorEvolutionArrayStartingPoint++
            if (colorEvolutionArrayStartingPoint > colorEvolutionArray.length - 1) {
                colorEvolutionArrayStartingPoint = 0
            }
            currentColor = colorEvolutionArray[colorEvolutionArrayStartingPoint]
            currentColorPercentage = 20
        }
    }

    // Check if commit by commit or time snapshots (time snapshots = same key)
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
                // Put it to opacity 0.3 and black color
                dissapearBuildingAnimation(item.id)
            }
        })
    }
    updateCity()
}

let currentColorPercentage = 20
let currentColor
let colorEvolutionArray = ["#000066", "#006600", "#666600", "#660000"]
let colorEvolutionArrayStartingPoint = 0

let changeBuildingLayout = (item) => {
    if (document.getElementById(item.id) != undefined && item.area != 0.0) {
        // Add to changed items
        changedItems.push(item.id)

        // Get old data in order to do the math
        let prevPos = document.getElementById(item.id).getAttribute("position")
        let oldX = document.getElementById(item.id).getAttribute("position").x
        let oldY = document.getElementById(item.id).getAttribute("position").y
        let oldZ = document.getElementById(item.id).getAttribute("position").z
        let prevWidth = document.getElementById(item.id).getAttribute("geometry").width
        let prevDepth = document.getElementById(item.id).getAttribute("geometry").depth
        let prevHeight = document.getElementById(item.id).getAttribute("geometry").height
        let oldRawArea = parseFloat(document.getElementById(item.id).getAttribute("babiaxr-rawarea"))

        if (prevHeight.toFixed(6) !== item.height.toFixed(6) || oldRawArea.toFixed(6) !== item.area.toFixed(6)) {
            //Change color
            if (time_evolution_color) { document.getElementById(item.id).setAttribute('material', { 'color': currentColor }); }

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

            if (time_evolution_animation) {
                // Change area with animation
                let duration = 500
                if (newWidth > prevWidth || newDepth > prevDepth) {
                    let incrementWidth = 20 * (newWidth - prevWidth) / duration
                    let incrementDepth = 20 * (newDepth - prevDepth) / duration
                    let sizeWidth = prevWidth
                    let sizeDepth = prevDepth
                    let idIncA = setInterval(function () { animationAreaIncrease() }, 1);
                    function animationAreaIncrease() {
                        if (sizeWidth >= newWidth || sizeDepth >= newDepth) {
                            document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                            clearInterval(idIncA);
                        } else {
                            sizeWidth += incrementWidth;
                            sizeDepth += incrementDepth
                            document.getElementById(item.id).setAttribute("geometry", "width", sizeWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", sizeDepth)
                        }
                    }
                } else if (newWidth < prevWidth || newDepth < prevDepth) {
                    let incrementWidth = 20 * (prevWidth - newWidth) / duration
                    let incrementDepth = 20 * (prevDepth - newDepth) / duration
                    let sizeWidth = prevWidth
                    let sizeDepth = prevDepth
                    let idDecA = setInterval(function () { animationAreaDecrease() }, 1);
                    function animationAreaDecrease() {
                        if (sizeWidth <= newWidth || sizeDepth <= newDepth) {
                            document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                            clearInterval(idDecA);
                        } else {
                            sizeWidth -= incrementWidth;
                            sizeDepth -= incrementDepth
                            document.getElementById(item.id).setAttribute("geometry", "width", sizeWidth)
                            document.getElementById(item.id).setAttribute("geometry", "depth", sizeDepth)
                        }
                    }
                }

                // Change height with animation
                if (item.height < 0) {
                    // Has to dissapear
                    dissapearBuildingAnimation(item.id)
                } else if (item.height > prevHeight) {
                    let increment = 20 * (item.height - prevHeight) / duration
                    let size = prevHeight
                    let idIncH = setInterval(function () { animationHeightIncrease() }, 1);
                    function animationHeightIncrease() {
                        if (size >= item.height) {
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (item.height / 2), z: oldZ })
                            clearInterval(idIncH);
                        } else {
                            size += increment;
                            document.getElementById(item.id).setAttribute("geometry", 'height', size);
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (size / 2), z: oldZ })
                        }
                    }
                } else if (item.height < prevHeight) {
                    let increment = 20 * (prevHeight - item.height) / duration
                    let size = prevHeight
                    let idDecH = setInterval(function () { animationHeightDecrease() }, 1);
                    function animationHeightDecrease() {
                        if (size <= item.height) {
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (item.height / 2), z: oldZ })
                            clearInterval(idDecH);
                        } else {
                            size -= increment;
                            document.getElementById(item.id).setAttribute("geometry", 'height', size);
                            document.getElementById(item.id).setAttribute("position", { x: oldX, y: (oldY - prevHeight / 2) + (size / 2), z: oldZ })
                        }
                    }
                }
            } else {
                document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                document.getElementById(item.id).setAttribute("geometry", "height", item.height)
                document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (item.height / 2), z: prevPos.z })
            }
        }
    }
}

let dissapearBuildingAnimation = (itemId) => {
    // Put it to opacity 0.3 and black color
    let oldColor = document.getElementById(itemId).getAttribute('material').color
    document.getElementById(itemId).setAttribute('material', { 'color': 'black' });
    document.getElementById(itemId).setAttribute('material', { 'opacity': '0.3' });
    let dissapearId = setInterval(function () { dissapearBuilding() }, 1000);
    function dissapearBuilding() {
        let prevPos = document.getElementById(itemId).getAttribute("position")
        let prevHeight = document.getElementById(itemId).getAttribute("geometry").height
        document.getElementById(itemId).setAttribute("geometry", "height", -0.1)
        document.getElementById(itemId).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (-0.1 / 2), z: prevPos.z })
        document.getElementById(itemId).setAttribute('material', { 'color': oldColor });
        document.getElementById(itemId).setAttribute('material', { 'opacity': '1.0' });
        clearInterval(dissapearId);
    }
}

let updateCity = () => {
    console.log("Changing city")
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

let showLegendUiNavBar = (i) => {
    let entities = document.getElementsByClassName('babiaxrTimeBar')[0].children
    if (last_uinavbar || last_uinavbar == 0) {
        let pointToHide = entities[last_uinavbar]
        pointToHide.emit('removeinfo')
    }
    let pointToShow = entities[i]
    pointToShow.emit('showinfo')
}

function getNewBrightnessColor(rgbcode, brightness) {
    let r = parseInt(rgbcode.slice(1, 3), 16),
        g = parseInt(rgbcode.slice(3, 5), 16),
        b = parseInt(rgbcode.slice(5, 7), 16),
        HSL = rgbToHsl(r, g, b),
        RGB;

    RGB = hslToRgb(HSL[0], HSL[1], brightness / 100);
    rgbcode = '#'
        + convertToTwoDigitHexCodeFromDecimal(RGB[0])
        + convertToTwoDigitHexCodeFromDecimal(RGB[1])
        + convertToTwoDigitHexCodeFromDecimal(RGB[2]);

    return rgbcode;
}

function convertToTwoDigitHexCodeFromDecimal(decimal) {
    let code = Math.round(decimal).toString(16);

    (code.length > 1) || (code = '0' + code);
    return code;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
}

/***/ }),
/* 17 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-cylinderchart', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    from: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: { type: 'boolean', default: false },
    palette: { type: 'string', default: 'ubuntu' },
    title: { type: 'string' },
    titleFont: { type: 'string' },
    titleColor: { type: 'string' },
    titlePosition: { type: 'string', default: "0 0 0" },
    scale: { type: 'number' },
    heightMax: { type: 'number' },
    radiusMax: { type: 'number' },
  },
      
  /**
   * List of visualization properties
   */
  visProperties: ['height', 'radius', 'x_axis'],

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
    const self = this;
    let el = this.el;
    let data = this.data;


    /**
     * Update or create chart component
     */

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      // From data embedded, save it anyway
      self.babiaData = self.data
      self.babiaMetadata = {
          id: self.babiaMetadata.id++
      }

      while (self.el.firstChild)
        self.el.firstChild.remove();
      console.log("Generating 3Dcylynderchart from data...")
      self.chart = generateCylinderChart(self.data, JSON.parse(self.data.data), self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

      // Dispatch interested events because I updated my visualization
      dataReadyToSend("babiaData", self)

    } else {

      // If changed from, need to re-register to the new data component
      if (data.from !== oldData.from) {
        // Unregister for old querier
        if (self.dataComponent) { self.dataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        let eventName = findDataComponent(data, el, self)
        // If changed to filterdata or to querier
        if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
          el.removeEventListener(self.dataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.dataComponentEventName = eventName

        // Attach to the events of the data component
        el.addEventListener(self.dataComponentEventName, _listener = (e) => {
          attachNewDataEventCallback(self, e)
        });

        // Register for the new one
        self.dataComponent.register(el)
        return
      }

      // If changed whatever, re-print with the current data
      if (data !== oldData && self.babiaData) {
        while (self.el.firstChild)
          self.el.firstChild.remove();
        console.log("Generating Cylinder...")
        self.chart = generateCylinderChart(self.data, self.babiaData, self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

        // Dispatch interested events because I updated my visualization
        dataReadyToSend("babiaData", self)
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

  /**
  * Register function when I'm updated
  */
  register: function (interestedElem) {
    let el = this.el
    this.interestedElements.push(interestedElem)

    // Send the latest version of the data
    if (this.babiaData) {
        dispatchEventOnElement(interestedElem, "babiaData")
    }
  },

  /**
   * Unregister function when I'm updated
   */
  unregister: function (interestedElem) {
    const index = this.interestedElements.indexOf(interestedElem)

    // Remove from the interested elements if still there
    if (index > -1) {
        this.interestedElements.splice(index, 1);
    }
  },

  /**
   * Interested elements when I'm updated
   */
  interestedElements: [],

  /**
  * Querier component target
  */
  dataComponent: undefined,

  /**
   * Property of the querier where the data is saved
   */
  dataComponentDataPropertyName: "babiaData",

  /**
   * Event name to difference between querier and filterdata
   */
  dataComponentEventName: undefined,


  /**
   * Where the data is gonna be stored
   */
  babiaData: undefined,

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /**
   * Proportion of the bars
   */
  proportion: undefined,

  /**
   * Value max
   */
  valueMax: undefined,

  /**
   * Max radius
   */
  maxRadius: undefined,

  /**
   * Max radius
   */
  radius_scale: undefined,

  /**
   * First radius
   */
  firstradius: undefined,
})

let findDataComponent = (data, el, self) => {
  let eventName = "babiaQuerierDataReady"
  if (data.from) {
    // Save the reference to the querier or filterdata
    let dataElement = document.getElementById(data.from)
    if (dataElement.components['babiaxr-filterdata']) {
      self.dataComponent = dataElement.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (dataElement.components['babiaxr-querier_json']) {
      self.dataComponent = dataElement.components['babiaxr-querier_json']
    } else if (dataElement.components['babiaxr-querier_es']) {
      self.dataComponent = dataElement.components['babiaxr-querier_es']
    } else if (dataElement.components['babiaxr-querier_github']) {
      self.dataComponent = dataElement.components['babiaxr-querier_github']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier or filterdata in the same element and register
    if (el.components['babiaxr-filterdata']) {
      self.dataComponent = el.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (el.components['babiaxr-querier_json']) {
      self.dataComponent = el.components['babiaxr-querier_json']
    } else if (el.components['babiaxr-querier_es']) {
      self.dataComponent = el.components['babiaxr-querier_es']
    } else if (el.components['babiaxr-querier_github']) {
      self.dataComponent = el.components['babiaxr-querier_github']
    } else {
      // Look for a querier or filterdata in the scene
      if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
        eventName = "babiaFilterDataReady"
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
      } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
  return eventName
}

let attachNewDataEventCallback = (self, e) => {
  // Get the data from the info of the event (propertyName)
  self.dataComponentDataPropertyName = e.detail
  let rawData = self.dataComponent[self.dataComponentDataPropertyName]

  self.babiaData = rawData
  self.babiaMetadata = {
    id: self.babiaMetadata.id++
  }

  //remove previous chart
  while (self.el.firstChild)
    self.el.firstChild.remove();
  console.log("Generating Cylinder...")
  self.chart = generateCylinderChart(self.data, rawData, self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

  // Dispatch interested events because I updated my visualization
  dataReadyToSend("babiaData", self)
}

let generateCylinderChart = (data, dataRetrieved, element, proportion, valueMax, maxRadius, radius_scale, firstradius) => {
  if (dataRetrieved) {
    const dataToPrint = dataRetrieved
    const palette = data.palette
    const title = data.title
    const font = data.titleFont
    const color = data.titleColor
    const title_position = data.titlePosition
    const scale = data.scale
    const heightMax = data.heightMax
    const radiusMax = data.radiusMax

    let stepMax
    let colorid = 0
    let stepX = 0
    let lastradius = 0
    let axis_dict = []
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    if (scale) {
      maxY = maxY / scale
      maxRadius = maxRadius / scale
    } else if (heightMax || radiusMax) {
      if (heightMax) {
        valueMax = maxY
        proportion = heightMax / maxY
        maxY = heightMax
      }
      if (radiusMax) {
        stepMax = maxRadius
        radius_scale = radiusMax / maxRadius
        maxRadius = radiusMax
      }
    }

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
      let radius = cylinder[data.radius]
      let height = cylinder[data.height]

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
        if (scale) {
          firstradius = radius / scale
        } else if (radiusMax) {
          firstradius = radius * radius_scale
        } else {
          firstradius = radius
        }
      }

      let cylinderEntity = generateCylinder(height, radius, colorid, palette, stepX, animation, scale, proportion, radius_scale)
      chart_entity.appendChild(cylinderEntity);
      cylinderEntity.classList.add("babiaxraycasterclass")

      //Prepare legend
      if (data.legend) {
        showLegend(data, cylinderEntity, cylinder, element, maxRadius)
      }

      //Axis dict
      let cylinder_printed = {
        colorid: colorid,
        posX: stepX,
        key: cylinder[data.x_axis]
      }
      axis_dict.push(cylinder_printed)

      // update lastradius
      if (!scale && !radius_scale) {
        lastradius = radius
      } else {
        if (scale) {
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
      showXAxis(element, stepX + lastradius, axis_dict, palette, maxRadius, firstradius)
      showYAxis(element, maxY, scale, proportion, valueMax, maxRadius, firstradius)
    }

    //Print Title
    let title_3d = showTitle(title, font, color, title_position);
    element.appendChild(title_3d);

  }
}


function generateCylinder(height, radius, colorid, palette, position, animation, scale, proportion, radius_scale) {
  let color = getColor(colorid, palette)
  let entity = document.createElement('a-cylinder');
  if (scale) {
    height = height / scale
    radius = radius / scale
  } else if (proportion || radius_scale) {
    if (proportion) {
      height = proportion * height
    }
    if (radius_scale) {
      radius = radius_scale * radius
    }
  }
  entity.setAttribute('color', color);
  entity.setAttribute('height', 0);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation) {
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

function getColor(colorid, palette) {
  let color
  for (let i in colors) {
    if (colors[i][palette]) {
      color = colors[i][palette][colorid % 4]
    }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette, maxRadius, firstradius) {
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

function showYAxis(parent, yEnd, scale, proportion, valueMax, maxRadius, firstradius) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
    'start': { x: -firstradius, y: 0, z: 0 },
    'end': { x: -firstradius, y: yEnd, z: 0 },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1 });
  axis.appendChild(axis_line)

  if (proportion) {
    yLimit = yLimit / proportion
    var mod = Math.floor(Math.log10(valueMax))
  }
  for (let i = 0; i <= yLimit; i++) {
    let key = document.createElement('a-entity');
    let value = i
    let pow = Math.pow(10, mod - 1)
    if (!proportion || (proportion && i % pow === 0)) {
      key.setAttribute('text', {
        'value': value,
        'align': 'right',
        'width': 10,
        'color': 'white '
      });
      if (scale) {
        key.setAttribute('text', { 'value': value * scale })
        key.setAttribute('position', { x: -maxRadius - 5.2, y: value, z: maxRadius + 1 })
      } else if (proportion) {
        key.setAttribute('position', { x: -maxRadius - 5.2, y: i * proportion, z: maxRadius + 1 })
      } else {
        key.setAttribute('position', { x: -maxRadius - 5.2, y: i, z: maxRadius + 1 })
      }
    }
    axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showLegend(data, cylinderEntity, cylinder, element, maxRadius) {
  cylinderEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    legend = generateLegend(data, cylinder, cylinderEntity, maxRadius);
    element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    element.removeChild(legend);
  });
}

function generateLegend(data, cylinder, cylinderEntity, maxRadius) {
  let text = cylinder[data.x_axis] + ': ' + cylinder[data.height];
  let width = 5;
  if (text.length > 16)
    width = text.length / 2;

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {
    x: cylinderPosition.x, y: 2 * cylinderPosition.y + 2,
    z: cylinderPosition.z + maxRadius + 0.5
  });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '1.5');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
    'value': cylinder[data.x_axis] + ': ' + cylinder[data.height],
    'align': 'center',
    'width': 20,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showTitle(title, font, color, position) {
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry', {
    value: title,
  });
  if (font) {
    entity.setAttribute('text-geometry', {
      font: font,
    })
  }
  if (color) {
    entity.setAttribute('material', {
      color: color
    })
  }
  var position = position.split(" ")
  entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
  entity.classList.add("babiaxrTitle")
  return entity;
}

let colors = [
  { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
  { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
  { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
  { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
  { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
  { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
  { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
  { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
  { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 18 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-doughnutchart', {
    schema: {
        data: { type: 'string' },
        size: { type: 'string', default: 'size' },
        key: { type: 'string', default: 'key' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        animation: { type: 'boolean', default: false },
    },
        
    /**
     * List of visualization properties
     */
    visProperties: ['size', 'key'],

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
        let self = this;
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */

        if (data.data && oldData.data !== data.data) {
            // From data embedded, save it anyway
            self.babiaData = self.data
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            while (self.el.firstChild)
                self.el.firstChild.remove();
            console.log("Generating 3Dcylynderchart from data...")
            self.chart = generateDoughnut(self.data, JSON.parse(self.data.data), self.el, self.total_duration, self.slice_array)
            self.loaded = true

            // Dispatch interested events because I updated my visualization
            dataReadyToSend("babiaData", self)

        } else {

            // If changed from, need to re-register to the new data component
            if (data.from !== oldData.from) {
                // Unregister for old querier
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    self.slice_array = []
                    attachNewDataEventCallback(self, e)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating Cylinder...")
                self.slice_array = []
                self.chart = generateDoughnut(self.data, self.babiaData, self.el, self.total_duration, self.slice_array)
                self.loaded = true

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
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
    tick: function (t, delta) {
        let self = this;
        if (self.data.animation && self.loaded) {
            let elements = document.getElementsByClassName('babiaxrChart')[0].children
            for (let slice in self.slice_array) {
                let delay = self.slice_array[slice].delay
                let max_arc = self.slice_array[slice].arc
                let arc = parseFloat(elements[slice].getAttribute('arc'))
                if ((t >= delay) && (arc < max_arc)) {
                    arc += 360 * delta / self.total_duration
                    if (arc > max_arc) {
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

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
     * Loaded, for animation
     */
    loaded: false,

    /**
     * Slice array
     */
    slice_array: [],

    /**
     * Duration of the animation
     */
    total_duration: 4000,

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.babiaData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    //remove previous chart
    while (self.el.firstChild)
        self.el.firstChild.remove();
    console.log("Generating Cylinder...")
    self.chart = generateDoughnut(self.data, rawData, self.el, self.total_duration, self.slice_array)
    self.loaded = true

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)
}

let generateDoughnut = (data, dataRetrieved, element, total_duration, slice_array) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        let animation = data.animation

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice[data.size];
        }

        let degreeStart = 0;
        let degreeEnd = 0;

        let colorid = 0

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')
        chart_entity.setAttribute('rotation', { y: 90 })

        element.appendChild(chart_entity)

        let prev_delay = 0
        for (let slice of dataToPrint) {
            //Calculate degrees
            degreeEnd = 360 * slice[data.size] / totalSize;

            let sliceEntity
            if (animation) {
                let duration_slice = total_duration * degreeEnd / 360
                slice_array.push({
                    arc: degreeEnd,
                    duration: duration_slice,
                    delay: prev_delay
                })
                prev_delay += duration_slice;
                sliceEntity = generateDoughnutSlice(degreeStart, 0.01, 1, colorid, palette);
            } else {
                sliceEntity = generateDoughnutSlice(degreeStart, degreeEnd, 1, colorid, palette);
            }
            sliceEntity.classList.add("babiaxraycasterclass")

            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(data, sliceEntity, slice, element)
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
    entity.setAttribute('rotation', { x: 90, y: 0, z: position_start })
    entity.setAttribute('arc', arc);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    entity.setAttribute('radius-tubular', radius / 4);
    return entity;
}

function getColor(colorid, palette) {
    let color
    for (let i in colors) {
        if (colors[i][palette]) {
            color = colors[i][palette][colorid % 4]
        }
    }
    return color
}

function generateLegend(data, slice) {
    let text = slice[data.key] + ': ' + slice[data.size];

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
        'value': slice[data.key] + ': ' + slice[data.size],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(data, sliceEntity, slice, element) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data, slice);
        element.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position) {
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry', {
        value: title,
    });
    if (font) {
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color) {
        entity.setAttribute('material', {
            color: color
        })
    }
    var position = position.split(" ")
    entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
    entity.setAttribute('rotation', { x: -90, y: 0, z: 0 })
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
    { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
    { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
    { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
    { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
    { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
    { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
    { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
    { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 19 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-island', {
    schema: {
        data: { type: 'asset' },
        from: { type: 'string' },
        border: { type: 'number', default: 0.5 },
        width: { type: 'string', default: 'width' },
        depth: { type: 'string', default: 'depth' },
        area: { type: 'string' },
        height: { type: 'string', default: 'height' },
        building_separation: { type: 'number', default: 0.25 },
        extra: { type: 'number', default: 1.0 },
        levels: { type: 'number' }
    },

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * List of visualization properties
     */
    visProperties: ['height', 'area', 'width', 'depth'],

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
     * 
     */
    duration: 2000,

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;
        let self = this;
        this.figures = [];

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            // Get from the json or embedded
            let rawData
            if (typeof data.data == 'string') {
                if (data.data.endsWith('json')) {
                    rawData = requestJSONDataFromURL(data)
                } else {
                    rawData = parseEmbeddedJSONData(data.data)
                }
            } else {
                rawData = data.data;
            };
            // And save it            
            self.babiaData = rawData
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Create city
            self.chart = self.onDataLoaded(rawData)

        } else {

            if (data.from !== oldData.from) {
                // Unregister for old treegenerator
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Register for the new one
                findTreeGenerator(data, el, self)

                // Attach to the event of the querier
                el.addEventListener('babiaTreeDataReady', function (e) {
                    // Get the data from the info of the event (propertyName)
                    self.querierDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.querierDataPropertyName]
                    self.babiaData = rawData
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }

                    // Create city
                    self.chart = self.onDataLoaded(self.babiaData)

                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)
                });

                // Register to the querier
                self.dataComponent.register(el)
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating city...")
                self.chart = self.onDataLoaded(self.babiaData)

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
            }
        }
        return

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
        if (this.animation) {
            let t = { x: 0, y: 0, z: 0 };
            this.Animation(this.el, this.figures, this.figures_old, delta, t, t);
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

    onDataLoaded: function (items) {
        console.log('Data Loaded.');

        let el = this.el;
        let elements = JSON.parse(JSON.stringify(items))

        // Calculate Increment
        let increment;
        if (this.data.levels) {
            increment = this.data.border * this.data.extra * this.data.levels;
        } else {
            // Find last level
            let levels = getLevels(elements, 0);
            console.log("Levels:" + levels);
            increment = this.data.border * this.data.extra * (levels + 1);
        }

        // Register all figures before drawing
        let t = { x: 0, y: 0, z: 0 };
        [x, y, t, this.figures] = this.generateElements(elements, this.figures, t, increment);

        // Draw figures
        t.x = 0;
        t.z = 0;
        if (!this.figures_old) {
            this.drawElements(el, this.figures, t);
            this.figures_old = this.figures;
        } else {
            console.log("Updating elements...");
            this.animation = true;
            this.start_time = Date.now();
        }
    },

    generateElements: function (elements, figures, translate, inc) {
        var increment = inc;

        // Vertical Limits
        var limit_up = 0;
        var limit_down = 0;
        // Horizontal Limits
        var limit_right = 0;
        var limit_left = 0;

        //Position Figure
        var posX = 0;
        var posY = 0;

        // Aux to update the limits
        // Save max limit to update last limit in the next step
        var max_right = 0;
        var max_left = 0;
        var max_down = 0;
        var max_up = 0;

        // control points
        var current_vertical = 0;
        var current_horizontal = 0;

        // Controllers
        var up = false;
        var down = false;
        var left = false;
        var right = true;

        /**
         * Get each element and set its position respectly
         * Then save all data in figures array
         */
        for (let i = 0; i < elements.length; i++) {
            if (this.data.width){
                elements[i].width = elements[i][this.data.width]
            }
            if (this.data.height){
                elements[i].height = elements[i][this.data.height]
            }
            if (this.data.depth){
                elements[i].depth = elements[i][this.data.depth]
            }
            if (this.data.area){
                elements[i].area = elements[i][this.data.area]
            }   
            if (elements[i].children) {
                //console.log("ENTER to the quarter...")
                this.quarter = true;
                var children = [];
                var translate_matrix;
                // Save Zone's parameters
                elements[i].height = 0.3;
                increment -= this.data.border * this.data.extra;
                [elements[i].width, elements[i].depth, translate_matrix, children] = this.generateElements(elements[i].children, children, translate_matrix, increment);
                translate_matrix.y = elements[i].height;
                increment = inc;
                //console.log("====> CHILDREN:");
                //console.log(children);
                //console.log("EXIT to the quarter... ")
            }
            if (i == 0) {
                if (this.data.area && !elements[i].children) {
                    limit_up += Math.sqrt(elements[i].area) / 2;
                    limit_down -= Math.sqrt(elements[i].area) / 2;
                    limit_right += Math.sqrt(elements[i].area) / 2;
                    limit_left -= Math.sqrt(elements[i].area) / 2;
                } else {
                    limit_up += elements[i].depth / 2;
                    limit_down -= elements[i].depth / 2;
                    limit_right += elements[i].width / 2;
                    limit_left -= elements[i].width / 2;
                }
                //console.log("==== RIGHT SIDE ====");
                current_horizontal = limit_up + this.data.building_separation / 2;
            } else if (elements[i].height > 0) {
                if (up) {
                    [current_vertical, posX, posY, max_up] = this.UpSide(elements[i], limit_up, current_vertical, max_up);
                    if (current_vertical > limit_right) {
                        current_vertical += this.data.building_separation / 2;
                        max_right = current_vertical;
                        up = false;
                        right = true;
                        //console.log("==== RIGHT SIDE ====");
                        if (max_left < limit_left) {
                            limit_left = max_left;
                        }
                        current_horizontal = limit_up + this.data.building_separation / 2;
                    }
                } else if (right) {
                    [current_horizontal, posX, posY, max_right] = this.RightSide(elements[i], limit_right, current_horizontal, max_right);
                    // To pass next step
                    if (current_horizontal < limit_down) {
                        current_horizontal += this.data.building_separation / 2;
                        max_down = current_horizontal;
                        right = false;
                        down = true;
                        //console.log("==== LOWER SIDE ====");
                        if (max_up > limit_up) {
                            limit_up = max_up;
                        }
                        current_vertical = limit_right + this.data.building_separation / 2;
                    }
                } else if (down) {
                    [current_vertical, posX, posY, max_down] = this.DownSide(elements[i], limit_down, current_vertical, max_down);
                    if (current_vertical < limit_left) {
                        current_vertical -= this.data.building_separation / 2;
                        max_left = current_vertical;
                        down = false;
                        left = true;
                        //console.log("==== LEFT SIDE ====");
                        if (max_right > limit_right) {
                            limit_right = max_right;
                        }
                        current_horizontal = limit_down - this.data.building_separation / 2;
                    }
                } else if (left) {
                    [current_horizontal, posX, posY, max_left] = this.LeftSide(elements[i], limit_left, current_horizontal, max_left);
                    if (current_horizontal > limit_up) {
                        current_horizontal -= this.data.building_separation / 2;
                        max_up = current_horizontal;
                        left = false;
                        up = true;
                        //console.log("==== UPPER SIDE ====");
                        if (max_down < limit_down) {
                            limit_down = max_down;
                        }
                        current_vertical = limit_left - this.data.building_separation / 2;
                    }
                }
            }

            // Save information about the figure
            let figure
            if (elements[i].children) {
                figure = {
                    id: "island-" + elements[i].id,
                    posX: posX,
                    posY: posY,
                    width: elements[i].width,
                    height: elements[i].height,
                    depth: elements[i].depth,
                    children: children,
                    translate_matrix: translate_matrix
                }
            } else {
                if (this.data.area) {
                    figure = {
                        id: "island-" + elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: Math.sqrt(elements[i].area),
                        height: elements[i].height,
                        depth: Math.sqrt(elements[i].area)
                    }
                } else {
                    figure = {
                        id: "island-" + elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: elements[i].width,
                        height: elements[i].height,
                        depth: elements[i].depth
                    }
                }
            }
            figures.push(figure);
        }

        // Check and update last limits
        if (max_down < limit_down) {
            limit_down = max_down;
        }
        if (max_left < limit_left) {
            limit_left = max_left;
        }
        if (max_up > limit_up) {
            limit_up = max_up;
        }
        if (max_right > limit_right) {
            limit_right = max_right;
        }

        if (current_vertical < limit_left) {
            limit_left = current_vertical + this.data.building_separation / 2;
        }
        if (current_vertical > limit_right) {
            limit_right = current_vertical - this.data.building_separation / 2;;
        }
        if (current_horizontal > limit_up) {
            limit_up = current_horizontal - this.data.building_separation / 2;;
        }
        if (current_horizontal < limit_down) {
            limit_down = current_horizontal + this.data.building_separation / 2;;
        }

        // Calculate translate of the center, width and depth of the zone
        var width = Math.abs(limit_left) + Math.abs(limit_right);
        var depth = Math.abs(limit_down) + Math.abs(limit_up);

        width += 2 * increment;
        depth += 2 * increment;

        var translate_x = limit_left + width / 2 - increment;
        var translate_z = limit_down + depth / 2 - increment;
        translate = {
            x: translate_x,
            y: 0,
            z: translate_z,
        };

        return [width, depth, translate, figures];
    },

    drawElements: function (element, figures, translate) {
        console.log('Drawing elements....')
        for (let i in figures) {

            let height = figures[i].height;
            let x = figures[i].posX;
            let y = figures[i].posY;
            let position = {
                x: x - translate.x,
                y: (height / 2 + translate.y / 2),
                z: -y + translate.z
            }

            let entity = this.createElement(figures[i], position);

            if (figures[i].children) {
                this.drawElements(entity, figures[i].children, figures[i].translate_matrix);
            } else {
                let legend = generateLegend(entity.id, height, entity.getAttribute('position'), this.el);
                entity.appendChild(legend);

                entity.addEventListener('mouseenter', function () {
                    legend.setAttribute('visible', true);
                });
                entity.addEventListener('mouseleave', function () {
                    legend.setAttribute('visible', false);
                });
            }

            element.appendChild(entity);
        }

    },

    RightSide: function (element, limit_right, current_horizontal, max_right) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area);
            depth = Math.sqrt(element.area) + separation;
        } else {
            width = parseFloat(element.width);
            depth = parseFloat(element.depth) + separation;
        }
        // Calculate position
        let posX = limit_right + (width / 2) + separation;
        let posY = current_horizontal - (depth / 2);

        // Calculate states
        current_horizontal -= depth;
        let total_x = limit_right + width + separation;
        if (total_x > max_right) {
            max_right = total_x;
        }

        return [current_horizontal, posX, posY, max_right];
    },

    DownSide: function (element, limit_down, current_vertical, max_down) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area) + separation;
            depth = Math.sqrt(element.area);
        } else {
            width = parseFloat(element.width) + separation;
            depth = parseFloat(element.depth);
        }
        // Calculate position
        let posX = current_vertical - (width / 2);
        let posY = limit_down - (depth / 2) - separation;

        // Calculate state
        current_vertical -= depth + separation;
        let total_y = limit_down - depth - separation;
        if (total_y < max_down) {
            max_down = total_y;
        }

        return [current_vertical, posX, posY, max_down];
    },

    LeftSide: function (element, limit_left, current_horizontal, max_left) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area);
            depth = Math.sqrt(element.area) + separation;
        } else {
            width = parseFloat(element.width);
            depth = parseFloat(element.depth) + separation;
        }
        // Calculate position
        let posX = limit_left - (width / 2) - separation;
        let posY = current_horizontal + (depth / 2);

        // Calculate state
        current_horizontal += depth;
        let total_x = limit_left - width - separation;
        if (total_x < max_left) {
            max_left = total_x;
        }

        return [current_horizontal, posX, posY, max_left];
    },

    UpSide: function (element, limit_up, current_vertical, max_up) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area) + separation;
            depth = Math.sqrt(element.area);
        } else {
            width = parseFloat(element.width) + separation;
            depth = parseFloat(element.depth);
        }
        // Calculate position
        let posX = current_vertical + (width / 2);
        let posY = limit_up + (depth / 2) + separation;

        // Calculate state
        current_vertical += depth + separation;
        let total_y = limit_up + depth + separation;
        if (total_y > max_up) {
            max_up = total_y;
        }

        return [current_vertical, posX, posY, max_up];
    },

    Animation: function (element, figures, figures_old, delta, translate, translate_old) {
        let new_time = Date.now();
        let entity;
        for (let i in figures) {
            if (document.getElementById(figures[i].id)) {
                entity = document.getElementById(figures[i].id);
                if (figures[i].inserted) {
                    //Increment opacity
                    let opa_inc = delta / this.duration;
                    let opacity = parseFloat(entity.getAttribute('material').opacity);
                    if (opacity + opa_inc < 1) {
                        opacity += opa_inc;
                    } else {
                        opacity = 1.0;
                    }
                    setOpacity(entity, opacity);

                } else {
                    // RESIZE
                    this.resize(entity, new_time, delta, figures[i], figures_old[i]);
                    // TRASLATE
                    this.traslate(entity, new_time, delta, figures[i], figures_old[i], translate, translate_old);

                    if (figures[i].children) {
                        this.Animation(entity, figures[i].children, figures_old[i].children, delta, figures[i].translate_matrix, figures_old[i].translate_matrix);
                    }
                }
            } else {

                position = {
                    x: figures[i].posX - translate.x,
                    y: (figures[i].height / 2 + translate.y / 2),
                    z: -figures[i].posY + translate.z
                }

                let new_entity = this.createElement(figures[i], position);
                if (figures[i].children) {
                    this.drawElements(new_entity, figures[i].children, figures[i].translate_matrix);
                }

                let legend = generateLegend(new_entity.id, figures[i].height, new_entity.getAttribute('position'), this.el);
                new_entity.appendChild(legend);

                new_entity.addEventListener('mouseenter', function () {
                    legend.setAttribute('visible', true);
                });
                new_entity.addEventListener('mouseleave', function () {
                    legend.setAttribute('visible', false);
                });

                //Opacity 0
                setOpacity(new_entity, 0);

                element.appendChild(new_entity);
                figures[i].inserted = true;

            }
        }

        if ((new_time - this.start_time) > this.duration) {
            this.animation = false;
            this.figures_old = this.figures;
        }
    },

    resize: function (entity, new_time, delta, figure, figure_old) {
        if (((new_time - this.start_time) < this.duration) &&
            ((figure.width != figure_old.width) ||
                (figure.height != figure_old.height) ||
                (figure.depth != figure_old.depth))) {

            // Calulate increment
            let diff_width = Math.abs(figure.width - figure_old.width);
            let diff_height = Math.abs(figure.height - figure_old.height);
            let diff_depth = Math.abs(figure.depth - figure_old.depth);

            let inc_width = (delta * diff_width) / this.duration;
            let inc_height = (delta * diff_height) / this.duration;
            let inc_depth = (delta * diff_depth) / this.duration;

            let last_width = parseFloat(entity.getAttribute('width'));
            let last_height = parseFloat(entity.getAttribute('height'));
            let last_depth = parseFloat(entity.getAttribute('depth'));

            let new_width;
            if (figure.width - figure_old.width < 0) {
                new_width = last_width - inc_width;
            } else {
                new_width = last_width + inc_width;
            }

            let new_height;
            if (figure.height - figure_old.height < 0) {
                new_height = last_height - inc_height;
            } else {
                new_height = last_height + inc_height;
            }

            let new_depth;
            if (figure.depth - figure_old.depth < 0) {
                new_depth = last_depth - inc_depth;
            } else {
                new_depth = last_depth + inc_depth;
            }

            // Update size
            entity.setAttribute('width', new_width);
            entity.setAttribute('height', new_height);
            entity.setAttribute('depth', new_depth);

        } else if (((new_time - this.start_time) > this.duration) &&
            ((figure.width != figure_old.width) ||
                (figure.height != figure_old.height) ||
                (figure.depth != figure_old.depth))) {

            entity.setAttribute('width', figure.width);
            entity.setAttribute('height', figure.height);
            entity.setAttribute('depth', figure.depth);
        }
    },

    traslate: function (entity, new_time, delta, figure, figure_old, translate, translate_old) {
        let dist_x = (figure_old.posX - translate_old.x) - (figure.posX - translate.x);
        let dist_y = (figure_old.posY - translate_old.z) - (figure.posY - translate.z);

        if (dist_x != 0 || dist_y != 0) {
            if ((new_time - this.start_time) < this.duration) {
                // Calculate increment positions
                let inc_x = (delta * dist_x) / this.duration;
                let inc_z = (delta * dist_y) / this.duration;

                let last_x = entity.getAttribute('position').x;
                let last_z = entity.getAttribute('position').z;

                let new_x = last_x - inc_x;
                let new_z = last_z + inc_z;

                let new_height = entity.getAttribute('height');

                // Update entity
                entity.setAttribute('position', {
                    x: new_x,
                    y: new_height / 2,
                    z: new_z
                });

            } else if ((new_time - this.start_time) > this.duration) {
                entity.setAttribute('position', {
                    x: figure.posX - translate.x,
                    y: figure.height / 2,
                    z: - figure.posY + translate.z
                });
            }
        }
    },

    createElement: function (figure, position) {
        // create entity
        //let entity = document.createElement('a-entity')
        let entity = document.createElement('a-box');
        entity.id = figure.id;
        entity.setAttribute('class', 'babiaxraycasterclass');

        // Get info 
        let width = figure.width;
        let height = figure.height;
        let depth = figure.depth;

        // set color
        if (figure.children) {
            color = "#98e690";
        } else {
            color = "#E6B9A1";
        }

        // create box
        entity.setAttribute('color', color);
        entity.setAttribute('width', width);
        entity.setAttribute('height', height);
        entity.setAttribute('depth', depth);

        // add into scene
        entity.setAttribute('position', {
            x: position.x,
            y: position.y,
            z: position.z
        });

        return entity;
    }
})

// TODO: legend scale fix
let countDecimals = function (value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0;
}

let generateLegend = (text, heightItem, boxPosition, rootEntity) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height = heightItem

    let entity = document.createElement('a-plane');
    entity.setAttribute('look-at', "[camera]");

    entity.setAttribute('position', { x: boxPosition.x, y: boxPosition.y + height / 2 + 1, z: boxPosition.z });
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
    entity.setAttribute('visible', false);

    //Set Scale
    let scaleParent = rootEntity.getAttribute("scale")
    if (scaleParent && (scaleParent.x !== scaleParent.y || scaleParent.x !== scaleParent.z)) {
        let scalefixes = Math.max(...[countDecimals(scaleParent.x), countDecimals(scaleParent.y), countDecimals(scaleParent.z)]) - 1
        let multiplyer = Math.pow(10, scalefixes)
        entity.setAttribute('scale', { x: (1 / scaleParent.x) / multiplyer, y: (1 / scaleParent.y) / multiplyer, z: (1 / scaleParent.z) / multiplyer });
    }

    return entity;
}

function setOpacity(entity, opacity) {
    entity.setAttribute('material', 'opacity', opacity);
    if (entity.childNodes) {
        for (let i = 0; i < entity.childNodes.length; i++) {
            setOpacity(entity.childNodes[i], opacity);
        }
    }
}

let getLevels = (elements, levels) => {
    let level = levels
    for (let i in elements) {
        if (elements[i].children) {
            level++
            levels = getLevels(elements[i].children, level)
        }
    }
    return levels;
}

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

    return raw_items
}

let findTreeGenerator = (data, el, self) => {
    if (data.from) {
        // Save the reference to the querier
        let querierElement = document.getElementById(data.from)
        if (querierElement.components['babiaxr-treegenerator']) {
            self.dataComponent = querierElement.components['babiaxr-treegenerator']
        } else {
            console.error("Problem registering to the treegenerator")
            return
        }
    } else {
        // Look for a querier in the same element and register
        if (el.components['babiaxr-treegenerator']) {
            self.dataComponent = el.components['babiaxr-treegenerator']
        } else {
            // Look for a querier in the scene
            if (document.querySelectorAll("[babiaxr-treegenerator]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-treegenerator]")[0].components['babiaxr-treegenerator']
            } else {
                console.error("Error, treegenerator not found")
                return
            }
        }
    }
}

let parseEmbeddedJSONData = (embedded) => {
    let dataRetrieved = JSON.parse(embedded)
    return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 20 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-piechart', {
    schema: {
        data: { type: 'string' },
        size: { type: 'string', default: 'size' },
        key: { type: 'string', default: 'key' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        animation: { type: 'boolean', default: false },
    },

    /**
     * List of visualization properties
     */
    visProperties: ['size', 'key'],

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
        let self = this;
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */

        if (data.data && oldData.data !== data.data) {
            // From data embedded, save it anyway
            self.babiaData = self.data
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            while (self.el.firstChild)
                self.el.firstChild.remove();
            console.log("Generating 3Dcylynderchart from data...")
            self.chart = generatePie(self.data, JSON.parse(self.data.data), self.el, self.slice_array, self.total_duration)
            self.loaded = true

            // Dispatch interested events because I updated my visualization
            dataReadyToSend("babiaData", self)

        } else {

            // If changed from, need to re-register to the new data component
            if (data.from !== oldData.from) {
                // Unregister for old querier
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    self.slice_array = []
                    attachNewDataEventCallback(self, e)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating Cylinder...")
                self.slice_array = []
                self.chart = generatePie(self.data, self.babiaData, self.el, self.slice_array, self.total_duration)
                self.loaded = true

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
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
    tick: function (t, delta) {
        let self = this;
        if (self.data.animation && self.loaded) {
            let elements = document.getElementsByClassName('babiaxrChart')[0].children
            for (let slice in self.slice_array) {
                let delay = self.slice_array[slice].delay
                let max_length = self.slice_array[slice].degreeLenght
                let theta_length = parseFloat(elements[slice].getAttribute('theta-length'))
                if ((t >= delay) && (theta_length < max_length)) {
                    theta_length += 360 * delta / self.total_duration
                    if (theta_length > max_length) {
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

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
     * Loaded, for animation
     */
    loaded: false,

    /**
     * Slice array
     */
    slice_array: [],

    /**
     * Duration of the animation
     */
    total_duration: 4000,

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.babiaData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    //remove previous chart
    while (self.el.firstChild)
        self.el.firstChild.remove();
    console.log("Generating Cylinder...")
    self.chart = generatePie(self.data, rawData, self.el, self.slice_array, self.total_duration)
    self.loaded = true

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)
}


let generatePie = (data, dataRetrieved, element, slice_array, total_duration) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        let animation = data.animation

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice[data.size];
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
            degreeEnd = 360 * slice[data.size] / totalSize;

            let sliceEntity
            if (animation) {
                let duration_slice = total_duration * degreeEnd / 360
                slice_array.push({
                    degreeLenght: degreeEnd,
                    duration: duration_slice,
                    delay: prev_delay
                })
                prev_delay += duration_slice;
                sliceEntity = generateSlice(degreeStart, 0.01, 1, colorid, palette);
            } else {
                sliceEntity = generateSlice(degreeStart, degreeEnd, 1, colorid, palette);
            }
            sliceEntity.classList.add("babiaxraycasterclass")

            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(data, sliceEntity, slice, element)
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

function getColor(colorid, palette) {
    let color
    for (let i in colors) {
        if (colors[i][palette]) {
            color = colors[i][palette][colorid % 4]
        }
    }
    return color
}

function generateLegend(data, slice) {
    let text = slice[data.key] + ': ' + slice[data.size];

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
        'value': slice[data.key] + ': ' + slice[data.size],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(data, sliceEntity, slice, element) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data, slice);
        element.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position) {
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry', {
        value: title,
    });
    if (font) {
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color) {
        entity.setAttribute('material', {
            color: color
        })
    }
    var position = position.split(" ")
    entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
    entity.setAttribute('rotation', { x: -90, y: 0, z: 0 })
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
    { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
    { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
    { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
    { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
    { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
    { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
    { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
    { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 21 */
/***/ (function(module, exports) {

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-simplebarchart', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        x_axis: { type: 'string', default: 'x_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean', default: false },
        axis: { type: 'boolean', default: true },
        animation: { type: 'boolean', default: false },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        scale: { type: 'number' },
        heightMax: { type: 'number' },
    },

    /**
     * List of visualization properties
     */
    visProperties: ['height', 'x_axis'],

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        this.time = Date.now();
        this.anime_finished = false
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        let data = this.data;
        let el = this.el;

        this.chart
        this.animation = data.animation
        this.bar_array = []
        /**
         * Update or create chart component
         */

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            // From data embedded, save it anyway
            self.babiaData = self.data
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            while (self.el.firstChild)
                self.el.firstChild.remove();
            console.log("Generating barchart from data...")
            self.chart = generateBarChart(self, self.data, JSON.parse(data.data), el, self.animation, self.chart, self.bar_array, self.widthBars)

            // Dispatch interested events because I updated my visualization
            dataReadyToSend("babiaData", self)

        } else {

            // If changed from, need to re-register to the new data component
            if (data.from !== oldData.from) {
                // Unregister for old querier
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    attachNewDataEventCallback(self, e)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating barchart...")
                self.chart = generateBarChart(self, self.data, self.babiaData, el, self.animation, self.chart, self.bar_array, self.widthBars)

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
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
    tick: function (t, delta) {
        const time_wait = 2000;
        const self = this;
        let new_time = Date.now();
        if (this.animation && !this.anime_finished && this.chart) {
            let elements = this.chart.children;
            let diff_time = new_time - this.time;
            if (diff_time >= time_wait) {
                for (let bar in this.bar_array) {
                    let prev_height = parseFloat(elements[bar].getAttribute('height'));
                    let height_max = this.bar_array[bar].height_max;
                    let pos_x = this.bar_array[bar].position_x;
                    if (prev_height < height_max) {
                        let new_height = ((diff_time - time_wait) * height_max) / self.total_duration;
                        elements[bar].setAttribute('height', new_height);
                        elements[bar].setAttribute('position', { x: pos_x, y: new_height / 2, z: 0 });
                    } else {
                        this.anime_finished = true;
                        elements[bar].setAttribute('height', height_max);
                        elements[bar].setAttribute('position', { x: pos_x, y: height_max / 2, z: 0 });
                        console.log('Total time (wait + animation): ' + diff_time + 'ms')
                    }
                }
            }
        }
    },

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Duration of the animation if activated
     */
    widthBars: 1,

    /**
     * Duration of the animation if activated
     */
    total_duration: 3000,

    /**
     * Proportion of the bars
     */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

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
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.babiaData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Generate chart
    while (self.el.firstChild)
        self.el.firstChild.remove();
    console.log("Generating barchart...")
    self.chart = generateBarChart(self, self.data, rawData, self.el, self.animation, self.chart, self.bar_array, self.widthBars)

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)
}


let generateBarChart = (self, data, dataRetrieved, element, animation, chart, list, widthBars) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
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

        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o[self.data.height]; }))
        if (scale) {
            maxY = maxY / scale
        } else if (heightMax) {
            self.valueMax = maxY
            self.proportion = heightMax / maxY
            maxY = heightMax
        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)


        for (let bar of dataToPrint) {

            let barEntity = generateBar(self, bar[self.data.height], widthBars, colorid, stepX, palette, animation, scale, list);
            barEntity.classList.add("babiaxraycasterclass")

            //Prepare legend
            if (data.legend) {
                showLegend(self, barEntity, bar, element, widthBars)
            }

            //Axis dict
            let bar_printed = {
                colorid: colorid,
                posX: stepX,
                key: bar[self.data.x_axis]
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
            showXAxis(widthBars, element, stepX, axis_dict, palette)
            showYAxis(self.proportion, self.valueMax, widthBars, element, maxY, scale)
        }

        chart = element.children[1]
        return chart;
    }
}


function generateBar(self, height, width, colorid, position, palette, animation, scale, bar_array) {
    let color = getColor(colorid, palette)
    console.log("Generating bar...")
    if (scale) {
        height = height / scale
    } else if (self.proportion) {
        height = self.proportion * height
    }
    let entity = document.createElement('a-box');
    entity.setAttribute('color', color);
    entity.setAttribute('width', width);
    entity.setAttribute('depth', width);
    // Add animation
    if (animation) {
        var increment = height / self.total_duration
        var height_max = height
        bar_array.push({
            increment: increment,
            height_max: height_max,
            position_x: position
        });

        entity.setAttribute('height', 0.001);
        entity.setAttribute('position', { x: position, y: 0, z: 0 });
    } else {
        entity.setAttribute('height', height);
        entity.setAttribute('position', { x: position, y: height / 2, z: 0 });
    }
    return entity;
}

function getColor(colorid, palette) {
    let color
    for (let i in colors) {
        if (colors[i][palette]) {
            color = colors[i][palette][colorid % 4]
        }
    }
    return color
}

function generateLegend(self, bar, barEntity, widthBars) {
    let text = bar[self.data.x_axis] + ': ' + bar[self.data.height];
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;
    let barPosition = barEntity.getAttribute('position')
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', {
        x: barPosition.x, y: 2 * barPosition.y + 1,
        z: barPosition.z + widthBars + 0.1
    });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': bar[self.data.x_axis] + ': ' + bar[self.data.height],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showXAxis(widthBars, parent, xEnd, bars_printed, palette) {
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
        key.setAttribute('position', { x: e.posX, y: 0, z: widthBars + 5.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showYAxis(proportion, valueMax, widthBars, parent, yEnd, scale) {
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
    if (proportion) {
        yLimit = yLimit / proportion
        var mod = Math.floor(Math.log10(valueMax))
    }
    for (let i = 0; i <= yLimit; i++) {
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod - 1)
        if (!proportion || (proportion && i % pow === 0)) {
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale) {
                key.setAttribute('text', { 'value': value * scale })
                key.setAttribute('position', { x: -widthBars - 5.2, y: value, z: widthBars / 2 + widthBars / 4 })
            } else if (proportion) {
                key.setAttribute('position', { x: -widthBars - 5.2, y: i * proportion, z: widthBars / 2 + widthBars / 4 })
            } else {
                key.setAttribute('position', { x: -widthBars - 5.2, y: i, z: widthBars / 2 + widthBars / 4 })
            }
        }
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showLegend(self, barEntity, bar, element, widthBars) {
    barEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(self, bar, barEntity, widthBars);
        element.appendChild(legend);
    });

    barEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}

function showTitle(title, font, color, position) {
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry', {
        value: title,
    });
    if (font) {
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color) {
        entity.setAttribute('material', {
            color: color
        })
    }
    var position = position.split(" ")
    entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.classList.add("babiaxrTitle")
    return entity;
}

let colors = [
    { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
    { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
    { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
    { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
    { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
    { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
    { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
    { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
    { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

/***/ }),
/* 22 */
/***/ (function(module, exports) {

AFRAME.registerComponent('babiaxr-terrain', {
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
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(10)
__webpack_require__(11)
__webpack_require__(9)
__webpack_require__(2)
__webpack_require__(0)
__webpack_require__(1)
__webpack_require__(5)
__webpack_require__(3)
__webpack_require__(20)
__webpack_require__(21)
__webpack_require__(12)
__webpack_require__(14)
__webpack_require__(16)
__webpack_require__(15)
__webpack_require__(17)
__webpack_require__(13)
__webpack_require__(18)
__webpack_require__(8)
__webpack_require__(22)
__webpack_require__(7)
__webpack_require__(4)
__webpack_require__(19)
__webpack_require__(6)

/***/ })
/******/ ]);