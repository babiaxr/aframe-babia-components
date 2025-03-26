let findProdComponent = require('../others/common').findProdComponent;
let parseJson = require('../others/common').parseJson;
const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-treebuilder', {
    schema: {
        from: { type: 'string' },
        field: { type: 'string' },
        split_by: { type: 'string', default: '/' },
        // Build a root node, hanging all the tree from it
        build_root: { type: 'boolean', default: false},
        // Name of the root node, if build_root
        root_name: { type: 'string' , default: 'Main'},
        // data, for debugging, highest priority
        data: { type: 'string' }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
     * Producer component
     */
    prodComponent: undefined,

    /**
     * NotiBuffer identifier
     */
    notiBufferId: undefined,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        this.notiBuffer = new NotiBuffer();
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        if (data.data && (oldData.data !== data.data || data.field !== oldData.field || data.split_by !== oldData.split_by)) {
            let _data = parseJson(data.data);
            this.processData(_data);
        } else if ((data.from !== oldData.from || data.field !== oldData.field || data.split_by !== oldData.split_by)) {
            // Unregister from old notiBuffer
            if (this.prodComponent) {
                this.prodComponent.notiBuffer.unregister(this.notiBufferId)
            };

            // Register for the new one
            // (It will also invoke processData once if there is already data)
            this.prodComponent = findProdComponent(data, el, "babia-treebuilder")
            if (this.prodComponent.notiBuffer) {
                this.notiBufferId = this.prodComponent.notiBuffer.register(this.processData.bind(this))
            }
        }
    },

    // Generate the datatree and save it
    processData: function (paths) {
        let data = this.data;

        let maintree = [];
        let tree = maintree;
        if (data.build_root) {
            maintree = [{name: data.root_name, id: '', children: []}];
            tree = maintree[0].children;
        };

        for (let i = 0; i < paths.length; i++) {
            let path = paths[i][data.field].split(data.split_by);
            let currentLevel = tree;
            let currentUid = '';
        
            for (let j = 0; j < path.length; j++) {
                // Check if starts with the split char
                if (!path[j]) { continue }
        
                let part = path[j];
                let existingPath = findWhere(currentLevel, 'name', part);
        
                if (existingPath) {
                    currentLevel = existingPath.children;
                    currentUid = existingPath.uid; // Update the UID accumulator
                } else {
                    let newPart = {};
                    if (j === path.length - 1) {
                        newPart = paths[i];
                    } else {
                        newPart['children'] = [];
                    }
        
                    // Create the UID for the part of the path
                    newPart['uid'] = currentUid ? currentUid + data.split_by + part : part;
                    newPart['name'] = part;
        
                    currentLevel.push(newPart);
                    currentLevel = newPart.children;
                    currentUid = newPart['uid']; // Update the UID accumulator
                }
            }
        }
        this.notiBuffer.set(maintree);
    }
})

function findWhere(array, key, value) {
    t = 0;
    // find the index where the id is the as the a value
    while (t < array.length && array[t][key] !== value) { t++ };
    if (t < array.length) {
        return array[t]
    } else {
        return false;
    }
}