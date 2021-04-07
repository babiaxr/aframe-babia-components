/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var accessorFn = require('accessor-fn');
if ('default' in accessorFn) {
  // unwrap default export
  accessorFn = accessorFn.default;
}

var ThreeForceGraph = require('three-forcegraph');
if ('default' in ThreeForceGraph) {
  // unwrap default export
  ThreeForceGraph = ThreeForceGraph.default;
}

var parseJson = function (prop) {
  return (typeof prop === 'string')
    ? JSON.parse(prop)
    : prop; // already parsed
};

var parseFn = function (prop) {
  if (typeof prop === 'function') return prop; // already a function
  var geval = eval; // Avoid using eval directly https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval
  try {
    var evalled = geval('(' + prop + ')');
    return evalled;
  } catch (e) {} // Can't eval, not a function
  return null;
};

var parseAccessor = function (prop) {
  if (!isNaN(parseFloat(prop))) { return parseFloat(prop); } // parse numbers
  if (parseFn(prop)) { return parseFn(prop); } // parse functions
  return prop; // strings
};

/**
 * 3D Force-Directed Graph component for A-Frame.
 */
AFRAME.registerComponent('babia-network', {
  schema: {
    data: { type: 'string', default: ''},
    name: { type: 'string', default: ''},
    relationLink: { type: 'string', default: ''},
    nodeSize: { type: 'string', default: ''},
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
    var state = this.state = {}; // Internal state

    // Add info msg
    state.infoEl = document.createElement('a-text');
    state.infoEl.setAttribute('position', '0 -0.1 -1'); // Canvas center
    state.infoEl.setAttribute('width', 1);
    state.infoEl.setAttribute('align', 'center');
    state.infoEl.setAttribute('color', 'lavender');

    // Setup tooltip
    state.tooltipEl = document.createElement('a-text');
    state.tooltipEl.setAttribute('position', '0 -0.5 -1'); // Aligned to canvas bottom
    state.tooltipEl.setAttribute('width', 2);
    state.tooltipEl.setAttribute('align', 'center');
    state.tooltipEl.setAttribute('color', 'lavender');
    state.tooltipEl.setAttribute('value', '');

    // Setup sub-tooltip
    state.subTooltipEl = document.createElement('a-text');
    state.subTooltipEl.setAttribute('position', '0 -0.6 -1'); // Aligned to canvas bottom
    state.subTooltipEl.setAttribute('width', 1.5);
    state.subTooltipEl.setAttribute('align', 'center');
    state.subTooltipEl.setAttribute('color', 'lavender');
    state.subTooltipEl.setAttribute('value', '');

    // Get camera dom element and attach fixed view elements to camera
    var cameraEl = document.querySelector('a-entity[camera], a-camera');
    cameraEl.appendChild(state.infoEl);
    cameraEl.appendChild(state.tooltipEl);
    cameraEl.appendChild(state.subTooltipEl);

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

    this.forceGraph
      .onLoading(function () {
        state.infoEl.setAttribute('value', 'Loading...'); // Add loading msg
      })
      .onFinishLoading(function () {
        state.infoEl.setAttribute('value', '');
      });
  },

  remove: function () {
    // Clean-up elems
    this.state.infoEl.remove();
    this.state.tooltipEl.remove();
    this.state.subTooltipEl.remove();
  },

  update: function (oldData) {
    var comp = this;
    var elData = this.data;

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

      Object.keys(element).forEach(function (key) {
        console.log(key , element[key]);
        if (key === name){
          node.name = element[key];
        } else if (key === relationLink) {
          node.relationLink = element[key];
        } else if (key === nodeSize){
          node.nodeSize = element[key];
        }
      });
      nodes.push(node);
    });
  
    nodes.forEach(firstNode => {
      nodes.forEach(SecondNode => {
        if (firstNode.id !== SecondNode.id){ // not same country
          if (firstNode.relationLink === SecondNode.relationLink){ // same continent, make link
            if (links.length > 0){
              let linkExists = false;
              links.forEach(link => {
                if ((link.source === firstNode.id && link.target === SecondNode.id) || (link.source === SecondNode.id && link.target === firstNode.id)){ // the link does already exists, in any direction
                  linkExists = true;
                } 
              })
              if (linkExists){
                console.log("Link already exists")
              } else {
                let newLink = {
                  "source" : firstNode.id,
                  "target" : SecondNode.id
                }
                console.log(newLink);
                links.push(newLink);
              }
            }else{
              console.log("EMPTY")
              let newLink = {
                "source" : firstNode.id,
                "target" : SecondNode.id
              }
              console.log(newLink);
              links.push(newLink);
            }    
          }
        }
      })
    });          
  
    console.log(nodes);
    console.log(links);

    elData.nodes = nodes;
    elData.links = links;

    var diff = AFRAME.utils.diff(elData, oldData);

    var fgProps = [
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
      .forEach(function (p) { comp.forceGraph[p](elData[p] !== '' ? elData[p] : null); }); // Convert blank values into nulls

    if ('nodes' in diff || 'links' in diff) {
      comp.forceGraph.graphData({
        nodes: elData.nodes,
        links: elData.links
      });
    }
  },

  tick: function (t, td) {
    // Update tooltip
    var centerRaycaster = new THREE.Raycaster();
    centerRaycaster.params.Line.threshold = this.data.linkHoverPrecision;
    centerRaycaster.setFromCamera(
      new THREE.Vector2(0, 0), // Canvas center
      this.state.cameraObj
    );

    var intersects = centerRaycaster.intersectObjects(this.forceGraph.children)
      .filter(function (o) { // Check only node/link objects
        return ['node', 'link'].indexOf(o.object.__graphObjType) !== -1;
      })
      .sort(function (a, b) { // Prioritize nodes over links
        return isNode(b) - isNode(a);
        function isNode (o) { return o.object.__graphObjType === 'node'; }
      });

    var topObject = intersects.length ? intersects[0].object : null;

    if (topObject !== this.state.hoverObj) {
      const prevObjType = this.state.hoverObj ? this.state.hoverObj.__graphObjType : null;
      const prevObjData = this.state.hoverObj ? this.state.hoverObj.__data : null;
      const objType = topObject ? topObject.__graphObjType : null;
      const objData = topObject ? topObject.__data : null;

      if (prevObjType && prevObjType !== objType) {
        // Hover out
        this.data['on' + (prevObjType === 'node' ? 'Node' : 'Link') + 'CenterHover'](null, prevObjData);
      }
      if (objType) {
        // Hover in
        this.data['on' + (objType === 'node' ? 'Node' : 'Link') + 'CenterHover'](objData, prevObjType === objType ? prevObjData : null);
      }

      this.state.hoverObj = topObject;
      this.state.tooltipEl.setAttribute('value', topObject ? accessorFn(this.data[topObject.__graphObjType + 'Label'])(topObject.__data) || '' : '');
      this.state.subTooltipEl.setAttribute('value', topObject ? accessorFn(this.data[topObject.__graphObjType + 'Desc'])(topObject.__data) || '' : '');
    }

    // Run force-graph ticker
    this.forceGraph.tickFrame();
  }
});