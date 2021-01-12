/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-querier_es', {
    schema: {
        elasticsearch_url: { type: 'string' },
        index: { type: 'string' },
        query: { type: 'string' },
        size: { type: 'int', default: 10 },
        user: { type: 'string' },
        password: { type: 'string' },
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
        let data = this.data;
        let el = this.el;
        let self = this;

        // Highest priority to data
        if (data.data) {
            parseEmbeddedJSONData(data.data, el, self)
        } else {
            if (data.elasticsearch_url && data.index) {
                requestJSONDataFromES(data, el, self)
            } else {
                console.error("elasicsearch_url, index and body must be defined")
            }
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;
        let self = this;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            parseEmbeddedJSONData(data.data, el, self)
        } else {
            if (data.elasticsearch_url !== oldData.elasticsearch_url ||
                data.index !== oldData.index ||
                data.query !== oldData.query ||
                data.size !== oldData.size) {
                requestJSONDataFromES(data, el, self)
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
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements
     */
    interestedElements: [],
})


let requestJSONDataFromES = (data, el, self) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', `${data.elasticsearch_url}/${data.index}/_search?size=${data.size}&${data.query}`)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            // Save data
            if (typeof request.response === 'string' || request.response instanceof String) {
                dataRaw = JSON.parse(request.response).hits.hits
                let dataRetrieved = []
                for (let i = 0; i < dataRaw.length; i++) {
                    dataRetrieved[i] = dataRaw[i]._source
                }
            } else {
                // Why this case
                let dataRetrieved = []
                console.error("Unexpected response", request.response)
            }

            // Save
            self.babiaData = dataRetrieved
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch/Trigger/Fire the event
            dataReadyToSend("babiaData", self)

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

let parseEmbeddedJSONData = (embedded, el, self) => {
    // Save data
    let dataRetrieved = JSON.parse(embedded)
    self.babiaData = dataRetrieved
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaQuerierDataReady", propertyName)
}
