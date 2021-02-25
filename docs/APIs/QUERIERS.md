## Querier components API

### babia-queryes component

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

### babia-queryjson component

Component that will retrieve data from a JSON input that can be defined as an url or directly embedded.

This component will put the data retrieved into the `babiaData` attribute of the entity.

#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ------ |
| url             | Url of the file with the JSON data  | string | - |
| embedded        | JSON data directly stringified in the property | string   | - |


### babia-querygithub component

Component that will retrieve data related to the repositories from an user using the GitHub API. It can be defined the username in order to get info about all the repositories or also it can be defined an array of repos in order to analyse just them (instead of all).

This component will put the data retrieved into the `babiaData` attribute of the entity.


#### API

| Property        | Description           | Type   | Default value |
| --------        | -----------           | ----   | ----- |
| user            | GitHub username  | string | - |
| repos        | List of repo that you want to analyse | array   | (If empty it will retrieve all the repos of the user) |