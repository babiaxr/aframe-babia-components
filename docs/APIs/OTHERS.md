---
#date: 2020-06-19T12:58:28+02:00
linktitle: others-api
title: Others components API
draft: false
weight: 50
categories: [ "Components", "Documentation" ]
tags: ["api", "data format", "demo"]
---

## Others APIs

### babia-ui component

This component lets us select the data and the metrics that we want to show in the targeted visualizer at any time.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| target          | ID of the visualizer that will manage | string | - |

```html
    <a-entity babia-ui = 'target: visualizerid'></a-entity>
```

### babia-lookat component

> Based on https://github.com/supermedium/superframe/tree/master/components/look-at/

The look-at component defines the behavior for an entity to dynamically rotate or face towards another entity or position. The rotation of the entity will be updated on every tick. The look-at component can take either a vec3 position or a query selector to another entity.

#### API

| Type     | Description                                                                                                                                   |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| selector | A query selector indicating another entity to track. If the other entity is moving then the `look-at` component will track the moving entity. |
| vec3     | An XYZ coordinate. The entity will face towards a static position.                                                                            |
```html
    <a-entity id="monster" geometry="primitive: box" material="src: url(monster.png)" look-at="[camera]"></a-entity>
```

### babia-navigator component

The navigator component creates a timeline with all indexes of the selector component and lets manage it using player, speed, and step controllers.

To work needs to indicate it inside the selector

```html
   <a-entity id="nav" babia-navigator></a-entity>
```

### babia-axis components

The axis components add axis to the graphs. It is currently available for babia-bars and babia-barsmap components.

#### **babia-axis-x component**

This component adds a x axis to the graph.

#### API

| Property       | Description           | Type   | Default value |
| --------       | -----------           | ----   | ----- |
| labels         | List of labels to show | array | - |
| ticks          | Points where labels are added in the axis | array | - |
| length         | Length of the axis | number | - |
| color          | Color for axis and labels | color | #000 |
| palette        | Color palette for axis and labels:`blues` `bussiness` `sunset`. [See more](CHARTS.md)) **Important**: If the value is not **None**, it will disable `color` attribute. | string | ' ' |
| animation      | Animates the axis if true | boolean | true |
| dur            | Duration of animation | number | 2000 |
| align          | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind**| string | front |
| name           | Metric name to show on title label. | string | - |

```html
    <a-entity babia-axis-x = 'labels: countries, ticks: calculatedTicks, length: 10, palette: ubuntu,
    align: behind, name: country'></a-entity>
```


#### **babia-axis-y component**

This component adds a y axis to the graph.

#### API

| Property       | Description           | Type   | Default value |
| --------       | -----------           | ----   | ----- |
| maxValue       | Maximum value that this axis will show | number | - |
| length         | Length of the axis | number | - |
| minSteps       | Minimum number of steps | number | 6 |
| color          | Color for axis and labels | color | #000 |
| animation      | Animates the axis if true | boolean | true |
| dur            | Duration of animation | number | 2000 |
| align          | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind**| string | front |
| name           | Metric name to show on title label. | string | - |

```html
    <a-entity babia-axis-y = 'maxValue: 250, length: 10, color: #fff,
    align: left'></a-entity>
```

#### **babia-axis-z component**

This component adds a z axis to the graph.

#### API

| Property       | Description           | Type   | Default value |
| --------       | -----------           | ----   | ----- |
| labels         | List of labels to show | array | - |
| ticks          | Points where labels are added in the axis | array | - |
| length         | Length of the axis | number | - |
| color          | Color for axis and labels | color | #000 |
| palette        | Color palette for axis and labels. **Important**: If the value is not **None**, it will disable `color` attribute. | string | ' ' |
| animation      | Animates the axis if true | boolean | true |
| dur            | Duration of animation | number | 2000 |
| align          | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind**| string | front |
| name           | Metric name to show on title label. | string | - |

```html
    <a-entity babia-axis-z = 'labels: continents, ticks: calculatedTicks, length: 10, palette: pearl,
    align: front, name: continent'></a-entity>
```