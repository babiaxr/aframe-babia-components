/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geototemchart', {
    schema: {
        charts_id: { type: 'string'},
        data_list: { type: 'string' },
        chart: {type: 'string', default: 'geopiechart' },
        data: {type: 'string'},
        legend: { type: 'boolean' },
        axis: { type: 'boolean', default: true }
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {},

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data !== oldData)  {

            charts_id = JSON.parse(data.charts_id)
            console.log(charts_id)


            //Remove previous chart
            while (this.el.firstChild)
                this.el.firstChild.remove();
            console.log("Generating totemchart...")
            generateTotemChart(data, el, data.chart)
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

let data_used
let data_files = []
let charts_id

let generateTotemChart = (data, element, chart) => {
    if (data.data_list) {
        const dataToPrint_list = JSON.parse(data.data_list)
        // First time we load JSON files and set.
        if (!data_used) {
            loadFiles(dataToPrint_list, firstData)
        }
        if (data_files) {
            
            // Totem Data
            generateTotemData(element, dataToPrint_list, data_used)
        }
    }   
}

function firstData(list) {
    data_used = list[0].data
    let first_data = getEntity()
    first_data.setAttribute('geototemchart', { 'data' : data_files[0].file})
}

function loadFiles(list, callback) {
    let loader = new THREE.FileLoader();
    // Load Data
    for (let item in list) {
        let file = list[item].path
        loader.load(file,
            // onLoad callback
            function ( data ) {
                console.log(data)
                data_files.push({
                    file : data,
                    path : file
                }) 
                callback(list);           
            },
            // onProgress callback
            function ( xhr ) {
                console.log(file.toString() + ': ' + (xhr.loaded / xhr.total * 100) + '% loaded' );
            },

            // onError callback
            function ( err ) {
                console.error( 'An error happened' );
            }
        );
    }
    
}

function generateTotemData(element, list, data_used){
    console.log('Generating Datas Totem...')
    let position_y = 7.5
    // Change List's height 
    if (list.length % 2 == 1){
        let increment = Math.trunc(list.length / 2)
        position_y += increment
    }

    let position_x = -3
    let position_z = 6
    let rotation_y = 0

    //Get Width
    let width = getWidthTotem(list)

    // Generate Title
    generateTotemTitle(element, position_x, position_y, position_z, rotation_y, width, 'Select Data')
    position_y -= 1

    // Generate List of Charts
    generateTotem(element, position_x, position_y, position_z, rotation_y, width, list, data_used)
}

function generateTotemTitle(element, x, y, z, rotation_y, width, title){
    
    let entity = document.createElement('a-plane')
    entity.setAttribute('position', {x: x, y: y, z: z})
    entity.setAttribute('rotation', {x: 0, y: rotation_y, z:0})
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

function generateTotem(element, x, y, z, rotation, width, list, list_used){
    // Generate List of Items
    for(let item of list) {
        // For data
        if (item.data){
            item = item.data
        }

        let entity = document.createElement('a-plane')
        entity.setAttribute('id', item)
        entity.setAttribute('position', {x: x, y: y, z: z})
        entity.setAttribute('rotation', {x: 0, y: rotation, z:0})
        entity.setAttribute('height', 1)
        entity.setAttribute('width', width)
        entity.setAttribute('text', {
            'value': item,
            'align': 'center',
            'width': '10',
        })
        // Item Seleted
        if (item == list_used){
            entity.setAttribute('color', 'black')
            entity.setAttribute('text', {
                'color': 'white'
            })
        } else {
            entity.setAttribute('color', 'white')
            entity.setAttribute('text', {
                'color': 'black'
            })
        }
        element.appendChild(entity)
        y -= 1

        entity.addEventListener('click', function(){
            list_used = item
            for(let i of list){
                if (i.path){
                    if (list_used == i.data){
                        data_used = i.data
                        console.log(i.path)
                        updateEntity(i.path)
                    }
                } else {
                    updateEntity(item, 'chart')
                }
            }
            console.log("Has elegido: "+ list_used.toString())
        })
    }
}

function getWidthTotem(list){
    let width = 5
    for (let line of list){
        if (line.data){
            line = line.data
        }
        if ((line.length > 10) && (width < line.length / 4)){
            width = line.length / 4
        }
    }
    return width;
}

function updateEntity(data){
    let entity = getEntity()
    for (let obj in charts_id){
        let id = charts_id[obj].id
        let type = charts_id[obj].type
        let new_data
        console.log(id.toString() + ": " + type)
        for (let file in data_files){
            if (data_files[file].path == data){
                console.log('Vamos a añadir: ' + data.toString())
                new_data = data_files[file].file
                console.log(new_data)
                entity.setAttribute('geototemchart', { 'data' : data_files[file].file })
            }
        }
        //entity.setAttribute('geototemchart', { 'data' : data})
        document.getElementById(id).setAttribute(type, "data" , new_data)
    }    
    
}

function getEntity(){
    let enitity_list = document.getElementsByTagName('a-entity')
    for (let entity of enitity_list){
        if( entity.getAttribute('geototemchart') ){
            return entity
        }
    }
}

