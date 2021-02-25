/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let MAX_SIZE_BAR = 10

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-ui', {
    schema: {
        target: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        console.log("WELCOME TO UI: Control your data.")
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this
        let data = this.data
        let el = this.el

        // Find the component
        let eventName = findVisualizerComponent(data, self) 

        // Find querier components
        findQuerierComponents(self)

        // Target component properties
        if (self.targetComponent.visProperties) { 
            self.targetComponentVisProperties = self.targetComponent.visProperties
        }

        // Assign new eventName
        self.targetComponentEventName = eventName

        // Attach to the events of the target component
        el.addEventListener(self.targetComponentEventName, function _listener(e) {
            console.log("Visualizer is Updated.")
            updateInterfaceEventCallback(self, e)
        });

        // Register for the new one
        self.targetComponent.register(el)
    },

    targetComponent: undefined,
    targetComponentEventName: undefined,
    targetComponentVisProperties: undefined,
    dataMetrics: undefined,
    interface: undefined,
    dataQueriers: undefined,
    handController: undefined,

     /**
     * Property of the visualizer where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

})

let findQuerierComponents = (self) => {
    self.dataQueriers = []
    // All queriers and filterdatas of the scene
    document.querySelectorAll('[babia-queryjson]').forEach(querier => { 
        // Skip querier data when the target visualizer has included filtered data too.
        if (querier.id != self.data.target || ( querier.id == self.data.target && !self.targetComponent.dataComponent.attrName == 'babiaxr-filterdata')){
            self.dataQueriers.push(querier.id)
        } 
    });
    document.querySelectorAll('[babia-queryes]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
    document.querySelectorAll('[babia-querygithub]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
    document.querySelectorAll('[babiaxr-filterdata]').forEach(querier => { 
        self.dataQueriers.push(querier.id)
    });
}

let findVisualizerComponent = (data, self) => {
    let eventName = "babiaVisualizerUpdated"
    if (data.target) {
        // Save the reference to the querier or filterdata
        let targetElement = document.getElementById(data.target)
        if (targetElement != null) { 
            if (targetElement.components['babiaxr-simplebarchart']) {
                self.targetComponent = targetElement.components['babiaxr-simplebarchart']
            } else if (targetElement.components['babiaxr-3dbarchart']) {
                self.targetComponent = targetElement.components['babiaxr-3dbarchart']
            } else if (targetElement.components['babiaxr-cylinderchart']) {
                self.targetComponent = targetElement.components['babiaxr-cylinderchart']
            } else if (targetElement.components['babiaxr-3dcylinderchart']) {
                self.targetComponent = targetElement.components['babiaxr-3dcylinderchart']
            } else if (targetElement.components['babiaxr-piechart']) {
                self.targetComponent = targetElement.components['babiaxr-piechart']
            } else if (targetElement.components['babiaxr-doughnutchart']) {
                self.targetComponent = targetElement.components['babiaxr-doughnutchart']
            } else if (targetElement.components['babiaxr-bubbleschart']) {
                self.targetComponent = targetElement.components['babiaxr-bubbleschart']
            } else if (targetElement.components['babiaxr-city']) {
                self.targetComponent = targetElement.components['babiaxr-city']
            } else if (targetElement.components['babiaxr-island']) {
                self.targetComponent = targetElement.components['babiaxr-island']
            } else {
                console.error("Visualizer not found.")
                return
            }
        } else {
            console.error("Target not exist.")
            return
        }
    } else {
        console.error("Error: Target not inserted. ")
        return
    }
    return eventName
}

let updateInterfaceEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    if(self.targetComponent[e.detail].data){
        // Inserted data manually in the visualizer 
        getDataMetrics(self, JSON.parse(self.targetComponent[e.detail].data), self.targetComponentVisProperties)
    } else {
        getDataMetrics(self, self.targetComponent[e.detail], self.targetComponentVisProperties)
    }
    
    while (self.el.firstChild)
        self.el.firstChild.remove();
    
    // Generate interface
    console.log('Generating interface...')
    if (document.querySelector('#babia-menu-hand')) {
        let hand_ui = document.querySelector('#babia-menu-hand')
        hand_ui.parentNode.removeChild(hand_ui)
        insertInterfaceOnHand(self, self.handController)
    } else {
        self.interface = generateInterface(self, self.dataMetrics, self.el)
    }
    
    document.addEventListener('controllerconnected', (event) => {
        while (self.el.firstChild)
            self.el.firstChild.remove();
        // event.detail.name ----> which VR controller
        controller = event.detail.name;
        let hand = event.target.getAttribute(controller).hand
        if (hand === 'left' && !document.querySelector('#babia-menu-hand')){
            self.handController = event.target.id
            insertInterfaceOnHand(self, self.handController)
        }    
    });
}

let insertInterfaceOnHand = (self, hand) => {
    let hand_entity = document.getElementById(hand)
    let scale = 0.03
    self.interface = generateInterface(self, self.dataMetrics, hand_entity)
    self.interface.id = 'babia-menu-hand'
    self.interface.setAttribute('scale', {x: scale, y: scale, z: scale}) 
    self.interface.setAttribute('position', {x: -scale * self.interface.width / 2, y: scale * self.interface.height /2, z: -0.1})
    self.interface.setAttribute('rotation', {x: -60}) 
            self.interface.setAttribute('rotation', {x: -60}) 
    self.interface.setAttribute('rotation', {x: -60}) 
            self.interface.setAttribute('rotation', {x: -60}) 
    self.interface.setAttribute('rotation', {x: -60}) 
            self.interface.setAttribute('rotation', {x: -60}) 
    self.interface.setAttribute('rotation', {x: -60}) 
            self.interface.setAttribute('rotation', {x: -60}) 
    self.interface.setAttribute('rotation', {x: -60}) 
    openCloseMenu(self.handController, self.interface)
}

let getDataMetrics = (self, data, properties) =>{
    self.dataMetrics=[]

    // Create structure
    let number_properties = ['height', 'radius', 'width', 'size', 'farea', 'fheight', 'area', 'depth']
    let number_metrics = []
    let last_child

    if(self.targetComponent.attrName == 'babiaxr-city')
    {
        // Get last child of the tree
        last_child = getLastChild(data)
    } else if (self.targetComponent.attrName == 'babiaxr-island'){
        last_child = getLastChild(data[0])
    } else { 
        last_child = data[0] 
    }

    Object.keys(last_child).forEach(metric => {
        if (typeof last_child[metric] == 'number'){
            number_metrics.push(metric)

        }
    });

    properties.forEach(property => {
        if (number_properties.includes(property)){
            self.dataMetrics.push({property: property, metrics: number_metrics})
        } else {
            self.dataMetrics.push({property: property, metrics: Object.keys(data[0])})
        }
    });   
}

let getLastChild = (data) =>{
    if (data.children){
        child = getLastChild(data.children[0])
    } else { 
        child = data
    }
    return child
}

let generateInterface = (self, metrics, parent) =>{
    self.interface = document.createElement('a-entity')
    self.interface.id = "babia-menu"

    let posY = 0
    let posX = 0
    let maxX = 0

    // Data files
    if (self.dataQueriers.length > 1) { 
        let button = createProperty("Data", posX, posY)
        self.interface.appendChild(button)
        self.dataQueriers.forEach(data => {
            posX += 3.25
            let button = createDataSelect(self, data, posX, posY)
            button.classList.add("babiaxraycasterclass")
            self.interface.appendChild(button) 
        });
    }
    --posY
    if(maxX < posX) { maxX = posX }
    posX = 0 

    // Properties and metrics
    metrics.forEach(property => {
        let button = createProperty(property.property, posX, posY)
        self.interface.appendChild(button)
        property.metrics.forEach(metric => {
            posX += 3.25
            let button = createMetric(self, property.property, metric, posX, posY)
            button.classList.add("babiaxraycasterclass")
            self.interface.appendChild(button)
        });
        --posY
        if(maxX < posX) { maxX = posX }
        posX = 0  
    });
 
    self.interface.width = maxX + 3;
    self.interface.height = Math.abs(posY)

    self.interface.setAttribute('position', { x: -self.interface.width / 2, y: self.interface.height, z: 0})
    parent.appendChild(self.interface)

    return self.interface
}

let createMetric = (self, property, metric, positionX, positionY) =>{
    let entity = document.createElement('a-box')
    entity.property = property
    entity.metric = metric
    entity.classList.add("babiaxraycasterclass")
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': metric,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    if (self.targetComponent.data[property] == metric){
        entity.setAttribute('color', '#555555')
    }
    
    selection_events(entity, self.targetComponent, false)

    return entity
}

let selection_events = (entity, visualizer, isData) =>{
    entity.addEventListener('mouseenter', function(){
        entity.children[0].setAttribute('text', {color: '#FFFFFF'})
        entity.setAttribute('color', '#333333')
    });

    if (isData){
        entity.addEventListener('mouseleave', function(){
            entity.children[0].setAttribute('text', {color: 'black'})  
            if(visualizer.data.from == entity.from) {
                entity.setAttribute('color', '#555555')
            } else if(visualizer.data.from == "" || visualizer.data.from != entity.from) {
                entity.setAttribute('color', '#FFFFFF')
            }
        });  
    } else {
        entity.addEventListener('mouseleave', function(){
            entity.children[0].setAttribute('text', {color: 'black'})  
            if (visualizer.data[entity.property] == entity.metric){
                entity.setAttribute('color', '#555555')
            } else {
                entity.setAttribute('color', '#FFFFFF')
            }
        });
    }

    entity.addEventListener('click', function(){
        // Change parameters
        if(entity.property && entity.metric) {
            // When change from width/depth to area or vice-versa to island component
            if (visualizer.attrName == 'babiaxr-island' && entity.property == "area"){
                visualizer.el.removeAttribute(visualizer.attrName, 'width')
                visualizer.el.removeAttribute(visualizer.attrName, 'depth')
            } else if (visualizer.attrName == 'babiaxr-island' && (entity.property == "width" || entity.property == "depth") && visualizer.el.getAttribute('babiaxr-island').area){
                visualizer.el.removeAttribute(visualizer.attrName, 'area')  
                if (entity.property == "width"){
                    visualizer.el.setAttribute(visualizer.attrName, 'depth', entity.metric)
                } else {
                    visualizer.el.setAttribute(visualizer.attrName, 'width', entity.metric)  
                }  
            } 
            visualizer.el.setAttribute(visualizer.attrName, entity.property, entity.metric)
        // Change selected querier in visualializer (from)
        } else if (entity.from) {
            visualizer.el.setAttribute(visualizer.attrName, "from", entity.from )
        }
    });

}

let createProperty = (property, positionX, positionY) =>{
    let entity = document.createElement('a-plane')
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('text', {
        'value': property,
        'align': 'center',
        'width': '10',
        'color': '#FFFFFF'
    })
    entity.setAttribute('color', 'black')
    return entity
}

let createDataSelect = (self, id, positionX, positionY) =>{
    let entity = document.createElement('a-box')
    entity.from = id;
    entity.classList.add("babiaxraycasterclass")
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0})
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
    entity.setAttribute('height', 0.8)
    entity.setAttribute('width', 3)
    entity.setAttribute('depth', 0.01)

    let text = document.createElement('a-entity')
    text.setAttribute('text', {
        'value': id,
        'align': 'center',
        'width': '10',
        'color': 'black'
    })
    text.setAttribute('position', "0 0 0.01")
    entity.appendChild(text)

    if (self.targetComponent.data.from && self.targetComponent.data.from == id){
        entity.setAttribute('color', '#555555')
    } else {
        entity.setAttribute('color', '#FFFFFF')
    }
    
    selection_events(entity, self.targetComponent, true)

    return entity
}

let openCloseMenu = (hand_id, entity_menu) =>{
    let menu_opened = true
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function(){
        if (menu_opened){
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
}