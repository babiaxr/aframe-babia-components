const quarterItems = []
const arrayPromises = []
const maxFiles = 4

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
        console.log("Hola holita")
        quarterItems[index].forEach((item) => {
            let prevPos = document.getElementById(item.id).getAttribute("position")
            document.getElementById(item.id).setAttribute("geometry", "height", item.height)
            document.getElementById(item.id).setAttribute("position", {x: prevPos.x, y: item.height/2, z: prevPos.z})
        })
        index++
        if (index > maxFiles - 1) {
            index = 0
        }
        i++;
        if (i < 10) {
            loop();
        }
    }, 3000);
}