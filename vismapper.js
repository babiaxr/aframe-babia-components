/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let MAX_SIZE_BAR = 10

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('vismapper', {
    schema: {
        // Data
        dataToShow: { type: 'string' },
        // Geo and charts
        width: { type: 'string' },
        depth: { type: 'string' },
        height: { type: 'string' },
        radius: { type: 'string' },
        // Only for charts
        slice: { type: 'string' },
        x_axis: { type: 'string' },
        z_axis: { type: 'string' }
    },

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
        let data = this.data;
        let el = this.el;

        /**
         * Update geometry component
         */
        if (data.dataToShow && data.dataToShow != oldData.dataToShow) {
            let dataJSON = JSON.parse(data.dataToShow)
            if (el.components.geometry) {
                if (el.components.geometry.data.primitive === "box") {
                    el.setAttribute("geometry", "height", (dataJSON[data.height] / 100))
                    el.setAttribute("geometry", "width", dataJSON[data.width] || 2)
                    el.setAttribute("geometry", "depth", dataJSON[data.depth] || 2)
                    let oldPos = el.getAttribute("position")
                    el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height] / 200, z: oldPos.z })
                } else if (el.components.geometry.data.primitive === "sphere") {
                    el.setAttribute("geometry", "radius", (dataJSON[data.radius] / 10000) || 2)
                    let oldPos = el.getAttribute("position")
                    el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height], z: oldPos.z })
                }
            } else if (el.components.geosimplebarchart) {
                let list = generate2Dlist(data, dataJSON, "x_axis")
                el.setAttribute("geosimplebarchart", "data", JSON.stringify(list))
            } else if (el.components.geopiechart) {
                let list = generate2Dlist(data, dataJSON, "slice")
                el.setAttribute("geopiechart", "data", JSON.stringify(list))
            } else if (el.components.geo3dbarchart) {
                let list = generate3Dlist(data, dataJSON, "3dbars")
                el.setAttribute("geo3dbarchart", "data", JSON.stringify(list))
            } else if (el.components.geobubbleschart) {
                let list = generate3Dlist(data, dataJSON, "bubbles")
                el.setAttribute("geobubbleschart", "data", JSON.stringify(list))
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

let generate2Dlist = (data, dataToProcess, key_type) => {
    let list = []
    Object.values(dataToProcess).forEach(value => {
        let item = {
            "key": value[data[key_type]],
            "size": value[data.height]
        }
        list.push(item)
    });
    return list
}

let generate3Dlist = (data, dataToProcess, chart_type) => {
    let list = []
    if (chart_type === "3dbars") {

        Object.values(dataToProcess).forEach(value => {
            let item = {
                "key": value[data.x_axis],
                "key2": value[data.z_axis],
                "size": value[data.height]
            }
            list.push(item)
        });
    } else if (chart_type === "bubbles") {
        Object.values(dataToProcess).forEach(value => {
            let item = {
                "key": value[data.x_axis],
                "key2": value[data.z_axis],
                "height": value[data.height],
                "radius": value[data.radius]
            }
            list.push(item)
        });
    }
    return list
}

function normalize(val, min, max) { return (val - min) / (max - min); }