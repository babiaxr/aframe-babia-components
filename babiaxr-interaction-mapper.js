/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-interaction-mapper', {
    schema: {
        input: { type: 'string' },
        output: { type: 'string' }
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
            mapEvents(data, el);
        }
    },

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
        // If entry it means that the properties changed
        if (data !== oldData) {
            if (data.input !== oldData.input || data.output !== oldData.output) {
                console.log("Change event because from has changed")
                // Remove the event of the old interaction
                el.removeEventListener(oldData.input, function (e) { })
                // Listen and map the new event
                mapEvents(data, el);
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

let mapEvents = (data, el) => {
    el.addEventListener(data.input, function (e) {
        // Dispatch/Trigger/Fire the event
        el.emit(data.output, e, false);
    });
}