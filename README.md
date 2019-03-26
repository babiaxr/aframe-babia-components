# Aframe-visdata-components

[![Version](http://img.shields.io/npm/v/aframe-visdata-components.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-components)
[![License](http://img.shields.io/npm/l/aframe-visdata-components.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-components)

Data visualization components for A-Frame.

![example](https://i.imgur.com/kfqSgMA.png)

For [A-Frame](https://aframe.io).

## Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>A-Frame Visdata components</title>
    <meta name="description" content="Bubble example for A-Charts component." />
    <script src="https://aframe.io/releases/0.9.0/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-visdata-components/dist/aframe-visdata-components.min.js"></script>
    <script
        src="https://unpkg.com/aframe-environment-component@1.0.0/dist/aframe-environment-component.min.js"></script>
</head>

<body>

    <a-scene background="color: #A8F3FF" id="AframeScene">
        <a-entity environment></a-entity>
        <a-light type="point" intensity="1" position="-10 20 30"></a-light>

        <a-entity id="queriertest" querier_json="url: ./data.json;"></a-entity>

        <a-entity scale="0.4 0.4 0.4" geobubbleschart='legend: true' filterdata="from: queriertest"
            vismapper="x_axis: name; z_axis: age; height: metric2; radius: size" position="0 0 0" rotation="0 0 0">
        </a-entity>
        <a-entity geo3dbarchart='legend: true' filterdata="from: queriertest"
            vismapper="x_axis: name; z_axis: age; height: size" position="-10 0 0" rotation="0 0 0"></a-entity>
        <a-entity piechart='legend: true' filterdata="from: queriertest" vismapper="slice: name; height: size"
            position="-8 5 10" rotation="90 15 0"></a-entity>
        <a-entity simplebarchart='legend: true' filterdata="from: queriertest" vismapper="x_axis: name; height: size"
            position="25 0 0" rotation="0 -15 0"></a-entity>


        <a-entity movement-controls="fly: true" position="5 5 20">
            <a-entity camera position="0 0 0" look-controls></a-entity>
            <a-entity cursor="rayOrigin:mouse"></a-entity>
            <a-entity laser-controls="hand: right"></a-entity>
        </a-entity>

    </a-scene>
</body>
```

#### NPM Installation

Install via NPM:

```
npm i aframe-visdata-components
```

Then require and use.
```js
require('aframe');
require('aframe-visdata-components');

// or

import 'aframe'
import 'aframe-visdata-components'
```

## How to use this components

There are user guides in the [docs](https://github.com/dlumbrer/aframe-visdata-components/tree/master/docs) folder, here are the links:

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
| height        | Field of the data selected by filterdata that will be mapped as the height of the items of the charts or a geometry. Valid for **geo3dbarchart, bubbleschart, simplebarchart and box/sphere** | string   | - |
| radius        | Field of the data selected by filterdata that will be mapped as the radius of the items of the charts or a geometry. Valid for **bubbleschart and sphere** | string   | - |
| slice        | Field of the data selected by filterdata that will be mapped as the slices of the items of a pie chart. Valid for **piehchart** | string   | - |
| z-axis        | Field of the data selected by filterdata that will be mapped as the keys of the Z Axis of the chart component selected. Valid for **geo3dbarchart and bubblechart** | string   | - |
| x-axis        | Field of the data selected by filterdata that will be mapped as the keys of the X Axis of the chart component selected. Valid for **geo3dbarchart, bubblechart and simplebarchart** | string   | - |
| width            | Field of the data selected by filterdata that will be mapped as the width of the geometry **(only for box geometry)**.  | string | - |
| depth        | Field of the data selected by filterdata that will be mapped as the depth of the geometry **(only for box geometry)**. | string   | - |


### piechart component

This component must be used with one of the `vismapper` components, with the `slice` and `height` attribute defined.

This component shows a pie chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a slice  | boolean | false |

### simplebarchart component

This component must be used with one of the `vismapper` components, with the `x-axis` and `height` attribute defined.

This component shows a simple 2D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |

### geo3dbarchart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |

### bubblechart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis`, `radius` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bubble  | boolean | false |


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



### Examples available at the "examples folder" and [here](https://dlumbrer.github.io/aframe-visdata-components/)