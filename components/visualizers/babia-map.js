// let updateTitle = require('../others/common').updateTitle;
// const colors = require('../others/common').colors;
// let updateFunction = require('../others/common').updateFunction;

// const NotiBuffer = require("../../common/noti-buffer").NotiBuffer;

/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* A-Charts component for A-Frame.
*/

AFRAME.registerComponent("babia-map", {
  dependencies: ['raycaster'],

  schema: {
    width: { type: "number", default: 1000 },
    height: { type: "number", default: 1000 },
    horTexture: { type: "number", default: 2 },
    vertTexture: { type: "number", default: 2 },
    widthSegments: { type: "int", default: 200 },
    heightSegments: { type: "int", default: 200 },
    bumpScale: { type: "number", default: 300 },
    wireframe: { type: "boolean", default: false },
    token: { type: "string" },
    zoom: { type: "number", default: 4 },
    x: { type: "number", default: 0 },
    y: { type: "number", default: 0 },
    subdomain: { type: "string", default: "a" },  // a, b, c
    textureType: { type: "string", default: "Standard" },
    coordinates: { type: "vec2" },
    handsUi: { type: "boolean", default: true},

    entityRightButton: {
      type: 'string',
      default: JSON.stringify({ 
        position: '0.25 201.5 -0.5', 
        rotation: '-30 0 0'
      })
    },
    entityLeftButton: {
      type: 'string',
      default: JSON.stringify({ 
        position: '-0.25 201.5 -0.5', 
        rotation: '-30 0 0'
      })
    },
    rightButtons: {
      type: 'string',
      default: JSON.stringify([
        { height: '0.075', width: '0.2', label: "Zoom In", color: "blue", position: "0 0.15 -0.3", rotation: "0 0 0", textSize: 0.6, className: "zoomInBtn" },
        { height: '0.075', width: '0.2', label: "Zoom Out", color: "purple", position: "0 0.05 -0.3", rotation: "-0 0 0", textSize: 0.6, className: "zoomOutBtn" }
      ])
    },
    crossEntity: {
      type: 'string',
      default: JSON.stringify({
        position: "0 -0.15 -0.25",
        rotation: "0 0 0"
      })
    },
    crossButtons: {
      type: 'string',
      default: JSON.stringify([
        { height: '0.06', width: '0.06', label: "^", color: "darkgray", position: "0 0.1 0", textSize: 0.6, className: "dpadUp" },
        { height: '0.06', width: '0.06', label: "v", color: "darkgray", position: "0 -0.1 0", textSize: 0.6, className: "dpadDown" },
        { height: '0.06', width: '0.06', label: "<", color: "darkgray", position: "-0.125 0 0", textSize: 0.6, className: "dpadLeft" },
        { height: '0.06', width: '0.06', label: ">", color: "darkgray", position: "0.125 0 0", textSize: 0.6, className: "dpadRight" }
      ])
    },
    leftButtons: {
      type: 'string',
      default: JSON.stringify([
        { height: '0.075', width: '0.2', label: "Next Layer", color: "green", position: "0 0.05 -0.3", rotation: "0 0 0", textSize: 0.6, className: "layerUpBtn" },
        { height: '0.075', width: '0.2', label: "Previous Layer", color: "orange", position: "0 -0.05 -0.3", rotation: "0 0 0", textSize: 0.6, className: "layerDownBtn" }
      ])
    },
    coordinatesText: {
      type: 'string',
      default: JSON.stringify({
        label: 'Coordinates: ',
        color: 'black',
        position: '-0.15 0.1 -0.2',
        rotation: '0 0 0',
        textSize: 0.6
      })
    }
  },

  init: function () {
    const data = this.data;
    const el = this.el;
    const layers = ['Coloured', 'Cycle', 'Transport', 'Standard', 'Satellite', 'Hot'];
    let currentLayerIndex = layers.indexOf(el.getAttribute('babia-map').textureType);
    if (currentLayerIndex === -1) {
      // El valor no está en la lista
      currentLayerIndex = 0;
    }

    const BABIA_MAP_PRESET_UI = {
      rightButtons: [
        { height: '0.075', width: '0.2', label: 'Zoom In', color: 'blue', position: '-0.2 0.1 -0.3', rotation: '-30 0 0', textSize: 0.6, className: 'zoomInBtn' },
        { height: '0.075', width: '0.2', label: 'Zoom Out', color: 'purple', position: '-0.2 0 -0.25', rotation: '-30 0 0', textSize: 0.6, className: 'zoomOutBtn' }
      ],
      crossEntity: {
        position: '0.2 0 -0.2',
        rotation: '-30 0 0'
      },
      crossButtons: [
        { height: '0.06', width: '0.06', label: '^', color: 'darkgray', position: '-0.125 0.175 0', textSize: 0.6, className: 'dpadUp' },
        { height: '0.06', width: '0.06', label: 'v', color: 'darkgray', position: '-0.125 0.025 0', textSize: 0.6, className: 'dpadDown' },
        { height: '0.06', width: '0.06', label: '<', color: 'darkgray', position: '-0.2 0.1 0', textSize: 0.6, className: 'dpadLeft' },
        { height: '0.06', width: '0.06', label: '>', color: 'darkgray', position: '-0.05 0.1 0', textSize: 0.6, className: 'dpadRight' }
      ],
      leftButtons: [
        { height: '0.075', width: '0.2', label: 'Next Layer', color: 'green', position: '0 0.2 -0.3', rotation: '-30 0 0', textSize: 0.6, className: 'layerUpBtn' },
        { height: '0.075', width: '0.2', label: 'Previous Layer', color: 'orange', position: '0 0.1 -0.25', rotation: '-30 0 0', textSize: 0.6, className: 'layerDownBtn' }
      ],
      coordinatesText: {
        label: 'Coordinates: ',
        color: 'black',
        position: '-0.15 0 -0.2',
        rotation: '-30 0 0',
        textSize: 0.6
      }
    };

    let crossButtons = [];
    let entityRightButton = [];
    let entityLeftButton = [];
    let rightButtons = [];
    let crossEntity = [];
    let leftButtons = [];
    let coordinatesText = [];

    try {
      // BOTONES EN RV

      const scene = document.querySelector('a-scene');

      function findHandEntity(handedness) {
        // 1. Buscar por ID directo
        const idSelector = `#${handedness}Hand`;
        let entity = document.querySelector(idSelector);
        if (entity) return entity;

        // 2. Buscar entidad laser-controls con hand: left o right
        entity = document.querySelector(`[laser-controls][hand="${handedness}"]`);
        if (entity) return entity;

        // 3. Buscar entidad oculus-touch-controls con hand: left o right
        entity = document.querySelector(`[oculus-touch-controls][hand="${handedness}"]`);
        if (entity) return entity;

        // Si no se encontró nada
        return null;
      }

      // Ejemplo de uso:
      const leftHand = findHandEntity("left");
      const rightHand = findHandEntity("right");

      let stateHands = false;

      const handlers = {
        layerUp: () => {
          if (currentLayerIndex < layers.length - 1) {
            currentLayerIndex++;
            updateLayer();
          }
        },
        layerDown: () => {
          if (currentLayerIndex > 0) {
            currentLayerIndex--;
            updateLayer();
          }
        },
        zoomIn: () => updateZoom(true),
        zoomOut: () => updateZoom(false),
        mouseEnter: (e) => {
          e.target.setAttribute('material', 'color', 'yellow');
        },
        mouseLeave: (e) => {
          const el = e.target;
          const defaultColor = el.classList.contains('zoomInBtn') ? 'blue' :
                              el.classList.contains('zoomOutBtn') ? 'purple' :
                              el.classList.contains('layerUpBtn') ? 'green' :
                              el.classList.contains('layerDownBtn') ? 'orange' :
                              'darkgray';
          el.setAttribute('material', 'color', defaultColor);
        },
        moveUp: () => move('up'),
        moveDown: () => move('down'),
        moveRight: () => move('right'),
        moveLeft: () => move('left'),
      };

      function toggleClickEvents(enable, ...parents) {
        const toggleEvent = (el, event, handler) => {
          el[enable ? 'addEventListener' : 'removeEventListener'](event, handler);
        };

        parents.forEach(parent => {
          // Mapear clases a handlers de click
          const clickMap = {
            '.layerUpBtn': handlers.layerUp,
            '.layerDownBtn': handlers.layerDown,
            '.zoomInBtn': handlers.zoomIn,
            '.zoomOutBtn': handlers.zoomOut,
            '.dpadUp': handlers.moveUp,
            '.dpadDown': handlers.moveDown,
            '.dpadLeft': handlers.moveLeft,
            '.dpadRight': handlers.moveRight,
          };

          const allContainers = [parent, ...parent.querySelectorAll('.cross')];
          allContainers.forEach(container => {
            for (const [selector, handler] of Object.entries(clickMap)) {
              container.querySelectorAll(selector).forEach(btn => toggleEvent(btn, 'click', handler));
            }
          });

          // Para los eventos mouseenter/mouseleave en botones interactivos
          parent.querySelectorAll('.interactive-button').forEach(btn => {
            toggleEvent(btn, 'mouseenter', handlers.mouseEnter);
            toggleEvent(btn, 'mouseleave', handlers.mouseLeave);
          });
        });
      }

      let openCloseMenu = (entity) => {
        entity.addEventListener('gripdown', function () {
          const children = entity.children;
          // Alternar el estado
          stateHands = !stateHands;
          for (let i = 0; i < children.length; i++) {
            if (children[i].setAttribute) {
              children[i].setAttribute('visible', stateHands);
            }
          }
        })
      }

      crossButtons = JSON.parse(data.crossButtons);
      entityRightButton = JSON.parse(data.entityRightButton);
      entityLeftButton = JSON.parse(data.entityLeftButton);
      rightButtons = JSON.parse(data.rightButtons);
      crossEntity = JSON.parse(data.crossEntity);
      leftButtons = JSON.parse(data.leftButtons);
      coordinatesText = JSON.parse(data.coordinatesText);

      let leftDesktopHolder = document.createElement('a-entity');
      leftDesktopHolder.setAttribute('position', entityLeftButton.position);
      leftDesktopHolder.setAttribute('rotation', entityLeftButton.rotation);
      leftDesktopHolder.classList.add('left-desktop-ui-position');
      el.appendChild(leftDesktopHolder);

      let rightDesktopHolder = document.createElement('a-entity');
      rightDesktopHolder.setAttribute('position', entityRightButton.position);
      rightDesktopHolder.setAttribute('rotation', entityRightButton.rotation);
      rightDesktopHolder.classList.add('right-desktop-ui-position');
      el.appendChild(rightDesktopHolder);

      addButtons(leftDesktopHolder, rightDesktopHolder, rightButtons, crossEntity, crossButtons, leftButtons, coordinatesText);

      if (data.handsUi) {
        addButtons(leftHand, rightHand, BABIA_MAP_PRESET_UI.rightButtons, BABIA_MAP_PRESET_UI.crossEntity, BABIA_MAP_PRESET_UI.crossButtons, BABIA_MAP_PRESET_UI.leftButtons, BABIA_MAP_PRESET_UI.coordinatesText);

        scene.addEventListener('enter-vr', () => {
          console.log("Conectado a VR");
          stateHands = true;
          leftDesktopHolder.setAttribute('visible', false);
          rightDesktopHolder.setAttribute('visible', false);
          leftHand.setAttribute('visible', true);
          rightHand.setAttribute('visible', true);
          openCloseMenu(leftHand);
          openCloseMenu(rightHand);
          toggleClickEvents(true, leftHand, rightHand);
          toggleClickEvents(false, leftDesktopHolder, rightDesktopHolder);
        });

        scene.addEventListener('exit-vr', () => {
          console.log("Saliendo de VR");
          stateHands = false;
          leftDesktopHolder.setAttribute('visible', true);
          rightDesktopHolder.setAttribute('visible', true);
          leftHand.setAttribute('visible', false);
          rightHand.setAttribute('visible', false);
          toggleClickEvents(false, leftHand, rightHand);
          toggleClickEvents(true, leftDesktopHolder, rightDesktopHolder);
        });
      }

      const updateLayer = () => {
        const newLayer = layers[currentLayerIndex];
        console.log('Cambiando a capa:', newLayer);
        el.setAttribute('babia-map', 'textureType', newLayer);
        this.buildMesh(data, el);  // Redibujar el mapa con la nueva capa
      };

      const updateZoom = (zoomIn) => {
        const MIN_ZOOM = 0;
        const MAX_ZOOM = 19;

        let currentZoom = el.getAttribute('babia-map').zoom;
        let currentX = el.getAttribute('babia-map').x;
        let currentY = el.getAttribute('babia-map').y;

        if (zoomIn === true && currentZoom < MAX_ZOOM) {
          currentZoom += 1;
          currentX = Math.min(currentX * 2, Math.pow(2, currentZoom) - 1);
          currentY = Math.min(currentY * 2, Math.pow(2, currentZoom) - 1);
        } else if (!zoomIn && currentZoom > MIN_ZOOM) {
          currentZoom -= 1;
          currentX = Math.max(0, Math.trunc(currentX / 2));
          currentY = Math.max(0, Math.trunc(currentY / 2));
        }

        el.setAttribute('babia-map', 'zoom', currentZoom);
        el.setAttribute('babia-map', 'x', currentX);
        el.setAttribute('babia-map', 'y', currentY);

        this.buildMesh(data, el);
      };

      const move = (where) => {
        let currentZoom = el.getAttribute('babia-map').zoom;
        let currentX = el.getAttribute('babia-map').x;
        let currentY = el.getAttribute('babia-map').y;

        const maxX = Math.pow(2, currentZoom) - 1;
        const maxY = maxX;

        console.log(where);

        switch (where) {
          case 'up':
            if (currentY > 0) currentY -= 1;
            break;
          case 'down':
            if (currentY < maxY) currentY += 1;
            break;
          case 'right':
            if (currentX < maxX) currentX += 1;
            break;
          case 'left':
            if (currentX > 0) currentX -= 1;
            break; 
          default:
            console.error("Opción de movimiento no permitida.");
        }

        el.setAttribute('babia-map', 'x', currentX);
        el.setAttribute('babia-map', 'y', currentY);

        this.buildMesh(data, el);
      };

      // Convierte coordenadas de tile a lat/lon (como las usa OSM)
      function localCoordsToLatLon(localX, localZ, el) {
        const zoom = el.getAttribute('babia-map').zoom;
        const tileX = el.getAttribute('babia-map').x;
        const tileY = el.getAttribute('babia-map').y;
        const width = el.getAttribute('babia-map').width;
        const height = el.getAttribute('babia-map').height;

        // Convertimos coordenadas locales en [0, 1]
        const u = (localX + width / 2) / width;
        const v = 1 - (localZ + height / 2) / height;

        // Coordenadas reales de tesela (decimales)
        const n = Math.pow(2, zoom);
        const globalTileX = tileX + u;
        const globalTileY = tileY + v;

        console.log(`Global: ${globalTileX}, ${globalTileY}`);

        // Conversión a lat/lon usando fórmula de Web Mercator
        const lon = globalTileX / n * 360 - 180;
        const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * globalTileY / n)));
        const lat = latRad * (180 / Math.PI);

        return { lat, lon };
      }

      leftHand.addEventListener('click', (evt) => {
        const intersection = evt.detail.intersection;
        if (!intersection) return;

        const targetEl = intersection.object.el;
        // Si no es el mapa, no sigue
        if (targetEl !== el) return;

        const point = intersection.point.clone();
        const localPoint = el.object3D.worldToLocal(point);
        const localX = localPoint.x;
        const localY = localPoint.y;
        const localZ = localPoint.z;

        const geoCoords = localCoordsToLatLon(localX, localZ, el);
        el.setAttribute('babia-map', 'coordinates', { x: geoCoords.lat, y: geoCoords.lon });

        let marker = el.querySelector('.marker');
        if (!marker) {
          marker = document.createElement('a-entity');
          marker.setAttribute('geometry', { primitive: 'sphere', radius: data.width/100 });
          marker.setAttribute('material', { color: 'red' });
          marker.setAttribute('position', { x: localX, y: localY+(data.bumpScale/1.5), z: localZ });
          marker.classList.add('marker');
          el.appendChild(marker);
        } else {
          marker.object3D.position.set(localX, localY+(data.bumpScale/1.5), localZ);
          marker.setAttribute('visible', 'true');
        }

        const coords = el.getAttribute('babia-map').coordinates;
        console.log(`Coordenadas: ${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}`)
        let textBlocks = el.querySelectorAll('.coordinates-text');
        textBlocks.forEach (textBlock => {
          textBlock.setAttribute('value', `Coordenadas: ${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}`);
        })

        if(data.handsUi) {
          let textBlock = leftHand.querySelector('.coordinates-text');
          textBlock.setAttribute('value', `Coordenadas: ${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}`);
        }
      });

      toggleClickEvents(true, leftDesktopHolder, rightDesktopHolder);

      // GUARDAR EL TOKEN

      const form = document.querySelector("#token-form");
      const input = document.querySelector("#token-input");

      const savedToken = localStorage.getItem("babia-map-token");
      if (savedToken) {
        input.value = savedToken;
        data.token = savedToken;
        this.buildMesh(data, el);
      }

      if (form && input) {
        form.addEventListener("submit", (e) => {
          e.preventDefault(); // ← esto evita que la página se recargue

          const token = input.value.trim();
          if (token) {
            data.token = token;
            localStorage.setItem("babia-map-token", token);
            console.log("Token actualizado:", token);
            this.buildMesh(data, el);
          } else {
            alert("Por favor, introduce un token válido.");
          }
        });
      } else {
        console.warn("Formulario de token no encontrado en el DOM.");
      }
    } catch (e) {
      console.warn('Error:', e);
    }
  },

  remove: function () {
    this.el.removeObject3D("mesh");
  },

  update: function (oldData) {
    const data = this.data;
    const el = this.el;

    if (data.token !== oldData.token || data.textureType !== oldData.textureType) {
      el.removeObject3D("mesh");
      this.buildMesh(data, el);
    }
  },

  buildMesh: function (data, el) {
    let minHeight;
    let maxHeight;

    const vertexShader1 = `
      uniform sampler2D bumpTexture;
      uniform float bumpScale;
      varying float vAmount;
      void main() {
          vec4 bumpData = texture2D(bumpTexture, uv);
          vAmount = bumpData.r;
          vec3 newPosition = position + normal * bumpScale * vAmount;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader1 = `
      uniform float minHeight;
      uniform float maxHeight;
      varying float vAmount;
      void main() {
          float totalHeight = maxHeight - minHeight;
          float maxWater = minHeight + totalHeight * 0.55;
          float minSand = minHeight + totalHeight * 0.54;
          float maxSand = minHeight + totalHeight * 0.57;
          float minGrass = minHeight + totalHeight * 0.56;
          float maxGrass = minHeight + totalHeight * 0.7;
          float minRock = minHeight + totalHeight * 0.60;
          float maxRock = minHeight + totalHeight * 0.80;
          float minSnow = minHeight + totalHeight * 0.65;

          vec3 water = (smoothstep(0.00, maxWater, vAmount) - smoothstep(minSand, maxWater, vAmount)) * vec3(0.0, 0.0, 1.0);
          vec3 sand = (smoothstep(minSand, maxSand, vAmount) - smoothstep(minGrass, maxSand, vAmount)) * vec3(0.76, 0.7, 0.5);
          vec3 grass = (smoothstep(minGrass, maxGrass, vAmount) - smoothstep(minRock, maxGrass, vAmount)) * vec3(0.0, 0.6, 0.01);
          vec3 rock = (smoothstep(minRock, maxRock, vAmount) - smoothstep(minSnow, maxRock, vAmount)) * vec3(0.28, 0.25, 0.23);
          vec3 snow = (smoothstep(minSnow, 1.0, vAmount)) * vec3(1.0, 1.0, 1.0);

          gl_FragColor = vec4(water + sand + grass + rock + snow, 1.0);
      }
    `;

    const vertexShader2 = `
      uniform sampler2D bumpTexture;
      uniform float bumpScale;
      varying vec2 vUv;

      varying float vAmount;
      void main() {
          vUv = uv;
          vec4 bumpData = texture2D(bumpTexture, uv);
          vAmount = bumpData.r; // Solo canal rojo
          vec3 newPosition = position + normal * bumpScale * vAmount;

          // Posición final del vértice con transformación del modelo, vista y proyección
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader2 = `
    uniform sampler2D mapTexture;
    varying vec2 vUv;

    void main() {
        vec3 textureColor = texture2D(mapTexture, vUv).rgb;
        gl_FragColor = vec4(textureColor, 1.0);
    }
    `;  

    // CREAR TEXTURA DESDE IMAGEN
    async function loadDisplacementMap(url) {
      let img = new Image();
      img.src = url;
      img.crossOrigin = "Anonymous";  // Evitar problemas CORS
  
      return new Promise((resolve, reject) => {
          img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");

              // Dibujar la imagen en el canvas de forma invertida (la orientación de la imagen es diferente en canvas respecto a WebGL)
              ctx.translate(0, canvas.height);
              ctx.scale(1, -1);
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              const data = imageData.data;
  
              // Crear un array para la textura de desplazamiento
              const displacement = new Float32Array(img.width * img.height);

              let elevation;
              let auxMinHeight = 1;
              let auxMaxHeight = 0;
  
              for (let i = 0; i < data.length; i += 4) {
                  const R = data[i];
                  const G = data[i + 1];
                  const B = data[i + 2];
  
                  // Fórmula de Mapbox terrain-RGB -> Elevación en metros
                  elevation = (R * 256 * 256 + G * 256 + B) * 0.1 - 10000;
                  
                  // Normalizar para Three.js (opcional, si necesitas valores entre 0 y 1)
                  elevation = (elevation + 10000) / 20000; // Elevación entre 0 y 1

                  // Comprobar el valor más bajo y más alto
                  if (elevation < auxMinHeight) {
                      auxMinHeight = elevation;
                  }
                  if (elevation > auxMaxHeight) {
                      auxMaxHeight = elevation;
                  }

                  displacement[i / 4] = elevation;
              }

              // Guardar el valor más bajo y más alto
              minHeight = auxMinHeight;
              maxHeight = auxMaxHeight;
  
              // Crear textura de desplazamiento
              const texture = new THREE.DataTexture(
                  displacement,
                  img.width,
                  img.height,
                  THREE.RedFormat, // Un canal para el desplazamiento
                  THREE.FloatType  // Usamos valores en coma flotante
              );
  
              texture.needsUpdate = true;
              resolve(texture);
          };
          img.onerror = reject;
      });
    };

    let urlMapbox = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${data.zoom}/${data.x}/${data.y}@2x.pngraw?access_token=${data.token}`

    // CREAR MALLA
    loadDisplacementMap(urlMapbox).then((texture) => {
      console.log("Displacement map cargado:", urlMapbox);

      // Horizontal & vertical texture repetition
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(data.horTexture, data.vertTexture);

      // Añadir uniformes
      let uniforms;
      let groundMaterial;

      // Si el tipo de textura es 0 (Openstreetmap)
      // Si el tipo de textura es 1 (Shaders)
      if (data.textureType === "Coloured") {
        uniforms = {
          bumpTexture: { type: "t", value: texture },
          bumpScale: { type: "f", value: data.bumpScale },
          minHeight: { value: minHeight },
          maxHeight: { value: maxHeight },
        };
        console.log("Uniforms:", uniforms);

        // Añadir shader
        groundMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: vertexShader1,
          fragmentShader: fragmentShader1,
        });
      } else {
        let url;

        switch (data.textureType) {
          case "Standard":
            // Si el tipo de textura es Openstreetmap Estándar
            url = `https://tile.openstreetmap.org/${data.zoom}/${data.x}/${data.y}.png`;
            break;
          case "Satellite":
            // Si el tipo de textura es Satélite
            url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/${data.zoom}/${data.x}/${data.y}?access_token=${data.token}`;
            break;
          case "Hot":
            // Si el tipo de textura es Humanitaian OpenStreetMap Team
            url = `https://tile-a.openstreetmap.fr/hot/${data.zoom}/${data.x}/${data.y}.png`;
            break;
          case "Cycle":
            // Si el tipo de textura es OpenCycleMap
            url = `https://${data.subdomain}.tile.thunderforest.com/cycle/${data.zoom}/${data.x}/${data.y}.png`;
            break;
          case "Transport":
            // Si el tipo de textura es Thunderforest Transport
            url = `https://${data.subdomain}.tile.thunderforest.com/transport/${data.zoom}/${data.x}/${data.y}.png`;
            break;
          default:
            console.error("Tipo de textura no soportado");
        };
        
        const textureLoader = new THREE.TextureLoader();
        const mapTexture = textureLoader.load(url);

        uniforms = {
          bumpTexture: { type: "t", value: texture },
          bumpScale: { type: "f", value: data.bumpScale },
          mapTexture: { value: mapTexture },
        };
        console.log("Uniforms:", uniforms);

        // Añadir shader
        groundMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: vertexShader2,
          fragmentShader: fragmentShader2,
        });
      }

      // Crear geometría del terreno
      const groundGeo = new THREE.PlaneGeometry(
        data.width,
        data.height,
        data.widthSegments,
        data.heightSegments
      );

      // Crear malla
      let groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
      groundMesh.rotation.x = -Math.PI / 2;
      groundMesh.position.y = 0;

      // Añadir la malla a la entidad
      el.setObject3D("mesh", groundMesh);

      console.log(data)

      },
      (error) => {
        console.error("Error al cargar el displacement map:", error);
      }
    );
  }
});

function addButtons(leftMenu, rightMenu, rightButtons, crossEntity, crossButtons, leftButtons, coordinatesText) {
  leftButtons.forEach(btnData => {
    const btn = createButton(
      `primitive: plane; height: ${btnData.height}; width: ${btnData.width}`,
      btnData.label,
      btnData.color,
      btnData.position,
      btnData.rotation,
      btnData.textSize,
      [btnData.className]
    );
    leftMenu.appendChild(btn); 
  });

  rightButtons.forEach(btnData => {
    const btn = createButton(
      `primitive: plane; height: ${btnData.height}; width: ${btnData.width}`,
      btnData.label,
      btnData.color,
      btnData.position,
      btnData.rotation,
      btnData.textSize,
      [btnData.className]
    );
    rightMenu.appendChild(btn); 
  });

  let cross = document.createElement('a-entity');
  cross.setAttribute('rotation', crossEntity.rotation); // este es el tamaño del texto
  cross.setAttribute('position', crossEntity.position);
  cross.classList.add('cross');
  rightMenu.appendChild(cross);

  crossButtons.forEach(btnData => {
    const btn = createButton(
      `primitive: plane; height: ${btnData.height}; width: ${btnData.width}`,
      btnData.label,
      btnData.color,
      btnData.position,
      btnData.rotation,
      btnData.textSize,
      [btnData.className]
    );
    cross.appendChild(btn); 
  });

  let textBlock = document.createElement('a-text');
  textBlock.setAttribute('value', coordinatesText.label);
  textBlock.setAttribute('color', coordinatesText.color);
  textBlock.setAttribute('position', coordinatesText.position);
  textBlock.setAttribute('rotation', coordinatesText.rotation);
  textBlock.setAttribute('width', coordinatesText.textSize);
  textBlock.classList.add('coordinates-text');
  leftMenu.appendChild(textBlock);
}

function createButton(geometry, label, color, position, rotation = null, textSize = 0.5, classes = []) {
  const button = document.createElement('a-text');

  button.setAttribute('geometry', geometry);
  button.setAttribute('material', `color: ${color}`);
  button.setAttribute('value', label);
  button.setAttribute('align', 'center');
  button.setAttribute('width', textSize);
  button.setAttribute('position', position);

  if (rotation) {
    button.setAttribute('rotation', rotation);
  }

  button.classList.add('collidable', 'interactive-button', ...classes);
  return button;
}


