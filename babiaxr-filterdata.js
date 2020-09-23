/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-filterdata', {
  dependencies: ['babiaxr-querier', 'babiaxr-vismapper'],
  schema: {
    from: { type: 'string' },
    filter: { type: 'string' }
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

    console.log("FILTERDATA:" + data.filter)
    filter = data.filter.split('=')
    console.log(filter)
    let querierElement = document.getElementById(data.from)
    if (querierElement.getAttribute('babiaData')) {
      let dataFromQuerier = JSON.parse(querierElement.getAttribute('babiaData'));
      console.log(dataFromQuerier)
      // Get if key or filter
      saveEntityData(data, el, dataFromQuerier, filter[0], filter[1])
    } else {
      // Get if key or filter
      document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
        saveEntityData(data, el, e.detail, filter[0], filter[1])
        el.setAttribute("babiaxr-filterdata", "dataRetrieved", data.dataRetrieved)
      })
    }
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    let data = this.data;
    let el = this.el;

    // If entry it means that the data changed
    if (data.dataRetrieved !== oldData.dataRetrieved) {
      el.setAttribute("babiaxr-vismapper", "dataToShow", JSON.stringify(data.dataRetrieved))
    }

    if (data.from !== oldData.from) {
      console.log("Change event because from has changed")
      // Remove the event of the old querier
      document.getElementById(data.from).removeEventListener('dataReady' + oldData.from, function (e) { })
      // Listen the event when querier ready
      document.getElementById(data.from).addEventListener('dataReady' + data.from, function (e) {
        saveEntityData(data, el, e.detail, filter[0], filter[1])
        el.setAttribute("babiaxr-vismapper", "dataToShow", JSON.stringify(data.dataRetrieved))
      });
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

let filter

let saveEntityData = (data, el, dataToSave, filter_field, filter_value) => {
  if (filter_field && !filter_value) {
    data.dataRetrieved = dataToSave[filter_field]
    el.setAttribute("babiaData", JSON.stringify(dataToSave[filter_field]))
  } else if (filter_field && filter_value) {
    let dataToFilter = Object.values(dataToSave)
    let dataFiltered = dataToFilter.filter((key) => key[filter_field] == filter_value )
    dataFiltered = Object.assign({}, dataFiltered); 
    data.dataRetrieved = dataFiltered
    el.setAttribute('babiaData', JSON.stringify(dataFiltered))
  } else {
    data.dataRetrieved = dataToSave
    el.setAttribute("babiaData", JSON.stringify(dataToSave))
  }
}