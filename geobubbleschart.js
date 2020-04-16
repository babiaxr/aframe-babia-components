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
        axis: { type: 'boolean', default: true }
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

        let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))

        widthBubbles = Math.max.apply(Math, Object.keys( dataToPrint ).map(function (o) { return dataToPrint[o].radius; }))

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

            let bubbleEntity = generateBubble(bubble['radius'], bubble['height'], widthBubbles, colorid, stepX, stepZ);

            //Prepare legend
            if (data.legend) {
                showLegend(bubbleEntity, bubble)
            }

            element.appendChild(bubbleEntity);

        }

        // Axis
        if (data.axis) {
            showXAxis(element, maxX, xaxis_dict)
            showZAxis(element, maxZ, zaxis_dict)
            showYAxis(element, maxY)
        }
    }
}

let widthBubbles = 0

function generateBubble(radius, height, width, color, positionX, positionZ) {
    console.log("Generating bubble...")
    let entity = document.createElement('a-sphere');
    entity.setAttribute('color', colors[color]);
    entity.setAttribute('radius', radius);
    entity.setAttribute('position', { x: positionX, y: radius + height, z: positionZ });
    return entity;
}

function generateLegend(bubble) {
    let text = bubble['key'] + ': \n Radius:' + bubble['radius'] + '\nHeight:' + bubble['height'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: bubble['radius'] + 1, z: bubble['radius'] + 0.1 });
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
    entity.setAttribute('light', {
        'intensity': 0.3
    });
    return entity;
}

function showLegend(bubbleEntity, bubble) {
    bubbleEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(bubble);
        this.appendChild(legend);
    });

    bubbleEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}


function showXAxis(parent, xEnd, bubbles_printed) {
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
        key.setAttribute('text', {
            'value': e.key,
            'align': 'left',
            'width': 10,
            'color': colors[e.colorid]
        });
        key.setAttribute('position', { x: e.posX, y: 0, z: -widthBubbles-3.2 })
        key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
        axis.appendChild(key)
    });

    //axis completion
    parent.appendChild(axis)
}

function showZAxis(parent, zEnd, bubbles_printed) {
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
        key.setAttribute('text', {
            'value': e.key,
            'align': 'right',
            'width': 10,
            'color': colors[e.colorid]
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

let colors = ["#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177", "#0d5ac1",
    "#f205e6", "#1c0365", "#14a9ad", "#4ca2f9", "#a4e43f", "#d298e2", "#6119d0",
    "#d2737d", "#c0a43c", "#f2510e", "#651be6", "#79806e", "#61da5e", "#cd2f00",
    "#9348af", "#01ac53", "#c5a4fb", "#996635", "#b11573", "#4bb473", "#75d89e",
    "#2f3f94", "#2f7b99", "#da967d", "#34891f", "#b0d87b", "#ca4751", "#7e50a8",
    "#c4d647", "#e0eeb8", "#11dec1", "#289812", "#566ca0", "#ffdbe1", "#2f1179",
    "#935b6d", "#916988", "#513d98", "#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
    "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
    "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
    "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
    "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
    "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
    "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
    "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
    "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
    "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
    "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
    "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
    "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
    "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
    "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
    "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
    "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
    "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
    "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
    "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
    "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
    "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
    "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
    "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
    "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
    "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
    "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
    "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
    "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
    "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
    "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca"]
