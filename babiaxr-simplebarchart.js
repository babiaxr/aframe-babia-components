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
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {

        this.time = Date.now();
        this.anime_finished = false

        let el = this.el;
        let metrics = ['height', 'x_axis'];
        el.setAttribute('babiaToRepresent', metrics);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        const widthBars = 1;
        let data = this.data;
        let el = this.el;

        this.chart
        this.animation = data.animation
        this.bar_array = []
        /**
         * Update or create chart component
         */
        if (data.data !== oldData.data) {
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating barchart...")
            this.chart = generateBarChart(self, data, el, this.animation, this.chart, this.bar_array, widthBars)
            console.log(this.chart)
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

})


let generateBarChart = (self, data, element, animation, chart, list, widthBars) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)
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
    console.log("Generating bar...")
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

function showYAxis(proportion, valueMax, widthBars, parent, yEnd, scale) {
    let axis = document.createElement('a-entity');
    let yLimit = yEnd
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
    for (let i = 0; i <= yLimit; i++) {
        let key = document.createElement('a-entity');
        let value = i
        let pow = Math.pow(10, mod - 1)
        if (!proportion || (proportion && i % pow === 0)) {
            key.setAttribute('text', {
                'value': value,
                'align': 'right',
                'width': 10,
                'color': 'white '
            });
            if (scale) {
                key.setAttribute('text', { 'value': value * scale })
                key.setAttribute('position', { x: -widthBars - 5.2, y: value, z: widthBars / 2 + widthBars / 4 })
            } else if (proportion) {
                key.setAttribute('position', { x: -widthBars - 5.2, y: i * proportion, z: widthBars / 2 + widthBars / 4 })
            } else {
                key.setAttribute('position', { x: -widthBars - 5.2, y: i, z: widthBars / 2 + widthBars / 4 })
            }
        }
        axis.appendChild(key)
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