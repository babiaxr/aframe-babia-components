# BabiaXR Stack (WIP)

This document contains all the information about how the stack is built, including the data format and the goal of each component

## Table of Contents

A high level overview of our contributing guidelines.

- [Components](#components)
    - [Querier](#querier)
    - [Filterdata](#filterdata)
    - [Visualizer](#visualizer)
- [Data format](#data-format)
- [Special scenarios](#special-scenarios)
    - [City tree data format](#city-tree-data-format)
    - [Dynamic changes](#dynamic-changes)
- [Notes](#notes)


## Components

Definition of the components stacks that are in the BabiaXR platform, the code descripted here is "pseudo" code.

### Querier

Component that will query and fetch the data.

Example: 

```
<a-entity id="queriertest" babia-queryjson="url: ./data.json;" ></a-entity>
```

1. Querier retrieve the data
2. Querier has a list of the "interested" entities that are registered.

```
this.register(interestedElement) {
   this.interested.push(interestedElement)
}
```

3. Once the data is retrieved, the querier component stores the data in an attribute of the component (like the init or update functions)
4. Once data saved, the Querier has to emit an event in the interested entities, sending the name of where the data is saved.

```
this.dataReadyToSend() {
	forEach this.interested {
		// Emit event in interested element
		this.interested.emit('babiaQuerierDataReady', propertyname)
	}
}
```


NOTES:
- When a new element wants to be registered to the querier, before registering it, the querier must launch the event if the data is ready to send. 
- All the data sent are pointers to the data-set.

### Filterdata

Component that will filter the data, this component is an interested of the querier.

Example:

```
<a-entity id="filterdatatest" babia-filter="from: queriertest; filter: .... ></a-entity>
```

1. The component should register itself in the querier entity.

```
document.getElementById(data.from).register(this);
```

2. The component bind the event in order to notice itself when the data of the querier is ready and process it (filtering).

```
this.addEventListener('babiaQuerierDataReady', e) {
   data = process_data(data.from[e.propertyname])
}
```

3. Once data filtered, the filterdata component stores the data in an attribute of the component (like the init or update functions)
4. Filterdata has a list of the "interested" entities that are registered.

```
this.register(interestedElement) {
   this.interested.push(interestedElement)
}
```
5. Finally, filterdata has to emit an event in the interested entities, sending the name of where the data is saved.

```
this.dataReadyToSend() {
	forEach this.interested {
		// Emit event in interested element
		this.interested.emit('babiaFilteredDataReady', propertyname)
	}
}
```


NOTES:
- If the querier is not defined in the filterdata, the component should search in the same entity if a querier is defined, if not, the component should look for a querier in all the scene, selecting the first one found.
- The data stored in the component are references to the original data-set of the querier.
- Similar structure of interested items than the querier.

### Visualizer

This component includes all the components that "visualize" data.

Example:

```
<a-entity babia-visualizer="from: filtertest; x-axis: xxx; y-axis: ..." ></a-entity>
```

1. The component should register itself in the querier/filterdata entity.

```
document.getElementById(data.from).register(this);
```

2. The component bind the event in order to notice itself when the data of the querier/filtedata is ready and visualize it.

```
// Check if it is a filterdata or querier element

this.addEventListener(event, e) {
   visualizeData(data.from[e.propertyname])
}
```

3. Each visualizer has its configuration in order to define which fields are in the axis, districts/quarters, layout, etc....


NOTES:

- If the querier/filterdata is not defined, the visualizer look for a filterdata component in its same entity, if not, look for a querier in the same entity, if not, look for a global filterdata component on the scene, and if not, look for a globar querier component on the scene.
- The fields that can be selected by default, for example, if the data has a field called "x", those elements will be represented in the x-axis.
- The visualizer can have an argument called "data" with the data directly filled to represent, if "data" is defined, this data has the highest priority and will be represented.


## Data format

All the data of the babia stack is defined a list of objects, this data format is that the querier and the filterdata component will prepare, and this is the data format that all the visualizers understand.

```
[
{"field1":"kbn_network","field2":10, ...},
{"field1":"testing","field2":5, ....},
...
]
```


### Metadata

Moreover, the querier/filterdata component will save in another component property, a metadata that describes the data that has been saved/retrieved, something like:

```
{
    date: xxx,
    query/filter: xxx,
    source: xxx,
    id: xxx,
}
```

## Special scenarios

### City tree data format

The city visualization has an special data format, a tree with the districts and the buildings (as leaf nodes). To produce this data-set there is a new component called **treebuilder** (name WIP) that will select a field of the data-set (list) and will split it with a char, building a tree with the file splitted.

Example for spliting a "path" field by the "/" character.

```
<a-entity babia-treebuilder="from: filtertest; field: path; split: '/'" ></a-entity>
```

So, if we have this list:
```
[
{"path":"public/index.html","id": 0, ...},
{"path":"README.md","id":1, ...},
{"path":"public/js/script.js","id":2, ...},
...
]
```

The treebuilder component will produce the next tree:
```
[ 
    list[2],
    {
        "id": "public/",
        "children": [
            list[0],
            {
                "id": "public/js/",
                "children": [
                    list[1]
                ]
            }
        ]
    },

]

```

Due to this component produces data, it follows the same "register-event" process than the querier/filterdata.


NOTES:
- A City visualizer can register itself to this component.
- The leafs of the tree structure are references to the main data set.


### Dynamic changes

For the dynamic changes (p.e time evolution feature), a new component is needed, this component has the name **dynamic-ui** and this is its behavior.

1. This component will register itself to a querier/filterdata, then will get the list of all the changes from one field (for instance, get all the unique dates of the field "date" of the list, for the time evolution).
2. With this list of unique keys, the component will automatically update the querier/filterdata process (changing the query/filter) for each item of the list.
3. Once the querier/filterdata is updated, the visualizer will be updated as well by the workflow process.


A first scheme of the implementation is:

![](https://i.imgur.com/AirUSiQ.png)


NOTES:
- This component has an UI for changing between points/line the snapshot that want to be visualized.

## Notes

- All the components must have an attribute "data" for putting the data directly there, for debugging and testing. If "data" is defined, it will have the highest priority.