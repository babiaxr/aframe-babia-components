---
#date: 2020-06-19T12:58:28+02:00
linktitle: datamanagement-api
title: Data management components API
draft: false
weight: 50
categories: [ "Components", "Documentation" ]
tags: ["api", "data format", "demo"]
---


## Data managements APIs

### babia-filter component

This component must be used with one of the `babia-query` components. This component will select a part of the data retrieved (by a key/filter) in order to represent just that part of the data. If the filter is not defined, it will retrieve all the data.
This component will put the data selected into the `babiaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from            | Id of one of the querier components  | string | - |
| filter (Optional)        | Key of the item that you want to analyse, this key must be in the data retrieved from a querier. (ex. `name=David`) | string   | - |

### babia-treebuilder component

This component must be used with one of the `babia-query` or `babia-filter` components. This component will build a tree data format for some charts of babia

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from            | Id of one of the querier/filter components  | string | - |
| field | Field of the data that will define the tree | string   | - |
| split_by | Character that will be used for split the field selected of the data, building a tree (i.e `split_by="/"` ) | char   | - |


### babia-selector component

This component must be used with one of the `babia-query` components. This component works like a filter but changing over time.

By selecting a property to filter the data (for example, by date), it will be sorted and displayed on the visualizer every X seconds. 

You need the `babia-navigator` to manage the progress.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| from            | Id of one of the querier components  | string | - |
| controller           | Id of one of the navigator component  | string | - |
| select            | Field to filter data  | string | `date` |
| timeout            | Time between points of time in seconds  | number | 6000 |
| data          | Embedded data to filter. **Important**: Using this attribute will disable the `from` attribute.  | JSON (list of objects) | - |
| current_value          | Current value of the time evolution **Important**: This attribute allows to the timeline to start at any point desired. It is also important for the syncronization in multiuser mode. | number | -2 |
| speed | Speed of the time evolution | number | 0 |
| step | Step of the time evolution | number | 0 |
| direction | Direction of the time evolution (`forward` or `rewind`). If is empty or it gets a different value, it behaves like `forward` | string | `forward`
| state | State of the time evolution (`play` or `pause`). If is empty or it gets a different value, it behaves like `play` | string | `play`

**NOTE:** You can use multiple visualizers with the same selector component. Only indicating its id in `from` of any visualizer. All of them will be managed by the same navigator component.

**IMPORTANT:** If you use this component with other filters, the correct order is: `Querier > Filters > Selector`. For `babia-boats` you need treebuilder component too, so the order is: `Querier > Filters > Selector > Treebuilder`. Not following this order can not work.

**IMPORTANT:** In order to activate multiuser mode for selector and navigator, remember to add `network` component before `babia-selector` component in the entity. Navigator does not need to be syncronized.
