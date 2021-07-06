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
        this.step = 1
    }

    next() {
        let selected = this.data[this.selectors[this.current]];
        if (this.current + this.step < this.length - 1){
            this.current += this.step;
        } else if (this.current = this.length - 1) {
            this.current = this.length
        } else {
            this.current = this.length - 1
        }
        return(selected);
    }

    prev() {
        let selected = this.data[this.selectors[this.current]];
        if (this.current + this.step > 0){
            this.current -= this.step;
        } else {
            this.current = 0
        }
        return(selected);
    }

    setValue(value)  {
        let selected = this.data[this.selectors[value]];
        this.current = value + 1;
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
    speed: undefined,
    interval: undefined,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () { 

        this.isPaused = false
        this.toPresent = true
        this.speed = 1

        this.el.addEventListener('babiaStop',  _listener = (e) => {
            this.isPaused = true
        })

        this.el.addEventListener('babiaContinue',  _listener = (e) => {
            this.isPaused = false
        })

        this.el.addEventListener('babiaToPresent',  _listener = (e) => {
            this.toPresent = true
            if (this.selectable.current != this.selectable.length){
                this.selectable.current += 2
            }
        })

        this.el.addEventListener('babiaToPast',  _listener = (e) => {
            this.toPresent = false
            if (this.selectable.current < 1){
                this.selectable.current = 0
            } else {
                this.selectable.current -= 2
            }
        })

        this.el.addEventListener('babiaSetPosition',  _listener = (e) => {
            if (e.target == this.el){
                this.isPaused = true
                this.setSelect(e.detail)
                this.selectorController.emit('babiaStop')
            }
        })

        this.el.addEventListener('babiaSetStep',  _listener = (e) => {
            this.selectable.step = e.detail
            if (this.toPresent){
                if (this.current + this.selectable.step > this.selectable.length){
                    this.current = this.selectable.length - 1
                } else {
                    this.current += this.selectable.step - 1
                }
            } else {
                if (this.current - this.selectable.step < 0){
                    this.current = 0
                } else {
                    this.current -= this.selectable.step + 1
                }
                
            }
        })

        this.el.addEventListener('babiaSetSpeed',  _listener = (e) => {
            this.speed = e.detail
            let timeout = this.data.timeout / this.speed
            let self = this
            clearInterval(this.interval);
            this.interval = window.setInterval(function () {
                self.loop(self)
            }, timeout);
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
                this.selectorController.emit("babiaSelectorDataReady")
            }

            self.nextSelect();
            self.interval = window.setInterval(function () {
                self.loop(self)
            }, data.timeout * self.speed);
            
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

                    self.nextSelect();
                    self.interval = window.setInterval(function () {
                        self.loop(self)
                    }, data.timeout * self.speed);
    
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
        if (this.selectable.current > this.selectable.length - 1){
            this.selectable.current = this.selectable.length - 1
            this.isPaused = true
            this.selectorController.emit('babiaStop')
        }
        this.babiaData = this.selectable.next();
        this.babiaMetadata = { id: this.selectable.current };
        // Dispatch interested events
        dataReadyToSend("babiaData", this);
        this.selectorController.emit("babiaSelectorDataUpdated", this)
    },

    prevSelect: function() {
        if (this.selectable.current >= 0){
            this.babiaData = this.selectable.prev();
            this.babiaMetadata = { id: this.selectable.current };
            // Dispatch interested events
            dataReadyToSend("babiaData", this);  
            this.selectorController.emit("babiaSelectorDataUpdated", this)
        } else {
            this.selectable.current = 0
            this.isPaused = true
            this.selectorController.emit('babiaStop')
        }
    },

    setSelect: function(value) {
        this.babiaData = this.selectable.setValue(value);
        if (this.toPresent) {
            this.babiaMetadata = { id: value++ };
        } else {
            this.babiaMetadata = { id: value-- };
            this.selectable.current -=2
        }
        // Dispatch interested events
        dataReadyToSend("babiaData", this);
        this.selectorController.emit("babiaSelectorDataUpdated", this)
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

    loop: function(self) {
        if (!self.isPaused){
            if (self.selectorController){
                self.selectorController.emit("babiaSelectorDataUpdated", self)
            }

            if(self.toPresent){
                self.nextSelect();
            } else {
                self.prevSelect();
            }
        }
    },

});

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
    });
  }

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaSelectorDataReady", propertyName)
}
