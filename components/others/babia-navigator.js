/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;


AFRAME.registerComponent('babia-navigator', {
    schema: {
        // Current direction
        direction: { type: 'string', default: '' },
        // Current state
        state: { type: 'string', default: '' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
    sliderEl: undefined,

    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        this.notiBuffer = new NotiBuffer(this.registerBack.bind(this), this.unregisterBack.bind(this));
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let self = this
        let data = this.data;
        if ((data.state) && (data.state != oldData.state)) {
            this.controlNavigator(data.state)
        }
        if ((data.direction) && (data.direction != oldData.direction)) {
            this.controlNavigator(data.direction)
        }

        // Generate interface in the hand
        if (document.querySelector('#babia-menu-hand')) {
            let hand_ui = document.querySelector('#babia-menu-hand')
            hand_ui.parentNode.removeChild(hand_ui)
            insertInterfaceOnHand(self, self.handController)
        }

        document.addEventListener('controllerconnected', (event) => {
            // while (self.el.firstChild)
            //     self.el.firstChild.remove();
            // event.detail.name ----> which VR controller
            controller = event.detail.name;
            let hand = event.target.getAttribute(controller).hand
            if (hand === 'left' && !document.querySelector('#babia-menu-hand')) {
                self.handController = event.target.id
                insertInterfaceOnHand(self, self.handController)
            }
        });
    },

    initializeControls: function () {
        // Initialize Slider
        this.sliderEl = document.createElement('a-entity');
        this.sliderEl.min = 0
        this.sliderEl.max = this.selector.selectable.length - 1
        this.current = this.selector.selectable.current
        this.sliderEl.setAttribute('babia-slider', {
            size: 1.5,
            min: this.sliderEl.min,
            max: this.sliderEl.max,
            value: this.current
        });
        // When implement with selector, add the attributes
        this.sliderEl.classList.add("babiaxraycasterclass");
        this.sliderEl.id = "timeline"
        this.sliderEl.setAttribute('scale', { x: 2.3, y: 2.3, z: 2.3 })
        this.el.appendChild(this.sliderEl);

        // Initialize Controls
        this.controlsEl = document.createElement('a-entity');
        this.controlsEl.setAttribute('babia-controls', "");
        this.controlsEl.classList.add("babiaxraycasterclass");
        this.controlsEl.setAttribute('scale', { x: 0.15, y: 0.15, z: 0.3 })
        this.controlsEl.object3D.position.y = -0.5;
        this.el.appendChild(this.controlsEl);

        // Initialize Step Controller
        this.stepControllerEl = document.createElement('a-entity');
        this.stepControllerEl.setAttribute('babia-step-controller', "");
        this.stepControllerEl.classList.add("babiaxraycasterclass");
        this.stepControllerEl.object3D.position.x = 2.5;
        this.el.appendChild(this.stepControllerEl);

        // Initialize Speed Controller
        this.speedControllerEl = document.createElement('a-entity');
        this.speedControllerEl.setAttribute('babia-speed-controller', "");
        this.speedControllerEl.classList.add("babiaxraycasterclass");
        this.speedControllerEl.object3D.position.x = 3;
        this.el.appendChild(this.speedControllerEl);
    },

    updateSlider: function (evt) {
        let value = this.sliderEl.getAttribute('babia-slider').value
        if (evt === 'skipNext') {
            value++
        } else if (evt === 'skipPrev') {
            value--
        }
        // Out of range
        if (((evt === 'skipPrev') && (value >= 0)) || ((evt === 'skipNext') && (value <= this.sliderEl.max))) {
            this.current = value
            this.notiBuffer.set('babiaSetPosition' + this.current)
        } else {
            if (this.controlsEl.querySelector('.babiaPause')) {
                this.current = value
                processData('pause')
            }
        }

    },
    registerBack: function (prodComponent) {
        this.selector = prodComponent;
        this.prodComponent = prodComponent;

        // Register for the new one
        if (this.prodComponent.navNotiBuffer) {
            this.navNotiBufferId = this.prodComponent.navNotiBuffer.register(this.processData.bind(this));
        }
    },

    unregisterBack: function (prodComponent) {
        prodComponent.navNotiBuffer.unregister(this.navNotiBufferId)
    },

    processData: function (data) {
        if (data == 'pause') {
            this.controlsEl.setAttribute('babia-controls', 'state', 'pause')
        } else if (data == 'rewind') {
            this.el.setAttribute('babia-navigator', 'direction', 'rewind')
        } else if (data == 'forward') {
            this.el.setAttribute('babia-navigator', 'direction', 'forward')
        } else if (data.type) {
            if (data.type === 'position') {
                if (!this.sliderEl) {
                    this.initializeControls()
                }
                if (this.data.direction != 'rewind') {
                    this.current = data.value - 1
                } else {
                    this.current = data.value + 1
                }

                if ((this.current >= this.sliderEl.min) && (this.current <= this.sliderEl.max)) {
                    if (data.label) {
                        this.sliderEl.setAttribute('babia-slider', {
                            label: data.label,
                            value: this.current
                        })
                    } else {
                        this.sliderEl.setAttribute('babia-slider', 'value', this.current)
                    }
                }
            } else if (data.type === 'step') {
                this.stepControllerEl.setAttribute('babia-step-controller', 'value', data.value)
            } else if (data.type === 'speed') {
                this.speedControllerEl.setAttribute('babia-speed-controller', 'value', data.value)
            }
        }
    },

    /**
    * Producer component
    */
    prodComponent: undefined,

    /**
    * NotiBuffer identifier
    */
    navNotiBufferId: undefined,

    /**
    *  Control components
    */
    sliderComp: undefined,
    controlsComp: undefined,
    stepComp: undefined,
    speedComp: undefined,

    controlNavigator: function (evt, value) {
        if (evt == 'skipNext' || evt == 'skipPrev') {
            this.updateSlider(evt)
        } else {
            this.notiBuffer.set(evt + value)
        }
    },
})

let insertInterfaceOnHand = (self, hand) => {
    let hand_entity = document.getElementById(hand)
    let scale = 0.1

    // self.interface.id = 'babia-menu-hand'
    self.el.setAttribute('scale', { x: scale, y: scale, z: scale })
    // self.el.setAttribute('position', { x: -scale * self.el.width / 2, y: scale * self.el.height / 2, z: -0.1 })
    self.el.setAttribute('position', { x: 0, y: 0, z: -0.1 })
    self.el.setAttribute('rotation', { x: -60 })
    hand_entity.appendChild(self.el)

    // Initialize Controls
    self.el.removeChild(self.controlsEl)
    self.controlsEl = document.createElement('a-entity');
    self.controlsEl.setAttribute('babia-controls', "");
    self.controlsEl.classList.add("babiaxraycasterclass");
    self.controlsEl.setAttribute('scale', { x: 0.15, y: 0.15, z: 0.3 })
    self.controlsEl.object3D.position.y = -0.5;
    self.el.appendChild(self.controlsEl);

    openCloseMenu(self.handController, self.el)
}

let openCloseMenu = (hand_id, entity_menu) => {
    let menu_opened = true
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function () {
        if (menu_opened) {
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
}