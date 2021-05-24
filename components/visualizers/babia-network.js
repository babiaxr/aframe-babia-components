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
    nodeLegend: { type: 'boolean', default: false },
    linkLegend: {type: 'boolean', default: false},
    from: { type: 'string', default: undefined },
    nodesFrom: { type: 'string', default: undefined },
    linksFrom: { type: 'string', default: undefined },
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

    // setup cursor
    setCursor();
  },


  update: function (oldData) {
    let self = this;
    let el = this.el;
    let elData = this.data;

    // Highest priority to data
    if(elData.data && oldData.data !== elData.data){
      // From data embedded, save it anyway
      self.babiaData = elData
      self.babiaMetadata = {
          id: self.babiaMetadata.id++
      }

      /*while (self.el.firstChild)
        self.el.firstChild.remove();*/
      console.log("Generating Network from data...")
      elData.data = JSON.parse(elData.data)
      elData = elDataFromData(elData)
      self.data = elData
      self.chart = generateNetworkChart(elData, oldData, self) 
      
      // Dispatch interested events because I updated my visualization
      dataReadyToSend("babiaData", self)

    // Second highest priority to nodes and links
    } else if (elData.nodes && oldData.nodes !== elData.nodes){
      // From data embedded, save it anyway
      self.babiaData = elData
      self.babiaMetadata = {
          id: self.babiaMetadata.id++
      }

      /*while (self.el.firstChild)
        self.el.firstChild.remove();*/
      console.log("Generating Network from nodes and links...")
      elData.nodes = JSON.parse(elData.nodes);
      elData.links = JSON.parse(elData.links);    
      elData = elDataFromNodesAndLinks(elData);
      self.data = elData;
      self.chart = generateNetworkChart(elData, oldData, self);
      // Dispatch interested events because I updated my visualization
      dataReadyToSend("babiaData", self);
    // Data from querier
    } else {
      // If changed from, need to re-register to the new data component
      if (elData.from !== oldData.from) {
        // Unregister for old querier
        if (self.dataComponent) { self.dataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        let dataComponent = findDataComponent(elData, el, self, 'from');
        self.dataComponent = dataComponent.component;
        // If changed to filterdata or to querier
        if (self.dataComponentEventName && self.dataComponentEventName !== dataComponent.eventName) {
          el.removeEventListener(self.dataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.dataComponentEventName = dataComponent.eventName

        // Attach to the events of the data component
        el.addEventListener(self.dataComponentEventName, _listener = (e) => {
          attachNewDataEventCallback(self, e, oldData)
        });

        // Register for the new one
        self.dataComponent.register(el)
        return
      } else if (elData.nodesFrom !== oldData.nodesFrom) {
        // Now we have nodesFrom, should have linksFrom too
        // Unregister for old querier
        if (self.nodesDataComponent) { self.nodesDataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        let dataComponent = findDataComponent(elData, el, self, 'nodesFrom')
        self.nodesDataComponent = dataComponent.component;
        // If changed to filterdata or to querier
        if (self.nodesDataComponentEventName && self.nodesDataComponentEventName !== dataComponent.eventName) {
          el.removeEventListener(self.nodesDataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.nodesDataComponentEventName = dataComponent.eventName

        // Attach to the events of the data component
        el.addEventListener(self.nodesDataComponentEventName, _listener = (e) => {
          attachNewNodesDataEventCallback(self, e, oldData)
        });

        // Register for the new one
        self.nodesDataComponent.register(el)

        // Now, the same for linksfrom
        // Unregister for old querier
        if (self.linksDataComponent) { self.linksDataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        dataComponent = findDataComponent(elData, el, self, 'linksFrom')
        self.linksDataComponent = dataComponent.component;
        // If changed to filterdata or to querier
        if (self.linksDataComponentEventName && self.linksDataComponentEventName !== dataComponent.eventName) {
          el.removeEventListener(self.linksDataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.linksDataComponentEventName = dataComponent.eventName

        // Attach to the events of the data component
        el.addEventListener(self.linksDataComponentEventName, _listener = (e) => {
          attachNewLinksDataEventCallback(self, e, oldData)
        });

        // Register for the new one
        self.linksDataComponent.register(el)
        return
      }

      // If changed whatever, re-print with the current data
      if (elData !== oldData && self.babiaData) {
        /*while (self.el.firstChild)
          self.el.firstChild.remove();*/
        elData.data = JSON.parse(elData.data)
        elData = elDataFromData(elData)
        self.data = elData
        self.chart = generateNetworkChart(elData, oldData, self)

        // Dispatch interested events because I updated my visualization
        dataReadyToSend("babiaData", self)
      }
    }

    
  },

  remove: function () {  },

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
        removeLegend()
      } else if(this.data.linkLegend && this.data.linkLabel!="" && prevObjType === 'link'){
        removeLegend()
      }
      if (objType) {
        // Hover in
        this.data['on' + (objType === 'node' ? 'Node' : 'Link') + 'CenterHover'](objData, prevObjType === objType ? prevObjData : null);
      }

      this.state.hoverObj = topObject;

      if (topObject) {
        if (this.data.nodeLegend && topObject.__graphObjType === 'node') {
          showLegend(topObject, topObject.__data, this.data.nodeLabel)
        } else if (this.data.linkLegend && topObject.__graphObjType === 'link') {
          if (this.data.linkLabel != ""){
            showLinkLegend(this, topObject, topObject.__data, this.data.linkLabel)
          }
        }
      }
    }

    // Run force-graph ticker
    this.forceGraph.tickFrame();
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

   /**
  * Register function when I'm updated
  */
  register: function (interestedElem) {
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
  nodesDataComponent: undefined,
  linksDataComponent: undefined,

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
  babiaData: {'nodes': undefined, 'links': undefined},

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

});


let findDataComponent = (data, el, self, from) => {
  let eventName = "babiaQuerierDataReady";
  let dataComponent;
  let error = false;
  if (data[from]) {
    // Save the reference to the querier or filterdata
    let dataElement = document.getElementById(data[from])
    if (dataElement.components['babia-filter']) {
      dataComponent = dataElement.components['babia-filter']
      eventName = "babiaFilterDataReady"
    } else if (dataElement.components['babia-queryjson']) {
      dataComponent = dataElement.components['babia-queryjson']
    } else if (dataElement.components['babia-queryes']) {
      dataComponent = dataElement.components['babia-queryes']
    } else if (dataElement.components['babia-querygithub']) {
      dataComponent = dataElement.components['babia-querygithub']
    } else {
      error = true
    }
  } else {
    // Look for a querier or filterdata in the same element and register
    if (el.components['babia-filter']) {
      dataComponent = el.components['babia-filter']
      eventName = "babiaFilterDataReady"
    } else if (el.components['babia-queryjson']) {
      dataComponent = el.components['babia-queryjson']
    } else if (el.components['babia-queryes']) {
      dataComponent = el.components['babia-queryes']
    } else if (el.components['babia-querygithub']) {
      dataComponent = el.components['babia-querygithub']
    } else {
      // Look for a querier or filterdata in the scene
      if (document.querySelectorAll("[babia-filter]").length > 0) {
        dataComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
        eventName = "babiaFilterDataReady"
      } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        dataComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
      } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
        dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
      } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
        dataComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
      } else {
        error = true
      }
    }
  }
  if (error) {
    console.error("Problem fiding the querier or filter");
    return;
  } else {
    return {'component': dataComponent, 'eventName': eventName};
  };
}

let attachNewDataEventCallback = (self, e, oldData) => {
  // Get the data from the info of the event (propertyName)
  self.dataComponentDataPropertyName = e.detail
  let rawData = self.dataComponent[self.dataComponentDataPropertyName]

  self.babiaData = rawData
  self.babiaMetadata = { id: self.babiaMetadata.id++ }
  
  let elData = self.data
  elData.data = rawData

  //remove previous chart (TODO)
  elData = elDataFromData(elData)

  console.log("Generating Network from data callback (Data)...")
  self.chart = generateNetworkChart(elData, oldData, self)
  // Dispatch interested events because I updated my visualization
  dataReadyToSend("babiaData", self)
}

let attachNewNodesDataEventCallback = (self, e, oldData) => {
  // Get the data from the info of the event (propertyName)
  self.nodesDataComponentDataPropertyName = e.detail
  let rawData = self.nodesDataComponent[self.nodesDataComponentDataPropertyName]

  self.babiaData.nodes = rawData
  self.babiaMetadata = { id: self.babiaMetadata.id++ }
  
  let elData = self.data
  elData.nodes = rawData

  //remove previous chart (TODO)
  elData = elDataFromNodesAndLinks(elData)
  if (elData) {
    console.log("Generating Network from callback (Nodes)...");
    self.chart = generateNetworkChart(elData, oldData, self);
    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self);
  } else {
    console.log("Nodes or links not ready yet");
  };
}

let attachNewLinksDataEventCallback = (self, e, oldData) => {
  // Get the data from the info of the event (propertyName)
  self.linksDataComponentDataPropertyName = e.detail
  let rawData = self.linksDataComponent[self.linksDataComponentDataPropertyName]

  console.log("NewLinksData:", rawData)
  self.babiaData.links = rawData
  self.babiaMetadata = { id: self.babiaMetadata.id++ }
  
  let elData = self.data
  elData.links = rawData

  //remove previous chart (TODO)
  elData = elDataFromNodesAndLinks(elData)
  if (elData) {
    console.log("Generating Network from callback (Links)...");
    self.chart = generateNetworkChart(elData, oldData, self);
    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self);
  } else {
    console.log("Nodes or links not ready yet");
  };
}

// Generate or update network
let generateNetworkChart = (elData, oldData, self) => {
  if (oldData){
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
  
  }
  
}

// Format from data to nodes and links
function elDataFromData(elData){
  let nodes = [];
  let links = [];

  let data = elData.data;
  let nodeId = elData.nodeId;
  let linkId = elData.linkId;
  let nodeVal = elData.nodeVal;
  let source = elData.linkSource;
  let target = elData.linkTarget;
  let linkLabel = elData.linkLabel;

  data.forEach(element => {
    let node = {};

    Object.keys(element).forEach(function (k) {
      if (k === nodeId) {
        node[nodeId] = element[k];
      } else if (k === linkId) {
        node.linkId = element[k];
      } else if (k === nodeVal) {
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
              newLink[linkLabel] = firstNode[linkLabel]
              newLink[source] = firstNode[nodeId]
              newLink[target] = secondNode[nodeId]
              links.push(newLink);
            }
          } else {
            let newLink = {}
            newLink[linkLabel] = firstNode[linkLabel]
            newLink[source] = firstNode[nodeId]
            newLink[target] = secondNode[nodeId]
            links.push(newLink);
          }    
        }
      }
    })
  });
  
  elData.nodes = nodes;
  elData.links = links;

  return elData;
}

// Format nodes and links

function elDataFromNodesAndLinks(elData) {
//  let nodes = JSON.parse(elData.nodes);
//  let links = JSON.parse(elData.links);
  let nodes = elData.nodes;
  let links = elData.links;

  let nodeId = elData.nodeId;
  let nodeVal = elData.nodeVal;
  let source = elData.linkSource;
  let target = elData.linkTarget;

  if (!Array.isArray(nodes) || !Array.isArray(links)) {
    // Either nodes or links are not ready yet
    return false
  }
  nodes.forEach(node => {
    Object.keys(node).forEach(function (k) {
      if (k === nodeId) {
        node[nodeId] = node[k];
      } else if (k === nodeVal) {
        node[nodeVal] = node[k];
      }
    });
  })
  links.map(link => {
    nodes.forEach(node => {
      if (link[source] === node[nodeId]){
        link[source] = node[nodeId];
      } else if (link[target] === node[nodeId]){
              link[target] = node[nodeId];
      }
    })
  })
  elData.nodes = nodes;
  elData.links = links;

  return elData;
} 

function generateLegend(node, nodeLabel, nodePosition, radius) {
  let text = node[nodeLabel];

  let width = 2;
  if (text.length > 16)
    width = text.length / 8;

  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {x: nodePosition.x, y: nodePosition.y + radius + 3, z: nodePosition.z})
  entity.setAttribute('babia-lookat', "[camera]");
  entity.setAttribute('width', width);
  entity.setAttribute('height', '1');
  entity.setAttribute('color', 'white');
  entity.setAttribute('scale', {x:3, y:3, z:3})
  entity.setAttribute('text', {
    'value': node[nodeLabel],
    'align': 'center',
    'width': 6,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showLegend(nodeThree, node, nodeLabel) {
  let worldPosition = new THREE.Vector3();
  nodeThree.getWorldPosition(worldPosition);
  let radius = nodeThree.geometry.boundingSphere.radius
  let sceneEl = document.querySelector('a-scene');
  legend = generateLegend(node, nodeLabel, worldPosition, radius);
  sceneEl.appendChild(legend);
}

function generateLinkLegend(link, linkLabel, linkPosition, radius) {
  let text = link[linkLabel];
  let width = 2;
  if (text.length > 16)
    width = text.length / 8;

  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {x: linkPosition.x, y: linkPosition.y + radius + 3, z: linkPosition.z})
  entity.setAttribute('babia-lookat', "[camera]");
  entity.setAttribute('width', width);
  entity.setAttribute('height', '1');
  entity.setAttribute('color', 'white');
  entity.setAttribute('scale', {x:3, y:3, z:3})
  entity.setAttribute('text', {
    'value': link[linkLabel],
    'align': 'center',
    'width': 6,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showLinkLegend(self, linkThree, link, linkLabel, linkWidth) {
  let worldPosition = new THREE.Vector3();
  //linkThree.getWorldPosition(worldPosition);
  let radius = linkThree.geometry.boundingSphere.radius

  let sourcePos = new THREE.Vector3();
  let targetPos = new THREE.Vector3();

  let nodes = self.forceGraph.children.filter(element => element.__graphObjType == "node")

  nodes.forEach(node => {
    if(node.__data[self.data.nodeId] == link.source[self.data.nodeId]){
      node.getWorldPosition(sourcePos)
    }
    if(node.__data[self.data.nodeId] == link.target[self.data.nodeId]){
      node.getWorldPosition(targetPos)
    }
  })
  
  worldPosition.x = (sourcePos.x + targetPos.x)/2
  worldPosition.y = (sourcePos.y + targetPos.y)/2
  worldPosition.z = (sourcePos.z + targetPos.z)/2

  let sceneEl = document.querySelector('a-scene');
  legend = generateLinkLegend(link, linkLabel, worldPosition, radius);
  sceneEl.appendChild(legend);
}

function removeLegend(){
  if (legend){
    let sceneEl = document.querySelector('a-scene');
    sceneEl.removeChild(legend)
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

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaVisualizerUpdated", propertyName)
}