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
        border: {type: 'number', default: 0.5},
        width: {type: 'string', default: 'width'},
        depth: {type: 'string', default: 'depth'},
        area: {type: 'string'},
        height: {type: 'string', default: 'height'},
        building_separation: {type: 'number', default: 0.25}
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        console.log("WELCOME TO BABIAXR ISLAND")
        //Load de json file
		this.loader = new THREE.FileLoader();
		let data = this.data;
		if (data.data) {
			this.loader.load(data.data, this.onDataLoaded.bind(this));
		}
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {},
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    tick: function (t, delta) {},

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

    onDataLoaded: function (file) { 
		console.log('Data Loaded');

        var el = this.el;
        let elements = JSON.parse(file);
        let increment = this.data.border;

        // Register all figures before drawing
        let figures = [];
        let t = {x: 0, y: 0, z: 0};
        [x, y, t, figures] = this.generateElements(elements, figures, t, increment);

        // Draw figures
        t.x = 0;
        t.z = 0;
        this.drawElements(el, figures, t);
    },
    
    generateElements: function (elements, figures, translate, inc){

        //console.log(elements);
        let increment = inc;  // TEMPORAL increment = inc
 
        // Vertical Limits
        let limit_up = 0;
        let limit_down = 0;
        // Horizontal Limits
        let limit_right = 0;
        let limit_left = 0; 

        //Position Figure
        let posX = 0; 
        let posY = 0;

        // Aux to update the limits
        // Save max limit to update last limit in the next step
        let max_right = 0;
        let max_left = 0;
        let max_down = 0;
        let max_up = 0;

        // control points
        let current_vertical = 0;
        let current_horizontal = 0;

        // Controllers
        let up = false;
        let down = false;
        let left = false;
        let right = true;


        /**
         * Get each element and set its position respectly
         * Then save all data in figures array
         */
        for (let i = 0; i < elements.length; i++){
            if (elements[i].children){
                //console.log("ENTER to the quarter...")
                var children = [];
                var translate_matrix;
                // Save Zone's parameters
                elements[i][this.data.height] = 0.3;
                [elements[i][this.data.width], elements[i][this.data.depth], translate_matrix ,children] = this.generateElements(elements[i].children, children, translate_matrix, increment+inc);
                translate_matrix.y = elements[i][this.data.height];
                //console.log("====> CHILDREN:");
                //console.log(children);
                //console.log("EXIT to the quarter... ")
            }
            if (i == 0){
                if (this.data.area && !elements[i].children){
                    limit_up += Math.sqrt(elements[i][this.data.area]) / 2;
                    limit_down -= Math.sqrt(elements[i][this.data.area]) / 2;
                    limit_right += Math.sqrt(elements[i][this.data.area]) / 2;
                    limit_left -= Math.sqrt(elements[i][this.data.area]) / 2; 
                } else {
                    limit_up += elements[i][this.data.depth] / 2;
                    limit_down -= elements[i][this.data.depth] / 2;
                    limit_right += elements[i][this.data.width] / 2;
                    limit_left -= elements[i][this.data.width] / 2; 
                }
                //console.log("==== RIGHT SIDE ====");
                current_horizontal = limit_up;
            } else {
                if (up){
                    [current_vertical, posX, posY, max_up] = this.UpSide(elements[i], limit_up, current_vertical, max_up);
                    if (current_vertical > limit_right){
                        max_right = current_vertical;
                        up = false;
                        right = true;
                        //console.log("==== RIGHT SIDE ====");
                        if (max_left < limit_left){
                            limit_left = max_left;
                        }
                        current_horizontal = limit_up;
                    }
                } else if (right){
                    [current_horizontal, posX, posY, max_right] = this.RightSide(elements[i], limit_right, current_horizontal, max_right);
                    // To pass next step
                    if ( current_horizontal < limit_down){
                        max_down = current_horizontal;
                        right = false;
                        down = true;
                        //console.log("==== LOWER SIDE ====");
                        if (max_up > limit_up){
                            limit_up = max_up;
                        }
                        current_vertical = limit_right;
                    }
                } else if (down){ 
                    [current_vertical, posX, posY, max_down] = this.DownSide(elements[i], limit_down, current_vertical, max_down);
                    if (current_vertical < limit_left){
                        max_left = current_vertical;
                        down = false;
                        left = true;
                        //console.log("==== LEFT SIDE ====");
                        if (max_right > limit_right){
                            limit_right = max_right;
                        }
                        current_horizontal = limit_down;
                    }
                } else if (left){
                    [current_horizontal, posX, posY, max_left] = this.LeftSide(elements[i], limit_left, current_horizontal, max_left);
                    if (current_horizontal > limit_up){
                        max_up = current_horizontal;
                        left = false;
                        up = true;
                        //console.log("==== UPPER SIDE ====");
                        if (max_down < limit_down){
                            limit_down = max_down;
                        }
                        current_vertical = limit_left;
                    }
                }
            }

            // Save information about the figure
            let figure
            if (elements[i].children){
                // Calculate 
                figure = {
                    id : elements[i].id,
                    posX : posX,
                    posY : posY,
                    width : elements[i][this.data.width],
                    height : elements[i][this.data.height],
                    depth : elements[i][this.data.depth],
                    children: children,
                    translate_matrix: translate_matrix
                }   
            } else {
                if (this.data.area){
            
                    figure = {
                        id : elements[i].id,
                        posX : posX,
                        posY : posY,
                        width : Math.sqrt(elements[i][this.data.area]),
                        height : elements[i][this.data.height],
                        depth : Math.sqrt(elements[i][this.data.area])
                    }
                    console.log(figure.width);
                } else {
                    figure = {
                        id : elements[i].id,
                        posX : posX,
                        posY : posY,
                        width : elements[i][this.data.width],
                        height : elements[i][this.data.height],
                        depth : elements[i][this.data.depth]
                    }
                }   
            }
            figures.push(figure);
            //console.log(figure);
            
            // Group finished
            if (i == elements.length - 1){
                // Check and update last limits
                if (max_down < limit_down){
                    limit_down = max_down;
                }
                if (max_left < limit_down){
                    limit_left = max_left;
                }
                if (max_up > limit_up){
                    limit_up = max_up;
                }
                if (max_right > limit_right){
                    limit_right = max_right;
                }
                
                if (current_vertical < limit_left){
                    limit_left = current_vertical;
                }
                if (current_vertical > limit_right){
                    limit_right = current_vertical;
                }
                if (current_horizontal > limit_up){
                    limit_up = current_horizontal;
                }
                if (current_horizontal < limit_down){
                    limit_down = current_horizontal;
                }

                // Calculate translate of the center, width and depth of the zone
                var width = Math.abs(limit_left) + Math.abs(limit_right);
                var depth = Math.abs(limit_down) + Math.abs(limit_up);

                var translate_x = limit_left + width / 2 ;
                var translate_z = limit_down  + depth / 2;
                translate = { 
                    x: translate_x,
                    y: 0,
                    z: translate_z,
                };

                width += increment;
                depth += increment;
            }
        }
    
        return [width, depth, translate, figures];      
    },

    drawElements: function (element, figures, translate){
        console.log(figures);
        console.log('Drawing elements....')
        for (let i in figures){
            // create entity
            let entity = document.createElement('a-entity')
            entity.id = figures[i].id;
            entity.setAttribute('class', 'babiaxraycasterclass');

            // Get info 
            let width = figures[i].width;
            let height = figures[i].height;
            let depth = figures[i].depth;
            let x = figures[i].posX;
            let y = figures[i].posY;
 
            // set color
            if (figures[i].children){
                color = "#98e690";
            } else {
                color = "#E6B9A1";
            }
            // create box
            let geometry = new THREE.BoxBufferGeometry( width, height, depth ); 
            let material = new THREE.MeshPhongMaterial({color: color});
            let cube = new THREE.Mesh( geometry, material );
    
            // add into scene
            entity.setObject3D('mesh', cube);
            entity.setAttribute('position', {
                x: x - translate.x,
                y: (height /2 + translate.y / 2), 
                z: -y + translate.z
            });

            if (figures[i].children){
                this.drawElements(entity, figures[i].children, figures[i].translate_matrix);
            } else {
                let legend = generateLegend(entity.id, height, entity.getAttribute('position'));
                entity.appendChild(legend);
    
                entity.addEventListener('mouseenter', function(){
                    legend.setAttribute('visible', true);
                });
                entity.addEventListener('mouseleave', function(){
                    legend.setAttribute('visible', false);
                });
            }

            element.appendChild(entity);
        }

    },

    RightSide: function (element, limit_right, current_horizontal, max_right){
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children){
            width = Math.sqrt(element[this.data.area]);
            depth = Math.sqrt(element[this.data.area]);
        } else {
            width = parseFloat(element[this.data.width]);
            depth = parseFloat(element[this.data.depth]);
        }
        // Calculate position
        let posX = limit_right + ((width + separation) / 2);
        let posY = current_horizontal - ((depth + separation ) / 2);
    
        // Calculate states
        current_horizontal -= depth + (separation / 2) ; 
        let total_x = limit_right + width + (separation / 2);
        if ( total_x > max_right){
            max_right = total_x;
        }
            
        return [current_horizontal, posX, posY, max_right];
    },
    
    DownSide: function (element, limit_down, current_vertical, max_down){
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children){
            width = Math.sqrt(element[this.data.area]);
            depth = Math.sqrt(element[this.data.area]);
        } else {
            width = parseFloat(element[this.data.width]);
            depth = parseFloat(element[this.data.depth]);
        }
        // Calculate position
        let posX = current_vertical - ((width + separation) / 2);
        let posY = limit_down - ((depth + separation) / 2);
    
        // Calculate state
        current_vertical -= depth + (separation / 2); 
        let total_y = limit_down - depth - (separation / 2);
        if (total_y < max_down){
            max_down = total_y;
        }      
    
        return [current_vertical, posX, posY, max_down];
    },
    
    LeftSide: function (element, limit_left, current_horizontal, max_left){
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children){
            width = Math.sqrt(element[this.data.area]);
            depth = Math.sqrt(element[this.data.area]);
        } else {
            width = parseFloat(element[this.data.width]);
            depth = parseFloat(element[this.data.depth]);
        }
        // Calculate position
        let posX = limit_left - ((width + separation) / 2);
        let posY = current_horizontal + ((depth + separation) / 2);
    
        // Calculate state
        current_horizontal += depth + separation / 2;   
        let total_x = limit_left - width - (separation / 2) ;
        if ( total_x < max_left){
            max_left = total_x;
        }    
    
        return [current_horizontal, posX, posY, max_left];
    },
    
    UpSide: function (element, limit_up, current_vertical, max_up){
        let separation = parseFloat(this.data.building_separation);
        let width, depth;
        if (this.data.area && !element.children){
            width = Math.sqrt(element[this.data.area]);
            depth = Math.sqrt(element[this.data.area]);
        } else {
            width = parseFloat(element[this.data.width]);
            depth = parseFloat(element[this.data.depth]);
        }
        // Calculate position
        let posX = current_vertical + ((width+ separation) / 2);
        let posY = limit_up + ((depth + separation) / 2);
    
        // Calculate state
        current_vertical += depth + (separation / 2);
        let total_y = limit_up + depth + (separation / 2);
        if ( total_y > max_up ){
            max_up = total_y;
        } 
    
        return [current_vertical, posX, posY, max_up];
    },
})

let generateLegend = (text, heightItem, boxPosition) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height = heightItem

    let entity = document.createElement('a-plane');

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

    return entity;
}
