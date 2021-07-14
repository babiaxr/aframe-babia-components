/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

 /*
 * Babia Link UI
 *
 * Links Visualizer with UI
 */

AFRAME.registerComponent('babia-ui-link', {
    schema: {
        // Id of the linked visualizer
        viz: { type: 'string' },
        // Id of the UI to update the target
        ui: { type: 'string' },
    },

    linked_viz: undefined,
    ui_target: undefined,
    
 
    init: function() {
        // Create Button
        this.createButton()
    },

    update: function (oldData) {
        let self = this
        let data = this.data

        /* Connect with the linked visualizer */
        findVisualizer(data, self.el, self)
        /* Save UI id */
        findInterface(data, self.el, self)
        console.log('VIZ', self.linked_viz)
    }, 

    createButton: function(){
        this.button = document.createElement('a-entity')
        this.button.classList.add("babiaxraycasterclass")   
        this.button.setAttribute('geometry', {
            'primitive': 'plane',
            'height': 1,
            'width': 3
        })
        this.button.setAttribute('material', {
            'color': '#FFF'
        })
        this.button.setAttribute('text', {
            'value': 'Manage me',
            'align': 'center',
            'width': 8,
            'color': '#000'
        });
        // TO TEST
        this.button.setAttribute('position', {x:0, y: -1 , z:0})
        this.addListeners(this.button, this)
        this.el.appendChild(this.button)
    },

    addListeners: function(button, self){
        button.addEventListener('mouseenter', function(){
            button.setAttribute('text', {color: '#FFF'})
            button.setAttribute('material', {color: '#333'})
        })
        button.addEventListener('mouseleave', function(){
            button.setAttribute('text', {color: '#000'})
            button.setAttribute('material', {color: '#FFF'})
        })
        button.addEventListener('click', function(){
            let ui_target = document.querySelector('#' + self.ui_target)
            console.log(self.linked_viz)
            ui_target.setAttribute('babia-ui', 'target', self.linked_viz)
        })
    }

}); 

let findInterface = (data, el, self) => {
    if (data.ui){
        self.ui_target = data.ui
        return
    } else {
        // Look for interface in the same entity
        if(el.components['babia-ui']){
            self.ui_target = el.components['babia-ui']
            return
        } else {
            // Loof for interface in the scene
            if(document.querySelectorAll("[babia-ui]").length > 0){
                self.ui_target= document.querySelectorAll("[babia-ui]")[0].id
                return
            } else {
                console.error("UI Component not found.")
                return
            }
        }
    }
}

let findVisualizer = (data, el, self) => {
    if (data.viz){
        self.linked_viz = data.viz
    } else {
        // Look for the visualizer only in the same entity
        if(el.components['babia-bars'] || el.components['babia-barsmap'] || el.components['babia-boats'] || 
        el.components['babia-bubbles'] || el.components['babia-city'] || el.components['babia-cyls'] || 
        el.components['babia-cylsmap'] || el.components['babia-doughnut'] || el.components['babia-network'] || 
        el.components['babia-pie']) {
            self.linked_viz = el.id
            return
        } else {
            console.error("Visuzlizer not found.")
            return   
        } 
    }
}