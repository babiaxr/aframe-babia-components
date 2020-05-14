/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geobubbleschart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true },
        animation: {type: 'boolean', default: false},
        palette: {type: 'string', default: 'ubuntu'},
        title: {type: 'string'},
        titleFont: {type: 'string'},
        titleColor: {type: 'string'},
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
            //remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating geobubbleschart...")
            generateBubblesChart(data, el)
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

let generateBubblesChart = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor

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

        widthBubbles = Math.max.apply(Math, Object.keys( dataToPrint ).map(function (o) { return dataToPrint[o].radius; }))

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

        for (let bubble of dataToPrint) {
            // Check if used in order to put the bubble in the parent row
            if (keys_used[bubble['key']]) {
                stepX = keys_used[bubble['key']].posX
                colorid = keys_used[bubble['key']].colorid
            } else {
                stepX = maxX
                colorid = maxColorId
                //Save in used
                keys_used[bubble['key']] = {
                    "posX": maxX,
                    "colorid": maxColorId
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posX: stepX,
                    key: bubble['key']
                }
                xaxis_dict.push(bubble_printed)

                maxX += widthBubbles + widthBubbles / 4
                maxColorId++
            }

            // Get Z val
            if (z_axis[bubble['key2']]) {
                stepZ = z_axis[bubble['key2']].posZ
            } else {
                stepZ = maxZ
                //Save in used
                z_axis[bubble['key2']] = {
                    "posZ": maxZ
                }

                //Axis dict
                let bubble_printed = {
                    colorid: colorid,
                    posZ: stepZ,
                    key: bubble['key2']
                }
                zaxis_dict.push(bubble_printed)

                maxZ += widthBubbles + widthBubbles / 4
            }

            let bubbleEntity = generateBubble(bubble['radius'], bubble['height'], widthBubbles, colorid, palette, stepX, stepZ, animation);

            //Prepare legend
            if (data.legend) {
                showLegend(bubbleEntity, bubble, element)
            }

            chart_entity.appendChild(bubbleEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict)
            showZAxis(element, maxZ, zaxis_dict)
            showYAxis(element, maxY)
        }

        //Print Title
        let title_3d = showTitle(title, font, color);
        element.appendChild(title_3d);
    }
}

let widthBubbles = 0

function generateBubble(radius, height, width, colorid, palette, positionX, positionZ, animation) {
    let color = getColor(colorid, palette)
    console.log("Generating bubble...")
    let entity = document.createElement('a-sphere');
    entity.setAttribute('color', color);
    entity.setAttribute('radius', radius);
    // Add Animation
  if (animation) {
    let from = positionX.toString() + " " + radius.toString() + " " + positionZ.toString()
    let to = positionX.toString() + " " + (radius + height).toString() + " " + positionZ.toString()
    entity.setAttribute('animation__position',{
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

function getColor(colorid, palette){
    let color
    for (let i in colors){
        if(colors[i][palette]){
            color = colors[i][palette][colorid%4]
        }
    }
    return color
}

function generateLegend(bubble, bubbleEntity) {
    let text = bubble['key'] + ': \n Radius:' + bubble['radius'] + '\nHeight:' + bubble['height'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let bubblePosition = bubbleEntity.getAttribute('position')
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: bubblePosition.x, y: bubblePosition.y + bubble['radius'] + 1,
                                      z: bubblePosition.z + bubble['radius'] + 0.1 });
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

function showLegend(bubbleEntity, bubble, element) {
    bubbleEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bubble, bubbleEntity);
        element.appendChild(legend);
    });

    bubbleEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bubbles_printed, palette) {
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
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBubbles-3.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bubbles_printed, palette) {
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
        key.setAttribute('position', { x: -widthBubbles-5.2, y: 0, z: e.posZ })
        key.setAttribute('rotation', { x: -90, y: 0, z: 0 });
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
        'start': { x: -widthBubbles, y: 0, z: 0 },
        'end': { x: -widthBubbles, y: yEnd+1, z: 0 },
        'color': '#ffffff'
    });
    axis_line.setAttribute('position', { x: 0, y: 0, z: -(widthBubbles / 2 + widthBubbles / 4) });
    axis.appendChild(axis_line)

    for (let i = 0; i <= yEnd; i++) {
        let key = document.createElement('a-entity');
        key.setAttribute('text', {
            'value': i,
            'align': 'right',
            'width': 10,
            'color': 'white '
        });
        key.setAttribute('position', { x: -widthBubbles-5.2, y: i, z: -(widthBubbles / 2 + widthBubbles / 4) })
        axis.appendChild(key)
    }

    //axis completion
    parent.appendChild(axis)
}

function showTitle(title, font, color){
    let entity = document.createElement('a-entity');
    entity.setAttribute('text-geometry',{
        value : title,
    });
    if (font){
        entity.setAttribute('text-geometry', {
            font: font,
        })
    }
    if (color){
        entity.setAttribute('material' ,{
            color : color
        })
    }
    var position = title.length / 2 + widthBubbles
    entity.setAttribute('position', {x: -position, y: 0.2, z: -(widthBubbles / 2 + widthBubbles / 4)})
    entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
    entity.classList.add("babiaxrTitle")
    return entity;
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
