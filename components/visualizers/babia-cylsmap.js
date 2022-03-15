let updateTitle = require('../others/common').updateTitle;
const colors = require('../others/common').colors;
let updateFunction = require('../others/common').updateFunction;
let createCylinder = require('./babia-cyls').createCylinder;

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-cylsmap', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    z_axis: { type: 'string', default: 'z_axis' },
    from: { type: 'string' },
    legend: { type: 'boolean' },
    legend_lookat: { type: 'string', default: "[camera]" },
    axis: { type: 'boolean', default: true },
    // Name for axis
    axis_name: {type: 'boolean', default: false},
    animation: { type: 'boolean', default: false },
    palette: { type: 'string', default: 'ubuntu' },
    title: { type: 'string' },
    titleFont: { type: 'string' },
    titleColor: { type: 'string' },
    titlePosition: { type: 'string', default: "0 0 0" },
    scale: { type: 'number' },
    heightMax: { type: 'number' },
    radiusMax: { type: 'number', default: 2 },
    // Height of the chart
    chartHeight: { type: 'number', default: 10 },
    // Keep height when updating data
    keepHeight: { type: 'boolean', default: true},
  },
    
  /**
  * List of visualization properties
  */
  visProperties: ['height', 'radius', 'x_axis', 'z_axis'],

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,
  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function () {
    this.notiBuffer = new NotiBuffer();

    // Build chartEl
    this.chartEl = document.createElement('a-entity');
    this.chartEl.classList.add('babiaxrChart')
    this.el.appendChild(this.chartEl);

    // Build titleEl
    this.updateTitle()
    this.el.appendChild(this.titleEl);
  },
  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */
  update: function (oldData) {
    updateFunction(this, oldData)
  },

  /**
  * Querier component target
  */
  prodComponent: undefined,

  /**
  * NotiBuffer identifier
  */
  notiBufferId: undefined,

  /**
  * Where the data is gonna be stored
  */
  newData: undefined,
  
  /**
   * Where the metadata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /*
  * Update title
  */
  updateTitle: function(){
    const titleRotation = { x: 0, y: 0, z: 0 }
    this.titleEl = updateTitle(this.data, titleRotation);        
  },

  /*
  * Update chart
  */

  updateChart: function () {
    const dataToPrint = this.newData;
    const data = this.data;
   
    let xLabels = [];
    let zLabels = [];
    let map = new Array();
    let colorId = 0
    let xTicks = [];
    let zTicks = [];
    
    // Generate map, xLabels and zLabels
    for (i= 0; i < dataToPrint.length; i++) {
      let xLabel = dataToPrint[i][data.x_axis];
      let zLabel = dataToPrint[i][data.z_axis];
      if (!xLabels.includes(xLabel)){
        xLabels.push(xLabel);
      }
      if (!zLabels.includes(zLabel)){
        zLabels.push(zLabel);
      } 
      let stepX = xLabels.indexOf(xLabel);
      let stepZ = zLabels.indexOf(zLabel);
      if (map[stepX]){
        map[stepX][stepZ] = dataToPrint[i][data.radius];
      } else {
          let innermap = new Array();
          innermap[stepZ] = dataToPrint[i][data.radius];
          map[stepX] = innermap;
      }
    }
    //console.log('MAP =>', map)

    // Height Chart
    let valueMax = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    if (!this.lengthY) {
      this.lengthY = data.chartHeight;
    } else if (!data.keepHeight) {
      this.lengthY = this.lengthY * this.maxValue / this.maxValue;
    };
    this.maxValue = valueMax;
    

    // Proportion of the radius
    let maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    this.radius_scale = data.radiusMax / maxRadius;

    // Generate xticks and zticks (to assign cyls positions later)
    for (i= 0; i < xLabels.length; i++) {
      let rad_0 = Math.max.apply(Math, map[i].filter(function (o) { if( o != '' ) { return o ; }}));
      if (i == 0){
        xTicks.push(rad_0 * this.radius_scale);
      } else {
        let rad_1 = Math.max.apply(Math, map[i-1].filter(function (o) { if( o != '' ) { return o ; }}));
        xTicks.push(xTicks[i-1] + rad_0 * this.radius_scale + 0.5 + rad_1 * this.radius_scale);
      }
    };
    //console.log('xticks: ', xTicks)

    for (j= 0; j < zLabels.length; j++) {
      rad_0 = maxRadiusZ(map, xLabels.length, j);
      if (j == 0){
        zTicks.push(rad_0 * this.radius_scale);
      } else {
        rad_1 = maxRadiusZ(map, xLabels.length, j-1);
        zTicks.push(zTicks[j-1] + rad_1 * this.radius_scale + 0.5 + rad_0 * this.radius_scale);
      }  
    };
    //console.log('zticks: ', zTicks)

    // List current cylinders
    let chartEl = this.chartEl;
    let cyls = chartEl.querySelectorAll('a-entity[babia-cyl]');
    let currentCyls = {};
    for (let cyl of cyls) {
        let cylName = cyl.getAttribute('babia-name');
        currentCyls[cylName] = {'el': cyl, 'found': false};
    };

    // Add or modify cyls for new data
    for (let i = 0; i < dataToPrint.length; i++) {
      let item = dataToPrint[i]

      let xLabel = item[data.x_axis];
      let zLabel = item[data.z_axis];
      let cylEl;
      let id = xLabel + '-' + zLabel;
      let posX = xTicks[xLabels.indexOf(xLabel)];
      let posZ = zTicks[zLabels.indexOf(zLabel)];
      if ( currentCyls[id] && !item['_not'] ) {
        cylEl = currentCyls[id].el;
        currentCyls[id].found = true;
      } else {
        cylEl = document.createElement('a-entity');
        cylEl.setAttribute('babia-name', id);
        cylEl.id = id;
        cylEl.object3D.position.x = posX;
        cylEl.object3D.position.z = posZ;
        this.chartEl.appendChild(cylEl);
      }
      colorId = xLabels.indexOf(xLabel);
      createCylinder(this, cylEl, data, item, colorId, xLabel, posX, posZ, zLabel);
    }

    // Remove old cyls (not in new data)
    for (let name in currentCyls) {
      if ( !currentCyls[name].found ) {
        currentCyls[name].el.remove();
      };
    };

    //Print axis
    if (data.axis) {
      let lastRadX = Math.max.apply(Math, map[xLabels.length-1].filter(function (o) { if( o != '' ) { return o ; }}));
      const lengthX = xTicks[xTicks.length-1] + lastRadX * this.radius_scale + 0.5;
      const lengthZ = zTicks[zTicks.length-1] + maxRadiusZ(map, xLabels.length, zLabels.length-1) * this.radius_scale + 0.5;
      xTicks = xTicks + 0.25;
      zTicks = zTicks + 0.25;
      this.updateAxis(xLabels, xTicks, lengthX, valueMax, zLabels, zTicks, lengthZ);
    }

    //Print Title
    this.updateTitle();
  },
  /*
  * Update axis
  */
  updateAxis: function(xLabels, xTicks, lengthX, maxValue, zLabels, zTicks, lengthZ) {
    const data = this.data;
    if (data.axis) {
        if (!this.xAxisEl) {
            this.xAxisEl = document.createElement('a-entity');
            this.chartEl.appendChild(this.xAxisEl);
        };
        this.xAxisEl.setAttribute('babia-axis-x',
            {'labels': xLabels, 'ticks': xTicks, 'length': lengthX,
                'palette': data.palette, 'align': 'behind'});
        this.xAxisEl.setAttribute('position', {
            x: -0.25, y: 0, z: -0.25
        });

        if (!this.zAxisEl) {
            this.zAxisEl = document.createElement('a-entity');
            this.chartEl.appendChild(this.zAxisEl);
        };
        this.zAxisEl.setAttribute('babia-axis-z',
            {'labels': zLabels, 'ticks': zTicks, 'length': lengthZ,
                'palette': data.palette, 'align': 'left'});
        this.zAxisEl.setAttribute('position', {
            x: -0.25, y: 0, z: -0.25
        });

        if (!this.yAxisEl) {
            this.yAxisEl = document.createElement('a-entity');
            this.chartEl.appendChild(this.yAxisEl);
        };
        this.yAxisEl.setAttribute('babia-axis-y',
            {'maxValue': maxValue, 'length': this.lengthY});
        this.yAxisEl.setAttribute('position', {
            x: -0.25, y: 0, z: -0.25
        });
        if (data.axis_name){
            if (data.index =! "x_axis") {
                this.xAxisEl.setAttribute('babia-axis-x', 'name', data.index);
            } else {
                this.xAxisEl.setAttribute('babia-axis-x', 'name', data.x_axis);
            }
            this.yAxisEl.setAttribute('babia-axis-y', 'name', data.height);
            this.zAxisEl.setAttribute('babia-axis-z', 'name', data.z_axis);
        }
    }
  },

  /*
  * Process data obtained from producer
  */
  processData: function (data) {
    console.log("processData", this);
    this.newData = data;
    this.babiaMetadata = { id: this.babiaMetadata.id++ };
    /*while (this.el.firstChild)
      this.el.firstChild.remove();*/
    console.log("Generating cylsmap...")
    this.updateChart()
    this.notiBuffer.set(this.newData)
  }
})

let maxRadiusZ = (map, length, j) => {
  let rad = 0
  for (i= 0; i < length; i++) {
    if (map[i][j] && rad < map[i][j]){
      rad = map[i][j];
    }
  }; 
  return rad; 
}