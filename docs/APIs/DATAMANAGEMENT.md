
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