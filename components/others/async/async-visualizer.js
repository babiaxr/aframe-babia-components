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

    multiple: false,

    init: function () {
      // Create visualizer
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
        label.setAttribute('value', 'Loading...');
        label.setAttribute('color', '#000');
        label.setAttribute('width', '9');
        label.setAttribute('position', '-4.5 0 0')
        plane.appendChild(label);
        this.el.appendChild(plane);

        setInterval(() => {
          getDataToShow(this);
        }, 2000);
    },

    update: function (oldData) {
        if (oldData.from !== this.data.from) {
            getDataToShow(this);
        }
    },

    remove: function () { },
    pause: function () { },
    play: function () { },

})

// Function to find fromComponent to get data from it's register
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

  // Function to obtain data from fromComponent's register
  async function getDataToShow (self) {
    let fromComponent = findFrom(self.data, self.el);
    let rawData = await fromComponent.register.getData();
    if (rawData != "data_empty"){
      showData(rawData, self.el)
    }   
  }

  // Function to rearrange and show data once obtained
  let showData = (data, el) => {
    let dataToPrint = data.reduce((acc, cv) => {
      if (data.indexOf(cv) == data.length -1){
        return acc + cv['country'] + '.'
      } else if (data.indexOf(cv) == data.length -2) {
        return acc + cv['country'] + ' and '
      } else {
        return acc + cv['country'] + ', '
      }
    }, "New data: ")
      let label_text = el.getAttribute("id") + "_info_label";
      document.getElementById(label_text).setAttribute('value', dataToPrint)
  }
