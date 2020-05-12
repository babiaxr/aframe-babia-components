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

        let colorid = 0
        let stepX = 0
        let axis_dict = []
        let animation = data.animation

        let maxY = Math.max.apply(Math, dataToPrint.map(function(o) { return o.size; }))

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)


        for (let bar of dataToPrint) {

            let barEntity = generateBar(bar['size'], widthBars, colorid, stepX, palette, animation);

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
            showYAxis(element, maxY)
        }
    }
}

let widthBars = 1

function generateBar(size, width, colorid, position, palette, animation) {
    let color = getColor(colorid, palette)
    console.log("Generating bar...")
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
            if (parseInt(height) == size) {
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
    entity.setAttribute('position', { x: barPosition.x, y: barPosition.y + bar['size'] / 2 + 1, 
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

function showYAxis(parent, yEnd) {
    let axis = document.createElement('a-entity');
    //Print line
    let axis_line = document.createElement('a-entity');
    axis_line.setAttribute('line__yaxis', {
        'start': { x: -widthBars, y: 0, z: 0 },
        'end': { x: -widthBars, y: yEnd, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: widthBars / 2 + widthBars / 4 });
    axis.appendChild(axis_line)
    
    for (let i = 0; i<=yEnd; i++){
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': i,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        key.setAttribute('position', { x: -widthBars-5.2, y: i, z: widthBars / 2 + widthBars / 4 })
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