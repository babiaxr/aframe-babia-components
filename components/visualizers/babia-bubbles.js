/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-bubbles', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        radius: { type: 'string', default: 'radius' },
        x_axis: { type: 'string', default: 'x_axis' },
        z_axis: { type: 'string', default: 'z_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        // Name for axis
        axis_name: {type: 'boolean', default: false},
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
        self.chart = generateBubblesChart(self, self.data, JSON.parse(self.data.data), self.el)
  
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
            self.chart = generateBubblesChart(self, self.data, self.babiaData, self.el)
        
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
})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
      // Save the reference to the querier or filterdata
      let dataElement = document.getElementById(data.from)
      if (dataElement.components['babia-filter']) {
        self.dataComponent = dataElement.components['babia-filter']
        eventName = "babiaFilterDataReady"
      } else if (dataElement.components['babia-queryjson']) {
        self.dataComponent = dataElement.components['babia-queryjson']
      } else if (dataElement.components['babia-queryes']) {
        self.dataComponent = dataElement.components['babia-queryes']
      } else if (dataElement.components['babia-querygithub']) {
        self.dataComponent = dataElement.components['babia-querygithub']
      } else {
        console.error("Problem registering to the querier")
        return
      }
    } else {
      // Look for a querier or filterdata in the same element and register
      if (el.components['babia-filter']) {
        self.dataComponent = el.components['babia-filter']
        eventName = "babiaFilterDataReady"
      } else if (el.components['babia-queryjson']) {
        self.dataComponent = el.components['babia-queryjson']
      } else if (el.components['babia-queryes']) {
        self.dataComponent = el.components['babia-queryes']
      } else if (el.components['babia-querygithub']) {
        self.dataComponent = el.components['babia-querygithub']
      } else {
        // Look for a querier or filterdata in the scene
        if (document.querySelectorAll("[babia-filter]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
          eventName = "babiaFilterDataReady"
        } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
        } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
        } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
          self.dataComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
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
    self.chart = generateBubblesChart(self, self.data, rawData, self.el)
    
    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)  
}


let generateBubblesChart = (self, data, dataRetrieved, element) => {
    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale
        let heightMax = data.heightMax
        let radiusMax = data.radiusMax

        let xLabels = [];
        let xTicks = [];
        let zLabels = [];
        let zTicks = [];
        let colorid = 0
        let maxColorId = 0
        let stepX = 0
        let stepZ = 0

        let maxX = 0
        let maxZ = 0

        let keys_used = {}
        let z_axis = {}

        let animation = data.animation

        let valueMax = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
        let maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
        if (scale) {
            valueMax = valueMax / scale
            maxRadius = maxRadius / scale
        }
        if (!heightMax) {
            heightMax = valueMax
        }
        proportion = heightMax / valueMax
      
        if (!radiusMax) {
            radiusMax = maxRadius
        }
        radius_scale = radiusMax / maxRadius
      
        self.chartEl = document.createElement('a-entity');
        self.chartEl.classList.add('babiaxrChart')

        element.appendChild(self.chartEl)
        if (scale) {
            maxZ = maxRadius / scale
        } else {
            maxZ = maxRadius * radius_scale;
        }

        for (let bubble of dataToPrint) {
            let xLabel = bubble[data.x_axis]
            let zLabel = bubble[data.z_axis]
            let height = bubble[data.height]
            let radius = bubble[data.radius]
            // Check if used in order to put the bubble in the parent row
            if (keys_used[xLabel]) {
                stepX = keys_used[xLabel].posX
                colorid = keys_used[xLabel].colorid
            } else {
                if (scale) {
                    stepX += 2 * maxRadius / scale + 0.5
                } else {
                    stepX += 2 * maxRadius * radius_scale + 0.5
                }
                colorid = maxColorId
                //Save in used
                keys_used[xLabel] = {
                    "posX": stepX,
                    "colorid": colorid
                }

                xLabels.push(xLabel)
                xTicks.push(stepX)
                maxColorId++
            }

            // Get Z val
            if (z_axis[zLabel]) {
                stepZ = z_axis[zLabel].posZ
            } else {
                if (scale) {
                    stepZ = maxZ + 2 * maxRadius / scale + 0.5
                } else {
                    stepZ = maxZ + 2 * maxRadius * radius_scale + 0.5
                }
                //Save in used
                z_axis[zLabel] = {
                    "posZ": stepZ
                }
                zLabels.push(zLabel)
                zTicks.push(stepZ)
            }

            if (stepX > maxX){
                maxX = stepX
            }
            if (stepZ > maxZ){
                maxZ = stepZ
            }

            let bubbleEntity = generateBubble(height, radius, colorid, palette, stepX, stepZ, animation, scale, proportion, radius_scale);
            bubbleEntity.classList.add("babiaxraycasterclass")

            //Prepare legend
            if (data.legend) {
                showLegend(data, bubbleEntity, bubble, element)
            }

            self.chartEl.appendChild(bubbleEntity);
        }

        //Print axis
        if (data.axis) {
            const lengthX = maxX
            const lengthZ = maxZ
            const lengthY = heightMax
            updateAxis(self, xLabels, xTicks, lengthX, zLabels, zTicks, lengthZ, valueMax, lengthY);
      }
        //Print Title
        let title_3d = showTitle(title, font, color, title_position);
        element.appendChild(title_3d);
    }
}


function generateBubble(height, radius, colorid, palette, positionX, positionZ, animation, scale, proportion, radius_scale) {
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

/*
* Update axis
 */

function updateAxis(self, xLabels, xTicks, lengthX, zLabels, zTicks, lengthZ, valueMax, lengthY) {
    let xAxisEl = document.createElement('a-entity');
    self.chartEl.appendChild(xAxisEl);
    xAxisEl.setAttribute('babia-axis-x',
        {'labels': xLabels, 'ticks': xTicks, 'length': lengthX,
            'palette': self.data.palette});
    xAxisEl.setAttribute('position', {
        x: 0, y: 0, z: 0
    });
  
    let yAxisEl = document.createElement('a-entity');
    self.chartEl.appendChild(yAxisEl);
    yAxisEl.setAttribute('babia-axis-y',
        {'maxValue': valueMax, 'length': lengthY});
    yAxisEl.setAttribute('position', {
        x: 0, y: 0, z: 0
    });
  
    let zAxisEl = document.createElement('a-entity');
    self.chartEl.appendChild(zAxisEl);
    zAxisEl.setAttribute('babia-axis-z',
        {'labels': zLabels, 'ticks': zTicks, 'length': lengthZ});
    zAxisEl.setAttribute('position', {
        x: 0, y: 0, z: 0
    });
    if (self.data.axis_name){
        xAxisEl.setAttribute('babia-axis-x', 'name', self.data.x_axis);
        yAxisEl.setAttribute('babia-axis-y', 'name', self.data.height);
        zAxisEl.setAttribute('babia-axis-z', 'name', self.data.z_axis);
    }
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