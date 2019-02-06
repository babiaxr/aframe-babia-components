import 'aframe-layout-component'

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('city', {
  schema: {
    repository: { type: 'string', default: 'https://api.github.com/repos/dlumbrer/VBoard/git/trees/integration-aframedc?recursive=1' },
    token: { type: 'string' },
  },

  /**
  * Set if component needs multiple instancing.
  */
  multiple: false,

  /**
  * Called once when component is attached. Generally for initial setup.
  */
  init: function () {
    let data = this.data;
    let el = this.el;

    /**
     * Get the data from the repo
     */
    if (data.repository) {
      // Create a new request object
      let request = new XMLHttpRequest();

      // Initialize a request
      request.open('get', data.repository)
      // Send it
      request.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          console.log("data OK in request.response")
          //generateCity(JSON.parse(request.response))
          let city = generateCity(JSON.parse(request.response))
          el.appendChild(city);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      request.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      request.send();
    }
  },

  /**
  * Called when component is attached and when component data changes.
  * Generally modifies the entity based on the data.
  */

  update: function (oldData) {
    var data = this.data;
    var el = this.el;

    // If `oldData` is empty, then this means we're in the initialization process.
    // No need to update.
    if (Object.keys(oldData).length === 0) { return; }

    console.log("Updated")

    /*const data = this.data;
    if (newData != null && newData.dataPoints) {
      this.loader.load(newData.dataPoints, this.onDataLoaded.bind(this));
    } else if (data.dataPoints) {
      this.loader.load(data.dataPoints, this.onDataLoaded.bind(this));
    } else if (data.type === "totem") {
      generateTotem(data, this.el);
    }*/
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

const DEFAULT_SURFACE_HEIGHT = 1
const DEFAULT_SURFACE_DEPTH = 10
const DEFAULT_SURFACE_WIDTH = 10


function generateBuilding(point) {
  let entity = document.createElement('a-box');
  entity.setAttribute('position', { x: point['x'] + point['size'] / 2, y: point['y'] / 2, z: point['z'] }); //centering graph
  entity.setAttribute('color', point['color']);
  entity.setAttribute('id', point.path);
  entity.setAttribute('path', point.path);
  entity.setAttribute('height', point['y']);
  entity.setAttribute('depth', point['size']);
  entity.setAttribute('width', point['size']);
  return entity;
}

function generateSurface(point, level, old_parent) {
  let entity = document.createElement('a-box');
  entity.setAttribute('color', 'gray');
  entity.setAttribute('height', DEFAULT_SURFACE_HEIGHT * level);
  entity.setAttribute('id', point.path);
  entity.setAttribute('depth', DEFAULT_SURFACE_DEPTH / (level * level));
  entity.setAttribute('width', DEFAULT_SURFACE_WIDTH / (level * level));
  return entity;
}

function generateCity(dir) {
  let parents = dir.tree.filter(item => item.type === "tree" && !item.path.includes('/'));
  console.log(dir)
  let new_parent, old_parent
  let city = document.createElement('a-entity');
  city.setAttribute('layout', 'type: box; columns: ' + parents.length / 2 + '; margin: 12; plane: xz');
  let level = 1
  dir.tree.forEach((item) => {
    // Check if subdir
    if (item.type === 'tree') {
      // Check if first level folder
      if (!item.path.includes('/')) {
        old_parent = city
        level = 1
        new_parent = generateSurface(item, level, old_parent)
        
        let sons = dir.tree.filter(i => i.path.includes(item.path));
        new_parent.setAttribute('layout', 'type: box; columns: ' + sons.length + '; margin: 3; plane: xz');
        
        old_parent.appendChild(new_parent)
        level++
      } else if (!item.path.includes(old_parent.id)) {
        level--
        new_parent = generateSurface(item, level, old_parent)

        let sons = dir.tree.filter(i => i.path.includes(item.path));
        new_parent.setAttribute('layout', 'type: box; columns: ' + sons.length + '; margin: 3; plane: xz');

        old_parent = old_parent.parentElement
        old_parent.appendChild(new_parent)
      } else {
        new_parent = generateSurface(item, level, old_parent)

        let sons = dir.tree.filter(i => i.path.includes(item.path));
        new_parent.setAttribute('layout', 'type: box; columns: ' + sons.length + '; margin: 3; plane: xz');

        old_parent.appendChild(new_parent)
        level++
      }
      old_parent = new_parent
      // Check if first level file 
    } else if (!old_parent) {
      //city.appendChild(generateBuilding(item, level))
    } else {
      //old_parent.appendChild(generateBuilding(item, level))
    }
  });

  return city;
}