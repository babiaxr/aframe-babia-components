/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-treegenerator', {
    schema: {
        from: { type: 'string' },
        field: { type: 'string' },
        split_by: { type: 'string' },
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
            let rawData = parseEmbeddedJSONData(data.data)

            // Generating tree, save the references
            let dataTreeFormat = generateTree(data, rawData)
            self.babiaData = dataTreeFormat
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // Dispatch interested events
            dataReadyToSend("babiaData", self)
        } else {

            if (data.from !== oldData.from) {
                // Unregister for old querier/filterdata
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    // Get again the raw data from the querier/filterdata
                    self.dataComponentDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

                    // Generate Tree, save the new references
                    let dataTreeFormat = generateTree(data, rawData)
                    self.babiaData = dataTreeFormat
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }

                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed splitter (is mandatory, so it has been defined, first time is undefined)
            if ((oldData.split_by && data.split_by !== oldData.split_by)
                || (oldData.field && data.field !== oldData.field)) {
                // Get again the raw data from the querier/filterdata
                let rawData = self.dataComponent[self.dataComponentDataPropertyName]

                // Generate Tree, save the new references
                let dataTreeFormat = generateTree(data, rawData)
                self.babiaData = dataTreeFormat
                self.babiaMetadata = {
                    id: self.babiaMetadata.id++
                }

                // Dispatch interested events
                dataReadyToSend("babiaData", self)
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
    * Querier/filterdata component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier/filterdata where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,

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

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babia-queryjson']) {
            self.dataComponent = dataElement.components['babia-queryjson']
        } else if (dataElement.components['babia-queryes']) {
            self.dataComponent = dataElement.components['babia-queryes']
        } else if (dataElement.components['babia-querygithub']) {
            self.dataComponent = dataElement.components['babia-querygithub']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babia-queryjson']) {
            self.dataComponent = el.components['babia-queryjson']
        } else if (el.components['babia-queryes']) {
            self.dataComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub']) {
            self.dataComponent = el.components['babia-querygithub']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
            } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}


function generateTree(data, paths) {
    let tree = [];

    for (let i = 0; i < paths.length; i++) {
        let path = paths[i][data.field].split(data.split_by);
        let currentLevel = tree;
        for (let j = 0; j < path.length; j++) {
            // Check if starts with the split char
            if (!path[j]) {
                continue
            }

            let part = path[j];

            let existingPath = findWhere(currentLevel, 'id', part);

            if (existingPath) {
                currentLevel = existingPath.children;
            } else {
                let newPart = {}
                if (j === path.length - 1) {
                    newPart = paths[i]
                } else {
                    newPart['children'] = []
                }
                newPart['id'] = part
                

                currentLevel.push(newPart);
                currentLevel = newPart.children;
            }
        }
    }
    return tree;

    function findWhere(array, key, value) {
        t = 0; // t is used as a counter
        while (t < array.length && array[t][key] !== value) { t++; }; // find the index where the id is the as the aValue

        if (t < array.length) {
            return array[t]
        } else {
            return false;
        }
    }
}

let parseEmbeddedJSONData = (embedded) => {
    let dataRetrieved = JSON.parse(embedded)
    return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaTreeDataReady", propertyName)
}