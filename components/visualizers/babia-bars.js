let findProdComponent = require('../others/common').findProdComponent;
let updateTitle = require('../others/common').updateTitle;
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
        this.updateTitle()
        this.el.appendChild(this.titleEl);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        if (!data.index){
            data.index = data.x_axis
        }

        console.log("Starting Bars");
        this.animation = data.animation
        this.bar_array = []

        if (data.data && oldData.data !== data.data) {
            this.processData(data.data);
        } else if (data.from !== oldData.from) {
            // Unregister from old producer
            if (this.prodComponent) {
                this.prodComponent.notiBuffer.unregister(this.notiBufferId) 
            };
            this.prodComponent = findProdComponent(data, el)
            if (this.prodComponent.notiBuffer){
                this.notiBufferId = this.prodComponent.notiBuffer
                    .register(this.processData.bind(this))
            }
        }
        if (data.uiLink){
            createUiLink(el, data.uiLinkPosition)
        }

    },
  
    /**
    * Producer component
    */
    prodComponent: undefined,

    /**
    * NotiBuffer identifier
    */
    notiBufferId: undefined,
    
    /**
     * Where the data is gonna be stored
     */
    newData: undefined,

    /**
     * Where the previous state data is gonna be stored
     */
    currentData: undefined,

    /**
     * Where the metadata is gonna be stored
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

    xLabels: [],
    xTicks: [],

    /*
    * Update title
    */
    updateTitle: function() {
        const titleRotation = { x: 0, y: 0, z: 0 }
        this.titleEl = updateTitle(this.data, titleRotation)
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
     * Update chart
     */
    updateChart: function () {
        let dataToPrint
        if (this.currentData) {
            dataToPrint = this.currentData;
        } else {
            dataToPrint = this.newData;
        }
        console.log("Data babia-bars:", dataToPrint)

        const data = this.data;
        
        const palette = data.palette
        
        // Update title
        this.updateTitle();

        let maxValue = Math.max.apply(Math, dataToPrint.map(function (o) {
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
        for (let i = 0; i < dataToPrint.length; i++) {
            let item = dataToPrint[i]
 
            // Build bar
            let xLabel = item[data.x_axis];
            let posX = i * this.widthBars * 1.25;
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
                'width': this.widthBars,
                'depth': this.widthBars,
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
        const lengthX = this.widthBars * (dataToPrint.length * 1.25);
        this.updateAxis(xLabels, xTicks, lengthX, maxValue);
    },

    /*
    * Process data obtained from producer
    */
    processData: function (data) {
        console.log("processData", this);
        let object;
        if (typeof(data) === 'string' || data instanceof String) {
            object = JSON.parse(data);
        } else {
            object = data;
        };
        this.newData = object;
        this.babiaMetadata = { id: this.babiaMetadata.id++ };

        if (!this.data.incremental){
            this.currentData = JSON.parse(JSON.stringify(this.newData))
            // Update chart
            this.updateChart()
        } else {
            // First add the new data in current data
            this.newData.forEach(bar => {
                let found = false
                for(let i in this.currentData){
                    if (this.currentData[i][this.data.index] == bar[this.data.index]){
                        this.currentData[i] = bar
                        found = true
                    }
                }
                if (!found){
                    this.currentData.push(bar)
                }
            });
            // If Keep Height (need to re-draw all)
            if (this.data.keepHeight){
                // To calculate maxValue you need all data before
                this.maxValue = Math.max.apply(Math, this.currentData.map(function (o) { return o[this.data.height]; }))
                console.log("Re-draw the chart")
                this.updateChart()
            } else {
                this.newData.forEach(bar => {
                    if (!bar._not){
                        if (this.chartEl.querySelector('#' + bar[this.data.index])){
                            // Update bar
                            this.chartEl.querySelector('#' + bar[this.data.index]).setAttribute('babia-bar', 
                            {
                                'height': bar[this.data.height] * this.data.chartHeight / this.maxValue,
                                'labelText': bar[this.data.index] + ': ' + bar[this.data.height]
                            })
                        } else {
                            // Find last bar and get its position
                            let colorId = this.chartEl.querySelectorAll('[babia-bar]').length
                            let posX = this.chartEl.querySelectorAll('[babia-bar]')[colorId - 1].getAttribute('position').x + this.widthBars + this.widthBars / 4
                            // Create new bar
                            let barEntity = generateBar(this, this.data, bar, colorId, this.data.palette, posX);
                            this.chartEl.appendChild(barEntity)
                            // Add label and tick
                            this.xLabels.push(barEntity.id)
                            this.xTicks.push(posX)
                        }
                    } else {
                        // Delete bar
                        this.chartEl.querySelector("#" + bar[this.data.index]).setAttribute('babia-bar', 'height', -0.1)
                        //document.getElementById(bar[this.data.index]).remove()
                    }
                });

                // Update axis
                let len_x = this.xTicks[this.xTicks.length - 1] + this.widthBars * 3 / 4
                if (!this.data.chartHeight || !this.data.keepHeight){
                    // Calculate new maxValue and lengthY
                    let maxValue_new = Math.max.apply(Math, this.currentData.map(function (o) { return o[this.data.height]; }))
                    this.lengthY = maxValue_new * this.data.chartHeight / this.maxValue
                    this.maxValue = maxValue_new
                }
                this.updateAxis(this.xLabels, this.xTicks, len_x, this.maxValue)
            } 
        }
    },
})

let generateBar = (self, data, item, colorId, palette, stepX ) => {
    let bar = document.createElement('a-entity');
    bar.setAttribute('babia-bar', {
        'height': item[self.data.height] * data.chartHeight / self.maxValue,
        'width': self.widthBars,
        'depth': self.widthBars,
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