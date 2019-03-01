/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('vismapper', {
    schema: {
        width: { type: 'string' },
        depth: { type: 'string' },
        height: { type: 'string' },
        radius: { type: 'string' }
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
         * Update geometry component
         */
        if (data.dataToShow) {
            if (el.components.geometry.data.primitive === "box") {
                el.components.geometry.data.height = (data.dataToShow[data.height] / 100)
                el.components.geometry.data.width = data.dataToShow[data.width] || 2
                el.components.geometry.data.depth = data.dataToShow[data.depth] || 2
                let oldPos = el.getAttribute("position")
                el.setAttribute("position", { x: oldPos.x, y: data.dataToShow[data.height] / 200, z: oldPos.z })
            } else if (el.components.geometry.data.primitive === "sphere") {
                el.components.geometry.data.radius = (data.dataToShow[data.radius] / 10000) || 2
                let oldPos = el.getAttribute("position")
                el.setAttribute("position", { x: oldPos.x, y: data.dataToShow[data.height], z: oldPos.z })
            }
            el.components.geometry.update(el.components.geometry.data)
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
