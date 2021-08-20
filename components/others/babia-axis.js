const colors = require('../others/common').colors;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/*
 * Class for building axis (x, y, or z), with labels and everything
 */
class Axis {
    /*
    * @param el Element
    * @param axis Axis ('x', 'y', 'z')
    * @param anim Is done with animation?
    * @param dur Duration of the animation
    */
    constructor(el, axis, anim, dur) {
        this.el = el;
        this.axis = axis;
        this.anim = anim;
        this.dur = dur;
    }
    /*
    * Update axis line
    *
    * @param length Lenght of axis line
    * @param color Color of axis line
    */
    updateLine(length, color) {
        const axis = this.axis;
        const el = this.el;
        const anim = this.anim;
        const dur = this.dur;

        const comp = `line__${axis}axis`
        let lineEl = el.components[comp];
        let end = { x: 0, y: 0, z: 0};
        end[axis] = length;

        if (anim && lineEl) {
            el.setAttribute(`animation__${axis}axis`, {
                'property': `${comp}.end`,
                'to': end,
                'dur': dur
            });
            el.setAttribute(comp, { 'color': color });
        } else {
            el.setAttribute(comp, {
                'start': { x: 0, y: 0, z: 0 },
                'end': end,
                'color': color
            });
        };

    };

    /*
    * Remove labels which are children of an element
    *
    * @param el Element
    * @param anim Is done with animation?
    * @param dur Duration of the animation
    */
    removeLabels() {
        const el = this.el;
        const anim = this.anim;
        const dur = this.dur;
        
        let labels = el.querySelectorAll('[text]');
        for (const label of labels) {
            if (anim) {
                label.addEventListener('animationcomplete', function (e) {
                    e.target.remove();
                });
                label.setAttribute('animation', {
                    'property': 'text.opacity',
                    'to': 0,
                    'dur': dur
                });
            } else {
                label.remove();
            }
        };
    };

    /*
    * Update labels
    *
    * @param ticks Points in the axis for the labels
    * @param labels Labels to write in the ticks
    * @param color Color to use
    * @param palette Palette of colors to use
    */
    updateLabels(ticks, labels, color, palette, align) {
        const axis = this.axis;
        let el = this.el;
        const anim = this.anim;
        const dur = this.dur;
        
        for (let i = 0; i < ticks.length; ++i) {
            let label = document.createElement('a-entity');
            let icolor = color;
            if (palette) {
                icolor = colors.get(i, palette);
            };
            label.setAttribute('text', {
                'value': labels[i],
                'align': 'right',
                'width': 10,
                'color': icolor,
                'opacity': 0
            });
            if (align == "behind" || align == "right"){
                label.setAttribute('text', {'align': 'left'})
            }
            let pos;
            if (axis === 'x') {
                if (align == 'behind'){
                    pos = { x: ticks[i], y: 0, z: -5.15 };
                } else {
                    pos = { x: ticks[i], y: 0, z: 5.25 };
                }
            } else if (axis === 'y') {
                if (align == "right"){
                    pos = { x: 5.2, y: ticks[i], z: 0 };
                } else {
                    pos = { x: - 5.2, y: ticks[i], z: 0 };
                }
            } else if (axis === 'z'){
                if (align == "right"){
                    pos = { x: 5.2, y: 0, z: ticks[i] };
                } else {
                    pos = { x: - 5.2, y: 0, z: ticks[i] };
                }
            }
            label.setAttribute('position', pos);
            if (axis === 'x') {
                label.setAttribute('rotation', { x: -90, y: 90, z: 0 });
            } else if (axis === 'z'){
                label.setAttribute('rotation', { x: -90, y: 0, z: 0 });
            }
            if (anim) {
                label.setAttribute('animation', {
                    'property': 'text.opacity',
                    'to': 1,
                    'dur': dur
                });
            } else {
                label.setAttribute('text', {'opacity': 1})
            };
            el.appendChild(label);
        };
    };

    updateName(name, align, length){
        const axis = this.axis;
        let el = this.el;
        const anim = this.anim;
        const dur = this.dur;

       // for (let i = 0; i < ticks.length; ++i) {
            let label = document.createElement('a-entity');
            label.setAttribute('text', {
                'value': name,
                'align': 'right',
                'width': 10,
                'color': '#000',
                'opacity': 0
            });
            if (align == "behind" || align == "right"){
                label.setAttribute('text', {'align': 'left'})
            }
            let pos;
            if (axis === 'x') {
                if (align == 'behind'){
                    pos = { x: length + 0.5, y: 0, z: -5.15 };
                } else {
                    pos = { x: length + 0.5, y: 0, z: 5.25 };
                }
            } else if (axis === 'y') {
                if (align == "right"){
                    pos = { x: 5.2, y: length + 0.5, z: 0 };
                } else {
                    pos = { x: - 5.2, y: length + 0.5, z: 0 };
                }
            } else if (axis === 'z'){
                if (align == "right"){
                    pos = { x: 5.2, y: 0, z: length + 0.5 };
                } else {
                    pos = { x: - 5.2, y: 0, z: length + 0.5};
                }
            }
            label.setAttribute('position', pos);
            if (axis === 'x') {
                label.setAttribute('rotation', { x: -90, y: 90, z: 0 });
            } else if (axis === 'z'){
                label.setAttribute('rotation', { x: -90, y: 0, z: 0 });
            }
            if (anim) {
                label.setAttribute('animation', {
                    'property': 'text.opacity',
                    'to': 1,
                    'dur': dur
                });
            } else {
                label.setAttribute('text', {'opacity': 1})
            };
            el.appendChild(label);
       // };
    }
}

 /*
 * BabiaXR Y Axis component
 *
 * Builds a Y axis for a chart
 */
AFRAME.registerComponent('babia-axis-y', {
    schema: {
        // Max value to show for this axis
        maxValue: { type: 'number' },
        // Length of the axis
        length: { type: 'number' },
        // Minimum number of steps
        minSteps: { type: 'number', default: 6 },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        // If we want the labels behind to axis.
        align: { type: 'string', default: 'left'},
        // Name to show on label
        name: { type: 'string', default: ''}
    },
 
    init: function() {
        this.axis = new Axis(this.el, 'y', this.data.animation, this.data.dur);
    },

    update: function (oldData) {
        const data = this.data;
        let maxValue = this.data.maxValue;
        let length = this.data.length;
        let minSteps = this.data.minSteps;
        const animation = this.data.animation;
        const dur = this.data.dur;
        let decimals = 0;
        console.log('Starting babia-axis-y:', maxValue, length, this.data.color);

        if ((maxValue != oldData.maxValue) || (length != oldData.maxValue) ||
            (minSteps != oldData.minSteps)) {
            // Get number of significant digits (negative is decimals)
            let maxValueLog = Math.floor(Math.log10(maxValue));
            if (maxValueLog <= 0) {
                decimals = - maxValueLog + 1;
            };
            let axisScale = length / maxValue;
            let step = Math.pow(10, maxValueLog);
            let steps = maxValue / step;
            while (steps <= minSteps) {
                step = step / 2;
                steps = maxValue / step;
            };

            // Set axis line
            this.axis.updateLine(length, data.color);
            // Remove old labels
            this.axis.removeLabels();

            // Create new labels
            let ticks = [];
            let labels = [];
            for (let tick = 1; step * tick < maxValue; tick++) {
                vtick = step * tick;
                ticks.push(vtick * axisScale);
                labels.push(vtick.toFixed(decimals));
            };
            this.axis.updateLabels(ticks, labels, data.color, data.palette, data.align);
        };
        // Update name in axis label
        if (data.name) this.axis.updateName(data.name, data.align, data.length);
        
    }
});      

/*
 * BabiaXR X Axis component
 *
 * Builds a X axis for a chart
 */
AFRAME.registerComponent('babia-axis-x', {
    schema: {
        // Labels to show (list)
        labels: { type: 'array' },
        // Points to have labels in the axis
        ticks: { type: 'array'},
        // Length of the axis
        length: { type: 'number' },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Color palette (if not 'None', have precedence over color)
        palette: { type: 'string', default: '' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        // If we want the labels behind of the axis.
        align: { type: 'string', default: 'front'},
        // Name to show on label
        name: { type: 'string', default: ''}
    },

    init: function() {
        this.axis = new Axis(this.el, 'x', this.data.animation, this.data.dur);
    },

    update: function (oldData) {
        const data = this.data;
        console.log('Starting babia-axis-x:', data.ticks.length, data.length, this.data.color);

         // Set axis line
        this.axis.updateLine(data.length, data.color);
        // Remove old labels
        this.axis.removeLabels();
        // Update labels with new values
        this.axis.updateLabels(data.ticks, data.labels, data.color, data.palette, data.align);
        // Update name in axis label
        if (data.name) this.axis.updateName(data.name, data.align, data.length);
     }

});

/*
 * BabiaXR X Axis component
 *
 * Builds a X axis for a chart
 */
AFRAME.registerComponent('babia-axis-z', {
    schema: {
        // Labels to show (list)
        labels: { type: 'array' },
        // Points to have labels in the axis
        ticks: { type: 'array'},
        // Length of the axis
        length: { type: 'number' },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Color palette (if not 'None', have precedence over color)
        palette: { type: 'string', default: '' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        // If we want the labels on the right of the axis.
        align: { type: 'string', default: 'left'},
        // Name to show on label
        name: { type: 'string', default: ''}
    },

    init: function() {
        this.axis = new Axis(this.el, 'z', this.data.animation, this.data.dur);
    },

    update: function (oldData) {
        const data = this.data;
        console.log('Starting babia-axis-z:', data.ticks.length, data.length, this.data.color);

         // Set axis line
        this.axis.updateLine(data.length, data.color);
        // Remove old labels
        this.axis.removeLabels();
        // Update labels with new values
        this.axis.updateLabels(data.ticks, data.labels, data.color, data.palette, data.align);
        // Update name in axis label
        if (data.name) this.axis.updateName(data.name, data.align, data.length);
     }

});