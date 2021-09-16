let findProdComponent = require('../others/common').findProdComponent;
let updateTitle = require('../others/common').updateTitle;
let parseJson = require('../others/common').parseJson;
const colors = require('../others/common').colors;

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
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data && oldData.data !== data.data) {
            let _data = parseJson(data.data);
            this.processData(_data);
        } else if (data.from !== oldData.from) {
            // Unregister from old producer
            if (this.prodComponent) {
                this.prodComponent.notiBuffer.unregister(this.notiBufferId)
            };
            this.prodComponent = findProdComponent (data, el)
            if (this.prodComponent.notiBuffer) {
                this.notiBufferId = this.prodComponent.notiBuffer
                    .register(this.processData.bind(this))
            }     
        } 
        // If changed whatever, re-print with the current data
        else if (data !== oldData && this.newData) {
            let _data = parseJson(data.data)
            this.processData(_data)
        }
    },

    /**
    * Querier component target
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

    /*
    * Update title
    */
    updateTitle: function(){
        const titleRotation = { x: 0, y: 0, z: 0 }
        const titleEl = updateTitle(this.data, titleRotation);        
        this.el.appendChild(titleEl);
    },

    /*
    * Update chart
    */
    updateChart: function () {
        const dataToPrint = this.newData;
        console.log("Data babia-bubbles:", dataToPrint)

        const data = this.data;
        const el = this.el;
    
        const animation = data.animation
        const palette = data.palette
        const scale = data.scale
    
        let heightMax = data.heightMax
        let radiusMax = data.radiusMax

        let xLabels = [];
        let xTicks = [];
        let zLabels = [];
        let zTicks = [];
        let colorId = 0
        let maxColorId = 0
        let stepX = 0
        let stepZ = 0
    
        let maxX = 0
        let maxZ = 0
    
        let keys_used = {}
        let z_axis = {}
    
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
          
        this.chartEl = document.createElement('a-entity');
        this.chartEl.classList.add('babiaxrChart')
        el.appendChild(this.chartEl)
    
        if (scale) {
            maxX = maxRadius / scale;
            maxZ = maxRadius / scale;
        } else {
            maxX = maxRadius * radius_scale;
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
                colorId = keys_used[xLabel].colorId
            } else {
                if (scale) {
                    stepX += 2 * maxRadius / scale + 0.5
                } else {
                    stepX += 2 * maxRadius * radius_scale + 0.5
                }
                colorId = maxColorId
                //Save in used
                keys_used[xLabel] = {
                    "posX": stepX,
                    "colorId": colorId
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
    
            let bubbleEntity = generateBubble(height, radius, colorId, palette, stepX, stepZ, animation, scale, proportion, radius_scale);
            bubbleEntity.classList.add("babiaxraycasterclass")
            this.chartEl.appendChild(bubbleEntity);
            
            //Prepare legend
            if (data.legend) {
               showLegend(data, bubbleEntity, bubble, el)
            }
        }
    
        //Print axis
        if (data.axis) {
            const lengthX = maxX
            const lengthZ = maxZ
            const lengthY = heightMax
            this.updateAxis(xLabels, xTicks, lengthX, zLabels, zTicks, lengthZ, valueMax, lengthY);
        }
        this.updateTitle();
    },

    /*
    * Update axis
    */
    updateAxis: function(xLabels, xTicks, lengthX, zLabels, zTicks, lengthZ, valueMax, lengthY) {
        let xAxisEl = document.createElement('a-entity');
        this.chartEl.appendChild(xAxisEl);
        xAxisEl.setAttribute('babia-axis-x',{'labels': xLabels, 'ticks': xTicks, 'length': lengthX,'palette': this.data.palette});
        xAxisEl.setAttribute('position', {x: 0, y: 0, z: 0});
  
        let yAxisEl = document.createElement('a-entity');
        this.chartEl.appendChild(yAxisEl);
        yAxisEl.setAttribute('babia-axis-y',{'maxValue': valueMax, 'length': lengthY});
        yAxisEl.setAttribute('position', {x: 0, y: 0, z: 0});
  
        let zAxisEl = document.createElement('a-entity');
        this.chartEl.appendChild(zAxisEl);
        zAxisEl.setAttribute('babia-axis-z',{'labels': zLabels, 'ticks': zTicks, 'length': lengthZ});
        zAxisEl.setAttribute('position', {x: 0, y: 0, z: 0});

        if (this.data.axis_name){
            xAxisEl.setAttribute('babia-axis-x', 'name', this.data.x_axis);
            yAxisEl.setAttribute('babia-axis-y', 'name', this.data.height);
            zAxisEl.setAttribute('babia-axis-z', 'name', this.data.z_axis);
        }
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
        console.log("Generating bubbles...")
        this.updateChart()
    }
})


function generateBubble(height, radius, colorId, palette, positionX, positionZ, animation, scale, proportion, radius_scale) {
    let color = colors.get(colorId, palette)
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


