---
#date: 2020-06-19T12:58:28+02:00
linktitle: datamanagement-api
title: Data management components API
draft: false
weight: 50
categories: [ "Components", "Documentation" ]
tags: ["api", "data format", "demo"]
---


### babia-ui component

This component lets us select the data and the metrics that we want to show in the targeted visualizer at any time.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| target          | ID of the visualizer that will manage | string | - |

```html
    <a-entity babia-ui = 'target: visualizerid'></a-entity>
```


### babiaxr-event-controller component

This component manages the events between the UI navigation bar and the chart component. You need it if you use a UI navigation bar component.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| navigation         | ID of the UI navigation bar that will manage the chart   | JSON  stringfied (list of objects) | - |
| target          | ID of the chart that will change its data  | JSON stringfied (list of objects) | - |

```html
    <a-entity babiaxr-event-controller = 'navigation: navigationbarid; target: chartid'></a-entity>
```

### babiaxr-navigation-bar component

This component creates a timeline bar that changes a chart using an array of data. Also, let stop, skip, rewind and forward the time process. 

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| commits          | List of HTML IDs of the querier data and dates  | JSON  stringfied (list of objects) | - |
| size          | Size of the navigation bar   | number | 5 |
| points_by_line          | Number of points by line.    | number | 5 |
| to          | Direction of the process  | string | right |
| start_point          | Position of the starting point  | number | 0 |

```html
        <a-entity id="datatest1" babia-queryjson="url: ./data.json;"></a-entity>
        <a-entity id="datatest2" babia-queryjson="url: ./data2.json;"></a-entity>
        ...
        <a-entity id="datatest6" babia-queryjson="url: ./data6.json;"></a-entity>

        <a-entity id="navigationbar" babiaxr-navigation-bar =
       'commits: [{"date": "01/30/2003", "commit": "datatest1"}, 
                  {"date": "02/17/2003", "commit": "datatest2"},
                    ...
                  {"date": "01/13/2004", "commit": "datatest6"}]'>
        </a-entity>
```