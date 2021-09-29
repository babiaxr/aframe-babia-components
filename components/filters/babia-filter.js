let findProdComponent = require('../others/common').findProdComponent;
let parseJson = require('../others/common').parseJson;

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
      let _data = parseJson(data.data);
      this.processData(_data);
    } else if (data.from !== oldData.from || data.filter !== oldData.filter) {
        // Unregister from old notiBuffer
        if(this.prodComponent) {
          this.prodComponent.notiBuffer.unregister(this.notiBufferId)
        };

        // Register for the new one
        // (It will also invoke processData once if there is already data)
        this.prodComponent = findProdComponent(data, el, "babia-filter")
        if (this.prodComponent.notiBuffer){
          this.notiBufferId = this.prodComponent.notiBuffer.register(this.processData.bind(this))
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
  prodComponent: undefined,

  /**
   * NotiBuffer identifier
   */
  notiBufferId: undefined,

  processData: function (data) {
    // Filter data and save it
    let filter = this.data.filter.split('=')
    let dataFiltered;
    if (filter[0] && filter[1]) {
      dataFiltered = data.filter((key) => key[filter[0]] == filter[1])
      this.notiBuffer.set(dataFiltered);
    } else {
      console.error("Error on filter, please use key=value syntax")
    }  
  },
})