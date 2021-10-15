let findProdComponent = require('../others/common').findProdComponent;
let findNavComponent = require('../others/common').findNavComponent;
let parseJson = require('../others/common').parseJson;

class Selectable {
    /*
     * @param list {array} List of items to select from
     * @param field {string} Field name used to select (present in all items)
     */
    constructor(list, field, current, step, speed) {
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
        if (!step){
            this.step = 1
        } else {
            this.step = step;
        }
        if (!speed){
            this.speed = 1
        } else {
            this.speed = speed;
        }
        if (current == -1){
            this.current = 0
        } else {
            this.current = current;
        }
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
        data: { type: 'string' },
        // Current value of timeline
        current_value: { type: 'number', default: 0},
        // Current speed
        speed: { type: 'number', default: 0},
        // Current step
        step: { type: 'number', default: 0},
        // Current direction
        direction: { type: 'string', default: ''},
        // Current state
        state: { type: 'string', default: ''},
    },

    multiple: false,
    interval: undefined,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () { 
        this.notiBuffer = new NotiBuffer();
        this.navNotiBuffer = new NotiBuffer();
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
        if (data.controller != oldData.controller){
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
        if (data.current_value && data.current_value != oldData.current_value) {
            this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current-1]})
            this.setSelect(data.current_value - 1)
        }
        if ((data.direction) && (data.direction != oldData.direction)) {
            if (data.direction != 'rewind') {
                if (this.selectable.current != this.selectable.length){
                    this.selectable.current += 2
                }
            } else {
                if (this.selectable.current < 1){
                    this.selectable.current = 0
                } else {
                    this.selectable.current -= 2
                }
            }
        }
        
        if (data.step && (data.step != oldData.step)) {
            this.selectable.step = data.step
            this.navNotiBuffer.set({type: 'step', value: data.step})
            if (this.data.direction != 'rewind') {
                if (this.selectable.current + data.step >= this.selectable.length){
                    this.selectable.current = this.selectable.length - 1
                } else {
                    this.selectable.current += data.step - 1
                }
            } else {
                if (this.selectable.current - data.step <= 0){
                    this.selectable.current = 0
                } else {
                    this.selectable.current -= data.step + 1
                }
            }
        }
        if (data.speed && (data.speed != oldData.speed)){
                let timeout = this.data.timeout / data.speed
                this.navNotiBuffer.set({type: 'speed', value: data.speed})
                let self = this
                clearInterval(this.interval);
                this.interval = window.setInterval(function () {
                    self.loop()
                }, timeout);
        }


        if (el.components.networked){
            if ((el.components.networked.data.owner != NAF.clientId) && (el.components.networked.data.owner != 'scene')){
                if ((data.state == 'pause') && (data.state != oldData.state)) {
                    this.navNotiBuffer.set('pause')
                }
            }
        }
    },

    nextSelect: function() {
        if (this.selectable.current > this.selectable.length - 1){
            this.selectable.current = this.selectable.length - 1
            this.el.setAttribute('babia-selector','state', 'pause');
            this.navNotiBuffer.set('pause')
        } else {
            this.newData = this.selectable.next();
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current-1]})
            this.babiaMetadata = { id: this.selectable.current};
        }
    },

    prevSelect: function() {
        if (this.selectable.current >= 0){
            this.newData = this.selectable.prev();
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current+1]})
            this.babiaMetadata = { id: this.selectable.current };
        } else {
            this.selectable.current = 0
            this.el.setAttribute('babia-selector','state', 'pause');
            this.navNotiBuffer.set('pause')
        } 
    },

    setSelect: function(value) {
        if (((value != this.selectable.current - 1) && (this.data.direction != 'rewind')) || ((value != this.selectable.current + 1) && (this.data.direction === 'rewind'))) {
            this.newData = this.selectable.setValue(value);
            if (this.data.direction != 'rewind') {
                this.babiaMetadata = { id: value++ };
            } else {
                this.babiaMetadata = { id: value-- };
                this.selectable.current -=2
            }
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: value, label: this.selectable.selectors[value-1]});
        }
    },

    loop: function() {
        if (this.data.state != 'pause') {
            if (this.data.direction != 'rewind') {
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
        if (!this.selectable){
            this.selectable = new Selectable(_data, this.data.select, this.data.current_value, this.data.step); 
        }
        this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current-1]})
        let self = this;
        this.nextSelect();
        this.interval = window.setInterval(function () {
            self.loop()
        }, self.data.timeout * self.selectable.speed);
      },

      processEvent: function(event){
            if(event.includes('pause')) {
                this.el.setAttribute('babia-selector','state', 'pause');
            } else if (event.includes('play')) {
                this.el.setAttribute('babia-selector','state', 'play');
            } else if (event.includes('forward')) {
                this.el.setAttribute('babia-selector','direction', 'forward');
            } else if (event.includes('rewind')) {
                this.el.setAttribute('babia-selector','direction', 'rewind');
            } else if (event.includes('babiaSetPosition')) {
                this.el.setAttribute('babia-selector','state','pause');
                this.setSelect(parseInt(event.substring(16), 10))
                this.navNotiBuffer.set('pause')
            } else if (event.includes('babiaSetStep')) {
                this.el.setAttribute('babia-selector', 'step', parseInt(event.substring(12), 10))
            } else if (event.includes('babiaSetSpeed')) {
                this.el.setAttribute('babia-selector', 'speed', parseInt(event.substring(13), 10))
            }
    },
});

