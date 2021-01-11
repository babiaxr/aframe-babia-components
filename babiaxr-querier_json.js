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
        if (oldData.url !== data.url) {
            requestJSONDataFromURL(data, el)
        } else if (oldData.embedded !== data.embedded) {
            parseEmbeddedJSONData(data, el)
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

    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        el.components["babiaxr-querier_json"].interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (el.components["babiaxr-querier_json"].babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],
})


let requestJSONDataFromURL = (data, el) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', data.url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            // Save data
            let dataRetrieved
            if (typeof request.response === 'string' || request.response instanceof String) {
                dataRetrieved = JSON.parse(request.response)
            } else {
                dataRetrieved = request.response
            }

            // Check if a list
            if (!Array.isArray(dataRetrieved)) {
                console.error("Data must be an array")
                return
            }

            // Save
            el.components["babiaxr-querier_json"].babiaData = dataRetrieved
            el.components["babiaxr-querier_json"].babiaMetadata = {
                id: el.components["babiaxr-querier_json"].babiaMetadata.id++
            }

            // Dispatch/Trigger/Fire the event
            dataReadyToSend(el, "babiaData")

        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
            console.error("Error during requesting data", this.status, xhr.statusText)
        }
    };
    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
        console.error("Error during requesting data", this.status, xhr.statusText)
    };
    request.send();
}

let parseEmbeddedJSONData = (data, el) => {
    // Save data
    let dataRetrieved = JSON.parse(data.embedded)
    el.components["babiaxr-querier_json"].babiaData = dataRetrieved
    el.components["babiaxr-querier_json"].babiaMetadata = {
        id: el.components["babiaxr-querier_json"].babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend(el, "babiaData")
}

let dataReadyToSend = (el, propertyName) => {
    el.components["babiaxr-querier_json"].interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaQuerierDataReady", propertyName)
}
