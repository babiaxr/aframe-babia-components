/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('chartdata', {
    schema: {
        type: { type: 'string' },
        from: { type: 'string' }
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
        var data = this.data;
        var el = this.el;

        /**
         * Update or create chart component
         */
        if (data !== oldData) {
            let querierElement = document.getElementById(data.from)
            if (querierElement.getAttribute('dataEntity')) {
                let dataFromQuerier = JSON.parse(querierElement.getAttribute('dataEntity'));
                // Get data
                saveEntityData(data, el, dataFromQuerier)
                generateChart(data, el)
            } else {
                // Get data
                document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
                    saveEntityData(data, el, e.detail)
                    generateChart(data, el)
                })
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

let saveEntityData = (data, el, dataToSave) => {
    data.dataRetrieved = dataToSave
}


/*let generateChart = (data, el) => {
    if (data.type === "bars") {
        generateBarsChart(data, el)
    } else if (data.type === "bubbles") {
        generateBubblesChart(data, el)
    }
}*/


/**
 * 
 * Generate chart
 */
let generateChart = (data, el) => {
    
    let total = Math.sqrt(Object.keys(data.dataRetrieved).length)
    let chart = document.createElement('a-entity');
    chart.setAttribute('layout', 'type: box; columns: ' + total + '; margin: ' + 2.5 + '; plane: xz; align: center');


    for (let key in data.dataRetrieved) {
        let entity
        if (data.type === "bars") {
            entity = generateBar(key)
        } else if (data.type === "bubbles") {
            entity = generateBubble(key)
        }

        chart.appendChild(entity)
    }
    el.appendChild(chart)
}

/**
 * Bar element
 */
function generateBar(bar_key) {
    let parent = document.createElement('a-entity');
    let entity = document.createElement('a-entity');
    entity.setAttribute('geometry', 'primitive: box');
    entity.setAttribute('material', 'color: green');
    entity.setAttribute('visdata', 'from: queriertest; index:' + bar_key);
    entity.setAttribute('vismapper', "height: size");
    parent.appendChild(entity)
    return parent;
}

/**
 * Bubble element
 */
function generateBubble(key) {
    let parent = document.createElement('a-entity');
    let entity = document.createElement('a-entity');
    entity.setAttribute('geometry', 'primitive: sphere');
    entity.setAttribute('material', 'color: green');
    entity.setAttribute('visdata', 'from: queriertest; index:' + key);
    entity.setAttribute('vismapper', "height: open_issues; radius: size");
    parent.appendChild(entity)
    return parent;
}