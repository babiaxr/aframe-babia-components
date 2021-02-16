/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-island', {
    schema: {
        data: { type: 'asset' },
        from: { type: 'string' },
        border: { type: 'number', default: 0.5 },
        width: { type: 'string', default: 'width' },
        depth: { type: 'string', default: 'depth' },
        area: { type: 'string' },
        height: { type: 'string', default: 'height' },
        building_separation: { type: 'number', default: 0.25 },
        extra: { type: 'number', default: 1.0 },
        levels: { type: 'number' }
    },

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
        this.figures = [];

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
        console.log('Data Loaded.');

        let el = this.el;
        let elements = JSON.parse(JSON.stringify(items))

        // Calculate Increment
        let increment;
        if (this.data.levels) {
            increment = this.data.border * this.data.extra * this.data.levels;
        } else {
            // Find last level
            let levels = getLevels(elements, 0);
            console.log("Levels:" + levels);
            increment = this.data.border * this.data.extra * (levels + 1);
        }

        // Register all figures before drawing
        let t = { x: 0, y: 0, z: 0 };
        [x, y, t, this.figures] = this.generateElements(elements, this.figures, t, increment);

        // Draw figures
        t.x = 0;
        t.z = 0;
        if (!this.figures_old) {
            this.drawElements(el, this.figures, t);
            this.figures_old = this.figures;
        } else {
            console.log("Updating elements...");
            this.animation = true;
            this.start_time = Date.now();
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
            if (this.data.width){
                elements[i].width = elements[i][this.data.width]
            }
            if (this.data.height){
                elements[i].height = elements[i][this.data.height]
            }
            if (this.data.depth){
                elements[i].depth = elements[i][this.data.depth]
            }
            if (this.data.area){
                elements[i].area = elements[i][this.data.area]
            }   
            if (elements[i].children) {
                //console.log("ENTER to the quarter...")
                this.quarter = true;
                var children = [];
                var translate_matrix;
                // Save Zone's parameters
                elements[i].height = 0.3;
                increment -= this.data.border * this.data.extra;
                [elements[i].width, elements[i].depth, translate_matrix, children] = this.generateElements(elements[i].children, children, translate_matrix, increment);
                translate_matrix.y = elements[i].height;
                increment = inc;
                //console.log("====> CHILDREN:");
                //console.log(children);
                //console.log("EXIT to the quarter... ")
            }
            if (i == 0) {
                if (this.data.area && !elements[i].children) {
                    limit_up += Math.sqrt(elements[i].area) / 2;
                    limit_down -= Math.sqrt(elements[i].area) / 2;
                    limit_right += Math.sqrt(elements[i].area) / 2;
                    limit_left -= Math.sqrt(elements[i].area) / 2;
                } else {
                    limit_up += elements[i].depth / 2;
                    limit_down -= elements[i].depth / 2;
                    limit_right += elements[i].width / 2;
                    limit_left -= elements[i].width / 2;
                }
                //console.log("==== RIGHT SIDE ====");
                current_horizontal = limit_up + this.data.building_separation / 2;
            } else if (elements[i].height > 0) {
                if (up) {
                    [current_vertical, posX, posY, max_up] = this.UpSide(elements[i], limit_up, current_vertical, max_up);
                    if (current_vertical > limit_right) {
                        current_vertical += this.data.building_separation / 2;
                        max_right = current_vertical;
                        up = false;
                        right = true;
                        //console.log("==== RIGHT SIDE ====");
                        if (max_left < limit_left) {
                            limit_left = max_left;
                        }
                        current_horizontal = limit_up + this.data.building_separation / 2;
                    }
                } else if (right) {
                    [current_horizontal, posX, posY, max_right] = this.RightSide(elements[i], limit_right, current_horizontal, max_right);
                    // To pass next step
                    if (current_horizontal < limit_down) {
                        current_horizontal += this.data.building_separation / 2;
                        max_down = current_horizontal;
                        right = false;
                        down = true;
                        //console.log("==== LOWER SIDE ====");
                        if (max_up > limit_up) {
                            limit_up = max_up;
                        }
                        current_vertical = limit_right + this.data.building_separation / 2;
                    }
                } else if (down) {
                    [current_vertical, posX, posY, max_down] = this.DownSide(elements[i], limit_down, current_vertical, max_down);
                    if (current_vertical < limit_left) {
                        current_vertical -= this.data.building_separation / 2;
                        max_left = current_vertical;
                        down = false;
                        left = true;
                        //console.log("==== LEFT SIDE ====");
                        if (max_right > limit_right) {
                            limit_right = max_right;
                        }
                        current_horizontal = limit_down - this.data.building_separation / 2;
                    }
                } else if (left) {
                    [current_horizontal, posX, posY, max_left] = this.LeftSide(elements[i], limit_left, current_horizontal, max_left);
                    if (current_horizontal > limit_up) {
                        current_horizontal -= this.data.building_separation / 2;
                        max_up = current_horizontal;
                        left = false;
                        up = true;
                        //console.log("==== UPPER SIDE ====");
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
                    id: "island-" + elements[i].id,
                    posX: posX,
                    posY: posY,
                    width: elements[i].width,
                    height: elements[i].height,
                    depth: elements[i].depth,
                    children: children,
                    translate_matrix: translate_matrix
                }
            } else {
                if (this.data.area) {
                    figure = {
                        id: "island-" + elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: Math.sqrt(elements[i].area),
                        height: elements[i].height,
                        depth: Math.sqrt(elements[i].area)
                    }
                } else {
                    figure = {
                        id: "island-" + elements[i].id,
                        posX: posX,
                        posY: posY,
                        width: elements[i].width,
                        height: elements[i].height,
                        depth: elements[i].depth
                    }
                }
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

    drawElements: function (element, figures, translate) {
        console.log('Drawing elements....')
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
                this.drawElements(entity, figures[i].children, figures[i].translate_matrix);
            } else {
                let legend = generateLegend(entity.id, height, entity.getAttribute('position'), this.el);
                entity.appendChild(legend);

                entity.addEventListener('mouseenter', function () {
                    legend.setAttribute('visible', true);
                });
                entity.addEventListener('mouseleave', function () {
                    legend.setAttribute('visible', false);
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
        current_vertical -= depth + separation;
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
        current_vertical += depth + separation;
        let total_y = limit_up + depth + separation;
        if (total_y > max_up) {
            max_up = total_y;
        }

        return [current_vertical, posX, posY, max_up];
    },

    Animation: function (element, figures, figures_old, delta, translate, translate_old) {
        let new_time = Date.now();
        let entity;
        for (let i in figures) {
            if (document.getElementById(figures[i].id)) {
                entity = document.getElementById(figures[i].id);
                if (figures[i].inserted) {
                    //Increment opacity
                    let opa_inc = delta / this.duration;
                    let opacity = parseFloat(entity.getAttribute('material').opacity);
                    if (opacity + opa_inc < 1) {
                        opacity += opa_inc;
                    } else {
                        opacity = 1.0;
                    }
                    setOpacity(entity, opacity);

                } else {
                    // RESIZE
                    this.resize(entity, new_time, delta, figures[i], figures_old[i]);
                    // TRASLATE
                    this.traslate(entity, new_time, delta, figures[i], figures_old[i], translate, translate_old);

                    if (figures[i].children) {
                        this.Animation(entity, figures[i].children, figures_old[i].children, delta, figures[i].translate_matrix, figures_old[i].translate_matrix);
                    }
                }
            } else {

                position = {
                    x: figures[i].posX - translate.x,
                    y: (figures[i].height / 2 + translate.y / 2),
                    z: -figures[i].posY + translate.z
                }

                let new_entity = this.createElement(figures[i], position);
                if (figures[i].children) {
                    this.drawElements(new_entity, figures[i].children, figures[i].translate_matrix);
                }

                let legend = generateLegend(new_entity.id, figures[i].height, new_entity.getAttribute('position'), this.el);
                new_entity.appendChild(legend);

                new_entity.addEventListener('mouseenter', function () {
                    legend.setAttribute('visible', true);
                });
                new_entity.addEventListener('mouseleave', function () {
                    legend.setAttribute('visible', false);
                });

                //Opacity 0
                setOpacity(new_entity, 0);

                element.appendChild(new_entity);
                figures[i].inserted = true;

            }
        }

        if ((new_time - this.start_time) > this.duration) {
            this.animation = false;
            this.figures_old = this.figures;
        }
    },

    resize: function (entity, new_time, delta, figure, figure_old) {
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
            color = "#98e690";
        } else {
            color = "#E6B9A1";
        }

        // create box
        entity.setAttribute('color', color);
        entity.setAttribute('width', width);
        entity.setAttribute('height', height);
        entity.setAttribute('depth', depth);

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

let generateLegend = (text, heightItem, boxPosition, rootEntity) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height = heightItem

    let entity = document.createElement('a-plane');
    entity.setAttribute('look-at', "[camera]");

    entity.setAttribute('position', { x: boxPosition.x, y: boxPosition.y + height / 2 + 1, z: boxPosition.z });
    entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('material', { 'side': 'double' });
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black',
    });
    entity.setAttribute('visible', false);

    //Set Scale
    let scaleParent = rootEntity.getAttribute("scale")
    if (scaleParent && (scaleParent.x !== scaleParent.y || scaleParent.x !== scaleParent.z)) {
        let scalefixes = Math.max(...[countDecimals(scaleParent.x), countDecimals(scaleParent.y), countDecimals(scaleParent.z)]) - 1
        let multiplyer = Math.pow(10, scalefixes)
        entity.setAttribute('scale', { x: (1 / scaleParent.x) / multiplyer, y: (1 / scaleParent.y) / multiplyer, z: (1 / scaleParent.z) / multiplyer });
    }

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
    for (let i in elements) {
        if (elements[i].children) {
            level++
            levels = getLevels(elements[i].children, level)
        }
    }
    return levels;
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
        if (querierElement.components['babiaxr-treegenerator']) {
            self.dataComponent = querierElement.components['babiaxr-treegenerator']
        } else {
            console.error("Problem registering to the treegenerator")
            return
        }
    } else {
        // Look for a querier in the same element and register
        if (el.components['babiaxr-treegenerator']) {
            self.dataComponent = el.components['babiaxr-treegenerator']
        } else {
            // Look for a querier in the scene
            if (document.querySelectorAll("[babiaxr-treegenerator]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-treegenerator]")[0].components['babiaxr-treegenerator']
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