let findTargetComponent = require('./common').findTargetComponent;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-range-selector', {
    schema: {
        from: { type: 'string' },
        to: { type: 'string' },
        defaultRange: {type: 'string', default: 'Last 5 years'}
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        this.notiBuffer = new NotiBuffer();

        this.options = [{label:'Last 15 minutes', time: 15*60000, interval: "30s"},
                        {label:'Last 30 minutes', time: 15*60000, interval: "30s"},
                        {label:'Last 1 hour', time: 60*60000, interval: "1m"},
                        {label:'Last 4 hours', time: 4*60*60000, interval: "5m"},
                        {label:'Last 12 hours', time: 12*60*60000, interval: "10m"},
                        {label:'Last 24 hours', time: 24*60*60000, interval: "30m"},
                        {label:'Last 7 days', time: 7*24*60*60000, interval: "3h"},
                        {label:'Last 30 days', time: 30*24*60*60000, interval: "12h"},
                        {label:'Last 60 days', time: 60*24*60*60000, interval: "1d"},
                        {label:'Last 90 days', time: 90*24*60*60000, interval: "2d"},
                        {label:'Last 6 months', time: 6*30*24*60*60000, interval: "3d"},
                        {label:'Last 1 year', time: 1*365*24*60*60000, interval: "1w"},
                        {label:'Last 2 years', time: 2*365*24*60*60000, interval: "15d"},
                        {label:'Last 5 years', time: 5*365*24*60*60000, interval: "30d"}];
        // Set Initial Option
        let index = 0;
        for (i = 0; i < this.options.length; i++){
            if (this.data.defaultRange === this.options[i].label){
                index = i;
                break;
            }
        }
        this.label_select = 'babia-button-' + this.options[index].label.replaceAll(' ', '-');
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data
        this.updateInterface(data);
    },

    interface: undefined,
    options: undefined,
    handController: undefined,
    label_select: undefined,

    updateInterface: function(data) {
        let self = this;
        
        while (self.el.firstChild)
            self.el.firstChild.remove();
        
        // Generate interface
        console.log('Generating interface...')
        if (document.querySelector('#babia-menu-hand')) {
            let hand_ui = document.querySelector('#babia-menu-hand')
            hand_ui.parentNode.removeChild(hand_ui)
            insertInterfaceOnHand(self, self.handController)
        } else {
            self.interface = generateInterface(self)
            self.el.appendChild(self.interface)
        }
        
        document.addEventListener('controllerconnected', (event) => {
            while (self.el.firstChild)
                self.el.firstChild.remove();
            // event.detail.name ----> which VR controller
            let controller = event.detail.name;
            let hand = event.target.getAttribute(controller).hand
            if (hand === 'left' && !document.querySelector('#babia-menu-hand')){
                self.handController = event.target.id
                self.interface = generateInterface(self)
                insertInterfaceOnHand(self, self.handController)
            }    
        });
    },
})

let insertInterfaceOnHand = (self, hand) => {
    let hand_entity = document.getElementById(hand)
    let scale = 0.03
    self.interface.id = 'babia-menu-hand'
    self.interface.setAttribute('scale', {x: scale, y: scale, z: scale}) 
    self.interface.setAttribute('position', {x: -0.05, y: -0.05, z: -0.1})
    self.interface.setAttribute('rotation', {x: -60, y: 0, z: 0}) 
    self.interface.setAttribute('visible', false)
    hand_entity.appendChild(self.interface);
    openCloseMenu(hand, self.interface)
}


let generateInterface = (self) =>{
    self.interface = document.createElement('a-entity');
    self.interface.id = "babia-menu";

    let posY = 7;
    let posX = 0;

    self.options.forEach(option => {
        let button = createButton(self, option.label, posX, posY);
        self.interface.appendChild(button);
        if (posY > 1) {
            --posY;
        } else {
            posX += 3.75;
            posY = 7;
        }
    });
    return self.interface
}

let createButton = (self, option, positionX, positionY) =>{
    let entity = document.createElement('a-box')
    entity.id = 'babia-button-' + option.replaceAll(' ', '-');
    entity.classList.add("babiaxraycasterclass")
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3.5)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': option,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    selection_events(self, entity)

    if (self.label_select == entity.id){
        entity.emit('click')
    }

    return entity
}

let selection_events = (self, entity) =>{
    entity.addEventListener('mouseenter', function(){
        entity.children[0].setAttribute('text', {color: '#FFFFFF'})
        entity.setAttribute('color', '#333333')
    });

    entity.addEventListener('mouseleave', function(){
        entity.children[0].setAttribute('text', {color: 'black'})  
        if (self.label_select == entity.id) {
            entity.setAttribute('color', '#555555')
        } else {
            entity.setAttribute('color', '#FFFFFF')
        }
    });

    entity.addEventListener('click', function(){
        let aux = document.getElementById(self.label_select);
        if (aux != null){
            aux.children[0].setAttribute('text', {color: 'black'})  
            aux.setAttribute('color', '#FFFFFF');
        }
        self.label_select = entity.id;
        entity.children[0].setAttribute('text', {color: 'black'}) 
        entity.setAttribute('color', '#555555')

        // Send new date to registered components
        let label = self.label_select.slice(13).replaceAll('-', ' ');
        self.options.forEach(option => {
            if (option.label == label) {
                let now = Date.now();
                let to_send = {
                    from : now - option.time,
                    interval: option.interval,
                    to: now
                }
                self.notiBuffer.set(to_send);
            }
        });
    });
}

let openCloseMenu = (hand_id, entity_menu) =>{
    let menu_opened = false;
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function(){
        if (menu_opened){
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
}