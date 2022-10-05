/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}


AFRAME.registerComponent('babia-experiment', {
    schema: {
        taskTitle: { type: 'string', default: 'Default task title' },
        taskDescription: { type: 'string', default: 'Default task text' },
        openTaskImg: { type: 'string' },
        closeTaskImg: { type: 'string' },
        timeLimitEnding: { type: 'boolean', default: false }, // If false, go for the button
        timeLimitTime: { type: 'number', default: 300 }, // In seconds
        forceFinishWhenTimeLimit: { type: 'boolean', default: false }, // In seconds
        finishButton: { type: 'boolean', default: true },
        recordDelta: { type: 'number', default: 3000 }, // In milliseconds, each delta the position and rotation will be recorded
        recordAudio: { type: 'boolean', default: true },
        taskAudio: { type: 'boolean', default: false },
        taskAudioUrl: { type: 'string', default: null },
        taskVideo: { type: 'boolean', default: false },
        taskVideoId: { type: 'string', default: null },
        taskVideoWidth: { type: 'number', default: 3 },
        taskVideoHeight: { type: 'number', default: 1.75 }
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

    update: function (oldData) {
        const self = this
        if (this.data != this.oldData) {
            // Get camera
            let isThereBabiaCamera = this.el.querySelectorAll("[babia-camera]")
            if (isThereBabiaCamera.length > 0) {
                this.babiaCameraEl = isThereBabiaCamera[0]

                // Add raycaster things and others attributes
                let babiaCameraAttribute = this.babiaCameraEl.getAttribute("babia-camera")
                this.babiaCameraEl.setAttribute("babia-camera", {
                    raycasterMouse: babiaCameraAttribute['raycasterMouse'] + ', #babiaTaskPopup,  #babiaTaskPopup--close-icon, #babiaStartButton, #babiaFinishButton, #babiaTaskAudio, #babiaTaskVideo',
                    raycasterHand: babiaCameraAttribute['raycasterHand'] + ', #babiaTaskPopup, #babiaTaskPopup--close-icon, #babiaStartButton, #babiaFinishButton, #babiaTaskAudio, #babiaTaskVideo'
                })

            } else {
                this.babiaCameraEl = this.el.sceneEl.camera.el;
            }

            // Find babia visualizations
            this.findBabiaCharts()
            // Hide babia visualizations
            this.hideCharts()
            // Add task
            if (this.data.taskAudio) {
                this.addAudioTask()
            } else if (this.data.taskVideo) {
                this.addVideoTask()
            } else {
                this.addTask()
            }
            // Add start button
            this.addStartButton()

            // Add finish button
            if (this.data.finishButton) {
                this.addFinishButton()
            }


        }
    },

    findBabiaCharts: function () {
        this.babiaCharts = this.el.querySelectorAll("[babia-pie], [babia-bars], [babia-barsmap], [babia-bubbles], [babia-city], [babia-cyls], [babia-cylsmap], [babia-doughnut], [babia-terrain], [babia-boats], [babia-network], [babiaxr-codecity]")
    },

    hideCharts: function () {
        // Hide charts
        for (let child of this.babiaCharts) {
            child.setAttribute('visible', false)
        }
    },

    showCharts: function () {
        // Hide charts
        for (let child of this.babiaCharts) {
            child.setAttribute('visible', true)
        };
    },

    addTask: function () {
        const self = this

        this.taskEntity = document.createElement('a-entity');
        this.taskEntity.setAttribute('class', 'babiaxrayscasterclass')
        this.taskEntity.setAttribute('id', 'babiaTaskPopup')
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
        this.babiaCameraPosition = this.babiaCameraEl.getAttribute('position')
        this.taskEntity.setAttribute('position', { x: this.babiaCameraPosition.x, y: this.babiaCameraPosition.y + 3, z: this.babiaCameraPosition.z - 4 })
        this.taskEntity.setAttribute('babia-lookat', '[camera]')


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
        this.taskAudioEntity.setAttribute('id', 'babiaTaskAudio')
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
        this.babiaCameraPosition = this.babiaCameraEl.getAttribute('position')
        this.taskAudioEntity.setAttribute('position', { x: this.babiaCameraPosition.x, y: this.babiaCameraPosition.y + 3, z: this.babiaCameraPosition.z - 4 })
        this.taskAudioEntity.setAttribute('babia-lookat', '[camera]')


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
        this.taskVideoEntity.setAttribute('id', 'babiaTaskVideo')
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
        this.babiaCameraPosition = this.babiaCameraEl.getAttribute('position')
        this.taskVideoEntity.setAttribute('position', { x: this.babiaCameraPosition.x, y: this.babiaCameraPosition.y + 3, z: this.babiaCameraPosition.z - 4 })
        this.taskVideoEntity.setAttribute('babia-lookat', '[camera]')


        // Add to the scene
        this.el.parentElement.append(this.taskVideoEntity)
    },

    addStartButton: function () {
        const self = this
        this.startButtonEntity = document.createElement('a-plane')
        this.startButtonEntity.setAttribute('id', 'babiaStartButton')
        this.startButtonEntity.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 })
        this.startButtonEntity.setAttribute('babia-lookat', '[camera]')
        this.startButtonEntity.setAttribute('class', '.babiaxrayscasterclass')
        this.startButtonEntity.setAttribute('color', '#3ac961')
        this.startButtonEntity.setAttribute('geometry', {
            primitive: 'plane',
            width: 1.8,
            height: 0.5
        })
        this.startButtonEntity.setAttribute('text', {
            value: 'Start!',
            color: 'white',
            align: 'center',
            wrapCount: 30,
            width: 3.6
        })

        this.startButtonEntity.setAttribute('position', { x: this.babiaCameraPosition.x - 3.5, y: this.babiaCameraPosition.y + 1, z: this.babiaCameraPosition.z - 3.5 })

        // Start recording time
        this.startButtonEntity.addEventListener('click', async function (event) {
            self.showCharts()
            self.runningExperiment = true;
            // Start Recording
            self.recordingData = window.setInterval(function () {
                recordData(self)
            }, self.data.recordDelta);
            self.recordedData['startTime'] = Date.now();
            // Audio
            if (self.data.recordAudio) {
                self.audioRecorder = await recordAudio();
                self.audioRecorder.start();
            }
            self.startButtonEntity.setAttribute('visible', false)

            // Show finish button
            if (self.data.finishButton) {
                self.finishButtonEntity.setAttribute('visible', true)
            }

            // Time Limit defined
            if (self.data.timeLimitEnding) {
                self.recordedData['maxTime'] = self.recordedData['startTime'] + self.data.timeLimitTime * 1000
            }

        }, false);

        this.el.parentElement.append(this.startButtonEntity);
    },

    addFinishButton: function () {
        const self = this
        this.finishButtonEntity = document.createElement('a-plane')
        this.finishButtonEntity.setAttribute('id', 'babiaFinishButton')
        this.finishButtonEntity.setAttribute('scale', { x: 1.2, y: 1.2, z: 1.2 })
        this.finishButtonEntity.setAttribute('babia-lookat', '[camera]')
        this.finishButtonEntity.setAttribute('class', 'babiaxrayscasterclass')
        this.finishButtonEntity.setAttribute('color', '#9e0000')
        this.finishButtonEntity.setAttribute('visible', false)
        this.finishButtonEntity.setAttribute('geometry', {
            primitive: 'plane',
            width: 1.8,
            height: 0.5
        })
        this.finishButtonEntity.setAttribute('text', {
            value: 'Finish!',
            color: 'white',
            align: 'center',
            wrapCount: 30,
            width: 3.6
        })

        this.finishButtonEntity.setAttribute('position', { x: this.babiaCameraPosition.x + 3.5, y: this.babiaCameraPosition.y + 1, z: this.babiaCameraPosition.z - 3.5 })

        // Start recording time
        this.finishButtonEntity.addEventListener('click', function (event) {
            self.hideCharts()
            // Stop recording
            self.runningExperiment = false;
            recordData(self)
            clearInterval(this.recordingData)
            if (self.audioRecorder) {
                self.stopAndDownloadAudio()
            }

            self.recordedData['finishTime'] = Date.now();
            self.recordedData['totalDuration'] = self.recordedData['finishTime'] - self.recordedData['startTime'];
            downloadObjectAsJson(self.recordedData, "experimentdetails")
            self.finishButtonEntity.setAttribute('visible', false)


        }, false);

        this.el.parentElement.append(this.finishButtonEntity);
    },

    stopAndDownloadAudio: async function () {
        let audio = await this.audioRecorder.stop()
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = audio.audioUrl;
        a.download = "audio.webm";
        a.click();
        window.URL.revokeObjectURL(audio.audioUrl)
    },

    tick: function () {
        const self = this
        // Check if the experiment is running
        if (this.runningExperiment) {
            // Check if the time limit
            if (this.data.timeLimitEnding) {
                if (Date.now() > this.recordedData.maxTime) {
                    // Reached the time
                    this.recordedData['finishTime'] = this.recordedData.maxTime
                    this.recordedData['totalDuration'] = this.recordedData['finishTime'] - this.recordedData['startTime'];
                    this.runningExperiment = false
                    // If forced, hide charts and download data
                    if (this.data.forceFinishWhenTimeLimit) {
                        alert("The time limit is done! Thank you!")
                        this.hideCharts()
                        downloadObjectAsJson(self.recordedData, "experimentdetails")
                        self.finishButtonEntity.setAttribute('visible', false)
                        recordData(self)
                        clearInterval(this.recordingData)
                        if (self.audioRecorder) {
                            self.stopAndDownloadAudio()
                        }
                    } else {
                        alert("The time limit is done, but you can continue doing the experiment, please, click on Finish when done!")
                    }
                }
            }
        }
    }

})

function recordData(self) {
    // Save Position and rotation of the camera
    let cameraEl = self.el.sceneEl.camera.el;
    self.recordedData[Date.now()] = {
        position: cameraEl.getAttribute('position'),
        rotation: cameraEl.getAttribute('rotation')
    }
}

function getAttributeByRegex(element, regex, exclude) {
    const attributes = element.attributes;
    for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];
        if (attr.name.startsWith(regex) && attr.name !== exclude && attr.name !== "babia-camera") {
            return true
        }

    }
    return false
}

function downloadObjectAsJson(exportObj, exportName) {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}



const recordAudio = () => {
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                const start = () => {
                    mediaRecorder.start();
                };

                const stop = () => {
                    return new Promise(resolve => {
                        mediaRecorder.addEventListener("stop", () => {
                            const audioBlob = new Blob(audioChunks);
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            const play = () => {
                                audio.play();
                            };

                            resolve({ audioBlob, audioUrl, play });
                        });

                        mediaRecorder.stop();
                    });
                };


                resolve({ start, stop });
            });
    });
};