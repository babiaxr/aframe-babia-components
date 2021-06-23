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
            waitForFetch(self, data.url)
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

function waitForFetch(self, url){
    console.log("Wait for fetch")
    self.register.p = requestJSONDataFromURL(url);
  }

async function requestJSONDataFromURL(url) { 
    let response = await fetch(url);
    console.log(response)

    if (response.status == 200) {
       let json = await response.json();
       console.log(json)
       return json;
    }
 
    throw new Error(response.status);
 }

 class Register {
    constructor(){
        this.p = null;
        this.pReady = null;
    }

    /*register(){
        while (this.p == null){
            waitForP().then((r) => {
                this.pReady = r;
                this.p = null;
            })
        }
    }

    async waitForP(){
        await this.p
    }*/

    async waitForData() {
        this.pReady = await this.p
        this.p = null;
        return this.pReady; 
    }

    async updateMe(){
        let _isReady = await this.avisame
    }


   /* async senderPromise(pq){
        this.p = await pq;
    };*/

}
