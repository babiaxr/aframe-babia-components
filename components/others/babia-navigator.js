/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('babia-navigator', {
    schema: {},

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
    isPaused: undefined,
    sliderEl: undefined,
    toPresent: undefined,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        this.toPresent = true
        this.isPaused = false

        // NEED: wait for 'babiaSelectorDataReady'
        this.el.addEventListener('babiaSelectorDataReady', _listener = (e) => {
            this.selector = e.detail
            this.initializeControls();
        });

        this.el.addEventListener('babiaSelectorDataUpdated', _listener = (e) => {
            this.current = e.detail.selectable.current
            if ((this.current >= this.sliderEl.min) && (this.current <= this.sliderEl.max)){
                this.sliderEl.setAttribute('babia-slider', 'value', this.current)
            }
        });


        // Listener of the other events (should be re-sended to selector)
        let events = ['babiaContinue', 'babiaStop', 'babiaToPresent', 'babiaToPast', 'babiaSpeedUpdated', 'babiaSetPosition', 'babiaSetStep']
        events.forEach(evt => {
            this.el.addEventListener(evt, _listener = (e) => {
                // Re-send event
                if (e.target != this){
                    this.selector.el.emit(evt, e.detail)
                }

                if(evt === 'babiaContinue'){
                    this.isPaused = false
                } else if (evt === 'babiaStop'){
                    this.isPaused = true
                    if (this.controlsEl.querySelector('.babiaPause')){
                        this.controlsEl.querySelector('.babiaPause').emit('click')
                    }
                }

                if(evt === 'babiaToPresent'){
                    this.toPresent = true
                } else if (evt === 'babiaToPast'){
                    this.toPresent = false
                }
            });
        })

        let skip_events = ['babiaSkipNext', 'babiaSkipPrev']
        skip_events.forEach (evt => {
            this.el.addEventListener(evt, _listener = (e) => {
                // Update Slider
                this.isPaused = true
                this.updateSlider(evt)
            });
        })
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {},

    initializeControls: function(){
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
        }); // When implement with selector, add the attributes
        this.sliderEl.classList.add("babiaxraycasterclass");
        this.sliderEl.id = "timeline"
        this.sliderEl.setAttribute('scale', {x:2.3, y:2.3, z:2.3})
        this.el.appendChild(this.sliderEl);

        // Initialize Controls
        this.controlsEl = document.createElement('a-entity');
        this.controlsEl.setAttribute('babia-controls', ""); 
        this.controlsEl.classList.add("babiaxraycasterclass");
        this.controlsEl.setAttribute('scale', {x:0.15, y:0.15, z:0.3})
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

    updateSlider: function(evt){
        let value = this.sliderEl.getAttribute('babia-slider').value
        if (evt ==='babiaSkipNext'){
            value++
        } else if (evt === 'babiaSkipPrev'){
            value--
        }
        // Out of range
        if ((value >= 0) && (value <= this.sliderEl.max)){
            this.sliderEl.setAttribute('babia-slider', 'value', value)
        } else {
            this.el.querySelector('.babiaPause').emit('click')
        }

        this.selector.el.emit('babiaSetPosition', value)
    },

})