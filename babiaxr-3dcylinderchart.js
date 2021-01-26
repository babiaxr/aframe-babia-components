/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-3dcylinderchart', {
  schema: {
    data: { type: 'string' },
    height: { type: 'string', default: 'height' },
    radius: { type: 'string', default: 'radius' },
    x_axis: { type: 'string', default: 'x_axis' },
    z_axis: { type: 'string', default: 'z_axis' },
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
    const self = this
    let el = this.el;
    let data = this.data;

    /**
     * Update or create chart component
    */

    // Highest priority to data
    if (data.data && oldData.data !== data.data) {
      while (self.el.firstChild)
        self.el.firstChild.remove();
      console.log("Generating 3Dcylynderchart from data...")
      self.chart = generateCylinderChart(self.data, JSON.parse(data.data), self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)

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
        el.addEventListener(self.dataComponentEventName, function _listener(e) {
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
        self.chart = generateCylinderChart(self.data, self.babiaData, self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)
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
  generateCylinderChart(self.data, rawData, self.el, self.maxRadius, self.proportion, self.valueMax, self.radius_scale)
}

let generateCylinderChart = (data, dataRetrieved, element, maxRadius, proportion, valueMax, radius_scale) => {
  let stepMax
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

    let colorid = 0
    let maxColorId = 0
    let stepX = 0
    let maxX = 0
    let keys_used = {}
    let stepZ = 0
    let maxZ = 0
    let z_axis = {}
    let xaxis_dict = []
    let zaxis_dict = []
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o.radius; }))
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
      // Check if used in order to put the cylinder in the parent row
      if (keys_used[cylinder[data.x_axis]]) {
        stepX = keys_used[cylinder[data.x_axis]].posX
        colorid = keys_used[cylinder[data.x_axis]].colorid
      } else {
        stepX = maxX
        colorid = maxColorId
        //Save in used
        keys_used[cylinder[data.x_axis]] = {
          "posX": maxX,
          "colorid": maxColorId
        }

        //Axis dict
        let cylinder_printed = {
          colorid: colorid,
          posX: stepX,
          key: cylinder[data.x_axis]
        }
        xaxis_dict.push(cylinder_printed)

        maxX += 2 * maxRadius + 1
        maxColorId++
      }

      // Get Z val
      if (z_axis[cylinder[data.z_axis]]) {
        stepZ = z_axis[cylinder[data.z_axis]].posZ
      } else {
        stepZ = maxZ
        //Save in used
        z_axis[cylinder[data.z_axis]] = {
          "posZ": maxZ
        }

        //Axis dict
        let cylinder_printed = {
          colorid: colorid,
          posZ: stepZ,
          key: cylinder[data.z_axis]
        }
        zaxis_dict.push(cylinder_printed)

        maxZ += 2 * maxRadius + 1
      }

      let cylinderEntity = generateCylinder(cylinder[data.height], cylinder[data.radius], colorid, palette, stepX, stepZ, animation, scale, proportion, radius_scale);
      cylinderEntity.classList.add("babiaxraycasterclass")

      //Prepare legend
      if (data.legend) {
        showLegend(data, cylinderEntity, cylinder, element)
      }

      chart_entity.appendChild(cylinderEntity, element)

      //Print Title
      let title_3d = showTitle(title, font, color, title_position);
      element.appendChild(title_3d);
    }

    // Axis
    if (data.axis) {
      showXAxis(element, maxX, xaxis_dict, palette, maxRadius)
      showZAxis(element, maxZ, zaxis_dict, maxRadius)
      showYAxis(element, maxY, scale, maxRadius, proportion, valueMax)
    }
  }
}



function generateCylinder(height, radius, colorid, palette, positionX, positionZ, animation, scale, proportion, radius_scale) {
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
        entity.setAttribute('position', { x: positionX, y: size / 2, z: positionZ });
      }
    }
  } else {
    entity.setAttribute('height', height);
    entity.setAttribute('position', { x: positionX, y: height / 2, z: positionZ });
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

function showXAxis(parent, xEnd, cylinder_printed, palette, maxRadius) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
    'start': { x: -maxRadius - 1, y: 0, z: -maxRadius },
    'end': { x: xEnd, y: 0, z: -maxRadius },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0.1, z: - 1 });
  axis.appendChild(axis_line)

  //Print keys
  cylinder_printed.forEach(e => {
    let key = document.createElement('a-entity');
    let color = getColor(e.colorid, palette)
    key.setAttribute('text', {
      'value': e.key,
      'align': 'left',
      'width': 30,
      'color': color
    });
    key.setAttribute('position', { x: e.posX, y: 0.1, z: -maxRadius - 16.5 })
    key.setAttribute('rotation', { x: -90, y: 90, z: 0 });
    axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}

function showYAxis(parent, yEnd, scale, maxRadius, proportion, valueMax) {
  let axis = document.createElement('a-entity');
  let yLimit = yEnd
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
    'start': { x: -maxRadius, y: 0, z: 0 },
    'end': { x: -maxRadius, y: yEnd, z: 0 },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius - 1 });
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
        key.setAttribute('position', { x: -maxRadius - 6.5, y: value, z: -maxRadius - 1 })
      } else if (proportion) {
        key.setAttribute('position', { x: -maxRadius - 6.5, y: i * proportion, z: -maxRadius - 1 })
      } else {
        key.setAttribute('position', { x: -maxRadius - 6.5, y: i, z: -maxRadius - 1 })
      }
    }
    axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showZAxis(parent, zEnd, cylinder_printed, maxRadius) {
  let axis = document.createElement('a-entity');
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
    'start': { x: -maxRadius, y: 0.1, z: 0 },
    'end': { x: -maxRadius, y: 0.1, z: zEnd + maxRadius },
    'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius - 1 });
  axis.appendChild(axis_line)

  //Print keys
  cylinder_printed.forEach(e => {
    let key = document.createElement('a-entity');
    key.setAttribute('text', {
      'value': e.key,
      'align': 'right',
      'width': 30,
      'color': '#ffffff'
    });
    key.setAttribute('position', { x: -maxRadius - 16.5, y: 0.1, z: e.posZ })
    key.setAttribute('rotation', { x: -90, y: 0.1, z: 0 });
    axis.appendChild(key)
  });

  //axis completion
  parent.appendChild(axis)
}


function showLegend(data, cylinderEntity, cylinder, element) {
  cylinderEntity.addEventListener('mouseenter', function () {
    this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
    legend = generateLegend(data, cylinder, cylinderEntity);
    element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
    this.setAttribute('scale', { x: 1, y: 1, z: 1 });
    element.removeChild(legend);
  });
}

function generateLegend(data, cylinder, cylinderEntity) {
  let text = ''
  let lines = []
  lines.push(cylinder[data.x_axis] + ' ' + cylinder[data.z_axis] + '\n');
  lines.push('Height: ' + cylinder[data.height] + '\n');
  lines.push('Radius: ' + cylinder[data.radius])
  let width = 5;
  for (let line of lines) {
    if ((line.length > 10) && (width < line.length / 2)) {
      width = line.length / 2;
    }
    text += line
  }

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', {
    x: cylinderPosition.x, y: 2 * cylinderPosition.y + 3,
    z: cylinderPosition.z + cylinder[data.radius] / 2
  });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '4');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
    'value': text,
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