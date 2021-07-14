/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('async-visualizer', {
    schema: {
        from: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let plane = document.createElement("a-plane");
        plane.setAttribute('id', 'info_plane');
        plane.setAttribute('position', '0 7 10');
        plane.setAttribute('rotation', '0 180 0')
        plane.setAttribute('height', '5');
        plane.setAttribute('width', '10');
        plane.setAttribute('color', 'white');
        let label = document.createElement("a-text");
        let label_text = this.el.getAttribute("id") + "_info_label"
        label.setAttribute('id', label_text);
        label.setAttribute('value', 'No info');
        label.setAttribute('color', '#000');
        label.setAttribute('width', '9');
        label.setAttribute('position', '-4.5 0 0')
        plane.appendChild(label);
        this.el.appendChild(plane);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        let data = this.data;
        let el = this.el;

        if (oldData.from !== data.from) {
            let fromComponent = findFrom(data, el, self);
            getDataFrom(fromComponent, el);
        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

  
    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let findFrom = (data, el) => {
    let fromComponent;
    if (data.from) {
      // Save the reference to the querier or filter
      let fromElement = document.getElementById(data.from)
      if (fromElement.components['babia-async-filter']) {
        fromComponent = fromElement.components['babia-async-filter']
      } else if (fromElement.components['babia-async-querier']) {
        fromComponent = fromElement.components['babia-async-querier']
      } else {
        console.error("Problem getting the querier")
        return
      }
    } else {
      // Look for a querier or filter in the same element
      if (el.components['babia-async-filter']) {
        fromComponent = el.components['babia-async-filter']
      } else if (el.components['babia-async-querier']) {
        fromComponent = el.components['babia-async-querier']
      }
    }
    return fromComponent
  }

  let getDataFrom = (fromComponent, el) => {
    let data = [];
    setInterval(() => {
        fromComponent.register.getData(el).then( _data => {
            data = _data;
                let dataToPrint = data.reduce((accumulator, currentValue) => {
                    if (data.indexOf(currentValue) == data.length -1){
                        return accumulator + currentValue['country'] + '.'
                    } else if (data.indexOf(currentValue) == data.length -2) {
                        return accumulator + currentValue['country'] + ' and '
                    } else {
                        return accumulator + currentValue['country'] + ', '
                    }
                }, "New data: ")
                let label_text = el.getAttribute("id") + "_info_label"
                document.getElementById(label_text).setAttribute('value', dataToPrint)
        });        
    }, 1000);
  }
  
  
