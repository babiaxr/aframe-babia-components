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
        } else if (dataElement.components['babia-queryes']) {
            self.dataComponent = dataElement.components['babia-queryes']
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
        } else if (el.components['babia-queryes']) {
            self.dataComponent = el.components['babia-queryes']
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
                self.dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
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

/*
 * Show the Y axis
 *
 * @param {number} proportion Proportion between max value and top Y
 * @param {number} valueMax Maximum value to show in the Y axis
 * @param {number} widthBars Width of bars
 * @param {number} parent Parent element
 * @param {number} yEnd Top Y coordinate of the axis
 * @param {number} scale Object scale
 */
function showYAxis(proportion, valueMax, widthBars, parent, yEnd, scale) {
    let axis = document.createElement('a-entity');
    let yLimit = yEnd
    // Minimum number of steps (labels) shown in the axis
    const minSteps = 6;
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
    let yScale = yLimit / valueMax;
    let step = Math.pow(10, mod);
    steps = valueMax / step;
    while (steps <= minSteps) {
        step = step / 2;
        steps = valueMax / step;
    };

    for (let i = 1; step * i < valueMax; i++) {
        let label = document.createElement('a-entity');
        let value = step * i;
        label.setAttribute('text', {
            'value': value,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        position = value * yScale;
        if (scale) {
            label.setAttribute('position', 
                { x: -widthBars - 5.2, y: position * scale,
                  z: widthBars / 2 + widthBars / 4 });
        } else if (proportion) {
            label.setAttribute('position',
                { x: -widthBars - 5.2, y: position * proportion,
                  z: widthBars / 2 + widthBars / 4 });
        } else {
            label.setAttribute('position',
                { x: -widthBars - 5.2, y: position,
                  z: widthBars / 2 + widthBars / 4 })
        }
        axis.appendChild(label)
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