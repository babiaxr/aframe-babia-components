let findProdComponent = require('../others/common').findProdComponent;
let updateTitle = require('../others/common').updateTitle;
let parseJson = require('../others/common').parseJson;
const colors = require('../others/common').colors;
let updateFunction = require('../others/common').updateFunction;

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-barsmap', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        x_axis: { type: 'string', default: 'x_axis' },
        z_axis: { type: 'string', default: 'z_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        legend_lookat: { type: 'string', default: "[camera]" },
        legend_scale: { type: 'number', default: 1 },
        axis: { type: 'boolean', default: true },
        // Name for axis
        axis_name: {type: 'boolean', default: false},
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'string', default: "0 0 0" },
        // Height of the chart
        chartHeight: { type: 'number', default: 10 },
        // Keep height when updating data
        keepHeight: { type: 'boolean', default: true},
        incremental: { type: 'boolean', default: false},
        index: { type: 'string', default: 'x_axis'},
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
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
    init: function () {
        this.notiBuffer = new NotiBuffer();

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
        updateFunction(this, oldData)
    },

    /**
    * Producer component target
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
     * Proportion of the bars
     */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

    xLabels: [],
    zLabels: [],
    xTicks: [],
    zTicks: [],

    /**
     * Duration of the animation if activated
     */
    total_duration: 3000,
    
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
    updateAxis: function(xLabels, xTicks, lengthX, maxValue, zLabels, zTicks, lengthZ) {
        const data = this.data;
        if (data.axis) {
            if (!this.xAxisEl) {
                this.xAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.xAxisEl);
            };
            this.xAxisEl.setAttribute('babia-axis-x',
                {'labels': xLabels, 'ticks': xTicks, 'length': lengthX,
                    'palette': data.palette, 'align': 'behind'});
            this.xAxisEl.setAttribute('position', {
                x: -this.widthBars/2, y: 0, z: -this.widthBars/2
            });

            if (!this.zAxisEl) {
                this.zAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.zAxisEl);
            };
            this.zAxisEl.setAttribute('babia-axis-z',
                {'labels': zLabels, 'ticks': zTicks, 'length': lengthZ,
                    'palette': data.palette, 'align': 'left'});
            this.zAxisEl.setAttribute('position', {
                x: 0-this.widthBars/2, y: 0, z: -this.widthBars/2
            });

            if (!this.yAxisEl) {
                this.yAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.yAxisEl);
            };
            this.yAxisEl.setAttribute('babia-axis-y',
                {'maxValue': maxValue, 'length': this.lengthY});
            this.yAxisEl.setAttribute('position', {
                x: -this.widthBars/2, y: 0, z: -this.widthBars/2
            });
            if (data.axis_name){
                if (data.index =! "x_axis") {
                    this.xAxisEl.setAttribute('babia-axis-x', 'name', data.index);
                } else {
                    this.xAxisEl.setAttribute('babia-axis-x', 'name', data.x_axis);
                }
                this.yAxisEl.setAttribute('babia-axis-y', 'name', data.height);
                this.zAxisEl.setAttribute('babia-axis-z', 'name', data.z_axis);
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
        console.log("Data babia-barsmap:", dataToPrint)

        const data = this.data;

        const palette = data.palette
        
        // Update title
        this.updateTitle();

        let maxValue = Math.max.apply(Math, dataToPrint.map(function (o) {return o[data.height];}));

        if (!this.lengthY) {
            this.lengthY = data.chartHeight;
        } else if (!data.keepHeight) {
            this.lengthY = this.lengthY * maxValue / this.maxValue;
        };
        this.maxValue = maxValue;

        let xLabels = [];
        let xTicks = [];
        let zLabels = [];
        let zTicks = [];

        let chartEl = this.chartEl;
        // RESET CHART REMOVING ALL THE BARS
        let bars = chartEl.querySelectorAll('a-entity[babia-bar]');
        bars.forEach(barToDelete => {
            barToDelete.remove()
        });
        //console.log(dataToPrint)
        for (let i = 0; i < dataToPrint.length; i++) {
            let item = dataToPrint[i]
 
            // Build bar
            let xLabel = item[data.x_axis]
            let zLabel = item[data.z_axis]
            // Check if exist labels and calculate posX
            let posX
            if (!xLabels.includes(xLabel)){
                xLabels.push(xLabel)
                posX = (xLabels.length - 1) * this.widthBars * 1.25;
                xTicks.push(posX + this.widthBars/2)
            }
            if (!posX){
                posX = xLabels.indexOf(xLabel) * this.widthBars * 1.25
            }

            let posZ 
            if (!zLabels.includes(zLabel)){
                zLabels.push(zLabel)
                posZ = (zLabels.length - 1) * this.widthBars * 1.25;
                zTicks.push(posZ + this.widthBars/2)
            }
            if (!posZ){
                posZ = zLabels.indexOf(zLabel) * this.widthBars * 1.25
            }

            console.log(xLabel + " " + zLabel + " " + posX + " " + posZ)
            let colorId = xLabels.indexOf(xLabel)

            let barEl;
            if (!barEl) {
                barEl = document.createElement('a-entity');
                barEl.id = xLabel + zLabel;
                barEl.classList.add("babiaxraycasterclass");
                barEl.object3D.position.x = posX;
                barEl.object3D.position.z = posZ;
                chartEl.appendChild(barEl);
            };

            if (!item['_not']) { 
                barEl.setAttribute('babia-bar', {
                    'height': item[data.height] * this.lengthY / maxValue,
                    'width': this.widthBars,
                    'depth': this.widthBars,
                    'color': colors.get(colorId, palette),
                    'label': 'events',
                    'animation': data.animation
                });
            } else {
                barEl.setAttribute('babia-bar', {
                    'height': -0.1,
                    'color': colors.get(colorId, palette),
                });
            }

            if (data.legend) {
                barEl.setAttribute('babia-bar', {
                    'labelText': xLabel + ', ' + zLabel + ': ' + item[data.height],
                    'labelLookat': data.legend_lookat,
                    'labelScale': data.legend_scale
                });
            };
        }

        //Print axis
        const lengthX = this.widthBars * (xLabels.length * 1.25 + 0.75);
        const lengthZ = this.widthBars * (zLabels.length * 1.25 + 0.75);
        this.updateAxis(xLabels, xTicks, lengthX, maxValue, zLabels, zTicks, lengthZ);
        this.xLabels = xLabels
        this.xTicks = xTicks
        this.zLabels = zLabels
        this.zTicks = zTicks
    },

    /*
    * Process data obtained from producer
    */
    processData: function (_data) {
        console.log("processData", this);
        let data = this.data;
        this.newData = _data;
        this.babiaMetadata = { id: this.babiaMetadata.id++ };
        this.notiBuffer.set(this.newData)

        if (!data.incremental){
            this.currentData = JSON.parse(JSON.stringify(this.newData))
            // Update chart
            this.updateChart()
        } else {
            // First add the new data in current data
            this.newData.forEach(bar => {
                let found = false
                for(let i in this.currentData){
                    if (this.currentData[i][data.x_axis] == bar[data.x_axis] && this.currentData[i][data.z_axis] == bar[data.z_axis]){
                        this.currentData[i] = bar
                        found = true
                    }
                }
                if (!found){
                    this.currentData.push(bar)
                }
            });
            // If Keep Height (need re-draw all)
            if (data.keepHeight){
                // To calculate maxValue you need all data before
                this.maxValue = Math.max.apply(Math, this.currentData.map(function (o) { return o[data.height]; }))
                console.log("Re-draw the chart")
                this.updateChart()
            } else {
                console.log("Keep ---> Update")
                this.newData.forEach(bar => {
                    if (!bar._not){
                        if (this.chartEl.querySelector('#' + bar[data.x_axis] + bar[data.z_axis])){
                            // Update bar
                            this.chartEl.querySelector('#' + bar[data.x_axis] + bar[data.z_axis]).setAttribute('babia-bar', 
                            {
                                'height': bar[data.height] * data.chartHeight / this.maxValue,
                                'labelText': bar[data.x_axis] +"," + bar[data.z_axis] + ': ' + bar[data.height],
                                'labelLookat': data.legend_lookat,
                                'labelScale': data.legend_scale
                            })
                        } else {
                            // Create new bar
                            generateBar(this, data, bar, this.maxValue, colors, this.xLabels, this.zLabels, this.xTicks, this.zTicks);
                        }
                    } else {
                        // Delete bar
                        this.chartEl.querySelector("#" + bar[data.x_axis]+ bar[data.z_axis]).setAttribute('babia-bar', 'height', -0.1)
                        //document.getElementById(bar[data.index]).remove()
                    }
                });

                // Update axis
                let len_x = this.xTicks[this.xTicks.length - 1] + this.widthBars * 3 / 4
                let len_z = this.zTicks[this.zTicks.length - 1] + this.widthBars * 3 / 4
                if (!data.chartHeight || !data.keepHeight){
                    // Calculate new maxValue and lengthY
                    let maxValue_new = Math.max.apply(Math, this.currentData.map(function (o) { return o[data.height]; }))
                    this.lengthY = maxValue_new * data.chartHeight / this.maxValue
                    this.maxValue = maxValue_new
                }
                this.updateAxis(this.xLabels, this.xTicks, len_x, this.maxValue, this.zLabels, this.zTicks, len_z)
            } 
        }
    },
})

let generateBar = (self, data, item, maxValue, palette, xLabels, zLabels, xTicks, zTicks) => {
    let xLabel = item[data.x_axis]
    let zLabel = item[data.z_axis]

    // Check if exist labels and calculate posX
    let posX
    if (!xLabels.includes(xLabel)){
        xLabels.push(xLabel)
        posX = (xLabels.length - 1) * this.widthBars * 1.25;
        xTicks.push(posX + this.widthBars/2)
    }
    if (!posX){
        posX = xLabels.indexOf(xLabel) * this.widthBars * 1.25
    }

    let posZ 
    if (!zLabels.includes(zLabel)){
        zLabels.push(zLabel)
        posZ = (zLabels.length - 1) * this.widthBars * 1.25;
        zTicks.push(posZ + this.widthBars/2)
    }
    if (!posZ){
        posZ = zLabels.indexOf(zLabel) * this.widthBars * 1.25
    }

    let colorId = xLabels.indexOf(xLabel)

    let barEl = document.createElement('a-entity');
    barEl.id = xLabel + zLabel;
    barEl.classList.add("babiaxraycasterclass");
    barEl.setAttribute('babia-bar', {
        'height': item[data.height] * this.lengthY / maxValue,
        'width': this.widthBars,
        'depth': this.widthBars,
        'color': colors.get(colorId, palette),
        'label': 'events',
        'animation': data.animation
    });
    barEl.object3D.position.x = posX;
    barEl.object3D.position.z = posZ;
    chartEl.appendChild(barEl);

    if (data.legend) {
        barEl.setAttribute('babia-bar', {
            'labelText': item[self.data.x_axis] + ': ' + item[self.data.height],
            'labelLookat': data.legend_lookat,
            'labelScale': data.legend_scale
        });
    };

    this.xLabels = xLabels
    this.xTicks = xTicks
    this.zLabels = zLabels
    this.zTicks = zTicks
    return bar
}