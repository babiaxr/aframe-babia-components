/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-async-filter', {
    schema: {
        from: { type: 'string' },
        filter: {type: 'string'}
    },

    multiple: false,

    init: function () {
        this.register = new Register();
        this.register.initRegister(obtainData, this, filterData, this.data, 2000)
    },

    update: function (oldData) {
        this.register.setData(obtainData, this, filterData, this.data)
    },

    remove: function () { },

    pause: function () { },

    play: function () { },

    register: undefined,
})

// Function to find fromComponent to get data from it's register
 let findFrom = (data, el) => {
    let fromComponent;
    if (data.from) {
      // Save the reference to the querier
      let fromElement = document.getElementById(data.from)
      if (fromElement.components['babia-async-querier']) {
        fromComponent = fromElement.components['babia-async-querier']
      } else {
        console.error("Problem getting the querier")
        return
      }
    } else {
      // Look for a querier in the same element
      if (el.components['babia-async-querier']) {
        fromComponent = el.components['babia-async-querier']
      }
    }
    return fromComponent
  }

// Function to obtain data from fromComponent's register
async function obtainData(self) { 
  let fromComponent = findFrom(self.data, self.el);
  return await fromComponent.register.getData(1000, 10);
}

// Function to filter data once obtained
let filterData = (rawData, data) => {
  let filter = data.filter.split('=')
  if (filter[0] && filter[1]) {
    let dataFiltered = rawData.filter((key) => key[filter[0]] == filter[1])
    return dataFiltered
  } else {
    console.error("Error on filter, please use key=value syntax")
    return []
  }
}




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

