/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-filter', {
  schema: {
    from: { type: 'string' },
    filter: { type: 'string' },
    // data, for debugging, highest priority
    data: { type: 'string' }
  },

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,

  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function () { },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    let data = this.data;
    let el = this.el;
    let self = this;

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      let rawData = parseEmbeddedJSONData(data.data)

      // Filtering, save the references
      let dataFiltered = filterData(data, rawData)
      self.babiaData = dataFiltered
      self.babiaMetadata = {
        id: self.babiaMetadata.id++
      }

      // Dispatch interested events
      dataReadyToSend("babiaData", self)
    } else {

      if (data.from !== oldData.from) {
        // Unregister for old querier
        if(self.querierComponent) { self.querierComponent.unregister(el) }
        

        // Register for the new one
        findQuerier(data, el, self)

        // Attach to the event of the querier
        el.addEventListener('babiaQuerierDataReady', function (e) {
          // Get the data from the info of the event (propertyName)
          self.querierDataPropertyName = e.detail
          let rawData = self.querierComponent[self.querierDataPropertyName]

          // Filtering, save the references
          let dataFiltered = filterData(data, rawData)
          self.babiaData = dataFiltered
          self.babiaMetadata = {
            id: self.babiaMetadata.id++
          }

          // Dispatch interested events
          dataReadyToSend("babiaData", self)
        });

        // Register to the querier
        self.querierComponent.register(el)
      }

      // If changed filter (is mandatory, so it has been defined, first time is undefined)
      if (oldData.filter && data.filter !== oldData.filter) {
        // Get again the raw data from the querier
        let rawData = self.querierComponent[self.querierDataPropertyName]

        // Filtering, save the new references
        let dataFiltered = filterData(data, rawData)
        self.babiaData = dataFiltered
        self.babiaMetadata = {
          id: self.babiaMetadata.id++
        }

        // Dispatch interested events
        dataReadyToSend("babiaData", self)
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

  /**
   * Querier component target
   */
  querierComponent: undefined,

  /**
   * Property of the querier where the data is saved
   */
  querierDataPropertyName: "babiaData",

  /**
   * Where the data is gonna be stored
   */
  babiaData: undefined,

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /**
   * Register function
   */
  register: function (interestedElem) {
    let el = this.el
    this.interestedElements.push(interestedElem)

    // Send the latest version of the data
    if (this.babiaData) {
      dispatchEventOnElement(interestedElem, "babiaData")
    }
  },

  /**
   * Unregister function
   */
  unregister: function (interestedElem) {
    const index = this.interestedElements.indexOf(interestedElem)

    // Remove from the interested elements if still there
    if (index > -1) {
      this.interestedElements.splice(index, 1);
    }
  },

  /**
   * Interested elements
   */
  interestedElements: [],
})


let filterData = (data, rawData) => {
  let filter = data.filter.split('=')
  if (filter[0] && filter[1]) {
    let dataFiltered = rawData.filter((key) => key[filter[0]] == filter[1])
    return dataFiltered
  } else {
    console.error("Error on filter, please use key=value syntax")
    return []
  }
}

let findQuerier = (data, el, self) => {
  if (data.from) {
    // Save the reference to the querier
    let querierElement = document.getElementById(data.from)
    if (querierElement.components['babia-queryjson']) {
      self.querierComponent = querierElement.components['babia-queryjson']
    } else if (querierElement.components['babia-queryes']) {
      self.querierComponent = querierElement.components['babia-queryes']
    } else if (querierElement.components['babia-querygithub']) {
      self.querierComponent = querierElement.components['babia-querygithub']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier in the same element and register
    if (el.components['babia-queryjson']) {
      self.querierComponent = el.components['babia-queryjson']
    } else if (el.components['babia-queryes']) {
      self.querierComponent = el.components['babia-queryes']
    } else if (el.components['babia-querygithub']) {
      self.querierComponent = el.components['babia-querygithub']
    } else {
      // Look for a querier in the scene
      if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
      } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
      } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
        self.querierComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
}

let parseEmbeddedJSONData = (embedded) => {
  let dataRetrieved = JSON.parse(embedded)
  return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
    dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaFilterDataReady", propertyName)
}