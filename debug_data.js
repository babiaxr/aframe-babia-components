/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('debug_data', {
    schema: {
        inputEvent: { type: 'string' }
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

        if (data.input && data.output) {
            listenEvent(data, el);
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
        if (data !== oldData) {
            if (data.inputEvent !== oldData.inputEvent) {
                console.log("Change event because from has changed")
                // Remove the event of the old interaction
                el.removeEventListener(data.inputEvent, function (e) { })
                // Listen and map the new event
                listenEvent(data, el);
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

let listenEvent = (data, el) => {
    el.addEventListener(data.inputEvent, function (e) {
        // Dispatch/Trigger/Fire the event
        showDebugPlane(data, el)
    });
}

let showDebugPlane = (data, el) => {
    if (!el.querySelector('.debug_data')) {
        // Get data from the attribute of the entity
        let debugPanel = generateDebugPanel(data, el, el.getAttribute('baratariaData'));
        el.appendChild(debugPanel)
    }
}

function generateDebugPanel(data, el, dataToShow) {
    const HEIGHT_PLANE_DEBUG = 10
    const WIDTH_PLANE_DEBUG = 10
    let entity = document.createElement('a-plane');
    entity.setAttribute('color', 'white');
    entity.setAttribute('class', 'debug_data');
    entity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    entity.setAttribute('height', WIDTH_PLANE_DEBUG);
    let parentPos = el.getAttribute("position")
    let parentWidth = 0;
    let parentHeight = 0;
    if (el.getAttribute("geometry")) {
        if (el.components.geometry.data.primitive === "box") {
            parentWidth = el.getAttribute("geometry").width/2
            parentHeight = el.getAttribute("geometry").height/2
        } else if (el.components.geometry.data.primitive === "sphere") {
            parentWidth = el.getAttribute("geometry").radius
        } else {
            parentWidth = 0
            parentHeight = 0
        }
        
    }
    entity.setAttribute('position', { x: parentPos.x + parentWidth + WIDTH_PLANE_DEBUG / 2, y: 0 - parentHeight + HEIGHT_PLANE_DEBUG / 2, z: parentPos.z });

    let textEntity = document.createElement('a-text');
    textEntity.setAttribute('value', JSON.stringify(dataToShow));
    textEntity.setAttribute('width', HEIGHT_PLANE_DEBUG);
    textEntity.setAttribute('height', WIDTH_PLANE_DEBUG);
    textEntity.setAttribute('color', 'black');
    textEntity.setAttribute('position', { x: 0 - entity.getAttribute('width') / 2, y: 0 - el.getAttribute("height") / 2, z: 0 });

    entity.appendChild(textEntity)
    return entity;
}