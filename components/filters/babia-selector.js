let findProdComponent = require('../others/common').findProdComponent;
let findNavComponent = require('../others/common').findNavComponent;
let parseJson = require('../others/common').parseJson;

class Selectable {
    /**
     * Create a new Selectable object.
     * 
     * @param {string} field - Field of the data to select.
     * @param {number} [current=-2] - Current value of the selection. If -2, it will be set to 0.
     * @param {number} [step=1] - Step value for the selection.
     * @param {number} [speed=1] - Speed value for the selection.
     * @param {string} [state='play'] - State of the selection. 'play' or 'pause'.
     * @param {string} [direction='forward'] - Direction of the selection. 'forward' or 'rewind'.
     */
    constructor(field, current, step, speed, state, direction) {
        this.field = field;
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
        if (current == -2){
            this.current = 0
        } else {
            this.current = current;
        }
        if (!state) {
            this.state = 'play';
        } else {
            this.state = state;
        }
        if (!direction){
            this.direction = 'forward'
        } else {
            this.direction = direction;
        }
    }

    /**
     * Update the internal data structure with a new list of items
     * @param list {array} List of items to select from
     */
    updateData(list) {
        this.data = {};
        for (let item of list) {
            let selector = item[this.field];
            if ( this.data[selector] ) {
                this.data[selector].push(item);
            } else {
                this.data[selector] = [item];
            };
        }
        this.selectors = Object.keys(this.data).sort();
        this.length = this.selectors.length;
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
        if (this.current - this.step >= 0){
            this.current -= this.step;
        } else {
            this.current = -1
        }
        return(selected);
    }

    setValue(value)  {
        let selected = this.data[this.selectors[value]];
        if (this.direction != 'rewind'){
            if (value > this.length) {
                this.current = this.length
            } else if (value < 1) {
                this.current = 1
            } else {
                this.current = value + 1
            }
        } else {
            if (value > this.length - 2) {
                this.current = this.length - 2
            } else if (value < -1) {
                this.current = -1
            } else {
                this.current = value - 1
            }
        }
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
        controller: { type: 'string', default: '' },
        // Field to use as selector
        select: { type: 'string', default: 'date'},
        // Timeout for moving to the next selection
        timeout: { type: 'number', default: 6000 },
        // data, for debugging, highest priority
        data: { type: 'string' },
        // Current value of timeline
        current_value: { type: 'number', default: -2},
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
        // Create a Selectable object, set its values
        this.selectable = new Selectable(this.data.select, this.data.current_value, this.data.step, this.data.speed); 
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
        if (data.controller && (data.controller != oldData.controller)){
            this.selectorController = document.querySelector('#' + data.controller)
            // Unregister for old navigator
            if (this.navComponent) { 
                this.navComponent.notiBuffer.unregister(this.navNotiBufferId, this) 
                if (el.components.networked){
                    this.removeOldNavListener(this.navComponent.el)
                }
            };
            // Register for the new one
            this.navComponent = findNavComponent(data, el)
            if (this.navComponent.notiBuffer){
                this.navNotiBufferId = this.navComponent.notiBuffer.register(this.processEvent.bind(this), this)
            }
            if (el.components.networked){
                this.addMultiuserMode(this.navComponent.el)
            }
        }
    
        if ((data.direction) && (data.direction != oldData.direction)) {
            if (data.direction != 'rewind') {
               if (this.selectable.current != this.selectable.length){
                    this.selectable.current += 2
                }
                if (this.navNotiBuffer){
                    this.navNotiBuffer.set('forward')
                }
            } else {
                if (this.selectable.current < 1){
                    this.selectable.current = 0
                } else {
                    this.selectable.current -= 2
                }
                if (this.navNotiBuffer){
                    this.navNotiBuffer.set('rewind')
                }
            }
        }
        
        if (data.step && (data.step != this.selectable.step)) {
            this.selectable.step = data.step
            this.navNotiBuffer.set({type: 'step', value: data.step})
            if (this.data.direction != 'rewind') {
                if (this.selectable.current + data.step > this.selectable.length){
                    this.selectable.current = this.selectable.length
                } else {
                    this.selectable.current += data.step - 1
                }
            } else {
                if (this.selectable.current - data.step <= 0){
                    this.selectable.current = -1
                } else {
                    this.selectable.current -= data.step + 1
                }
            }
        }
        if (data.speed && (data.speed != this.selectable.speed)){
            this.selectable.speed = data.speed
                let timeout = this.data.timeout / data.speed
                this.navNotiBuffer.set({type: 'speed', value: data.speed})
                let self = this
                clearInterval(this.interval);
                this.interval = window.setInterval(function () {
                    self.loop()
                }, timeout);
        }

        // Only in multiuser
        if (el.components.networked){
            // You are not the owner and you are not alone in the scene
            if ((el.components.networked.data.owner != NAF.clientId) && (el.components.networked.data.owner != 'scene')){
                if ((data.current_value != -2) && (data.current_value != oldData.current_value)) {
                    // Initialize with the proper value
                    if (data.direction != 'rewind'){
                        this.navNotiBuffer.set({type: 'position', value: data.current_value - 1, label: this.selectable.selectors[data.current_value - 1]})
                        this.setSelect(data.current_value - 1)
                    } else {
                        this.navNotiBuffer.set({type: 'position', value: data.current_value + 1, label: this.selectable.selectors[data.current_value + 1]})
                        this.setSelect(data.current_value + 1)
                    }
                }
                if ((data.state == 'pause') && (data.state != oldData.state)) {
                    this.navNotiBuffer.set('pause')
                }
            }
        }
    },

    nextSelect: function() {
        if (this.selectable.current > this.selectable.length - 1){
            this.selectable.current = this.selectable.length
            this.selectable.state = 'pause'
            this.el.setAttribute('babia-selector','state', 'pause');
            this.navNotiBuffer.set('pause')
        } else {
            this.newData = this.selectable.next();
            this.el.setAttribute('babia-selector','current_value', this.selectable.current);
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current-1]})
            this.babiaMetadata = { id: this.selectable.current};
        }
    },

    prevSelect: function() {
        if (this.selectable.current >= 0){
            this.newData = this.selectable.prev();
            this.el.setAttribute('babia-selector','current_value', this.selectable.current);
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current+1]})
            this.babiaMetadata = { id: this.selectable.current };
        } else {
            this.selectable.current = - 1
            this.selectable.state = 'pause'
            this.el.setAttribute('babia-selector','state', 'pause');
            this.navNotiBuffer.set('pause')
        } 
    },

    setSelect: function(value) {
        if (((value != this.selectable.current - 1) && (this.data.direction != 'rewind')) || ((value != this.selectable.current + 1) && (this.data.direction === 'rewind'))) {
            let label;
            this.newData = this.selectable.setValue(value);
            if (this.data.direction != 'rewind') {
                this.babiaMetadata = { id: value++ };
                label = this.selectable.selectors[value-1]
            } else {
                this.babiaMetadata = { id: value-- };
                this.selectable.current -=2
                label = this.selectable.selectors[value+1]
            }
            this.notiBuffer.set(this.newData);
            this.navNotiBuffer.set({type: 'position', value: value, label: label});
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
        this.selectable.updateData(_data);
        this.navNotiBuffer.set({type: 'position', value: this.selectable.current, label: this.selectable.selectors[this.selectable.current-1]})
        let self = this;
        this.nextSelect();
        this.interval = window.setInterval(function () {
            self.loop()
        }, self.data.timeout * self.selectable.speed);
      },

    processEvent: function(event){
            if(event.includes('pause')) {
                this.selectable.state = 'pause'
                this.el.setAttribute('babia-selector','state', 'pause');
            } else if (event.includes('play')) {
                this.selectable.state = 'play'
                this.el.setAttribute('babia-selector','state', 'play');
            } else if (event.includes('forward')) {
                this.selectable.direction = 'forward'
                this.el.setAttribute('babia-selector','direction', 'forward');
            } else if (event.includes('rewind')) {
                this.selectable.direction = 'rewind'
                this.el.setAttribute('babia-selector','direction', 'rewind');
            } else if (event.includes('babiaSetPosition')) {
                this.selectable.state = 'pause'
                let value = parseInt(event.substring(16), 10)
                if (this.data.direction != 'rewind') {
                    this.el.setAttribute('babia-selector',{
                        'state': 'pause',
                        'current_value': value + 1
                    });
                } else {
                    this.el.setAttribute('babia-selector',{
                        'state': 'pause',
                        'current_value': value - 1
                    });
                }
                
                this.setSelect(value)
                this.navNotiBuffer.set('pause')
            } else if (event.includes('babiaSetStep')) {
                this.el.setAttribute('babia-selector', 'step', parseInt(event.substring(12), 10))
            } else if (event.includes('babiaSetSpeed')) {
                this.el.setAttribute('babia-selector', 'speed', parseInt(event.substring(13), 10))
            }
    },

    removeOldNavListener: function(nav){
        nav.removeEventListener('click', function () {
            if (!NAF.utils.isMine(selector) && selector.components.networked.data.owner != 'scene'){
                if (Object.keys(NAF.connection.connectedClients).length > 0){
                    NAF.utils.takeOwnership(selector)
                }
            }       
        })
    },

    addMultiuserMode: function(nav){
        let selector = this.el        
        document.body.addEventListener('clientConnected', function (event) {
            let clientId = event.detail.clientId;
            console.log('clientConnected event. clientId =', clientId);
            console.log("Selector owner: ", selector.components.networked.data.owner);
            let imFirst = true
            if (selector.components.networked.data.owner == 'scene'){
                for (let client in NAF.connection.getConnectedClients()){
                    let otherTime = NAF.connection.getConnectedClients()[client].roomJoinTime
                    let myTime = NAF.connection.adapter._myRoomJoinTime
                    console.log("Other: ", otherTime)
                    console.log("Mine: ", myTime)
                    if (myTime > otherTime){
                        imFirst = false;
                    }
                }
                if (imFirst) {
                    NAF.utils.takeOwnership(selector)
                } else { 
                    console.log("I'm not first")
                    makeInvisible()
                }
            } else if (selector.components.networked.data.owner != NAF.clientId){
                makeInvisible();
            } 
        });
        
        nav.addEventListener('click', function () {
            if (!NAF.utils.isMine(selector) && selector.components.networked.data.owner != 'scene'){
                if (Object.keys(NAF.connection.connectedClients).length > 0){
                    NAF.utils.takeOwnership(selector)
                }
            }       
        })
    
        selector.addEventListener('ownership-gained', e => {
            console.log("Selector ownership gained");
            makeVisible();
        });
    
    
        selector.addEventListener('ownership-lost', e => {
            console.log("Selector ownership lost");
            makeInvisible();
        });
    
        function makeInvisible(){
            nav.children[1].setAttribute('visible', false)
            nav.children[2].setAttribute('visible', false)
            nav.children[3].setAttribute('visible', false)
        }
    
        function makeVisible(){
            nav.children[1].setAttribute('visible', true)
            nav.children[2].setAttribute('visible', true)
            nav.children[3].setAttribute('visible', true)
        }
    }
    
});

