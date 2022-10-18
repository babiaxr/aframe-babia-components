let findTargetComponent = require('../others/common').findTargetComponent;

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
        hideFields: { type: 'array' },
        hideRows: { type: 'array' }
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

        // Unregister from old producer
        if (this.targetComponent) {
            this.targetComponent.notiBuffer.unregister(this.notiBufferId)
        };

        // Find the target component
        self.targetComponent = findTargetComponent(data, this)

        // Find querier components
        this.findQuerierComponents(this)

        // Target component properties
        if (this.targetComponent.visProperties) {
            this.targetComponentVisProperties = this.targetComponent.visProperties
        }

        // Register to target component notiBuffer
        if (this.targetComponent.notiBuffer) {
            this.notiBufferId = this.targetComponent.notiBuffer
                .register(this.updateInterface.bind(this))
        }
    },

    targetComponent: undefined,
    targetComponentVisProperties: undefined,
    dataMetrics: undefined,
    interface: undefined,
    dataQueriers: undefined,
    handController: undefined,

    /**
     * Only for babia-network
     */
    nodesQueriers: undefined,
    linksQueriers: undefined,

    updateInterface: function (data) {
        let self = this;
        if (data) {
            // if (!self.targetComponent.el.components['babia-network']){
            getDataMetrics(self, data, self.targetComponentVisProperties)
            //}
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
            if (hand === 'left' && !document.querySelector('#babia-menu-hand')) {
                self.handController = event.target.id
                insertInterfaceOnHand(self, self.handController)
            }
        });
    },

    findQuerierComponents: function () {
        if (this.targetComponent.el.components['babia-network'] && (this.targetComponent.el.components['babia-network'].data.nodesFrom || this.targetComponent.el.components['babia-network'].data.nodes)) {
            console.log("nodesFrom or nodes")
            this.nodesQueriers = [];
            this.linksQueriers = [];
            document.querySelectorAll('[babia-queryjson]').forEach(querier => {
                // Skip querier data when the target visualizer has included filtered data too.
                if (querier.id != this.data.target || (querier.id == this.data.target && !this.targetComponent.prodComponent.attrName == 'babia-filter')) {
                    this.nodesQueriers.push(querier.id)
                    this.linksQueriers.push(querier.id)
                }
            });
            document.querySelectorAll('[babia-queryes]').forEach(querier => {
                this.nodesQueriers.push(querier.id)
                this.linksQueriers.push(querier.id)
            });
            document.querySelectorAll('[babia-querygithub]').forEach(querier => {
                this.nodesQueriers.push(querier.id)
                this.linksQueriers.push(querier.id)
            });
            document.querySelectorAll('[babia-filter]').forEach(querier => {
                this.nodesQueriers.push(querier.id)
                this.linksQueriers.push(querier.id)
            });
        } else if (this.targetComponent.el.components['babia-boats']) {
            this.dataQueriers = []
            document.querySelectorAll('[babia-treebuilder]').forEach(querier => {
                this.dataQueriers.push(querier.id)
            });
        } else {
            this.dataQueriers = []
            // All queriers and filterdatas of the scene
            document.querySelectorAll('[babia-queryjson]').forEach(querier => {
                // Skip querier data when the target visualizer has included filtered data too.
                if (querier.id != this.data.target || (querier.id == this.data.target && !this.targetComponent.prodComponent.attrName == 'babia-filter')) {
                    this.dataQueriers.push(querier.id)
                }
            });
            document.querySelectorAll('[babia-queryes]').forEach(querier => {
                this.dataQueriers.push(querier.id)
            });
            document.querySelectorAll('[babia-querygithub]').forEach(querier => {
                this.dataQueriers.push(querier.id)
            });
            document.querySelectorAll('[babia-filter]').forEach(querier => {
                this.dataQueriers.push(querier.id)
            });
        }
    },

    hideAndInsertMetrics: function (dataMetrics, property, metrics) {
        const self = this
        let toAdd = {
            property: property,
            metrics: metrics
        }

        if (self.data.hideFields.length != 0){
            let metricsFiltered = []
            metrics.forEach(metric => {
                if (!self.data.hideFields.includes(metric)){
                    metricsFiltered.push(metric)
                }
            })
            toAdd.metrics = metricsFiltered
        }

        if (!self.data.hideRows.includes(property)) {
            dataMetrics.push(toAdd)
        }
    }
})

let insertInterfaceOnHand = (self, hand) => {
    let hand_entity = document.getElementById(hand)
    let scale = 0.03
    self.interface = generateInterface(self, self.dataMetrics, hand_entity)
    self.interface.id = 'babia-menu-hand'
    self.interface.setAttribute('scale', { x: scale, y: scale, z: scale })
    self.interface.setAttribute('position', { x: -scale * self.interface.width / 2, y: scale * self.interface.height / 2, z: -0.1 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    self.interface.setAttribute('rotation', { x: -60 })
    openCloseMenu(self.handController, self.interface)
}

let getDataMetrics = (self, data, properties) => {
    if (self.targetComponent.attrName == 'babia-network') {
        if (data.nodes) {
            self.dataMetrics = {
                'nodes': [],
                'links': []
            }

            // Create structure
            let number_properties = ['height', 'radius', 'width', 'size', 'farea', 'fheight', 'area', 'depth']
            let number_metrics = []
            let last_child

            last_child = getLastChild(data.nodes[0])

            Object.keys(last_child).forEach(metric => {
                if (typeof last_child[metric] == 'number') {
                    number_metrics.push(metric)
                }
            });

            properties['nodes'].forEach(property => {
                if (number_properties.includes(property)) {
                    self.hideAndInsertMetrics(self.dataMetrics['nodes'], property, number_metrics)
                } else {
                    self.hideAndInsertMetrics(self.dataMetrics['nodes'], property, Object.keys(data.nodes[0]))
                }
            });

            properties['links1'].forEach(property => {
                if (number_properties.includes(property)) {
                    self.hideAndInsertMetrics(self.dataMetrics['links'], property, number_metrics)
                } else {
                    self.hideAndInsertMetrics(self.dataMetrics['links'], property, Object.keys(data.links[0]))
                }
            });
        } else {
            self.dataMetrics = []

            // Create structure
            let number_properties = ['height', 'radius', 'width', 'size', 'farea', 'fheight', 'area', 'depth']
            let number_metrics = []
            let last_child

            last_child = getLastChild(data[0])

            Object.keys(last_child).forEach(metric => {
                if (typeof last_child[metric] == 'number') {
                    number_metrics.push(metric)
                }
            });

            properties['nodes'].forEach(property => {
                if (number_properties.includes(property)) {
                    self.hideAndInsertMetrics(self.dataMetrics, property, number_metrics)
                } else {
                    self.hideAndInsertMetrics(self.dataMetrics, property, Object.keys(data[0]))
                }
            });

            properties['links0'].forEach(property => {
                if (number_properties.includes(property)) {
                    self.hideAndInsertMetrics(self.dataMetrics, property, number_metrics)
                } else {
                    self.hideAndInsertMetrics(self.dataMetrics, property, Object.keys(data[0]))
                }
            });
        }

    } else {
        self.dataMetrics = []

        // Create structure
        let number_properties = ['height', 'radius', 'width', 'size', 'farea', 'fheight', 'area', 'depth', 'color']
        let number_metrics = []
        let last_child

        if (self.targetComponent.attrName == 'babia-city') {
            // Get last child of the tree
            last_child = getLastChild(data)
        } else if (self.targetComponent.attrName == 'babia-boats') {
            last_child = getLastChild(data[0])
        } else {
            last_child = data[0]
        }

        Object.keys(last_child).forEach(metric => {
            if (typeof last_child[metric] == 'number') {
                number_metrics.push(metric)
            }
        });

        properties.forEach(property => {
            if (number_properties.includes(property)) {
                self.hideAndInsertMetrics(self.dataMetrics, property, number_metrics)

                // Specific case for categoric color in boats
                if (property === "color") {
                    if (self.targetComponent.attrName == 'babia-boats') {
                        let categoric_colors = []
                        for (const [key, value] of Object.entries(last_child)) {
                            if (typeof value === 'string') {
                                categoric_colors.push(key)
                            }
                        }

                        self.hideAndInsertMetrics(self.dataMetrics, property, categoric_colors)
                    }
                }

            } else {
                self.hideAndInsertMetrics(self.dataMetrics, property, Object.keys(data[0]))
            }
        });
    }
}

let getLastChild = (data) => {
    if (data.children) {
        child = getLastChild(data.children[0])
    } else {
        child = data
    }
    return child
}

let generateInterface = (self, metrics, parent) => {
    self.interface = document.createElement('a-entity')
    self.interface.id = "babia-menu"

    let posY = 0
    let posX = 0
    let maxX = 0

    if (self.targetComponent.el.components['babia-network'] && (self.targetComponent.el.components['babia-network'].data.nodesFrom || self.targetComponent.el.components['babia-network'].data.nodes)) {
        // Nodes files
        if (self.nodesQueriers.length > 1) {
            let button = createProperty("Nodes", posX, posY)
            self.interface.appendChild(button)
            self.nodesQueriers.forEach(data => {
                posX += 3.25
                let button = createDataSelect(self, data, posX, posY, 'nodes')
                button.classList.add("babiaxraycasterclass")
                self.interface.appendChild(button)
            });
        }
        --posY
        if (maxX < posX) { maxX = posX }
        posX = 0

        // Links files
        if (self.linksQueriers.length > 1) {
            let button = createProperty("Links", posX, posY)
            self.interface.appendChild(button)
            self.linksQueriers.forEach(data => {
                posX += 3.25
                let button = createDataSelect(self, data, posX, posY, 'links')
                button.classList.add("babiaxraycasterclass")
                self.interface.appendChild(button)
            });
        }
        --posY
        if (maxX < posX) { maxX = posX }
        posX = 0

        // Properties and metrics
        metrics.nodes.forEach(property => {
            let button = createProperty(property.property, posX, posY)
            self.interface.appendChild(button)
            property.metrics.forEach(metric => {
                posX += 3.25
                let button = createMetric(self, property.property, metric, posX, posY)
                button.classList.add("babiaxraycasterclass")
                self.interface.appendChild(button)
            });
            --posY
            if (maxX < posX) { maxX = posX }
            posX = 0
        });

        metrics.links.forEach(property => {
            let button = createProperty(property.property, posX, posY)
            self.interface.appendChild(button)
            property.metrics.forEach(metric => {
                posX += 3.25
                let button = createMetric(self, property.property, metric, posX, posY)
                button.classList.add("babiaxraycasterclass")
                self.interface.appendChild(button)
            });
            --posY
            if (maxX < posX) { maxX = posX }
            posX = 0
        });
    } else {
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
        if (maxX < posX) { maxX = posX }
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
            if (maxX < posX) { maxX = posX }
            posX = 0
        });
    }

    self.interface.width = maxX + 3;
    self.interface.height = Math.abs(posY)

    self.interface.setAttribute('position', { x: -self.interface.width / 2, y: self.interface.height, z: 0 })
    parent.appendChild(self.interface)

    return self.interface
}

let createMetric = (self, property, metric, positionX, positionY) => {
    let entity = document.createElement('a-box')
    entity.property = property
    entity.metric = metric
    entity.classList.add("babiaxraycasterclass")
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0 })
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

    if (self.targetComponent.data[property] == metric) {
        entity.setAttribute('color', '#555555')
    }

    selection_events(entity, self.targetComponent, false)

    return entity
}

let selection_events = (entity, visualizer, isData) => {
    entity.addEventListener('mouseenter', function () {
        entity.children[0].setAttribute('text', { color: '#FFFFFF' })
        entity.setAttribute('color', '#333333')
    });

    if (isData) {
        entity.addEventListener('mouseleave', function () {
            entity.children[0].setAttribute('text', { color: 'black' })
            if (visualizer.data.from == entity.from) {
                entity.setAttribute('color', '#555555')
            } else if (visualizer.data.from == "" || visualizer.data.from != entity.from) {
                entity.setAttribute('color', '#FFFFFF')
            }
        });
    } else {
        entity.addEventListener('mouseleave', function () {
            entity.children[0].setAttribute('text', { color: 'black' })
            if (visualizer.data[entity.property] == entity.metric) {
                entity.setAttribute('color', '#555555')
            } else {
                entity.setAttribute('color', '#FFFFFF')
            }
        });
    }

    entity.addEventListener('click', function () {
        // Change parameters
        if (entity.property && entity.metric) {
            // When change from width/depth to area or vice-versa to boats component
            if (visualizer.attrName == 'babia-boats' && entity.property == "area") {
                visualizer.el.removeAttribute(visualizer.attrName, 'width')
                visualizer.el.removeAttribute(visualizer.attrName, 'depth')
            } else if (visualizer.attrName == 'babia-boats' && (entity.property == "width" || entity.property == "depth") && visualizer.el.getAttribute('babia-boats').area) {
                visualizer.el.removeAttribute(visualizer.attrName, 'area')
                if (entity.property == "width") {
                    visualizer.el.setAttribute(visualizer.attrName, 'depth', entity.metric)
                } else {
                    visualizer.el.setAttribute(visualizer.attrName, 'width', entity.metric)
                }
            }
            visualizer.el.setAttribute(visualizer.attrName, entity.property, entity.metric)
            // Change selected querier in visualializer (from)
        } else if (entity.from) {
            visualizer.el.setAttribute(visualizer.attrName, "from", entity.from)
        } else if (entity.nodes) {
            visualizer.el.setAttribute(visualizer.attrName, 'nodesFrom', entity.nodes)
        } else if (entity.links) {
            visualizer.el.setAttribute(visualizer.attrName, 'linksFrom', entity.links)
        }
    });
}

let createProperty = (property, positionX, positionY) => {
    let entity = document.createElement('a-plane')
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0 })
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

let createDataSelect = (self, id, positionX, positionY, networkType) => {
    let entity = document.createElement('a-box')
    if (networkType == 'nodes') {
        entity.nodes = id
    } else if (networkType == 'links') {
        entity.links = id
    } else {
        entity.from = id;
    }
    entity.classList.add("babiaxraycasterclass")
    entity.setAttribute('position', { x: positionX, y: positionY, z: 0 })
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

    if (self.targetComponent.prodComponent && self.targetComponent.prodComponent.el.id == id) {
        entity.setAttribute('color', '#555555')
    } else {
        entity.setAttribute('color', '#FFFFFF')
    }

    selection_events(entity, self.targetComponent, true)

    return entity
}

let openCloseMenu = (hand_id, entity_menu) => {
    let menu_opened = true
    let entity_hand = document.getElementById(hand_id)
    entity_hand.addEventListener('gripdown', function () {
        if (menu_opened) {
            menu_opened = false
            entity_menu.setAttribute('visible', false)
        } else {
            menu_opened = true
            entity_menu.setAttribute('visible', true)
        }
    })
}