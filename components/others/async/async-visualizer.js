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
            //let dataToPrint = getDataFrom(fromComponent);
            fromComponent.register.updateMe()
            getDataFrom(fromComponent)
            //console.log(dataToPrint.toString())

            let plane = document.createElement("a-plane");
            plane.setAttribute('id', 'info_plane');
            plane.setAttribute('position', '0 7 10');
            plane.setAttribute('rotation', '0 180 0')
            plane.setAttribute('height', '10');
            plane.setAttribute('width', '10');
            plane.setAttribute('color', '#ffff');
            let label = document.createElement("a-text");
            label.setAttribute('id', 'info_label');
            label.setAttribute('value', 'No info');
            label.setAttribute('color', '#000');
            plane.appendChild(label);
            el.appendChild(plane);
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

let findFrom = (data, el, self) => {
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
      } else {
        // Look for a querier or filter in the scene
        if (document.querySelectorAll("[babia-async-filter]").length > 0) {
          fromComponent = document.querySelectorAll("[babia-async-filter]")[0].components['babia-async-filter']
        } else if (document.querySelectorAll("[babia-async-querier]").length > 0) {
          fromComponent = document.querySelectorAll("[babia-async-querier]")[0].components['babia-async-querier']
        } else {
          console.error("Error, querier not found")
          return
        }
      }
    }
    return fromComponent
  }

  let getDataFrom = (fromComponent) => {
    let dataToPrint = "";
    setInterval(() => {
        fromComponent.register.waitForData().then( data => {
            dataToPrint = data;
            console.log(dataToPrint)});
            listen = false;
        
    }, 1000);
    return dataToPrint;
  }
  
