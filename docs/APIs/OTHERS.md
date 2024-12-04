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

| Property              | Description                                                                                                                                                                                                                          | Type   | Default value |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------- |
| target                | ID of the visualizer that will manage                                                                                                                                                                                                | string | -             |
| hideRows              | Array of the rows that want to be hidden                                                                                                                                                                                             | array  | -             |
| hideFields            | Array of the fields that want to be hidden                                                                                                                                                                                           | array  | -             |
| showOnly              | Array of the fields that only want to show, format **property:field**, example: **babia-ui="showOnly: height:field, color:otherfield"**                                                                                              | array  | -             |
| maxPerRow             | Max items per row, if more, a breakline will be added                                                                                                                                                                                | number | 5             |
| linesSeparation       | Distance between lines of the UI                                                                                                                                                                                                     | number | 0.3           |
| customQuerierLabel    | Custom label of the first row when there are more than one querier                                                                                                                                                                   | string | Data          |
| customAttributeSwitch | Attributes to remove/add to the target. Format **attr:value**, example: **babia-ui="customAttributeSwitch: wireframe:true, color:blue"**                                                                                             | array  | -             |
| customAttributeLabel  | Custom label for the attributes to represent in the customAttributeSwitch row. Format **attr:label**,  example: **babia-ui="customAttributeSwitch: trasnparency20byBuildingField:Transparency, wireframeByBuildingField:Wireframe"** | array  | -             |


```html
    <a-entity babia-ui = 'target: visualizerid'></a-entity>
```

### babia-lookat component

> Based on https://github.com/supermedium/superframe/tree/master/components/look-at/

The look-at component defines the behavior for an entity to dynamically rotate or face towards another entity or position. The rotation of the entity will be updated on every tick. The look-at component can take either a vec3 position or a query selector to another entity.

#### API

| Type     | Description                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
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
#### API

| Property  | Description                                                                                                                                                                                                                                              | Type   | Default value |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- |
| direction | Direction of the time evolution (`forward` or `rewind`). If is empty or it gets a different value, it behaves like `forward`. **Important:** Do not set this value manually, it will be updated with the direction value of the selector via notiBuffer. | string | `forward`     |
| state     | State of the time evolution (`play` or `pause`). If is empty or it gets a different value, it behaves like `play`. **Important:** Do not set this value manually, it will be updated with the state value of the selector via notiBuffer                 | string | `play`        |

### babia-axis components

The axis components add axis to the graphs. It is currently available for babia-bars and babia-barsmap components.

### **babia-axis-x component**

This component adds a x axis to the graph.

#### API

| Property  | Description                                                                                                                                                            | Type    | Default value |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| labels    | List of labels to show                                                                                                                                                 | array   | -             |
| ticks     | Points where labels are added in the axis                                                                                                                              | array   | -             |
| length    | Length of the axis                                                                                                                                                     | number  | -             |
| color     | Color for axis and labels                                                                                                                                              | color   | #000          |
| palette   | Color palette for axis and labels:`blues` `bussiness` `sunset`. [See more](CHARTS.md)) **Important**: If the value is not **None**, it will disable `color` attribute. | string  | ' '           |
| animation | Animates the axis if true                                                                                                                                              | boolean | true          |
| dur       | Duration of animation                                                                                                                                                  | number  | 2000          |
| align     | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind**                                               | string  | front         |
| name      | Metric name to show on title label.                                                                                                                                    | string  | -             |

```html
    <a-entity babia-axis-x = 'labels: countries, ticks: calculatedTicks, length: 10, palette: ubuntu,
    align: behind, name: country'></a-entity>
```


### **babia-axis-y component**

This component adds a y axis to the graph.

#### API

| Property  | Description                                                                                                              | Type    | Default value |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ------- | ------------- |
| maxValue  | Maximum value that this axis will show                                                                                   | number  | -             |
| length    | Length of the axis                                                                                                       | number  | -             |
| minSteps  | Minimum number of steps                                                                                                  | number  | 6             |
| color     | Color for axis and labels                                                                                                | color   | #000          |
| animation | Animates the axis if true                                                                                                | boolean | true          |
| dur       | Duration of animation                                                                                                    | number  | 2000          |
| align     | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind** | string  | front         |
| name      | Metric name to show on title label.                                                                                      | string  | -             |

```html
    <a-entity babia-axis-y = 'maxValue: 250, length: 10, color: #fff,
    align: left'></a-entity>
```

### **babia-axis-z component**

This component adds a z axis to the graph.

#### API

| Property  | Description                                                                                                              | Type    | Default value |
| --------- | ------------------------------------------------------------------------------------------------------------------------ | ------- | ------------- |
| labels    | List of labels to show                                                                                                   | array   | -             |
| ticks     | Points where labels are added in the axis                                                                                | array   | -             |
| length    | Length of the axis                                                                                                       | number  | -             |
| color     | Color for axis and labels                                                                                                | color   | #000          |
| palette   | Color palette for axis and labels. **Important**: If the value is not **None**, it will disable `color` attribute.       | string  | ' '           |
| animation | Animates the axis if true                                                                                                | boolean | true          |
| dur       | Duration of animation                                                                                                    | number  | 2000          |
| align     | Sets the position of the labels related to the axis. It accepts the values **right**, **left**, **front** and **behind** | string  | front         |
| name      | Metric name to show on title label.                                                                                      | string  | -             |

```html
    <a-entity babia-axis-z = 'labels: continents, ticks: calculatedTicks, length: 10, palette: pearl,
    align: front, name: continent'></a-entity>
```

### **babia-camera component**

This component built the needed things related to the camera for changing between VR and On-Screen, it adds cursor components and inserts oculus controllers.

#### API

| Property          | Description                                         | Type    | Default value         |
| ----------------- | --------------------------------------------------- | ------- | --------------------- |
| raycasterMouse    | Objects the raycaster can interact with             | string  | .babiaxraycasterclass |
| raycasterHand     | Objects the raycaster can interact with             | string  | .babiaxraycasterclass |
| tipsOpened        | Displays tips about hand controllers                | boolean | true                  |
| triggerRLabel     | Action label for this button                        | string  | Click                 |
| triggerLLabel     | Action label for this button                        | string  | Teleport              |
| gridRLabel        | Action label for this button                        | string  | Open/Close Tips       |
| grigLLabel        | Action label for this button                        | string  | Stop Audio            |
| teleportCollision | Selector of the meshes used to check the collisions | string  | .environmentGround    |

```html
    <a-entity id="head" camera babia-camera="raycasterMouse: .babiaxraycasterclass, #audio_button; raycasterHand: .babiaxraycasterclass, #audio_button" look-controls wasd-controls="fly: false"></a-entity>
```

### **babia-range-selector component**

This component uses the queryes component in order to change the time range in the query (only used in requests). It includes 

#### API

| Property     | Description                                                                                                                                                                                                                                         | Type   | Default value |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------- |
| defaultRange | Default time range in the list, options: `Last 5 years, Last 2 years, Last 1 year, Last 6 months, Last 90 days, Last 60 days, Last 30 days, Last 7 days, Last 24 hours, Last 12 hours, Last 4 hours, Last 1 hour, Last 30 minutes, Last 15 minutes` | string | `Last 1 year` |

```html
    <!-- UI -->
    <a-entity id="interface" babia-range-selector position="3.376 1.072 -3.073" rotation="0 -90 0" scale="0.132 0.132 0.132"></a-entity>
```


### **babia-poster component**

**This component is a soft fork of aframe-dialog-component**: https://github.com/editvr/aframe-dialog-popup-component#readme

| Property         | Description                  | Default Value                |
| ---------------- | ---------------------------- | ---------------------------- |
| title            | String containing title.     | New Dialog                   |
| titleColor       | Text color of title.         | black                        |
| titleFont        | Title font.                  | mozillavr                    |
| titleWrapCount   | Title entity wrap count.     | 24                           |
| body             | String containing body.      | This dialog has no body yet. |
| bodyColor        | Text color of body.          | black                        |
| bodyFont         | Body  font.                  | mozillavr                    |
| bodyWrapCount    | Body entity wrap count.      | 30                           |
| openOn           | Open/Close event.            | click                        |
| active           | Turn dialog on/off.          | true                         |
| openIconImage    | Icon image for open button.  | None                         |
| openIconRadius   | Radius for open icon.        | 0.3                          |
| openIconColor    | Color for open icon.         | white                        |
| closeIconImage   | Icon image for open button.  | None                         |
| closeIconRadius  | Radius for close icon.       | 0.3                          |
| closeIconColor   | Color for close icon.        | white                        |
| image            | Path to Dialog hero image.   | None                         |
| imageWidth       | Dialog hero image width.     | 2                            |
| imageHeight      | Dialog hero image height.    | 2                            |
| dialogBoxWidth   | Dialog box width.            | 4                            |
| dialogBoxHeight  | Dialog box height.           | 4                            |
| dialogBoxColor   | Dialog box background color. | white                        |
| dialogBoxPadding | Dialog box padding.          | 0.2                          |

### **babia-experiment component**

**We recommend to follow [this tutorial](../Tutorials/how_to_prepare_an_experiment.md) for using this component**

| Property                 | Description                                                                  | Type         | Default value      |
| ------------------------ | ---------------------------------------------------------------------------- | ------------ | ------------------ |
| taskTitle                | Title of the task poster                                                     | string       | Default task title |
| taskDescription          | Description of the task poster                                               | string       | Default task text  |
| openTaskImg              | Img of the popup icon of the task poster                                     | string       | -                  |
| closeTaskImg             | Img of the popup icon of the task poster (for closing)                       | string       | -                  |
| timeLimitEnding          | If the experiment last a defined time                                        | boolean      | false              |
| timeLimitTime            | Time that the user has for conducting the experiment                         | seconds      | 300                |
| forceFinishWhenTimeLimit | Force experiment finish when time hiding the charts and downloading the data | boolean      | false              |
| finishButton             | Button to finish the experiment                                              | boolean      | true               |
| recordDelta              | Time delta for recording the position and rotation of the camera             | milliseconds | 3000               |
| recordAudio              | Record audio of the participant with the microphone                          | boolean      | true               |
| taskAudio                | If the task is defined by an audio                                           | boolean      | false              |
| taskAudioUrl             | URL of the mp3 audio for defining the task                                   | string       | -                  |
| taskVideo                | If the task is defined by an video                                           | boolean      | false              |
| taskVideoId              | ID of the asset with the video for defining the task                         | string       | -                  |
| taskVideoWidth           | Width of the video panel                                                     | boolean      | 3                  |
| taskVideoWidth           | Height of the video panel                                                    | boolean      | 1.75               |
| lookat                   | What everything created by this component will follow in rotation            | string       | `[camera]`         |



### **babia-task component**

**We recommend to follow [this tutorial](../Tutorials/how_to_prepare_an_experiment.md) for using this component**

**This component only works when using the babia-experiment component, as a child**

 | Property        | Description                                                                          | Type    | Default value      |
 | --------------- | ------------------------------------------------------------------------------------ | ------- | ------------------ |
 | taskTitle       | Title of the task poster                                                             | string  | Default task title |
 | taskDescription | Description of the task poster                                                       | string  | Default task text  |
 | openTaskImg     | Img of the popup icon of the task poster                                             | string  | -                  |
 | closeTaskImg    | Img of the popup icon of the task poster (for closing)                               | string  | -                  |
 | taskAudio       | If the task is defined by an audio                                                   | boolean | false              |
 | taskAudioUrl    | URL of the mp3 audio for defining the task                                           | string  | -                  |
 | taskVideo       | If the task is defined by an video                                                   | boolean | false              |
 | taskVideoId     | ID of the asset with the video for defining the task                                 | string  | -                  |
 | taskVideoWidth  | Width of the video panel                                                             | boolean | 3                  |
 | taskVideoWidth  | Height of the video panel                                                            | boolean | 1.75               |
 | offsetX         | Offset in the X axis for positioning the task (useful when more than one babia-task) | number  | 0                  |
 | lookat          | What everything created by this component will follow in rotation                    | string  | `[camera]`         |

### **babia-html component**

**This component shows the DOM structure rendered in 3D**

 | Property       | Description                                                                                                                                                                                                                              | Type    | Default value |
 | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
 | html           | HTML stringified to represent in 3D                                                                                                                                                                                                      | string  | ''            |
 | distanceLevels | Distance between children levels                                                                                                                                                                                                         | float   | 0.7           |
 | renderHTML     | If you want to render as a texture the HTML of each item. **IMPORTANT: You need to add into your html the `html2canvas` dependency `<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>` | boolean | false         |
