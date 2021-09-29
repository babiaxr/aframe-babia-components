---
linktitle: "async"
date: 2021-07-22T17:54:05+02:00
title: BabiaXR NotiBuffer
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "components", "guide", "async", "asynchronous", "buffer", "notibuffer"]
---

# NotiBuffer class and asynchronous behaviour in BabiaXR

This document describes the restructuration of the components in BabiaXR by incorporating the class **NotiBuffer** and the use of **promises**, **async** functions and **await** expressions. This new structure aims to simplify the communication between components and improve the overall performance of BabiaXR. It contains all the information relating this proposal, including the details of the different components that have been modified.

## Table of Contents

- [Idea](#idea)
- [NotiBuffer](#notibuffer)
- [Components](#components)
    - [Queriers](#queriers)
    - [Filters](#filters)
    - [Visualizers](#visualizers)
    - [Other](#other)

## General idea and NotiBuffer class

This structure aims to find more efficient way of connecting different components and sharing data between them, while reducing the code and cleaning repeated methods.

Until now, components such as queriers or filters communicated between them and with the visualizers by using registration and callbacks. The component that needed the data would register to the component that had the data and this one would emit an event to all its registered components upon any change. This event would then trigger the callback function in the other components.

In this new approach, a class called **NotiBuffer** is created, which will be the nexus between any two components and keep the data that is shared between them. The component that acts as the **producer** of the data will create an instance of this NotiBuffer class, while the component that acts as the **consumer** of this data, will register to this NotiBuffer and tell it which function it has to call once the producer adds or updates the data. Therefore, when this data is added, NotiBuffer will call this function (or series of functions, if more than one component has registered), passing the data to it.

An instance of this class can be added to any producer component that fetches or obtains data and needs to store it in a place where a consumer component can access it asynchronously.

It is important to remember that a component can be both a producer and a consumer, since it might receive the data from a previous producer and its data might be accessed by another consumer.

It is also possible that two components need to read from each other (like in the case of babia-navigator and babia-selector). This is why two optional parameters have been added to the NotiBuffer constructor and an extra "details" one has been added to the register and unregister functions. To know more about the usage of these components, go to the [last section](#other).

><mark>Important:</mark> The producer and consumer components can be both part of the same entity, in which case the order of appearance is not important. But in case they are in different entities, it is very important to respect the order **Producer-Consumer**. The consumer needs the producer to be initialized and therefore must be declared after it.

## Components

### Queriers

To explain the behaviour of queriers, we will see babia-queryjson as an example.

1. In the init() method, an instance of NotiBuffer will be created.

    ```javascript
    this.notiBuffer = new NotiBuffer();
    ```
2.  In the update() method, if the data is embedded it will get it from the string and if it comes from a file it will call an asynchronous function that will return a promise until it has a value to return, or it will return an error. In both cases, once obtained in the right format, it will be sent as a parameter to the NotiBuffer set() method.

    ```javascript
    
    update: function (oldData) {
        let data = this.data;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let _data = parseJson(data.data)
            this.notiBuffer.set(_data);        
        } else if (oldData.url !== data.url) {
            this.getJSON(data.url);
        }
    },

    getJSON: async function(url) { 
        let response = await fetch(url);
        if (response.status == 200) {
            let json = await response.json();
            // TODO: Throw error if json is not in the right format
            let _data = parseJson(json);
            this.notiBuffer.set(_data);
        } else {
            throw new Error(response.status);
        }
        
    },
    ```
3. This method will call each one of the functions that have been passed to it by the registered components, so the querier does not need to know anything else.

### Filters

To explain the behaviour of filters, we will see babia-filter as an example.

1. In the init() method, an instance of NotiBuffer will be created.

    ```javascript
    this.notiBuffer = new NotiBuffer();
    ```
2.  In the update() method, if the data is embedded it will get it from the string and call the method processData(). If there are other changes (not in "data" or "from" attributes) and it already has data, it will use this data and call processData(). If it comes from another component it will register to its NotiBuffer and send it the function processData() as a parameter to be called once there is data. If there already is data in the NotiBuffer, processData() will be called immediatly.

    ```javascript
    
    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        // Highest priority to data
        if (data.data && (oldData.data !== data.  data || data.filter !== oldData.filter)) {
            let _data = parseJson(data.data);
            this.processData(_data);
        } else if (data.from !== oldData.from || data.filter !== oldData.filter) {
            // Unregister from old notiBuffer
            if(this.prodComponent) {
                this.prodComponent.notiBuffer.unregister(this.notiBufferId)
            };

            // Register for the new one
            this.prodComponent = findProdComponent(data, el, "babia-filter")
            if (this.prodComponent.notiBuffer){
                this.notiBufferId = this.prodComponent.notiBuffer.register(this.processData.bind(this))
            }
        }
    },
    ```

3. This processData() method is where the data will be filtered and send as a parameter to the NotiBuffer set() method.

    ```javascript
    
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
    ```
    
3. This method will call each one of the functions that have been passed to it by the registered components, so the filter does not need to know anything else.

### Visualizers

To explain the behaviour of visualizers, we will see babia-pie as an example. It is important to remember that visualizers also need to implement a NotiBuffer since there are other components, such as babia-ui, that need to read data from them.

1. In the init() method, an instance of NotiBuffer will be created.

    ```javascript
    this.notiBuffer = new NotiBuffer();
    ```
2.  In the update() method, if the data is embedded it will get it from the string and call the method processData(). If there are other changes (not in "data" or "from" attributes) and it already has data, it will use this data and call processData(). If it comes from another component it will register to its NotiBuffer and send it the function processData() as a parameter to be called once there is data. If there already is data in the NotiBuffer, processData() will be called immediatly.

    ```javascript
    
    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        if (data.data && oldData.data !== data.data) {
            let _data = parseJson(data.data);
            this.processData(_data);
        } else if (data.from !== oldData.from) {
            this.slice_array = []
            // Unregister from old producer
            if (this.prodComponent) {
                this.prodComponent.notiBuffer.unregister(this.notiBufferId)
            };
            this.prodComponent = findProdComponent (data, el)
            if (this.prodComponent.notiBuffer) {
                this.notiBufferId = this.prodComponent.notiBuffer
                .register(this.processData.bind(this))
            }     
        } else if (data !== oldData && this.newData) {
            this.slice_array = []
            this.processData(this.newData);
        }
    },
    ```

3. This processData() method is where the data will be processed and the graph will be created. The data finally used will be send as a parameter to the NotiBuffer set() method.

    ```javascript
    
    processData: function (data) {
        console.log("processData", this);
        this.newData = data;
        this.babiaMetadata = { id: this.babiaMetadata.id++ };
        while (this.el.firstChild)
                this.el.firstChild.remove();
        console.log("Generating pie...")
        this.updateChart()
        this.loaded = true
        this.notiBuffer.set(this.newData)
    }
    ```
    
3. This method will call each one of the functions that have been passed to it by the registered components, so the visualizer does not need to know anything else.

### Other

#### **babia-ui**

This component needs to find a **targetComponent** to work as its data "menu". This target is a visualizer, so it has a NotiBuffer to which babia-ui will register. This will allow it to update its interface if the data in the visualizer is updated. 

For example, when a different set of data is chosen in the menu, the attribute "from" of the visualizer will be changed and so its update() method will be called, triggering all the steps explained in [visualizers](#visualizers). This will trigger, therefore, the functions to update the ui.

#### **babia-navigator and babia-selector**

In this case, both components need to get data from the other component. The selector knows the identity of the the navigator, since it will be specified in the html. But, how does the navigator find the selector? For this cases, two optional parameters have been added to the NotiBuffer constructor and an extra "details" one has been added to the register and unregister functions. The steps would be the following:

1. Navigator and selector, both create an instance of NotiBuffer, but navigator adds two functions to be called when a component registers or unregisters. Selector will have two NotiBuffers because it needs to send other kind of data to other components, since it behaves like a [filter](#filters).

    ```javascript
    // Selector
    this.notiBuffer = new NotiBuffer(); // communication with data consumers
    this.navNotiBuffer = new NotiBuffer(); // communication with navigator

    ```
    ```javascript
    // Navigator
    this.notiBuffer = new   NotiBuffer(this.registerBack.bind(this), this.unregisterBack.bind(this));
    ```

2. Selector knows navigator, so it registers to its notiBuffer, adding the details about selector's identity.

    ```javascript
    // Selector
    this.notiBufferId = this.prodComponent.notiBuffer.register(this.processData.bind(this))
    ```

3. When navigator's NotiBuffer's register function is called with details, it calls the first function added in the constructor, which is a method that allows navigator to register back to selector's NotiBuffer since it already knows selector's identity.

    ```javascript
    // Navigator
    registerBack: function(prodComponent){
        this.selector = prodComponent;
        this.prodComponent = prodComponent;

        // Register for the new one
        if (this.prodComponent.navNotiBuffer){
            this.navNotiBufferId = this.prodComponent.navNotiBuffer.register(this.processData.bind(this));
        }
    },
    ```

4. Now they are both registered to each other.
5. If selector unregisters form navigator, navigator's NotiBuffer unregister function is called with details about selector's identity, therefore the second function added in the constructor will be called and navigator will unregister from selector's NotiBuffer.