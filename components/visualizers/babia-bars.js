let dataReadyToSend = require('../others/common').dataReadyToSend;
let dispatchEventOnElement = require('../others/common').dispatchEventOnElement;
let findDataComponent = require('../others/common').findDataComponent;
const colors = require('../others/common').colors;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-bars', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        x_axis: { type: 'string', default: 'x_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean', default: false },
        axis: { type: 'boolean', default: true },
        // Name for axis
        axis_name: {type: 'boolean', default: false},
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'vec3', default: {x: 0, y: 0, z: 0} },
        scale: { type: 'number' },
        // Height of the chart
        chartHeight: { type: 'number', default: 10 },
        // Keep height when updating data
        keepHeight: { type: 'boolean', default: true},
        incremental: { type: 'boolean', default: false},
        index: { type: 'string' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        uiLink: {type: 'boolean', default: false},
        uiLinkPosition: { type: 'vec3', default: {x: -4.5, y: 2, z: 2.5} },
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
        // Build chartEl
        this.chartEl = document.createElement('a-entity');
        this.chartEl.classList.add('babiaxrChart')
        this.el.appendChild(this.chartEl);

        // Build titleEl
        this.titleEl = document.createElement('a-entity');
        this.titleEl.classList.add("babiaxrTitle")
        this.el.appendChild(this.titleEl);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        let data = this.data;
        let el = this.el;

        if (!data.index){
            data.index = data.x_axis
        }

        console.log("Starting Bars");
        this.animation = data.animation
        this.bar_array = []

        // Load data, or set event handler for when the data is ready in other component
        result = this.loadData(oldData);
        if (result === "Ready") {
            // Data is ready, build chart
            self.currentData = JSON.parse(JSON.stringify(self.newData))
            this.updateChart();
            // Dispatch events because I updated my visualization
            dataReadyToSend("newData", self)
        };

        if (data.uiLink){
            createUiLink(el, data.uiLinkPosition)
        }

    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "newData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,

    /**
     * Where the data is gonna be stored
     */
    newData: undefined,

    /**
     * Where the previous state data is gonna be stored
     */
    currentData: undefined,

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

    labels: [],
    ticks: [],

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
        if (this.newData) {
            dispatchEventOnElement(interestedElem, "newData")
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
     * Load data from the different possible sources
     * @param {*} oldData - Previous data attribute
     * @return {string} Data loaded ("Ready") or handler prepared ("Waiting")
     * 
     * Data is loaded in this.babiaData
     * Precedence: data attribute, else component in same element, else other component
     */
     loadData: function (oldData) {
        let el = this.el;
        let data;

        if (this.data.data && oldData.data !== this.data.data) {
            // Data in data argument, load it
            console.log("Data in data argument");
            data = this.data.data;
            if (typeof(data) === 'string' || data instanceof String) {
                this.newData = JSON.parse(data);
            } else {
                this.newData = data;
            };
            this.babiaMetadata = { id: this.babiaMetadata.id++ };
            return "Ready";
        } else {
            if (this.data.from !== oldData.from) {
                // From changed, re-register to the new data component
                console.log("From was changed");
                // Unregister for old querier
                if (this.dataComponent) { this.dataComponent.unregister(el) };
                // Find the new component and check if querier or filterdata from the event               
                let eventName = findDataComponent(this.data, el, this)
                // If changed to filterdata or to querier
                if (this.dataComponentEventName && this.dataComponentEventName !== eventName) {
                    el.removeEventListener(this.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                this.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(this.dataComponentEventName, _listener = (e) => {
                    attachNewDataEventCallback(this, e);
                });

                // Register for the new one
                this.dataComponent.register(el);
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && this.newData && !this.data.incremental) {
                // From was changed and data is absolute
                console.log("New Absolute Data");
                return "Ready";
            }

            return "Waiting";
        }
    },

    /*
    * Update title
    */
    updateTitle: function() {
        const titleEl = this.titleEl;
        const data = this.data;

        titleEl.setAttribute('text-geometry', {'value': data.title});
        if (data.font) titleEl.setAttribute('text-geometry', {'font': data.titleFont});
        if (data.color) titleEl.setAttribute('material', {'color': data.titleColor});
        titleEl.setAttribute('position', data.titlePosition);
        titleEl.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    },

    /*
     * Update axis
     */
    updateAxis: function(labels, ticks, lengthX, maxValue) {
        const data = this.data;
        if (data.axis) {
            if (!this.xAxisEl) {
                this.xAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.xAxisEl);
            };
            this.xAxisEl.setAttribute('babia-axis-x',
                {'labels': labels, 'ticks': ticks, 'length': lengthX,
                    'palette': data.palette});
            this.xAxisEl.setAttribute('position', {
                x: 0, y: 0, z: this.widthBars/2
            });

            if (!this.yAxisEl) {
                this.yAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.yAxisEl);
            };
            this.yAxisEl.setAttribute('babia-axis-y',
                {'maxValue': maxValue, 'length': this.lengthY});
            this.yAxisEl.setAttribute('position', {
                x: -this.widthBars/2, y: 0, z: this.widthBars/2
            });
            if (data.axis_name){
                if (data.index) {
                    this.xAxisEl.setAttribute('babia-axis-x', 'name', data.index);
                } else {
                    this.xAxisEl.setAttribute('babia-axis-x', 'name', data.x_axis);
                }
                this.yAxisEl.setAttribute('babia-axis-y', 'name', data.height);
            }
        }
    },

    /*
     * Build chart
     * @return {} Data loaded
     * 
     */
    updateChart: function () {
        const el = this.el;
        const data = this.data;

        let babiaData
        if (this.currentData) {
            babiaData = this.currentData;
        } else {
            babiaData = this.newData;
        }
        console.log("Data:", babiaData)
        const widthBars = this.widthBars;
        const palette = data.palette
        const scale = data.scale
        
        // Update title
        this.updateTitle();

        let maxValue = Math.max.apply(Math, babiaData.map(function (o) {
            return o[data.height];
        }));

        if (!this.lengthY) {
            this.lengthY = data.chartHeight;
        } else if (!data.keepHeight) {
            this.lengthY = this.lengthY * maxValue / this.maxValue;
        };
        this.maxValue = maxValue;

        let chartEl = this.chartEl;
        let bars = chartEl.querySelectorAll('a-entity[babia-bar]');
        let currentBars = {};
        for (let bar of bars) {
            let barName = bar.getAttribute('babia-name');
            currentBars[barName] = {'el': bar, 'found': false};
        };

        let xLabels = [];
        let xTicks = [];
        let colorId = 0

        // Add or modify bars for new data
        for (let i = 0; i < babiaData.length; i++) {
            let item = babiaData[i]
 
            // Build bar
            xLabel = item[data.x_axis];
            let posX = i * widthBars * 1.25;
            if ( currentBars[xLabel] && !item['_not'] ) {
                barEl = currentBars[xLabel].el;
                currentBars[xLabel].found = true;
            } else {
                barEl = document.createElement('a-entity');
                barEl.setAttribute('babia-name', xLabel);
                barEl.object3D.position.x = posX;
                chartEl.appendChild(barEl);
            }
            barEl.setAttribute('babia-bar', {
                'height': item[data.height] * this.lengthY / maxValue,
                'width': widthBars,
                'depth': widthBars,
                'color': colors.get(colorId, palette),
                'label': 'events',
                'animation': data.animation
            });
            if (data.legend) {
                barEl.setAttribute('babia-bar', {
                    'labelText': xLabel + ': ' + item[data.height]
                });
            };
            if (posX !== barEl.object3D.position.x) {
                if (data.animation) {
                    barEl.setAttribute('animation', {
                        'property': 'object3D.position.x',
                        'to': posX,
                        'dur': data.dur
                    });
                } else {
                    barEl.object3D.position.x = posX;
                };
            }

            xLabels.push(item[data.x_axis]);
            xTicks.push(posX);

            colorId++
        }

        // Remove old bars (not in new data)
        for (let name in currentBars) {
            if ( !currentBars[name].found ) {
                currentBars[name].el.remove();
            };
        };
        //Print axis
        const lengthX = widthBars * (babiaData.length * 1.25);
        this.updateAxis(xLabels, xTicks, lengthX, maxValue);
    },
})

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.newData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    if (!self.data.incremental){
        self.currentData = JSON.parse(JSON.stringify(self.newData))
        // Update chart
        self.updateChart()
    } else {
        // First add the new data in current data
        self.newData.forEach(bar => {
            let found = false
            for(let i in self.currentData){
                if (self.currentData[i][self.data.index] == bar[self.data.index]){
                    self.currentData[i] = bar
                    found = true
                }
            }
            if (!found){
                self.currentData.push(bar)
            }
        });
        // If Keep Height (need re-draw all)
        if (self.data.keepHeight){
            // To calculate maxValue you need all data before
            self.maxValue = Math.max.apply(Math, self.currentData.map(function (o) { return o[self.data.height]; }))
            console.log("Re-draw the chart")
            self.updateChart()
        } else {
            self.newData.forEach(bar => {
                if (!bar._not){
                    if (self.chartEl.querySelector('#' + bar[self.data.index])){
                        // Update bar
                        self.chartEl.querySelector('#' + bar[self.data.index]).setAttribute('babia-bar', 
                        {
                            'height': bar[self.data.height] * self.data.chartHeight / self.maxValue,
                            'labelText': bar[self.data.index] + ': ' + bar[self.data.height]
                        })
                    } else {
                        // Find last bar and get its position
                        let colorId = self.chartEl.querySelectorAll('[babia-bar]').length
                        let posX = self.chartEl.querySelectorAll('[babia-bar]')[colorId - 1].getAttribute('position').x + self.widthBars + self.widthBars / 4
                        // Create new bar
                        let barEntity = generateBar(self, self.data, bar, self.maxValue, self.widthBars, colorId, self.data.palette, posX);
                        self.chartEl.appendChild(barEntity)
                        // Add label and tick
                        self.labels.push(barEntity.id)
                        self.ticks.push(posX)
                    }
                } else {
                    // Delete bar
                    self.chartEl.querySelector("#" + bar[self.data.index]).setAttribute('babia-bar', 'height', -0.1)
                    //document.getElementById(bar[self.data.index]).remove()
                }
            });
            // Update axis
            let len_x = self.ticks[self.ticks.length - 1] + self.widthBars * 3 / 4
            if (!self.data.chartHeight || !self.data.keepHeight){
                // Calculate new maxValue and lengthY
                let maxValue_new = Math.max.apply(Math, self.currentData.map(function (o) { return o[self.data.height]; }))
                self.lengthY = maxValue_new * self.data.chartHeight / self.maxValue
                self.maxValue = maxValue_new
            }
            self.updateAxis(self.labels, self.ticks, len_x, self.maxValue)
        } 
    }

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("newData", self)
}

let generateBar = (self, data, item, maxValue, widthBars, colorId, palette, stepX ) => {
    let bar = document.createElement('a-entity');
    bar.setAttribute('babia-bar', {
        'height': item[self.data.height] * data.chartHeight / self.maxValue,
        'width': widthBars,
        'depth': widthBars,
        'color': colors.get(colorId, palette),
        'label': 'events',
        'animation': data.animation
    });
    if (data.legend) {
        bar.setAttribute('babia-bar', {
            'labelText': item[self.data.x_axis] + ': ' + item[self.data.height]
        });
    };
    bar.setAttribute('position', { x: stepX, y: 0, z: 0 }); 
    bar.id = item[self.data.index]
    return bar
}

let createUiLink = (el, position) => {
    let ui_link = document.createElement('a-entity');
    if (!el.id){
        // Generate id
        let id = 'bars' + Math.floor(Math.random() * 1000);
        el.id = id
    }
    console.log('id:', el.id)
    ui_link.setAttribute('babia-ui-link', {viz: el.id})
    ui_link.setAttribute('position', {x: position.x, y: position.y, z:position.z})
    el.appendChild(ui_link)
    console.log('Create Button', el) 
    return
}