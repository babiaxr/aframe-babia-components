/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('babia-controls', {
    schema: {
        // Current direction
        direction: { type: 'string', default: ''},
        // Current state
        state: { type: 'string', default: ''},
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        this.createPlayer()
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        if ((data.state) && (data.state != oldData.state)) {
            let pause = document.getElementsByClassName('babiaPause')[0];
            let play = document.getElementsByClassName('babiaPlay')[0];
            if (data.state === 'pause') {
                if (pause){
                    this.el.children[0].removeChild(pause)
                }
                if (!play){
                    this.createButton('play', 'white')
                }
            } else {
                if (play){
                    this.el.children[0].removeChild(play)
                }
                if (!pause){
                   this.createButton('pause', 'white')  
                }
            }
            this.el.parentEl.setAttribute('babia-navigator', 'state', data.state)
        }
        if ((data.direction) && (data.direction != oldData.direction)) {
            let rewind = document.getElementsByClassName('babiaRewind')[0];
            let forward = document.getElementsByClassName('babiaForward')[0];
            if (data.direction === 'rewind'){
                forward.color = 'white'
                rewind.color = 'grey'
                changeMaterial(forward, 'white')
                changeMaterial(rewind, 'grey')
            } else {
                forward.color = 'grey'
                rewind.color = 'white'
                changeMaterial(forward, 'grey')
                changeMaterial(rewind, 'white')
            }
            this.el.parentEl.setAttribute('babia-navigator', 'direction', data.direction)
        }
    },

    player: undefined,

    createPlayer: function () {
        this.player = document.createElement('a-entity')
        this.player.classList.add('babiaxrPlayer')
        this.player.classList.add('babiaxraycasterclass')
        this.el.appendChild(this.player)

        // Create Buttons
        this.createButton('rewind', 'white')
        this.createButton('skipPrev', 'white')
        this.createButton('pause', 'white')
        this.createButton('skipNext', 'white')
        this.createButton('forward', 'grey')
    },

    createButton: function(type, color){
        let url
        let pos_x
        let class_name
        let inverse = false

        if (type === 'play'){
            url = playButton.default
            pos_x = 0.2
            class_name = 'babiaPlay'
        } else if (type === 'pause') {
            url = pauseButton.default
            pos_x = 0
            class_name = 'babiaPause'
        } else if (type === 'skipNext') {
            url = skipButton.default
            pos_x = 3
            class_name = 'babiaSkipNext'
            inverse = true
        } else if (type === "skipPrev") {
            url = skipButton.default
            pos_x = -3
            class_name = 'babiaSkipPrev'
        } else if (type === "rewind") {
            url = rewindButton.default
            pos_x = -6
            class_name = 'babiaRewind'
        } else if ( type === "forward"){
            url = rewindButton.default
            pos_x = 6
            class_name = 'babiaForward'
            inverse = true
        } else {
            throw new Error("That button type doesn't exist.");
        }

        let button = document.createElement('a-entity')
        button.setAttribute('gltf-model', "url(" + url + ")")
        button.classList.add('babiaxraycasterclass');
        button.classList.add(class_name)
        button.setAttribute('position', {x: pos_x, y: 0, z: 0})
        changeMaterial(button, color)

        if (inverse) {
            button.setAttribute('rotation', {x: 0, y: 180, z: 0})
        } 

        this.player.appendChild(button)

        // Events
        this.mouseOver(button)
        this.processEvents(button)
    },

    mouseOver: function(element){
        element.addEventListener('mouseenter', function(){
            changeMaterial(element, 'grey')
        })
    
        element.addEventListener('mouseleave', function(){
            changeMaterial(element, element.color)
        })
    },

    processEvents: function(element){
        let self = this
        element.addEventListener('click', function () {
            if (element.classList.contains('babiaPlay')){
                this.parentEl.parentEl.setAttribute('babia-controls','state', 'play');
            } else if (element.classList.contains('babiaPause')){
                this.parentEl.parentEl.setAttribute('babia-controls','state', 'pause');
            } else if ((element.classList.contains('babiaSkipNext')) || (element.classList.contains('babiaSkipPrev'))){
                if (self.data.state != 'pause') {
                    this.parentEl.parentEl.setAttribute('babia-controls','state', 'pause')
                }
                let class_name = 'skipPrev';
                if (element.classList.contains('babiaSkipNext')) {
                    class_name = 'skipNext';
                }
                self.el.parentEl.components['babia-navigator'].controlNavigator(class_name);
            } else if (element.classList.contains('babiaForward')){
                this.parentEl.parentEl.setAttribute('babia-controls','direction', 'forward');
            } else if (element.classList.contains('babiaRewind')){
                this.parentEl.parentEl.setAttribute('babia-controls','direction', 'rewind');
            }
        });
    }

})

function changeMaterial(entity, color){
    let mesh = entity.getObject3D('mesh')
    if (!mesh) {
        entity.addEventListener('model-loaded', function(){
            entity.color = color
            changeColor(entity, color)
        });
    } else {
        changeColor(entity, color)
    }
}

function changeColor(entity, color){
    entity.object3D.traverse(function(object3D){
        last_material = object3D.material
        if (last_material) {    
            object3D.material = new THREE.MeshBasicMaterial({color: color}); 
        }
    })
}