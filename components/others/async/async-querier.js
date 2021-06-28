/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-async-querier', {
    schema: {
        url: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        this.register = new Register();
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let self = this;
        
        if (oldData.url !== data.url) {
            requestJSONDataFromURL(data.url).then((json) => self.register.data = json);
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
     * Register variable
    */
    register: undefined,
})

async function requestJSONDataFromURL(url) { 
    let response = await fetch(url);
    console.log("Response: " + response)

    if (response.status == 200) {
       let json = await response.json();
       console.log("Json: " +json)
       return json;
    }
 
    throw new Error(response.status);
 }

 class Register {
    constructor(){
        this.data = null;
    }

    async getData() {
        let dataReady = await this.data
        return dataReady; 
    }
}
