/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('geocylinderchart', {
  schema: {
    data: { type: 'string' },
    legend: { type: 'boolean' },
    axis: { type: 'boolean', default: true },
    animation: {type: 'boolean', default: false},
    palette: {type: 'string', default: 'ubuntu'},
    title: {type: 'string'},
    titleFont: {type: 'string'},
    titleColor: {type: 'string'},
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
  if (data.data){
    const dataToPrint = JSON.parse(data.data)
    const palette = data.palette
    const title = data.title
    const font = data.titleFont
    const color = data.titleColor

    let colorid = 0
    let stepX = 0
    let lastradius = 0
    let axis_dict = []
    let animation = data.animation

    let maxY = Math.max.apply(Math, dataToPrint.map(function (o) { return o.height; }))    
    maxRadius = Math.max.apply(Math, dataToPrint.map(function (o) { return o.radius; }))

    let chart_entity = document.createElement('a-entity');
    chart_entity.classList.add('babiaxrChart')

    element.appendChild(chart_entity)

    for (let cylinder of dataToPrint) {
      let radius = cylinder['radius']
      let height = cylinder['height']

      if (cylinder !== dataToPrint[0]) {
        //Calculate stepX
        stepX += lastradius + radius + 1
      } else {
        firstradius = radius
      }


      let cylinderEntity = generateCylinder(height, radius, colorid, palette, stepX, animation)

      chart_entity.appendChild(cylinderEntity);

      //Prepare legend
      if (data.legend) {
        showLegend(cylinderEntity, cylinder, element)
      }

      //Axis dict
      let cylinder_printed = {
        colorid: colorid,
        posX: stepX,
        key: cylinder['key']
      }
      axis_dict.push(cylinder_printed)

      // update lastradius
      lastradius = radius

      //Increase color id
      colorid++
    }

    //Print axis
    if (data.axis) {
      showXAxis(element, stepX + lastradius, axis_dict, palette)
      showYAxis(element, maxY)
    }

    //Print Title
    let title_3d = showTitle(title, font, color);
    element.appendChild(title_3d);

  }
}

let firstradius
let maxRadius


function generateCylinder(height, radius, colorid, palette, position, animation) {
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
            entity.setAttribute('position', { x: position, y: size / 2, z: 0 }); 
        }  
    }
  } else {
    entity.setAttribute('height', height);
    entity.setAttribute('position', { x: position, y: height / 2, z: 0 });
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

function showYAxis(parent, yEnd) {
  let axis = document.createElement('a-entity');
  
  //Print line
  let axis_line = document.createElement('a-entity');
  axis_line.setAttribute('line__yaxis', {
      'start': { x: -firstradius, y: 0, z: 0 },
      'end': { x: -firstradius, y: yEnd, z: 0 },
      'color': '#ffffff'
  });
  axis_line.setAttribute('position', { x: 0, y: 0, z: maxRadius + 1});
  axis.appendChild(axis_line)
  
  for (let i = 0; i<=yEnd; i++){
      let key = document.createElement('a-entity');
      key.setAttribute('text', {
          'value': i,
          'align': 'right',
          'width': 10,
          'color': 'white '
      });
      key.setAttribute('position', { x: -maxRadius-5.2, y: i, z: maxRadius + 1})
      axis.appendChild(key)
  }

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
  let text = cylinder['key'] + ': ' + cylinder['height'];
  let width = 5;
  if (text.length > 16)
      width = text.length / 2;

  let cylinderPosition = cylinderEntity.getAttribute('position')
  let entity = document.createElement('a-plane');
  entity.setAttribute('position', { x: cylinderPosition.x, y: cylinderPosition.y + cylinder['height'] / 2 + 3,
                                    z: cylinderPosition.z + maxRadius + 0.5 });
  entity.setAttribute('rotation', { x: 0, y: 0, z: 0 });
  entity.setAttribute('height', '1.5');
  entity.setAttribute('width', width);
  entity.setAttribute('color', 'white');
  entity.setAttribute('text', {
      'value': cylinder['key'] + ': ' + cylinder['height'],
      'align': 'center',
      'width': 20,
      'color': 'black'
  });
  entity.classList.add("babiaxrLegend")
  return entity;
}

function showTitle(title, font, color){
  let entity = document.createElement('a-entity');
  entity.setAttribute('text-geometry',{
      value : title,
  });
  if (font){
      entity.setAttribute('text-geometry', {
          font: font,
      })
  }
  if (color){
      entity.setAttribute('material' ,{
          color : color
      })
  }
  var position = title.length / 2 + maxRadius / 2
  entity.setAttribute('position', {x: -position, y: 0.2, z: maxRadius + 1 })
  entity.setAttribute('rotation', {x: 0, y: 0, z: 0})
  entity.classList.add("babiaxrTitle")
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