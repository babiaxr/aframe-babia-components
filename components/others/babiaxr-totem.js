/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-totem', {
    schema: {
        charts_id: { type: 'string' },
        data_list: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        let data = this.data;
        let el = this.el;
        my_id = el.id
        if (data) {
            charts_id.push({
                id: el.id,
                charts_id: JSON.parse(data.charts_id)
            })
            if (data.data_list) {
                dataToPrint_list = JSON.parse(data.data_list)
                loadFiles(dataToPrint_list)
            }
        }
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        el = this.el;
        /**
         * Update or create chart component
         */
        if (data !== oldData) {
            //Remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating totemchart...")
            generateTotemChart(el)
        }

    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    // tick: function (t) { },

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

})

let data_files = []
let charts_id = []
let my_id
let dataToPrint_list
let el

let generateTotemChart = (element) => {
    if (data_files) {
        // Totem Data
        generateTotemData(element, dataToPrint_list)
    }
}


function loadFiles(list) {
    let loader = new THREE.FileLoader();
    // Load Data
    for (let item of list) {
        if (item.from_querier) {
            let querierElement = document.getElementById(item.from_querier)
            if (querierElement.getAttribute('babiaData')) {
                let dataFromQuerier = JSON.parse(querierElement.getAttribute('babiaData'));
                data_files.push({
                    file: dataFromQuerier,
                    path: item.from_querier
                })
            } else {
                // Get if key or filter
                querierElement.addEventListener('dataReady' + item.from_querier, function (e) {
                    data_files.push({
                        file: e.detail,
                        path: item.from_querier
                    })
                })
            }

        } else if (item.path) {
            let file = item.path
            loader.load(file,
                // onLoad callback
                function (data) {
                    data_files.push({
                        file: data,
                        path: file
                    })
                },
                // onProgress callback
                function (xhr) {
                    console.log(file.toString() + ': ' + (xhr.loaded / xhr.total * 100) + '% loaded');
                },

                // onError callback
                function (err) {
                    console.error('An error happened');
                }
            );
        }
    }

}

function generateTotemData(element, list) {
    console.log('Generating Totem...')
    let position_y = 7.5
    // Change List's height 
    if (list.length % 2 == 1) {
        let increment = Math.trunc(list.length / 2)
        position_y += increment
    }

    let position_x = -3
    let position_z = 6
    let rotation_y = 0

    //Get Width
    let width = getWidthTotem(list)

    // Generate Title

    let entity = document.createElement
    generateTotemTitle(element, position_x, position_y, position_z, rotation_y, width, 'Select Data')
    position_y -= 1

    // Generate List of Charts
    generateTotem(element, position_x, position_y, position_z, rotation_y, width, list)
}

function generateTotemTitle(element, x, y, z, rotation_y, width, title) {

    let entity = document.createElement('a-plane')
    entity.setAttribute('class', 'title')
    entity.setAttribute('position', { x: x, y: y, z: z })
    entity.setAttribute('rotation', { x: 0, y: rotation_y, z: 0 })
    entity.setAttribute('height', 1)
    entity.setAttribute('width', width)
    entity.setAttribute('color', 'blue')
    entity.setAttribute('text', {
        'value': title,
        'align': 'center',
        'width': '10',
        'color': 'white'
    })
    element.appendChild(entity)
}

function generateTotem(element, x, y, z, rotation, width, list, list_used) {
    // Generate List of Items
    for (let item of list) {
        // For data
        if (item.data) {
            item = item.data
        }
        let entity = document.createElement('a-plane')
        entity.setAttribute('position', { x: x, y: y, z: z })
        entity.setAttribute('rotation', { x: 0, y: rotation, z: 0 })
        entity.setAttribute('height', 1)
        entity.setAttribute('width', width)
        entity.setAttribute('text', {
            'value': item,
            'align': 'center',
            'width': '10',
        })
        entity.setAttribute('color', 'white')
        entity.setAttribute('text', {
            'color': 'black'
        })

        element.appendChild(entity)
        y -= 1

        entity.classList.add("babiaxraycasterclass")
        entity.addEventListener('click', function () {
            let id_totem = entity.parentElement.id
            let children = entity.parentElement.children
            list_used = item
            for (let i of list) {
                if ((i.path || i.from_querier) && (list_used == i.data)) {
                    updateEntity(i.path || i.from_querier, id_totem)
                }
            }
            for (let child in children) {
                if (children[child] === entity) {
                    entity.setAttribute('color', 'black')
                    entity.setAttribute('text', {
                        'color': 'white'
                    })
                } else if (!children[child].id) {
                    if (children[child].className !== "title") {
                        children[child].setAttribute('color', 'white')
                        children[child].setAttribute('text', {
                            'color': 'black'
                        })
                    }
                }
            }
        })
    }
}

function getWidthTotem(list) {
    let width = 5
    for (let line of list) {
        if (line.data) {
            line = line.data
        }
        if ((line.length > 10) && (width < line.length / 4)) {
            width = line.length / 4
        }
    }
    return width;
}

function updateEntity(data, id_totem) {
    let entity = getEntity(id_totem)
    for (let totem in charts_id) {
        if (id_totem == charts_id[totem].id) {
            let charts = charts_id[totem].charts_id
            for (obj in charts) {
                let type = charts[obj].type
                let id = charts[obj].id
                let new_data
                for (let file in data_files) {
                    if (data_files[file].path == data) {
                        new_data = data_files[file].file
                        //entity.setAttribute('geototemchart', { 'data' : data_files[file].file })

                        if (type === "babiaxr-vismapper") {
                            document.getElementById(id).setAttribute(type, "dataToShow", JSON.stringify(new_data))
                        } else {
                            document.getElementById(id).setAttribute(type, "data", new_data)
                        }
                    }
                }
            }
        }
    }
}

function getEntity(id) {
    let entity = document.getElementById(id)
    return entity
}

