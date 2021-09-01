/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}
const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

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
  init: function () {
    this.notiBuffer = new NotiBuffer();
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    let data = this.data;
    let el = this.el;

    // Highest priority to data
    if (data.data && (oldData.data !== data.data || data.filter !== oldData.filter)) {
      this.processData(data.data)
    } else if (data.from !== oldData.from || data.filter !== oldData.filter) {
        // Unregister from old notiBuffer
        if(this.producerComponent) {
          this.producerComponent.notiBuffer.unregister(this.notiBufferId)
        };

        // Register for the new one
        // (It will also invoke processData once if there is already data)
        findProducer(data, el, this)
        if (this.producerComponent.notiBuffer){
          this.notiBufferId = this.producerComponent.notiBuffer.register(this.processData.bind(this))
        }
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

  /**
   * Producer component
   */
  producerComponent: undefined,

  /**
   * NotiBuffer identifier
   */
  notiBufferId: undefined,

  processData: function (data) {
    // Obtain data
    let object;
    if (typeof(data) === 'string' || data instanceof String) {
        object = JSON.parse(data);
    } else {
        object = data;
    };

    // Filter data and save it
    let filter = this.data.filter.split('=')
    let dataFiltered;
    if (filter[0] && filter[1]) {
      dataFiltered = object.filter((key) => key[filter[0]] == filter[1])
      this.notiBuffer.set(dataFiltered);
    } else {
      console.error("Error on filter, please use key=value syntax")
    }  
  },
})

let findProducer = (data, el, self) => {
  if (data.from) {
    // Save the reference to the querier
    let querierElement = document.getElementById(data.from)
    if (querierElement.components['babia-queryjson']) {
      self.producerComponent = querierElement.components['babia-queryjson']
    } else if (querierElement.components['babia-queryes']) {
      self.producerComponent = querierElement.components['babia-queryes']
    } else if (querierElement.components['babia-querygithub']) {
      self.producerComponent = querierElement.components['babia-querygithub']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier in the same element and register
    if (el.components['babia-queryjson']) {
      self.producerComponent = el.components['babia-queryjson']
    } else if (el.components['babia-queryes']) {
      self.producerComponent = el.components['babia-queryes']
    } else if (el.components['babia-querygithub']) {
      self.producerComponent = el.components['babia-querygithub']
    } else {
      // Look for a querier in the scene
      if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        self.producerComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
      } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        self.producerComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
      } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
        self.producerComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
}