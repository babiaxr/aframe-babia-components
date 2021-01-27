/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-querier_github', {
    schema: {
        user: { type: 'string' },
        token: { type: 'string' },
        repos: { type: 'array' },
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
    init: function () { },

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
            if (oldData.user !== data.user || oldData.repos !== data.repos || oldData.token !== data.token) {
                if (data.user && (data.repos.length === 0)) {
                    requestAllReposFromUser(data, el, self)
                } else if (data.repos.length > 0) {
                    requestReposFromList(data, el, self)
                }
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

let requestReposFromList = (data, el, self) => {
    let dataOfRepos = []

    data.repos.forEach((e, i) => {
        // Create a new request object
        let request = new XMLHttpRequest();

        // Create url
        let url = "https://api.github.com/repos/" + data.user + "/" + e + "?_=" + new Date().getTime();

        // Initialize a request
        request.open('get', url, false)
        // Send it
        request.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log("data OK in request.response", el.id)

                // Save data
                let rawData = JSON.parse(request.response)
                dataOfRepos.push(rawData);

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
    })

    // Save data
    self.babiaData = dataOfRepos
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Dispatch/Trigger/Fire the event
    dataReadyToSend("babiaData", self)
}


let requestAllReposFromUser = (data, el, self) => {
    // Create a new request object
    let request = new XMLHttpRequest();

    // Create url
    let url = "https://api.github.com/users/" + data.user + "/repos?_=" + new Date().getTime();

    // Initialize a request
    request.open('get', url)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            console.log("data OK in request.response", el.id)

            // Save data
            self.babiaData = allReposParse(JSON.parse(request.response))
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

let allReposParse = (data) => {
    let dataParsed = []
    data.forEach((e, i) => {
        dataParsed.push(e)
    });
    return dataParsed
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