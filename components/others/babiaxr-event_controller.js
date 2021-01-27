/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

/**
* Component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-event-controller', {
    schema: {
        navigation : {type : 'string'},
        targets : { type: 'string' },
    },

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {},

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        el = this.el
        let data = this.data
        
        navigation = data.navigation
        charts = JSON.parse(data.targets)

        time_evol(navigation)      
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

let el
let navigation
let charts
var data_array
var data_array_reverse = [] 
let current
let last
let reverse = false
let first_time = true
let firts_point = 0

function time_evol(navigation){ 
    let commits = document.getElementById(navigation).getAttribute('babiaxr-navigation-bar').commits
    if (commits && first_time){
        data_array = JSON.parse(commits)
        for ( let i in data_array){
            data_array_reverse.push(data_array[i]) 
        }
        data_array_reverse.reverse() 
        
        // First current
        if (reverse){
            let position = (data_array.length - 1) - firts_point
            current = data_array_reverse[firts_point]
            last = position
        } else {
            current = data_array[firts_point]
            last = firts_point
        }
        first_time = false
        controls()
    }
}

function play(array){
    let i = 0
    for (let x in array){
        if (array[x] == current){
            i = parseInt(x) + 1
        }
    }

    let loop = setInterval( function() {
        if (i < array.length){
            current = array[i]

            if (reverse){
               let x = (array.length - 1) - i
               showDate(x)
               last = x
            } else {
                showDate(i)
                last = i
            }
            
            changeChart()
            i++

            document.addEventListener('babiaxrStop', function () {
                clearInterval(loop)
            })
            if ( i == array.length){
                let pause_button = document.getElementsByClassName('babiaxrPause')[0]
                pause_button.emit('click')
            }
        } else {
            el.emit('babiaxrStop')
        }
    }, 3000)
}

function skip(destination){
    for ( let x in data_array ) {
        if (data_array[x] == current){
            if ((destination == 'next') && (x < data_array.length - 1)){
                x++
            } else if ((destination == 'prev') && (x >= 1)){
                x--
            }
            current = data_array[x]
            showDate(x)
            last = x
            break
        }
    }
    changeChart()
}

function changePoint(point){
    for (let x in data_array ) {
        if (data_array[x].commit == point.commit){
            current = data_array[x]
            showDate(x)
            last = x
            break
        }
    }
    changeChart()
}

function changeChart(){
    let data= document.getElementById(current.commit).getAttribute('babiadata')
    for (let i in charts){
        let entity = document.getElementById(charts[i].id)
        if (entity){
            entity.setAttribute('babiaxr-vismapper', 'dataToShow', data)
        }
    }
}

function controls(){
    if (reverse){
        play(data_array_reverse)
    } else {
        play(data_array)
    }
    
    document.addEventListener('babiaxrShow', function (event) {
        changePoint(event.detail.data)
        el.emit('babiaxrStop')
    })

    document.addEventListener('babiaxrContinue', function () {
        console.log('PLAY')
        if (reverse){
            play(data_array_reverse)
        } else {
            play(data_array)
        }
    })

    document.addEventListener('babiaxrToPresent', function () {
        console.log('TO PRESENT')
        reverse = false
        el.emit('babiaxrStop')
        play(data_array)
    })

    document.addEventListener('babiaxrToPast', function () {
        console.log('TO PAST')
        reverse = true
        el.emit('babiaxrStop')
        play(data_array_reverse)
    })

    document.addEventListener('babiaxrSkipNext', function () {
        console.log('SKIP NEXT')
        el.emit('babiaxrStop')
        skip('next')
    })

    document.addEventListener('babiaxrSkipPrev', function () {
        console.log('SKIP PREV')
        el.emit('babiaxrStop')
        skip('prev')
    })
}

function showDate(i){
    let entities = document.getElementsByClassName('babiaxrTimeBar')[0].children
    if (last || last == 0 ){
        let pointToHide = entities[last]
        pointToHide.emit('removeinfo')
    }
    let pointToShow = entities[i]
    pointToShow.emit('showinfo')
}