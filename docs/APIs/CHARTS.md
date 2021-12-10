---
#date: 2020-06-19T12:58:28+02:00
linktitle: charts-api
title: Charts components API
draft: false
weight: 50
categories: [ "Components", "Documentation" ]
tags: ["api", "data format", "demo"]
---

## Chart components API

The installation contains the following components:

### babia-pie component

This component shows a pie chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| key          | The field of the data that will define each slice of the pie. (Make sure that this field has unique values!) | string | key |
| size          | The **numeric** field of the data that will define the size of the slices | string | size |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### babia-doughnut component

This component shows a doughnut chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| key          | The field of the data that will define each slice of the pie. (Make sure that this field has unique values!) | string | key |
| size          | The **numeric** field of the data that will define the size of the slices | string | size |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### babia-bars component

This component shows a simple 2D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| height          | the **numeric** field of the data that will define the height of the bars | string | height |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| axis_name | Shows metric labels on axis | boolean | false |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| chartHeight          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| dur         | Duration of the animation(ms)   | number | 2000 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"kbn_network","height":10},
{"x_axis":"Maria","height":5},
...
]

```

### babia-barsmap component

This component shows a bars map.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the bars | string | height |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| axis_name | Shows metric labels on axis | boolean | false |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| chartHeight          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| dur         | Duration of the animation(ms)   | number | 2000 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"David","z_axis":"2019","height":9},
{"x_axis":"David","z_axis":"2018","height":8},
...
]

```

### babia-bubbles component

This component shows a 3D Bubbles chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the bubbles | string | height |
| radius          | the **numeric** field of the data that will define the radius of the bubbles | string | radius |
| legend          | Shows a legend when hovering a bubble  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"x_axis":"David","z_axis":"2019","height":1,"radius":9},
{"x_axis":"David","z_axis":"2018","height":2,"radius":8},
...
]

```

### babia-cyls component


This component shows a cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | x_axis |
| height          | the **numeric** field of the data that will define the height of the cylynders | string | height |
| radius          | the **numeric** field of the data that will define the radius of the cylynders | string | radius |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| axis_name | Shows metric labels on axis | boolean | false |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| chartHeight          | Adjusts the height of the chart.  | number | 10 |
| keepHeight          | Keep height when updating data.  | boolean | true |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | 2 |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| dur         | Duration of the animation(ms)   | number | 2000 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"David","height":9,"radius":1},
{"key":"David","height":8,"radius":3},
...
]

```

### babia-cylsmap component

This component shows a 3D cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The filterdata/querier entity ID where  is the data for the chart | string | - |
| x_axis          | The field of the data that will define the tags of the x_axis of the chart (as a keys) | string | x_axis |
| z_axis          | The field of the data that will define the tags of the z_axis of the chart (as a keys). (Make sure that this field has unique values!) | string | z_axis |
| height          | the **numeric** field of the data that will define the height of the cylynders | string | height |
| radius          | the **numeric** field of the data that will define the radius of the cylynders | string | radius |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| axis_name | Shows metric labels on axis | boolean | false |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| chartHeight          | Adjusts the height of the chart.  | number | 10 |
| keepHeight          | Keep height when updating data.  | boolean | true |
| radiusMax          | Adjusts bubbles' radius of the chart.  | number | 2 |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| dur         | Duration of the animation(ms)   | number | 2000 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
[{"key":"David","key2":"2019","height":1,"radius":9},
{"key":"David","key2":"2018","height":2,"radius":8},
...
]

```

### babia-city component

This component shows a city chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The treebuilder entity ID where  is the data for the chart | string | - |
| absolute          | Absolute size (width and depth will be used for proportions) | boolean | false |
| width          | Width of the entire city. | number | 20 |
| depth          | Depth of the entire city. | number | 20 |
| split          | Algoritm to split rectangle in buildings: naive, pivot | (naive or pivot) | naive |
| farea          | Field in data items to represent as building area | string | area |
| fmaxarea          | Field in data items to represent as building max_area | string | max_area |
| fheight          | Field in data items to represent as building height | string | height |
| titles          | Titles on top of the buildings when hovering | boolean | true |
| building_color          | Color of the buildings | color | #E6B9A1 |
| base          | build the base or not | boolean | true |
| base_thick          | Base thickness | number | 0.2 |
| base_color          | Base color | color | #98e690 |
| border          | Size of border around buildings (streets are built on it) | number | 1 |
| extra          | Extra factor for total area with respect to built area | number | 1.4 |
| zone_elevation          | Zone: elevation for each "depth" of quarters, over the previous one | number | 1 |
| unicolor          | Unique color for each zone | boolean | false |
| wireframe          | Show materials as wireframe | boolean | false |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |

#### Data format example
```json
{"id": "Root",
         "children":
          [{"id": "BlockA",
            "children": [{"id": "BlockA0",
                      "children": [{"id": "A0A", "area": 2, "height": 1}, ...]},
...

```

### babia-boats component

This component shows a city in boats.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from          | The treebuilder entity ID where  is the data for the chart | string | - |
| area          | Field in data items to represent as building area. **DON'T USE IT WITH WIDTH/DEPTH PARAMETERS**. | string | - |
| width          | Field in data items to represent as building area. **DON'T USE IT WITH AREA PARAMETERS**.| string | width |
| depth          | Field in data items to represent as building area. **DON'T USE IT WITH AREA PARAMETERS**. | string | depth |
| height          | Field in data items to represent as building height | string | height |
| color          | Field in data items to represent the color of the buildings as HSL heatmap | string | - |
| building_separation  | Separation of the buildings by a numeric factor | number | 0.25 |
| border          | Size of border around buildings (streets are built on it) | number | 0.5 |
| extra          | Extra factor for total area with respect to built area | number | 1.0 |
| zone_elevation          | Zone: elevation for each "depth" of quarters, over the previous one | number | 0.3 |
| building_color          | Color of the buildings | color | #E6B9A1 |
| base_color          | Quarter color | color | #98e690 |
| data          | Data to show with the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |
| field | Field of the data that will define the tree (**DON'T USE WITH TREEBUILDER**) | string   | `uid` |

#### Data format example
```json
{"id": "Root",
         "children":
          [{"id": "BlockA",
            "children": [{"id": "BlockA0",
                      "children": [{"id": "A0A", "area": 2, "height": 1}, ...]},
...

```



## babia-terrain Component
This component creates a terrain using vertices data.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| width          | Width of the terrain  | number | 1 |
| height          | Height of the terrain  | number | 1 |
| segmentsWidth          | Number of width segments  | number | 1 |
| segmentsHeight          | Number of height segments  | number | 1 |
| color          | Color of the terrain  | string | #FFFFFF |
| filled          | Fill the terrain  | boolean | false |
| data          | Data about vertices of the terrain  | array | - |

#### Data Format
Data length must be the same as the vertices = segmentsWidth x segmentsHeight.
```
data:   0, 3, 6, 3, 0, 0, 2, 4, 2,
        0, 2, 0, 0, 2, 4, 6, 4, 2,

        ...

        0, 2, 0, 0, 2, 4, 6, 4, 2,
        0, 3, 6, 3, 0, 0, 2, 4, 2
```


### COLOR PALETTES

![palettes](https://i.imgur.com/Ibk5bMo.png)

### FONTS

The title of the chart uses `typeface.json` files, which are Web Fonts converted to
JSON for three.js.  Typeface fonts can be generated from fonts using this
**[typeface font generator](http://gero3.github.io/facetype.js/)**. Select JSON
format and we recommend restricting the character set to only the characters
you need. You may also have to check *reverse font direction* if you get odd font results.

You can also find some sample generated fonts in the `examples/fonts` directory
in the [three.js repository](https://github.com/mrdoob/three.js).

By default, the text geometry component points to Helvetiker (Regular). Each
font is fairly large, from at least 60KB to hundreds of KBs.

To include a font for use with the text component, it is recommended to define
it in `<a-asset-item>` and point at it with a selector.

### babia-network component

This component shows a network chart.

#### API

| Property      | Description           | Type   | Parse    | Default value |
| -----    |--------           | ----   |---------   | --------  |
| nodeLegend          | Shows a legend when hovering a node.  | boolean | - | false |
| linkLegend          | Shows a legend when hovering a link. **Important**: will only work if nodeLabel is different from ""  | boolean | - | false |
| from          | The filterdata/querier entity ID where the data for the chart is.| string | - | - |
| data          | Complete data to show in the chart. Link information will be obtained from the information inside the nodes. **Important**: Using this attribute will disable the `from`, `nodes` and `links` attributes.  | JSON (list of objects) | -  | - |
| nodes          | Nodes data to show in the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - | - |
| links          | Links data to show in the chart. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - | - |
| nodeId          | Field of data/nodes that will define each node of the network. (Make sure that this field has unique values!) | string | - | nodeId |
| nodeLabel          | Field of data/nodes or property that will be shown in the legend of each node of the network. It accepts **numbers**, **strings** or **functions**.| - | parseAccessor | id |
| linkId          | Field of data that will define the relation between different nodes of the network. **Important**: Used when adding complete data, to generate links.| string | - | - |
| linkSource          | Field of data/links that will define the links' sources.| string | - | source |
| linkTarget          | Field of data/links that will define the links' targets.| string | - | target |
| nodeVal          | Field of data/nodes or property that will define the size of the spheres. It accepts **numbers**, **strings** or **functions**.| - | parseAccessor |size |
| nodeRelSize          | Volume per nodeVal unit, it adjusts the size of the spheres my multiplying their nodeVal. | number | - | 4 |
| nodeColor          | Field of data/nodes or property that will define the color of each node. It accepts **numbers**, **strings** or **functions**.| - |parseAccessor | color |
| nodeAutoColorBy          | Field of data/nodes or property that will define the color of each node by coloring those with the same field equally. It accepts **numbers**, **strings** or **functions**. **Important**: It only affects nodes without a nodeColor property. | - |parseAccessor | - |
| nodeResolution          | Defines the number of slice segments in the sphere's circumference in the nodes | number | 8 | - |
| linkColor          | Field of data/links that will define the color of each link. It accepts **numbers**, **strings** or **functions**.| - | parseAccessor | color |
| linkAutoColorBy          | Field of data/links that will define the color of each link of the network by coloring those with the same field equally. It accepts **numbers**, **strings** or **functions**. **Important**: It only affects links without a linkColor property.  | - | parseAccessor | - |
| linkWidth          | Defines the width of the links. It accepts **numbers**, **strings** or **functions**. A value of 0 will render a line.| - | parseAccessor | 0 |
| linkResolution        | Defines the number of radial segments in the line cylinder's geometry in each link only if the linkWidth is positive. | number | - | 6 |
| linkLabel          | Field of data/links or property that will be shown in the legend of each link of the network. It cannot be "source" or "target", nor "linkSource" or "linkTarget". It accepts **numbers**, **strings** or **functions**.| - | parseAccessor | "" |



#### Data format example

* First option: data
  ```json
  [ {"country": "Italy", "continent": "Europe", "size": 301300},
    {"country": "China", "continent": "Asia", "size": 9600000},
    {"country": "Spain", "continent": "Europe", "size": 505400},
    {"country": "India", "continent": "Asia", "size": 3290000}
  ...
  ]

  ```

  In this case, **linkID** could be defined as *continent*, and a link would be created between the countries with equal *continent*. The result will be the same as getting the data separared in nodes and links as follows.

*  Second option: nodes and links

    nodes
    ```json
    [ {"country": "Italy", "continent": "Europe", "size": 301300},
      {"country": "China", "continent": "Asia", "size": 9600000},
      {"country": "Spain", "continent": "Europe", "size": 505400},
      {"country": "India", "continent": "Asia", "size": 3290000}
    ...
    ]

    ```
    links
    ```json
    [ {"id": 1, "source": "Italy", "target": "Spain"},
      {"id": 2, "source": "China", "target": "India"},
    ...
    ]

    ```
#### **Original Component**

This component is based on the aframe-forcegraph-component by vasturiano.

It accepts the following properties defined in the original component: *numDimensions, dagMode, dagLevelDistance, dagNodeFilter, onDagError, nodeResolution, nodeVisibility, nodeOpacity, nodeThreeObject, nodeThreeObjectExtend, linkVisibility, linkOpacity, linkCurvature, linkCurveRotation, linkMaterial, linkThreeObject, linkThreeObjectExtend, linkPositionUpdate, linkDirectionalArrowLength, linkDirectionalArrowColor, linkDirectionalArrowRelPos, linkDirectionalArrowResolution, linkDirectionalParticles, linkDirectionalParticleSpeed, linkDirectionalParticleWidth, linkDirectionalParticleColor, linkDirectionalParticleResolution, forceEngine, d3AlphaMin, d3AphaDecay, d3VelocityDecay, ngraphPhysics, warmupTicks, cooldownTicks, cooldownTime, onEngineTick, onEngineStop*. To know more or to access all the information related to the original component visit https://github.com/vasturiano/aframe-forcegraph-component
