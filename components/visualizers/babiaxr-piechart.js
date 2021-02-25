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
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babia-queryes']) {
            self.dataComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub']) {
            self.dataComponent = el.components['babia-querygithub']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
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