/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

let points
let play_button
let pause_button
let player
let el

AFRAME.registerComponent('ui-navigation-bar', {
    schema: {
        commits: { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
   multiple: false,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        let data = this.data
        el = this.el
        points = JSON.parse(data.commits)
        /*points.forEach(point => {
            console.log(point.date)
            console.log(point.commit)
        });*/
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

   update: function (oldData) {
       let time_bar = createTimeBar(points)
       this.el.appendChild(time_bar)
       player = createPlayer()
       this.el.appendChild(player)
   },

    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
   remove: function () {},

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
   pause: function () {},

   /**
   * Called when entity resumes.
   * Use to continue or add any dynamic or background behavior such as events.
   */
   play: function () {},

})


function createTimeBar(elements){
    let timebar_entity = document.createElement('a-entity')
    timebar_entity.classList.add('babiaxrTimeBar')

    let posX = 0
    let stepX = 5 / (elements.length - 1)

    elements.forEach(i => {
        let point = createTimePoint(i)
        point.setAttribute('position', {x: posX, y: 0, z: 0});
        posX += stepX
        timebar_entity.appendChild(point)
    });

    // Add Line
    let bar_line = document.createElement('a-entity')
    bar_line.setAttribute('line',{
        start : '0 0 0',
        end : '5 0 0',
        color : '#FF0000',
    })
    timebar_entity.appendChild(bar_line)
    return timebar_entity
}

function createTimePoint(point){
    let entity = document.createElement('a-sphere')
    entity.setAttribute('radius', 0.05)
    entity.setAttribute('material', {color: '#FF0000'})
    showInfo(entity, point)
    return entity
}

function showInfo(element, data){
    let legend
    element.addEventListener('mouseenter', function () {
        this.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        legend = generateLegend(data);
        this.appendChild(legend);
    });

    element.addEventListener('mouseleave', function () {
        this.setAttribute('scale', { x: 1, y: 1, z: 1 });
        this.removeChild(legend);
    });
}

function generateLegend (data) {
    let text = ''
    let lines = []
    lines.push('Date: ' + data['date'] + '\n');
    lines.push('commit: ' + data['commit'] + '\n');
    let width = 1;
    for (let line of lines){
      if ((line.length > 10) && (width < line.length / 2)){
        width = line.length / 7;
      }
      text += line
    }

    let entity = document.createElement('a-plane');
    entity.setAttribute('position', { x: 0, y: 0.4, z: 0 })
    entity.setAttribute('scale', { x: 0.5, y: 0.5, z: 1 })
    entity.setAttribute('height', '1');
    entity.setAttribute('width', width);
    entity.setAttribute('color', 'white');
    entity.setAttribute('text', {
        'value': text,
        'align': 'center',
        'width': 6,
        'color': 'black'
    });
    entity.setAttribute('material', { opacity: 0.6 })
    return entity;
}

function createPlayer(){
    // New entity player and then create buttons
    let player_entity = document.createElement('a-entity')
    player_entity.classList.add('babiaxrPlayer')

    play_button = playButton(player_entity)
    play_button.setAttribute('position', {x: 2.35, y: -0.65, z: 0})

    pause_button = pauseButton()
    pause_button.setAttribute('position', {x: 2.35, y: -0.65 , z: 0})
    player_entity.appendChild(pause_button)

    let rewind_button = rewindButton()
    rewind_button.setAttribute('position', {x: 1.25, y: -0.65 , z: 0})
    player_entity.appendChild(rewind_button)

    let forward_button = forwardButton()
    forward_button.setAttribute('position', {x: 3.7, y: -0.65 , z: 0})
    player_entity.appendChild(forward_button)

    let skip_prev_button = skipPreviousButton()
    skip_prev_button.setAttribute('position', {x: 1.95, y: -0.65 , z: 0})
    player_entity.appendChild(skip_prev_button)

    let skip_next_button = skipNextButton()
    skip_next_button.setAttribute('position', {x: 3, y: -0.65 , z: 0})
    player_entity.appendChild(skip_next_button)

    return player_entity
}

function playButton(player){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPlay')
    let vertices = [[0, 0, 0], [0, 3, 0], [2.5, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrContinue')

    return entity
}

function rewindButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    entity.setAttribute('rotation', {x: 0, y: 180, z: 0})

    // Event
    emitEvents(entity, 'babiaxrToPast')

    return entity
}

function forwardButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1.25, 1.5, 0], [1.25, 3, 0], [2.5, 1.5, 0],
                    [1.25, 0, 0], [1.25, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrToPresent')

    return entity
}

function skipPreviousButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1, 1.5, 0], [1, 3, 0], [2, 1.5, 0], [2, 3, 0], [2.5, 3, 0],
                    [2.5, 0, 0], [2, 0, 0], [2, 1.5, 0], [1, 0, 0], [1, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);
    entity.setAttribute('rotation', {x: 0, y: 180, z: 0})

    // Event
    emitEvents(entity, 'babiaxrSkipPrev')

    return entity
}

function skipNextButton(){
    let entity = document.createElement('a-entity')
    let vertices = [[0, 0, 0], [0, 3, 0], [1, 1.5, 0], [1, 3, 0], [2, 1.5, 0], [2, 3, 0], [2.5, 3, 0],
                    [2.5, 0, 0], [2, 0, 0], [2, 1.5, 0], [1, 0, 0], [1, 1.5, 0], [0, 0, 0]];
    let button = load_model(vertices);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrSkipNext')

    return entity
}

function pauseButton(){
    let entity = document.createElement('a-entity')
    entity.classList.add('babiaxrPause')
    let vertices_1 = [[0, 0, 0], [0, 3, 0], [1, 3, 0], [1, 0, 0], [0, 0, 0]];
    let vertices_2 = [[1.5, 0, 0],[1.5, 3, 0], [2.5, 3, 0], [2.5, 0, 0], [1.5, 0, 0]];
    let button = merge_model(vertices_1, vertices_2);
    entity.setObject3D('mesh', button);

    // Event
    emitEvents(entity, 'babiaxrStop')

    return entity
}

function load_model(vertices){
    let vertices_len = vertices.length;

    let array_extrude = []
    const scale = 0.11
    for ( i = 0; i < vertices_len; i++ ) {
        let x = scale * vertices[i][0];
        let y = scale * vertices[i][1];
        let z = scale * vertices[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude.push(vector);
    }

    let fig_form = new  THREE.Shape(array_extrude)
    let extrude_data = {
        depth : 0.05,
        bevelEnabled : false,
        bevelSegments : 1,
        steps : 1,
        bevelThickness: 1,
    };

    // Material
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: false } );

    let geometry_extrude = new THREE.ExtrudeGeometry(fig_form, extrude_data);
    let mesh_extrude = new THREE.Mesh(geometry_extrude, material)

    return mesh_extrude
}

function merge_model(vertices1, vertices2){
    let vertices1_len = vertices1.length;
    let vertices2_len = vertices2.length;

    let array_extrude1 = []
    let array_extrude2 = []
    const scale = 0.11
    for ( i = 0; i < vertices1_len; i++ ) {
        let x = scale * vertices1[i][0];
        let y = scale * vertices1[i][1];
        let z = scale * vertices1[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude1.push(vector);
    }
    for ( i = 0; i < vertices2_len; i++ ) {
        let x = scale * vertices2[i][0];
        let y = scale * vertices2[i][1];
        let z = scale * vertices2[i][2];
        let vector = new THREE.Vector3(x, y, z); // Create vertor
        array_extrude2.push(vector);
    }

    // Figura
    let fig_form1 = new  THREE.Shape(array_extrude1)
    let fig_form2 = new  THREE.Shape(array_extrude2)

    let extrude_data = {
        depth : 0.05,
        bevelEnabled : false,
        bevelSegments : 1,
        steps : 1,
        bevelThickness: 1,
    };

    // Material
    let material = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide, wireframe: false } );

    // Hacer un merge de dos figuras
    let geometry_extrude1 = new THREE.ExtrudeGeometry(fig_form1, extrude_data);
    let geometry_extrude2 = new THREE.ExtrudeGeometry(fig_form2, extrude_data);
    let mesh_extrude1 = new THREE.Mesh(geometry_extrude1, material);
    mesh_extrude1.updateMatrix();
    geometry_extrude2.merge(mesh_extrude1.geometry, mesh_extrude1.matrix);
    let mesh_extrude2 = new THREE.Mesh(geometry_extrude2, material);

    return mesh_extrude2;
}

function emitEvents(element, event_name){

    element.addEventListener('click', function () {
        if (element.classList == 'babiaxrPlay'){
            player.removeChild(element)
            player.appendChild(pause_button)
        } else if (element.classList == 'babiaxrPause'){
            player.removeChild(pause_button)
            player.appendChild(play_button)
        }
        console.log('Emit..... ' + event_name)
        el.emit(event_name)
    });

}
