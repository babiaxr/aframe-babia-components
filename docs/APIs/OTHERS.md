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