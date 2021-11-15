let updateTitle = require('../others/common').updateTitle;
const colors = require('../others/common').colors;
let updateFunction = require('../others/common').updateFunction;

const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babia-cyls', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    from: { type: 'string' },
    legend: { type: 'boolean', default: false },
    axis: { type: 'boolean', default: true },
    // Name for axis
    axis_name: {type: 'boolean', default: false},
    palette: { type: 'string', default: 'ubuntu' },
    title: { type: 'string' },
    titleFont: { type: 'string' },
    titleColor: { type: 'string' },
    titlePosition: { type: 'vec3', default: {x: 0, y: 0, z: 0} },
    // Height of the chart
    chartHeight: { type: 'number', default: 10 },
    // Maximun of the radius
    radiusMax: { type: 'number', default: 2 },
    // Keep height when updating data
    keepHeight: { type: 'boolean', default: true},
    incremental: { type: 'boolean', default: false},
    index: { type: 'string' },
    // Should this be animated
    animation: { type: 'boolean', default: true},
    // Duration of animations
    dur: { type: 'number', default: 2000},
    uiLink: {type: 'boolean', default: false},
    uiLinkPosition: { type: 'vec3', default: {x: -4.5, y: 2, z: 2.5} },
  },
      
  /**
   * List of visualization properties
   */
  visProperties: ['height', 'radius', 'x_axis'],

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
    if (this.data.uiLink){
      createUiLink(el, this.data.uiLinkPosition)
    }
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
  * Where the previous state data is gonna be stored
  */
  currentData: undefined,

  /**
   * Where the metadata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

    /**
     * Value max
     */
     valueMax: undefined,

     xLabels: [],
     xTicks: [],

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
    let dataToPrint = this.newData;

    if (this.currentData) {
      dataToPrint = this.currentData;
    } else {
        dataToPrint = this.newData;
    }
    console.log("Data babia-cyls:", dataToPrint)

    const data = this.data;
    const el = this.el; 

    //Print Title
    this.updateTitle();

    // Height Chart
    let valueMax = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    if (!this.lengthY) {
      this.lengthY = data.chartHeight;
    } else if (!data.keepHeight) {
        this.lengthY = this.lengthY * maxValue / this.maxValue;
    };
    this.maxValue = valueMax;

    // Proportion of the radius
    let maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    this.radius_scale = data.radiusMax / maxRadius;

    // List current cylinders
    let chartEl = this.chartEl;
    let cyls = chartEl.querySelectorAll('a-entity[babia-cyl]');
    let currentCyls = {};
    for (let cyl of cyls) {
        let cylName = cyl.getAttribute('babia-name');
        currentCyls[cylName] = {'el': cyl, 'found': false};
    };

    let xLabels = [];
    let xTicks = [];
    let colorId = 0

    let last_radius; // Needed to calculate separation between cyls
    // Add or modify cyls for new data
    for (let i = 0; i < dataToPrint.length; i++) {
      let item = dataToPrint[i]

      let xLabel = item[data.x_axis];
      let posX;
      if (i == 0){
        posX = 0.5 + item[data.radius] * this.radius_scale;
      } else {
        posX = xTicks[i-1] + last_radius + 0.5 + item[data.radius] * this.radius_scale;
      } 
      let cylEl;
      if ( currentCyls[xLabel] && !item['_not'] ) {
        cylEl = currentCyls[xLabel].el;
        currentCyls[xLabel].found = true;
      } else {
        cylEl = document.createElement('a-entity');
        cylEl.setAttribute('babia-name', xLabel);
        cylEl.id = item[data.index];
        cylEl.object3D.position.x = posX;
        this.chartEl.appendChild(cylEl);
      }

      createCylinder(this, cylEl, data, item, colorId, xLabel, posX);
  
      xLabels.push(xLabel);
      xTicks.push(posX);
  
      //Increase color id
      colorId++

      last_radius = item[data.radius] * this.radius_scale;
    }

    // Remove old cyls (not in new data)
    for (let name in currentCyls) {
      if ( !currentCyls[name].found ) {
        currentCyls[name].el.remove();
      };
    };
  
    //Print axis
    if (data.axis) {
      const lengthX = xTicks[xTicks.length-1] + (dataToPrint[0][data.radius]+ dataToPrint[dataToPrint.length-1][data.radius])* this.radius_scale / 2 ;
      this.updateAxis(xLabels, xTicks, lengthX, this.maxValue);
    }
  },

  /*
  * Update axis
  */
  updateAxis: function(labels, ticks, lengthX, maxValue) {
    const data = this.data;
    if (data.axis) {
      if (!this.xAxisEl) {
        this.xAxisEl = document.createElement('a-entity');
        this.chartEl.appendChild(this.xAxisEl);
      };
      this.xAxisEl.setAttribute('babia-axis-x',
        {'labels': labels, 'ticks': ticks, 'length': lengthX,
            'palette': data.palette});
      this.xAxisEl.setAttribute('position', {
          x: 0, y: 0, z: data.radiusMax + 0.25
      });

      if (!this.yAxisEl) {
          this.yAxisEl = document.createElement('a-entity');
          this.chartEl.appendChild(this.yAxisEl);
      };
      this.yAxisEl.setAttribute('babia-axis-y',
          {'maxValue': maxValue, 'length': this.lengthY});
      this.yAxisEl.setAttribute('position', {
          x: 0, y: 0, z: data.radiusMax + 0.25
      });
      if (data.axis_name){
        if (data.index) {
            this.xAxisEl.setAttribute('babia-axis-x', 'name', data.index);
        } else {
            this.xAxisEl.setAttribute('babia-axis-x', 'name', data.x_axis);
        }
        this.yAxisEl.setAttribute('babia-axis-y', 'name', data.height);
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
    console.log("Generating cyls...")
    this.updateChart()
    this.notiBuffer.set(this.newData)
  }
})

let createCylinder = (self, cylEl, data, item, colorId, xLabel, posX) => {
  cylEl.setAttribute('babia-cyl', {
      'height': item[data.height] * self.lengthY / self.maxValue,
      'radius': item[data.radius] * self.radius_scale,
      'color': colors.get(colorId, data.palette),
      'label': 'events',
      'animation': data.animation
  });
  if (data.legend) {
      cylEl.setAttribute('babia-cyl', {
          'labelText': xLabel + ': ' + item[data.height]
      });
  };
  if (posX !== cylEl.object3D.position.x) {
      if (data.animation) {
          cylEl.setAttribute('animation', {
              'property': 'object3D.position.x',
              'to': posX,
              'dur': data.dur
          });
      } else {
          cylEl.object3D.position.x = posX;
      };
  }
  
}

let createUiLink = (el, position) => {
  let ui_link = document.createElement('a-entity');
  if (!el.id){
      // Generate id
      let id = 'bars' + Math.floor(Math.random() * 1000);
      el.id = id
  }
  console.log('id:', el.id)
  ui_link.setAttribute('babia-ui-link', {viz: el.id})
  ui_link.setAttribute('position', {x: position.x, y: position.y, z:position.z})
  el.appendChild(ui_link)
  console.log('Create Button', el) 
  return
}