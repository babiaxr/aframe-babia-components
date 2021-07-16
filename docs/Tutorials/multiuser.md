---
linktitle: "multiuser"
date: 2021-06-07T20:51:00+02:00
title: Multiuser
draft: false
categories: [ "Tutorials", "Documentation" ]
tags: ["api", "networked", "guide", "multiuser", "syncronization", "webrtc"]
---

# Multiuser Scenes

In order to create a multiuser scene, where two or more users can join and share entities, messages and other information (like everyone's location on scene,  for example) there are some basic and necessary steps to follow, as well as some options to customize the scene and get the desired behaviour. In this tutorial, we will cover the basic steps, as well as some of the most useful options.

## Deploying a WebRTC Server (Optional)

It is needed a WebRTC Server for sharing information, you can connect to an existing one or the next guide provides the necessary steps to deploy one.

[Deploying a WebRTC (easyrtc) server for using the multiuser feature](/tutorials/deploy_webrtc_server/)

> Markdown file on repo: https://gitlab.com/babiaxr/aframe-babia-components/-/blob/master/docs/Tutorials/deploy_webrtc_server.md

Once you have access to the WebRTC server, you will have to remember the url to connect to it, since it will be needed in the next step.


## Imports

Once we start writing the html, the first thing to do is to import the necessary .js of socket.io and easyrtc, and finally import the networked-aframe component.

```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.slim.js"></script>
    <script src="./easyrtc.js"></script>
    <script src="https://unpkg.com/networked-aframe@^0.8.0/dist/networked-aframe.js"></script>
```

>Note: It is important to add the socket.io file before the easyrtc file.

## Scene

Then we have to create a scene and attach the **networked-scene** component to it. In this component is where you have to define the WebRTC server url WebRTC, as well as a server adapter, an app, a room, if there is audio or/and video...

```html
<a-scene id="AframeScene" networked-scene="
  room: room_1;
  adapter: easyrtc;
  debug: true;
  audio: true;
  serverURL: my_url;
">
```

* We see that the app chosen is the default (since it is not specified), while the **room** is specified to be 'room_1'. If a user that is in a different scene wants to be syncronized with this scene, he must join this same room and default app.
* The **adapter** chosen is easyrtc, since we are going to be working with this kind of WebRTC server. This adapter allows sharing audio between users, so we can set **audio** to true in order to use it.
* **Debug** is set to true to be able to follow the behaviour of the component.
* In **serverURL** is where we add the url of the WebRTC server we have launched.


## Templates
Once we have our scene, we can start adding the entities inside of it. But first, we need to create a template for every entity that we want to syncronize. 

Every template needs an id, in order to use it later. Inside the template, we add the entity that is going to be syncronized, but there is no need to add here the components nor the attributes that will be added later on.

```html
<template id="box-template">
   <a-box class="box"></a-box>
</template>
```
>Note: Both the creator and receiver of entities must add these templates. For example, if we have a scene where an entity is created and shared, and another scene where this entity
is retrieved and shown, we need to add the template in both scenes.

## Entities
Once we have the templates, we can create the entities. In order to make them syncronizable, we add the networked component to them, setting the template property to be the id of the proper template.

```html
<a-box id="box" color="#3C78D8" networked="template:#box-template; (... other properties...)" position="-7 1 5" rotation="0 -45 0"></a-box>
```

>Note: It is important to take into account that, **for a child entity to be syncronized, the parent has to be syncronized** as well.

## Schema

In networked-aframe position and rotation attributes are automatically syncronized.
To syncronized other attributes or componentes, we define them in a schema, associated with the template by its id.

```javascript
NAF.schemas.add({ 
    template: '#box-template', 
    components: [ 
        'position', 
        'rotation', 
        'color 
] });
```

In this example, we are going to syncronice the color of the box as well.

## Types of entities in a networked scene

### **Not persistent syncronized entities** 

If what we want to create is an avatar for each of the users that join the scene, so that each user can use it to move around and others can see it, we are looking for an entity that has the networked component persistence attribute set to false (default value). This means that every client will create its own instance of the entity, while adding all the instances created by other clients to their own scene.

Therefore, each entity is syncronized with its own representation in other clients screens but not with every instance of the entity created by others. 

If a not persistent entity has no movement animation and two clients are in the same scene, they will see both entities (their own and the other's) in the same space, not being able to differenciate them.

If a client leaves the scene, all his not persistent entities will disappear with him.

#### **attachTemplateToLocal attribute**

By default, this attribute is set to true. If we want the local networked entity to have a different hierarchy from the instances in other client's scenes, we can set this attribute to false and this will avoid the template attaching to the local entity. This way, the template will only be used to show other client's entities and not to create our own.

When this is used, we must make sure that the child elements that are networked as well appear both in the template and in the entity creation.

```html
<a-text id="username-tag" position="-0.5 2 0" width="5" color="black" value="Light Blue Player" networked="template:#username-tag-template; attachTemplateToLocal:false"></a-text>
```

### **Persistent syncronized entities** 

If what we are looking for is an entity that will be syncronized between all clients, so that in every scene opened everyone sees the exact same behaviour and entities are not instanciated in each one of the scenes, what we want is an entity with the networked component  persistence set to true.

#### **persistent attribute**
When this attribute is true, it means that there will only be one instance of the entity for all clients connected. When a new client connects, the entity will not be duplicated, so it will be totally syncronized and updated with the current state in the new client's scene.

#### **owner attribute**

Persistent entities will have just one owner in every moment, that will be able to interact with them, while the others will see the effect but will not be able to interact until they take the ownership.
 
In the documentation, when these entities are created, their owner is always the 'scene', in order to avoid any conflicts, but this could be modified to try different effects (maybe setting the first client to be the owner). This way, to interact with the entity, clients must take the ownership.

When a client that is owner of an entity leaves the scene, the ownership is transfered to the next client, so the entity and its state are kept and the entity won't dissapear.

#### **networkId attribute**
We add a networkId to entities to differenciate between entities that use the same template and are persistent. For example, we could define one template for graph user interfaces and reuse it for every graph but with a different networkId.

```html
<a-box id="box" color="#3C78D8" position="-7 1 5" rotation="0 -45 0" networked="template:#box-template; networkId:box; persistent: true; owner: scene" ></a-box>
```

### **Not networked entities**

If we have some entities inside a networked scene that we do not want to share, this is also possible. We simply will not add networked component to them, neither will we create their template or schema. They will be used in the normal way, and every client will only see its own entities.

This could be useful if we want to add a button that controls something related only to our own client, for example, a button that turns on or off the audio channel or a button that subscribes or unsubscribes the client to the data channel.

```html
<a-plane id="audio_button" position="-5 1 5" rotation="0 45 0" height="0.5" width="1.5" color="#E44B00">
    <a-text id="audio_label" value="Stop Audio" color="#0582B5" width="4" position="-0.5 0 0" rotation="0 0 0"></a-text>
</a-plane>
```

## Special cases

### Special case 1: **avatar, camera and rig**

To syncronize the avatar that is inside our camera component, we first have to syncronize the entity "rig" that contains the camera, cursor and hands. For that we simply just add position and rotation to the "rig-template" schema and the "camera-template" schema. Then we add all needed attributes to "avatar-template" schema. In this case, we are going to create a different template and schema for the parents and the children.

In this case, we do not want the entities to be persistent, since we would like to have an entity per client connected.



```html
<!-- Templates -->
    <template id="rig-template">
        <a-entity class="rig"></a-entity>
    </template>
    <template id="camera-template">
        <a-entity class="camera"></a-entity>
    </template>
    <template id="avatar-template">
        <a-entity class="avatar" networked-audio-source></a-entity>
    </template>


<!-- ENTITIES -->
<!-- Rig entity -->
<a-entity id="rig" position="0 0.5 -7"      networked="template:#rig-template; attachTemplateToLocal:false">
    <!-- Camera entity -->
    <a-entity id="camera" camera look-controls wasd-controls="fly: false"
    networked="template:#camera-template;attachTemplateToLocal:false;">
        <!-- Avatar entity -->
        <a-entity id="avatar" scale="0.1 0.1 0.1" gltf-model="#dinosaur" visible="false" rotation="0 180 0" networked="template:#avatar-template; attachTemplateToLocal:false">
        </a-entity>
    </a-entity>
    <!-- Hand Controls -->
    <a-entity id="leftHand" oculus-touch-controls="hand: left" teleport-controls="cameraRig: #rig; teleportOrigin: #avatar;  collisionEntities: #environmentGround;hitCylinderColor: #ff3468; curveHitColor: #ff3468; curveMissColor: #333333; curveLineWidth: 0.01; button: trigger"></a-entity>
    <a-entity id="rightHand" laser-controls="hand: right" oculus-touch-controls="hand: right" raycaster="objects: .babiaxraycasterclass"></a-entity>
    <a-entity id="cursor" cursor="rayOrigin:mouse" raycaster="objects: .babiaxraycasterclass"></a-entity>
</a-entity>

```
```javascript
/* SCHEMAS*/
NAF.schemas.add({
    template: '#rig-template',
    components: [
        'position',
        'rotation'
    ]
});

NAF.schemas.add({
    template: '#camera-template',
    components: [
        'position',
        'rotation'
    ]
});

NAF.schemas.add({
    template: '#avatar-template',
    components: [
        'position',
        'rotation',
        'scale',
        'gltf-model'
    ]
});

```


### Special case 2: **avatar**

Imagine we have an avatar created around us, right where we are, so that when we move around the scene, everybody sees us. If this avatar is pretty big, we would not be able to see through it, since the camera would be right in the middle of its body. In this case we probably want it to not be visible, so we can set the visible attribute to "false" and not add it to the schema. This way we would not see our own avatar, but everyone else will se it.

```html
<a-entity id="avatar" scale="0.1 0.1 0.1" gltf-model="#dinosaur" visible="false" rotation="0 180 0" networked="template:#avatar-template;attachTemplateToLocal:false">
```

### Special case 3: **babia graphs**

In order to syncronize any babia graph, we have to add it to the schema of the entity that contains it.

In this case, we want a persistent entity, that does not duplicate entities when new clients connect.

```html
<!-- TEMPLATE -->
<template id="bars-template">
    <a-entity class="bars"></a-entity>
</template>

<!-- ENTITY -->
<a-entity id="bars" babia-bars='index: country; height: partial; legend: true; axis: true; palette: foxy; heightMax: 100; animation: true; from: querierData' networked="template:#bars-template; networkId:bars; persistent: true; owner: scene" position="-10 1 -15" rotation="0 0 0" scale="0.5 1 0.5"></a-entity>
```
```javascript
/* SCHEMA */
NAF.schemas.add({
    template: '#bars-template',
    components: [
        'position',
        'rotation',
        'scale',
        'babia-bars'
    ]
});
```

### Special case 4: **babia querier**

If we are using a querier to get the data it needs to be syncronized as well, so we need to add it to the schema of the entity that contains it.

In this case, we want a persistent entity, that does not duplicate entities when new clients connect.

```html
<!-- TEMPLATE -->
<template id="querier-template">
    <a-entity class="querier"></a-entity>
</template>

<!-- ENTITY -->
<a-entity id="querierData" babia-queryjson="url: ./data.json;" networked="template:#querier-template; networkId:querier; persistent: true; owner: scene"></a-entity>
```

```javascript
/* SCHEMA */
NAF.schemas.add({
    template: '#querier-template',
    components: [
        'babia-queryjson'
    ]
})
```

### Special case 5: **babia ui**

If we have an ui for a graph, when we interact with it, we have to ask ffor the ownership of the graph:

```javascript
ui.addEventListener('click', function (event){
    if (!NAF.utils.isMine(graph)) {
        NAF.utils.takeOwnership(graph);
    }
});
```
When we enter VR and this ui goes to our hand, we are creating a new entity for the ui, and therefore we have to add the eventListener one more time:

```javascript
scene.addEventListener('child-attached', function (event) {
    if (event.detail.el.id === 'babia-menu-hand') {
        event.target.children["babia-menu-hand"]);
        let uiVR = document.querySelector('#babia-menu-hand');
        uiVR.addEventListener('click', function (event) {
            if (!NAF.utils.isMine(graph)) {
                NAF.utils.takeOwnership(graph);
            };
        });
    }
});

```

## Audio

In order to work with positional audio, we have to associate the source of audio to an entity, so we add the networked-audio-source component to the entity we desire.

```html
 <a-sphere id="avatar" camera color="#66FFFF" position="0 1 0" scale="0.45 0.5 0.4" look-controls networked-audio-source networked="template:#avatar-template;attachTemplateToLocal:false;"></a-sphere>
```

>Note: The networked-audio component does not need to be added to the schema.

## Send and receive data
It is possible to send data between clients or to broadcast data to all clients using networked-aframe. In order to receive this data, you have to suscribe to the channel.

### Send data to specific client

To send data to just one specific client, we need its id, to pass it to the sendData or sendDataGuaranteed networked-aframe (NAF)functions. The parameter dataType is a string that defines the data we are sending, allowing the receiver to filter what it is receiving.

```javascript
clientId = client_id;
dataType = "hello_message";
data = "Welcome to the room!!";
NAF.connection.sendDataGuaranteed(clientId, dataType, data);
```

### Broadcast data to everyone

To broadcast data to everyone that is connected, we will just pass the data and the dataType parameters to the broadcastData or broadcastDataGuaranteed NAF functions.

```javascript
dataType = "hello_message";
data = "Hello everyone!!";
NAF.connection.broadcastDataGuaranteed(dataType, data)
```

### Subscribe to channel to receive data

In order to receive data by the NAF channel, we need to subscribe to a channel per every dataType that we want to listen to.

```javascript
NAF.connection.subscribeToDataChannel('hello_message', function (senderId, dataType, data, targetId) {
    console.log('Hello message received: ', data)
}
```
 
## Events
For every important moment in the networked scene, an event is triggered. This way we can know when the ownership is transfered (and the current and old owners), when a new client is connected, when we are connected...

```javascript
// Our scene has connected to WebRTC server
document.body.addEventListener('connected', function (event) {
    console.log('connected event. clientId = ', event.detail.clientId);        
});

// Other client has connected to our WebRTC server
document.body.addEventListener('clientConnected', function (event) {
    console.log('clientConnected event. clientId = ', event.detail.clientId);
});

// Other client has been disconnected
document.body.addEventListener('clientDisconnected', function (event) {
    console.log('clientDisconnected event. clientId = ', event.detail.clientId);
});
```

In the same way, there are many events that are triggered when the states of the networked change, for example, when the ownership changes.

```javascript
// We have obtained the ownership of the box
box.addEventListener('ownership-gained', e => {
    console.log("Box ownership gained, old Owner:", e.detail.oldOwner)
});

// We have lost the ownership of the box
box.addEventListener('ownership-lost', e => {
    console.log("Box ownership lost")
});
```
