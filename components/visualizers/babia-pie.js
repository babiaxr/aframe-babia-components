let updateTitle = require('../others/common').updateTitle;
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
AFRAME.registerComponent('babia-pie', {
    schema: {
        data: { type: 'string' },
        size: { type: 'string', default: 'size' },
        key: { type: 'string', default: 'key' },
        from: { type: 'string' },
        legend: { type: 'boolean' },
        legend_lookat: { type: 'string', default: "[camera]" },
        legend_scale: { type: 'number', default: 1 },
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
    init: function () {
        this.notiBuffer = new NotiBuffer();
    },
    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        updateFunction(this, oldData)
    },

    /**
    * Called on each scene tick.
    */
    tick: function (t, delta) {
        if (this.data.animation && this.loaded) {
            let elements = document.getElementsByClassName('babiaxrChart')[0].children
            for (let slice in this.slice_array) {
                let delay = this.slice_array[slice].delay
                let max_length = this.slice_array[slice].degreeLenght
                let theta_length = parseFloat(elements[slice].getAttribute('theta-length'))
                if ((t >= delay) && (theta_length < max_length)) {
                    theta_length += 360 * delta / this.total_duration
                    if (theta_length > max_length) {
                        theta_length = max_length
                    }
                    elements[slice].setAttribute('theta-length', theta_length)
                }
            }
        }
    },

    /**
    * Querier component producer
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
     * Where the metadata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

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

    /*
    * Update title
    */
    updateTitle: function(){
        const titleRotation = { x: -90, y: 0, z: 0 }
        const titleEl = updateTitle(this.data, titleRotation);        
        this.el.appendChild(titleEl);
    },

    /*
     * Update chart
     */
    updateChart: function() {
        const dataToPrint = this.newData;
        console.log("Data babia-pie:", dataToPrint)

        const data = this.data;
        const el = this.el;

        const animation = data.animation
        const palette = data.palette
        
        let degreeStart = 0;
        let degreeEnd = 0;
        let colorId = 0

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice[data.size];
        }
    
        this.chartEl = document.createElement('a-entity');
        this.chartEl.classList.add('babiaxrChart')
        el.appendChild(this.chartEl)
    
        let prev_delay = 0
        for (let slice of dataToPrint) {
            //Calculate degrees        
            degreeEnd = 360 * slice[data.size] / totalSize;
            let sliceEntity
            if (animation) {
                let duration_slice = this.total_duration * degreeEnd / 360
                this.slice_array.push({
                    degreeLenght: degreeEnd,
                    duration: duration_slice,
                    delay: prev_delay
                })
                prev_delay += duration_slice;
                sliceEntity = generateSlice(degreeStart, 0.01, 1, colorId, palette);
            } else {
                sliceEntity = generateSlice(degreeStart, degreeEnd, 1, colorId, palette);
            }
            sliceEntity.classList.add("babiaxraycasterclass")    
            this.chartEl.appendChild(sliceEntity);
            
            //Move degree offset
            degreeStart += degreeEnd;
    
            //Prepare legend
            if (data.legend) {
                showLegend(data, sliceEntity, slice, el)
            }    
            
            colorId++
        }

        this.updateTitle();
    },

    /*
    * Process data obtained from producer
    */
    processData: function (data) {
        console.log("processData", this);
        this.newData = data;
        this.babiaMetadata = { id: this.babiaMetadata.id++ };
        while (this.el.firstChild)
                this.el.firstChild.remove();
        console.log("Generating pie...")
        this.updateChart()
        this.loaded = true
        this.notiBuffer.set(this.newData)
    }
})

function generateSlice(theta_start, theta_length, radius, colorId, palette) {
    let color = colors.get(colorId, palette)
    console.log("Generating slice...")
    let entity = document.createElement('a-cylinder');
    entity.setAttribute('color', color);
    entity.setAttribute('theta-start', theta_start);
    entity.setAttribute('theta-length', theta_length);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    return entity;
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
    entity.setAttribute('babia-lookat', data.legend_lookat);
    entity.setAttribute('scale',{x: data.legend_scale, y: data.legend_scale, z: data.legend_scale});
    return entity;
}

function showLegend(data, sliceEntity, slice, el) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data, slice);
        el.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        el.removeChild(legend);
    });
}