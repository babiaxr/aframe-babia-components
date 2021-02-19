# Aframe-babia-components

[![Version](http://img.shields.io/npm/v/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)
[![License](http://img.shields.io/npm/l/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)

Data visualization components for A-Frame.

![example](https://i.imgur.com/CedRQs6.png)

For [A-Frame](https://aframe.io).

**Important**: The repository is hosted on [GitLab](https://gitlab.com/babiaxr/aframe-babia-components), if you are on GitHub, note that this is a mirror from the GitLab repository, if you want to open an [**issue**](https://gitlab.com/babiaxr/aframe-babia-components/-/issues), [**PR/MR**](https://gitlab.com/babiaxr/aframe-babia-components/-/merge_requests) or [**contribute**](https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/CONTRIBUTING.md) to the project, please visit:
- Repository: https://gitlab.com/babiaxr/aframe-babia-components
- Release Notes: https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/RELEASE_NOTES.md
- Components webpage: https://babiaxr.gitlab.io/aframe-babia-components/
- BabiaXR webpage: https://babiaxr.gitlab.io

## Why

Babia components are a set of components for data visualization, there are components for visualize, query and filter data.

This pack of components has the aim of visualize data in several ways. There are separated components and each one has an independent aim:

- `babiaxr-*` visualize the data prepared by a vismapper in several ways (this type of components must have in the same entity than a vismapper)
- `babiaxr-querier_*` the aim of just query data and save it in the entity that it has
- `babiaxr-filterdata` filter the data saved by one of the queriers
- `babiaxr-ui` for dynamically changing the metrics that are visualized in one chart using a user interface.
- And more!

For instance:

```html
<a-entity babiaxr-3dbarchart='legend: true; x_axis: name; z_axis: age; height: size;
    data:"[{"key":"David","key2":"2019","size":9},{"key":"David","key2":"2018","size":8},{"key":"David","key2":"2017","size":7},{"key":"David","key2":"2016","size":6},{"key":"David","key2":"2015","size":5},{"key":"Pete","key2":"2011","size":8},{"key":"Pete","key2":"2014","size":7},{"key":"Josh","key2":"2016","size":6},{"key":"Josh","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Jesus","key2":"2011","size":8},{"key":"Jesus","key2":"2014","size":7},{"key":"Jesus","key2":"2016","size":6},{"key":"Jesus","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Steve","key2":"2016","size":9},{"key":"Steve","key2":"2017","size":8},{"key":"Steve","key2":"2014","size":7},{"key":"Steve","key2":"2013","size":6},{"key":"Moreno","key2":"2015","size":5},{"key":"Jesus","key2":"2019","size":10},{"key":"Pete","key2":"2019","size":10}]"' 
position="-10 0 0" rotation="0 0 0"></a-entity>

```

For using the querier/filters/mappers components (see [HOW_TO_CHARTS_WITH_QUERIER.md](./docs/tutorials/HOW_TO_CHARTS.md))

```html
<a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>
<a-entity babiaxr-3dbarchart='from: queriertest; x_axis: name; z_axis: age; height: size; legend: true' position="-10 0 0" rotation="0 0 0"></a-entity>
```




## Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>A-Frame Babia components</title>
    <script src="https://aframe.io/releases/1.0.1/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-babia-components/dist/aframe-babia-components.min.js"></script>
</head>

<body>

    <a-scene background="color: #A8F3FF" id="AframeScene">
        
        <a-entity babiaxr-3dbarchart='legend: true; 
            data:"[{"key":"David","key2":"2019","size":9},{"key":"David","key2":"2018","size":8},{"key":"David","key2":"2017","size":7},{"key":"David","key2":"2016","size":6},{"key":"David","key2":"2015","size":5},{"key":"Pete","key2":"2011","size":8},{"key":"Pete","key2":"2014","size":7},{"key":"Josh","key2":"2016","size":6},{"key":"Josh","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Jesus","key2":"2011","size":8},{"key":"Jesus","key2":"2014","size":7},{"key":"Jesus","key2":"2016","size":6},{"key":"Jesus","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Steve","key2":"2016","size":9},{"key":"Steve","key2":"2017","size":8},{"key":"Steve","key2":"2014","size":7},{"key":"Steve","key2":"2013","size":6},{"key":"Moreno","key2":"2015","size":5},{"key":"Jesus","key2":"2019","size":10},{"key":"Pete","key2":"2019","size":10}]"' 
        position="-10 0 0" rotation="0 0 0"></a-entity>

        <a-entity id="queriertest" babiaxr-querier_json="url: ./data.json;"></a-entity>
        <a-entity babiaxr-3dbarchart='from: queriertest; x_axis: name; z_axis: age; height: size; radius: size; legend: true' position="-10 0 0" rotation="0 0 0"></a-entity>

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

The basic Chart components are easy to use, they have few attributes but if you want to see all the components and how to use them, there are user guides in the [docs](https://github.com/dlumbrer/aframe-babia-components/tree/master/docs) folder, here are the links:

- [HOW_TO_CHARTS_WITH_QUERIER.md](./docs/tutorials/HOW_TO_CHARTS.md): a simple user guide in order to learn how to create charts with this pack of components.
- [HOW_TO_TIME_EVOLVE_CITY.md](./docs/tutorials/HOW_TO_TIME_EVOLVE_CITY.md): a simple user guide in order to learn how to create a time evolution codecity from scratch (with the data retrieval process and the scene building).
- [HOW_TO_USE_UI.md](./docs/tutorials/HOW_TO_USE_UI.md): a simple user guide in order to learn how to create a interface to manage a visualizer and how to use it.


## Building and Running BabiaXR, and/or Contributing Code

You might want to build BabiaXR locally to contribute some code, test out the latest features, or try out an open PR:

- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) will help you get BabiaXR up and running.


## Querier components API

Queriers are the components that query data from different data sources.

[Go here to see the queriers API](./docs/APIs/QUERIERS.md).

## Data management components API

Data management components includes components for filtering data, transform data into a tree formar and others.

[Go here to see the queriers API](./docs/APIs/DATAMANAGEMENT.md).

## Charts components API

Charts included:
- Pie
- Doughnut
- 2D/3D bars
- 2D/3D cylinders
- Bubbles
- Terrain

[Go here to see the charts API](./docs/APIs/CHARTS.md).

## Cities and Islands components API

API for the city and inslands visualizers components.

[Go here to see the cities and islands API](./docs/APIs/CITIES.md).

## Other components API

Other components:
- UI (for changing metrics dynamically)
- lookat component
...

[Go here to see the other components API](./docs/APIs/OTHERS.md).


### Data model

The dataset returned from the parsing of the `babiaxr-querier*` components must follow this model:

```
[
    {
        "metric": value0,
        "metric2": value13,
        "key": value,
        ...
    },
    {
        "metric": value2,
        "metric2": value4
        "key": value1,
        ...

    },
    ...
]

```

### Examples available at the "examples folder" and [here](https://babiaxr.gitlab.io/aframe-babia-components/)