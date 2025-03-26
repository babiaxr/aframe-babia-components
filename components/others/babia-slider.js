/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('babia-slider', {
  schema: {
    color: { type: 'color', default: '#fff' },
    size: { type: 'number', default: 0.5 },
    min: { type: 'number', default: -6 },
    max: { type: 'number', default: -4 },
    value: { type: 'number', default: -5 },
    innerSize: { type: 'number', default: 0.8 },
    precision: { type: 'number', default: 2 },
    vertical: { type: 'boolean', default: false },
    label: { type: 'string' }
  },

  multiple: true,

  init: function () {
    this.loader = new FontLoader.FontLoader();

    let material = new THREE.MeshBasicMaterial({ color: this.data.color });
    this.material = material
    let lever = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), material);
    let track = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, this.data.size, 12), material);
    track.rotateZ(Math.PI / 2);
    let chassis = new THREE.Group();

    this.lever = lever;
    chassis.add(track);
    chassis.add(lever);

    if (this.data.vertical) {
      chassis.rotateZ(Math.PI / 2)
    }

    this.el.setObject3D('mesh', chassis);
    this.el.classList.add("babiaxraycasterclass");

    this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));

    this.fontURL = 'https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json'
    this.loader.load(this.fontURL, (font) => {
      this.font = font
      let minText = this.createTextGeometry(this.data.min, -this.data.size / 2 - .15, -.025)
      let maxText = this.createTextGeometry(this.data.max, this.data.size / 2 + .08, -.025)
      chassis.add(minText)
      chassis.add(maxText)
    })
  },

  createTextGeometry: function (text, x, y) {
    let textGeometry = new TextGeometry.TextGeometry(text.toString(), {
      font: this.font,
      size: .07,
      height: .01,
      curveSegments: 12,
      bevelEnabled: false,
    });
    let textMesh = new THREE.Mesh(textGeometry, this.material)
    textMesh.position.x = x
    textMesh.position.y = y
    if (this.data.vertical) {
      textMesh.rotation.z = - Math.PI / 2
      textMesh.position.y += .05
    }
    return textMesh
  },

  setTextGeometry: function (text) {
    if (this.textmesh) {
      this.lever.children = []
    }
    this.loader.load(this.fontURL, (font) => {
      this.font = font
      if (!this.data.vertical) {
        this.textmesh = this.createTextGeometry(text, -.025, .15)
      } else {
        this.textmesh = this.createTextGeometry(text, -.025, -.2)
      }
      this.lever.add(this.textmesh)
    })
  },

  play: function () {
    this.grabbed = false;
    this.el.addEventListener('rangeout', this.onTriggerUp.bind(this));
    this.controllers.forEach(function (controller) {
      controller.addEventListener('triggerdown', this.onTriggerDown.bind(this));
      controller.addEventListener('triggerup', this.onTriggerUp.bind(this));
    }.bind(this));
  },

  pause: function () {
    this.el.removeEventListener('rangeout', this.onTriggerUp.bind(this));
    this.controllers.forEach(function (controller) {
      controller.removeEventListener('triggerdown', this.onTriggerDown.bind(this));
      controller.removeEventListener('triggerup', this.onTriggerUp.bind(this));
    }.bind(this));
  },

  onTriggerDown: function (e) {
    var hand = e.target.object3D;
    var lever = this.lever;

    var handBB = new THREE.Box3().setFromObject(hand);
    var leverBB = new THREE.Box3().setFromObject(lever);
    var collision = handBB.intersectsBox(leverBB);

    if (collision) {
      let handWorld = new THREE.Vector3();
      hand.getWorldPosition(handWorld);
      let knobWorld = new THREE.Vector3();;
      lever.getWorldPosition(knobWorld);
      let distance = handWorld.distanceTo(knobWorld);
      if (distance < 0.1) {
        this.grabbed = hand;
        this.grabbed.visible = false;
        this.knob.material = this.knobGrabbedMaterial;
      }
    };
  },

  onTriggerUp: function () {
    if (this.grabbed) {
      this.grabbed.visible = true;
      this.grabbed = false;
      this.knob.material = this.knobMaterial;
    }
  },

  setValue: function (value) {
    var lever = this.lever;
    if (value < this.data.min) {
      value = this.data.min;
    } else if (value > this.data.max) {
      value = this.data.max;
    }

    this.value = value;

    lever.position.x = this.valueToLeverPosition(value);
    if (!this.data.label) {
      this.setTextGeometry(value)
    } else {
      this.setTextGeometry(this.data.label)
    }

  },

  valueToLeverPosition: function (value) {
    var sliderRange = this.data.size * this.data.innerSize;
    var valueRange = Math.abs(this.data.max - this.data.min);

    let sliderMin = -1 * sliderRange / 2;

    return (((value - this.data.min) * sliderRange) / valueRange) + sliderMin
  },

  leverPositionToValue: function (position) {
    var sliderRange = this.data.size * this.data.innerSize;
    var valueRange = Math.abs(this.data.max - this.data.min);

    let sliderMin = -1 * sliderRange / 2;

    return (((position - sliderMin) * valueRange) / sliderRange) + this.data.min
  },

  tick: function () {
    if (this.grabbed) {
      var hand = this.grabbed;
      var lever = this.lever;
      var sliderSize = this.data.size;
      var sliderRange = (sliderSize * this.data.innerSize);

      var handWorld = new THREE.Vector3().setFromMatrixPosition(hand.matrixWorld);
      lever.parent.worldToLocal(handWorld);

      if (Math.abs(handWorld.x) > sliderRange / 2) {
        lever.position.x = sliderRange / 2 * Math.sign(lever.position.x);
      } else {
        lever.position.x = handWorld.x;
      }
      var value = this.leverPositionToValue(lever.position.x);

      if (Math.abs(this.value - value) >= Math.pow(10, -this.data.precision)) {
        value = Math.round(value)
        this.value = value;
        this.setTextGeometry(value)
        // this.el.parentEl.components['babia-navigator'].controlNavigator('babiaSetPosition', this.value)
        if (this.el.parentEl.components['babia-navigator']) {
          this.el.parentEl.components['babia-navigator'].controlNavigator('babiaSetPosition', Math.round(value))
        } else if (this.el.parentEl.components['babia-step-controller']) {
          this.el.parentEl.components['babia-step-controller'].controlStep(Math.round(value))
        } else if (this.el.parentEl.components['babia-speed-controller']) {
          this.el.parentEl.components['babia-speed-controller'].controlSpeed(Math.round(value))
        }
      }
    }
  },

  mousexPositionToValue: function (x) {
    // Create a THREE.Vector3 object to get the world position
    let worldPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(worldPosition);

    // Slider center in world coordinates
    let sliderCenter = worldPosition.x;

    // Slider width considering its scale and the parent's scale
    let sliderWidth = this.data.size * this.el.object3D.scale.x * this.el.parentEl.object3D.scale.x;

    // Number of divisions or slices we want (sliderRange)
    let sliderRange = Math.abs(this.data.max - this.data.min);

    // Calculate the left and right limits of the slider
    let sliderMin = sliderCenter - (sliderWidth / 2);
    let sliderMax = sliderCenter + (sliderWidth / 2);

    // Ensure x is within the slider's range
    if (x < sliderMin) return this.data.min;
    if (x > sliderMax) return this.data.max;

    // Calculate the size of each slice of the slider
    let sliceSize = sliderWidth / sliderRange;

    // Identify in which slice x falls
    let sliceIndex = Math.floor((x - sliderMin) / sliceSize);

    // Convert the slice index to the corresponding value
    let value = this.data.min + sliceIndex;

    // Return the value ensuring it is within the allowed range
    return Math.min(Math.max(value, this.data.min), this.data.max);
  },

  mouseyPositionToValue: function (y) {
    // Create a THREE.Vector3 object to get the world position
    let worldPosition = new THREE.Vector3();
    this.el.object3D.getWorldPosition(worldPosition);

    // Slider center in world coordinates (Y-axis)
    let sliderCenter = worldPosition.y;

    // Slider height considering its scale and the parent's scale
    let sliderHeight = this.data.size * this.el.object3D.scale.y * this.el.parentEl.object3D.scale.y;

    // Number of divisions or slices we want (sliderRange)
    let sliderRange = Math.abs(this.data.max - this.data.min);

    // Calculate the bottom and top limits of the slider
    let sliderMin = sliderCenter - (sliderHeight / 2);
    let sliderMax = sliderCenter + (sliderHeight / 2);

    // Ensure y is within the slider's range
    if (y < sliderMin) return this.data.min;
    if (y > sliderMax) return this.data.max;

    // Calculate the size of each slice of the slider
    let sliceSize = sliderHeight / sliderRange;

    // Identify in which slice y falls
    let sliceIndex = Math.floor((y - sliderMin) / sliceSize);

    // Convert the slice index to the corresponding value
    let value = this.data.min + sliceIndex;

    // Return the value ensuring it is within the allowed range
    return Math.min(Math.max(value, this.data.min), this.data.max);
  },

  update: function (old) {
    if (this.data.value !== old.value) {
      this.setValue(this.data.value);
    }
    this.el.addEventListener('click', _listener = (e) => {
      let mouse = e.detail.intersection.point
      let value
      if (!this.data.vertical) {
        value = this.mousexPositionToValue(mouse.x);
      } else {
        value = this.mouseyPositionToValue(mouse.y);
      }
      //this.setValue(Math.round(value));

      if (this.el.parentEl.components['babia-navigator']) {
        this.el.parentEl.components['babia-navigator'].controlNavigator('babiaSetPosition', Math.round(value))
      } else if (this.el.parentEl.components['babia-step-controller']) {
        this.el.parentEl.components['babia-step-controller'].controlStep(Math.round(value))
      } else if (this.el.parentEl.components['babia-speed-controller']) {
        this.el.parentEl.components['babia-speed-controller'].controlSpeed(Math.round(value))
      }
    })
  }
})

AFRAME.registerComponent('babia-step-controller', {
  schema: {
    value: { type: 'number', default: -5 },
  },

  multiple: true,

  sliderEl: undefined,
  step: undefined,

  init: function () {
    this.createSlider()
  },
  update: function (old) {
    if (this.data.value !== old.value) {
      this.sliderEl.setAttribute('babia-slider', 'value', this.data.value);
    }
  },

  createSlider: function () {
    this.sliderEl = document.createElement('a-entity');
    this.sliderEl.setAttribute('babia-slider', {
      size: 1,
      min: 1,
      max: 10,
      value: 1,
      vertical: true
    }); // When implement with selector, add the attributes
    this.sliderEl.classList.add("babiaxraycasterclass");
    this.sliderEl.id = "step-controller"
    this.el.appendChild(this.sliderEl);
  },

  controlStep: function (value) {
    this.step = value
    this.el.parentEl.components['babia-navigator'].controlNavigator('babiaSetStep', this.step)
  }
})


AFRAME.registerComponent('babia-speed-controller', {
  schema: {
    value: { type: 'number', default: -5 },
  },

  multiple: true,

  sliderEl: undefined,
  speed: undefined,

  init: function () {
    this.createSlider()
  },

  update: function (old) {
    if (this.data.value !== old.value) {
      this.sliderEl.setAttribute('babia-slider', 'value', this.data.value);
    }
  },

  createSlider: function () {
    this.sliderEl = document.createElement('a-entity');
    this.sliderEl.setAttribute('babia-slider', {
      size: 1,
      min: 1,
      max: 3,
      value: 1,
      vertical: true
    }); // When implement with selector, add the attributes
    this.sliderEl.classList.add("babiaxraycasterclass");
    this.sliderEl.id = "speed-controller"
    this.el.appendChild(this.sliderEl);
  },

  controlSpeed: function (value) {
    this.speed = value
    this.el.parentEl.components['babia-navigator'].controlNavigator('babiaSetSpeed', this.speed)
  }
})