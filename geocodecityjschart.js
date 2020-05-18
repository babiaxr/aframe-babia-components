/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * CodeCity component for A-Frame.
 */
AFRAME.registerComponent('codecity', {
    schema: {
        // Absolute size (width and depth will be used for proportions)
        absolute: {
            type: 'boolean',
            default: false
        },
        width: {
            type: 'number',
            default: 20
        },
        depth: {
            type: 'number',
            default: 20
        },
        // Algoritm to split rectangle in buildings: naive, pivot
        split: {
            type: 'string',
            default: 'naive'
        },
        // Data to visualize
        data: {
            type: 'string',
            default: JSON.stringify({ id: "CodeCity", area: 1, height: 1 })
        },
        // Field in data items to represent as area
        farea: {
            type: 'string',
            default: 'area'
        },
        // Field in data items to represent as max_area
        fmaxarea: {
            type: 'string',
            default: 'max_area'
        },
        // Field in data items to represent as area
        fheight: {
            type: 'string',
            default: 'height'
        },
        // Merged geometries in a single mesh (improves performance)
        merged: {
            type: 'boolean',
            default: true
        },
        // Titles on top of the buildings when hovering
        titles: {
            type: 'boolean',
            default: true
        },
        // Use buffered geometries (improves performance)
        buffered: {
            type: 'boolean',
            default: false
        },
        // Base: color
        building_color: {
            type: 'color',
            default: '#E6B9A1'
        },
        building_model: {
            type: 'string',
            default: null
        },
        // Base (build it or not)
        base: {
            type: 'boolean',
            default: true
        },
        // Base: thickness
        base_thick: {
            type: 'number',
            default: 0.2
        },
        // Base: color
        base_color: {
            type: 'color',
            default: '#98e690'
        },
        // Size of border around buildings (streets are built on it)
        border: {
            type: 'number',
            default: 1
        },
        // Extra factor for total area with respect to built area
        extra: {
            type: 'number',
            default: 1.4
        },
        // Zone: elevation for each "depth" of quarters, over the previous one
        zone_elevation: {
            type: 'number',
            default: 1
        },
        // Unique color for each zone
        unicolor: {
            type: 'color',
            default: false
        },
        // Show materials as wireframe
        wireframe: {
            type: 'boolean',
            default: false
        },
        colormap: {
            type: 'array',
            default: ['blue', 'green', 'yellow', 'brown', 'orange',
                'magenta', 'grey', 'cyan', 'azure', 'beige', 'blueviolet',
                'coral', 'crimson', 'darkblue', 'darkgrey', 'orchid',
                'olive', 'navy', 'palegreen']
        },
    },

    /**
     * Set if component needs multiple instancing.
     */
    multiple: false,

    /**
     * Called once when component is attached. Generally for initial setup.
     */
    init: function () {
        this.loader = new THREE.FileLoader();
        let data = this.data;
        let el = this.el;

        if (typeof data.data == 'string') {
            if (data.data.endsWith('json')) {
                raw_items = requestJSONDataFromURL(data.data);
            } else {
                raw_items = JSON.parse(data.data);
            }
        } else {
            raw_items = data.data;
        };

        this.zone_data = raw_items;
        let zone = new Zone({
            data: this.zone_data,
            extra: function (area) { return area * data.extra; },
            farea: data.farea, fheight: data.fheight, fmaxarea: data.fmaxarea
        });

        let width, depth;
        if (data.absolute == true) {
            width = Math.sqrt(zone.areas.canvas) * data.width / data.depth;
            depth = zone.areas.canvas / width;
        } else {
            width = data.width;
            depth = data.depth
        };

        // New levels are entities relative (children of the previous level) or not
        let merged = data.merged;
        let relative = true;
        if (merged) {
            relative = false;
        };
        let canvas = new Rectangle({ width: width, depth: depth, x: 0, z: 0 });
        zone.add_rects({ rect: canvas, split: data.split, relative: relative });
        let base = document.createElement('a-entity');
        this.base = base;
        let visible = true;
        if (merged) {
            base.addEventListener('loaded', (e) => {
                if (data.building_model) {
                    console.log("In loaded, model:", base);
                    base.setAttribute('gltf-buffer-geometry-merger', { preserveOriginal: true });
                } else if (data.buffered) {
                    console.log("In loaded, buffered:", base);
                    base.setAttribute('material', { vertexColors: 'vertex' });
                    base.setAttribute('buffer-geometry-merger2', { preserveOriginal: true });
                } else {
                    console.log("In loaded, unbuffered:", base);
                    base.setAttribute('geometry-merger', { preserveOriginal: true });
                    base.setAttribute('material', { vertexColors: 'face' });
                };
            });
            if (data.buffered) {
                visible = false;
            } else {
                visible = false;
            };
        };

        console.log("Init (relative, buffered, merged):", relative, data.buffered, merged);
        zone.draw_rects({
            ground: canvas, el: base, base: data.base,
            level: 0, elevation: 0, relative: relative,
            base_thick: data.base_thick,
            wireframe: data.wireframe,
            building_color: data.building_color, base_color: data.base_color,
            model: data.building_model, visible: visible,
            buffered: data.buffered, titles: data.titles
        });
        el.appendChild(base);

        // Time Evolution starts
        if (time_evolution) {
            time_evol()
        }
    },

    /**
     * Called when component is attached and when component data changes.
     * Generally modifies the entity based on the data.
     */
    update: function (oldData) {
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
    // pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }

});

/*
 * Autoscale a component
 *
 * Based on code by Don McCurdy, used to autoscale buildings
 * https://stackoverflow.com/questions/49379435/aframe-how-to-reset-default-scale-after-loading-the-gltf-model
 */
AFRAME.registerComponent('autoscale', {
    schema: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
    init: function () {
        this.scale();
        this.el.addEventListener('object3dset', () => this.scale());
    },
    scale: function () {
        const el = this.el;
        const data = this.data;
        const span = new THREE.Vector3(data.x, data.y, data.z);
        const mesh = el.getObject3D('mesh');

        if (!mesh) return;

        // Compute bounds.
        const bbox = new THREE.Box3().setFromObject(mesh);

        // Normalize scale.
        const scale = span.divide(bbox.getSize());
        mesh.scale.set(scale.x, scale.y, scale.z);

        // Recenter.
        const offset = bbox.getCenter().multiply(scale);
        mesh.position.sub(offset);
    }
});

AFRAME.registerComponent('gltf-buffer-geometry-merger', {
    schema: {
        preserveOriginal: { default: false }
    },

    init: function () {
        let self = this;
        let models = 0;
        this.el.object3D.traverse(function (mesh) {
            if (mesh.type == 'Group') {
                for (component in mesh.el.components) {
                    if (component == 'gltf-model') {
                        models++;
                    };
                };
            };
        });

        this.el.addEventListener('model-loaded', function (e) {
            models--;
            if (models <= 0) {
                self.el.setAttribute('buffer-geometry-merger2',
                    { preserveOriginal: self.data.preserveOriginal });
            };
        });
    }
});

/*
 * Merge buffered geometries in elements in the subtree
 *
 * Based on buffer-geometry-merger
 * https://www.npmjs.com/package/aframe-geometry-merger-component
 */

AFRAME.registerComponent('buffer-geometry-merger2', {
    schema: {
        preserveOriginal: { default: false }
    },

    init: function () {
        var geometries = [];
        var material = null;
        let self = this;
        console.log("Init");

        self.el.object3D.updateMatrixWorld();
        self.el.object3D.traverse(function (mesh) {
            if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; };
            let geometry = mesh.geometry.clone();
            if (material == null) {
                material = mesh.material.clone();
            };
            let currentMesh = mesh;
            while (currentMesh !== self.el.object3D) {
                geometry.applyMatrix(currentMesh.parent.matrix);
                currentMesh = currentMesh.parent;
            }
            geometries.push(geometry);
            // Remove mesh if not preserving.
            if (!self.data.preserveOriginal) { mesh.parent.remove(mesh); }
        });

        const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        self.mesh = new THREE.Mesh(geometry, material);
        self.el.setObject3D('mesh', self.mesh);
    },


});

//AFRAME.registerComponent('buffer-geometry-merger2', {
//  schema: {
//    preserveOriginal: {default: false}
//  },
//
//  init: function () {
//    var geometries = [];
//    let self = this;
//
//    this.el.object3D.updateMatrixWorld();
//    this.el.object3D.traverse(function (mesh) {
//      if (mesh.type !== 'Mesh' || mesh.el === self.el) { return; }
//      let geometry = mesh.geometry.clone();
//      let currentMesh = mesh;
//      while (currentMesh !== self.el.object3D) {
//        geometry.applyMatrix(currentMesh.parent.matrix);
//        currentMesh = currentMesh.parent;
//      }
//      geometries.push(geometry);
//      mesh.parent.remove(mesh);
//    });
//
//    const geometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
//    this.mesh = new THREE.Mesh(geometry);
//    this.el.setObject3D('mesh', this.mesh);
//  }
//});




/*
 * face-colors component    
 * From https://github.com/supermedium/superframe/blob/master/components/geometry-merger/examples/basic/index.html
 */
AFRAME.registerComponent('face-colors', {
    dependencies: ['geometry'],
    schema: {
        color: { default: '#FFF' }
    },
    init: function () {
        var geometry;
        var i;
        geometry = this.el.getObject3D('mesh').geometry;
        for (i = 0; i < geometry.faces.length; i++) {
            geometry.faces[i].color.set(this.data.color);
        }
        geometry.colorsNeedUpdate = true;
    }
});

/*
 * vertex-colors-buffer component
 * Copied from https://github.com/supermedium/superframe/blob/master/components/geometry-merger/examples/buffer/vertex-colors-buffer.js
 */
var colorHelper = new THREE.Color();

AFRAME.registerComponent('vertex-colors-buffer', {
    schema: {
        baseColor: { type: 'color' },
        itemSize: { default: 3 }
    },

    update: function (oldData) {
        var colors;
        var data = this.data;
        var i;
        var el = this.el;
        var geometry;
        var mesh;
        var self = this;

        mesh = this.el.getObject3D('mesh');

        if (!mesh || !mesh.geometry) {
            el.addEventListener('object3dset', function reUpdate(evt) {
                if (evt.detail.type !== 'mesh') { return; }
                el.removeEventListener('object3dset', reUpdate);
                self.update(oldData);
            });
            return;
        }

        geometry = mesh.geometry;

        // Empty geometry.
        if (!geometry.attributes.position) {
            console.warn('Geometry has no vertices', el);
            return;
        }

        if (!geometry.attributes.color) {
            geometry.addAttribute('color',
                new THREE.BufferAttribute(
                    new Float32Array(geometry.attributes.position.array.length), 3
                )
            );
        }

        colors = geometry.attributes.color.array;

        // TODO: For some reason, incrementing loop by 3 doesn't work. Need to do by 4 for glTF.
        colorHelper.set(data.baseColor);
        for (i = 0; i < colors.length; i += data.itemSize) {
            colors[i] = colorHelper.r;
            colors[i + 1] = colorHelper.g;
            colors[i + 2] = colorHelper.b;
        }

        geometry.attributes.color.needsUpdate = true;
    }
});


/*
 * Class for storing zone, with all its subzones and items, to show as buildings
 */
let Zone = class {
    /*
     * Constructor, based on a tree.
     *
     * Each node of the tree must include 'id' and 'children',
     * except if it is a leaf, in wihc case must include 'id'
     * and fields for computing area and height.
     * The tree can also come as a JSON-encoded string.
     *
     * @constructor
     * @param {object} data Tree with data to store in the object
     * @param {function} extra Function to compute extra area for canvas, based on area
     * @param {string} farea Field to consider as area in leaf items
     * @param {string} fheight Field to consider as height in leaf items
     */
    constructor({ data, extra = function (area) { return area; },
        farea = 'area', fmaxarea = 'max_area', fheight = 'height' }) {
        this.data = data;
        this.id = this.data.id;
        this.extra = extra;
        this.farea = farea;
        this.fmaxarea = fmaxarea;
        this.fheight = fheight;
        this.areas = this.areas_tree();
        // Root element (a-entity) of the codecity for this Zone
        this.el = null;
        // Number of rectangles to be drawn as buildings, but still not in the scene
        this.pending_rects = 0;
    }

    /*
     * Compute areas for each node of the subree at node
     *
     *  Annotates each node with:
     *  .area: accumulated area of all children
     *  .inner: area of the inner rectangle (acc. canvas of all children)
     *  .canvas: area of the canvas for this node
     */
    areas_tree({ data = this.data, level = 0 } = {}) {
        let data_node = data;
        let node = { data: data_node };
        if ('children' in data_node) {
            node.inner = 0;
            node.area = 0;
            node.children = [];
            for (const data_child of data_node.children) {
                let child = this.areas_tree({ data: data_child, level: level + 1 });
                node.inner += child.canvas;
                node.area += child.area;
                node.children.push(child);
            };
        } else {
            // Leaf node
            node.area = data_node[this.farea];
            node.max_area = data_node[this.fmaxarea]
            node.inner = node.max_area;
            node.inner_real = node.area;
        };
        node.canvas = this.extra(node.inner, level);
        return node;
    }

    /**
     * Add rectangles to a canvas rectangle, according to info in an areas subtree
     *
     * @param {Rectangle} rect Rectangle acting as canvas for the next level
     * @param {Object} area Node of an areas tree, as it was composed by areas_tree()
     */
    add_rects({ rect, area = this.areas, relative = true, split = 'naive' } = {}) {
        // Make this the rectangle for the area, and compute its inner dimensions
        area.rect = rect;
        area.rect.inner(area.canvas, area.inner, area.inner_real);
        if ('children' in area) {
            let child_areas = new Values(area.children.map(child => child.canvas),
                area.inner);
            let child_rect;
            if (split === 'naive') {
                child_rect = area.rect.split(child_areas, relative);
                // console.log("Naive split");
            } else if (split === 'pivot') {
                child_rect = area.rect.split_pivot(child_areas, relative);
                // console.log("Pivot split");
            } else {
                throw new Error("CodeCity: Unknwon split method");
            };
            for (const i in area.children) {
                this.add_rects({
                    rect: child_rect[i],
                    area: area.children[i],
                    relative: relative,
                    split: split
                });
            };
        };
    }

    /**
     * Draw all rectangles for an area tree
     *
     * @param {Rectangle} ground Rectangle for the ground
     * @param {DOMElement} el DOM element that will be parent
     * @param {boolean} visible Draw elements with visible meshes
     * @return {number} Number of rectangles drawn
     */
    draw_rects({ ground, el, area = this.areas,
        level = 0, elevation = 0, relative = true,
        base_thick = .2, wireframe = false,
        building_color = "red", base_color = "green", model = null,
        visible = true, buffered = false, titles = true }) {
        if (level === 0) {
            this.el = el;
        };
        let pending_rects = this.pending_rects;
        if ('children' in area) {
            // Create base for this area, and go recursively to the next level
            let base = area.rect.box({
                elevation: elevation,
                height: base_thick,
                color: base_color, inner: false,
                wireframe: wireframe, visible: visible,
                buffered: buffered,
                id: area.data['id'],
                rawarea: 0
            });
            el.appendChild(base);
            let root_el = base;
            if (!relative) { root_el = el };
            for (const child of area.children) {
                let next_elevation = base_thick / 2;
                if (!relative) { next_elevation = elevation + base_thick };
                this.draw_rects({
                    ground: area.rect, el: root_el, area: child,
                    level: level + 1, elevation: next_elevation,
                    relative: relative,
                    building_color: building_color, base_color: base_color,
                    model: model,
                    base_thick: base_thick, wireframe: wireframe,
                    visible: visible, buffered: buffered, titles: titles
                });
            };
        } else {
            // Leaf node, create the building
            let height = area.data[this.fheight];
            let box = area.rect.box({
                height: area.data[this.fheight],
                elevation: elevation,
                wireframe: wireframe,
                color: building_color,
                model: model,
                visible: visible,
                buffered: buffered,
                id: area.data['id'],
                rawarea: area.data[this.farea],
                inner_real: true
            });
            box.setAttribute('class', 'mouseentertitles');
            el.appendChild(box);

            // Titles
            if (titles) {
                let legend;
                box.addEventListener('mouseenter', function () {
                    let oldGeometry = box.getAttribute('geometry')
                    this.setAttribute('geometry', {
                        height: oldGeometry.height + 0.1,
                        depth: oldGeometry.depth + 0.1,
                        width: oldGeometry.width + 0.1
                    });
                    this.setAttribute('material', {
                        'visible': true
                    });
                    legend = generateLegend(this.getAttribute("id"), this, null);
                    this.appendChild(legend)
                })

                box.addEventListener('mouseleave', function () {
                    let oldGeometry = this.getAttribute('geometry')
                    this.setAttribute('geometry', {
                        height: oldGeometry.height - 0.1,
                        depth: oldGeometry.depth - 0.1,
                        width: oldGeometry.width - 0.1
                    });
                    this.setAttribute('material', {
                        'visible': false
                    });
                    this.removeChild(legend)
                })
            }
        };
    };
};


/**
 * Class for lists (arrays) of values
 */
let Values = class {
    /*
     * @param {Array} values Array with values (Number)
     */
    constructor(values, total) {
        this.items = values;
        if (typeof (total) !== 'undefined') {
            this.total = total;
        } else {
            this.total = values.reduce((acc, a) => acc + a, 0);
        };
    }

    imax() {
        let largest = this.items[0];
        let largest_i = 0;

        for (let i = 0; i < this.items.length; i++) {
            if (largest < this.items[i]) {
                largest = this.items[i];
                largest_i = i;
            };
        };
        return largest_i;
    }

    static range(start, length) {
        var indexes = [];
        for (let i = start; i < start + length; i++) {
            indexes.push(i);
        };
        return indexes;
    }

    /*
     * Return the scaled area, for a rectangle area, of item i
     *
     * @param {Number} area Total area of the rectangle
     * @param {Integer} item Item number (starting in 0)
     */
    scaled_area(area, item) {
        return this.items[item] * area / this.total;
    }

    /*
     * Produce a Values object for items in positions
     *
     * @param {array} positions Positions of items to produce the new Values object
     */
    values_i(positions) {
        let values = [];
        for (const position of positions) {
            values.push(this.items[position])
        };
        return new Values(values);
    }

    /**
     * Produce pivot and three regions
     *
     * The array of values will be split in an element (pivot) and
     * three arrays (a1, a2, a3). The function will return the
     * index in the array of values for each of its items in the
     * pivot and the three regions.
     * This function assumes there are at least three items in the object.
     * It also assumes that the rectangle is laying.
     *
     * @return {Object} Pivot and regions, as properties of the object
     */
    pivot_regions(width, depth) {
        if (this.items.length < 3) {
            throw new Error("CodeCity - Values.pivot_regions: less than three items");
        };
        if (width < depth) {
            throw new Error("Codecity - Values.pivot_regions: rectangle should be laying");
        };
        let a1_len, a2_len, a3_len;
        let pivot_i = this.imax();
        if (this.items.lenght == pivot_i + 1) {
            // No items to the right of pivot. a2, a3 empty
            return {
                pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [], a3: []
            };
        };

        if (this.items.length == pivot_i + 2) {
            // Only one item to the right of pivot. It is a2. a3 is empty.
            return {
                pivot: pivot_i,
                a1: Values.range(0, pivot_i),
                a2: [pivot_i + 1], a3: []
            };
        };

        // More than one item to the right of pivot.
        // Compute a2 so that pivot can be as square as possible
        let area = width * depth;
        let pivot_area = this.scaled_area(area, pivot_i);
        let a2_width_ideal = Math.sqrt(pivot_area);
        let a2_area_ideal = a2_width_ideal * depth - pivot_area;

        let a2_area = 0;
        let a2_area_last = a2_area;
        let i = pivot_i + 1;
        while (a2_area < a2_area_ideal && i < this.items.length) {
            a2_area_last = a2_area;
            a2_area += this.scaled_area(area, i);
            i++;
        };
        // There are two candidates to be the area closest to the ideal area:
        // the last area computed (long), and the one that was conputed before it (short),
        // provided the last computed one is not the next to the pivot (in that case,
        // the last computed is the next to the pivot, and therefore it needs to be the
        // first in a3.
        let a3_first = i;
        if ((i - 1 > pivot_i) &&
            (Math.abs(a2_area - a2_area_ideal) > Math.abs(a2_area_last - a2_area_ideal))) {
            a3_first = i - 1;
        };

        a2_len = a3_first - pivot_i - 1;
        a3_len = this.items.length - a3_first;
        return {
            pivot: pivot_i,
            a1: Values.range(0, pivot_i),
            a2: Values.range(pivot_i + 1, a2_len),
            a3: Values.range(pivot_i + 1 + a2_len, a3_len)
        };
    }

    /*
     * Compute the width for a region, for a rectangle of given width
     * (region is a rectangles with rectangle depth as depth)
     *
     * @param {array} values Position of values belonging to region
     * @param {number} width Width of rectangle
     */
    pivot_region_width(values, width) {
        let region_total = 0;
        for (const i of values) {
            region_total += this.items[i]
        };
        return (region_total / this.total) * width;
    }

};

/*
 * Rectangles, using AFrame coordinates
 */
let Rectangle = class {
    /*
     * Build a rectangle, given its parameters
     *
     * @constructor
     * @param {number} width Width (side parallel to X axis)
     * @param {number} depth Depth (side parallel to Z axis)
     * @param {number} x X coordinate
     * @param {number} z Z coordinate
     * @param {boolean} revolved Was the rectangle revolved?
     */
    constructor({ width, depth, x = 0, z = 0 }) {
        this.width = width;
        this.depth = depth;
        this.x = x;
        this.z = z;
    }

    /*
     * Is the rectangle laying, inner dimensions?
     * (is width the longest side?)
     *
     * @return {boolean} True if width is the longest side.
     */
    is_ilaying() {
        let longest = Math.max(this.width, this.depth);
        return (longest == this.width);
    }

    /*
     * Add the inner area rectangle, assuming this is the canvas
     * Note: canvas and area are not the real area of canvas and
     * area, but the numbers used to compute the proportion
     * If there si no acanvas, it is assumed that inner is equal to canvas
     *
     * @param {number} canvas Value for area of canvas
     * @param {number} area Value for area of inner
     */
    inner(acanvas, ainner, ainner_real) {
        if (acanvas < ainner) {
            throw "Rectangle.inner: Area for inner rectangle larger than my area"
        };
        if (typeof acanvas !== 'undefined') {
            let ratio = Math.sqrt(ainner / acanvas);
            this.iwidth = ratio * this.width;
            this.idepth = ratio * this.depth;
            if (ainner_real) {
                // The area to print may be less than the max area (of the past)
                let ratio_real = Math.sqrt(ainner_real / acanvas);
                this.iwidth_real = ratio_real * this.width;
                this.idepth_real = ratio_real * this.depth;
            }
        } else {
            this.iwidth = this.width;
            this.idepth = this.depth;
        };
    }

    /*
     * Reflect (change horizontal for vertical dimensions)
     * Only for width, depth, x, y
     */
    reflect() {
        [this.width, this.depth] = [this.depth, this.width];
        [this.x, this.z] = [this.z, this.x];
    }

    /*
     * Return inner dimensions (plus position) as if rectangle was laying.
     *
     * Check if rectangle is laying. If it is not, return dimensions as if
     * reflected (but not reflect it). Last element in the resturned array
     * is a boolean indicating if values were reflected or not.
     *
     * @return {Array} Inner values: [iwidth, idepth, x, y, reflected]
     */
    idims_as_laying() {
        if (this.is_ilaying()) {
            return [this.iwidth, this.idepth, this.x, this.z, false];
        } else {
            return [this.idepth, this.iwidth, this.z, this.x, true];
        };
    }

    /*
     * Split according to data in values (array)
     *
     * Split is of the inner rectangle.
     * If relative is true, the coordinates of the resulting rectangle
     * consider the center of the canvas rectangle as 0,0.
     * If relative is false, the coordinates of the resulting rectangle
     * consider the center of the canvas as x,z (coordinates of the
     * rectangle to split.
     *
     * @param {Values} values Values to be used to split the rectangle
     * @param {boolean} relative Result is in relative (center in 0,0) or not
     */
    split(values, relative = true) {
        // Always split on width, as if the rectangle was laying.
        // Use local variables to point to the rigth real dimensions
        let [width, depth, x, z, reflected] = this.idims_as_laying();
        // Ratio to convert a size in a split (part of total)
        let ratio = width / values.total;
        let current_x = -width / 2;
        let current_z = 0;
        if (!relative) {
            current_x += x;
            current_z = z;
        };
        let rects = [];
        // Value of fields scaled to fit total canvas
        for (const value of values.items) {
            let sub_width = value * ratio;
            let rect = new Rectangle({
                width: sub_width, depth: depth,
                x: current_x + sub_width / 2, z: current_z
            });
            if (reflected) {
                // Dimensions were reflected, reflect back
                rect.reflect();
            };
            rects.push(rect);
            current_x += sub_width;
        };
        return rects;
    }

    /*
     * Split according to data in values (array), with the pivot algorithm
     *
     * Split is of the inner rectangle
     */
    split_pivot(values, relative = true) {
        // Always split on width, as if the rectangle was laying.
        // Use local variables to point to the rgith real dimensions
        if (values.items.length <= 2) {
            // Only one or two values, we cannot apply pivot, apply naive
            return this.split(values, relative);
        };
        let [width, depth, x, z, reflected] = this.idims_as_laying();
        if (relative) {
            x = 0;
            z = 0;
        };
        let { pivot, a1, a2, a3 } = values.pivot_regions(width, depth);
        // Dimensions for areas (a1, a2, a3)
        let width_a1 = values.pivot_region_width(a1, width);
        let width_a2 = values.pivot_region_width(a2.concat(pivot), width);
        let width_a3 = values.pivot_region_width(a3, width);
        let x_a1 = x - width / 2 + width_a1 / 2;
        let x_a2 = x - width / 2 + width_a1 + width_a2 / 2;
        let x_a3 = x - width / 2 + width_a1 + width_a2 + width_a3 / 2;

        let rects = [];
        // Pivot rectangle
        let depth_pivot = values.scaled_area(width * depth, pivot) / width_a2;
        rects[pivot] = new Rectangle({
            width: width_a2, depth: depth_pivot,
            x: x_a2,
            z: z + depth / 2 - depth_pivot / 2
        });
        // Dimensions for each area (and corresponding rectangle)
        let dim_areas = [
            [a1, width_a1, depth, x_a1, z],
            [a2, width_a2, depth - depth_pivot, x_a2, z - depth_pivot / 2],
            [a3, width_a3, depth, x_a3, z]];
        for (const [values_i, width_i, depth_i, x_i, z_i] of dim_areas) {
            if (values_i.length > 0) {
                let subrect = new Rectangle({
                    width: width_i, depth: depth_i,
                    x: x_i, z: z_i
                });
                subrect.inner();
                // Ensure we add rectangles in the right places
                let subvalues = values.values_i(values_i);
                // Further splits should always be absolute, wrt my coordinates
                let rects_i = subrect.split_pivot(subvalues, false);
                let counter = 0;
                for (const i of values_i) {
                    rects[i] = rects_i[counter];
                    counter++;
                };
            };
        };
        if (reflected) {
            // Dimensions were reflected, reflect back
            for (const rect of rects) {
                rect.reflect();
            }
        };
        return rects;
    }

    /*
     * Produce a A-Frame building for the rectangle
     *
     * The building is positioned right above the y=0 level.
     * If a model is specified, the corresponding glTF model will be used,
     * scaled to the "box" that would be used. If not, a box will be used.
     *
     * @param {Number} height Height of the box
     * @param {Color} color Color of the box
     * @param {string} model Link to the glTF model
     */
    box({ height, elevation = 0, color = 'red', model = null, inner = true,
        wireframe = false, visible = true, buffered = false, id = "", rawarea = 0, inner_real = false }) {
        let depth, width;
        if (inner_real) {
            [depth, width] = [this.idepth_real, this.iwidth_real];
        } else if (inner) {
            [depth, width] = [this.idepth, this.iwidth];
        } else {
            [depth, width] = [this.depth, this.width];
        };
        let box = document.createElement('a-entity');
        if (model == null) {
            box.setAttribute('geometry', {
                buffer: buffered,
                primitive: 'box',
                skipCache: true,
                depth: depth,
                width: width,
                height: height
            });
        } else {
            box.setAttribute('gltf-model', model);
            box.setAttribute('autoscale', {
                x: width,
                y: height,
                z: depth
            });
        };

        box.setAttribute('position', {
            x: this.x,
            y: elevation + height / 2,
            z: this.z
        });
        if (model == null) {
            if (buffered) {
                box.setAttribute('vertex-colors-buffer', { 'baseColor': color });
                box.setAttribute('material', { 'visible': visible });
            } else {
                box.setAttribute('material', {
                    'wireframe': wireframe,
                    'vertexColors': 'face',
                    'visible': visible
                });
                box.setAttribute('face-colors', { 'color': color });
            };
        };
        box.setAttribute('id', id);
        box.setAttribute('babiaxr-rawarea', rawarea);



        return box;
    }

};

/*
 * Default palette of colors
 */
const default_colors = ['blue', 'yellow', 'brown', 'orange',
    'magenta', 'darkcyan', 'grey', 'cyan', 'darkred', 'blueviolet',
    'coral', 'crimson', 'darkblue', 'darkgrey', 'orchid',
    'navy', 'palegreen'];
/*
 * Class for dealing with colors
 */
let Colors = class {
    /*
     * Builds palette of colors, given a list of colors
     *
     * @constructor
     * @param {color[]} colors Colors to build the palette
     */
    constructor(colors = default_colors) {
        this.colors = colors;
        this.current = -1;
    };

    /*
     * Give me the next color
     */
    next(color) {
        if (typeof color !== 'undefined') {
            return color;
        } else {
            this.current = (this.current + 1) % this.colors.length;
            return this.colors[this.current];
        };
    };
};


/*
 * Auxiliary function: produce a random data tree for codecity
 */
let rnd_producer = function (levels = 2, number = 3, area = 20, height = 30) {
    if (levels == 1) {
        return {
            "id": "A",
            "area": Math.random() * area,
            "height": Math.random() * height
        };
    } else if (levels > 1) {
        let children = Array.from({ length: number }, function () {
            return rnd_producer(levels - 1, number, area, height);
        });
        return { id: "BlockAA", children: children };
    };
};

if (typeof module !== 'undefined') {
    module.exports = { Values, Rectangle, Zone };
};


/**
 * Request a JSON url
 */
let requestJSONDataFromURL = (items) => {
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
                // Save date and files
                date_files = dateBar(raw_items)
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

    if (raw_items.time_evolution) {
        time_evolution = true
        time_evolution_commit_by_commit = raw_items.time_evolution_commit_by_commit
        raw_items = requestJSONDataFromURL(raw_items.init_data)
    }
    return raw_items
}

let time_evolution = false
let time_evolution_commit_by_commit = false
let dates = []
let dateBarEntity

/**
 *  This function generate a plane with date of files
 */
function dateBar(data) {
    if (data.data_files) {
        let date_files = data.data_files

        // get entity codecity
        let component
        if (document.getElementById('scene')) {
            component = document.getElementById('scene')
        } else {
            component = document.getElementsByTagName('a-scene')
            // Others
            let entities = document.getElementsByTagName('a-entity')
            /*for (let i in entities)
            {
                if (entities[i].attributes && entities[i].attributes['geocodecity']){
                    component = entities[i]
                }
            }*/
        }

        let entity = document.createElement('a-entity')
        entity.classList.add('babiaxrDateBar')
        entity.setAttribute('position', { x: -13, y: 10, z: -3 })
        entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
        entity.setAttribute('material' ,{
            color : 'black'
        })
        entity.setAttribute('height', 0.5)
        entity.setAttribute('width', 2)
        entity.setAttribute('scale', { x: 1, y: 1, z: 1 })

        let text = "Date: " + new Date(date_files[0].date * 1000).toLocaleDateString()
        if (date_files[0].commit_sha) {
            text += "\n\n Commit: " + date_files[0].commit_sha
        }
        entity.setAttribute('text-geometry',{
            value : text,
        });
    
        // Create point
        for (let data in date_files) {
            let date = { date: new Date(date_files[data].date * 1000).toLocaleDateString() }
            if (date_files[data].commit_sha) {
                date.commit_sha = date_files[data].commit_sha
            }
            dates.push(date)
        }

        component.appendChild(entity)
        dateBarEntity = entity
        return date_files
    }

}

/**
 * This function generate a plane at the top of the building with the desired text
 */
let generateLegend = (text, buildingEntity, model) => {
    let width = 2;
    if (text.length > 16)
        width = text.length / 8;

    let height;
    if (model == null) {
        height = buildingEntity.getAttribute('geometry').height
    } else {
        height = buildingEntity.getAttribute("autoscale").y
    }

    let entity = document.createElement('a-plane');

    entity.setAttribute('position', { x: 0, y: height / 2 + 1, z: 0 });
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
    /*entity.setAttribute('light', {
      'intensity': 0.3
    });*/
    return entity;
}

function time_evol() {
    const quarterItems = []
    let initItems = undefined
    const arrayPromises = []
    const maxFiles = dates.length

    let init1 = fetch("data_0.json").then(function (response) {
        return response.json();
    })
    init2 = init1.then(function (json) {
        // do a bunch of stuff
        initItems = json
    });
    arrayPromises.push(init2)

    for (let i = 1; i < maxFiles; i++) {
        let p1 = fetch("data_" + i + ".json").then(function (response) {
            return response.json();
        })
        p2 = p1.then(function (json) {
            // do a bunch of stuff
            quarterItems.push(json)
        });
        arrayPromises.push(p2)
    }

    Promise.all(arrayPromises).then(values => {
        doIt()
    });


    let doIt = () => {
        //document.getElementById("cityevolve").setAttribute("codecity-quarter", "items", JSON.stringify(quarterItems[0]))
        loop();
    }

    let i = 0
    let index = 0

    let loop = () => {
        setTimeout(function () {
            console.log("Loop number", i)

            // Change Date
            let text = "Date: " + dates[i + 1].date
            if (dates[i + 1].commit_sha) {
                text += "\n\nCommit: " + dates[i + 1].commit_sha
            }
            dateBarEntity.setAttribute('text-geometry', 'value', text)

            let changedItems = []
            quarterItems[index].forEach((item) => {
                if (document.getElementById(item.id) != undefined && item.area != 0.0) {

                    // Add to changed items
                    changedItems.push(item.id)

                    // Get old data in order to do the math
                    let prevPos = document.getElementById(item.id).getAttribute("position")
                    let prevWidth = document.getElementById(item.id).getAttribute("geometry").width
                    let prevDepth = document.getElementById(item.id).getAttribute("geometry").depth
                    let prevHeight = document.getElementById(item.id).getAttribute("geometry").height
                    let oldRawArea = parseFloat(document.getElementById(item.id).getAttribute("babiaxr-rawarea"))

                    // Calculate Aspect Ratio
                    let reverseWidthDepth = false
                    let AR = prevWidth / prevDepth
                    if (AR < 1) {
                        reverseWidthDepth = true
                        AR = prevDepth / prevWidth
                    }

                    // New area that depends on the city
                    let newAreaDep = (item.area * (prevDepth * prevWidth)) / oldRawArea

                    // New size for the building based on the AR and the Area depend
                    let newWidth = Math.sqrt(newAreaDep * AR)
                    let newDepth = Math.sqrt(newAreaDep / AR)
                    if (reverseWidthDepth) {
                        newDepth = Math.sqrt(newAreaDep * AR)
                        newWidth = Math.sqrt(newAreaDep / AR)
                    }


                    // Write the new values
                    document.getElementById(item.id).setAttribute("babiaxr-rawarea", item.area)
                    document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                    document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                    document.getElementById(item.id).setAttribute("geometry", "height", item.height)
                    document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: (prevPos.y - prevHeight / 2) + (item.height / 2), z: prevPos.z })
                }
            })

            // Put height 0 those that not exists
            if (!time_evolution_commit_by_commit) {
                initItems.forEach((item) => {
                    if (!changedItems.includes(item.id)) {
                        let prevPos = document.getElementById(item.id).getAttribute("position")
                        document.getElementById(item.id).setAttribute("geometry", "height", -0.1)
                        document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: 0, z: prevPos.z })
                    }
                })
            }

            index++
            if (index > maxFiles - 1) {
                index = 0
            }
            i++;
            console.log("Changing city")
            document.getElementById('codecity').children[0].removeAttribute('geometry-merger')
            document.getElementById('codecity').children[0].removeAttribute('material')
            document.getElementById('codecity').children[0].setAttribute('geometry-merger', { preserveOriginal: true })
            document.getElementById('codecity').children[0].setAttribute('material', { vertexColors: 'face' });

            if (i < maxFiles - 1) {
                loop();
            }
        }, 8000);
    }
}
