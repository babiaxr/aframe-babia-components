/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-queryjson', {
    schema: {
        url: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        // Buffer for setting the data obtained and notifying consumers
        this.notiBuffer = new NotiBuffer();
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let object = JSON.parse(data.data);
            this.notiBuffer.set(object);        
        } else if (oldData.url !== data.url) {
            this.getJSON(data.url);
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

    /*
 *  Asynchronous function to get a JSON document.
 *  Returns a promise that resolves to the object corresponding to the
 *  retrieved JSON document, or to undefined, if some error happened.
 *  It is non blocking, since it gives a promise. No value has to be 
 *  obtained once fulfilled and all the synchronous code is inside the 
 *  function (two awaits that block the code until promises are fulfilled)
 */

    getJSON: async function(url) { 
        let response = await fetch(url);
        if (response.status == 200) {
            let json = await response.json();
            // TODO: throw error if json is not in the right format
            this.notiBuffer.set(json);
            return;
        } 
        throw new Error(response.status);
    },// Try-catch to get and print errors outside

 
})

