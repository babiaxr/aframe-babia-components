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
        this.register.initRegister(getDataToFilter, this, filterData, this.data)
    },

    update: function (oldData) {
        this.register.setData(getDataToFilter, this, filterData, this.data)
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
  async function getDataToFilter(self) { 
    let fromComponent = findFrom(self.data, self.el);
    let data = await fromComponent.register.getData();
    if (data != "data_empty") {
       return data;
    }
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

