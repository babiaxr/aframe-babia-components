// Queriers
require('./components/queriers/babia-querygithub')
require('./components/queriers/babia-queryjson')
require('./components/queriers/babia-querycsv')
require('./components/queriers/babia-queryes')

// Filters
require('./components/filters/babia-filter')
require('./components/filters/babia-treebuilder')
require('./components/filters/babia-selector')

// Visualizers
require('./components/visualizers/babia-pie')
require('./components/visualizers/babia-bars')
require('./components/visualizers/babia-barsmap')
require('./components/visualizers/babia-bubbles')
require('./components/visualizers/babiaxr-codecity')
require('./components/visualizers/babia-city')
require('./components/visualizers/babia-cyls')
require('./components/visualizers/babia-cylsmap')
require('./components/visualizers/babia-doughnut')
require('./components/visualizers/babia-terrain')
require('./components/visualizers/babia-boats')
require('./components/visualizers/babia-network')

// Others
require('./components/others/babiaxr-totem')
require('./components/others/babia-ui')
require('./components/others/babiaxr-interaction-mapper')
require('./components/others/babiaxr-debug-data')
require('./components/others/babiaxr-navigation_bar')
require('./components/others/babiaxr-event_controller')
require('./components/others/babia-lookat')
require('./components/others/babia-label')
require('./components/others/babia-axis')
require('./components/others/common')
require('./components/others/babia-controls')
require('./components/others/babia-navigator')
require('./components/others/babia-slider')
require('./components/others/babia-ui-link')
require('./components/others/babia-camera')
require('./components/others/babia-range-selector')
require('./components/others/babia-experiment')
require('./components/others/babia-poster')
require('./components/others/babia-task')

// Geometries
require('./components/geometries/babia-bar')
require('./components/geometries/babia-cyl')

// Common
require('./common/noti-buffer')

// Assets
pauseButton = require('./components/others/models/pause_button.gltf')
playButton = require('./components/others/models/play_button.gltf')
skipButton = require('./components/others/models/skip_button.gltf')
rewindButton = require('./components/others/models/rewind_button.gltf')
tooltip = require('./components/others/assets/tooltip.png')

// THREE imports for slider
FontLoader = require('three/examples/jsm/loaders/FontLoader')
TextGeometry = require('three/examples/jsm/geometries/TextGeometry')
