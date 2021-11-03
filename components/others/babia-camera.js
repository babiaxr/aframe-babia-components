/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}


AFRAME.registerComponent('babia-camera', {
    schema: {
        raycasterMouse: { type: 'string', default: '.babiaxraycasterclass'},
        raycasterHand: {type: 'string', default: '.babiaxraycasterclass'},
        tipsOpened: { type: 'boolean', default: true}, 
        gripRLabel: {type: 'string', default: 'Open/Close \nTips'},
        gripLLabel: {type: 'string', default: 'Stop Audio'},
        triggerRLabel: {type: 'string', default: 'Click'},
        triggerLLabel: {type: 'string', default: 'Teleport' },
        teleportCollisions: {type: 'string', default: '.environmentGround'}
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {},

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

     update: function (oldData) {
        if(this.data != this.oldData){
            // Add camera
            this.el.setAttribute('camera', '');
            // Add mouse
            this.addCursor();
            // OCULUS CASE
            this.setOculusConnected();
        }
     },

    addCursor: function(){
        this.cursor = document.createElement('a-entity');
        this.cursor.id = 'cursor';
        this.cursor.setAttribute('cursor', {rayOrigin: 'mouse'});
        this.cursor.setAttribute('raycaster', {
            objects: this.data.raycasterMouse,
        })
        this.el.parentElement.append(this.cursor);
    },

    createTip: function(id, config, position){
        let entity = document.createElement('a-entity');
        entity.id = id;
        entity.classList.add('tips');
        entity.setAttribute('tooltip', config);
        entity.setAttribute('position', position);
        return entity ;
    },

    setOculusConnected: function(){
        let self = this;
        self.tooltips = [];
        /**
        * You need create and add controllers before listener otherwise
        * it will not listen the event controllerconnected.
        */
        self.leftHand = document.createElement('a-entity');
        self.leftHand.id = 'babia-leftHand';
        self.leftHand.setAttribute('oculus-touch-controls', {hand: 'left'});
        self.el.parentElement.append(self.leftHand);
        self.rightHand = document.createElement('a-entity');
        self.rightHand.id = 'babia-rightHand';
        self.rightHand.setAttribute('oculus-touch-controls', {hand: 'right'});
        self.el.parentElement.append(self.rightHand);

        document.addEventListener('controllerconnected', (event) => {
            // Update height of the view
            let parentPos = self.el.parentElement.object3D.position;
            self.el.parentElement.setAttribute('position', {x: parentPos.x, y: 0, z: parentPos.z});

            // Add hand controllers
            /** LEFT HAND (with teleport) */
            if(event.target.id === 'babia-leftHand'){
                self.leftHand.setAttribute('teleport-controls', {
                    cameraRig: `#${self.el.parentElement.id}`,
                    teleportOrigin: `#${self.el.id}`,
                    collisionEntities: self.data.teleportCollisions,
                    hitCylinderColor: '#ff3468',
                    curveHitColor: '#ff3468',
                    curveMissColor: '#333333',
                    curveLineWidth: 0.01,
                    button: 'trigger'
                });

                /** TIP TRIGGER L */
                tipTriggerLconfig = {
                    text: self.data.triggerLLabel,
                    width: 0.07,
                    height: 0.03,
                    targetPosition: '0.002 -0.02 -0.014', 
                    lineHorizontalAlign: 'right',
                    rotation: '-90 0 0',
                    src: tooltip.default,
                };
                tipTriggerLpos = {x: -0.09, y: -0.04, z: -0.08};
                self.tipTriggerL = this.createTip('babia-tooltip_trigger_L', tipTriggerLconfig, tipTriggerLpos);
                self.leftHand.append(self.tipTriggerL);
                self.tooltips.push(self.tipTriggerL);
                /** TIP GRIP L */
                tipGripLconfig = {
                    text: self.data.gripLLabel,
                    width: 0.08,
                    height: 0.04, 
                    targetPosition: '0.006 -0.008 0.033',
                    rotation: '-90 0 0',
                    src: tooltip.default,
                };
                tipGripLpos = {x: 0.085, y: -0.01, z: 0.07};
                self.tipGripL = this.createTip('babia-tooltip_grip_L', tipGripLconfig, tipGripLpos);
                self.leftHand.append(self.tipGripL); 
                self.tooltips.push(self.tipGripL); 
            }

            /** RIGHT HAND (with laser raycaster) */
            if(event.target.id === 'babia-rightHand'){
                self.rightHand.setAttribute('laser-controls', {hand: 'right'});
                self.rightHand.setAttribute('raycaster', {
                    objects: this.data.raycasterHand,
                });
                /** TIP TRIGGER R */
                tipTriggerRconfig = {
                    text: self.data.triggerRLabel,
                    width: 0.07,
                    height: 0.03,
                    targetPosition: '0.005 -0.02 -0.014', 
                    lineHorizontalAlign: 'left',
                    rotation: '-90 0 0',
                    src: tooltip.default,
                };
                tipTriggerRpos = {x: -0.09, y: -0.04, z: -0.08};
                self.tipTriggerR = this.createTip('babia-tooltip_trigger_R', tipTriggerRconfig, tipTriggerRpos);
                self.rightHand.append(self.tipTriggerR);
                self.tooltips.push(self.tipTriggerR); 
                /** TIP GRIP L */
                tipGripRconfig = {
                    text: self.data.gripRLabel,
                    width: 0.08,
                    height: 0.04, 
                    targetPosition: '0.006 -0.008 0.033',
                    lineHorizontalAlign: 'right',
                    rotation: '-90 0 0',
                    src: tooltip.default,
                };
                tipGripRpos = {x: -0.085, y: -0.01, z: 0.07};
                self.tipGripR = this.createTip('babia-tooltip_grip_R', tipGripRconfig, tipGripRpos);
                self.rightHand.append(self.tipGripR);
                self.tooltips.push(self.tipGripR); 
            }

            this.tipsController();
            if (this.data.networkedAudio){
                this.setAudioController();
            }
        });
    },

    tipsController: function (){
        let self = this;
        this.tipsOpened = self.data.tipsOpened;
        if (!self.tipsOpened){
            self.tooltips.forEach(tip => {
                tip.setAttribute('visible', false);
            });
        }

        self.rightHand.addEventListener('gripdown', () => {
            if (self.tipsOpened) {
                self.tipsOpened = false;
                self.tooltips.forEach(tip => {
                    tip.setAttribute('visible', false);
                });
            } else {
                self.tipsOpened = true;
                self.tooltips.forEach(tip => {
                    tip.setAttribute('visible', true);
                });
            }
        })
    },

})