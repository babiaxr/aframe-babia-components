/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('visdata', {
  dependencies: ['querier', 'vismapper'],
  schema: {
    from: { type: 'string' },
    index: { type: 'string' }
  },

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,

  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function () {
    let data = this.data;
    let el = this.el;

    let querierElement = document.getElementById(data.from)
    if (querierElement.getAttribute('dataEntity')) {
      let dataFromQuerier = JSON.parse(querierElement.getAttribute('dataEntity'));
      // Get if key or index
      if (!dataFromQuerier[data.index] && !isNaN(parseInt(data.index))) {
        saveEntityData(data, el, dataFromQuerier[Object.keys(dataFromQuerier)[parseInt(data.index)]])
      } else {
        saveEntityData(data, el, dataFromQuerier[data.index])
      }

    } else {
      // Get if key or index
      document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
        if (!e.detail[data.index] && !isNaN(parseInt(data.index))) {
          saveEntityData(data, el, e.detail[Object.keys(e.detail)[parseInt(data.index)]])
          el.setAttribute("visdata", "dataRetrieved", data.dataRetrieved)
        } else {
          saveEntityData(data, el, e.detail[data.index])
          el.setAttribute("visdata", "dataRetrieved", data.dataRetrieved)
        }
      })
    }
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    // If entry it means that the data changed
    if (data !== oldData) {
      if (data.dataRetrieved !== oldData.dataRetrieved) {
        el.components.vismapper.data.dataToShow = data.dataRetrieved;
        el.components.vismapper.update(el.components.vismapper.data)
      }
      if (data.from !== oldData.from) {
        console.log("Change event because from has changed")
        // Remove the event of the old querier
        document.getElementById(data.from).removeEventListener('dataReady' + oldData.from, function (e) { })
        // Listen the event when querier ready
        document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
          saveEntityData(data, el, e.detail[data.index])
          el.components.vismapper.data.dataToShow = data.dataRetrieved;
          el.components.vismapper.update(el.components.vismapper.data)
        });
      }
    }

  },
  /**
  * Called when a component is removed (e.g., via removeAttribute).
  * Generally undoes all modifications to the entity.
  */
  remove: function () { },

  /**
  * Called on each scene tick.
  */
  // tick: function (t) { },

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

let saveEntityData = (data, el, dataToSave) => {
  data.dataRetrieved = dataToSave
  el.setAttribute("dataEntity", JSON.stringify(dataToSave))
}