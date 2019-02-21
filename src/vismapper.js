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
        debug: { type: 'boolean' }
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

        if (data.debug) {
            showDebugPlane(data, el);
        }
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
                el.setAttribute("position", "0 " + data.dataToShow[data.height] / 200 + " 0")
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


let showDebugPlane = (data, el) => {
    console.log("OK, debug mode activated")
    el.addEventListener("mouseenter", function (e) {
        //console.log(e.target)
        //e.target.setAttribute('scale', { x: 2, y: 2, z: 2 });
        let debugPanel = generateDebugPanel(data, el);
        el.appendChild(debugPanel)
    });
    el.addEventListener("mouseleave", function (e) {
        //console.log(e.target)
        //e.target.setAttribute('scale', { x: 2, y: 2, z: 2 });
        el.removeChild(el.childNodes[0])
    });
}

function generateDebugPanel(data, el) {
    const HEIGHT_PLANE_DEBUG = 10
    const WIDTH_PLANE_DEBUG = 10
    let entity = document.createElement('a-plane');
    entity.setAttribute('color', 'white');
    entity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    entity.setAttribute('height', WIDTH_PLANE_DEBUG);
    let parentPos = el.getAttribute("position")
    entity.setAttribute('position', {x: parentPos.x + el.getAttribute("geometry").width/2 + WIDTH_PLANE_DEBUG/2, y: 0 - el.getAttribute("geometry").height/2 + HEIGHT_PLANE_DEBUG/2, z: parentPos.z});

    let textEntity = document.createElement('a-text');
    textEntity.setAttribute('value', JSON.stringify(data.dataToShow));
    textEntity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    textEntity.setAttribute('height', WIDTH_PLANE_DEBUG);
    textEntity.setAttribute('color', 'black');
    textEntity.setAttribute('position', {x: 0 - entity.getAttribute('width')/2, y: 0 - el.getAttribute("height")/2, z: 0});

    entity.appendChild(textEntity)
    return entity;
}