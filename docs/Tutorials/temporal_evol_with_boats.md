---
linktitle: "guide_temporal_evol_boats"
date: 2021-09-22T11:30:05+02:00
title: Visualize data with temporal evolution using babia-boats
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "data format", "guide"]
---

You can display data using the city metaphor and some Babia's components: `babia-city` and `babia-boats`. Now, we have included the feature that allows you to add temporal evolution to babia-boats. This allows you to see the evolution of the data over time using a single JSON file (eg. filtering by date).

In this tutorial we will explain how to create a scene with this feature.

## Data Format

First of all, we will explain how the necessary data format should be for it to work. Each element is added individually in an array within the JSON.

For example:
```
[
    {
        "path": "Root/BlockA/BlockA0/A0A",
        "date":"2015-08",
        "area": 2,
        "height": 1
    },
    {
        "path": "Root/BlockA/BlockA0/A0A",
        "date":"2015-09",
        "area": 2,
        "height": 7
    },
    {
        "path": "Root/BlockA/BlockA0/A0B",
        "date":"2015-09",
        "area": 5,
        "height": 5
    },
    {
        "path": "Root/BlockA/BlockA0/A0B",
        "date":"2015-10",
        "area": 10,
        "height": 5
    }
    ,
    {
        "path": "Root/BlockA/BlockA0/A0C",
        "date":"2015-10",
        "area": 1,
        "height": 7
    }
]
```
We will use small data to make it easier.

The name of the fields need not be the same as the example.


## Components to Use

First we will import the data using the querier `babia-queryjson`. In this tutorial we will not use filtered data, therefore we will not add any filter.

In order to add the temporal evolution of the data we will need the component `babia-selector`. This component will filter the data by dates in order to see the value of the data on that date. In addition, we will need `babia-navigator` to be able to control the component selector (without it it will not work).

This tutorial focuses on using `babia-boats` to visualize the data, therefore we will also need the `babia-treebuilder` component that will pass the data to a data tree parsing the path field.
>Note: You need indicate the **SAME** attribute `field` in `babia-boats` and `babia-treebuilder` (eg. `field: path;`).

So the correct order would be:

1. [babia-queryjson](https://babiaxr.gitlab.io/apis/queriers/#babia-queryjson-component)
2. [babia-selector](https://babiaxr.gitlab.io/apis/datamanagement/#babia-selector-component)
3. [babia-treebuilder](https://babiaxr.gitlab.io/apis/datamanagement/#babia-treebuilder-component)
4. [babia-boats](https://babiaxr.gitlab.io/apis/charts/#babia-boats-component)
5. [babia-navigator](https://babiaxr.gitlab.io/apis/charts/#babia-boats-component) (this component does not matter where you place it).

> Click on any component to see how they are used.


## Creating the scene

Using these components, we will create a scene like this:

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
    <title>A-Frame Boats Component </title>
    <meta name="description" content="Temporal Evolution for Boats component.">
  </meta>
  <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/donmccurdy/aframe-extras@v6.1.0/dist/aframe-extras.min.js"></script>
  <script src="https://unpkg.com/aframe-environment-component@1.2.0/dist/aframe-environment-component.min.js"></script>
  <script src="https://unpkg.com/aframe-babia-components/dist/aframe-babia-components.min.js"></script>
</head>

<body>
  <a-scene environment="preset: yavapai" renderer="antialias: true">

    <!-- 1 Querier -->
    <a-entity id="querier" babia-queryjson="url: ./data.json;"></a-entity>

    <!-- 2 Selector -->
    <a-entity id="selector" babia-selector="from: querier; controller: nav" ></a-entity>

    <!-- 3 Treebuilder -->
    <a-entity id="tree" babia-treebuilder="field: path; split_by: /; from: selector"></a-entity>

    <!-- Boats Visualizer -->
    <a-entity scale="0.4 1 0.4" babia-boats="from: tree; area: area; field: path" position="0 1 0"></a-entity>

    <!-- Navigator -->
    <a-entity id="nav" babia-navigator position="5 3 4" rotation="0 0 0"></a-entity>

    <a-entity movement-controls="fly: true" position="0 5 10" rotation="0 0 0">
      <a-entity camera look-controls></a-entity>
      <a-entity cursor="rayOrigin:mouse"></a-entity>
      <a-entity laser-controls="hand: right"></a-entity>
    </a-entity>
  </a-scene>
  </body>
</html>
```

>Note 1: more info about the component `environment` in aframe dicumentation [aframe-environment-component](https://github.com/supermedium/aframe-environment-component#aframe-environment-component).

>Note 2: more info about creating `camera` component in aframe dicumentation [A-frame Docs](https://aframe.io/docs/1.2.0/components/camera.html) or [aframe-extras](https://github.com/n5ro/aframe-extras/tree/master/src/controls#controls).


## Results

![img](https://i.imgur.com/QyJGlfm.gif)