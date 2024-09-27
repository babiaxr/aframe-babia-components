let findProdComponent = require('../others/common').findProdComponent;
let updateFunction = require('../others/common').updateFunction;
const colorsArray = require('../others/common').colors.palettes['categoric'];

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

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
        // Maximum height for a building, in VR units (meters)
        maxBuildingHeight: { type: 'number', default: 2 },
        // Minimum height for a building, in VR units (meters)
        minBuildingHeight: { type: 'number', default: 0.03 },
        // Differential heights for buildings (the height of
        // buildings is calculated relative to the difference between
        // highest and lowest value)
        diffBuildingHeight: { type: 'boolean', default: false },
        zone_elevation: { type: 'number', default: 0.01 },
        building_separation: { type: 'number', default: 0.25 },
        extra: { type: 'number', default: 1.0 },
        levels: { type: 'number' },
        building_color: { type: 'string', default: "#E6B9A1" },
        buildingAlpha: { type: 'number', default: 1 },
        gradientBaseColor: { type: 'boolean', default: false },
        base_color: { type: 'color', default: '#98e690' },
        baseAlpha: { type: 'number', default: 1 },
        // To add into the doc
        height_quarter_legend_box: { type: 'number', default: 11 },
        height_quarter_legend_title: { type: 'number', default: 12 },
        height_building_legend: { type: 'number', default: 0 },
        legend_scale: { type: 'number', default: 1 },
        legend_lookat: { type: 'string', default: "[camera]" },
        metricsInfoId: { type: 'string', default: "" },
        highlightQuarter: { type: 'boolean', default: false },
        hideQuarterBoxLegend: { type: 'boolean', default: false },
        highlightQuarterByClick: { type: 'boolean', default: false },
        field: { type: 'string', default: 'uid' },

        // Numeric color legend entity to hide/show
        numericColorLegendId: { type: 'string' },

        // Highlight building by field
        highlightBuildingByField: { type: 'string' },
        highlightBuildingByFieldColor: { type: 'string', default: 'white' },

        // Wireframe & Transparency by repeated IDs
        wireframeByRepeatedField: { type: 'string' },
        transparent80ByRepeatedField: { type: 'string' },
        transparent20ByRepeatedField: { type: 'string' },

        // Autoscale when animating or starting
        autoscale: { type: 'boolean', default: false },
        autoscaleSizeX: { type: 'number', default: 3 },
        autoscaleSizeZ: { type: 'number', default: 3 },
        //autoscaleSizeY: { type: 'number', default: 2 }

        // New layout
        treeLayout: { type: 'boolean', default: false },
        treeQuartersLevelHeight: { type: 'number', default: 0.2 },
        treeFixQuarterHeight: { type: 'boolean', default: false },
        treeHideOneSonQuarters: { type: 'boolean', default: false }
    },

    /**
    * Entities with legend activated
    */
    entitiesWithLegend: [],
    legendsActive: [],

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Where the data is gonna be stored
     */
    newData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * List of visualization properties
     */
    visProperties: ['height', 'area', 'width', 'depth', 'color'],

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
     * 
     */
    duration: 2000,
    figures_del: [],
    figures_in: [],
    animation: false,
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
        updateFunction(this, oldData)
    },

    /** 
     * Already autoscaled
    */
    alreadyAutoscaled: false,
    autoscaleBoats: function () {
        const self = this
        // 2 for X and 2 for Y
        let bbox = new THREE.Box3().setFromObject(this.el.object3D)
        let finalSizeX = bbox.max.x - bbox.min.x
        let finalSizeY = bbox.max.y - bbox.min.y
        let finalSizeZ = bbox.max.z - bbox.min.z

        let currentScale = this.el.getAttribute("scale")
        if (!currentScale) {
            currentScale = { x: 1, y: 1, z: 1 }
        }

        this.el.setAttribute("scale", { x: eval(this.data.autoscaleSizeX / finalSizeX) * currentScale.x, y: currentScale.y, z: eval(this.data.autoscaleSizeZ / finalSizeZ) * currentScale.z })
    },

    /**
    * Called on each scene tick.
    */
    tick: function (t, delta) {
        let self = this;

        // First time to autoscale
        if (this.data.autoscale && !this.alreadyAutoscaled) {
            let bbox = new THREE.Box3().setFromObject(this.el.object3D)
            if (bbox.min.x !== Infinity) {
                this.autoscaleBoats()
                this.alreadyAutoscaled = true
            }
        }

        if (this.animation) {
            let t = { x: 0, y: 0, z: 0 };
            if ((Date.now() - this.start_time) > this.duration) {
                this.animation = false;
                this.setFigures(this.figures, t);

                // Animation finished, set autoscale if activated
                if (this.data.autoscale) {
                    this.autoscaleBoats()
                }

                //Reactivate legends, check PERFORMANCE
                self.entitiesWithLegend = self.entitiesWithLegend.filter(item => document.getElementById(item.entity.id))
                self.entitiesWithLegend.forEach(item => {
                    let entity = item.entity
                    let figure = item.figure

                    if (figure.children) {
                        // Quarter
                        entity.legend = generateLegend(figure.name, self.data.legend_scale, self.data.legend_lookat, 'black', 'white');
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: self.data.height_quarter_legend_title,
                            z: coordinates.z
                        }
                        entity.legend.setAttribute('position', coordinatesFinal)
                        entity.legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(entity.legend)

                        self.legendsActive.push(entity.legend)
                        entity.alreadyActive = true
                    } else {
                        // Building
                        entity.legend = generateLegend(figure.name, self.data.legend_scale, self.data.legend_lookat, 'white', 'black', entity.babiaRawData, self.data.height, self.data.area, self.data.depth, self.data.width, self.data.color);
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        let height_real = new THREE.Box3().setFromObject(entity.object3D)
                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: height_real.max.y + 1 + self.data.height_building_legend,
                            z: coordinates.z
                        }
                        entity.legend.setAttribute('position', coordinatesFinal)
                        entity.legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(entity.legend);

                        self.legendsActive.push(entity.legend)
                        entity.alreadyActive = true
                    }
                });
            } else {
                this.Animation(this.el, this.figures, this.figures_old, delta, t, t);
            }
        }
    },

    updateChart: function (items) {
        //console.log('Data Loaded.');
        let t = { x: 0, y: 0, z: 0 };
        this.idsToNotRepeatWireframe = []
        this.idsToNotRepeat20Transparent = []
        this.idsToNotRepeat80Transparent = []

        // when animation not finished, delete figures and opa 1 to inserted
        if (this.animation) {
            this.figures_del.forEach(figure => {
                let entity = document.getElementById(figure.id);
                if (entity) {
                    entity.remove();
                }
            })
            this.figures_in.forEach(figure => {
                let entity = document.getElementById(figure.id);
                if (entity) {
                    setOpacity(entity, 1.0);
                }
            })
            this.setFigures(this.figures, t);
            this.animation = false;
            this.figures_del = [];
            this.figures_in = [];
        }

        this.figures_old = this.figures;
        this.figures = [];

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
            if (this.figures_old !== this.figures) {
                this.animation = true;
                this.start_time = Date.now();
            }
        }
    },

    /**
     * For the categoric colors
     */
    categoricColorIndex: 0,
    categoricColorMaps: {},

    /**
     * generateElements
     * 
     * Generate width, depth and translation coords for the center,
     * and list of figures to visualize, from a tree of data elements and
     * a partial list of figures.
     * 
     * Each element is a data element, obtained from the data to visualize,
     * which may include children elements (so, in fact, it may also be the root
     * of a tree of elements).
     * 
     * Each figure includes all data needed to visualize it (which will be done
     * later, in another function).
     * 
     * @param {*} elements Array of elements
     * @param {*} figures Array of figures
     * @param {*} translate Translation from the center
     * @param {*} inc Increment
     * @returns [width, depth, translate, figures]
     */
    generateElements: function (elements, figures, translate, inc) {
        const self = this;
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
            // To do not overwrite newData
            let element = {}
            if (this.data.width) {
                element.width = elements[i][this.data.width] || 0.5
            }
            if (this.data.height) {
                let height_min = 0;
                if (self.data.diffBuildingHeight) {
                    height_min = self.babiaMetadata['heightMin'];
                };
                element.height = self.normalizeValues(height_min,
                    self.babiaMetadata['heightMax'],
                    self.data.minBuildingHeight,
                    self.data.maxBuildingHeight,
                    elements[i][this.data.height])
                    || this.data.minBuildingHeight
            }
            if (this.data.depth) {
                element.depth = elements[i][this.data.depth] || 0.5
            }
            if (this.data.area) {
                element.area = elements[i][this.data.area] || 0.5
            }
            if (elements[i].children) {
                // There are elements hanging from this element
                element.children = elements[i].children
                this.quarter = true;
                var children = [];
                var translate_matrix;
                // Save Zone's parameters
                // Check scale because it should be abosulte, not relative
                let scale = self.el.getAttribute("scale")
                if (!scale) {
                    scale = { x: 1, y: 1, z: 1 }
                }
                element.height = this.data.zone_elevation / scale.y;
                increment -= this.data.border * this.data.extra;

                // TEST TREE
                if (self.data.treeLayout) {
                    element.children.forEach(el => {
                        if (!el.children) {
                            element.treeMetaphorHeight = el[self.data.height]
                            return
                        }
                    });
                }

                [element.width, element.depth, translate_matrix, children]
                    = this.generateElements(element.children, children, translate_matrix, increment);
                translate_matrix.y = element.height;
                increment = inc;
            }
            if (i == 0) {
                // This is the first element to place
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
            // First, fill in common properties, then add those specific for
            // bases or buildings
            let figure = {
                id: "boat-" + elements[i][this.data.field],
                posX: posX,
                posY: posY,
                height: element.height,
                translate_matrix: translate_matrix
            }

            if (elements[i].children) {
                // This is the base for a quarter
                figure.name = elements[i][this.data.field] || '',
                    figure.width = element.width,
                    figure.depth = element.depth,
                    figure.children = children,
                    figure.alpha = self.data.baseAlpha,
                    figure.translate_matrix = translate_matrix
                // TEST TREE
                if (self.data.treeLayout) {
                    figure.treeMetaphorHeight = element.treeMetaphorHeight
                }
                // Gradient color
                let hierarchyLevel = figure.name.split("/").length - 1
                figure.hierarchyLevel = hierarchyLevel
                figure.renderOrder = hierarchyLevel
                if (self.data.gradientBaseColor) {
                    figure.color = greenColorsurface(Math.round(
                        self.normalizeValues(1,
                            self.babiaMetadata['maxLevels'],
                            15,
                            100,
                            hierarchyLevel)
                    ));
                } else {
                    figure.color = self.data.base_color;
                }
            } else {
                // This is a building
                figure.name = (elements[i].name) ? elements[i].name : elements[i][this.data.field],
                    figure.alpha = self.data.buildingAlpha
                if (this.data.area) {
                    figure.width = Math.sqrt(element.area);
                    figure.depth = Math.sqrt(element.area);
                } else {
                    figure.width = element.width;
                    figure.depth = element.depth;
                };
                if (typeof elements[i][self.data.color] === 'number') {
                    figure.color = heatMapColorforValue(elements[i][self.data.color], self.babiaMetadata['color_max'], self.babiaMetadata['color_min'])
                } else if (typeof elements[i][self.data.color] === 'string') {
                    // Categoric color
                    if (elements[i][self.data.color] in self.categoricColorMaps) {
                        figure.color = self.categoricColorMaps[elements[i][self.data.color]]
                    } else {
                        self.categoricColorMaps[elements[i][self.data.color]] = colorsArray[self.categoricColorIndex]
                        figure.color = colorsArray[self.categoricColorIndex]

                        self.categoricColorIndex = self.categoricColorIndex + 1
                        if (self.categoricColorIndex >= colorsArray.length) {
                            self.categoricColorIndex = 0
                        }
                    }
                }



            }
            figure.rawData = elements[i]

            // If transparency by a field on buildings
            // Put transparent 80% to those buildings that share same value for a field selected
            if (self.data.transparent80ByRepeatedField && (!figure.children && self.idsToNotRepeat80Transparent.includes(figure.rawData[self.data.transparent80ByRepeatedField]))) {
                figure.alpha = 0.8
                figure.renderOrder = 2000
            } else {
                self.idsToNotRepeat80Transparent.push(figure.rawData[self.data.transparent80ByRepeatedField])
            }

            // Put transparent 20% to those buildings that share same value for a field selected
            if (self.data.transparent20ByRepeatedField && (!figure.children && self.idsToNotRepeat20Transparent.includes(figure.rawData[self.data.transparent20ByRepeatedField]))) {
                figure.alpha = 0.45
                figure.renderOrder = 2000
            } else {
                self.idsToNotRepeat20Transparent.push(figure.rawData[self.data.transparent20ByRepeatedField])
            }

            // Put wireframe to those buildings that share same value for a field selected
            if (self.data.wireframeByRepeatedField && (!figure.children && self.idsToNotRepeatWireframe.includes(figure.rawData[self.data.wireframeByRepeatedField]))) {
                figure.wireframe = true
            } else {
                figure.wireframe = false
                self.idsToNotRepeatWireframe.push(figure.rawData[self.data.wireframeByRepeatedField])
            }



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

    // If wireframerepeated activated
    idsToNotRepeatWireframe: [],
    idsToNotRepeat80Transparent: [],
    idsToNotRepeat20Transparent: [],

    drawElements: function (element, figures, translate) {
        const self = this

        for (let i in figures) {

            let height = figures[i].height;
            let x = figures[i].posX;
            let y = figures[i].posY;
            let position = {
                x: x - translate.x,
                y: (height / 2 + translate.y / 2),
                z: -y + translate.z
            }

            // TEST TREE
            if (self.data.treeLayout) {
                // // Hide quarters that has not children
                if (self.data.treeHideOneSonQuarters && (figures[i].children && figures[i].children.length === 1)) {
                    figures[i].alphaTest = 1
                    figures[i].dontAddEvents = true
                    figures[i].children[0].dontAddLine = true
                }

                if (self.data.treeFixQuarterHeight) {
                    // Fix position y for quarters
                    // Check if not undefined because if it is 0, it returns false (thx JS)
                    if (figures[i].treeMetaphorHeight !== undefined) {
                        position.y = (height / 2 + translate.y / 2) + self.data.treeQuartersLevelHeight
                    } else {
                        position.y = ((height / 2 + translate.y / 2)) - self.data.treeQuartersLevelHeight - self.data.zone_elevation

                        if (figures[i].height < self.data.treeQuartersLevelHeight) {
                            // If flag to hide activated and the parent has only one son, not needed to draw the line
                            if (!(self.data.treeHideOneSonQuarters && figures[i].dontAddLine)) {
                                // First get top
                                let topBuildingY = position.y
                                // Get where the quarter is
                                let quarterPosY = position.y + (self.data.treeQuartersLevelHeight - (height / 2))
                                // Draw the line in the space
                                let line = document.createElement('a-entity')
                                line.setAttribute('class', 'babiaboatstreelines')
                                line.setAttribute('line', {
                                    start: { x: position.x, y: topBuildingY, z: position.z },
                                    end: { x: position.x, y: quarterPosY, z: position.z },
                                    color: 'yellow'
                                })
                                element.appendChild(line)
                            }

                        }
                    }
                } else {
                    // Quarters on top of the buildings
                    if (figures[i].treeMetaphorHeight !== undefined) {
                        let height_min = 0;
                        if (self.data.diffBuildingHeight) {
                            height_min = self.babiaMetadata['heightMin'];
                        };
                        position.y = (self.normalizeValues(height_min,
                            self.babiaMetadata['heightMax'],
                            self.data.minBuildingHeight,
                            self.data.maxBuildingHeight,
                            figures[i].treeMetaphorHeight))
                    } else {
                        position.y = ((height / 2 + translate.y / 2)) - height - 0.001
                    }
                }

            }

            let entity = this.createElement(figures[i], position);
            this.addEvents(entity, figures[i]);




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

        // First, remove all the legends that are active
        self.legendsActive.forEach(legend => {
            legend.remove()
        });
        self.legendsActive = []

        for (let i in figures) {
            if (document.getElementById(figures[i].id)) {
                // If exists
                entity = document.getElementById(figures[i].id);
                // Creating... (next ticks)
                if (figures[i].inserted) {

                    //TODO: This code increments the opacity in the animation part, but it adds several performance issues
                    //Increment opacity
                    // let opa_inc = delta / this.duration;
                    // let opacity = parseFloat(entity.getAttribute('material').opacity);
                    // if (opacity + opa_inc < 1) {
                    //     opacity += opa_inc;
                    // } else {
                    //     opacity = 1.0;
                    //     figures[i].inserted = false;
                    // }
                    //setOpacity(entity, opacity);

                    // If animation stops before finish
                    let cond = 'id=' + figures[i].id
                    if (findIndex(self.figures_in, cond) < 0) {
                        self.figures_in.push(figures[i])
                    }

                } else {
                    // find index in old_figures
                    let cond = 'id=' + figures[i].id
                    let index = findIndex(figures_old, cond)

                    // Update rawData
                    entity.babiaRawData = figures[i].rawData
                    if (index < 0) {
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
                        if (entity.getAttribute('color') != figures[i].color) {
                            entity.setAttribute('color', figures[i].color);
                        }
                        if (entity.getAttribute('material').wireframe != figures[i].wireframe) {
                            entity.setAttribute('material', 'wireframe', figures[i].wireframe);
                            entity.setAttribute('material', 'wireframeLinewidth', 0.1);
                        }

                    } else {
                        // RESIZE
                        this.resize(entity, new_time, delta, figures[i], figures_old[index]);
                        // TRASLATE
                        this.traslate(entity, new_time, delta, figures[i], figures_old[index], translate, translate_old);
                        // COLOR
                        if (entity.getAttribute('color') != figures[i].color && !self.inEntitiesWithLegend(entity)) {
                            entity.setAttribute('color', figures[i].color);
                        }
                        if (entity.getAttribute('material').wireframe != figures[i].wireframe) {
                            entity.setAttribute('material', 'wireframe', figures[i].wireframe);
                            entity.setAttribute('material', 'wireframeLinewidth', 0.1);
                        }
                        if (entity.getAttribute('material').opacity != figures[i].alpha) {
                            entity.setAttribute('material', 'opacity', figures[i].alpha);
                            entity.object3D.renderOrder = figures[i].renderOrder
                        }

                        if (figures[i].children) {
                            this.Animation(entity, figures[i].children, figures_old[index].children, delta, figures[i].translate_matrix, figures_old[index].translate_matrix);
                        } else {
                            // Building color if changed, force to the new one
                            if (figures[i].rawData[self.data.color] !== figures_old[index].rawData[self.data.color]) {
                                // Color numeric or categoric
                                let color
                                if (typeof figures[i].rawData[self.data.color] === 'number') {
                                    color = heatMapColorforValue(figures[i].rawData[self.data.color], self.babiaMetadata['color_max'], self.babiaMetadata['color_min'])
                                } else if (typeof figures[i].rawData[self.data.color] === 'string') {
                                    // Categoric color
                                    if (figures[i].rawData[self.data.color] in self.categoricColorMaps) {
                                        color = self.categoricColorMaps[figures[i].rawData[self.data.color]]
                                    } else {
                                        self.categoricColorMaps[figures[i].rawData[self.data.color]] = colorsArray[self.categoricColorIndex]
                                        color = colorsArray[self.categoricColorIndex]

                                        self.categoricColorIndex = self.categoricColorIndex + 1
                                        if (self.categoricColorIndex >= colorsArray.length) {
                                            self.categoricColorIndex = 0
                                        }
                                    }
                                }


                                let oldColor = entity.getAttribute('color')
                                if (color !== oldColor) {
                                    entity.setAttribute('color', color)
                                }
                            }
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
                this.addEvents(new_entity, figures[i]);

                //TODO: bad perfomance when Opacity 0 at the beginning
                //setOpacity(new_entity, 0);

                // New building and quarter, it appears with 0.5 opacity
                setOpacity(new_entity, 0.5);

                element.appendChild(new_entity);
                figures[i].inserted = true;
            }
        }

        // Delete figures
        let opa_dec = delta / this.duration;
        for (let i in figures_old) {
            let deleted = false;
            let cond = 'id=' + figures_old[i].id
            let index = findIndex(figures, cond)
            if (index < 0) {
                if (findIndex(self.figures_del, cond) < 0) {
                    self.figures_del.push(figures_old[i])
                }
                let entity_del = document.getElementById(figures_old[i].id);
                if (entity_del) {

                    //TODO: Bad perfomance issue when changing dinamically the opacity, better to just make it non vissible
                    entity_del.object3D.visible = false
                    entity_del.remove();

                    // let opacity = parseFloat(entity_del.components.material.opacity);
                    // if (opacity - opa_dec > 0) {
                    //     opacity -= opa_dec;
                    // } else {
                    //     opacity = 0.0;
                    //     deleted = true;
                    //     self.figures_del.pop(figures_old[i]);
                    // }
                    // setOpacity(entity_del, opacity);
                    // if (deleted) {
                    //     entity_del.remove();
                    // }
                }
            }
        }
    },

    inEntitiesWithLegend(obj) {
        let i;
        for (i = 0; i < this.entitiesWithLegend.length; i++) {
            if (this.entitiesWithLegend[i].entity === obj) {
                return true;
            }
        }

        return false;
    },

    setFigures: function (figures, translate) {
        const self = this
        figures.forEach(figure => {
            let entity = document.getElementById(figure.id);
            if (entity) {
                if (entity.getAttribute('width') != figure.width) {
                    entity.setAttribute('width', figure.width);
                }
                if (entity.getAttribute('height') != figure.height) {
                    entity.setAttribute('height', figure.height);
                }
                if (entity.getAttribute('depth') != figure.depth) {
                    entity.setAttribute('depth', figure.depth);
                }
                // If legend active, don't force change color, put it as the color before
                if (self.inEntitiesWithLegend(entity)) {
                    entity.setAttribute('babiaxrFirstColor', figure.color)
                } else {
                    if (entity.getAttribute('color') != figure.color) {
                        entity.setAttribute('color', figure.color);
                    }
                }

                //TODO: Full opacity because it was in 0.5 if new building/quarter
                if (entity.components.material.data.opacity < 1) {
                    setOpacity(entity, 1)
                }

                // Quarters to alpha if tree fix position
                if (entity.getAttribute('material').opacity != figure.alpha) {
                    entity.setAttribute('material', 'opacity', figure.alpha);
                }

                // TEST TREE 
                if (self.data.treeLayout) {
                    // Hide quarters that has not children
                    if (self.data.treeHideOneSonQuarters && (figure.children && figure.children.length === 1)) {
                        figure.alphaTest = 1
                        figure.dontAddEvents = true
                        figure.children[0].dontAddLine = true
                    }

                    if (self.data.treeFixQuarterHeight) {
                        // Fix position y for quarters
                        if (figure.treeMetaphorHeight !== undefined) {
                            entity.object3D.position.set(
                                figure.posX - translate.x,
                                (figure.height / 2 + translate.y / 2) + self.data.treeQuartersLevelHeight,
                                (- figure.posY + translate.z),
                            )
                        } else {
                            let positionYFixed = ((figure.height / 2 + translate.y / 2)) - self.data.treeQuartersLevelHeight - self.data.zone_elevation
                            let positionX = figure.posX - translate.x
                            let positionZ = (- figure.posY + translate.z)
                            entity.object3D.position.set(
                                positionX,
                                positionYFixed,
                                positionZ,
                            )
                            // DRAW LINE WHEN DOES NOT ACHIEVE THE QUARTER (TOO LOW)
                            if (figure.height < self.data.treeQuartersLevelHeight) {
                                // If flag to hide activated and the parent has only one son, not needed to draw the line
                                if (!(self.data.treeHideOneSonQuarters && figure.dontAddLine)) {
                                    // First get top
                                    let topBuildingY = positionYFixed
                                    // Get where the quarter is
                                    let quarterPosY = positionYFixed + (self.treeQuartersLevelHeight - figure.height / 2)
                                    // Draw the line in the space
                                    let line = document.createElement('a-entity')
                                    line.setAttribute('class', 'babiaboatstreelines')
                                    line.setAttribute('line', {
                                        start: { x: positionX, y: topBuildingY, z: positionZ },
                                        end: { x: positionX, y: quarterPosY, z: positionZ },
                                        color: 'yellow'
                                    })
                                    entity.parentElement.appendChild(line)
                                }
                            }
                        }
                    } else {
                        if (figure.treeMetaphorHeight !== undefined) {
                            let height_min = 0;
                            if (self.data.diffBuildingHeight) {
                                height_min = self.babiaMetadata['heightMin'];
                            };
                            entity.object3D.position.set(
                                figure.posX - translate.x,
                                self.normalizeValues(height_min,
                                    self.babiaMetadata['heightMax'],
                                    self.data.minBuildingHeight,
                                    self.data.maxBuildingHeight,
                                    figure.treeMetaphorHeight),
                                - figure.posY + translate.z,
                            )
                        } else {
                            entity.object3D.position.set(
                                figure.posX - translate.x,
                                ((figure.height / 2 + translate.y / 2)) - figure.height - 0.001,
                                (- figure.posY + translate.z),
                            )
                        }
                    }
                } else {
                    // Lo de no tree, lo que estaba antes
                    entity.object3D.position.set(
                        figure.posX - translate.x,
                        ((parseFloat(figure.height) + translate.y) / 2),
                        (- figure.posY + translate.z),
                    )
                }

                if (figure.children) {
                    this.setFigures(figure.children, figure.translate_matrix);
                }
            }
        });
    },

    resize: function (entity, new_time, delta, figure, figure_old) {
        const self = this
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

            //Check if has transparent box as a quarter
            if (entity.classList.contains('babiaquarterboxactivated')) {
                entity.childNodes.forEach(child => {
                    if (child.classList.contains('babiaquarterlegendbox')) {
                        child.setAttribute('geometry', 'width', new_width);
                        child.setAttribute('geometry', 'depth', new_depth);
                        child.setAttribute('material', 'opacity', 0.4);
                    }
                });
            }


        } else if (((new_time - this.start_time) > this.duration) &&
            ((figure.width != figure_old.width) ||
                (figure.height != figure_old.height) ||
                (figure.depth != figure_old.depth))) {

            entity.setAttribute('width', figure.width);
            entity.setAttribute('height', figure.height);
            entity.setAttribute('depth', figure.depth);

            //Check if has transparent box as a quarter
            if (entity.classList.contains('babiaquarterboxactivated')) {
                entity.childNodes.forEach(child => {
                    if (child.classList.contains('babiaquarterlegendbox')) {
                        child.setAttribute('geometry', 'width', new_width);
                        child.setAttribute('geometry', 'depth', new_depth);
                        child.setAttribute('material', 'opacity', 0.4);
                    }
                });
            }
        }
    },

    traslate: function (entity, new_time, delta, figure, figure_old, translate, translate_old) {
        let dist_x = (figure_old.posX - translate_old.x) - (figure.posX - translate.x);
        let dist_y = (figure.height - figure_old.height);
        let dist_z = (figure_old.posY - translate_old.z) - (figure.posY - translate.z);

        if (dist_x != 0 || dist_y != 0 || dist_z != 0) {
            if ((new_time - this.start_time) < this.duration) {
                // Calculate increment positions
                let inc_x = (delta * dist_x) / this.duration;
                let inc_y = (delta * dist_y) / (2 * this.duration);
                let inc_z = (delta * dist_z) / this.duration;

                let last_x = parseFloat(entity.object3D.position.x);
                let last_y = parseFloat(entity.object3D.position.y);
                let last_z = parseFloat(entity.object3D.position.z);

                let new_x = last_x - inc_x;
                let new_y = last_y + inc_y;
                let new_z = last_z + inc_z;


                // Update entity
                entity.object3D.position.set(
                    new_x,
                    new_y,
                    new_z
                )

            } else if ((new_time - this.start_time) > this.duration) {
                entity.object3D.position.set(
                    (figure.posX - translate.x),
                    ((parseFloat(figure.height) + translate.y) / 2),
                    (- figure.posY + translate.z),
                )
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
            // Gradient color depending on the level for the base
            let hierarchyLevel = figure.name.split("/").length - 1
            figure.hierarchyLevel = hierarchyLevel
            entity.object3D.renderOrder = hierarchyLevel
            if (self.data.gradientBaseColor) {
                color = greenColorsurface(Math.round(self.normalizeValues(1, self.babiaMetadata['maxLevels'], 15, 100, hierarchyLevel)));
            } else {
                color = self.data.base_color;
            }
        } else {
            if (self.data.color) {
                if (typeof figure.rawData[self.data.color] === 'number') {
                    color = heatMapColorforValue(figure.rawData[self.data.color], self.babiaMetadata['color_max'], self.babiaMetadata['color_min'])
                } else if (typeof figure.rawData[self.data.color] === 'string') {
                    // Categoric color
                    if (figure.rawData[self.data.color] in self.categoricColorMaps) {
                        color = self.categoricColorMaps[figure.rawData[self.data.color]]
                    } else {
                        self.categoricColorMaps[figure.rawData[self.data.color]] = colorsArray[self.categoricColorIndex]
                        color = colorsArray[self.categoricColorIndex]

                        self.categoricColorIndex = self.categoricColorIndex + 1
                        if (self.categoricColorIndex >= colorsArray.length) {
                            self.categoricColorIndex = 0
                        }
                    }
                } else {
                    color = self.data.building_color;
                }
            } else {
                color = self.data.building_color;
            }
        }

        // create box
        entity.setAttribute('color', color);
        // Store init color
        entity.setAttribute('babiaxrFirstColor', color)
        entity.setAttribute('width', width);
        entity.setAttribute('height', height);
        entity.setAttribute('depth', depth);
        entity.object3D.renderOrder = figure.renderOrder
        // rawData building
        if (figure.rawData) {
            entity.babiaRawData = figure.rawData
        }

        // Higlight repeated
        if (self.data.highlightBuildingByField && figure.rawData) {
            entity.setAttribute("babia-highlightbuildingbyfield", String(figure.rawData[self.data.highlightBuildingByField]).replace("/", "").replace("@", ""))
        }

        // add into scene
        entity.setAttribute('position', {
            x: position.x,
            y: position.y,
            z: position.z
        });

        // add opacity
        entity.setAttribute('material', 'opacity', figure.alpha);

        // add opacity
        entity.setAttribute('material', 'wireframe', figure.wireframe);
        entity.setAttribute('material', 'wireframeLinewidth', 0.1);

        // transparent if alphaTest
        if (figure.alphaTest) {
            entity.setAttribute('material', 'alphaTest', figure.alphaTest);
            entity.removeAttribute('class');
        }

        return entity;
    },

    /*
    * Process data obtained from producer
    */
    processData: function (_data) {
        const self = this
        //console.log("processData", _data);
        let data = this.data;
        this.newData = _data;
        this.babiaMetadata = { id: this.babiaMetadata.id++ };
        this.categoricColorMaps = {}
        this.categoricColorIndex = 0

        // If color metric activated, save in the metadata the max and min value for mapping
        if (data.color) {
            let [color_max, color_min, color_values] = getMaxMinValues(this.newData, data.color, [])
            this.babiaMetadata['color_max'] = color_max
            this.babiaMetadata['color_min'] = color_min
            let colorAvg = Math.round(color_values.reduce((a, b) => a + b, 0) / color_values.length)
            this.babiaMetadata['colorAvg'] = colorAvg
        }
        // Get important data for normalize metrics
        let [heightMax, heightMin, height_values] = getMaxMinValues(this.newData, data.height, [])
        this.babiaMetadata['heightMax'] = heightMax
        this.babiaMetadata['heightMin'] = heightMin
        let heightAvg = Math.round(height_values.reduce((a, b) => a + b, 0) / height_values.length)
        this.babiaMetadata['heightAvg'] = heightAvg
        this.babiaMetadata['maxLevels'] = getLevels(this.newData, 0)

        if (data.area) {
            let [areaMax, areaMin, area_values] = getMaxMinValues(this.newData, data.area, [])
            this.babiaMetadata['areaMax'] = areaMax
            this.babiaMetadata['areaMin'] = areaMin
            this.babiaMetadata['areaAvg'] = Math.round(area_values.reduce((a, b) => a + b, 0) / area_values.length)
        } else {
            let [widthMax, widthMin, width_values] = getMaxMinValues(this.newData, data.width, [])
            this.babiaMetadata['widthMax'] = widthMax
            this.babiaMetadata['widthMin'] = widthMin
            this.babiaMetadata['widthAvg'] = Math.round(width_values.reduce((a, b) => a + b, 0) / width_values.length)

            let [depthMax, depthMin, depth_values] = getMaxMinValues(this.newData, data.depth, [])
            this.babiaMetadata['depthMax'] = depthMax
            this.babiaMetadata['depthMin'] = depthMin
            this.babiaMetadata['depthAvg'] = Math.round(depth_values.reduce((a, b) => a + b, 0) / depth_values.length)
        }

        // Update place where metric info if activated
        if (this.data.metricsInfoId) {
            let text = `Metrics information\nMETRIC (FIELD): MIN - MAX - AVG\n\nHeight (${data.height}) - ${heightMin} - ${heightMax} - ${heightAvg}`
            if (this.data.area) {
                text += `\nArea (${data.area}) - ${this.babiaMetadata['areaMin']} - ${this.babiaMetadata['areaMax']} - ${this.babiaMetadata['areaAvg']}`
            } else {
                text += `\nWidth (${data.width}) - ${this.babiaMetadata['widthMin']} - ${this.babiaMetadata['widthMax']} - ${this.babiaMetadata['widthAvg']}`
                text += `\nDepth (${data.depth}) - ${this.babiaMetadata['depthMin']} - ${this.babiaMetadata['depthMax']} - ${this.babiaMetadata['depthAvg']}`
            }

            if (this.data.color && typeof this.babiaMetadata['color_max'] !== 'string') {
                document.getElementById(this.data.numericColorLegendId).setAttribute("visible", true)
                text += `\nColor (${data.color}) - ${this.babiaMetadata['color_min']} - ${this.babiaMetadata['color_max']} - ${this.babiaMetadata['colorAvg']}`
            }


            let placeToInsertInfo = document.getElementById(this.data.metricsInfoId)
            placeToInsertInfo.setAttribute('text', {
                'value': text,
                'align': 'center',
                'width': 3,
                'color': 'black',
                'alphaTest': 6,
                'opacity': 6,
                'transparent': false
            })
        }

        this.notiBuffer.set(this.newData)

        // Remove lines if activated the fixed position
        if (this.data.treeLayout && this.data.treeFixQuarterHeight) {
            this.removeTreeLines()
        }

        // Create city
        this.updateChart(this.newData)

        // Categoric color legend
        if (this.data.metricsInfoId && typeof (this.babiaMetadata['color_max']) !== "number") {
            // Hide numericlegend
            document.getElementById(self.data.numericColorLegendId).setAttribute("visible", false)

            // If already exists, just show
            if (self.entityCatColorLegend) {
                self.entityCatColorLegend.remove()
                self.entityCatColorLegend = undefined
            }
            let placeToInsertInfo = document.getElementById(this.data.metricsInfoId)
            self.entityCatColorLegend = document.createElement("a-plane")
            self.entityCatColorLegend.setAttribute("position", '-3 0 0')
            self.entityCatColorLegend.setAttribute("width", 2.8)
            self.entityCatColorLegend.setAttribute("height", 5)
            self.entityCatColorLegend.setAttribute("position", '-3 0 0')
            self.entityCatColorLegend.setAttribute("material", 'color', "#B7B7B7")
            let posY = 2.2
            let text = `COLOR LEGEND (${this.data.color})`
            let entity = document.createElement("a-entity")
            entity.setAttribute('text', {
                'value': text,
                'align': 'center',
                'width': 3,
                'color': 'black',
            })
            entity.setAttribute("position", { x: 0, y: posY, z: 0 })
            posY = posY - 0.2
            self.entityCatColorLegend.appendChild(entity)
            for (const [key, value] of Object.entries(this.categoricColorMaps)) {
                let text = `${key}: ${value}`;
                let entity = document.createElement("a-entity")
                entity.setAttribute('text', {
                    'value': text,
                    'align': 'center',
                    'width': 3,
                    'color': value,
                })
                entity.setAttribute("position", { x: 0, y: posY, z: 0 })
                posY = posY - 0.15
                self.entityCatColorLegend.appendChild(entity)

            }
            placeToInsertInfo.appendChild(self.entityCatColorLegend)
        } else if (this.data.metricsInfoId && typeof (this.babiaMetadata['color_max']) === "number") {
            if (self.entityCatColorLegend) {
                self.entityCatColorLegend.remove()
                self.entityCatColorLegend = undefined
            }
        }
    },

    removeTreeLines: function () {
        let currentLines = this.el.querySelectorAll(".babiaboatstreelines");
        for (line of currentLines) {
            line.remove()
        }
    },

    normalizeValues: function (valmin, valmax, newmin, newmax, val) {
        return (((val - valmin) / (valmax - valmin)) * (newmax - newmin)) + newmin;
    },

    addEvents: function (entity, figure) {
        let self = this;
        if (figure.children) {
            // Quarter
            // dont add events flag (if transparent)
            if (!figure.dontAddEvents) {
                let transparentBox;
                
                entity.addEventListener('click', function (e) {
                    // Just launch the event on the child
                    if (e.target !== this)
                        return;

                    if (entity.legend) {
                        // Only if it not activated
                        if (!self.data.hideQuarterBoxLegend) {
                            self.el.parentElement.removeChild(transparentBox)
                        }

                        // Only if highlighted activated
                        if (self.data.highlightQuarterByClick) {
                            entity.setAttribute('material', 'color', entity.getAttribute('babiaxrFirstColor'))
                            entity.setAttribute('babiaxrHightlightedByClick', false)
                        }

                        entity.classList.remove("babiaquarterboxactivated");
                        self.el.parentElement.removeChild(entity.legend)

                        // Remove from the array that has the entity activated and the legend
                        const index = self.entitiesWithLegend.findIndex(item => item.entity === entity);
                        if (index > -1) {
                            self.entitiesWithLegend.splice(index, 1);
                        }
                        const indexLegend = self.legendsActive.indexOf(entity.legend);
                        if (index > -1) {
                            self.legendsActive.splice(indexLegend, 1);
                        }

                        entity.legend = undefined
                        transparentBox = undefined

                    } else {
                        // Global coordinates
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        

                        if (!self.data.hideQuarterBoxLegend) {
                            transparentBox = document.createElement('a-entity');
                            transparentBox.setAttribute('class', 'babiaquarterlegendbox')
                            entity.classList.add("babiaquarterboxactivated");
                            let oldGeometry = entity.getAttribute('geometry')
                            let scale = self.el.getAttribute("scale") || { x: 1, y: 1, z: 1 }
                            let tsBoxHeight = (oldGeometry.height * scale.y) + self.data.height_quarter_legend_box
                            transparentBox.setAttribute('geometry', {
                                height: tsBoxHeight,
                                depth: oldGeometry.depth * scale.z,
                                width: oldGeometry.width * scale.x
                            });
                            transparentBox.setAttribute('material', {
                                'visible': true,
                                'opacity': 0.4
                            });
                            // This is because the webGL render order does not work well with the transparencies
                            transparentBox.object3D.renderOrder = 1000000000

                            transparentBox.setAttribute('position', coordinates)
                            self.el.parentElement.appendChild(transparentBox)
                        }

                        // If quarter is highlighted using the click
                        if (self.data.highlightQuarterByClick) {
                            //entity.setAttribute('babiaxrFirstColor', entity.getAttribute("material")["color"])
                            entity.setAttribute('material', 'color', '#bfbfbf')
                        }

                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: self.data.height_quarter_legend_title,
                            z: coordinates.z
                        }
                        entity.legend = generateLegend(figure.name, self.data.legend_scale, self.data.legend_lookat, 'black', 'white');
                        entity.legend.setAttribute('position', coordinatesFinal)
                        entity.legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(entity.legend)

                        // Add to the elements that has the legend activated
                        self.entitiesWithLegend.push({ 'figure': figure, 'entity': entity })
                        self.legendsActive.push(entity.legend)
                    }
                })
            }

            this.drawElements(entity, figure.children, figure.translate_matrix);
        } else {
            // Building
            let entityGeometry;
            entity.alreadyActive = false;

            entity.addEventListener('click', function (e) {
                if (e.target !== this)
                    return;

                if (entity.alreadyActive) {
                    // Remove Higlight quarter
                    if (self.data.highlightQuarter) {
                        if (parseInt(entity.parentElement.getAttribute('babiaxrHightlighted')) == 1) {
                            let oldPosition = entity.parentElement.getAttribute('position')
                            entity.parentElement.setAttribute("position", { x: oldPosition.x, y: entity.parentElement.getAttribute('babiaxrFirstYPosition'), z: oldPosition.z })
                            entity.parentElement.setAttribute('material', {
                                'color': entity.parentElement.getAttribute('babiaxrFirstColor')
                            });
                            entity.parentElement.setAttribute('babiaxrHightlighted', 0)
                        } else {
                            let currentActives = parseInt(entity.parentElement.getAttribute('babiaxrHightlighted'))
                            entity.parentElement.setAttribute('babiaxrHightlighted', currentActives - 1)
                        }
                    }


                    entity.legend.setAttribute('visible', false);
                    entity.setAttribute('geometry', {
                        height: entityGeometry.height - 0.1,
                        depth: entityGeometry.depth - 0.1,
                        width: entityGeometry.width - 0.1
                    });
                    entity.setAttribute('material', {
                        'color': entity.getAttribute('babiaxrFirstColor')
                    });
                    self.el.parentElement.removeChild(entity.legend)

                    // Remove from the array that has the entity activated
                    const index = self.entitiesWithLegend.findIndex(item => item.entity === entity);
                    if (index > -1) {
                        self.entitiesWithLegend.splice(index, 1);
                    }
                    const indexLegend = self.legendsActive.indexOf(entity.legend);
                    if (index > -1) {
                        self.legendsActive.splice(indexLegend, 1);
                    }

                    // Remove Hihglight by field
                    if (self.data.highlightBuildingByField) {
                        let fieldValue = entity.getAttribute("babia-highlightbuildingbyfield")
                        let toRemoveHighlight = document.querySelectorAll(`[babia-highlightbuildingbyfield=${fieldValue}]`)
                        toRemoveHighlight.forEach(element => {
                            if (entity !== element) {
                                if (element.highlightbuildingbyfieldactive && !element.alreadyActive) {
                                    let oldColor = element.getAttribute('babiaxrBeforeBuildingHighlight')
                                    element.setAttribute("material", "color", oldColor)
                                    element.highlightbuildingbyfieldactive = false
                                }
                            }
                        });
                    }

                    entity.legend = undefined
                    entity.alreadyActive = false
                } else {
                    // Avoid to click if higlighted by building field
                    if (entity.highlightbuildingbyfieldactive) {
                        return
                    }

                    entity.alreadyActive = true

                    // If clicked again but not mouseover
                    if (!entity.legend) {
                        // COPY FROM 626
                        entityGeometry = entity.getAttribute('geometry')
                        let boxPosition = entity.getAttribute('position')
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
                        entity.legend = generateLegend(figure.name, self.data.legend_scale, self.data.legend_lookat, 'white', 'black', entity.babiaRawData, self.data.height, self.data.area, self.data.depth, self.data.width, self.data.color);
                        let worldPos = new THREE.Vector3();
                        let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                        let height_real = new THREE.Box3().setFromObject(entity.object3D)
                        let coordinatesFinal = {
                            x: coordinates.x,
                            y: height_real.max.y + 1 + self.data.height_building_legend,
                            z: coordinates.z
                        }
                        entity.legend.setAttribute('position', coordinatesFinal)
                        entity.legend.setAttribute('visible', true);
                        self.el.parentElement.appendChild(entity.legend);
                    }

                    // Higlight quarter
                    if (self.data.highlightQuarter) {
                        if (!entity.parentElement.getAttribute('babiaxrHightlighted') || parseInt(entity.parentElement.getAttribute('babiaxrHightlighted')) == 0) {
                            let oldPosition = entity.parentElement.getAttribute("position")
                            entity.parentElement.setAttribute('babiaxrFirstYPosition', oldPosition.y)
                            entity.parentElement.setAttribute("position", { x: oldPosition.x, y: oldPosition.y + 0.2, z: oldPosition.z })
                            entity.parentElement.setAttribute('material', 'color', '#bfbfbf')
                            entity.parentElement.setAttribute('babiaxrHightlighted', 1)
                        } else {
                            let currentActives = parseInt(entity.parentElement.getAttribute('babiaxrHightlighted'))
                            entity.parentElement.setAttribute('babiaxrHightlighted', currentActives + 1)
                        }
                    }

                    // Hihglight by field
                    if (self.data.highlightBuildingByField) {
                        let fieldValue = entity.getAttribute("babia-highlightbuildingbyfield")
                        let toHighlight = document.querySelectorAll(`[babia-highlightbuildingbyfield=${fieldValue}]`)
                        toHighlight.forEach(element => {
                            if (entity !== element && !element.highlightbuildingbyfieldactive && !element.alreadyActive) {
                                element.highlightbuildingbyfieldactive = true
                                element.setAttribute('babiaxrBeforeBuildingHighlight', element.getAttribute("material")["color"])
                                element.setAttribute("material", "color", self.data.highlightBuildingByFieldColor)
                            }
                        });
                    }

                    // Add to the elements that has the legend activated
                    self.entitiesWithLegend.push({ 'figure': figure, 'entity': entity })
                    self.legendsActive.push(entity.legend)
                }

            })

            entity.addEventListener('mouseenter', function () {
                if (!entity.alreadyActive) {
                    entityGeometry = entity.getAttribute('geometry')
                    let boxPosition = entity.getAttribute('position')
                    entity.setAttribute('position', boxPosition)
                    // If the color is not a field, it is stored at "color"
                    let firstColor = entity.getAttribute("material")["color"] !== "undefined" ? entity.getAttribute("material")["color"] : self.data.building_color;
                    entity.setAttribute('babiaxrFirstColor', firstColor)
                    entity.setAttribute('material', {
                        'color': 'white'
                    });
                    entity.setAttribute('geometry', {
                        height: entityGeometry.height + 0.1,
                        depth: entityGeometry.depth + 0.1,
                        width: entityGeometry.width + 0.1
                    });
                    entity.legend = generateLegend(figure.name, self.data.legend_scale, self.data.legend_lookat, 'white', 'black', entity.babiaRawData, self.data.height, self.data.area, self.data.depth, self.data.width, self.data.color);
                    let worldPos = new THREE.Vector3();
                    let coordinates = worldPos.setFromMatrixPosition(entity.object3D.matrixWorld);
                    let height_real = new THREE.Box3().setFromObject(entity.object3D)
                    let coordinatesFinal = {
                        x: coordinates.x,
                        y: height_real.max.y + 1 + self.data.height_building_legend,
                        z: coordinates.z
                    }
                    entity.legend.setAttribute('position', coordinatesFinal)
                    entity.legend.setAttribute('visible', true);
                    self.el.parentElement.appendChild(entity.legend);

                    // Hihglight by field
                    if (self.data.highlightBuildingByField) {
                        let fieldValue = entity.getAttribute("babia-highlightbuildingbyfield")
                        let toHighlight = document.querySelectorAll(`[babia-highlightbuildingbyfield=${fieldValue}]`)
                        toHighlight.forEach(element => {
                            if (entity !== element && !element.highlightbuildingbyfieldactive && !element.alreadyActive) {
                                element.highlightbuildingbyfieldactive = true
                                element.setAttribute('babiaxrBeforeBuildingHighlight', element.getAttribute("material")["color"])
                                element.setAttribute("material", "color", self.data.highlightBuildingByFieldColor)
                            }
                        });
                    }
                }

            });
            entity.addEventListener('mouseleave', function () {
                if (!entity.alreadyActive && entity.legend) {
                    entity.legend.setAttribute('visible', false);
                    entity.setAttribute('geometry', {
                        height: entityGeometry.height - 0.1,
                        depth: entityGeometry.depth - 0.1,
                        width: entityGeometry.width - 0.1
                    });
                    entity.setAttribute('material', {
                        'color': entity.getAttribute('babiaxrFirstColor')
                    });
                    self.el.parentElement.removeChild(entity.legend)
                    entity.legend = undefined
                }

                // Remove Hihglight by field
                if (self.data.highlightBuildingByField) {
                    if (!entity.alreadyActive && !entity.highlightbuildingbyfieldactive) {
                        let fieldValue = entity.getAttribute("babia-highlightbuildingbyfield")
                        let toRemoveHighlight = document.querySelectorAll(`[babia-highlightbuildingbyfield=${fieldValue}]`)
                        toRemoveHighlight.forEach(element => {
                            if (entity !== element) {
                                if (element.highlightbuildingbyfieldactive && !element.alreadyActive) {
                                    let oldColor = element.getAttribute('babiaxrBeforeBuildingHighlight')
                                    element.setAttribute("material", "color", oldColor)
                                    element.highlightbuildingbyfieldactive = false
                                }
                            }
                        });
                    }
                }
            });
        }
    },
})

/**
 * This function generate a plane at the top of the building with the desired text
 */
let generateLegend = (name, legend_scale, lookat, colorPlane, colorText, data, fheight, farea, fdepth, fwidth, fcolor) => {
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
            let colorText = "\n " + fcolor
            if (typeof data[fcolor] === 'string') {
                colorText += " (color): " + data[fcolor]
            } else {
                colorText += " (color): " + Math.round(data[fcolor] * 100) / 100
            }
            if (colorText.length > 16 && colorText > heightText)
                width = colorText.length / 5;
            name += colorText
            height += 0.2
        }
    }

    let entity = document.createElement('a-plane');
    entity.setAttribute('babia-lookat', lookat);

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

let getMaxMinValues = (data, field, valuesToAvg, max, min) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].children) {
            [max, min] = getMaxMinValues(data[i].children, field, valuesToAvg, max, min)
        } else {
            if (data[i][field] !== "null" && !max || data[i][field] > max) {
                max = data[i][field]
            }
            if (data[i][field] !== "null" && !(min !== undefined) || data[i][field] < min) {
                min = data[i][field]
            }
            valuesToAvg.push(data[i][field])
        }
    }
    return [max, min, valuesToAvg]
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
    for (i = 0; i < list.length; i++) {
        if (list[i][condicion[0]] === condicion[1]) {
            return i
        }
    }
    return -1
}

let greenColorsurface = (perc) => {
    return "hsl(140, 100%," + perc + "%)"
}