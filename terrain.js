AFRAME.registerComponent('terrain-elevation', {
    schema: {
      width: {type: 'number', default: 1},
      height: {type: 'number', default: 1},
      segmentsHeight: {type: 'number', default: 1},
      segmentsWidth: {type: 'number', default: 1},
      data: {type: 'array'},
      color: {type: 'string', default: '0xdddddd'},
      filled: {type: 'boolean', default: false}
    },
  
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        var data = this.data;
        var el = this.el;

        var vertices = data.data
        console.log("Vertices:")
        console.log(vertices)

        // Create geometry.
        this.geometry = new THREE.PlaneGeometry(data.width, data.height, data.segmentsHeight, data.segmentsWidth);
        for (var i = 0, l = this.geometry.vertices.length; i < l; i++) {
            this.geometry.vertices[i].z = vertices[i];
        }
  
      // Create material.
        var color = data.color
        if (data.filled){
          this.material = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: false
          });
        } else {
          this.material = new THREE.MeshPhongMaterial({
            color: color,
            wireframe: true
          }); 
        }

      // Create mesh.
      this.mesh = new THREE.Mesh(this.geometry, this.material);
  
      // Set mesh on entity.
      el.setObject3D('mesh', this.mesh);
    }
  });