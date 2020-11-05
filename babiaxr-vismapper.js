/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let MAX_SIZE_BAR = 10

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-vismapper', {
    schema: {
        ui: {type: 'boolean', default: false},
        // Data
        dataToShow: { type: 'string' },
        // Geo and charts
        width: { type: 'string' },
        depth: { type: 'string' },
        height: { type: 'string' },
        radius: { type: 'string' },
        // Only for charts
        slice: { type: 'string' },
        x_axis: { type: 'string' },
        z_axis: { type: 'string' },
        // Codecity
        fmaxarea: { type: 'string' },
        farea: { type: 'string'},
        fheight: { type: 'string'}
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
        let controller;
        let selector;
        let dataJSON;
        let metrics;
        let selector_panel

        document.addEventListener('babiaxr-dataLoaded', function loadMenu(event){
            console.log('VISMAPPER: Data Loaded')
            dataJSON = event.detail.data
            if (dataJSON){
                if (data.ui){
                    if (event.detail.codecity){
                        selector = getSelectorCodecity(dataJSON)
                        metrics = ['fmaxarea', 'farea', 'fheight']
                        selector_panel = generateSelectorPanel(selector, metrics, dataJSON, el, true)
                    } else {
                        selector = getSelectors(dataJSON)
                        metrics = el.getAttribute('babiaToRepresent').split(',');
                        selector_panel = generateSelectorPanel(selector, metrics, dataJSON, el, false)
                    }
                    
                    selector_panel.id = "Panel-scene"
                    document.getElementsByTagName('a-scene')[0].appendChild(selector_panel)
                    this.removeEventListener('babiaxr-dataLoaded', loadMenu)
                }
            }
        });
        document.addEventListener('controllerconnected', (event) => {
            // event.detail.name ----> which VR controller
            controller = event.detail.name;
            let hand = event.target.getAttribute(controller).hand
            if (hand === 'left'){
                let entity_id = event.target.id
                let selector_panel = generateSelectorPanel(selector, metrics, dataJSON, el)
                selector_panel.setAttribute('position', {x:-0.16, y:0.08, z: -0.2});
                selector_panel.id = "panel-mano"
                selector_panel.setAttribute('scale', {x: 0.05, y:0.05, z:0.05});
                selector_panel.setAttribute('rotation', {x:-45})
                let background = document.createElement('a-plane');
                background.setAttribute('color', "#AAAAAA")
                background.setAttribute('position', {x:3.25, y: -0.5, z: -0.15})
                background.setAttribute('width', 10);
                background.setAttribute('height', 2.5)
                background.setAttribute('material', 'opacity', 0.6)
                selector_panel.appendChild(background)
                document.getElementById(entity_id).appendChild(selector_panel);
                document.getElementById('Panel-scene').setAttribute('visible', false);
                openCloseMenu(event.detail.component.el.id, selector_panel)
            }
            
        });

        
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;

        /**
         * Update geometry component
         */
        if (data.dataToShow) {
            let dataJSON = JSON.parse(data.dataToShow)
            el.emit('babiaxr-dataLoaded', {data: dataJSON})
            updateComponent(el, data, dataJSON)
        } else if (el.components["babiaxr-codecity"]){
            updateComponent(el, data)
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

const number_parameters = ['height', 'radius', 'width', 'slice', 'depth', 'fmaxarea', 'farea', 'fheight']
const string_parameters = ['x_axis', 'z_axis']

function updateComponent(el, data, dataJSON){
    if (el.components.geometry) {
        if (el.components.geometry.data.primitive === "box") {
            el.setAttribute("geometry", "height", (dataJSON[data.height] / 100))
            el.setAttribute("geometry", "width", dataJSON[data.width] || 2)
            el.setAttribute("geometry", "depth", dataJSON[data.depth] || 2)
            let oldPos = el.getAttribute("position")
            el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height] / 200, z: oldPos.z })
        } else if (el.components.geometry.data.primitive === "sphere") {
            el.setAttribute("geometry", "radius", (dataJSON[data.radius] / 10000) || 2)
            let oldPos = el.getAttribute("position")
            el.setAttribute("position", { x: oldPos.x, y: dataJSON[data.height], z: oldPos.z })
        }
    } else if (el.components['babiaxr-simplebarchart']) {
        let list = generate2Dlist(data, dataJSON, "x_axis")
        el.setAttribute("babiaxr-simplebarchart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-cylinderchart']) {
        let list = generate2Dlist(data, dataJSON, "x_axis", "cylinder")
        el.setAttribute("babiaxr-cylinderchart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-piechart']) {
        let list = generate2Dlist(data, dataJSON, "slice")
        el.setAttribute("babiaxr-piechart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-doughnutchart']) {
        let list = generate2Dlist(data, dataJSON, "slice")
        el.setAttribute("babiaxr-doughnutchart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-3dbarchart']) {
        let list = generate3Dlist(data, dataJSON, "3dbars")
        el.setAttribute("babiaxr-3dbarchart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-bubbleschart']) {
        let list = generate3Dlist(data, dataJSON, "bubbles")
        el.setAttribute("babiaxr-bubbleschart", "data", JSON.stringify(list))
    } else if (el.components['babiaxr-3dcylinderchart']) {
        let list = generate3Dlist(data, dataJSON, "3dcylinder")
        el.setAttribute("babiaxr-3dcylinderchart", "data", JSON.stringify(list))
    } else if (el.components["babiaxr-codecity"]) {
        if (data.fmaxarea){
            el.setAttribute("babiaxr-codecity", "fmaxarea", data.fmaxarea);
        }
        if (data.farea){
            el.setAttribute("babiaxr-codecity", "farea", data.farea);
        }
        if (data.fheight){
            el.setAttribute("babiaxr-codecity", "fheight", data.fheight);
        }
    }
}

let generate2Dlist = (data, dataToProcess, key_type, chart_type) => {
    let list = []
    if (Array.isArray(dataToProcess)) {
        list = dataToProcess
    } else {
        if (chart_type === "cylinder") {
            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data[key_type]],
                    "height": value[data.height],
                    "radius": value[data.radius]
                }
                list.push(item)
            });
        } else {
            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data[key_type]],
                    "size": value[data.height]
                }
                list.push(item)
            });
        }
    }
    return list
}

let generate3Dlist = (data, dataToProcess, chart_type) => {
    let list = []
    if (Array.isArray(dataToProcess)) {
        list = dataToProcess
    } else {
        if (chart_type === "3dbars") {

            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data.x_axis],
                    "key2": value[data.z_axis],
                    "size": value[data.height]
                }
                list.push(item)
            });
        } else if (chart_type === "bubbles" || chart_type === "3dcylinder") {
            Object.values(dataToProcess).forEach(value => {
                let item = {
                    "key": value[data.x_axis],
                    "key2": value[data.z_axis],
                    "height": value[data.height],
                    "radius": value[data.radius]
                }
                list.push(item)
            });
        }
    }
    return list
}

function normalize(val, min, max) { return (val - min) / (max - min); }

let getSelectors = (data) => {
    let selector = []
    for (let element in Object.values(data)){
        Object.keys(Object.values(data)[element]).forEach (function(key){
            if ( !selector.includes(key)){
                selector.push(key)
            }
        })
    }
    return selector
}

let getSelectorCodecity = (data) => {
    let selector = []
    let last_node = findLast(data.children[0])
    for (let key in Object.keys(last_node)){
        if (Object.keys(last_node)[key] != 'id'){
            selector.push(Object.keys(last_node)[key])
        }  
    }
    return selector
}

let findLast = (e) => {
    if ('children' in e){
        return findLast(e.children[0])
    } else {
        return e
    }

}

let generateSelectorPanel = (items, metrics, data, element, codecity) => {
    let structure = parameterStructure(metrics, items, data, codecity)
    let panel = document.createElement('a-entity')
    panel.setAttribute('class', 'selector')

    let posY = 0
    let posX = 0

    for (let i in structure) {
        let button = createButtonMetric(structure[i].name, posX, posY)
        panel.appendChild(button)
        for (let x in structure[i].options){
            posX += 3.25
            let button = createButton(structure[i].name, structure[i].options[x], posX, posY, element)
            button.classList.add("babiaxraycasterclass")
            panel.appendChild(button)
        }
        --posY
        posX = 0   
    }

    panel.setAttribute('position', { x: -12, y: 10, z: 10})
    return panel
}

let parameterStructure = (metrics, items, data, codecity) => {
    let structure = []
    let number_items = []
    let string_items = []

    // Sort data by type
    if (codecity){
        let last_node = findLast(data)
        for (let i in items){
            if (last_node[items[i]]){
                if (typeof last_node[items[i]] == 'number'){
                    if (!number_items.includes(items[i])){
                        number_items.push(items[i]);
                    }   
                } else if (typeof last_node[items[i]] == 'string'){
                    if (!string_items.includes(items[i])){
                        string_items.push(items[i]);
                    } 
                }
            }
        }
    } else {
        for (let x in data){
            for (let i in items){
                if (data[x][items[i]]){
                    if (typeof data[x][items[i]] == 'number'){
                        if (!number_items.includes(items[i])){
                            number_items.push(items[i]);
                        }   
                    } else if (typeof data[x][items[i]] == 'string'){
                        if (!string_items.includes(items[i])){
                            string_items.push(items[i]);
                        } 
                    }
                }
            }
        }
    }

    // Create structure
    for (let i in metrics){
        if (number_parameters.includes(metrics[i])){
            structure.push({
                name: metrics[i],
                type: 'number',
                options: number_items
            });
        } else if (string_parameters.includes(metrics[i])){
            structure.push({
                name: metrics[i],
                type: 'string',
                options: string_items
            }); 
        }
    }
    return structure
}

let createButton = (name, item, positionX, positionY, element) =>{
    let entity = document.createElement('a-box')
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': item,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    entity.setAttribute('name', name)
    entity.setAttribute('color', '#FFFFFF')
    selection_events(entity, element)

    return entity
}

function selection_events(entity, element){
    entity.addEventListener('mouseenter', function(){
        entity.children[0].setAttribute('text', {color: '#FFFFFF'})
        entity.setAttribute('color', '#333333')
    });

    entity.addEventListener('mouseleave', function(){
        entity.children[0].setAttribute('text', {color: 'black'})
        entity.setAttribute('color', '#FFFFFF')
    });

    entity.addEventListener('click', function(){
        let name = entity.getAttribute('name')
        let metric = entity.children[0].getAttribute('text').value
        element.setAttribute('babiaxr-vismapper', name, metric)
    });
}

let createButtonMetric = (item, positionX, positionY) =>{
    let entity = document.createElement('a-plane')
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('text', {
        'value': item,
        'align': 'center',
        'width': '10',
        'color': '#FFFFFF'
    })
    entity.setAttribute('color', 'black')
    return entity
}

function openCloseMenu(hand_id, entity_menu) {
    let menu_opened = true
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function(evt){
        if (menu_opened){
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
}