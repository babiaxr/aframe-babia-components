/* global AFRAME */

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
 * CodeCity block component for A-Frame.
 */
AFRAME.registerComponent('codecity-block', {
    schema: {
        width: {
            type: 'number',
            default: 10
        },
        depth: {
            type: 'number',
            default: 10
        },
        // Algoritm to place buildings: naive, pivot
        algorithm: {
            type: 'string',
            default: 'pivot'
        },

        data: {
            type: 'string',
            default: '[{"id": "A", "area": 3, "height": 5},\
                   {"id": "B", "area": 5, "height": 4},\
                   {"id": "C", "area": 1, "height": 3},\
                   {"id": "D", "area": 6, "height": 2},\
                   {"id": "E", "area": 4, "height": 6},\
                   {"id": "F", "area": 3, "height": 1},\
                   {"id": "G", "area": 2, "height": 5},\
                   {"id": "H", "area": 1, "height": 3}]'
        },
        // Base: thickness
        base_thick: {
            type: 'number',
            default: 1
        },
        // Base: color
        base_color: {
            type: 'color',
            default: 'red'
        },
        // Base: with surrounding streets
        base_streets: {
            type: 'boolean',
            default: true
        },
        // Base: street thickness
        base_streets_thick: {
            type: 'number',
            default: 0.5
        },
        // Base: street width
        base_streets_width: {
            type: 'number',
            default: 1
        },
        // Base: street width
        base_streets_color: {
            type: 'color',
            default: 'black'
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
        let data = this.data;
        let el = this.el;

        let algo;
        if (data.algorithm == 'naive') {
            algo = naive_algo;
        } else {
            algo = pivot_algo;
        };

        console.log("CodeCity Block: Init");
        this.items = JSON.parse(data.data)
        this.base_rect = {
            'depth': data.depth, 'width': data.width, 'id': 'base',
            'aframe_x': 0, 'aframe_z': 0
        };
        this.base = insert_box(el, this.base_rect, data.base_thick,
            0, data.base_color);
        if (data.base_streets === true) {
            // Build streets for the base
            this.streets = insert_base_streets(el, data.width, data.depth,
                data.base_thick,
                data.base_streets_width, data.base_streets_thick, data.base_street_color);
            el.setAttribute('total_width', data.width + 2 * data.base_streets_width);
            el.setAttribute('total_depth', data.depth + 2 * data.base_streets_width);
        } else {
            el.setAttribute('total_width', data.width);
            el.setAttribute('total_depth', data.depth);
        };
        console.log("XXX:", el.getAttribute('total_width'));

        let rect_buildings = algo(this.base_rect, { x: 0, z: 0 }, this.items);
        let color_i = 0;
        for (const rect of rect_buildings) {
            color_i = (color_i + 1) % data.colormap.length;
            insert_box(this.base, rect, data.thick, data.base_thick / 2,
                data.colormap[color_i]);
        };
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
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }
});

/**
 * CodeCity quarter component for A-Frame, composed of several blocks.
 */
AFRAME.registerComponent('codecity-quarter', {
    schema: {
        width: {
            type: 'number',
            default: 20
        },
        depth: {
            type: 'number',
            default: 20
        },
        // Algoritm to place buildings: naive, pivot
        algorithm: {
            type: 'string',
            default: 'pivot'
        },
        // Data to visualize
        data: {
            type: 'string',
            default: '[{ "type": "quarter", "quarter": "Quarter1", "data": [\
          {"block": "Block1",\
           "type": "block",\
           "data": [{"id": "1A", "area": 3, "height": 5},\
                   {"id": "1B", "area": 5, "height": 4},\
                   {"id": "1C", "area": 1, "height": 3},\
                   {"id": "1D", "area": 6, "height": 2},\
                   {"id": "1E", "area": 4, "height": 6},\
                   {"id": "1F", "area": 3, "height": 1},\
                   {"id": "1G", "area": 2, "height": 5},\
                   {"id": "1H", "area": 1, "height": 3}]},\
          {"block": "Block2",\
           "type": "block",\
           "data": [{"id": "2A", "area": 2, "height": 9},\
                   {"id": "2B", "area": 6, "height": 3},\
                   {"id": "2C", "area": 1, "height": 3},\
                   {"id": "2D", "area": 8, "height": 1},\
                   {"id": "2E", "area": 3, "height": 6},\
                   {"id": "2F", "area": 1, "height": 7}]},\
          {"block": "Block3",\
           "type": "block",\
           "data": [{"id": "3A", "area": 6, "height": 2},\
                   {"id": "3B", "area": 8, "height": 4},\
                   {"id": "3C", "area": 3, "height": 6}]},\
          {"block": "Block4",\
           "type": "block",\
           "data": [{"id": "4A", "area": 2, "height": 9},\
                   {"id": "4B", "area": 6, "height": 1},\
                   {"id": "4C", "area": 7, "height": 6},\
                   {"id": "4D", "area": 8, "height": 5},\
                   {"id": "4E", "area": 3, "height": 6},\
                   {"id": "4F", "area": 9, "height": 4}]},\
          {"block": "Block5",\
           "type": "block",\
           "data": [{"id": "5A", "area": 2, "height": 9},\
                   {"id": "5B", "area": 6, "height": 3},\
                   {"id": "5C", "area": 5, "height": 8},\
                   {"id": "5D", "area": 5, "height": 7}]},\
          {"block": "Block6",\
           "type": "block",\
           "data": [{"id": "6A", "area": 2, "height": 9},\
                   {"id": "6B", "area": 6, "height": 3},\
                   {"id": "6C", "area": 2, "height": 6},\
                   {"id": "6D", "area": 4, "height": 1},\
                   {"id": "6E", "area": 6, "height": 6},\
                   {"id": "6F", "area": 1, "height": 7}]}\
          ]}, \
          { "type": "quarter", "quarter": "Quarter2", "data": [\
            {"block": "Block1",\
             "type": "block",\
             "data": [{"id": "1A", "area": 3, "height": 5},\
                     {"id": "1B", "area": 5, "height": 4},\
                     {"id": "1C", "area": 1, "height": 3},\
                     {"id": "1D", "area": 6, "height": 2},\
                     {"id": "1E", "area": 4, "height": 6},\
                     {"id": "1F", "area": 3, "height": 1},\
                     {"id": "1G", "area": 2, "height": 5},\
                     {"id": "1H", "area": 1, "height": 3}]},\
            {"block": "Block2",\
             "type": "block",\
             "data": [{"id": "2A", "area": 2, "height": 9},\
                     {"id": "2B", "area": 6, "height": 3},\
                     {"id": "2C", "area": 1, "height": 3},\
                     {"id": "2D", "area": 8, "height": 1},\
                     {"id": "2E", "area": 3, "height": 6},\
                     {"id": "2F", "area": 1, "height": 7}]},\
            {"block": "Block6",\
             "type": "block",\
             "data": [{"id": "6A", "area": 2, "height": 9},\
                     {"id": "6B", "area": 6, "height": 3},\
                     {"id": "6C", "area": 2, "height": 6},\
                     {"id": "6D", "area": 4, "height": 1},\
                     {"id": "6E", "area": 6, "height": 6},\
                     {"id": "6F", "area": 1, "height": 7}]}\
            ]}]'
        },
        // Base: thickness
        base_thick: {
            type: 'number',
            default: 1
        },
        // Base: color
        base_color: {
            type: 'color',
            default: 'red'
        },
        // Base: with surrounding streets
        base_streets: {
            type: 'boolean',
            default: true
        },
        // Base: street thickness
        base_streets_thick: {
            type: 'number',
            default: 0.5
        },
        // Base: street width
        base_streets_width: {
            type: 'number',
            default: 1
        },
        // Base: street width
        base_streets_color: {
            type: 'color',
            default: 'black'
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
        let data = this.data;
        let el = this.el;

        let algo;
        if (data.algorithm == 'naive') {
            algo = naive_algo;
        } else {
            algo = pivot_algo;
        };

        console.log("CodeCity Quarter: Init");
        this.items = JSON.parse(data.data)

        let items = produce_items(this.items);
        console.log("Quarter items:", items);

        this.base_rect = {
            'depth': data.depth, 'width': data.width, 'id': 'base',
            'aframe_x': 0, 'aframe_z': 0
        };
        this.base = insert_box(el, this.base_rect, data.base_thick,
            0, data.base_color);
        if (data.base_streets === true) {
            // Build streets for the base
            this.streets = insert_base_streets(el, data.width, data.depth,
                data.base_thick,
                data.base_streets_width, data.base_streets_thick, data.base_street_color);
            el.setAttribute('total_width', data.width + 2 * data.base_streets_width);
            el.setAttribute('total_depth', data.depth + 2 * data.base_streets_width);
        } else {
            el.setAttribute('total_width', data.width);
            el.setAttribute('total_depth', data.depth);
        };

        let rect_quarters = algo(this.base_rect, { x: 0, z: 0 }, items);
        console.log("Quarter rectangles:", rect_quarters);

        let y = 1;
        for (const rect of rect_quarters) {
            let quarter = document.createElement('a-entity');
            quarter.setAttribute('codecity-' + rect.type, {
                width: rect.width,
                depth: rect.depth,
                data: JSON.stringify(rect.height),
                base_streets: false
            });
            quarter.setAttribute('position', {
                x: -(rect.x + rect.width / 2 - data.width / 2),
                y: y,
                z: rect.z + rect.depth / 2 - data.depth / 2
            });
            this.base.appendChild(quarter);
        };
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
    pause: function () { },

    /**
     * Called when entity resumes.
     * Use to continue or add any dynamic or background behavior such as events.
     */
    play: function () { }
});

/*
 * Produce items, like those for a block, computing those for a quarter
 */
let produce_items = function (quarter_items) {
    items = []
    for (const qitem of quarter_items) {
        item = {
            'id': (qitem.block) ? qitem.block : qitem.quarter,
            'area': get_recursive_area(qitem),
            'type': qitem.type,
            'height': qitem.data
        };
        items.push(item);
    };
    return items;
};

/** 
 * Get recursive area when quarter of quarters
 */
let get_recursive_area = function (item) {
    let total_area = 0
    if (item.type === "quarter") {
        for (const subitem of item.data) {
            total_area += get_recursive_area(subitem)
        }
    } else if (item.type === "block") {
        total_area = item.data.reduce(function (acc, a) { return acc + a.area; }, 0)
    }
    return total_area
}

/**
 * Get the position dimension for a geometry dimension
 */
let pos_dim = { 'depth': 'z', 'width': 'x' };

/**
 * Add A-Frame coordinates to a rectangle using XZ coordinates.
 * XZ coordinates consider 0,0 in the bottom left corner of a rectangle
 * A-Frame coordinates consider 0,0 in the center of the enclosing (parent)
 * DOM element, therefore for adding the coordinates, we need the parent
 * element.
 * @param {Object} rectangle
 * @param {DOMObject} parent
 */
let aframe_coord = function (rectangle, parent) {
    console.log("Parent geometry:", parent.getAttribute('geometry'));
    let pwidth = parent.getAttribute('width');
    if (pwidth) {
        rectangle.aframe_x = rectangle.x + rectangle.width / 2 - pwidth / 2;
    } else {
        rectangle.aframe_x = rectangle.x;
    };
    let pdepth = parent.getAttribute('depth');
    if (pdepth) {
        rectangle.aframe_z = -1 * (rectangle.z + rectangle.depth / 2 - pdepth / 2);
    } else {
        rectangle.aframe_z = rectangle.z;
    };
};

/**
 * Insert a box in the DOM, after creating it, as an a-box.
 *  The box is in XZ coordinates (from the bottom left corner).
 *  Inserts also properties depth and width, to propagate them
 *  to other entities that could live within this one
 *  (for example, buildings in a base).
 *  Returns the inserted element.
 */
let insert_box = function (element, rectangle, height, y, color) {
    aframe_coord(rectangle, element);
    let box = document.createElement('a-entity');

    let building_height;
    if (typeof rectangle.height !== 'undefined') {
        building_height = rectangle.height;
    } else {
        building_height = height;
    };

    box.setAttribute('geometry', {
        primitive: 'box',
        depth: rectangle.depth,
        width: rectangle.width,
        height: building_height
    });
    box.setAttribute('position', {
        x: rectangle.aframe_x,
        y: y + building_height / 2,
        z: rectangle.aframe_z
    });
    box.setAttribute('material', { 'color': color });
    box.setAttribute('id', rectangle.id);
    // These two needed to propagate the shape of the rectangle
    box.setAttribute('depth', rectangle.depth);
    box.setAttribute('width', rectangle.width);
    element.appendChild(box);
    return box;
};

/*
 *  Insert a box with A-Frame coordinates
 *  Only width, depth, aframe_x and aframe_z are used from rectangle
 */
let insert_box_aframe = function (element, rectangle, height, y, color) {
    let box = document.createElement('a-entity');

    box.setAttribute('geometry', {
        primitive: 'box',
        depth: rectangle.depth,
        width: rectangle.width,
        height: height
    });
    box.setAttribute('position', {
        x: rectangle.aframe_x,
        y: y,
        z: rectangle.aframe_z
    });
    box.setAttribute('material', { 'color': color });
    box.setAttribute('id', rectangle.id);
    // These two needed to propagate the shape of the rectangle
    box.setAttribute('depth', rectangle.depth);
    box.setAttribute('width', rectangle.width);
    element.appendChild(box);
    return box;
};

/*
 * Insert streets surrounding a base
 */
let insert_base_streets = function (el, base_width, base_depth, base_thick,
    street_width, street_thick, street_color) {
    let rects = [
        {
            'depth': street_width, 'width': base_width + street_width * 2, 'id': 'street_a',
            'aframe_x': 0, 'aframe_z': (base_depth + street_width) / 2
        },
        {
            'depth': street_width, 'width': base_width + street_width * 2, 'id': 'street_b',
            'aframe_x': 0, 'aframe_z': -(base_depth + street_width) / 2
        },
        {
            'depth': base_depth + street_width * 2, 'width': street_width, 'id': 'street_c',
            'aframe_x': (base_width + street_width) / 2, 'aframe_z': 0
        },
        {
            'depth': base_depth + street_width * 2, 'width': street_width, 'id': 'street_d',
            'aframe_x': -(base_width + street_width) / 2, 'aframe_z': 0
        }
    ];
    let streets = [];
    for (const rect of rects) {
        let street = insert_box_aframe(el, rect, base_thick / 2 - street_thick / 2,
            street_thick, 'black');
        streets.push(street);
    };
    return streets;
};

// Compute some parameters for a rectangle
// These parameters refer to the longest and shortest dimension:
//  long_dim, short_dim: depth or width
//  long, short: lenght of long and short sides
let parameters = function (rectangle) {
    // length of longest dimenstion of the rectangle
    var params = {}
    let longest = Math.max(rectangle['depth'], rectangle['width']);
    if (longest == rectangle['depth']) {
        params['long_dim'] = 'depth';
        params['short_dim'] = 'width';
    } else {
        params['long_dim'] = 'width';
        params['short_dim'] = 'depth';
    };
    params['long'] = longest;
    params['short'] = rectangle[params['short_dim']];
    return params
};

// Get the sum of all the values (numbers) in an array
let sum_array = function (values) {
    return values.reduce(function (acc, a) { return acc + a; }, 0);
};

// Split total, proportionally, according to values in sizes array
let split_proportional = function (total, sizes) {
    // sum of all sizes
    let sum_sizes = sum_array(sizes);
    // ratio to convert a size in a split (part of total)
    let ratio = total / sum_sizes;
    // sizes reduced to fit total
    return sizes.map(function (a) { return ratio * a });
};

// Naive algorithm for placing buildings on a rectangle
// Naive algo is too naive: just take the longest dimension of rectangle,
// split it proportionally to the areas (value of each item), and produce a set of
// adjacent rectangles, thus proportional to the areas.

let naive_algo = function (rectangle, origin, items) {
    let rect_params = parameters(rectangle);
    console.log("Naive rect_params:", rect_params);
    let values = items.map(function (item) { return item.area; });
    let lengths = split_proportional(rect_params['long'], values);
    console.log("Naive lenghts:", lengths);

    let long_dim = rect_params['long_dim'];
    let short_dim = rect_params['short_dim'];
    // The position in the splitted dimension
    let current_pos = origin[pos_dim[long_dim]];
    let buildings = lengths.map(function (a, i) {
        pos_long_dim = current_pos;
        current_pos += a;
        let rect = build_rect(rect_params, a, rect_params.short,
            pos_long_dim, origin[pos_dim[short_dim]]);
        let building = build_building(rect, items[i]);
        return building;
    });
    console.log("Naive algo buildings:", buildings);
    return buildings;
}

// Compute the largest element in an array, and its index
// Returns [element, index]
// Assumes list is not empty
function max_value(values) {
    let largest = values[0];
    let largest_i = 0;

    for (let i = 0; i < values.length; i++) {
        if (largest < values[i]) {
            largest = values[i];
            largest_i = i;
        }
    };
    return [largest, largest_i];
}

// Split list of areas in three lists, given a pivot area
// Returns pivot, a1_len, a2_len, a3_len
// pivot: index of pivot item
// an_len: length of list an (n being 1, 2, or 3)
// pivot is the largest element in areas
// a1 is all elements in areas before the pivot
// a2 is the next elements in areas after pivot, so that
// pivot is close to square (width of a2 is the same as of a2)
// a3 is the other elements in areas to the right of a2
function split_pivot_largest(depth, areas) {
    var pivot, a1_len, a2_len, a3_len;
    let [largest, largest_i] = max_value(areas);

    pivot = largest_i;
    a1_len = pivot;

    if (areas.length == pivot + 1) {
        // No items to the right of pivot. a2, a3 empty
        return [pivot, a1_len, 0, 0];
    };

    if (areas.length == pivot + 2) {
        // Only one item to the right of pivot. It is a2. a3 is empty.
        return [pivot, a1_len, 1, 0];
    };

    // More than one item to the right of pivot.
    // Compute a2 so that pivot can be as square as possible
    let pivot_area = areas[pivot];
    let a2_width_ideal = Math.sqrt(pivot_area);
    let a2_area_ideal = a2_width_ideal * depth - pivot_area;

    let a2_area = 0;
    let i = pivot + 1;
    while (a2_area < a2_area_ideal && i < areas.length) {
        var a2_area_last = a2_area;
        a2_area += areas[i];
        i++;
    };
    // There are two candidates to be the area closest to the ideal area:
    // the last area computed (long), and the one that was conputed before it (short),
    // providing the last computed is not the next to the pivot (in that case,
    // the last computed is the next to the pivot, and therefore it needs to be the
    // first in a3.
    if (Math.abs(a2_area - a2_area_ideal) < Math.abs(a2_area_last - a2_area_ideal)) {
        var a3_first = i;
    } else if (i - 1 > pivot) {
        var a3_first = i - 1;
    } else {
        var a3_first = i;
    };

    a2_len = a3_first - pivot - 1;
    a3_len = areas.length - a3_first

    return [pivot, a1_len, a2_len, a3_len];
}

// Compute widths for one of the three regions of the pivot algorithm
// depth: depth of the rectangle
// areas: areas (values) in the region
function compute_width(depth, areas) {
    if (areas.length == 0) {
        return 0;
    } else {
        area = sum_array(areas);
        return area / depth;
    };
}

// Build rectangle object, based on its parameters
function build_rect(rect_params, long, short, long_pos, short_pos) {
    return {
        [rect_params['long_dim']]: long,
        [rect_params['short_dim']]: short,
        [pos_dim[rect_params['long_dim']]]: long_pos,
        [pos_dim[rect_params['short_dim']]]: short_pos
    };
}

// Get a building, ready to draw, from its base rectangle and its item
function build_building(rectangle, item) {
    let building = Object.assign({}, rectangle);
    building.height = item.height;
    building.id = item.id;
    building.type = item.type;
    return building;
}

// Produce buildings following the pivot algorithm
// http://cvs.cs.umd.edu/~ben/papers/Shneiderman2001Ordered.pdf
function pivot_algo(rectangle, origin, items) {
    console.log("Length of items to rectangulize: ", items.length);
    // Control to avoid excesive recursion
    //  calls ++;
    //  if (calls > 20) {
    //    console.log("20 calls reached, finishing");
    //    return;
    //  };
    if (items.length <= 2) {
        // Only one or two items, we cannot apply pivot, apply naive
        return naive_algo(rectangle, origin, items);
    };
    // Compute parameters (dimensions for the short and long sides)
    // of the enclosing rectangle
    let rect_params = parameters(rectangle);
    let long_dim = rect_params['long_dim'];
    let short_dim = rect_params['short_dim'];
    let long_pos = pos_dim[rect_params['long_dim']];
    let short_pos = pos_dim[rect_params['short_dim']];

    // Build an array with values in items
    let values = items.map(function (item) { return item.area; });
    // Build an array with areas proportional to values, fitting the rectangle
    let areas = split_proportional(rect_params['long'] * rect_params['short'], values);

    // Compute pivot, and number of elements (length) for the three zones
    let [pivot, a1_len, a2_len, a3_len] = split_pivot_largest(rect_params['short'], areas);
    //  console.log("Pivot algo results:", pivot, items[pivot], items.slice(0, a1_len),
    //              items.slice(pivot+1, pivot+1+a2_len),
    //              items.slice(items.length-a3_len));

    let zones = [];

    // Compute data for zone 1
    let a1_width = 0;
    if (a1_len > 0) {
        let a1_slice = [0, a1_len];
        a1_width = compute_width(rect_params['short'], areas.slice(...a1_slice));
        let a1_depth = rect_params['short'];
        let a1_origin = [origin[long_pos], origin[short_pos]];
        let a1_rect = build_rect(rect_params, a1_width, a1_depth, ...a1_origin);
        let zone1 = { rect: a1_rect, items: items.slice(...a1_slice) };
        zones.push(zone1);
        console.log("Zone1: ", zone1);
    };

    // Compute data for zone 2 and pivot
    let a2_slice = [pivot + 1, pivot + a2_len + 1];
    let a2pivot_slice = [pivot, pivot + a2_len + 1];
    let a2_width = compute_width(rect_params['short'], areas.slice(...a2pivot_slice));
    let pivot_depth = areas[pivot] / a2_width;
    let a2_depth = rect_params['short'] - pivot_depth;
    let pivot_origin = [origin[long_pos] + a1_width, origin[short_pos] + a2_depth];
    let a2_origin = [origin[long_pos] + a1_width, origin[short_pos]];
    let pivot_rect = build_rect(rect_params, a2_width, pivot_depth, ...pivot_origin);

    if (a2_len > 0) {
        let a2_rect = build_rect(rect_params, a2_width, a2_depth, ...a2_origin);
        zone2 = { rect: a2_rect, items: items.slice(...a2_slice) }
        zones.push(zone2);
        console.log("Zone2: ", zone2);
    };

    // Compute data for zone 3
    let a3_width = 0;
    if (a3_len > 0) {
        let a3_slice = [items.length - a3_len];
        a3_width = compute_width(rect_params['short'], areas.slice(...a3_slice));
        let a3_depth = rect_params['short'];
        let a3_origin = [origin[long_pos] + a1_width + a2_width, origin[short_pos]];
        let a3_rect = build_rect(rect_params, a3_width, a3_depth, ...a3_origin);
        let zone3 = { rect: a3_rect, items: items.slice(...a3_slice) };
        zones.push(zone3);
        console.log("Zone3: ", zone3);
    };

    // Get subrects, by recursively running the algorithm in all the zones
    pivot_building = build_building(pivot_rect, items[pivot]);
    let buildings = [pivot_building];
    for (const zone of zones) {
        let zone_buildings = pivot_algo(zone.rect, { x: zone.rect.x, z: zone.rect.z }, zone.items);
        buildings = buildings.concat(zone_buildings);
    };
    console.log("Buildings:", buildings);
    return buildings;
}