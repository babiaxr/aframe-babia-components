/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geo3dcylinderchart', {
  schema: {
    data: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: { type: 'boolean', default: false},
    palette: {type: 'string', default: 'ubuntu'},
  },

      /**
    * Set if component needs multiple instancing.
    */
   multiple: false,

      /**
    * Called once when component is attached. Generally for initial setup.
    */
  init: function () {
    let el = this.el;
    let data = this.data;
  },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */
  update: function (oldData) {
    let el = this.el;
    let data = this.data;


    /**
     * Update or create chart component
     */
    if (data.data !== oldData.data) {
      //remove previous chart
      while (this.el.firstChild)
        this.el.firstChild.remove();
      console.log("Generating Cylinder...")
      generateCylinderChart(data, el)
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

})

let generateCylinderChart = (data, element) => {
  if (data.data) {
    const dataToPrint = JSON.parse(data.data)
    const palette = data.palette

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

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
        // Check if used in order to put the cylinder in the parent row
        if (keys_used[cylinder['key']]) {
            stepX = keys_used[cylinder['key']].posX
            colorid = keys_used[cylinder['key']].colorid
        } else {
            stepX = maxX
            colorid = maxColorId
            //Save in used
            keys_used[cylinder['key']] = {
                "posX": maxX,
                "colorid": maxColorId
            }

            //Axis dict
            let cylinder_printed = {
                colorid: colorid,
                posX: stepX,
                key: cylinder['key']
            }
            xaxis_dict.push(cylinder_printed)

            maxX += 2 * maxRadius + 1
            maxColorId++
        }

        // Get Z val
        if (z_axis[cylinder['key2']]) {
            stepZ = z_axis[cylinder['key2']].posZ
        } else {
            stepZ = maxZ
            //Save in used
            z_axis[cylinder['key2']] = {
                "posZ": maxZ
            }

            //Axis dict
            let cylinder_printed = {
                colorid: colorid,
                posZ: stepZ,
                key: cylinder['key2']
            }
            zaxis_dict.push(cylinder_printed)

            maxZ += 2 * maxRadius + 1
        }

        let cylinderEntity = generateCylinder(cylinder['height'], cylinder['radius'], colorid, palette, stepX, stepZ, animation);
        
        //Prepare legend
        if (data.legend) {
            showLegend(cylinderEntity, cylinder, element)
        }

        chart_entity.appendChild(cylinderEntity, element)

    }

    // Axis
    if (data.axis) {
        showXAxis(element, maxX, xaxis_dict, palette)
        showZAxis(element, maxZ, zaxis_dict)
        showYAxis(element, maxY)
    }
  }
}

let maxRadius

function generateCylinder(height, radius, colorid, palette, positionX, positionZ, animation) {
  let color = getColor(colorid, palette)
  let entity = document.createElement('a-cylinder');
  entity.setAttribute('color', color);
  entity.setAttribute('height', height);
  entity.setAttribute('radius', radius);
  // Add animation
  if (animation){
    var duration = 4000
    var increment = 20 * height / duration 
    var size = 0
    var id = setInterval(animation, 1);
    function animation() {
        if (parseInt(size) == height) {
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

function getColor(colorid, palette){
  let color
  for (let i in colors){
      if(colors[i][palette]){
          color = colors[i][palette][colorid%4]
      }
  }
  return color
}

function showXAxis(parent, xEnd, cylinder_printed, palette) {
  let axis = document.createElement('a-entity');

  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
      'start': { x: -maxRadius-1, y: 0, z: -maxRadius },
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

function showYAxis(parent, yEnd) {
  let axis = document.createElement('a-entity');
  
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
      'start': { x: -maxRadius, y: 0, z: 0 },
      'end': { x: -maxRadius, y: yEnd, z: 0 },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1, y: 0, z: -maxRadius-1});
  axis.appendChild(axis_line)
  
  for (let i = 0; i<=yEnd; i++){
      let key = document.createElement('a-entity');
      key.setAttribute('text', {
          'value': i,
          'align': 'right',
          'width': 10,
          'color': 'white '
      });
      key.setAttribute('position', { x: -maxRadius - 6.5, y: i, z: -maxRadius - 1})
      axis.appendChild(key)
  }

  //axis completion
  parent.appendChild(axis)
}

function showZAxis(parent, zEnd, cylinder_printed) {
  let axis = document.createElement('a-entity');
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__xaxis', {
      'start': { x: -maxRadius, y: 0.1, z: 0 },
      'end': { x: -maxRadius, y: 0.1, z: zEnd + maxRadius},
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: -1 , y: 0, z: -maxRadius - 1 });
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


function showLegend(cylinderEntity, cylinder, element) {
  cylinderEntity.addEventListener('mouseenter', function () {
      this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
      legend = generateLegend(cylinder, cylinderEntity);
      element.appendChild(legend);
  });

  cylinderEntity.addEventListener('mouseleave', function () {
      this.setAttribute('scale', { x: 1, y: 1, z: 1 });
      element.removeChild(legend);
  });
}

function generateLegend(cylinder, cylinderEntity) {
  let text = ''
  let lines = []
  lines.push(cylinder['key'] + ' ' + cylinder['key2'] + '\n');
  lines.push('Height: ' + cylinder['height'] + '\n');
  lines.push('Radius: ' + cylinder['radius'])
  let width = 5;
  for (let line of lines){
    if ((line.length > 10) && (width < line.length / 2)){
      width = line.length / 2;
    }
    text += line
  }

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', { x: cylinderPosition.x, y: cylinderPosition.y + cylinder['height'] / 2 + 5, 
                                    z: cylinderPosition.z + cylinder['radius'] / 2});
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '4');
  entity.setAttribute('width', width );
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

let colors = [
  {"blues": ["#142850", "#27496d", "#00909e", "#dae1e7"]},
  {"foxy": ["#f79071", "#fa744f", "#16817a", "#024249"]},
  {"flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"]},
  {"sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"]},
  {"bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"]},
  {"icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"]},
  {"ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"]},
  {"pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"]},
  {"commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]},
]