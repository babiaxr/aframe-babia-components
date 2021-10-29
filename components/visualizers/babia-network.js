/**
 * 
 *This component is based on vasturiano/aframe-forcegraph-component, that
 is licensed under the The MIT License (MIT)

Copyright (c) 2017 Vasco Asturiano &lt;vastur@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

let findProdComponent = require('../others/common').findProdComponent;
let parseJson = require('../others/common').parseJson;
const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

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
    nodeLegend: { type: 'boolean', default: false },
    linkLegend: {type: 'boolean', default: false},
    from: { type: 'string'},
    nodesFrom: { type: 'string'},
    linksFrom: { type: 'string'},
    data: { type: 'string', default: ''},
    nodes: { type:'string', default: '' },
    links: { type: 'string', default: '' },
    nodeId: { type: 'string', default: 'id' },
    nodeLabel: { parse: parseAccessor, default: 'id' },
    linkId: { type: 'string', default: ''},
    linkSource: { type: 'string', default: 'source' },
    linkTarget: { type: 'string', default: 'target' },
    nodeVal: { type: 'string', default: '' }, 
    nodeRelSize: { type: 'number', default: 4 }, 
    nodeColor: { parse: parseAccessor, default: 'color' },
    nodeAutoColorBy: { parse: parseAccessor, default: '' }, 
    nodeResolution: { type: 'number', default: 8 }, 
    linkColor: { parse: parseAccessor, default: 'color' },
    linkAutoColorBy: { parse: parseAccessor, default: '' },
    linkWidth: { parse: parseAccessor, default: 0 },
    linkResolution: { type: 'number', default: 6 }, 
    linkLabel: { parse: parseAccessor, default: '' },
    
    nodeDesc: { parse: parseAccessor, default: 'desc' },
    linkDesc: { parse: parseAccessor, default: 'desc' },
    nodeVisibility: { parse: parseAccessor, default: true },
    nodeOpacity: { type: 'number', default: 1 },
    linkVisibility: { parse: parseAccessor, default: true },
    linkOpacity: { type: 'number', default: 1 },
    
    nodeThreeObject: { parse: parseAccessor, default: null },
    nodeThreeObjectExtend: { parse: parseAccessor, default: false },
    linkCurvature: { parse: parseAccessor, default: 0 },
    linkCurveRotation: { parse: parseAccessor, default: 0 },
    linkMaterial: { parse: parseAccessor, default: null },
    linkThreeObject: { parse: parseAccessor, default: null },
    linkThreeObjectExtend: { parse: parseAccessor, default: false },
    linkPositionUpdate: { parse: parseFn, default: null },
    linkDirectionalArrowLength: { parse: parseAccessor, default: 0 },
    linkDirectionalArrowColor: { parse: parseAccessor, default: null },
    linkDirectionalArrowRelPos: { parse: parseAccessor, default: 0.5 }, 
    linkDirectionalArrowResolution: { type: 'number', default: 8 }, 
    linkDirectionalParticles: { parse: parseAccessor, default: 0 }, 
    linkDirectionalParticleSpeed: { parse: parseAccessor, default: 0.01 }, 
    linkDirectionalParticleWidth: { parse: parseAccessor, default: 0.5 },
    linkDirectionalParticleColor: { parse: parseAccessor, default: null },
    linkDirectionalParticleResolution: { type: 'number', default: 4 }, 
    
    linkHoverPrecision: { type: 'number', default: 2 },
    onNodeCenterHover: { parse: parseFn, default: function () {} },
    onLinkCenterHover: { parse: parseFn, default: function () {} },
    
    numDimensions: { type: 'number', default: 3 },
    dagMode: { type: 'string', default: '' },
    dagLevelDistance: { type: 'number', default: 0 },
    dagNodeFilter: { parse: parseFn, function() { return true; }},
    onDagError: { parse: parseFn, default: undefined },
    forceEngine: { type: 'string', default: 'd3' }, 
    d3AlphaMin: { type: 'number', default: 0 },
    d3AlphaDecay: { type: 'number', default: 0.0228 },
    d3VelocityDecay: { type: 'number', default: 0.4 },
    ngraphPhysics: { parse: parseJson, default: null },
    warmupTicks: { type: 'int', default: 0 }, 
    cooldownTicks: { type: 'int', default: 1e18 }, 
    cooldownTime: { type: 'int', default: 15000 }, 
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

    /**
     * List of visualization properties
     */
     visProperties: { 'nodes': ['nodeId'],
                      'links0': ['linkId'],
                      'links1': ['linkSource', 'linkTarget']},

  init: function () {
    this.isFirstTimeNodes = true;
    this.isFirstTimeLinks = true;

    this.notiBuffer = new NotiBuffer();

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

    // setup cursor
    setCursor();
  },

  update: function (oldData) {
    let el = this.el;
    let elData = this.data;
    this.currentData = oldData;

    /**
    * Update or create chart component
    */
    // Highest priority to data
    if(elData.data && oldData.data !== elData.data){
      let _data = parseJson(elData.data);
      this.processData(_data);

    } else {
      // Second highest priority to nodes and links
      if (elData.nodes){
        if(oldData.nodes !== elData.nodes){
          let _nodes = parseJson(elData.nodes);
          this.processNodes(_nodes);
        }
        if (oldData.links !== elData.links){
          let _links = parseJson(elData.links);
          this.processLinks(_links)
        }
      // Data from querier
      } else {
        // If changed from, need to re-register to the new data component
        if (elData.from !== oldData.from && !elData.nodesFrom) {
          // Unregister for old producers
          if (this.prodComponent) {
            this.prodComponent.notiBuffer.unregister(this.notiBufferId)
          };
          if (this.nodesProdComponent){
            this.nodesProdComponent.notiBuffer.unregister(this.notiBufferId)
          };
          if (this.linksProdComponent){
            this.linksProdComponent.notiBuffer.unregister(this.notiBufferId)
          };
  
          this.prodComponent = findProdComponent (elData, el)
          if (this.prodComponent.notiBuffer){
            this.notiBufferId = this.prodComponent.notiBuffer
                .register(this.processData.bind(this))
          }
        } else if (elData.nodesFrom !== oldData.nodesFrom || elData.linksFrom !== oldData.linksFrom) {
          // Now we have nodesFrom, should have linksFrom too
          // Unregister for old producers
          if (this.prodComponent) {
            this.prodComponent.notiBuffer.unregister(this.notiBufferId)
          };
          if (this.nodesProdComponent){
            this.nodesProdComponent.notiBuffer.unregister(this.notiBufferId)
          };
          if (this.linksProdComponent){
            this.linksProdComponent.notiBuffer.unregister(this.notiBufferId)
          };
  
          let prodComponent = findProdComponent (elData, el)
  
          // First, nodes
          this.nodesProdComponent = prodComponent.nodes
          if (this.nodesProdComponent.notiBuffer){
            this.notiBufferId = this.nodesProdComponent.notiBuffer
                .register(this.processNodes.bind(this))
          }
  
          // Now, the same for links
          this.linksProdComponent = prodComponent.links
          if (this.linksProdComponent.notiBuffer){
            this.notiBufferId = this.linksProdComponent.notiBuffer
                .register(this.processLinks.bind(this))
          }
        } 
  
        // If changed whatever, re-print with the current data
        else if (elData !== oldData) {
          if (this.newData){
            let _data = parseJson(this.newData);
            this.processData(_data, true)
          } else if (this.newNodes){
            if (elData.linkSource != oldData.linkSource || elData.linkTarget != oldData.linkTarget) {
              let _links = parseJson(this.newLinks);
              this.processLinks(_links, true)
            } else {
              let _nodes = parseJson(this.newNodes);
              this.processNodes(_nodes, true)
            }
            
          }
        }
      }
    } 
  },

 /**
  * Called on each scene tick.
  */
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
      }
      if (this.data.nodeLegend && prevObjType === 'node' ){
        this.removeLegend(this)
      } else if(this.data.linkLegend && this.data.linkLabel!="" && prevObjType === 'link'){
        this.removeLegend(this)
      }
      if (objType) {
        // Hover in
        this.data['on' + (objType === 'node' ? 'Node' : 'Link') + 'CenterHover'](objData, prevObjType === objType ? prevObjData : null);
      }

      this.state.hoverObj = topObject;

      if (topObject) {
        if (this.data.nodeLegend && topObject.__graphObjType === 'node') {
          this.showLegend(topObject, topObject.__data, this.data.nodeLabel, this.el.getAttribute("scale"))
        } else if (this.data.linkLegend && topObject.__graphObjType === 'link') {
          if (this.data.linkLabel != ""){
            this.showLinkLegend(topObject, topObject.__data, this.data.linkLabel, this.el.getAttribute("scale"))
          }
        }
      }
    }

    // Run force-graph ticker
    this.forceGraph.tickFrame();
  },

  /**
  * Querier component target
  */
  prodComponent: undefined,
  nodesProdComponent: undefined,
  linksProdComponent: undefined,

  /**
  * NotiBuffer identifier
  */
  notiBufferId: undefined,

  /**
  * Where the data is gonna be stored
  */
  newData: undefined,
  newNodes: undefined,
  newLinks: undefined,
  

  /**
   * Boolean to know if it's first time for getting the ui fields
   */
  isFirstTimeNodes: undefined,
  isFirstTimeLinks: undefined,

  /**
   * Store the fields that we need to show in the ui and not the rest
   */
  nodeFields: undefined,
  linkFields: undefined,

  /**
  * Where the current data is stored
  */
  currentData: undefined,

  /**
  * Where the metadata is gonna be stored
  */
  babiaMetadata: {
    id: 0
  },

  legend: '',

  /*
  * Update chart
  */
  updateChart: function (nodes_links, self) {
    if (self.currentData){
      let elData = [];
      for (let attr in this.data){
        elData[attr] = this.data[attr]
      }
    
      elData.nodes = nodes_links.nodes;
      elData.links = nodes_links.links;

      let diff = AFRAME.utils.diff(elData, self.currentData);
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
    }
  },

  /*
  * Process data obtained from producer
  */
  processData: function (_data, newData) {
    console.log("processData", this);
   if (this.newData != _data || newData){
    this.newData = _data;
    let nodes_links = this.elDataFromData(_data);
    this.babiaMetadata = { id: this.babiaMetadata.id++ };
    console.log("Generating network...")
    this.updateChart(nodes_links, this)
    this.notiBuffer.set(_data)
   }
  },

  processNodes: function (nodes, forceProcess){
    console.log("processNodes", this);
    if (this.newNodes != nodes || forceProcess){
      this.newNodes = nodes;
      let nodes_links = this.elDataFromNodesAndLinks(nodes, this.newLinks)
  
      if (!nodes_links){
        if (this.data.links) {
          let _links = parseJson(this.data.links);
          this.processLinks(_links)
        } else if (this.data.linksFrom){
          this.babiaMetadata = { id: this.babiaMetadata.id++ }
          console.log("Generating network...")
        }
      } else {
        this.babiaMetadata = { id: this.babiaMetadata.id++ }
        console.log("Generating network...")
        this.updateChart(nodes_links, this)
        this.notiBuffer.set({'nodes': nodes_links.nodes, 'links': nodes_links.links})
      }
    }
  },

  processLinks: function (_links, forceProcess){
    console.log("processLinks", this);
    let links = parseJson(_links);
    if (this.newLinks != links || forceProcess){
      this.newLinks = links;
      let nodes_links = this.elDataFromNodesAndLinks(this.newNodes, links)
      if (!nodes_links){
        if (this.data.nodes) {
          let _nodes = parseJson(this.data.nodes);
          this.processNodes(_nodes)
        } else if (this.data.nodesFrom){
          this.babiaMetadata = { id: this.babiaMetadata.id++ }
          console.log("Generating network...")
        }
      } else {
        this.babiaMetadata = { id: this.babiaMetadata.id++ }
        console.log("Generating network...")
        this.updateChart(nodes_links, this)
        this.notiBuffer.set({'nodes': nodes_links.nodes, 'links': nodes_links.links})
      }
    }
  },
  // Format from data to nodes and links
  elDataFromData: function(data){
    let nodes = [];
    let links = [];
    
    const nodeId = this.data.nodeId;
    const linkId = this.data.linkId;
    const nodeVal = this.data.nodeVal;
    const source = this.data.linkSource;
    const target = this.data.linkTarget;
    const linkLabel = this.data.linkLabel;

    data.forEach(element => {
      let node = {};

      Object.keys(element).forEach(function (k) {
        if (k === nodeId) {
          node[nodeId] = element[k];
        } 
        if (k === linkId) {
          node.linkId = element[k];
        } 
        if (k === nodeVal) {
          node[nodeVal] = element[k];
        }
      });
      nodes.push(node);
    });

    nodes.forEach(firstNode => {
      nodes.forEach(secondNode => {
        if (firstNode[nodeId] !== secondNode[nodeId]) { // not same id
          if (firstNode.linkId === secondNode.linkId) { // same linkId, make link
            if (links.length > 0){
              let linkExists = false;
              links.forEach(link => {
                if ((link[source] === firstNode[nodeId] && link[target] === secondNode[nodeId]) || (link[source] === secondNode[nodeId] && link[target] === firstNode[nodeId])) { // the link does already exists, in any direction
                  linkExists = true;
                }
              })
              if (!linkExists) {
                let newLink = {}
                //newLink[linkId] = firstNode[linkId]
                newLink[linkLabel] = firstNode[linkLabel]
                newLink[source] = firstNode[nodeId]
                newLink[target] = secondNode[nodeId]
                links.push(newLink);
              }
            } else {
              let newLink = {}
              //newLink[linkId] = firstNode[linkId]
              newLink[linkLabel] = firstNode[linkLabel]
              newLink[source] = firstNode[nodeId]
              newLink[target] = secondNode[nodeId]
              links.push(newLink);
            }  
          }
        }
      })
    });
  
    return {nodes: nodes, links: links};
  },

  // Format nodes and links

  elDataFromNodesAndLinks: function(nodes, links) {
    if (!Array.isArray(nodes) || !Array.isArray(links)) {
      // Either nodes or links are not ready yet
      return false
    }

    if (this.isFirstTimeNodes){
      this.nodeFields = []
      Object.keys(nodes[0]).forEach((k) => {
          this.nodeFields.push(k)
      })
      this.isFirstTimeNodes = false;
    }
    if (this.isFirstTimeLinks){
      this.linkFields = []
      Object.keys(links[0]).forEach((k) => {
          this.linkFields.push(k)
      })
      this.isFirstTimeLinks = false;
    }

    if (typeof(links[0].source) === 'object') {
      links.forEach ((link) => {
        link.source = link.source[this.data.nodeId];
        link.target = link.target[this.data.nodeId];
      })
    }

    let _nodes = [];
    nodes.forEach((node) => {
      let _node = {};
      Object.keys(node).forEach((k) => {
        for (let f in this.nodeFields){
          if (k == this.nodeFields[f]){
            _node[k] = node[k]
          }
        }
      })
      _nodes.push(_node)
    })

    let _links = [];
    links.forEach((link) => {
      let _link = {};
      Object.keys(link).forEach((k) => {
        for (let f in this.linkFields){
          if (k == this.linkFields[f] && k != this.data.linkId){
            _link[k] = link[k]
          }
        }
      })
      _links.push(_link)

    })

    return {nodes: _nodes, links: _links};
  },
  
  showLegend: function (nodeThree, node, nodeLabel, scale) {
    let worldPosition = new THREE.Vector3();
    nodeThree.getWorldPosition(worldPosition);
    let radius = nodeThree.geometry.boundingSphere.radius
    let sceneEl = document.querySelector('a-scene');
    this.legend = generateLegend(node, nodeLabel, worldPosition, radius, scale);
    if (this.legend){
      sceneEl.appendChild(this.legend);
    }
  },

  showLinkLegend: function(linkThree, link, linkLabel, scale) {
    let worldPosition = new THREE.Vector3();
    let radius = linkThree.geometry.boundingSphere.radius
  
    let sourcePos = new THREE.Vector3();
    let targetPos = new THREE.Vector3();
  
    let nodes = this.forceGraph.children.filter(element => element.__graphObjType == "node")
  
    nodes.forEach(node => {
      if(node.__data[this.data.nodeId] == link.source[this.data.nodeId]){
        node.getWorldPosition(sourcePos)
      }
      if(node.__data[this.data.nodeId] == link.target[this.data.nodeId]){
        node.getWorldPosition(targetPos)
      }
    })
    
    worldPosition.x = (sourcePos.x + targetPos.x)/2
    worldPosition.y = (sourcePos.y + targetPos.y)/2
    worldPosition.z = (sourcePos.z + targetPos.z)/2
  
    let sceneEl = document.querySelector('a-scene');
    this.legend = generateLinkLegend(link, linkLabel, worldPosition, radius, scale);
    if (this.legend){
      sceneEl.appendChild(this.legend);
    }
  },
  
  removeLegend: function() {
    if (this.legend){
      let sceneEl = document.querySelector('a-scene');
      sceneEl.removeChild(this.legend)
    }
  }
});

function generateLegend(node, nodeLabel, nodePosition, radius, scale) {
  let text = node[nodeLabel];
  if (text) {
    let width = 2;
    let x = 3;
    let y = 3;
    let z = 3;
    if (text.length > 16)
      width = text.length / 8;
    if(scale){
      x = x * scale.x;
      y = y * scale.y;
      z = z * scale.z;
      radius = (radius + 3) * scale.y;
    }
  
    let entity = document.createElement('a-plane');
    entity.setAttribute('position', {x: nodePosition.x, y: nodePosition.y + radius, z: nodePosition.z})
    entity.setAttribute('babia-lookat', "[camera]");
    entity.setAttribute('width', width);
    entity.setAttribute('height', '1');
    entity.setAttribute('color', 'white');
    entity.setAttribute('scale', {x: x, y: y, z: z})
    entity.setAttribute('text', {
      'value': node[nodeLabel],
      'align': 'center',
      'width': 6,
      'color': 'black'
    });
    entity.classList.add("babiaxrLegend")
    return entity;
  } 
}

function generateLinkLegend(link, linkLabel, linkPosition, radius, scale) {
  let text = link[linkLabel];
  if (text){
    let width = 2;
  let x = 3;
  let y = 3;
  let z = 3;
  if (text.length > 16)
    width = text.length / 8;
  if(scale){
      x = x * scale.x;
      y = y * scale.y;
      z = z * scale.z;
      radius = (radius + 3) * scale.y;
  }

  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {x: linkPosition.x, y: linkPosition.y + radius, z: linkPosition.z})
  entity.setAttribute('babia-lookat', "[camera]");
  entity.setAttribute('width', width);
  entity.setAttribute('height', '1');
  entity.setAttribute('color', 'white');
  entity.setAttribute('scale', {x: x, y: y, z: z})
  entity.setAttribute('text', {
    'value': link[linkLabel],
    'align': 'center',
    'width': 6,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
  }
}

function setCursor() {
  // When loading, cursor gets entity cursor
  cursor = document.querySelector('[cursor]');

  // When controllers are connected, change cursor to laser control
  document.addEventListener('controllerconnected', (event) => {
    cursor = document.querySelector('[laser-controls]');
  });
}