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

    multiple: false,

    init: function () {
        this.register = new Register();
        this.register.initRegister(getDataFromURL, this, modifyData);
    },

    update: function () {
        this.register.setData(getDataFromURL, this, modifyData)
    },
    
    remove: function () { },
    pause: function () { },
    play: function () { },

    register: undefined,
})


// Function to obtain data in querier
async function getDataFromURL(self) { 
    let response = await fetch(self.data.url);
    if (response.status == 200) {
       let json = await response.json();
       return json;
    }
    throw new Error(response.status);
 }

 // Function passed as parameter in register's setData
 function modifyData(data) {return data}

 /* REGISTER */

 class Register {
    constructor(){
        this.data = null;
        this.isUpdating = false;
    }

    // Function that resolves or rejects the data promise
    promisedData() {
        return new Promise((resolve, reject) => {
            setTimeout(() => { 
                if (this.data != null) {
                    resolve(this.data)
                } else {
                    reject('data_empty')
                }              
            }, 250);
        });
    }

    // Wait for the data promised and get it from register
    async getData() {
        return await this.promisedData(); 
    }

    // Loop function to set data in register case there are changes that do not trigger update()
    initRegister(obtain, obtainParam, modify, modifyParam){
        setInterval(() => {
            this.setData(obtain, obtainParam, modify, modifyParam)
        }, 2000);
    }
  
    // Function to set data in register: obtain, modify and set 
    setData(obtain, obtainParam, modify, modifyParam){
        if (!this.isUpdating){
            this.isUpdating = true;
            obtain(obtainParam).then((result) => { // obtain data
                let new_data = modify(result, modifyParam) //modify data
                if (this.data == null || this.data != new_data){
                    this.data = new_data; // set data
                }
            });
            this.isUpdating = false;
        }
    }
}
