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

module.exports.dataReadyToSend = dataReadyToSend;
module.exports.dispatchEventOnElement = dispatchEventOnElement;
module.exports.findDataComponent = findDataComponent;
module.exports.colors = colors;

