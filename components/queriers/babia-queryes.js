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
        request: {type: 'string'},
        user: { type: 'string' },
        password: { type: 'string' },
        // data, for debugging, highest priority
        data: { type: 'string' }
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
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            //parseEmbeddedJSONData(data.data, el, self)
            let _data = parseJson(data.data)
            this.notiBuffer.set(_data);
        } else {
            if (data.elasticsearch_url !== oldData.elasticsearch_url ||
                data.index !== oldData.index ||
                data.query !== oldData.query ||
                data.size !== oldData.size) {
                if (data.elasticsearch_url && data.index) {
                    this.getJSON(data);
                } else {
                    console.error("elasicsearch_url and index must be defined")
                    return
                }
            }
        }
    },

    getJSON: async function(data) {
        let url;
        let response;
        if (data.size && data.query){
            url = `${data.elasticsearch_url}/${data.index}/_search?size=${data.size}&${data.query}`;
            response = await fetch(url);
        } else if (data.request) {
            url = `${data.elasticsearch_url}/${data.index}/_search`;
            // Get request body
            let request = await fetch(data.request);
            let json;
            if (request.status == 200) {
                json = await request.json();
                // TODO: Throw error if json is not in the right format
                json = parseJson(json);
            } else {
                throw new Error(request.status);
            }
            console.log(json['aggs'])
            response = await fetch(url , {
                method: 'POST',
                mode: 'cors',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(json)
            });
        } 
        if (response.status == 200) {
            let json = await response.json();
            console.log(json);
            json = this.parseDataES(json);
            // TODO: throw error if json is not in the right format
            this.notiBuffer.set(json);
            return;
        } 
        throw new Error(response.status);
    },

    parseDataES: function(data) {
        data = data.hits.hits;
        let save = []
        for (let i = 0; i < data.length; i++) {
            save[i] = data[i]._source
        }
        return save
    }
})