/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-querier_json', {
    schema: {
        url: { type: 'string' },
        embedded: { type: 'string' }
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
        if (data.url) {
            requestJSONDataFromURL(data, el)
        } else if (data.embedded) {
            parseEmbeddedJSONData(data, el)
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

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


let requestJSONDataFromURL = (data, el) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', data.url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            //console.log("data OK in request.response", request.response)

            // Save data
            if (typeof request.response === 'string' || request.response instanceof String) {
                data.dataRetrieved = JSON.parse(request.response)
            } else {
                data.dataRetrieved = request.response
            }
            el.setAttribute("babiaData", JSON.stringify(data.dataRetrieved))

            // Dispatch/Trigger/Fire the event
            el.emit("dataReady" + el.id, data.dataRetrieved)

        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        }
    };
    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
    };
    request.send();
}

let parseEmbeddedJSONData = (data, el) => {
    // Save data
    data.dataRetrieved = JSON.parse(data.embedded)
    el.setAttribute("babiaData", data.embedded)

    // Dispatch/Trigger/Fire the event
    el.emit("dataReady" + el.id, data.embedded)
}