let findProdComponent = require('../others/common').findProdComponent;
let updateTitle = require('../others/common').updateTitle;
let parseJson = require('../others/common').parseJson;
const colors = require('../others/common').colors;

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
    legend: { type: 'boolean' },
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
    radiusMax: { type: 'number' },
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
  },
  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */
  update: function (oldData) {
    let data = this.data;
        let el = this.el;

        /**
         * Update or create chart component
         */
        if (data.data && oldData.data !== data.data) {
          let _data = parseJson(data.data);
          this.processData(_data);
        } else if (data.from !== oldData.from) {
            // Unregister from old producer
          if (this.prodComponent) {
            this.prodComponent.notiBuffer.unregister(this.notiBufferId)
          };
          this.prodComponent = findProdComponent (data, el)
          if (this.prodComponent.notiBuffer) {
            this.notiBufferId = this.prodComponent.notiBuffer
                .register(this.processData.bind(this))
          }     
        } 
        // If changed whatever, re-print with the current data
        else if (data !== oldData && this.newData) {
          this.processData(this.newData)
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
    const titleEl = updateTitle(this.data, titleRotation);        
    this.el.appendChild(titleEl);
  },

  /*
  * Update chart
  */
  updateChart: function () {
    const dataToPrint = this.newData;
    console.log("Data babia-cyls:", dataToPrint)

    const data = this.data;
    const el = this.el;  

    const animation = data.animation
    const palette = data.palette
    const scale = data.scale

    let heightMax = data.heightMax
    let radiusMax = data.radiusMax
  
    let xLabels = [];
    let xTicks = [];
    let colorId = 0
    let stepX = 1
    let firstradius = 0
    let lastradius = 0
      
    let valueMax = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    let maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    
    if (scale) {
      valueMax = valueMax / scale
      maxRadius = maxRadius / scale
    }
    if (!heightMax){
      heightMax = valueMax
    }
    proportion = heightMax / valueMax
  
    if (!radiusMax){
      radiusMax = maxRadius
    }
    radius_scale = radiusMax / maxRadius
  
    this.chartEl = document.createElement('a-entity');
    this.chartEl.classList.add('babiaxrChart')
    el.appendChild(this.chartEl)
  
    for (let cylinder of dataToPrint) {
      let xLabel = cylinder[data.x_axis]
      let radius = cylinder[data.radius]
      let height = cylinder[data.height]
  
      if (cylinder !== dataToPrint[0]) {
        //Calculate stepX
        if (scale) {
          stepX += lastradius + radius / scale + 0.5
        } else{
          stepX += lastradius + radius * radius_scale + 0.5
        }
  
      } else {
        if (scale) {
          firstradius = radius / scale
        } else {
          firstradius = radius * radius_scale
        }
      }
  
      let cylinderEntity = generateCylinder(height, radius, colorId, palette, stepX, animation, scale, proportion, radius_scale)
      cylinderEntity.classList.add("babiaxraycasterclass")
      this.chartEl.appendChild(cylinderEntity);
  
      //Prepare legend
      if (data.legend) {
        showLegend(data, cylinderEntity, cylinder, el, maxRadius)
      }
  
      // update lastradius
      if (!scale && !radius_scale) {
        lastradius = radius
      } else {
        if (scale) {
          lastradius = radius / scale
        } else {
          lastradius = radius_scale * radius
        }
      }
  
      xLabels.push(xLabel)
      xTicks.push(firstradius + stepX)
  
      //Increase color id
      colorId++
    }
  
    //Print axis
    if (data.axis) {
      const lengthX = firstradius + stepX + lastradius + 0.5
      const lengthY = heightMax
      this.updateAxis(xLabels, xTicks, lengthX, firstradius, maxRadius, valueMax, lengthY);
    }
  
    //Print Title
    this.updateTitle();
  },

  /*
  * Update axis
  */
  updateAxis: function (labels, ticks, lengthX, firstRadius, maxRadius, valueMax, lengthY) {
    let xAxisEl = document.createElement('a-entity');
    this.chartEl.appendChild(xAxisEl);
    xAxisEl.setAttribute('babia-axis-x',{'labels': labels, 'ticks': ticks, 'length': lengthX,'palette': this.data.palette});
    xAxisEl.setAttribute('position', {x: -firstRadius, y: 0, z: maxRadius + 1});

    let yAxisEl = document.createElement('a-entity');
    this.chartEl.appendChild(yAxisEl);
    yAxisEl.setAttribute('babia-axis-y',{'maxValue': valueMax, 'length': lengthY});
    yAxisEl.setAttribute('position', {x: -firstRadius, y: 0, z: maxRadius + 1});
    
    if (this.data.axis_name){
      xAxisEl.setAttribute('babia-axis-x', 'name', this.data.x_axis);
      yAxisEl.setAttribute('babia-axis-y', 'name', this.data.height);
    }
  },

  /*
  * Process data obtained from producer
  */
  processData: function (data) {
    console.log("processData", this);
    this.newData = data;
    this.babiaMetadata = { id: this.babiaMetadata.id++ };
    while (this.el.firstChild)
            this.el.firstChild.remove();
    console.log("Generating cyls...")
    this.updateChart()
    this.notiBuffer.set(this.newData)
  }
})

function generateCylinder(height, radius, colorId, palette, position, animation, scale, proportion, radius_scale) {
  let color = colors.get(colorId, palette)
  let entity = document.createElement('a-cylinder');
  if (scale) {
    height = height / scale
    radius = radius / scale
  } else if (proportion || radius_scale) {
    if (proportion) {
      height = proportion * height
    }
    if (radius_scale) {
      radius = radius_scale * radius
    }
  }
  entity.setAttribute('color', color);
  entity.setAttribute('height', 0);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation) {
    var duration = 4000
    var increment = 20 * height / duration
    var size = 0
    var id = setInterval(animation, 1);
    function animation() {
      if (size >= height) {
        clearInterval(id);
      } else {
        size += increment;
        entity.setAttribute('height', size);
        entity.setAttribute('position', { x: position, y: size / 2, z: 0 });
      }
    }
  } else {
    entity.setAttribute('height', height);
    entity.setAttribute('position', { x: position, y: height / 2, z: 0 });
  }
  return entity;
}


function showLegend(data, cylinderEntity, cylinder, el, maxRadius) {
  cylinderEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    legend = generateLegend(data, cylinder, cylinderEntity, maxRadius);
    el.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    el.removeChild(legend);
  });
}

function generateLegend(data, cylinder, cylinderEntity, maxRadius) {
  let text = cylinder[data.x_axis] + ': ' + cylinder[data.height];
  let width = 5;
  if (text.length > 16)
    width = text.length / 2;

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {
    x: cylinderPosition.x, y: 2 * cylinderPosition.y + 2,
    z: cylinderPosition.z + maxRadius + 0.5
  });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '1.5');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
    'value': cylinder[data.x_axis] + ': ' + cylinder[data.height],
    'align': 'center',
    'width': 20,
    'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}



