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
        console.log("async querier init()")
        this.register = new Register();

        setInterval(() => {
            // Check for changes inside the data file, when the url has not changed
            
            // Compare data
            if (!this.register.isUpdating){
                let old_data = this.register.data;
                let new_data = [];
                    requestJSONDataFromURL(this.querierdata.url).then((json) => {
                        new_data = json;
                        if (old_data == null | old_data != new_data){
                            this.register.data = new_data;
                        }
                    });
            }
        }, 5000);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        console.log("async querier update()")
        let self = this;
        self.querierdata = self.data;
        
        if (oldData.url != self.querierdata.url) {
            self.register.isUpdating = true;
            requestJSONDataFromURL(self.querierdata.url).then((json) => {
                self.register.data = json;
                self.register.isUpdating = false;
            });
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
    querierdata: undefined,
})

async function requestJSONDataFromURL(url) { 
    let response = await fetch(url);

    if (response.status == 200) {
       let json = await response.json();
       return json;
    }
 
    throw new Error(response.status);
 }

 class Register {
    constructor(){
        this.data = null;
        this.isUpdating = true;
    }

    async getData(el) {
        /* No need to check if there already was data (for new visualizers), 
        since we just wait for dataReady to have a value, and if it was previously set, it will have one*/
        console.log("getData in: ", el)
        let dataReady = await this.data
        return dataReady; 
    }
}
