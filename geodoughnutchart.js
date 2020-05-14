/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geodoughnutchart', {
    schema: {
        data: { type: 'string' },
        legend: { type: 'boolean' },
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
            console.log("Generating pie...")
            generateDoughnut(data, el)
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

let generateDoughnut = (data, element) => {
    if (data.data) {
        const dataToPrint = JSON.parse(data.data)
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor

        // Change size to degrees
        let totalSize = 0
        for (let slice of dataToPrint) {
            totalSize += slice['size'];
        }

        let degreeStart = 0;
        let degreeEnd = 0;

        let colorid = 0

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

        for (let slice of dataToPrint) {
            //Calculate degrees
            degreeEnd = 360 * slice['size'] / totalSize;
            let sliceEntity = generateDoughnutSlice(degreeStart, degreeEnd, 1, colorid, palette);
            //Move degree offset
            degreeStart += degreeEnd;

            //Prepare legend
            if (data.legend) {
                showLegend(sliceEntity, slice, element)
            }

            chart_entity.appendChild(sliceEntity);
            colorid++
        }

        //Print Title
        let title_3d = showTitle(title, font, color);
        element.appendChild(title_3d);
    }
}

function generateDoughnutSlice(position_start, arc, radius, colorid, palette) {
    let color = getColor(colorid, palette)
    console.log("Generating slice...")
    let entity = document.createElement('a-torus');
    entity.setAttribute('color', color);
    entity.setAttribute('rotation', {x: 90, y: 0, z: position_start})
    entity.setAttribute('arc', arc);
    entity.setAttribute('side', 'double');
    entity.setAttribute('radius', radius);
    entity.setAttribute('radius-tubular', radius/4);
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

function generateLegend(slice) {
    let text = slice['key'] + ': ' + slice['size'];

    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: 1, z: -2 });
    entity.setAttribute('rotation', { x: -90, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': slice['key'] + ': ' + slice['size'],
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.classList.add("babiaxrLegend")
    return entity;
}

function showLegend(sliceEntity, slice, element) {
    sliceEntity.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(slice);
        element.appendChild(legend);
    });

    sliceEntity.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        element.removeChild(legend);
    });
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
    var position = title.length / 6 
    console.log(entity)
    entity.setAttribute('position', {x: -position, y: 0.5, z: 2})
    entity.setAttribute('rotation', {x: -90, y: 0, z: 0})
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
