const colors = require('../others/common').colors;

/*
 * BabiaXR Cyl component
 *
 * Builds a cylinder (usually for the cyls chart)
 */
AFRAME.registerComponent('babia-cyl', {
    schema: {
        // Height of the cylinder
        height: { type: 'number' },
        // Width of the cylinder
        radius: { type: 'number' },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        // Label for the cylinder ('', 'fixed', 'events')
        label: { type: 'string', default: ''},
        // Label text (valid if label is not empty)
        labelText: { type: 'string', default: ''}
    },

    init: function() {
        console.log("Starting cyl:", this.data.height, this.data.color);
        let data = this.data;
        this.cylinder = document.createElement('a-entity');
        this.cylinder.classList.add("babiaxraycasterclass");
        this.el.appendChild(this.cylinder);
        let props = {}
        if (data.animation) {
            props = {'height': 0, 'radius': data.radius};
        } else {
            props = {'height': data.height, 
                'radius': data.radius};
        }
        this.cylinder.setAttribute('geometry', {
            'primitive': 'cylinder',
            'height': props.height,
            'radius': props.radius
        });
        this.cylinder.setAttribute('material', {
            'color': data.color
        });
    },

    update: function (oldData) {
        let data = this.data;
        let cylinder = this.cylinder;

        this.updateProperty(cylinder, 'geometry', 'height', data.animation,
            data['height'], oldData.height);
        // Update height    
        if (data.height != oldData.height) {
            // If there is change in height, update position
            if (data.animation) {
                cylinder.setAttribute('animation__pos', {
                    'property': 'position',
                    'to': { x: 0, y: data.height/2, z:0 },
                    'dur': data.dur
                });
                if (data.height <= 0 && oldData.height > 0){
                    cylinder.setAttribute('animation__opacity', {
                        'property': 'material.opacity',
                        'to': 0,
                        'dur': data.dur
                    });
                } else if (oldData.height <= 0 && data.height > 0){
                    cylinder.setAttribute('animation__opacity', {
                        'property': 'material.opacity',
                        'to': 100,
                        'dur': data.dur
                    });  
                }
            } else {
                cylinder.setAttribute('position', { x: 0, y: data.height/2, z: 0 });
                if (data.height <= 0 && oldData.height > 0){
                    cylinder.setAttribute('material', 'opacity', 0);
                } else if (oldData.height <= 0 && data.height > 0){
                    cylinder.setAttribute('material', 'opacity', 100);
                }
            };
        };
        this.updateProperty(cylinder, 'geometry', 'radius', data.animation,
            data.radius, oldData.radius);
        this.updateProperty(cylinder, 'material', 'color', data.animation,
            data.color, oldData.color);
        if (this.data.label === 'events') {
            cylinder.addEventListener('mouseenter', this.showLabel.bind(this)); 
            cylinder.addEventListener('mouseleave', this.hideLabel.bind(this));          
        } else if (this.data.label === 'fixed') {
            this.showLabel(oldData);
        };
    },

    /*
     * Update a property in an element, having animation into account
     *
     * @param el Element
     * @param component Component in which to update property
     * @param property Property to update in element
     * @param name: Property name in data, oldData
     * @param oldValue: Old value
     */
    updateProperty: function (el, component, property, anim, newValue, oldValue) {
        let data = this.data;

        if (newValue !== oldValue) {
            if (anim) {
                let prop = component;
                if (property) { prop = prop + '.' + property };
                el.setAttribute('animation__'+component+'_'+property, {
                    'property': prop,
                    'to': newValue,
                    'dur': data.dur
                });
            } else {
                if (property) {
                    el.setAttribute(component, { [property]: newValue });        
                } else {
                    el.setAttribute(component, newValue);
                }
            };
        };
    },

    showLabel: function (oldData) {
        let data = this.data;

        if (data.label === 'events') {
            this.el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        };

        text = data.labelText;
        let width = 2;
        if (text.length > 16) { width = text.length / 8 };
        let height = 1;
        oldHeight = oldData.height || 0;
        let oldPosition = {
            x: 0, y: oldHeight + 0.6 * height,
            z: 0
        }

        if (!this.labelEl) {
            this.labelEl = document.createElement('a-entity');
            this.labelEl.setAttribute('babia-label', {
                'width': width, 'textWidth': 6
            });
            if (data.animation && (data.label === 'fixed')) {
                this.labelEl.setAttribute('position', oldPosition);
            };
            this.el.appendChild(this.labelEl);
        };

        let position = {
            x: 0, y: data.height + 0.7 * height,
            z: 0.7 * data.radius
        };

        let anim = data.animation && (data.label === 'fixed');
        this.updateProperty(this.labelEl, 'position', '', anim, position, oldPosition);
        this.labelEl.setAttribute('rotation', {x: 0, y: 0, z: 0});
        if (text != oldData.labelText) {
            this.labelEl.setAttribute('babia-label', { 'text': data.labelText });
        }

    },

    hideLabel: function () {
        if (this.data.label === 'events') {
            this.el.setAttribute('scale', { x: 1, y: 1, z: 1 });
        };
        if (this.labelEl) {
            this.el.removeChild(this.labelEl);
            this.labelEl = null;
        }
    }
});