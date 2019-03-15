/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('vismapper', {
    schema: {
        // Data
        dataToShow: { type: 'string' },
        // Geo
        width: { type: 'string' },
        depth: { type: 'string' },
        height: { type: 'string' },
        radius: { type: 'string' },
        // For charts
        x_axis: { type: 'string' }
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
        if (data.dataToShow) {
            data.dataToShow = JSON.parse(data.dataToShow)
            if (el.components.geometry.data.primitive === "box") {
                el.setAttribute("geometry", "height", (data.dataToShow[data.height] / 100))
                el.setAttribute("geometry", "width", data.dataToShow[data.width] || 2)
                el.setAttribute("geometry", "depth", data.dataToShow[data.depth] || 2)
                let oldPos = el.getAttribute("position")
                el.setAttribute("position", { x: oldPos.x, y: data.dataToShow[data.height] / 200, z: oldPos.z })
            } else if (el.components.geometry.data.primitive === "sphere") {
                el.setAttribute("geometry", "radius", (data.dataToShow[data.radius] / 10000) || 2)
                let oldPos = el.getAttribute("position")
                el.setAttribute("position", { x: oldPos.x, y: data.dataToShow[data.height], z: oldPos.z })
            } else if (el.components.simplebarchart) {
                let list = generate2Dlist()
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

let generate2Dlist = (data) => {
    return data
}