/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-boats', {
    schema: {
        data: { type: 'asset' },
        from: { type: 'string' },
        border: { type: 'number', default: 0.5 },
        width: { type: 'string', default: 'width' },
        depth: { type: 'string', default: 'depth' },
        area: { type: 'string' },
        color: { type: 'string' },
        height: { type: 'string', default: 'height' },
        zone_elevation: { type: 'number', default: 0.3 },
        building_separation: { type: 'number', default: 0.25 },
        extra: { type: 'number', default: 1.0 },
        levels: { type: 'number' },
        building_color: { type: 'string', default: "#E6B9A1" },
        base_color: { type: 'color', default: '#98e690' },
        // To add into the doc
        min_building_height: { type: 'number', default: 1 },
        height_quarter_legend_box: { type: 'number', default: 11 },
        height_quarter_legend_title: { type: 'number', default: 12 },
        height_building_legend: { type: 'number', default: 0 },
        legend_scale: { type: 'number', default: 1 },
    },

    /**
    * Entities with legend activated
    */
    entitiesWithLegend: [],

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * List of visualization properties
     */
    visProperties: ['height', 'area', 'width', 'depth'],

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {

    },

    /**
     * 
     */
    duration: 2000,

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        let data = this.data;
        let el = this.el;
        let self = this;
        if (!this.figures){
            this.figures = [];
        }

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            // Get from the json or embedded
            let rawData
            if (typeof data.data == 'string') {
                if (data.data.endsWith('json')) {
                    rawData = requestJSONDataFromURL(data)
                } else {
                    rawData = parseEmbeddedJSONData(data.data)
                }
            } else {
                rawData = data.data;
            };
            // And save it            
            self.babiaData = rawData
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            // If color metric activated, save in the metadata the max and min value for mapping
            if (data.color) {
                let [color_max, color_min] = getMaxMinColorValues(rawData, data.color)
                self.babiaMetadata['color_max'] = color_max
                self.babiaMetadata['color_min'] = color_min
            }

            // Create city
            self.chart = self.onDataLoaded(rawData)

        } else {

            if (data.from !== oldData.from) {
                // Unregister for old treegenerator
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Register for the new one
                findTreeGenerator(data, el, self)

                // Attach to the event of the querier
                el.addEventListener('babiaTreeDataReady', function (e) {
                    // Get the data from the info of the event (propertyName)
                    self.querierDataPropertyName = e.detail
                    let rawData = self.dataComponent[self.querierDataPropertyName]
                    self.babiaData = rawData
                    self.babiaMetadata = {
                        id: self.babiaMetadata.id++
                    }

                    // If color metric activated, save in the metadata the max and min value for mapping
                    if (self.data.color) {
                        let [color_max, color_min] = getMaxMinColorValues(rawData, self.data.color)
                        self.babiaMetadata['color_max'] = color_max
                        self.babiaMetadata['color_min'] = color_min
                    }

                    // Create city
                    self.chart = self.onDataLoaded(self.babiaData)

                    // Dispatch interested events
                    dataReadyToSend("babiaData", self)
                });

                // Register to the querier
                self.dataComponent.register(el)
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.babiaData) {
                while (self.el.firstChild)
                    self.el.firstChild.remove();
                console.log("Generating city...")
                self.chart = self.onDataLoaded(self.babiaData)

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("babiaData", self)
            }
        }
        return

    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    tick: function (t, delta) {
        if (this.animation) {
            let t = { x: 0, y: 0, z: 0 };
            this.Animation(this.el, this.figures, this.figures_old, delta, t, t);
        }
    },

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

    onDataLoaded: function (items) {
        this.figures_old = this.figures;
        this.figures = [];
        console.log('Data Loaded.');

        let el = this.el;
        let elements = items

        // Calculate Increment
        let increment;
        if (this.data.levels) {
            increment = this.data.border * this.data.extra * this.data.levels;
        } else {
            // Find last level
            let levels = getLevels(elements, 0);
            //console.log("Levels:" + levels);
            increment = this.data.border * this.data.extra * (levels + 1);
        }

        // Register all figures before drawing
        let t = { x: 0, y: 0, z: 0 };
        [x, y, t, this.figures] = this.generateElements(elements, this.figures, t, increment);

        // Draw figures
        t.x = 0;
        t.z = 0;
        if (this.figures_old.length == 0) {
            // First, delete all elements of the component
            while (this.el.firstChild)
                this.el.firstChild.remove();
            this.drawElements(el, this.figures, t);
        } else {
            if (this.figures_old !== this.figures){
                this.animation = true;
                this.start_time = Date.now();
            }
        }
    },

    generateElements: function (elements, figures, translate, inc) {
        var increment = inc;

        // Vertical Limits
        var limit_up = 0;
        var limit_down = 0;
        // Horizontal Limits
        var limit_right = 0;
        var limit_left = 0;

        //Position Figure
        var posX = 0;
        var posY = 0;

        // Aux to update the limits
        // Save max limit to update last limit in the next step
        var max_right = 0;
        var max_left = 0;
        var max_down = 0;
        var max_up = 0;

        // control points
        var current_vertical = 0;
        var current_horizontal = 0;

        // Controllers
        var up = false;
        var down = false;
        var left = false;
        var right = true;

        /**
         * Get each element and set its position respectly
         * Then save all data in figures array
         */
        for (let i = 0; i < elements.length; i++) {
            // To do not overwrite babiaData
            let element = {}
            if (this.data.width) {
                element.width = elements[i][this.data.width] || 0.5
            }
            if (this.data.height) {
                element.height = elements[i][this.data.height] || this.data.min_building_height
            }
            if (this.data.depth) {
                element.depth = elements[i][this.data.depth] || 0.5
            }
            if (this.data.area) {
                element.area = elements[i][this.data.area] || 0.5
            }
            if (elements[i].children) {
                element.children = elements[i].children
                this.quarter = true;
                var children = [];
                var translate_matrix;
                // Save Zone's parameters
                element.height = this.data.zone_elevation;
                increment -= this.data.border * this.data.extra;
                [element.width, element.depth, translate_matrix, children] = this.generateElements(element.children, children, translate_matrix, increment);
                translate_matrix.y = element.height;
                increment = inc;
            }
            if (i == 0) {
                if (this.data.area && !elements[i].children) {
                    limit_up += Math.sqrt(element.area) / 2;
                    limit_down -= Math.sqrt(element.area) / 2;
                    limit_right += Math.sqrt(element.area) / 2;
                    limit_left -= Math.sqrt(element.area) / 2;
                } else {
                    limit_up += element.depth / 2;
                    limit_down -= element.depth / 2;
                    limit_right += element.width / 2;
                    limit_left -= element.width / 2;
                }
                //console.log("==== RIGHT SIDE ====");
                current_horizontal = limit_up + this.data.building_separation / 2;
            } else if (element.height > 0) {
                if (up) {
                    [current_vertical, posX, posY, max_up] = this.UpSide(element, limit_up, current_vertical, max_up);
                    if (current_vertical > limit_right) {
                        current_vertical += this.data.building_separation / 2;
                        max_right = current_vertical;
                        up = false;
                        right = true;
                        if (max_left < limit_left) {
                            limit_left = max_left;
                        }
                        current_horizontal = limit_up + this.data.building_separation / 2;
                    }
                } else if (right) {
                    [current_horizontal, posX, posY, max_right] = this.RightSide(element, limit_right, current_horizontal, max_right);
                    if (current_horizontal < limit_down) {
                        current_horizontal += this.data.building_separation / 2;
                        max_down = current_horizontal;
                        right = false;
                        down = true;
                        if (max_up > limit_up) {
                            limit_up = max_up;
                        }
                        current_vertical = limit_right + this.data.building_separation / 2;
                    }
                } else if (down) {
                    [current_vertical, posX, posY, max_down] = this.DownSide(element, limit_down, current_vertical, max_down);
                    if (current_vertical < limit_left) {
                        current_vertical -= this.data.building_separation / 2;
                        max_left = current_vertical;
                        down = false;
                        left = true;
                        if (max_right > limit_right) {
                            limit_right = max_right;
                        }
                        current_horizontal = limit_down - this.data.building_separation / 2;
                    }
                } else if (left) {
                    [current_horizontal, posX, posY, max_left] = this.LeftSide(element, limit_left, current_horizontal, max_left);
                    if (current_horizontal > limit_up) {
                        current_horizontal -= this.data.building_separation / 2;
                        max_up = current_horizontal;
                        left = false;
                        up = true;
                        if (max_down < limit_down) {
                            limit_down = max_down;
                        }
                        current_vertical = limit_left - this.data.building_separation / 2;
                    }
                }
            }

            // Save information about the figure
            let figure
            if (elements[i].children) {
                figure = {
                    id: "boat-" + elements[i].id,
                    name: elements[i].id,
                    posX: posX,
                    posY: posY,
                    width: element.width,
                    height: element.height,
                    depth: element.depth,
                    children: children,
                    translate_matrix: translate_matrix
                }
            } else {
                if (this.data.area) {
                    figure = {
                        id: "boat-" + elements[i].id,
                        name: elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: Math.sqrt(element.area),
                        height: element.height,
                        depth: Math.sqrt(element.area)
                    }
                } else {
                    figure = {
                        id: "boat-" + elements[i].id,
                        name: elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: element.width,
                        height: element.height,
                        depth: element.depth
                    }
                }
            }
            figure.rawData = elements[i]
            figures.push(figure);
        }

        // Check and update last limits
        if (max_down < limit_down) {
            limit_down = max_down;
        }
        if (max_left < limit_left) {
            limit_left = max_left;
        }
        if (max_up > limit_up) {
            limit_up = max_up;
        }
        if (max_right > limit_right) {
            limit_right = max_right;
        }

        if (current_vertical < limit_left) {
            limit_left = current_vertical + this.data.building_separation / 2;
        }
        if (current_vertical > limit_right) {
            limit_right = current_vertical - this.data.building_separation / 2;;
        }
        if (current_horizontal > limit_up) {
            limit_up = current_horizontal - this.data.building_separation / 2;;
        }
        if (current_horizontal < limit_down) {
            limit_down = current_horizontal + this.data.building_separation / 2;;
        }

        // Calculate translate of the center, width and depth of the zone
        var width = Math.abs(limit_left) + Math.abs(limit_right);
        var depth = Math.abs(limit_down) + Math.abs(limit_up);

        width += 2 * increment;
        depth += 2 * increment;

        var translate_x = limit_left + width / 2 - increment;
        var translate_z = limit_down + depth / 2 - increment;
        translate = {
            x: translate_x,
            y: 0,
            z: translate_z,
        };

        return [width, depth, translate, figures];
    },

    drawElements: function (element, figures, translate) {
        let self = this

        for (let i in figures) {

            let height = figures[i].height;
            let x = figures[i].posX;
            let y = figures[i].posY;
            let position = {
                x: x - translate.x,
                y: (height / 2 + translate.y / 2),
                z: -y + translate.z
            }

            let entity = this.createElement(figures[i], position);

            if (figures[i].children) {
                // Quarter
                let legend;
                let transparentBox;
                entity.addEventListener('click', function (e) {
                    // Just launch the event on the child
                    if (e.target !== this)
                        return;

                    if (legend) {
                        entity.removeChild(transparentBox)
                        self.el.parentElement.removeChild(legend)
                        legend = undefined
                        transparentBox = undefined

                        // Remove from the array that has the entity activated
                        const index = self.entitiesWithLegend.indexOf(entity);
                        if (index > -1) {
                            self.entitiesWithLegend.splice(index, 1);
                        }
                    } else {
                        transparentBox = document.createElement('a-entity');
                        transparentBox.setAttribute('class', 'babialegend')
                        let oldGeometry = entity.getAttribute('geometry')
                        let scale = self.el.getAttribute("scale")
                        let tsBoxHeight = oldGeometry.height + self.data.height_quarter_legend_box
                        if (scale) {
                            tsBoxHeight = ((oldGeometry.height + self.data.height_quarter_legend_box) / scale.y)
                        }
                        transparentBox.setAttribute('geometry', {
                            height: tsBoxHeight,
                            depth: oldGeometry.depth,
                            width: oldGeometry.width
                        });
                        transparentBox.setAttribute('material', {
                            'visible': true,
                            'opacity': 0.4
                        });
                        entity.appendChild(transparentBox)

                        legend = generateLegend(figures[i].name, self.data.legend_scale, 'black', 'white');
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: self.data.height_quarter_legend_title,
                            z: coordinates.z
                        }
                        legend.setAttribute('position', coordinatesFinal)
                        legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(legend)

                        // Add to the elements that has the legend activated
                        self.entitiesWithLegend.push(entity)
                    }
                })

                this.drawElements(entity, figures[i].children, figures[i].translate_matrix);
            } else {
                // Building
                let legend;
                let entityGeometry;
                let alreadyActive = false;

                entity.addEventListener('click', function (e) {
                    if (e.target !== this)
                        return;

                    if (alreadyActive) {
                        legend.setAttribute('visible', false);
                        entity.setAttribute('geometry', {
                            height: entityGeometry.height - 0.1,
                            depth: entityGeometry.depth - 0.1,
                            width: entityGeometry.width - 0.1
                        });
                        entity.setAttribute('material', {
                            'color': entity.getAttribute('babiaxrFirstColor')
                        });
                        self.el.parentElement.removeChild(legend)
                        legend = undefined
                        alreadyActive = false

                        // Remove from the array that has the entity activated
                        const index = self.entitiesWithLegend.indexOf(entity);
                        if (index > -1) {
                            self.entitiesWithLegend.splice(index, 1);
                        }
                    } else {
                        alreadyActive = true

                        // If clicked again but not mouseover
                        if (!legend) {
                            // COPY FROM 626
                            entityGeometry = entity.getAttribute('geometry')
                            let boxPosition = entity.getAttribute("position")
                            entity.setAttribute('position', boxPosition)
                            entity.setAttribute('babiaxrFirstColor', entity.getAttribute("material")["color"])
                            entity.setAttribute('material', {
                                'color': 'white'
                            });
                            entity.setAttribute('geometry', {
                                height: entityGeometry.height + 0.1,
                                depth: entityGeometry.depth + 0.1,
                                width: entityGeometry.width + 0.1
                            });
                            legend = generateLegend(figures[i].name, self.data.legend_scale, 'white', 'black', JSON.parse(entity.getAttribute('babiaRawData')), self.data.height, self.data.area, self.data.depth, self.data.width, self.data.color);
                            let worldPos = new THREE.Vector3();
                            let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                            let height_real = new THREE.Box3().setFromObject(entity.object3D)
                            let coordinatesFinal = {
                                x: coordinates.x,
                                y: height_real.max.y + 1 + self.data.height_building_legend,
                                z: coordinates.z
                            }
                            legend.setAttribute('position', coordinatesFinal)
                            legend.setAttribute('visible', true);
                            self.el.parentElement.appendChild(legend);
                        }

                        // Add to the elements that has the legend activated
                        self.entitiesWithLegend.push(entity)
                    }

                })

                entity.addEventListener('mouseenter', function () {
                    if (!alreadyActive) {
                        entityGeometry = entity.getAttribute('geometry')
                        let boxPosition = entity.getAttribute("position")
                        entity.setAttribute('position', boxPosition)
                        entity.setAttribute('babiaxrFirstColor', entity.getAttribute("material")["color"])
                        entity.setAttribute('material', {
                            'color': 'white'
                        });
                        entity.setAttribute('geometry', {
                            height: entityGeometry.height + 0.1,
                            depth: entityGeometry.depth + 0.1,
                            width: entityGeometry.width + 0.1
                        });
                        legend = generateLegend(figures[i].name, self.data.legend_scale, 'white', 'black', JSON.parse(entity.getAttribute('babiaRawData')), self.data.height, self.data.area, self.data.depth, self.data.width, self.data.color);
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        let height_real = new THREE.Box3().setFromObject(entity.object3D)
                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: height_real.max.y + 1 + self.data.height_building_legend,
                            z: coordinates.z
                        }
                        legend.setAttribute('position', coordinatesFinal)
                        legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(legend);
                    }

                });
                entity.addEventListener('mouseleave', function () {
                    if (!alreadyActive && legend) {
                        legend.setAttribute('visible', false);
                        entity.setAttribute('geometry', {
                            height: entityGeometry.height - 0.1,
                            depth: entityGeometry.depth - 0.1,
                            width: entityGeometry.width - 0.1
                        });
                        entity.setAttribute('material', {
                            'color': entity.getAttribute('babiaxrFirstColor')
                        });
                        self.el.parentElement.removeChild(legend)
                        legend = undefined
                    }
                });
            }

            element.appendChild(entity);
        }

    },

    RightSide: function (element, limit_right, current_horizontal, max_right) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area);
            depth = Math.sqrt(element.area) + separation;
        } else {
            width = parseFloat(element.width);
            depth = parseFloat(element.depth) + separation;
        }
        // Calculate position
        let posX = limit_right + (width / 2) + separation;
        let posY = current_horizontal - (depth / 2);

        // Calculate states
        current_horizontal -= depth;
        let total_x = limit_right + width + separation;
        if (total_x > max_right) {
            max_right = total_x;
        }

        return [current_horizontal, posX, posY, max_right];
    },

    DownSide: function (element, limit_down, current_vertical, max_down) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area) + separation;
            depth = Math.sqrt(element.area);
        } else {
            width = parseFloat(element.width) + separation;
            depth = parseFloat(element.depth);
        }
        // Calculate position
        let posX = current_vertical - (width / 2);
        let posY = limit_down - (depth / 2) - separation;

        // Calculate state
        current_vertical -= width;
        let total_y = limit_down - depth - separation;
        if (total_y < max_down) {
            max_down = total_y;
        }

        return [current_vertical, posX, posY, max_down];
    },

    LeftSide: function (element, limit_left, current_horizontal, max_left) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area);
            depth = Math.sqrt(element.area) + separation;
        } else {
            width = parseFloat(element.width);
            depth = parseFloat(element.depth) + separation;
        }
        // Calculate position
        let posX = limit_left - (width / 2) - separation;
        let posY = current_horizontal + (depth / 2);

        // Calculate state
        current_horizontal += depth;
        let total_x = limit_left - width - separation;
        if (total_x < max_left) {
            max_left = total_x;
        }

        return [current_horizontal, posX, posY, max_left];
    },

    UpSide: function (element, limit_up, current_vertical, max_up) {
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children) {
            width = Math.sqrt(element.area) + separation;
            depth = Math.sqrt(element.area);
        } else {
            width = parseFloat(element.width) + separation;
            depth = parseFloat(element.depth);
        }
        // Calculate position
        let posX = current_vertical + (width / 2);
        let posY = limit_up + (depth / 2) + separation;

        // Calculate state
        current_vertical += width;
        let total_y = limit_up + depth + separation;
        if (total_y > max_up) {
            max_up = total_y;
        }

        return [current_vertical, posX, posY, max_up];
    },

    Animation: function (element, figures, figures_old, delta, translate, translate_old) {
        let self = this
        let new_time = Date.now();
        let entity;
        for (let i in figures) {
            if (document.getElementById(figures[i].id)) {
                // If exists
                entity = document.getElementById(figures[i].id);
                // Creating... (next ticks)
                if (figures[i].inserted) {
                    //Increment opacity
                    let opa_inc = delta / this.duration;
                    let opacity = parseFloat(entity.getAttribute('material').opacity);
                    if (opacity + opa_inc < 1) {
                        opacity += opa_inc;
                    } else {
                        opacity = 1.0;
                        figures[i].inserted = false;
                    }
                    setOpacity(entity, opacity);

                } else { 
                    // find index in old_figures
                    let cond = 'id=' + figures[i].id
                    let index = findIndex(figures_old, cond)
                    if (index < 0 ){
                        // encontrar el elemento que no esta en la escena con id y darle opacidad 
                        // y cambiar sus propiedades a la nueva si es necesario 
                        figures[i].inserted = true;
                        if (entity.getAttribute('width') != figures[i].width) {
                            entity.setAttribute('width', figures[i].width);
                        }
                        if (entity.getAttribute('height') != figures[i].height) {
                            entity.setAttribute('height', figures[i].height);
                        }
                        if (entity.getAttribute('depth') != figures[i].depth) {
                            entity.setAttribute('depth', figures[i].depth);
                        }

                    } else {
                        // RESIZE
                        this.resize(entity, new_time, delta, figures[i], figures_old[index]);
                        // TRASLATE
                        this.traslate(entity, new_time, delta, figures[i], figures_old[index], translate, translate_old);

                        if (figures[i].children) {
                            this.Animation(entity, figures[i].children, figures_old[index].children, delta, figures[i].translate_matrix, figures_old[index].translate_matrix);
                        }
                    }
                }
            } else {

                // CREATE NEW
                position = {
                    x: figures[i].posX - translate.x,
                    y: (figures[i].height / 2 + translate.y / 2),
                    z: -figures[i].posY + translate.z
                }

                let new_entity = this.createElement(figures[i], position);
                if (figures[i].children) {
                    this.drawElements(new_entity, figures[i].children, figures[i].translate_matrix);
                }

                //Opacity 0
                setOpacity(new_entity, 0);

                element.appendChild(new_entity);
                figures[i].inserted = true;

            }
        }

        // Delete figures
        let opa_dec = delta / this.duration;
        for (let i in figures_old){
            let cond = 'id=' + figures_old[i].id
            let index = findIndex(figures, cond)
            if (index < 0){
                let entity_del = document.getElementById(figures_old[i].id)
                let opacity = parseFloat(entity_del.getAttribute('material').opacity);
                if (opacity - opa_dec > 0) {
                    opacity -= opa_dec;
                } else {
                    opacity = 0.0;
                }
                setOpacity(entity_del, opacity);
            }
        }

        if ((new_time - this.start_time) > this.duration) {
            this.animation = false;
        }
    },

    resize: function (entity, new_time, delta, figure, figure_old) {
        //console.log(entity.id)
        if (((new_time - this.start_time) < this.duration) &&
            ((figure.width != figure_old.width) ||
                (figure.height != figure_old.height) ||
                (figure.depth != figure_old.depth))) {

            // Calulate increment
            let diff_width = Math.abs(figure.width - figure_old.width);
            let diff_height = Math.abs(figure.height - figure_old.height);
            let diff_depth = Math.abs(figure.depth - figure_old.depth);

            let inc_width = (delta * diff_width) / this.duration;
            let inc_height = (delta * diff_height) / this.duration;
            let inc_depth = (delta * diff_depth) / this.duration;

            let last_width = parseFloat(entity.getAttribute('width'));
            let last_height = parseFloat(entity.getAttribute('height'));
            let last_depth = parseFloat(entity.getAttribute('depth'));

            let new_width;
            if (figure.width - figure_old.width < 0) {
                new_width = last_width - inc_width;
            } else {
                new_width = last_width + inc_width;
            }

            let new_height;
            if (figure.height - figure_old.height < 0) {
                new_height = last_height - inc_height;
            } else {
                new_height = last_height + inc_height;
            }

            let new_depth;
            if (figure.depth - figure_old.depth < 0) {
                new_depth = last_depth - inc_depth;
            } else {
                new_depth = last_depth + inc_depth;
            }

            // Update size
            entity.setAttribute('width', new_width);
            entity.setAttribute('height', new_height);
            entity.setAttribute('depth', new_depth);

        } else if (((new_time - this.start_time) > this.duration) &&
            ((figure.width != figure_old.width) ||
                (figure.height != figure_old.height) ||
                (figure.depth != figure_old.depth))) {

            entity.setAttribute('width', figure.width);
            entity.setAttribute('height', figure.height);
            entity.setAttribute('depth', figure.depth);
            entity.setAttribute('babiaRawData', JSON.stringify(figure.rawData))
        }
    },

    traslate: function (entity, new_time, delta, figure, figure_old, translate, translate_old) {
        let dist_x = (figure_old.posX - translate_old.x) - (figure.posX - translate.x);
        let dist_y = (figure_old.posY - translate_old.z) - (figure.posY - translate.z);

        if (dist_x != 0 || dist_y != 0) {
            if ((new_time - this.start_time) < this.duration) {
                // Calculate increment positions
                let inc_x = (delta * dist_x) / this.duration;
                let inc_z = (delta * dist_y) / this.duration;

                let last_x = entity.getAttribute('position').x;
                let last_z = entity.getAttribute('position').z;

                let new_x = last_x - inc_x;
                let new_z = last_z + inc_z;

                let new_height = entity.getAttribute('height');

                // Update entity
                entity.setAttribute('position', {
                    x: new_x,
                    y: new_height / 2,
                    z: new_z
                });

            } else if ((new_time - this.start_time) > this.duration) {
                entity.setAttribute('position', {
                    x: figure.posX - translate.x,
                    y: figure.height / 2,
                    z: - figure.posY + translate.z
                });
            }
        }
    },

    createElement: function (figure, position) {
        let self = this
        // create entity
        //let entity = document.createElement('a-entity')
        let entity = document.createElement('a-box');
        entity.id = figure.id;
        entity.setAttribute('class', 'babiaxraycasterclass');

        // Get info 
        let width = figure.width;
        let height = figure.height;
        let depth = figure.depth;

        // set color
        if (figure.children) {
            color = self.data.base_color;;
        } else {
            if (self.data.color) {
                color = heatMapColorforValue(figure.rawData[self.data.color], self.babiaMetadata['color_max'], self.babiaMetadata['color_min'])
            } else {
                color = self.data.building_color;
            }
        }

        // create box
        entity.setAttribute('color', color);
        entity.setAttribute('width', width);
        entity.setAttribute('height', height);
        entity.setAttribute('depth', depth);
        // rawData building
        if (figure.rawData) {
            entity.setAttribute('babiaRawData', JSON.stringify(figure.rawData))
        }

        // add into scene
        entity.setAttribute('position', {
            x: position.x,
            y: position.y,
            z: position.z
        });

        return entity;
    }
})

// TODO: legend scale fix
let countDecimals = function (value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0;
}

/**
 * This function generate a plane at the top of the building with the desired text
 */
let generateLegend = (name, legend_scale, colorPlane, colorText, data, fheight, farea, fdepth, fwidth, fcolor) => {
    let width = 2;
    let height = 1;
    if (name.length > 16)
        width = name.length / 5;

    if (data) {
        let heightText = "\n " + fheight + " (height): " + Math.round(data[fheight] * 100) / 100
        if (heightText.length > 16)
            width = heightText.length / 5;
        name += heightText

        if (farea) {
            let areaText = "\n " + farea + " (area): " + Math.round(data[farea] * 100) / 100
            if (areaText.length > 16 && areaText > heightText)
                width = areaText.length / 5;
            name += areaText
        } else {
            let depthText = "\n " + fdepth + " (depth): " + Math.round(data[fdepth] * 100) / 100
            if (depthText.length > 16 && depthText > heightText)
                width = depthText.length / 5;
            name += depthText

            let widthText = "\n " + fwidth + " (width): " + Math.round(data[fwidth] * 100) / 100
            if (widthText.length > 16 && widthText > heightText && widthText > depthText)
                width = widthText.length / 5;
            name += widthText

            height = 1.5
        }

        if (fcolor) {
            let colorText = "\n " + fcolor + " (color): " + Math.round(data[fcolor] * 100) / 100
            if (colorText.length > 16 && colorText > heightText)
                width = colorText.length / 5;
            name += colorText
            height += 0.2
        }
    }

    let entity = document.createElement('a-plane');
    entity.setAttribute('babia-lookat', "[camera]");

    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', height);
    entity.setAttribute('width', width);
    entity.setAttribute('color', colorPlane);
    entity.setAttribute('material', { 'side': 'double' });
    entity.setAttribute('text', {
        'value': name,
        'align': 'center',
        'width': 6,
        'color': colorText,
        'alphaTest': 6,
        'opacity': 6,
        'transparent': false
    });
    entity.setAttribute('visible', false);
    entity.setAttribute('class', 'babialegend');
    entity.setAttribute('scale', { x: legend_scale, y: legend_scale, z: legend_scale });

    return entity;
}

function setOpacity(entity, opacity) {
    entity.setAttribute('material', 'opacity', opacity);
    if (entity.childNodes) {
        for (let i = 0; i < entity.childNodes.length; i++) {
            setOpacity(entity.childNodes[i], opacity);
        }
    }
}

let getLevels = (elements, levels) => {
    let level = levels
    let max_level = levels
    for (let i in elements) {
        if (elements[i].children) {
            level++
            levels = getLevels(elements[i].children, level)
            if (max_level < levels) {
                max_level = levels
            }
            level--
        }
    }
    return max_level;
}

/**
 * Request a JSON url
 */
let requestJSONDataFromURL = (data) => {
    let items = data.data
    let raw_items
    // Create a new request object
    let request = new XMLHttpRequest();

    // Initialize a request
    request.open('get', items, false)
    // Send it
    request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
            ////// console.log("data OK in request.response", request.response)
            // Save data
            if (typeof request.response === 'string' || request.response instanceof String) {
                raw_items = JSON.parse(request.response)

            } else {
                raw_items = request.response
            }
        } else {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        }
    };

    request.onerror = function () {
        reject({
            status: this.status,
            statusText: xhr.statusText
        });
    };
    request.send();

    return raw_items
}

let findTreeGenerator = (data, el, self) => {
    if (data.from) {
        // Save the reference to the querier
        let querierElement = document.getElementById(data.from)
        if (querierElement.components['babia-treebuilder']) {
            self.dataComponent = querierElement.components['babia-treebuilder']
        } else {
            console.error("Problem registering to the treegenerator")
            return
        }
    } else {
        // Look for a querier in the same element and register
        if (el.components['babia-treebuilder']) {
            self.dataComponent = el.components['babia-treebuilder']
        } else {
            // Look for a querier in the scene
            if (document.querySelectorAll("[babia-treebuilder]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-treebuilder]")[0].components['babia-treebuilder']
            } else {
                console.error("Error, treegenerator not found")
                return
            }
        }
    }
}

let parseEmbeddedJSONData = (embedded) => {
    let dataRetrieved = JSON.parse(embedded)
    return dataRetrieved
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

let getMaxMinColorValues = (data, colorfield, max, min) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].children) {
            [max, min] = getMaxMinColorValues(data[i].children, colorfield, max, min)
        } else {
            if (data[i][colorfield] !== "null" && !max || data[i][colorfield] > max) {
                max = data[i][colorfield]
            }
            if (data[i][colorfield] !== "null" && !min || data[i][colorfield] < min) {
                min = data[i][colorfield]
            }
        }
    }
    return [max, min]
}

function heatMapColorforValue(val, max, min) {

    //Blue to red
    let color2 = [19, 82, 138]
    let color1 = [255, 94, 83]

    let value = ((val || 0) - min) / (max - min)

    var p = value;
    var w = p * 2 - 1;
    var w1 = (w / 1 + 1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2)];
    return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";

}

let findIndex = (list, condicion) => {
    condicion = condicion.split('=')
    //console.log(condicion)
    for (i = 0; i < list.length; i++){
        if (list[i][condicion[0]] === condicion[1]){
            return i
        }
    }
    return -1
}