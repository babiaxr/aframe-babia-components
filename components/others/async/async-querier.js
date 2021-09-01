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
        this.register.initRegister(obtainData, this, modifyData, null, 2000);
    },

    update: function () {
        this.register.setData(obtainData, this, modifyData)
    },
    
    remove: function () { },
    pause: function () { },
    play: function () { },

    register: undefined,
})


// Function to obtain data in querier
async function getJSON(url) { 
    let response = await fetch(url);
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

  // (Receiver) Function that resolves the promise when data has a value
  promisedData(time, max) {
        return new Promise((resolve, reject) => {
            let counter = 0;
            let interval = setInterval(() => {
                counter++
                if (this.data != null) {
                    resolve(this.data)
                    clearInterval(interval)
                } else if (counter <= max){
                    reject("data_empty")
                    clearInterval(interval)
                }
              }, time)
        });
    }

    // (Receiver) Wait for the data promised and get it from register
    async getData(time, max) {
        return await this.promisedData(time, max); 
    }

    // (Source) Loop function to set data in register case there are changes that do not trigger update()
    initRegister(obtain, obtainParam, modify, modifyParam, time){
        setInterval(() => {
            this.setData(obtain, obtainParam, modify, modifyParam)
        }, time);
    }
  
    // (Source) Function to set data in register: obtain, modify and set 
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
