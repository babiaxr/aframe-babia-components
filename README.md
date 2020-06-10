# Aframe-babia-components

[![Version](http://img.shields.io/npm/v/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)
[![License](http://img.shields.io/npm/l/aframe-babia-components.svg?style=flat-square)](https://npmjs.org/package/aframe-babia-components)

Data visualization components for A-Frame.

![example](https://i.imgur.com/kfqSgMA.png)

For [A-Frame](https://aframe.io).

**Important**: The repository is hosted on [GitLab](https://gitlab.com/babiaxr/aframe-babia-components), if you are on GitHub, note that this is a mirror from the GitLab repository, if you want to open an [**issue**](https://gitlab.com/babiaxr/aframe-babia-components/-/issues), [**PR/MR**](https://gitlab.com/babiaxr/aframe-babia-components/-/merge_requests) or [**contribute**](https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/CONTRIBUTING.md) to the project, please visit:
- Repository: https://gitlab.com/babiaxr/aframe-babia-components
- Release Notes: https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/RELEASE_NOTES.md
- Components webpage: https://babiaxr.gitlab.io/aframe-babia-components/
- BabiaXR webpage: https://babiaxr.gitlab.io

## Why

This pack of components has the aim of visualize data in several ways. There are separated components and each one has an independent aim:

- `geo*` visualize the data prepared by a vismapper in several ways (this type of components must have in the same entity than a vismapper)
- `querier_*` the aim of just query data and save it in the entity that it has
- `filterdata` filter the data saved by one of the queriers
- `vismapper` map the data filtered by filterdata to geometry attributes of the different charts, it "prepares" the data and save it in the entity that it has.

For instance:

```html
<a-entity geo3dbarchart='legend: true; 
    data:"[{"key":"David","key2":"2019","size":9},{"key":"David","key2":"2018","size":8},{"key":"David","key2":"2017","size":7},{"key":"David","key2":"2016","size":6},{"key":"David","key2":"2015","size":5},{"key":"Pete","key2":"2011","size":8},{"key":"Pete","key2":"2014","size":7},{"key":"Josh","key2":"2016","size":6},{"key":"Josh","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Jesus","key2":"2011","size":8},{"key":"Jesus","key2":"2014","size":7},{"key":"Jesus","key2":"2016","size":6},{"key":"Jesus","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Steve","key2":"2016","size":9},{"key":"Steve","key2":"2017","size":8},{"key":"Steve","key2":"2014","size":7},{"key":"Steve","key2":"2013","size":6},{"key":"Moreno","key2":"2015","size":5},{"key":"Jesus","key2":"2019","size":10},{"key":"Pete","key2":"2019","size":10}]"' 
position="-10 0 0" rotation="0 0 0"></a-entity>

```

or using the querier/filters/mappers components (see [HOW_TO_CHARTS_WITH_QUERIER.md](./docs/HOW_TO_CHARTS.md))

```html
<a-entity id="queriertest" querier_json="url: ./data.json;"></a-entity>
<a-entity geo3dbarchart='legend: true' filterdata="from: queriertest"
            vismapper="x_axis: name; z_axis: age; height: size" position="-10 0 0" rotation="0 0 0"></a-entity>

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
        
        <a-entity geo3dbarchart='legend: true; 
            data:"[{"key":"David","key2":"2019","size":9},{"key":"David","key2":"2018","size":8},{"key":"David","key2":"2017","size":7},{"key":"David","key2":"2016","size":6},{"key":"David","key2":"2015","size":5},{"key":"Pete","key2":"2011","size":8},{"key":"Pete","key2":"2014","size":7},{"key":"Josh","key2":"2016","size":6},{"key":"Josh","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Jesus","key2":"2011","size":8},{"key":"Jesus","key2":"2014","size":7},{"key":"Jesus","key2":"2016","size":6},{"key":"Jesus","key2":"2015","size":5},{"key":"Jesus","key2":"2016","size":9},{"key":"Steve","key2":"2016","size":9},{"key":"Steve","key2":"2017","size":8},{"key":"Steve","key2":"2014","size":7},{"key":"Steve","key2":"2013","size":6},{"key":"Moreno","key2":"2015","size":5},{"key":"Jesus","key2":"2019","size":10},{"key":"Pete","key2":"2019","size":10}]"' 
        position="-10 0 0" rotation="0 0 0"></a-entity>

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

- [HOW_TO_CHARTS_WITH_QUERIER.md](./docs/HOW_TO_CHARTS.md): a simple user guide in order to learn how to create charts with this pack of components.


## Building and Running BabiaXR, and/or Contributing Code

You might want to build BabiaXR locally to contribute some code, test out the latest features, or try out an open PR:

- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) will help you get BabiaXR up and running.


## Chart components API

The installation contains the following components:

### geopiechart component

This component must be used with one of the `vismapper` components, with the `slice` and `height` attribute defined.

This component shows a pie chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### geosimplebarchart component

This component must be used with one of the `vismapper` components, with the `x-axis` and `height` attribute defined.

This component shows a simple 2D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]

```

### geo3dbarchart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a bar  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| scale          | Scales up the chart. For example: scale 1/100 => `scale: 100` | number | - |
| heightMax          | Adjusts the height of the chart.  | number | - |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"David","key2":"2019","size":9},
{"key":"David","key2":"2018","size":8},
...
]

```

### bubblechart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis`, `radius` and `height` attribute defined.

This component shows a 3D bar chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
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
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"David","key2":"2019","height":1,"radius":9},
{"key":"David","key2":"2018","height":2,"radius":8},
...
]

```

### geocylinderchart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `height` and `radius` attribute defined.

This component shows a cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
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
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"David","height":9,"radius":1},
{"key":"David","height":8,"radius":3},
...
]

```

### geo3dcylinderchart component

This component must be used with one of the `vismapper` components, with the `x-axis`, `z-axis`, `height` and `radius` attribute defined.

This component shows a 3D cylinder chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a cylinder  | boolean | false |
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
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"David","key2":"2019","height":1,"radius":9},
{"key":"David","key2":"2018","height":2,"radius":8},
...
]

```

### geodougnutchart component

This component must be used with one of the `vismapper` components, with the `slice` and `size` attribute defined.

This component shows a doughnut chart.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| legend          | Shows a legend when hovering a slice  | boolean | false |
| axis          | Shows chart axis  | boolean | true |
| palette          | Color palette of the chart `blues` `bussiness` `sunset`. [See more](#color-palettes)  | string | ubuntu |
| title          | Shows chart title  | string | - |
| titleFont          | Font of the title. Path to a typeface.json file or selector to `<a-asset-item>`. [See more](#fonts)  | JSON (list of objects) | https://rawgit.com/supermedium/superframe/master/components/text-geometry/lib/helvetiker_regular.typeface.json |
| titleColor          | Color of the title  | string | #FFFFFF |
| titlePosition          | Position of the title  | string | 0 0 0 |
| animation          | Animates chart   | boolean | false |
| data          | Data to show with the chart  | JSON (list of objects) | - |

#### Data format
```json
[{"key":"kbn_network","size":10},
{"key":"Maria","size":5},
...
]
```

### geototemchart component

This component shows a totem in order to change the data of the visualizations that it's targeting.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| charts_id          | List of HTML IDs of the charts that will change their data  | JSON  stringfied (list of objects) | - |
| data_list          | List of datasets that the totem will switch  | JSON stringfied (list of objects) | - |

#### attributtes format

You can change the data of a geo*chart or a vismapper and retrieve the data from a JSON or querier.

- charts_id, define in "type" key if it a geo*chart or a vismapper:
    ```
    charts_id: [{"id": "pie1", "type": "geopiechart"}, {"id": "bars1", "type": "vismapper"}, ...]
    ```

- data_list, define a path of the JSON or a ID of the querier to get the data:
    ```
    data_list: [{"data":"Data 4", "from_querier": "<querier HTML id>"}, {"data": "Data 5", "path": "<json_path>"}, ...]
    ```
    
### UI navigation bar component

This component creates a timeline bar that changes a chart using an array of data. Also, let stop, skip, rewind and forward the time process. 

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| commits          | List of HTML IDs of the querier data and dates  | JSON  stringfied (list of objects) | - |
| size          | Size of the navigation bar   | number | 5 |
| to          | Direction of the process  | string | right |
| start_point          | Position of the starting point  | number | 0 |

```html
        <a-entity id="datatest1" querier_json="url: ./data.json;"></a-entity>
        <a-entity id="datatest2" querier_json="url: ./data2.json;"></a-entity>
        ...
        <a-entity id="datatest6" querier_json="url: ./data6.json;"></a-entity>

        <a-entity id="navigationbar" ui-navigation-bar =
       'commits: [{"date": "01/30/2003", "commit": "datatest1"}, 
                  {"date": "02/17/2003", "commit": "datatest2"},
                    ...
                  {"date": "01/13/2004", "commit": "datatest6"}]'>
        </a-entity>
```


### event controller component

This component manages the events between the UI navigation bar and the chart component. You need it if you use a UI navigation bar component.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| navigation         | ID of the UI navigation bar that will manage the chart   | JSON  stringfied (list of objects) | - |
| target          | ID of the chart that will change its data  | JSON stringfied (list of objects) | - |

```html
    <a-entity event-controller = 'navigation: navigationbarid; target: chartid'></a-entity>
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


## Querier/Filter/Mapper and other components API

### querier_es component

Component that will retrieve data from an ElasticSearch. It uses [ElasticSearch URI](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-uri-request.html) search to do it.

This component will put the data retrieved into the `babiaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ------ |
| elasticsearch_url             | Url of ElasticSearch  | string | - |
| index        | Index of the query | string   | - |
| size         | Size of the max results of the query | int   | 10 |
| query        | Query using the Lucene query string syntax, p.e: `q=name:dlumbrer`  | string   | - |

> **Important**: The ElasticSearch must have enabled cross-origin resource sharing because the queries are made by the browser. See this [ElasticSearch reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html)

### querier_json component

Component that will retrieve data from a JSON input that can be defined as an url or directly embedded.

This component will put the data retrieved into the `babiaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ------ |
| url             | Url of the file with the JSON data  | string | - |
| embedded        | JSON data directly stringified in the property | string   | - |


### querier_github component

Component that will retrieve data related to the repositories from an user using the GitHub API. It can be defined the username in order to get info about all the repositories or also it can be defined an array of repos in order to analyse just them (instead of all).

This component will put the data retrieved into the `babiaData` attribute of the entity.


#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| user            | GitHub username  | string | - |
| repos        | List of repo that you want to analyse | array   | (If empty it will retrieve all the repos of the user) |


### filterdata component

This component must be used with one of the `querier` components. This component will select a part of the data retrieved (by a key/filter) in order to represent just that part of the data. If the filter is not defined, it will retrieve all the data.
This component will put the data selected into the `babiaData` attribute of the entity.

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
| height        | Field of the data selected by filterdata that will be mapped as the height of the items of the charts or a geometry. Valid for **geo3dbarchart, **geocylinderchart**, **geo3dcylinderchart**, **geobubbleschart, geosimplebarchart and box/sphere** | string   | - |
| radius        | Field of the data selected by filterdata that will be mapped as the radius of the items of the charts or a geometry. Valid for **geocylinderchart**, **geo3dcylinderchart**, **geobubbleschart and sphere** | string   | - |
| slice        | Field of the data selected by filterdata that will be mapped as the slices of the items of a pie chart. Valid for **piechart** and **geodoughnutchart** | string   | - |
| z-axis        | Field of the data selected by filterdata that will be mapped as the keys of the Z Axis of the chart component selected. Valid for **geo3dbarchart, geobubblechart and geo3dcylinderchart** | string   | - |
| x-axis        | Field of the data selected by filterdata that will be mapped as the keys of the X Axis of the chart component selected. Valid for **geo3dbarchart, geo3dcylinderchart, geoubblechart and geosimplebarchart** | string   | - |
| width            | Field of the data selected by filterdata that will be mapped as the width of the geometry **(only for box geometry)**.  | string | - |
| depth        | Field of the data selected by filterdata that will be mapped as the depth of the geometry **(only for box geometry)**. | string   | - |




### debug_data component

This component force the entity to hear an event, when this event occurs, a debug plane with the data of the `babiaData` entity attribute will appear in the position (or close) of the entity that it belongs.

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


### Data model

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

## Terrain Component
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


### Examples available at the "examples folder" and [here](https://babiaxr.gitlab.io/aframe-babia-components/)