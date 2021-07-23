---
linktitle: "async"
date: 2021-07-22T17:54:05+02:00
title: BabiaXR asynchronous components
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "components", "guide", "async", "asynchronous"]
---


# Asynchronous Components in BabiaXR (WIP)

This document is a proposal for a restructuration of the components in BabiaXR by incorporating the use of **promises**, **async** functions and **await** expressions. It contains all the information relating this proposal, including the details of the three first components that have been created to study and test this new approach.

## Table of Contents

- [Idea](#idea)
- [Register](#register)
- [Components](#components)
    - [Async Querier](#async-querier)
    - [Async Filter](#async-filter)
    - [Async Visualizer](#async-visualizer)
- [Schema](#schema)

## Idea

This proposal aims to find more efficient way of connecting different components and sharing data between them, while reducing the code and cleaning repeated methods.

Until now, components such as queriers or filters communicated between them and with the visualizers by using registration and callbacks. The component that needed the data would register to the component that had the data and this one would emit an event to all its registered components upon any change. This event would then trigger the callback function in the other components.

In this new approach, a class called Register is created, which will be the nexus between any two components and keep the data that is shared between them. The component that acts as the **source** of the data will create an instance of this Register class, while the component that acts as the **receiver** of this data, will obtain this data by accesing this instance of the Register. The source component will retrieve ans save the data and the receiver component will be waiting for a promise of a not null value until this data is filled. Then this two asynchronous cycles will be repeated once and again after any changes or after a chosen time.

In order to create this proposal, the guidelines in [MDN Web Docs](https://developer.mozilla.org/es/docs/orphaned/Web/JavaScript/Reference/Statements/async_function) have been used.

## Register

An instance of this class can be added to any source component that fetches or obtains data and needs to store it in a place where a receiver component can access it asynchronously.

>Note: A component can be both a receiver and a source, since it might receive the data from a previous source and its data might be accessed by another receiver (see [async-filter](#async-filter))

Two variables are instantiated in the constructor: **data** and **isUpdating**.

**data** is the variable that will store the shared data, while **isUpdating** is set to true each time the data is being rertieved and stored.

```javascript
constructor(){
    this.data = null;
    this.isUpdating = false;
}
```
### Register methods called by the source component

Once the source component has created the instance of the Register, it needs to retrieve the data and store it. For that, it calls the **setData()** function in its update() method, so it will be called everytime one of its attribute changes.

This function has four parameters:

- **obtain** (asynchronous function that will be called to obtain the data)
- **obtainParam** (parameter passed to obtain function)
- **modify** (function to modify the data obtained before setting it)
- **modifyParam** (parameter passed to modifyFunction)

It is important to notice that if **obtain** is not an asynchronous function, the then() method will not take place. This method is triggered once the **obtain** function returns. Then, the returned value (result) will be the data that **modify** will need as its first parameter. Once data is ready, it is stored inside the instance of Register data.

```javascript
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
```

For other changes that do not trigger the update() method of the source component, such as a change inside the file from where we obtain the data, a loop has been created, so that we obtain and set the data after a certain time (that is, if it is not currently updating).

This loop is inside the initRegister() function and it will be called in the init() method of the source component. This function needs the same parameters as setData() and a **time** parameter that sets the interval time.

```javascript
initRegister(obtain, obtainParam, modify, modifyParam, time){
    setInterval(() => {
        this.setData(obtain, obtainParam, modify, modifyParam)
    }, time);
}
```
### Register methods called by the receiver component

As explained before, the receiver component will access the source's Register and try to read its stored data.

It is a possibility that this data is still null when the receiver tries to access it, that is why we use a promise that will be resolved when data has a value. The interval looks for changes once and again, after the chosen **time**, until data has a value and the interval is cleared. The interval will also be cleared after the chosen **max** times if data still has no value, but this time the promise will be rejected.

```javascript
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
```
This promise of a not null set of data will be waited for inside the asynchronous function **getData()**, which will be accessed from the receiver component. While waiting, the rest of the code keeps running. Once the promise is resolved, get data will return the value, that will be accessed at the .then() method inside the receiver.

```javascript
  async getData(time, max) {
      return await this.promisedData(time, max); 
  }
```

## Components

Three async simple components have been created to show the possible interaction between the three kinds of components in BabiaXR: async-querier, async-filter and async-visualizer.

### Async Querier

Component that will query and fetch the data from a json file.


#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| url | The address to the json file with the data | string | - |

Example: 

```html
<a-entity id="querier" async-querier="url: ./data.json;" ></a-entity>
```

#### Steps

1. In its init() function, the querier instantiates Register class and calls its **initRegister()** method. In its update() function, the querier calls the Register's **setData()** method.

    In both cases:
    - As the **obtain** function parameter, we pass the asynchronous function that fetches the data **obtainData()** (whose parameter is the querier itself, "this", send as the **obtainParam**)
    - As the **modify** function parameter, we pass the modifyData() function, that just returns the same data and has no parameters (**modifyParam** is null)

    Finally, as last parameter for initRegister() we pass the **time** for the interval.

    ```javascript
    init: function () {
        this.register = new Register();
        this.register.initRegister(obtainData, this, modifyData, null, 2000);
    },

    update: function () {
        this.register.setData(obtainData, this, modifyData)
    },
    ```

2. Inside setData(), we call **obtainData()**, which will wait for the result of an asynchronous **fetch** function. Once the data is retrieved, the Register will call the **.then** method (as seen in [Register Class](#register)), which will call the modify function (in this case, nothing will be modified). Finally, the Register will take the result and store it inside its data variable.

    ```javascript
    // Function to obtain data in querier
    async function obtainData(self) { 
        let response = await fetch(self.data.url);
        if (response.status == 200) {
            let json = await response.json();
            return json;
        }
        throw new Error(response.status);
    }

    // Function passed as parameter in register's setData
    function modifyData(data) {return data}
    ```

### Async Filter

This component will obtain data from the querier, filter it and store it.

This is a good example of a component that is both receiver and source. On one side, it retrieves data and stores it inside its Register for other components to access (it is a source), but it obtains this data from another source component (therefore is a receiver).

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from | The source component (usually a querier) that has the data that the filter needs to access| string | - |
| filter | The condition that a field of data has to meet to be part of the final result. For now, it only accepts equality comparisons. For example, if we want to filter all the data whose metric "continent" is "Europe", the filter will be "continent=Europe".| string | - |

Example:

```html
<a-entity id="filter" async-filter="from: querier; filter: continent=Europe ></a-entity>
```

#### Steps

1. In its init() function, the ilter instantiates Register class and calls its **initRegister()** method. In its update() function, the filter calls the Register's **setData()** method.

    In both cases:
    - As the **obtain** function parameter, we pass the asynchronous function that obtains the data **obtainData()** (whose parameter is the filter itself, "this", send as the **obtainParam**)
    - As the **modify** function parameter, we pass the **filterData()** function, that filters the data (whose second parameter is the set of attributes of the component, send as **modifyParam** )

    Finally, as last parameter for initRegister() we pass the **time** for the interval.


    ```javascript
    init: function () {
        this.register = new Register();
        this.register.initRegister(obtainData, this, filterData, this.data, 2000)
    },

    update: function (oldData) {
        this.register.setData(obtainData, this, filterData, this.data)
    },
    ```

2. Inside setData(), we call **obtainData()**.

    ```javascript
    // Function to obtain data from fromComponent's register
    async function obtainData(self) { 
        let fromComponent = findFrom(self.data, self.el);
        return await fromComponent.register.getData(1000, 10);
    }
    ```

3. This function will first look for the **fromComponent**, whose Register contains the data that the filter needs, for that **findFrom()** is called.

    ```javascript
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
    ```

4. Then it will wait for the result of the asynchronous **getData()** function of the fromComponent (that is waiting for the data promise to resolve). Once the data is retrieved, the Register will call the **.then** method (as seen in [Register Class](#register)) and data will be filtered. Finally, the Register will take the result and store it inside its data variable.

    >Note: As explained before, the filter is both a source and a receiver. Therefore, the **obtain** function passed to **setData()** of its own Register is the **getData()** of the fromComponent Register.

    ```javascript
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
    ```

### Async Visualizer

This component will obtain the data from the querier or filter and show it in a panel.

This component does not need to instantiate a Register, sice it just access the fromComponent Register data and shows it.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from | The source component (querier or filter) that has the data that the visualizer needs to access.| string | - |

Example:

```html
<a-entity async-visualizer="from: filter" ></a-entity>
```

#### Steps

1. In its init(), the visualizer loops the **obtainData()** function (to check for other changes that do not trigger the update()). In its update(), the visualizer directly calls the **obtainData()** function when there are changes in the attributes.

    In both cases, the parameter sent is the visualizer itself.

    ```javascript
    init: function () {
        // ...
        setInterval(() => {
        obtainData(this);
        }, 2000);
    },

    update: function (oldData) {
        if (oldData.from !== this.data.from) {
            obtainData(this);
        }
    },

    // Function to obtain data from fromComponent's register
    async function obtainData (self) {
        let fromComponent = findFrom(self.data, self.el);
        await fromComponent.register.getData(1000, 10).then((rawData) => showData(rawData, self.el));
    }
    ```

2. The function **obtainData()** will first look for the **fromComponent**, whose Register contains the data that the visualizer needs, for that **findFrom()** is called.

    ```javascript
    // Function to find fromComponent to get data from it's register
    // Function to find fromComponent to get data from it's register
    let findFrom = (data, el) => {
        let fromComponent;
        if (data.from) {
            // Save the reference to the querier or filter
            let fromElement = document.getElementById(data.from)
            if (fromElement.components['babia-async-filter']) {
                fromComponent = fromElement.components['babia-async-filter']
            } else if (fromElement.components['babia-async-querier']) {
                fromComponent = fromElement.components['babia-async-querier']
            } else {
                console.error("Problem getting the querier")
                return
            }
        } else {
            // Look for a querier or filter in the same element
            if (el.components['babia-async-filter']) {
                fromComponent = el.components['babia-async-filter']
            } else if (el.components['babia-async-querier']) {
                fromComponent = el.components['babia-async-querier']
            }
        }
        return fromComponent
    }
    ```

3. Then it will wait for the result of the asynchronous **getData()** function of the fromComponent (that is waiting for the data promise to resolve). Once the data is retrieved, the visualizer will call the **.then** method, calling **showData()**, where the data will be finally shown in the panel

    ```javascript
    // Function to rearrange and show data once obtained
    let showData = (data, el) => {
        let dataToPrint = data.reduce((acc, cv) => {
            //...
        }, "New data: ")
        let label_text = el.getAttribute("id") + "_info_label";
        document.getElementById(label_text).setAttribute('value', dataToPrint)
    }
    ```
## Schema

This schema shows the interaction between the three components created.

![Async Schema](https://imgur.com/zR4U0YD.png)