/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('querier_github', {
    schema: {
        user: { type: 'string' },
        token: { type: 'string' },
        repos: { type: 'array' }
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

        if (data.user && (data.repos.length === 0)) {
            requestAllReposFromUser(data, el)
        } else if (data.repos.length > 0) {
            requestReposFromList(data, el)
        }

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        var data = this.data;
        var el = this.el;

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

let requestReposFromList = (data, el) => {
    let dataOfRepos = {}

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
                dataOfRepos[rawData.name] = rawData;

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
    })

    // Save data
    data.dataRetrieved = dataOfRepos
    el.setAttribute("baratariaData", JSON.stringify(data.dataRetrieved))

    // Dispatch/Trigger/Fire the event
    el.emit("dataReady" + el.id, data.dataRetrieved)
}


let requestAllReposFromUser = (data, el) => {
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
            data.dataRetrieved = allReposParse(JSON.parse(request.response))
            el.setAttribute("baratariaData", JSON.stringify(data.dataRetrieved))

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

let allReposParse = (data) => {
    let dataParsed = {}
    data.forEach((e, i) => {
        dataParsed[e.name] = e
    });
    return dataParsed
}