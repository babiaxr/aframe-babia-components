/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/*
 * BabiaXR Label component
 *
 * Builds a label, usually to show data for a chart element
 */
AFRAME.registerComponent('babia-label', {
    schema: {
        // Text to show in the label
        text: { type: 'string' },
        // Label height
        height: { type: 'number', default: 1 },
        // Label width
        width: { type: 'number', default: 3 },
        // Text width
        textWidth: { type: 'number', default: 6 },
        // Text color
        color: { type: 'color', default: 'white' },
        // Text font
        font: {type: 'string', default: 'default'},
        // Background color
        background: { type: 'color', default: 'black' },
        // Align text
        align: { type: 'string', default: 'center' }
    },

    update: function (oldData) {
        console.log("Starting label...")
        this.el.setAttribute('geometry', {
            'primitive': 'plane',
            'height': this.data.height,
            'width': this.data.width
        });
        this.el.setAttribute('material', {
            'color': this.data.color
        });
        this.el.setAttribute('text', {
            'value': this.data.text,
            'align': this.data.align,
            'width': this.data.textWidth,
            'color': this.data.background
        });
        this.el.classList.add("babiaxrLegend")
        }
});