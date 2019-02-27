# Aframe-visdata-components

Components for A-frame that allows to make visualization from different datasources.

```
Image of Demo soon
```


## Usage

#### Browser Installation

Install and use by directly including the [browser files](dist):

```
soon
```

#### NPM Installation

Install via NPM:

```
soon
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
| width            | Field of the data selected by visdata that will be mapped as the width of the geometry.  | string | - |
| depth        | Field of the data selected by visdata that will be mapped as the depth of the geometry. | string   | - |
| height        | Field of the data selected by visdata that will be mapped as the height of the geometry. | string   | - |


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