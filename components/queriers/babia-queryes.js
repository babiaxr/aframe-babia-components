let parseJson = require('../others/common').parseJson;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-queryes', {
    schema: {
        elasticsearch_url: { type: 'string' },
        index: { type: 'string' },
        query: { type: 'string' },
        size: { type: 'int', default: 10 },
        request: { type: 'string' },
        user: { type: 'string' },
        password: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' },
        // ONLY BARS
        tableBars: { type: 'boolean', default: false },
        rangeSelector: { type: 'string'}
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        // Buffer for setting the data obtained and notifying consumers
        this.notiBuffer = new NotiBuffer();
        this.tableBars = this.data.tableBars;
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        this.oldData = oldData;
        let notiData = ''
        if (this.data.rangeSelector){
            let prodElement = document.getElementById(this.data.rangeSelector);
            if (prodElement.components['babia-range-selector']) {
                this.prodComponent = prodElement.components['babia-range-selector']
            } 
            if (this.prodComponent.notiBuffer) {
                this.notiBufferId = this.prodComponent.notiBuffer
                    .register(this.updateQuerier.bind(this))
                notiData = this.prodComponent.notiBuffer.data;
            }
        }
        this.updateQuerier(notiData)
    },

    updateQuerier: function (received){
        let data = this.data;
        let oldData = this.oldData;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            let _data = parseJson(data.data)
            this.notiBuffer.set(_data);
        } else {
            if (data.elasticsearch_url !== oldData.elasticsearch_url ||
                data.index !== oldData.index ||
                data.query !== oldData.query ||
                data.size !== oldData.size) {
                if (data.elasticsearch_url && data.index) {
                    this.getJSON(data, received);
                } else {
                    console.error("elasicsearch_url and index must be defined")
                    return
                }
            } else if (received) {
                this.getJSON(data, received);
            }
        }
    },

    getJSON: async function (data, received) {
        let url;
        let response;

        if (data.size && data.query) {
            url = `${data.elasticsearch_url}/${data.index}/_search?size=${data.size}&${data.query}`;
            if (data.user && data.password) {
                let headers = new Headers();
                headers.append('Authorization', 'Basic ' + btoa(data.user + ':' + data.password));
                response = await fetch(url, { headers: headers })
            } else {
                response = await fetch(url);
            }
        } else if (data.request) {
            url = `${data.elasticsearch_url}/${data.index}/_search`;
            // Get request body
            let request = await fetch(data.request);
            if (request.status == 200) {
                this.json = await request.json();
                // TODO: Throw error if json is not in the right format
                this.json = parseJson(this.json);
                // Modify the request with new range
                if (received){
                    // range index
                    let index
                    for (let i = 0; i < this.json['query']['bool']['must'].length; i++){
                        if (this.json['query']['bool']['must'][i]['range']){
                            index = i;
                        }
                    }
                    let range = this.json['query']['bool']['must'][index]['range'][Object.keys(this.json['query']['bool']['must'][index]['range'])[0]]
                    range['gte'] = received.from;
                    range['lte'] = received.to;

                    // Interval para date_histograms
                    if (this.json['aggs']['2']){
                        if(this.json['aggs']['2']['date_histogram']){
                            this.json['aggs']['2']['date_histogram']['interval'] = received.interval
                        }
                    }
                }
            } else {
                throw new Error(request.status);
            }
            //console.log(this.json['aggs'])
            if (data.user && data.password) {
                response = await fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Authorization': 'Basic ' + btoa(data.user + ':' + data.password),
                    },
                    body: JSON.stringify(this.json)
                });
            } else {
                response = await fetch(url, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify(this.json)
                });
            }
            
        }
        if (response.status == 200) {
            let json = await response.json();
            //console.log(json);
            json = this.parseDataES(json);
            // TODO: throw error if json is not in the right format
            this.notiBuffer.set(json);
            return;
        }
        throw new Error(response.status);
    },

    parseDataES: function (data) {
        let save = []
        console.log('REQUEST:', this.json);
        console.log('REPLY:', data)
        let aggs = Object.keys(data.aggregations)
        if (this.json['aggs'] && aggs.length == 1 && !this.json['aggs'][aggs[0]]['aggs']) {
            data = data.aggregations[aggs[0]].buckets
            for (let i = 0; i < data.length; i++) {
                save.push(data[i])
            }
        } else if (this.json['aggs'] && aggs.length == 1 && this.json['aggs'][aggs[0]]['aggs']) {
            data = data.aggregations[aggs[0]].buckets
            for (let i = 0; i < data.length; i++) {
                //console.log(data[0][Object.keys(data[0])[0]].buckets.length)
                if (data[0][Object.keys(data[0])[0]].values) {
                    save.push({
                        key_as_string: data[i].key_as_string,
                        key: data[i].key,
                        doc_count: data[i].doc_count,
                        value: data[i][Object.keys(data[0])[0]].values[0].value
                    })
                } else if (data[0][Object.keys(data[0])[0]].value && data[0][Object.keys(data[0])[0]].length == 1) {
                    save.push({
                        key_as_string: data[i].key_as_string,
                        key: data[i].key,
                        doc_count: data[i].doc_count,
                        value: data[i][Object.keys(data[0])[0]].value
                    })
                } else if (data[0][Object.keys(data[0])[0]].buckets && data[0][Object.keys(data[0])[0]].buckets.length > 0) {
                    for (let j = 0; j < data[i][Object.keys(data[0])[0]].buckets.length; j++) {
                        save.push({
                            key_as_string: data[i].key_as_string,
                            key: data[i][Object.keys(data[0])[0]].buckets[j].key,
                            count: data[i][Object.keys(data[0])[0]].buckets[j].doc_count,
                            doc_count: data[i].doc_count,
                            value: data[i][Object.keys(data[0])[0]].value
                        })
                    }
                } else if (Object.keys(data[0]).length > 1) {
                    if (this.tableBars == true) {
                        // ONLY FROM TABLE TO BARS
                        save.push({
                            key_as_string: aggs[0],
                            key: data[i].key,
                            value: data[i].doc_count
                        })
                        for (let j = 0; j < Object.keys(data[0]).length; j++) {
                            if (data[i][Object.keys(data[0])[j]].value) {
                                save.push({
                                    key_as_string: Object.keys(data[0])[j],
                                    key: data[i].key,
                                    value: data[i][Object.keys(data[0])[j]].value
                                })
                            }
                        }
                    } else {
                        // DEFAULT TABLE
                        let element = {
                            key: data[i].key,
                            value: data[i].doc_count
                        };
                        if (data[i].key_as_string) {
                            element['key_as_string'] = data[i].key_as_string;
                        } else {
                            element['key_as_string'] = aggs[0];
                        }
                        for (let j = 0; j < Object.keys(data[0]).length; j++) {
                            if (data[i][Object.keys(data[0])[j]].value) {
                                element[Object.keys(data[0])[j]] = data[i][Object.keys(data[0])[j]].value;
                            }
                        }
                        if (data[0][Object.keys(data[0])[0]].buckets) {
                            for (let j = 0; j < Object.keys(data[0][Object.keys(data[0])[0]].buckets).length; j++) {
                                //console.log(Object.keys(data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]])[0])
                                if (data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]][Object.keys(data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]])[0]].value) {
                                    element[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]] = data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]][Object.keys(data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]])[0]].value;
                                } else {
                                    element[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]] = data[i][Object.keys(data[i])[0]].buckets[Object.keys(data[i][Object.keys(data[i])[0]].buckets)[j]].doc_count;
                                }
                            }
                        }
                        save.push(element);
                    }
                } else {
                    save.push({
                        key_as_string: data[i].key_as_string,
                        key: data[i].key,
                        doc_count: data[i].doc_count
                    })
                }
            }
        } else {
            data = data.hits.hits;
            for (let i = 0; i < data.length; i++) {
                save[i] = data[i]._source
            }
        }
        //console.log(save)
        return save
    }
})