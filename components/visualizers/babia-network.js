/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

let accessorFn = require('accessor-fn');
if ('default' in accessorFn) {
  // unwrap default export
  accessorFn = accessorFn.default;
}

let ThreeForceGraph = require('three-forcegraph');
if ('default' in ThreeForceGraph) {
  // unwrap default export
  ThreeForceGraph = ThreeForceGraph.default;
}

let parseJson = function (prop) {
  return (typeof prop === 'string')
    ? JSON.parse(prop)
    : prop; // already parsed
};

let parseFn = function (prop) {
  if (typeof prop === 'function') return prop; // already a function
  let geval = eval; // Avoid using eval directly https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
  try {
    let evalled = geval('(' + prop + ')');
    return evalled;
  } catch (e) {} // Can't eval, not a function
  return null;
};

let parseAccessor = function (prop) {
  if (!isNaN(parseFloat(prop))) { return parseFloat(prop); } // parse numbers
  if (parseFn(prop)) { return parseFn(prop); } // parse functions
  return prop; // strings
};

/**
 * 3D Force-Directed Graph component for A-Frame.
 */

let cursor = '';

AFRAME.registerComponent('babia-network', {
  schema: {
    data: { type: 'string', default: ''},
    name: { type: 'string', default: ''},
    relationLink: { type: 'string', default: ''},
    nodeSize: { type: 'string', default: ''},
    legend: { type: 'boolean' },
    jsonUrl: { type: 'string', default: '' },
    numDimensions: { type: 'number', default: 3 },
    dagMode: { type: 'string', default: '' },
    dagLevelDistance: { type: 'number', default: 0 },
    dagNodeFilter: { parse: parseFn, function() { return true; }},
    onDagError: { parse: parseFn, default: undefined },
    nodeRelSize: { type: 'number', default: 4 }, // volume per val unit
    nodeId: { type: 'string', default: 'id' },
    nodeLabel: { parse: parseAccessor, default: 'name' },
    nodeDesc: { parse: parseAccessor, default: 'desc' },
    nodeVal: { parse: parseAccessor, default: 'val' },
    nodeResolution: { type: 'number', default: 8 }, // how many slice segments in the sphere's circumference
    nodeVisibility: { parse: parseAccessor, default: true },
    nodeColor: { parse: parseAccessor, default: 'color' },
    nodeAutoColorBy: { parse: parseAccessor, default: '' }, // color nodes with the same field equally
    nodeOpacity: { type: 'number', default: 0.75 },
    nodeThreeObject: { parse: parseAccessor, default: null },
    nodeThreeObjectExtend: { parse: parseAccessor, default: false },
    linkSource: { type: 'string', default: 'source' },
    linkTarget: { type: 'string', default: 'target' },
    linkLabel: { parse: parseAccessor, default: 'name' },
    linkDesc: { parse: parseAccessor, default: 'desc' },
    linkHoverPrecision: { type: 'number', default: 2 },
    linkVisibility: { parse: parseAccessor, default: true },
    linkColor: { parse: parseAccessor, default: 'color' },
    linkAutoColorBy: { parse: parseAccessor, default: '' }, // color links with the same field equally
    linkOpacity: { type: 'number', default: 0.2 },
    linkWidth: { parse: parseAccessor, default: 0 },
    linkResolution: { type: 'number', default: 6 }, // how many radial segments in each line cylinder's geometry
    linkCurvature: { parse: parseAccessor, default: 0 },
    linkCurveRotation: { parse: parseAccessor, default: 0 },
    linkMaterial: { parse: parseAccessor, default: null },
    linkThreeObject: { parse: parseAccessor, default: null },
    linkThreeObjectExtend: { parse: parseAccessor, default: false },
    linkPositionUpdate: { parse: parseFn, default: null },
    linkDirectionalArrowLength: { parse: parseAccessor, default: 0 },
    linkDirectionalArrowColor: { parse: parseAccessor, default: null },
    linkDirectionalArrowRelPos: { parse: parseAccessor, default: 0.5 }, // value between 0<>1 indicating the relative pos along the (exposed) line
    linkDirectionalArrowResolution: { type: 'number', default: 8 }, // how many slice segments in the arrow's conic circumference
    linkDirectionalParticles: { parse: parseAccessor, default: 0 }, // animate photons travelling in the link direction
    linkDirectionalParticleSpeed: { parse: parseAccessor, default: 0.01 }, // in link length ratio per frame
    linkDirectionalParticleWidth: { parse: parseAccessor, default: 0.5 },
    linkDirectionalParticleColor: { parse: parseAccessor, default: null },
    linkDirectionalParticleResolution: { type: 'number', default: 4 }, // how many slice segments in the particle sphere's circumference
    onNodeCenterHover: { parse: parseFn, default: function () {} },
    onLinkCenterHover: { parse: parseFn, default: function () {} },
    forceEngine: { type: 'string', default: 'd3' }, // 'd3' or 'ngraph'
    d3AlphaMin: { type: 'number', default: 0 },
    d3AlphaDecay: { type: 'number', default: 0.0228 },
    d3VelocityDecay: { type: 'number', default: 0.4 },
    ngraphPhysics: { parse: parseJson, default: null },
    warmupTicks: { type: 'int', default: 0 }, // how many times to tick the force engine at init before starting to render
    cooldownTicks: { type: 'int', default: 1e18 }, // Simulate infinity (int parser doesn't accept Infinity object)
    cooldownTime: { type: 'int', default: 15000 }, // ms
    onEngineTick: { parse: parseFn, default: function () {} },
    onEngineStop: { parse: parseFn, default: function () {} }
  },

  // Bind component methods
  getGraphBbox: function() {
    if (!this.forceGraph) {
      // Got here before component init -> initialize forceGraph
      this.forceGraph = new ThreeForceGraph();
    }

    return this.forceGraph.getGraphBbox();
  },

  emitParticle: function () {
    if (!this.forceGraph) {
      // Got here before component init -> initialize forceGraph
      this.forceGraph = new ThreeForceGraph();
    }

    const forceGraph = this.forceGraph;
    const returnVal = forceGraph.emitParticle.apply(forceGraph, arguments);

    return returnVal === forceGraph
      ? this // return self, not the inner forcegraph component
      : returnVal;
  },

  d3Force: function () {
    if (!this.forceGraph) {
      // Got here before component init -> initialize forceGraph
      this.forceGraph = new ThreeForceGraph();
    }

    const forceGraph = this.forceGraph;
    const returnVal = forceGraph.d3Force.apply(forceGraph, arguments);

    return returnVal === forceGraph
      ? this // return self, not the inner forcegraph component
      : returnVal;
  },

  d3ReheatSimulation: function () {
    this.forceGraph && this.forceGraph.d3ReheatSimulation();
    return this;
  },

  refresh: function () {
    this.forceGraph && this.forceGraph.refresh();
    return this;
  },

  init: function () {
    let state = this.state = {}; // Internal state

    // Get camera dom element and attach fixed view elements to camera
    let cameraEl = document.querySelector('a-entity[camera], a-camera');

    // Keep reference to Three camera object
    state.cameraObj = cameraEl.object3D.children
      .filter(function (child) { return child.type === 'PerspectiveCamera'; })[0];

    // On camera switch
    this.el.sceneEl.addEventListener('camera-set-active', function (evt) {
      // Switch camera reference
      state.cameraObj = evt.detail.cameraEl.components.camera.camera;
    });

    // setup FG object
    if (!this.forceGraph) this.forceGraph = new ThreeForceGraph(); // initialize forceGraph if it doesn't exist yet
    this.el.object3D.add(this.forceGraph);
  },

  remove: function () {  },

  update: function (oldData) {
    let self = this;
    let elData = this.data;
    let el = this.el;

    // Get nodes and links from data (ALMU)
    let nodes = [];
    let links = [];

    let data = JSON.parse(elData.data);
    let name = elData.name;
    let relationLink = elData.relationLink;
    let nodeSize = elData.nodeSize;
    elData.nodeVal = "nodeSize";

    data.forEach(element => {
      let index = data.indexOf(element);
      let node = {"id" : index};

      Object.keys(element).forEach(function (k) {
        if (k === name) {
          node.name = element[k];
        } else if (k === relationLink) {
          node.relationLink = element[k];
        } else if (k === nodeSize) {
          node.nodeSize = element[k];
        }
      });
      nodes.push(node);
    });
  
    nodes.forEach(firstNode => {
      nodes.forEach(secondNode => {
        if (firstNode.id !== secondNode.id) { // not same id
          if (firstNode.relationLink === secondNode.relationLink) { // same relationLink, make link
            if (links.length > 0){
              let linkExists = false;
              links.forEach(link => {
                if ((link.source === firstNode.id && link.target === secondNode.id) || (link.source === secondNode.id && link.target === firstNode.id)) { // the link does already exists, in any direction
                  linkExists = true;
                } 
              })
              if (linkExists) {
              } else {
                let newLink = {
                  "source" : firstNode.id,
                  "target": secondNode.id
                }
                links.push(newLink);
              }
            } else {
              let newLink = {
                "source" : firstNode.id,
                "target": secondNode.id
              }
              links.push(newLink);
            }    
          }
        }
      })
    });          

    elData.nodes = nodes;
    elData.links = links;

    let diff = AFRAME.utils.diff(elData, oldData);

    let fgProps = [
      'jsonUrl',
      'numDimensions',
      'dagMode',
      'dagLevelDistance',
      'dagNodeFilter',
      'onDagError',
      'nodeRelSize',
      'nodeId',
      'nodeVal',
      'nodeResolution',
      'nodeVisibility',
      'nodeColor',
      'nodeAutoColorBy',
      'nodeOpacity',
      'nodeThreeObject',
      'nodeThreeObjectExtend',
      'linkSource',
      'linkTarget',
      'linkVisibility',
      'linkColor',
      'linkAutoColorBy',
      'linkOpacity',
      'linkWidth',
      'linkResolution',
      'linkCurvature',
      'linkCurveRotation',
      'linkMaterial',
      'linkThreeObject',
      'linkThreeObjectExtend',
      'linkPositionUpdate',
      'linkDirectionalArrowLength',
      'linkDirectionalArrowColor',
      'linkDirectionalArrowRelPos',
      'linkDirectionalArrowResolution',
      'linkDirectionalParticles',
      'linkDirectionalParticleSpeed',
      'linkDirectionalParticleWidth',
      'linkDirectionalParticleColor',
      'linkDirectionalParticleResolution',
      'forceEngine',
      'd3AlphaMin',
      'd3AphaDecay',
      'd3VelocityDecay',
      'ngraphPhysics',
      'warmupTicks',
      'cooldownTicks',
      'cooldownTime',
      'onEngineTick',
      'onEngineStop'
    ];

    fgProps
      .filter(function (p) { return p in diff; })
      .forEach(function (p) {
        self.forceGraph[p](elData[p] !== '' ? elData[p] : null);
      }); // Convert blank values into nulls



    if ('nodes' in diff || 'links' in diff) {
      self.forceGraph.graphData({
        nodes: elData.nodes,
        links: elData.links
      });
    }

    // (Almu) NEXT STEP:  Implement raycaster as in other components in Babia
    
    // When loading, cursor gets entity cursor
    cursor = document.querySelector('[cursor]');

    // When controllers are connected, change cursor to laser control
    document.addEventListener('controllerconnected', (event) => {
      cursor = document.querySelector('[laser-controls]');
      console.log(cursor)
  });
  },

  tick: function (t, td) {

    let intersects = cursor.components.raycaster.raycaster.intersectObjects(this.forceGraph.children)
      .filter(function (o) { // Check only node/link objects
        return ['node', 'link'].indexOf(o.object.__graphObjType) !== -1;
      })
      .sort(function (a, b) { // Prioritize nodes over links
        return isNode(b) - isNode(a);
        function isNode (o) { return o.object.__graphObjType === 'node'; }
      });

    let topObject = intersects.length ? intersects[0].object : null;

    if (topObject !== this.state.hoverObj) {
      const prevObjType = this.state.hoverObj ? this.state.hoverObj.__graphObjType : null;
      const prevObjData = this.state.hoverObj ? this.state.hoverObj.__data : null;
      const objType = topObject ? topObject.__graphObjType : null;
      const objData = topObject ? topObject.__data : null;

      if (prevObjType && prevObjType !== objType) {
        // Hover out
        this.data['on' + (prevObjType === 'node' ? 'Node' : 'Link') + 'CenterHover'](null, prevObjData);
        if (prevObjType === 'node'){
          removeLegend(this.el)
        }
      }
      if (objType) {
        // Hover in
        this.data['on' + (objType === 'node' ? 'Node' : 'Link') + 'CenterHover'](objData, prevObjType === objType ? prevObjData : null);
      }

      this.state.hoverObj = topObject;

      if (topObject) {
        if (topObject.__graphObjType === 'node') {
          showLegend(topObject, topObject.__data)
        }
      }
    }

    // Run force-graph ticker
    this.forceGraph.tickFrame();
  }
});


function generateLegend(node, nodePosition, radius) {
  let text = node.name;

  let width = 2;
  if (text.length > 16)
    width = text.length / 8;


  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {x: nodePosition.x, y: nodePosition.y + radius + 1, z: nodePosition.z})
  entity.setAttribute('babia-lookat', "[camera]");
  entity.setAttribute('width', width);
  entity.setAttribute('height', '1');
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
    'value': node.name,
    'align': 'center',
    'width': 6,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

// (Almu) NEXT STEP: Change legend position so it is relative to the node and not to the scene

function showLegend(nodeThree, node) {
  let worldPosition = new THREE.Vector3();
  //let position = new THREE.Vector3();
  nodeThree.getWorldPosition(worldPosition);
  //nodeThree.getWorldPosition(position);
  let radius = nodeThree.geometry.boundingSphere.radius
  let sceneEl = document.querySelector('a-scene');
  legend = generateLegend(node, worldPosition, radius);
  sceneEl.el.appendChild(legend);
}

function removeLegend(){
  let sceneEl = document.querySelector('a-scene');
  sceneEl.removeChild(legend)
}