const colors = {
    'palettes': {
        "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"],
        "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"],
        "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"],
        "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"],
        "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"],
        "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"],
        "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"],
        "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"],
        "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]    
    },
    'get': function (i, palette) {
        let length = this.palettes[palette].length;
        return this.palettes[palette][i%length];
    }
};


let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babia-filter']) {
            self.dataComponent = dataElement.components['babia-filter']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babia-queryjson']) {
            self.dataComponent = dataElement.components['babia-queryjson']
        } else if (dataElement.components['babia-queryes']) {
            self.dataComponent = dataElement.components['babia-queryes']
        } else if (dataElement.components['babia-querygithub']) {
            self.dataComponent = dataElement.components['babia-querygithub']
        } else if (dataElement.components['babia-selector']) {
            self.dataComponent = dataElement.components['babia-selector'];
            eventName = "babiaSelectorDataReady";
        } else {
            console.error("Problem registering to the querier", el);
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babia-filter']) {
            self.dataComponent = el.components['babia-filter']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babia-queryjson']) {
            self.dataComponent = el.components['babia-queryjson']
        } else if (el.components['babia-queryes']) {
            self.dataComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub']) {
            self.dataComponent = el.components['babia-querygithub']
        } else if (el.components['babia-selector']) {
            self.dataComponent = el.components['babia-selector'];
            eventName = "babiaSelectorDataReady";
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babia-filter]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
            } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
            } else if (document.querySelectorAll('[babia-selector]').length > 0) {
                self.dataComponent = document.querySelectorAll('[babia-selector]')[0].components['babia-selector'];
                eventName = "babiaSelectorDataReady";
            } else {
                console.error("Error, querier not found", el, el.components, el.components['babia-selector']);
                return
            }
        }
    }
    return eventName
}

let findProdComponent = (data, el, selfProducer) => {
    let prodComponent;
    if (data.from) {
        // Save the reference to the querier or filterdata
        let prodElement = document.getElementById(data.from)
        if (prodElement.components['babia-filter']) {
            prodComponent = prodElement.components['babia-filter']
        } else if (prodElement.components['babia-queryjson']) {
            prodComponent = prodElement.components['babia-queryjson']
        } else if (prodElement.components['babia-queryes']) {
            prodComponent = prodElement.components['babia-queryes']
        } else if (prodElement.components['babia-querygithub']) {
            prodComponent = prodElement.components['babia-querygithub']
        } else if (prodElement.components['babia-selector']) {
            prodComponent = prodElement.components['babia-selector'];
        } else {
            console.error("Problem registering to the querier", el);
            return
        }
    } else if (data.nodesFrom) {
        // Save the reference to the querier or filterdata
        let prodElementNodes = document.getElementById(data.nodesFrom)
        if (prodElementNodes.components['babia-filter']) {
            prodComponentNodes = prodElementNodes.components['babia-filter']
        } else if (prodElementNodes.components['babia-queryjson']) {
            prodComponentNodes = prodElementNodes.components['babia-queryjson']
        } else if (prodElementNodes.components['babia-queryes']) {
            prodComponentNodes = prodElementNodes.components['babia-queryes']
        } else if (prodElementNodes.components['babia-querygithub']) {
            prodComponentNodes = prodElementNodes.components['babia-querygithub']
        } else if (prodElementNodes.components['babia-selector']) {
            prodComponentNodes = prodElementNodes.components['babia-selector'];
        } else {
            console.error("Problem registering to the querier", el);
            return
        }
        
        // Save the reference to the querier or filterdata
        let prodElementLinks = document.getElementById(data.linksFrom)
        if (prodElementLinks.components['babia-filter']) {
            prodComponentLinks = prodElementLinks.components['babia-filter']
        } else if (prodElementLinks.components['babia-queryjson']) {
            prodComponentLinks = prodElementLinks.components['babia-queryjson']
        } else if (prodElementLinks.components['babia-queryes']) {
            prodComponentLinks = prodElementLinks.components['babia-queryes']
        } else if (prodElementLinks.components['babia-querygithub']) {
            prodComponentLinks = prodElementLinks.components['babia-querygithub']
        } else if (prodElementLinks.components['babia-selector']) {
            prodComponentLinks = prodElementLinks.components['babia-selector'];
        } else {
            console.error("Problem registering to the querier", el);
            return
        }
        return {'nodes': prodComponentNodes, 'links': prodComponentLinks}
        
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babia-filter'] && selfProducer != 'babia-filter') {
            prodComponent = el.components['babia-filter']
        } else if (el.components['babia-queryjson'] && selfProducer != 'babia-queryjson') {
            prodComponent = el.components['babia-queryjson']
        } else if (el.components['babia-queryes'] && selfProducer != 'babia-queryes') {
            prodComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub'] && selfProducer != 'babia-querygithub') {
            prodComponent = el.components['babia-querygithub']
        } else if (el.components['babia-selector'] && selfProducer != 'babia-selector') {
            prodComponent = el.components['babia-selector'];
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babia-filter]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
            } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
            } else if (document.querySelectorAll('[babia-selector]').length > 0) {
                prodComponent = document.querySelectorAll('[babia-selector]')[0].components['babia-selector'];
            } else {
                console.error("Error, querier not found", el, el.components, el.components['babia-selector']);
                return
            }
        }
    }
    return prodComponent;
}

let findNavComponent = (data, el) => {
    let navComponent;
    if (data.controller) {
        // Save the reference to the querier or filterdata
        let navElement = document.getElementById(data.controller)
        if (navElement.components['babia-navigator']) {
            navComponent = navElement.components['babia-navigator']
        } else {
            console.error("Problem registering to the navigator", el);
            return
        }
    } else {
        // Look for a navigator in the same element and register
        if (el.components['babia-navigator']) {
            navComponent = el.components['babia-navigator']
        } else {
            // Look for a navigator in the scene
            if (document.querySelectorAll("[babia-navigator]").length > 0) {
                navComponent = document.querySelectorAll("[babia-navigator]")[0].components['babia-navigator']
            }else {
                console.error("Error, navigator not found", el, el.components, el.components['babia-navigator']);
                return
            }
        }
    }
    return navComponent;
}
let findTargetComponent = (data, self) => {
    let targetComponent;
    if (data.target) {
        // Save the reference to the querier or filterdata
        let targetElement = document.getElementById(data.target)
        if (targetElement != null) { 
            if (targetElement.components['babia-bars']) {
                targetComponent = targetElement.components['babia-bars']
            } else if (targetElement.components['babia-barsmap']) {
                targetComponent = targetElement.components['babia-barsmap']
            } else if (targetElement.components['babia-cyls']) {
                targetComponent = targetElement.components['babia-cyls']
            } else if (targetElement.components['babia-cylsmap']) {
                targetComponent = targetElement.components['babia-cylsmap']
            } else if (targetElement.components['babia-pie']) {
                targetComponent = targetElement.components['babia-pie']
            } else if (targetElement.components['babia-doughnut']) {
                targetComponent = targetElement.components['babia-doughnut']
            } else if (targetElement.components['babia-bubbles']) {
                targetComponent = targetElement.components['babia-bubbles']
            } else if (targetElement.components['babia-city']) {
                targetComponent = targetElement.components['babia-city']
            } else if (targetElement.components['babia-boats']) {
                targetComponent = targetElement.components['babia-boats']
            } else {
                console.error("Visualizer not found.")
                return
            }
        } else {
            console.error("Target not exist.")
            return
        }
    } else {
        console.error("Error: Target not inserted. ")
        return
    }
    return targetComponent;
}

let updateTitle = (data, titleRotation) => {
    let titleEl = document.createElement('a-entity');
    titleEl.classList.add("babiaxrTitle")
    titleEl.setAttribute('text-geometry', {'value': data.title});
    if (data.titleFont) titleEl.setAttribute('text-geometry', {'font': data.titleFont});
    if (data.titleColor) titleEl.setAttribute('material', {'color': data.titleColor});
    titleEl.setAttribute('position', data.titlePosition);
    titleEl.setAttribute('rotation', titleRotation);
    return titleEl
}

let parseJson = (json) => {
    let object;
    if (typeof(json) === 'string' || json instanceof String) {
        object = JSON.parse(json);
    } else {
        object = json;
    };
    return object;
}

module.exports.dataReadyToSend = dataReadyToSend;
module.exports.dispatchEventOnElement = dispatchEventOnElement;
module.exports.findDataComponent = findDataComponent;
module.exports.findProdComponent = findProdComponent;
module.exports.findNavComponent = findNavComponent;
module.exports.findTargetComponent = findTargetComponent;
module.exports.colors = colors;
module.exports.updateTitle = updateTitle;
module.exports.parseJson = parseJson;

