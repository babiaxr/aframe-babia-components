# Aframe-babia-components

[![Version](http://img.shields.io/npm/v/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)
[![License](http://img.shields.io/npm/l/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)

Data visualization components for A-Frame.

![example](https://i.imgur.com/kfqSgMA.png)

For [A-Frame](https://aframe.io).

## Why

This pack of components has the aim of visualize data in several ways. There are separated components and each one has an independent aim:

- `querier_*` the aim of just query data and save it in the entity that it has
- `filterdata` filter the data saved by one of the queriers
- `vismapper` map the data filtered by filterdata to geometry attributes of the different charts, it "prepares" the data and save it in the entity that it has.
- `geo*` visualize the data prepared by a vismapper in several ways (this type of components must have in the same entity than a vismapper)

For instance:

```html
<a-entity id="queriertest" querier_json="url: ./data.json;"></a-entity>
<a-entity geo3dbarchart='legend: true' filterdata="from: queriertest"
            vismapper="x_axis: name; z_axis: age; height: size" position="-10 0 0" rotation="0 0 0"></a-entity>

```

The first entity has a `querier_*` component, so this entity will retrieve the data of the url in its attribute and save it in the entity.

The second entity has a `filterdata` that fetch the data saved by the `querier_json` entity from above by it's id, so the filterdata is binded to that entity. Moreover, it has a `vismapper` that is mapping fields of the data filtered by the `filterdata` component to geometry attributes of the chart component, in this case will map the field `name` to the x-axis keys of the chart, the `age` to the z-axis keys of the chart and the `size` to the height of the different items of the chart (bars, bubbles...). Finally, the `geo3dbarchart` define that the entity is going to visualize the data mapped by `vismapper` in a 3D bar chart.


## Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>A-Frame Babia components</title>
    <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-babia-components/dist/aframe-babia-components.min.js"></script>
</head>

<body>

    <a-scene background="color: #A8F3FF" id="AframeScene">
        
        <a-entity id="queriertest" querier_json="url: ./data.json;"></a-entity>

        <a-entity geo3dbarchart='legend: true' filterdata="from: queriertest"
            vismapper="x_axis: name; z_axis: age; height: size" position="-10 0 0" rotation="0 0 0"></a-entity>

        <a-entity camera position="0 0 0" look-controls></a-entity>
        
    </a-scene>
</body>
```

#### NPM Installation

Install via NPM:

```
npm i aframe-babia-components
```

Then require and use.
```js
require('aframe');
require('aframe-babia-components');

// or

import 'aframe'
import 'aframe-babia-components'
```

## How to use this components

There are user guides in the [docs](https://github.com/dlumbrer/aframe-babia-components/tree/master/docs) folder, here are the links:

- [HOW_TO_CHARTS.md](./docs/HOW_TO_CHARTS.md): a simple user guide in order to learn how to create charts with this pack of components.

## Components API

The installation contains the following components:

### querier_json component

Component that will retrieve data from a JSON input that can be defined as an url or directly embedded.

This component will put the data retrieved into the `baratariaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ------ |
| url             | Url of the file with the JSON data  | string | - |
| embedded        | JSON data directly stringified in the property | string   | - |


### querier_github component

Component that will retrieve data related to the repositories from an user using the GitHub API. It can be defined the username in order to get info about all the repositories or also it can be defined an array of repos in order to analyse just them (instead of all).

This component will put the data retrieved into the `baratariaData` attribute of the entity.


#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| user            | GitHub username  | string | - |
| repos        | List of repo that you want to analyse | array   | (If empty it will retrieve all the repos of the user) |


### filterdata component

This component must be used with one of the `querier` components. This component will select a part of the data retrieved (by a key/filter) in order to represent just that part of the data. If the filter is not defined, it will retrieve all the data.
This component will put the data selected into the `baratariaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from            | Id of one of the querier components  | string | - |
| filter (Optional)        | Key of the item that you want to analyse, this key must be in the data retrieved from a querier. **Work in progress: in the next future it will have more filter** | string   | - |


### vismapper component

This component map the data selected by the `filterdata` component into a chart component or physical properties of a geometry component.

This component must be in the same entity than filterdata and it needs also a chart component or geometry.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| height        | Field of the data selected by filterdata that will be mapped as the height of the items of the charts or a geometry. Valid for **geo3dbarchart, geobubbleschart, geosimplebarchart and box/sphere** | string   | - |
| radius        | Field of the data selected by filterdata that will be mapped as the radius of the items of the charts or a geometry. Valid for **geobubbleschart and sphere** | string   | - |
| slice        | Field of the data selected by filterdata that will be mapped as the slices of the items of a pie chart. Valid for **piehchart** | string   | - |
| z-axis        | Field of the data selected by filterdata that will be mapped as the keys of the Z Axis of the chart component selected. Valid for **geo3dbarchart and bubblechart** | string   | - |
| x-axis        | Field of the data selected by filterdata that will be mapped as the keys of the X Axis of the chart component selected. Valid for **geo3dbarchart, bubblechart and geosimplebarchart** | string   | - |
| width            | Field of the data selected by filterdata that will be mapped as the width of the geometry **(only for box geometry)**.  | string | - |
| depth        | Field of the data selected by filterdata that will be mapped as the depth of the geometry **(only for box geometry)**. | string   | - |


### geopiechart component

This component must be used with one of the `vismapper` components, with the `slice` and `height` attribute defined.

This component shows a pie chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a slice  | boolean | false |

### geosimplebarchart component

This component must be used with one of the `vismapper` components, with the `x-axis` and `height` attribute defined.

This component shows a simple 2D bar chart.
geopiechart
#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |

### geo3dbarchart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |


### bubblechart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis`, `radius` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bubble  | boolean | false |
| axis          | Shows chart axis  | boolean | true |



### debug_data component

This component force the entity to hear an event, when this event occurs, a debug plane with the data of the `baratariaData` entity attribute will appear in the position (or close) of the entity that it belongs.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| inputEvent            | Name of the event that will be hearing  | string | - |


### interaction-mapper component

This component just map events of an entity to others customizables.


| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| input            | Input event  | string | - |
| output            | Output event  | string | - |


## Data model

The dataset returned from the parsing of the `querier` components must has this model:

```
{
    "key1" : {
        "prop1": ["test" , "foo", "data"],
        "prop2": 12123,
        "prop3": "Data here",
        ...
    },
    "key2" : {
        ...
    }
    ...
}


```



### Examples available at the "examples folder" and [here](https://dlumbrer.github.io/aframe-babia-components/)