let findDataComponent = require('../others/common').findDataComponent;

class Selectable {
    /*
     * @param list {array} List of items to select from
     * @param field {string} Field name used to select (present in all items)
     */
    constructor(list, field) {
        this.data = {};
        for (let item of list) {
            let selector = item[field];
            if ( this.data[selector] ) {
                this.data[selector].push(item);
            } else {
                this.data[selector] = [item];
            };
        }
        this.selectors = Object.keys(this.data).sort();
        this.length = this.selectors.length;
        this.current = 0;
    }

    next() {
        let selected = this.data[this.selectors[this.current]];
        this.current = (this.current + 1) % this.length;
        return(selected);
    }

    prev() {
        let selected = this.data[this.selectors[this.current]];
        this.current = (this.current - 1) % this.length;
        return(selected);
    }
};

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* Selector component for BabiaXR.
*/
AFRAME.registerComponent('babia-selector', {
    schema: {
        // Id of the querier where the data comes from
        from: { type: 'string' },
        // Id of the querier where the data comes from
        controller: { type: 'string' },
        // Field to use as selector
        select: { type: 'string', default: 'date'},
        // Timeout for moving to the next selection
        timeout: { type: 'number', default: 3000 },
        // data, for debugging, highest priority
        data: { type: 'string' }
    },

    multiple: false,

    isPaused: undefined,
    toPresent: undefined,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () { 

        this.isPaused = false
        this.toPresent = true

        this.el.addEventListener('babiaStop',  _listener = (e) => {
            this.isPaused = true
        })

        this.el.addEventListener('babiaContinue',  _listener = (e) => {
            this.isPaused = false
        })

        this.el.addEventListener('babiaToPresent',  _listener = (e) => {
            this.toPresent = true
        })

        this.el.addEventListener('babiaToPast',  _listener = (e) => {
            this.toPresent = false
        })
        

    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    babiaMetadata: { id: 0 },

    update: function (oldData) {
        let data = this.data;
        let el = this.el;
        let self = this;
    
        // find controller
        if (data.controller){
            this.selectorController = document.querySelector('#' + data.controller)
        }
        
        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let rawData = JSON.parse(data.data);
            this.selectable = new Selectable(rawData, data.select);

            if (this.selectorController){
                console.log('Mandando init a navigator')
                this.selectorController.emit("babiaSelectorDataReady")
            }

            window.setInterval(function () {
                self.nextSelect();
            }, data.timeout);
            this.nextSelect();
            
        } else {
            if (data.from !== oldData.from) {
                // Unregister for old querier
                if (this.dataComponent) { this.dataComponent.unregister(el) };
                // Find the new component and check if querier or filterdata from the event               
                let eventName = findDataComponent(this.data, el, this);
                // If changed to filterdata or to querier
                if (this.dataComponentEventName && this.dataComponentEventName !== eventName) {
                    el.removeEventListener(this.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                this.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(this.dataComponentEventName, _listener = (e) => {

                    // Get the data from the info of the event (propertyName)
                    self.dataComponentDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.dataComponentDataPropertyName]
    
                    // Create a Selectable object, and set the updating interval
                    self.selectable = new Selectable(rawData, data.select);

                    if (this.selectorController){
                        this.selectorController.emit("babiaSelectorDataReady", self)
                    }

                    window.setInterval(function () {
                        console.log('Esta pausado? ', self.isPaused)
                        if (!self.isPaused){
                            console.log('hacia presente? ', self.toPresent)
                            if(self.toPresent){
                                self.nextSelect();
                            } else {
                                self.prevSelect();
                            }

                            console.log('Estamos en: ', self.selectable.current)
                            
                            if (self.selectorController){
                                self.selectorController.emit("babiaSelectorDataUpdated", self)
                            }
                        }
                    }, data.timeout);
                    self.nextSelect();
    
                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)

                });
                // If there is data in the data component, get it
                if (self.dataComponent[self.dataComponentDataPropertyName]) {
                    let rawData = self.dataComponent[self.dataComponentDataPropertyName]
        
                    self.babiaData = rawData;
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }
        
                    // Dispatch interested events
                    dataReadyToSend("babiaData", self);
                };

                // Register to get an event when there is new data in the data component
                this.dataComponent.register(el);
            };    
        }
  
    },

    nextSelect: function() {
        if (this.selectable.current < this.selectable.length){
            this.babiaData = this.selectable.next();
            this.babiaMetadata = { id: this.babiaMetadata.id++ };
            // Dispatch interested events
            dataReadyToSend("babiaData", this);
        } else {
            this.isPaused = true
            this.selectorController.emit('babiaStop')
        }
    },

    prevSelect: function() {
        if (this.selectable.current >= 0){
            this.babiaData = this.selectable.prev();
            this.babiaMetadata = { id: this.babiaMetadata.id-- };
            // Dispatch interested events
            dataReadyToSend("babiaData", this);  
        } else {
            this.isPaused = true
            this.selectorController.emit('babiaStop')
        }

    },

    /**
     * Register function
     */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchSelectorEventOnElement(interestedElem, "babiaData")
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

    /**
     * Selector Controller
     */
    selectorController: undefined,

});

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
    });
  }

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaSelectorDataReady", propertyName)
}