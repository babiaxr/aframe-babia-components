const quarterItems = []
let initItems = undefined
const arrayPromises = []
const maxFiles = 4

let init1 = fetch("data_0.json").then(function (response) {
    return response.json();
})
init2 = init1.then(function (json) {
    // do a bunch of stuff
    initItems = json
});
arrayPromises.push(init2)

for (let i = 1; i <= maxFiles; i++) {
    let p1 = fetch("data_" + i + ".json").then(function (response) {
        return response.json();
    })
    p2 = p1.then(function (json) {
        // do a bunch of stuff
        quarterItems.push(json)
    });
    arrayPromises.push(p2)
}

Promise.all(arrayPromises).then(values => {
    doIt()
});


let doIt = () => {
    //document.getElementById("cityevolve").setAttribute("codecity-quarter", "items", JSON.stringify(quarterItems[0]))
    loop();
}

let i = 0
let index = 0

let loop = () => {
    setTimeout(function () {
        console.log("Loop number", i)
        let changedItems = []
        quarterItems[index].forEach((item) => {
            if (document.getElementById(item.id) != undefined && item.value != 0.0) {
                
                // Add to changed items
                changedItems.push(item.id)

                // Get old data in order to do the math
                let prevPos = document.getElementById(item.id).getAttribute("position")
                let prevWidth = document.getElementById(item.id).getAttribute("geometry").width
                let prevDepth = document.getElementById(item.id).getAttribute("geometry").depth
                let oldRawArea = parseFloat(document.getElementById(item.id).getAttribute("babiaxr-rawarea"))

                // Calculate Aspect Ratio
                let reverseWidthDepth = false
                let AR = prevWidth / prevDepth
                if (AR < 1) {
                    reverseWidthDepth = true
                    AR = prevDepth / prevWidth
                }

                // New area that depends on the city
                let newAreaDep = (item.value * (prevDepth * prevWidth)) / oldRawArea

                // New size for the building based on the AR and the Area depend
                let newWidth = Math.sqrt(newAreaDep * AR)
                let newDepth = Math.sqrt(newAreaDep / AR)
                if (reverseWidthDepth) {
                    newDepth = Math.sqrt(newAreaDep * AR)
                    newWidth = Math.sqrt(newAreaDep / AR)
                }


                // Write the new values
                document.getElementById(item.id).setAttribute("babiaxr-rawarea", item.value)
                document.getElementById(item.id).setAttribute("geometry", "width", newWidth)
                document.getElementById(item.id).setAttribute("geometry", "depth", newDepth)
                document.getElementById(item.id).setAttribute("geometry", "height", item.height)
                document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: item.height / 2, z: prevPos.z })
            }
        })

        // Put height 0 those that not exists
        initItems.forEach((item) => {
            if (!changedItems.includes(item.id)){
                let prevPos = document.getElementById(item.id).getAttribute("position")
                document.getElementById(item.id).setAttribute("geometry", "height", -0.1)
                document.getElementById(item.id).setAttribute("position", { x: prevPos.x, y: 0, z: prevPos.z })
            }
        })

        index++
        if (index > maxFiles - 1) {
            index = 0
        }
        i++;
        if (i < maxFiles) {
            loop();
        }
    }, 3000);
}