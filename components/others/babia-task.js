const { randFloatSpread } = require("three/src/math/MathUtils");

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}


AFRAME.registerComponent('babia-task', {
    schema: {
        taskTitle: { type: 'string', default: 'Default task title' },
        taskDescription: { type: 'string', default: 'Default task text' },
        openTaskImg: { type: 'string' },
        closeTaskImg: { type: 'string' },
        taskAudio: { type: 'boolean', default: false },
        taskAudioUrl: { type: 'string', default: null },
        taskVideo: { type: 'boolean', default: false },
        taskVideoId: { type: 'string', default: null },
        taskVideoWidth: { type: 'number', default: 3 },
        taskVideoHeight: { type: 'number', default: 1.75 },
        offsetX: { type: 'number', default: 0 },
        lookat: { type: 'string', default: "[camera]" },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: true,

    /** 
    *  Data recorded during the experiment
    */
    recordedData: {},

    /** 
    *  If the experiment is still running
    */
    runningExperiment: false,

    /**
     * Initial creation and setting of the mesh.
     */
    init: function () { },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
    taskId: Math.random(),
    update: function (oldData) {
        const self = this
        this.taskId = this.el.getAttribute("id")
        if (this.data != this.oldData) {
            // Get camera
            let isThereBabiaCamera = this.el.sceneEl.querySelectorAll("[babia-camera]")
            if (isThereBabiaCamera.length > 0) {
                this.babiaCameraEl = isThereBabiaCamera[0]

                // Add raycaster things and others attributes
                let babiaCameraAttribute = this.babiaCameraEl.getAttribute("babia-camera")
                if (typeof babiaCameraAttribute === 'string') {
                    this.babiaCameraEl.setAttribute("babia-camera", {
                        raycasterMouse: babiaCameraAttribute.split("raycasterMouse:")[1].split(";")[0] + `, #babiaTaskPopup${this.taskId},  #babiaTaskPopup${this.taskId}--close-icon, #babiaStartButton${this.taskId}, #babiaFinishButton${this.taskId}, #babiaTaskAudio${this.taskId}, #babiaTaskVideo${this.taskId}`,
                        raycasterHand: babiaCameraAttribute.split("raycasterHand:")[1].split(";")[0] + `, #babiaTaskPopup${this.taskId}, #babiaTaskPopup${this.taskId}--close-icon, #babiaStartButton${this.taskId}, #babiaFinishButton${this.taskId}, #babiaTaskAudio${this.taskId}, #babiaTaskVideo${this.taskId}`,
                        teleportCollision: babiaCameraAttribute.split("teleportCollision:")[1].split(";")[0]
                    })
                } else if (babiaCameraAttribute == undefined) {
                    this.babiaCameraEl.setAttribute("babia-camera", {
                        raycasterMouse: this.babiaCameraEl.components['babia-camera'].attrValue['raycasterMouse'] + `, #babiaTaskPopup${this.taskId},  #babiaTaskPopup${this.taskId}--close-icon, #babiaStartButton${this.taskId}, #babiaFinishButton${this.taskId}, #babiaTaskAudio${this.taskId}, #babiaTaskVideo${this.taskId}`,
                        raycasterHand: this.babiaCameraEl.components['babia-camera'].attrValue['raycasterHand'] + `, #babiaTaskPopup${this.taskId}, #babiaTaskPopup${this.taskId}--close-icon, #babiaStartButton${this.taskId}, #babiaFinishButton${this.taskId}, #babiaTaskAudio${this.taskId}, #babiaTaskVideo${this.taskId}`,
                        teleportCollision: this.babiaCameraEl.components['babia-camera'].attrValue['teleportCollision']
                    })
                }

            } else {
                this.babiaCameraEl = this.el.sceneEl.camera.el;
            }

            // Add task if not babia task
            if (this.data.taskAudio) {
                this.addAudioTask()
            } else if (this.data.taskVideo) {
                this.addVideoTask()
            } else {
                this.addTask()
            }


        }
    },

    addTask: function () {
        const self = this

        this.taskEntity = document.createElement('a-entity');
        this.taskEntity.setAttribute('class', 'babiaxrayscasterclass')
        this.taskEntity.setAttribute('id', 'babiaTaskPopup' + this.taskId)
        this.taskEntity.setAttribute('babia-poster', {
            openIconImage: '../assets/popups/info.jpg',
            closeIconImage: '../assets/popups/close.jpg',
            title: self.data.taskTitle,
            titleWrapCount: 30,
            titleColor: 'black',
            bodyColor: 'black',
            posterBoxColor: 'white',
            bodyFont: 'roboto',
            posterBoxHeight: 4.5,
            body: self.data.taskDescription
        })



        // Add position
        let x,y,z
        if (this.babiaCameraEl.attributes['position']){
            [x, y, z] = this.babiaCameraEl.attributes['position'].value.split(" ")
        }else{
            x = 0
            y = 0
            z = 0
        }

        this.taskEntity.setAttribute('position', { x: parseFloat(x) + this.data.offsetX, y: parseFloat(y) + 1.5, z: parseFloat(z) - 6 })
        this.taskEntity.setAttribute('babia-lookat', this.data.lookat)


        // Add to the scene
        this.el.parentElement.append(this.taskEntity)
    },

    /**
     * Things related to the audio task
     */
    audioPlaying: false,
    addAudioTask: function () {
        const self = this

        this.taskAudioEntity = document.createElement('a-entity');
        this.taskAudioEntity.setAttribute('class', 'babiaxrayscasterclass')
        this.taskAudioEntity.setAttribute('geometry', {
            primitive: 'plane',
            width: 1.1,
            height: 0.5
        })
        this.taskAudioEntity.setAttribute('text', {
            value: 'Play audio!',
            color: 'white',
            align: 'center',
            wrapCount: 30,
            width: 3.6,
        })
        this.taskAudioEntity.setAttribute('id', 'babiaTaskAudio' + this.taskId)
        this.taskAudioEntity.setAttribute('sound', {
            src: `url(${self.data.taskAudioUrl})`
        })

        // Play Sound when click
        this.taskAudioEntity.addEventListener('click', function (event) {
            if (self.audioPlaying) {
                self.audioPlaying = false
                self.taskAudioEntity.components.sound.stopSound()
                self.taskAudioEntity.setAttribute('text', 'value', 'Play audio!')
            } else {
                self.audioPlaying = true
                self.taskAudioEntity.components.sound.playSound()
                self.taskAudioEntity.setAttribute('text', 'value', 'Stop audio!')
            }

        }, false)

        // When audio finished
        this.taskAudioEntity.addEventListener('sound-ended', function (event) {
            self.audioPlaying = false
            self.taskAudioEntity.setAttribute('text', 'value', 'Play audio!')
        }, false)


        // Add position
        let x,y,z
        if (this.babiaCameraEl.attributes['position']){
            [x, y, z] = this.babiaCameraEl.attributes['position'].value.split(" ")
        }else{
            x = 0
            y = 0
            z = 0
        }

        this.taskAudioEntity.setAttribute('position', { x: parseFloat(x) + this.data.offsetX, y: parseFloat(y) + 3, z: parseFloat(z) - 6 })
        this.taskAudioEntity.setAttribute('babia-lookat', this.data.lookat)


        // Add to the scene
        this.el.parentElement.append(this.taskAudioEntity)
    },

    /**
     * Things related to the audio task
     */
    videoPlaying: false,
    addVideoTask: function () {
        const self = this

        this.taskVideoEntity = document.createElement('a-video');
        this.taskVideoEntity.setAttribute('class', 'babiaxrayscasterclass')
        this.taskVideoEntity.setAttribute('id', 'babiaTaskVideo' + this.taskId)
        this.taskVideoEntity.setAttribute('src', self.data.taskVideoId)
        this.taskVideoStream = document.querySelector(self.data.taskVideoId)
        this.taskVideoEntity.setAttribute('width', self.data.taskVideoWidth)
        this.taskVideoEntity.setAttribute('height', self.data.taskVideoHeight)


        // Play Sound when click
        this.taskVideoEntity.addEventListener('click', function (event) {
            if (self.videoPlaying) {
                self.videoPlaying = false
                self.taskVideoStream.pause();
            } else {
                self.videoPlaying = true
                self.taskVideoStream.play();
            }

        }, false)


        // Add position
        let x,y,z
        if (this.babiaCameraEl.attributes['position']){
            [x, y, z] = this.babiaCameraEl.attributes['position'].value.split(" ")
        }else{
            x = 0
            y = 0
            z = 0
        }
        this.taskVideoEntity.setAttribute('position', { x: parseFloat(x) + this.data.offsetX, y: parseFloat(y) + 3, z: parseFloat(z) - 6 })
        this.taskVideoEntity.setAttribute('babia-lookat', this.data.lookat)


        // Add to the scene
        this.el.parentElement.append(this.taskVideoEntity)
    },


    tick: function () {

    }

})
