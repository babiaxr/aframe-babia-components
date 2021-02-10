/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-cylinderchart', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    from: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
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
  init: function () { },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */
  update: function (oldData) {
    const self = this;
    let el = this.el;
    let data = this.data;


    /**
     * Update or create chart component
     */

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      // From data embedded, save it anyway
      self.babiaData = self.data
      self.babiaMetadata = {
          id: self.babiaMetadata.id++
      }

      while (self.el.firstChild)
        self.el.firstChild.remove();
      console.log("Generating 3Dcylynderchart from data...")
      self.chart = generateCylinderChart(self.data, JSON.parse(self.data.data), self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

      // Dispatch interested events because I updated my visualization
      dataReadyToSend("babiaData", self)

    } else {

      // If changed from, need to re-register to the new data component
      if (data.from !== oldData.from) {
        // Unregister for old querier
        if (self.dataComponent) { self.dataComponent.unregister(el) }

        // Find the component and get if querier or filterdata by the event               
        let eventName = findDataComponent(data, el, self)
        // If changed to filterdata or to querier
        if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
          el.removeEventListener(self.dataComponentEventName, _listener, true)
        }
        // Assign new eventName
        self.dataComponentEventName = eventName

        // Attach to the events of the data component
        el.addEventListener(self.dataComponentEventName, _listener = (e) => {
          attachNewDataEventCallback(self, e)
        });

        // Register for the new one
        self.dataComponent.register(el)
        return
      }

      // If changed whatever, re-print with the current data
      if (data !== oldData && self.babiaData) {
        while (self.el.firstChild)
          self.el.firstChild.remove();
        console.log("Generating Cylinder...")
        self.chart = generateCylinderChart(self.data, self.babiaData, self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

        // Dispatch interested events because I updated my visualization
        dataReadyToSend("babiaData", self)
      }
    }
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
  play: function () { },

  /**
  * Register function when I'm updated
  */
  register: function (interestedElem) {
    let el = this.el
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
  babiaData: undefined,

  /**
   * Where the metaddata is gonna be stored
   */
  babiaMetadata: {
    id: 0
  },

  /**
   * Proportion of the bars
   */
  proportion: undefined,

  /**
   * Value max
   */
  valueMax: undefined,

  /**
   * Max radius
   */
  maxRadius: undefined,

  /**
   * Max radius
   */
  radius_scale: undefined,

  /**
   * First radius
   */
  firstradius: undefined,
})

let findDataComponent = (data, el, self) => {
  let eventName = "babiaQuerierDataReady"
  if (data.from) {
    // Save the reference to the querier or filterdata
    let dataElement = document.getElementById(data.from)
    if (dataElement.components['babiaxr-filterdata']) {
      self.dataComponent = dataElement.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (dataElement.components['babiaxr-querier_json']) {
      self.dataComponent = dataElement.components['babiaxr-querier_json']
    } else if (dataElement.components['babiaxr-querier_es']) {
      self.dataComponent = dataElement.components['babiaxr-querier_es']
    } else if (dataElement.components['babiaxr-querier_github']) {
      self.dataComponent = dataElement.components['babiaxr-querier_github']
    } else {
      console.error("Problem registering to the querier")
      return
    }
  } else {
    // Look for a querier or filterdata in the same element and register
    if (el.components['babiaxr-filterdata']) {
      self.dataComponent = el.components['babiaxr-filterdata']
      eventName = "babiaFilterDataReady"
    } else if (el.components['babiaxr-querier_json']) {
      self.dataComponent = el.components['babiaxr-querier_json']
    } else if (el.components['babiaxr-querier_es']) {
      self.dataComponent = el.components['babiaxr-querier_es']
    } else if (el.components['babiaxr-querier_github']) {
      self.dataComponent = el.components['babiaxr-querier_github']
    } else {
      // Look for a querier or filterdata in the scene
      if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
        eventName = "babiaFilterDataReady"
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
      } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
      } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
        self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
      } else {
        console.error("Error, querier not found")
        return
      }
    }
  }
  return eventName
}

let attachNewDataEventCallback = (self, e) => {
  // Get the data from the info of the event (propertyName)
  self.dataComponentDataPropertyName = e.detail
  let rawData = self.dataComponent[self.dataComponentDataPropertyName]

  self.babiaData = rawData
  self.babiaMetadata = {
    id: self.babiaMetadata.id++
  }

  //remove previous chart
  while (self.el.firstChild)
    self.el.firstChild.remove();
  console.log("Generating Cylinder...")
  self.chart = generateCylinderChart(self.data, rawData, self.el, self.proportion, self.valueMax, self.maxRadius, self.radius_scale, self.firstradius)

  // Dispatch interested events because I updated my visualization
  dataReadyToSend("babiaData", self)
}

let generateCylinderChart = (data, dataRetrieved, element, proportion, valueMax, maxRadius, radius_scale, firstradius) => {
  if (dataRetrieved) {
    const dataToPrint = dataRetrieved
    const palette = data.palette
    const title = data.title
    const font = data.titleFont
    const color = data.titleColor
    const title_position = data.titlePosition
    const scale = data.scale
    const heightMax = data.heightMax
    const radiusMax = data.radiusMax

    let stepMax
    let colorid = 0
    let stepX = 0
    let lastradius = 0
    let axis_dict = []
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.height]; }))
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o[data.radius]; }))
    if (scale) {
      maxY = maxY / scale
      maxRadius = maxRadius / scale
    } else if (heightMax || radiusMax) {
      if (heightMax) {
        valueMax = maxY
        proportion = heightMax / maxY
        maxY = heightMax
      }
      if (radiusMax) {
        stepMax = maxRadius
        radius_scale = radiusMax / maxRadius
        maxRadius = radiusMax
      }
    }

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
      let radius = cylinder[data.radius]
      let height = cylinder[data.height]

      if (cylinder !== dataToPrint[0]) {
        //Calculate stepX
        if (scale) {
          stepX += lastradius + radius / scale + 1
        } else if (radiusMax) {
          stepX += lastradius + radius * radius_scale + 1
        } else {
          stepX += lastradius + radius + 1
        }

      } else {
        if (scale) {
          firstradius = radius / scale
        } else if (radiusMax) {
          firstradius = radius * radius_scale
        } else {
          firstradius = radius
        }
      }

      let cylinderEntity = generateCylinder(height, radius, colorid, palette, stepX, animation, scale, proportion, radius_scale)
      chart_entity.appendChild(cylinderEntity);
      cylinderEntity.classList.add("babiaxraycasterclass")

      //Prepare legend
      if (data.legend) {
        showLegend(data, cylinderEntity, cylinder, element, maxRadius)
      }

      //Axis dict
      let cylinder_printed = {
        colorid: colorid,
        posX: stepX,
        key: cylinder[data.x_axis]
      }
      axis_dict.push(cylinder_printed)

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

      //Increase color id
      colorid++
    }

    //Print axis
    if (data.axis) {
      showXAxis(element, stepX + lastradius, axis_dict, palette, maxRadius, firstradius)
      showYAxis(element, maxY, scale, proportion, valueMax, maxRadius, firstradius)
    }

    //Print Title
    let title_3d = showTitle(title, font, color, title_position);
    element.appendChild(title_3d);

  }
}


function generateCylinder(height, radius, colorid, palette, position, animation, scale, proportion, radius_scale) {
  let color = getColor(colorid, palette)
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

function getColor(colorid, palette) {
  let color
  for (let i in colors) {
    if (colors[i][palette]) {
      color = colors[i][palette][colorid % 4]
    }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette, maxRadius, firstradius) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
    'start': { x: -firstradius, y: 0, z: 0 },
    'end': { x: xEnd, y: 0, z: 0 },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1 });
  axis.appendChild(axis_line)

  //Print keys
  cylinder_printed.forEach(e => {
    let key = document.createElement('a-entity');
    let color = getColor(e.colorid, palette)
    key.setAttribute('text', {
      'value': e.key,
      'align': 'right',
      'width': 20,
      'color': color
    });
    key.setAttribute('position', { x: e.posX, y: 0.1, z: maxRadius + 11.5 })
    key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
    axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}

function showYAxis(parent, yEnd, scale, proportion, valueMax, maxRadius, firstradius) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
    'start': { x: -firstradius, y: 0, z: 0 },
    'end': { x: -firstradius, y: yEnd, z: 0 },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1 });
  axis.appendChild(axis_line)

  if (proportion) {
    yLimit = yLimit / proportion
    var mod = Math.floor(Math.log10(valueMax))
  }
  for (let i = 0; i <= yLimit; i++) {
    let key = document.createElement('a-entity');
    let value = i
    let pow = Math.pow(10, mod - 1)
    if (!proportion || (proportion && i % pow === 0)) {
      key.setAttribute('text', {
        'value': value,
        'align': 'right',
        'width': 10,
        'color': 'white '
      });
      if (scale) {
        key.setAttribute('text', { 'value': value * scale })
        key.setAttribute('position', { x: -maxRadius - 5.2, y: value, z: maxRadius + 1 })
      } else if (proportion) {
        key.setAttribute('position', { x: -maxRadius - 5.2, y: i * proportion, z: maxRadius + 1 })
      } else {
        key.setAttribute('position', { x: -maxRadius - 5.2, y: i, z: maxRadius + 1 })
      }
    }
    axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showLegend(data, cylinderEntity, cylinder, element, maxRadius) {
  cylinderEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    legend = generateLegend(data, cylinder, cylinderEntity, maxRadius);
    element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    element.removeChild(legend);
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

function showTitle(title, font, color, position) {
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry', {
    value: title,
  });
  if (font) {
    entity.setAttribute('text-geometry', {
      font: font,
    })
  }
  if (color) {
    entity.setAttribute('material', {
      color: color
    })
  }
  var position = position.split(" ")
  entity.setAttribute('position', { x: position[0], y: position[1], z: position[2] })
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 })
  entity.classList.add("babiaxrTitle")
  return entity;
}

let colors = [
  { "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"] },
  { "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"] },
  { "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"] },
  { "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"] },
  { "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"] },
  { "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"] },
  { "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"] },
  { "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"] },
  { "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"] },
]

let dataReadyToSend = (propertyName, self) => {
  self.interestedElements.forEach(element => {
      dispatchEventOnElement(element, propertyName)
  });
}

let dispatchEventOnElement = (element, propertyName) => {
  element.emit("babiaVisualizerUpdated", propertyName)
}