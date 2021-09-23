let findProdComponent = require('../others/common').findProdComponent;
let findNavComponent = require('../others/common').findNavComponent;
let parseJson = require('../others/common').parseJson;

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
        if (this.current + this.step <= this.length - 1){
            this.current += this.step;
        } else if (this.current = this.length - 1) {
            this.current = this.length
        } else {
            this.current = this.length
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

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

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
        timeout: { type: 'number', default: 6000 },
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
        this.notiBuffer = new NotiBuffer();
        this.navNotiBuffer = new NotiBuffer();

        this.isPaused = false
        this.toPresent = true
        this.speed = 1
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    babiaMetadata: { id: 0 },

    update: function (oldData) {
        let data = this.data;
        let el = this.el;
    
        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let _data = parseJson(data.data);
            this.processData(_data)
        
        } else {
            if (data.from !== oldData.from) {
                // Unregister for old producer
                if (this.prodComponent) { 
                    this.prodComponent.notiBuffer.unregister(this.notiBufferId) 
                };
                // Register for the new one
                this.prodComponent = findProdComponent(data, el, 'babia-selector')
                if (this.prodComponent.notiBuffer){
                    this.notiBufferId = this.prodComponent.notiBuffer.register(this.processData.bind(this))
                }
            };    
        }

        // find controller
        if (data.controller){
            this.selectorController = document.querySelector('#' + data.controller)
            // Unregister for old navigator
            if (this.navComponent) { 
                this.navComponent.notiBuffer.unregister(this.navNotiBufferId, this) 
            };
            // Register for the new one
            this.navComponent = findNavComponent(data, el)
            if (this.navComponent.notiBuffer){
                this.navNotiBufferId = this.navComponent.notiBuffer.register(this.processEvent.bind(this), this)
            }
        }
        
        
    },

    nextSelect: function() {
        if (this.selectable.current > this.selectable.length - 1){
            this.selectable.current = this.selectable.length - 1
            this.isPaused = true

            this.navNotiBuffer.set('babiaStop')
        }
        this.newData = this.selectable.next();
        this.notiBuffer.set(this.newData);

        this.navNotiBuffer.set(this.selectable.current)
        this.babiaMetadata = { id: this.selectable.current};
    },

    prevSelect: function() {
        if (this.selectable.current >= 0){
            this.newData = this.selectable.prev();
            this.babiaMetadata = { id: this.selectable.current };
            
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set(this.selectable.current)
        } else {
            this.selectable.current = 0
            this.isPaused = true

            this.navNotiBuffer.set('babiaStop')
        } 
    },

    setSelect: function(value) {
        if (((value != this.selectable.current - 1) && this.toPresent) || ((value != this.selectable.current + 1) && !this.toPresent)) {
            this.newData = this.selectable.setValue(value);
            if (this.toPresent) {
                this.babiaMetadata = { id: value++ };
            } else {
                this.babiaMetadata = { id: value-- };
                this.selectable.current -=2
            }
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set(value);
        }
    },

    loop: function() {
        if (!this.isPaused){
            if(this.toPresent){
                this.nextSelect();
            } else {
                this.prevSelect();
            }
        }
    },

    /**
    * Producer component
    */
    prodComponent: undefined,

    /**
    * Navigation component
    */
    navComponent: undefined,

    /**
    * Producer NotiBuffer identifier
    */
    prodNotiBufferId: undefined,

    /**
    * Navigation NotiBuffer identifier
    */
    navNotiBufferId: undefined,

    /**
     * Where new data is stored
     */
    newData: undefined,

    processData: function (_data) {
        // Create a Selectable object, and set the updating interval
        this.selectable = new Selectable(_data, this.data.select); 
        this.navNotiBuffer.set(this.selectable.current)
        let self = this;
        this.nextSelect();
        this.interval = window.setInterval(function () {
            self.loop()
        }, self.data.timeout * self.speed);
      },

      processEvent: function(event){
        if(event.includes('babiaStop')) {
            this.isPaused = true
        } else if (event.includes('babiaContinue')) {
            this.isPaused = false
        } else if (event.includes('babiaToPresent')) {
            this.toPresent = true
            if (this.selectable.current != this.selectable.length){
                this.selectable.current += 2
            }
        } else if (event.includes('babiaToPast')) {
            this.toPresent = false
            if (this.selectable.current < 1){
                this.selectable.current = 0
            } else {
                this.selectable.current -= 2
            }
        } else if (event.includes('babiaSetPosition')) {
                this.isPaused = true
                this.setSelect(parseInt(event.substring(16), 10))
                this.navNotiBuffer.set('babiaStop')
        } else if (event.includes('babiaSetStep')) {
            this.selectable.step = parseInt(event.substring(12), 10)
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
        }

        if (event.includes('babiaSetSpeed')) {
            this.speed = parseInt(event.substring(13), 10)
            let timeout = this.data.timeout / this.speed
            let self = this
            clearInterval(this.interval);
            this.interval = window.setInterval(function () {
                self.loop()
            }, timeout);
        }
      },
});

