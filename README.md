# Aframe-visdata-components

[![Version](http://img.shields.io/npm/v/aframe-visdata-components.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-components)
[![License](http://img.shields.io/npm/l/aframe-visdata-components.svg?style=flat-square)](https://npmjs.org/package/aframe-visdata-components)

Data visualization components for A-Frame.

![example](https://i.imgur.com/COMKAbj.png)

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
</head>

<body>

    <a-scene background="color: #A8F3FF" id="AframeScene">
        <a-light type="point" intensity="1" position="-10 20 30"></a-light>

        <a-entity id="queriertest" querier_github="user: dlumbrer; repos: kbn_network, VBoard, kbn_searchtables"></a-entity>

        <a-entity geometry="primitive: box;" material="color:navy;" position="0 0 0" visdata='from: queriertest; index: kbn_network'
            vismapper="width: open_issues; depth: open_issues; height: size"></a-entity>
        <a-entity geometry="primitive: box;" material="color:red;" position="50 0 0" visdata='from: queriertest; index: VBoard'
            vismapper="width: open_issues; depth: open_issues; height: size"></a-entity>
        <a-entity geometry="primitive: box;" material="color:green;" position="-50 0 0" visdata='from: queriertest; index: kbn_searchtables'
            vismapper="width: open_issues; depth: open_issues; height: size"></a-entity>


        <a-entity movement-controls="fly: true" position="-3 5 20">
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

# or

import 'aframe'
import 'aframe-visdata-components'
```

## Components

The installation contains the following components:

### querier_json component

Component that will retrieve data from a JSON input that can be defined as an url or directly embedded.

This component will put the data retrieved into the `dataEntity` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ------ |
| url             | Url of the file with the JSON data  | string | - |
| embedded        | JSON data directly stringified in the property | string   | - |


### querier_github component

Component that will retrieve data related to the repositories from an user using the GitHub API. It can be defined the username in order to get info about all the repositories or also it can be defined an array of repos in order to analyse just them (instead of all).

This component will put the data retrieved into the `dataEntity` attribute of the entity.


#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| user            | GitHub username  | string | - |
| repos        | List of repo that you want to analyse | array   | (If empty it will retrieve all the repos of the user) |


### visdata component

This component must be used with one of the `querier` components. This component will select a part of the data retrieved (by a key/index) in order to represent just that part of the data. It is neccesary to select the key of the dataset returned from the querier.

This component will put the data selected into the `dataEntity` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from            | Id of one of the querier components  | string | - |
| index        | Key of the item that you want to analyse, this key must be in the data retrieved from a querier | string   | - |


### vismapper component

This component map the data selected by the `visdata` component into physical properties of a geometry component.

This component must be in the same entity than visdata.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| width            | Field of the data selected by visdata that will be mapped as the width of the geometry (only for box).  | string | - |
| depth        | Field of the data selected by visdata that will be mapped as the depth of the geometry (only for box). | string   | - |
| height        | Field of the data selected by visdata that will be mapped as the height of the geometry . | string   | - |
| radius        | Field of the data selected by visdata that will be mapped as the radius of the geometry (only for sphere). | string   | - |


### debug_data component

This component force the entity to hear an event, when this event occurs, a debug plane with the data of the `dataEntity` entity attribute will appear in the position (or close) of the entity that it belongs.

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

The dataset returned from the parsing of the `querier` component has this model:

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



## Examples

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>A-Frame Visdata components</title>
    <meta name="description" content="Bubble example for A-Charts component." />
    <script src="https://aframe.io/releases/0.9.0/aframe.min.js"></script>
    <script src="//cdn.rawgit.com/donmccurdy/aframe-extras/v5.0.0/dist/aframe-extras.min.js"></script>
    <script src="https://rawgit.com/feiss/aframe-environment-component/master/dist/aframe-environment-component.min.js"></script>
    <script src="https://glcdn.githack.com/barataria/aframe-visdata-components/raw/master/dist/aframe-visdata-components.js"></script>
    <script type="text/javascript" src="aframe-components-city.js"></script>
</head>

<body>

    <a-scene background="color: #A8F3FF" id="AframeScene">
        <a-entity environment></a-entity>
        <a-light type="point" intensity="1" position="-10 20 30"></a-light>

        <a-entity id="queriertest" querier_json='embedded: { "kbn_network": {
            "id": 62662964,
            "node_id": "MDEwOlJlcG9zaXRvcnk2MjY2Mjk2NA==",
            "name": "kbn_network",
            "full_name": "dlumbrer/kbn_network",
            "private": false,
            "created_at": "2016-07-05T19:16:45Z",
            "updated_at": "2019-02-20T14:22:24Z",
            "pushed_at": "2019-01-06T19:35:06Z",
            "size": 10608,
            "stargazers_count": 232,
            "watchers_count": 232,
            "language": "JavaScript",
            "has_issues": true,
            "has_projects": true,
            "has_downloads": true,
            "has_wiki": true,
            "has_pages": true,
            "forks_count": 62,
            "mirror_url": null,
            "archived": false,
            "open_issues_count": 14,
            "forks": 62,
            "open_issues": 14,
            "watchers": 232
          },
          "kbn_dotplot": {
            "id": 100473664,
            "node_id": "MDEwOlJlcG9zaXRvcnkxMDA0NzM2NjQ=",
            "name": "kbn_dotplot",
            "full_name": "dlumbrer/kbn_dotplot",
            "private": false,
            "created_at": "2017-08-16T09:41:01Z",
            "updated_at": "2019-02-19T08:55:38Z",
            "pushed_at": "2018-11-16T11:44:47Z",
            "homepage": null,
            "size": 28044,
            "stargazers_count": 14,
            "watchers_count": 14,
            "language": "JavaScript",
            "has_issues": true,
            "has_projects": true,
            "has_downloads": true,
            "has_wiki": true,
            "has_pages": false,
            "forks_count": 9,
            "mirror_url": null,
            "archived": false,
            "open_issues_count": 3,
            "forks": 9,
            "open_issues": 3,
            "watchers": 14
          },
          "kbn_searchtables": {
            "id": 92531387,
            "node_id": "MDEwOlJlcG9zaXRvcnk5MjUzMTM4Nw==",
            "name": "kbn_searchtables",
            "full_name": "dlumbrer/kbn_searchtables",
            "private": false,
            "fork": false,
            "created_at": "2017-05-26T16:59:04Z",
            "updated_at": "2019-02-13T23:05:10Z",
            "pushed_at": "2019-01-14T15:34:58Z",
            "homepage": "",
            "size": 60186,
            "stargazers_count": 41,
            "watchers_count": 41,
            "language": "JavaScript",
            "has_issues": true,
            "has_projects": true,
            "has_downloads": true,
            "has_wiki": true,
            "has_pages": false,
            "forks_count": 13,
            "mirror_url": null,
            "archived": false,
            "open_issues_count": 10,
            "forks": 13,
            "open_issues": 10,
            "watchers": 41
          }
        }' position="-3 5 5"></a-entity>

        <a-entity layout="type: box; columns: 3; margin: 30; align: center">
            <a-entity>
                <a-entity geometry="primitive: box;" material="color:navy;" visdata='from: queriertest; index: kbn_searchtables'
                    vismapper="width: open_issues; depth: open_issues; height: size" interaction-mapper='input: mouseenter; output: debugevent'
                    debug_data='inputEvent: debugevent'></a-entity>
            </a-entity>
            <a-entity>
                <a-entity geometry="primitive: box;" material="color:red;" visdata='from: queriertest; index: kbn_dotplot'
                    vismapper="width: open_issues; depth: open_issues; height: size" interaction-mapper='input: mouseenter; output: debugevent'
                    debug_data='inputEvent: debugevent'></a-entity>
            </a-entity>
            <a-entity>

                <a-entity geometry="primitive: box;" material="color:green;" visdata='from: queriertest; index: kbn_network'
                    vismapper="width: open_issues; depth: open_issues; height: size" interaction-mapper='input: mouseenter; output: debugevent'
                    debug_data='inputEvent: debugevent'></a-entity>
            </a-entity>
        </a-entity>


        <a-entity movement-controls="fly: true" position="-3 5 20">
            <a-entity camera position="0 0 0" look-controls></a-entity>
            <a-entity cursor="rayOrigin:mouse"></a-entity>
            <a-entity laser-controls="hand: right"></a-entity>
        </a-entity>

    </a-scene>

</body>
</>
```

![example](https://i.imgur.com/COMKAbj.png)
