/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('babia-controls', {
    schema: {},

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
        let event
        let inverse = false

        if (type === 'play'){
            url = '../../components/others/models/play_button.gltf'
            pos_x = 0.2
            class_name = 'babiaPlay'
            event = 'babiaContinue'
        } else if (type === 'pause') {
            url = '../../components/others/models/pause_button.gltf'
            pos_x = 0
            class_name = 'babiaPause'
            event = 'babiaStop'
        } else if (type === 'skipNext') {
            url = '../../components/others/models/skip_button.gltf'
            pos_x = 3
            class_name = 'babiaSkipNext'
            event = class_name
            inverse = true
        } else if (type === "skipPrev") {
            url = '../../components/others/models/skip_button.gltf'
            pos_x = -3
            class_name = 'babiaSkipPrev'
            event = class_name
        } else if (type === "rewind") {
            url = '../../components/others/models/rewind_button.gltf'
            pos_x = -6
            class_name = 'babiaRewind'
            event = 'babiaToPast'
        } else if ( type === "forward"){
            url = '../../components/others/models/rewind_button.gltf'
            pos_x = 6
            class_name = 'babiaForward'
            event = 'babiaToPresent'
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
        this.emitEvents(button, event)
        this.mouseOver(button)
    },

    mouseOver: function(element){
        element.addEventListener('mouseenter', function(){
            changeMaterial(element, 'grey')
        })
    
        element.addEventListener('mouseleave', function(){
            changeMaterial(element, element.color)
        })
    },

    emitEvents: function(element, event){
        self = this
        element.addEventListener('click', function () {
            if (element.classList.contains('babiaPlay')){
                this.parentEl.removeChild(this)
                self.createButton('pause', 'white')
            } else if (element.classList.contains('babiaPause')){
                this.parentEl.removeChild(this)
                self.createButton('play', 'white')
            } else if ((element.classList.contains('babiaSkipNext')) || (element.classList.contains('babiaSkipPrev'))){
                let pause = document.getElementsByClassName('babiaPause')[0]
                if (pause){
                    self.player.removeChild(pause)
                    self.createButton('play', 'white')
                }
            } else if (element.classList.contains('babiaForward')){
                this.color = 'grey'
                changeMaterial(this, this.color)
                let rewind = document.getElementsByClassName('babiaRewind')[0]
                rewind.color = 'white'
                changeMaterial(rewind, rewind.color)
            } else if (element.classList.contains('babiaRewind')){
                this.color = 'grey'
                changeMaterial(this, this.color)
                let forward = document.getElementsByClassName('babiaForward')[0]
                forward.color = 'white'
                changeMaterial(forward, forward.color)
            }
            //console.log('Emit... ' + event)
            self.el.parentEl.emit(event)
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