const colors = {
    // https://gka.github.io/palettes/
    'palettes': {
        "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"],
        "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"],
        "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"],
        "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"],
        "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"],
        "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"],
        "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"],
        "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"],
        "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"],
        "bluesextra": ['#00429d', '#09459e', '#1147a0', '#174aa1', '#1c4da2', '#214fa3', '#2552a5', '#2855a6', '#2c57a7', '#2f5aa8', '#335daa', '#3660ab', '#3962ac', '#3b65ad', '#3e68ae', '#416bb0', '#446eb1', '#4670b2', '#4973b3', '#4c76b4', '#4e79b6', '#517cb7', '#537eb8', '#5681b9', '#5884ba', '#5b87bc', '#5d8abd', '#608dbe', '#6290bf', '#6593c0', '#6895c1', '#6a98c2', '#6d9bc4', '#6f9ec5', '#72a1c6', '#74a4c7', '#77a7c8', '#7aaac9', '#7cadca', '#7fb0cb', '#82b3cc', '#84b5cd', '#87b8ce', '#8abbcf', '#8dbed0', '#90c1d1', '#93c4d2', '#96c7d3', '#99cad4', '#9ccdd5', '#9fd0d6', '#a2d3d7', '#a5d5d8', '#a9d8d9', '#acdbda', '#b0dedb', '#b4e1db', '#b7e4dc', '#bbe6dd', '#c0e9de', '#c4ecde', '#c8efdf', '#cdf1e0', '#d2f4e0', '#d7f6e1', '#ddf9e1', '#e4fbe1', '#ebfde1', '#f3fee1', '#ffffe0'],
        "ubuntuextra": ['#511845', '#541845', '#581844', '#5b1844', '#5e1744', '#621744', '#651743', '#681743', '#6b1743', '#6e1643', '#711642', '#741642', '#771642', '#7a1641', '#7d1541', '#801541', '#831541', '#861540', '#891540', '#8c1540', '#8f1540', '#92153f', '#94163f', '#97163f', '#9a163f', '#9d173e', '#9f173e', '#a2183e', '#a5183e', '#a7193d', '#aa1a3d', '#ac1a3d', '#af1b3d', '#b21c3d', '#b41d3c', '#b71e3c', '#b9203c', '#bb213c', '#be223b', '#c0233b', '#c3253b', '#c5263b', '#c7273b', '#ca293a', '#cc2a3a', '#ce2c3a', '#d02e3a', '#d32f39', '#d53139', '#d73239', '#d93439', '#db3638', '#dd3738', '#e03938', '#e23b38', '#e43d37', '#e63e37', '#e84037', '#ea4236', '#ec4436', '#ee4636', '#f04836', '#f24a35', '#f44b35', '#f64d35', '#f84f34', '#f95134', '#fb5334', '#fd5533', '#ff5733'],
        "ubuntudiver": ['#511845', '#711643', '#8d1640', '#a81b3f', '#c1253d', '#d7333a', '#ec4437', '#ff5733', '#ffdac4', '#ffb3a7', '#fb8a8c', '#eb6574', '#d5405e', '#b81b4a', '#93003a'],
        "bluesdiver": ['#00429d', '#325da9', '#4e78b5', '#6694c1', '#80b1cc', '#9dced6', '#c0eade', '#ffffe0', '#f2f0e4', '#e5e1e8', '#d7d3eb', '#c8c5ed', '#b8b7ef', '#a5aaf0', '#6ea9da'],
        "categoric": [
            "#ffb75f",
            "#8e009a",
            "#5c2800",
            "#ff95ff",
            "#a69fff",
            "#da8800",
            "#073479",
            "#ffff00",
            "#00d3ff",
            "#b60026",
            "#00a59d",
            "#7e0000",
            "#0099cc",
            "#ff8080",
            "#7491eb",
            "#365e00",
            "#743570",
            "#00805e",
            "#570000",
            "#00629c",
            "#6d4e00",
            "#002c47",
            "#95824d",
            "#001b2b",
            "#006020",
            "#3d142e",
            "#ffb75f",
            "#8e009a"
        ],
    },
    'get': function (i, palette) {
        // CAMBIAR LA LOGICA POR SI METES UN ARRAY DIRECTAMENTE EN VEZ DE AÑADIR UNA DE POR DEFECTO
        if (palette in this.palettes) {
            let length = this.palettes[palette].length;
            return this.palettes[palette][i % length];
        } else {
            try {
                let paletteParsed = JSON.parse(palette)
                let length = paletteParsed.length;
                return paletteParsed[i % length];
            } catch (e) {
                // Do nothing
                console.error(e)
            }
        }

        let length = this.palettes['ubuntu'].length;
        return this.palettes[palette][i % length];

    }
};

let findProdComponent = (data, el, selfProducer) => {
    let prodComponent;
    if (data.from) {
        // Save the reference to the querier or filterdata
        let prodElement = document.getElementById(data.from)
        if (prodElement.components['babia-filter']) {
            prodComponent = prodElement.components['babia-filter']
        } else if (prodElement.components['babia-queryjson']) {
            prodComponent = prodElement.components['babia-queryjson']
        } else if (prodElement.components['babia-querycsv']) {
            prodComponent = prodElement.components['babia-querycsv']
        } else if (prodElement.components['babia-queryes']) {
            prodComponent = prodElement.components['babia-queryes']
        } else if (prodElement.components['babia-querygithub']) {
            prodComponent = prodElement.components['babia-querygithub']
        } else if (prodElement.components['babia-selector']) {
            prodComponent = prodElement.components['babia-selector'];
        } else if (prodElement.components['babia-treebuilder']) {
            prodComponent = prodElement.components['babia-treebuilder'];
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
        } else if (prodElementNodes.components['babia-querycsv']) {
            prodComponentNodes = prodElementNodes.components['babia-querycsv']
        } else if (prodElementNodes.components['babia-queryes']) {
            prodComponentNodes = prodElementNodes.components['babia-queryes']
        } else if (prodElementNodes.components['babia-querygithub']) {
            prodComponentNodes = prodElementNodes.components['babia-querygithub']
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
        } else if (prodElementLinks.components['babia-querycsv']) {
            prodComponentLinks = prodElementLinks.components['babia-querycsv']
        } else if (prodElementLinks.components['babia-queryes']) {
            prodComponentLinks = prodElementLinks.components['babia-queryes']
        } else if (prodElementLinks.components['babia-querygithub']) {
            prodComponentLinks = prodElementLinks.components['babia-querygithub']
        } else {
            console.error("Problem registering to the querier", el);
            return
        }
        return { 'nodes': prodComponentNodes, 'links': prodComponentLinks }

    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babia-filter'] && selfProducer != 'babia-filter') {
            prodComponent = el.components['babia-filter']
        } else if (el.components['babia-queryjson'] && selfProducer != 'babia-queryjson') {
            prodComponent = el.components['babia-queryjson']
        } else if (el.components['babia-querycsv'] && selfProducer != 'babia-querycsv') {
            prodComponent = el.components['babia-querycsv']
        } else if (el.components['babia-queryes'] && selfProducer != 'babia-queryes') {
            prodComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub'] && selfProducer != 'babia-querygithub') {
            prodComponent = el.components['babia-querygithub']
        } else if (el.components['babia-selector'] && selfProducer != 'babia-selector') {
            prodComponent = el.components['babia-selector'];
        } else if (el.components['babia-treebuilder']) {
            prodComponent = el.components['babia-treebuilder'];
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babia-filter]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-querycsv]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-querycsv]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-queryes]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
            } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
                prodComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
            } else if (document.querySelectorAll('[babia-selector]').length > 0) {
                prodComponent = document.querySelectorAll('[babia-selector]')[0].components['babia-selector'];
            } else if (document.querySelectorAll('[babia-treebuilder]').length > 0) {
                prodComponent = document.querySelectorAll('[babia-treebuilder]')[0].components['babia-treebuilder'];
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
            } else {
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
            } else if (targetElement.components['babia-network']) {
                targetComponent = targetElement.components['babia-network']
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
    titleEl.setAttribute('text', { 'value': data.title });
    if (data.titleColor) titleEl.setAttribute('material', { 'color': data.titleColor });
    titleEl.setAttribute('scale', '10 10 10');
    titleEl.setAttribute('wrapCount', '10');
    titleEl.setAttribute('position', data.titlePosition);
    titleEl.setAttribute('rotation', titleRotation);
    return titleEl
}

let parseJson = (json) => {
    let object;
    if (typeof (json) === 'string' || json instanceof String) {
        object = JSON.parse(json);
    } else {
        object = json;
    };
    return object;
}

let updateFunction = (self, oldData) => {
    let data = self.data;
    let el = self.el;

    if (el.components["babia-bars"] || el.components["babia-barsmap"] || el.components["babia-cyls"]) {
        if (!data.index) {
            data.index = data.x_axis;
        }
        self.animation = data.animation;
        self.bar_array = [];
    }
    if (el.components["babia-boats"]) {
        if (!self.figures) {
            self.figures = [];
        }
    }

    if (data.data && oldData.data !== data.data) {
        let _data = parseJson(data.data);
        self.processData(_data);
    } else if (data.from !== oldData.from) {
        if (self.slice_array) {
            self.slice_array = [];
        }
        // Unregister from old producer
        if (self.prodComponent) {
            self.prodComponent.notiBuffer.unregister(self.notiBufferId);
        };
        self.prodComponent = findProdComponent(data, el);
        if (self.prodComponent.notiBuffer) {
            self.notiBufferId = self.prodComponent.notiBuffer
                .register(self.processData.bind(self));
        }
    }
    // If changed whatever, re-print with the current data
    else if (data !== oldData && self.newData) {
        if (self.slice_array) {
            self.slice_array = [];
        }
        if (self.bar_array) {
            self.bar_array = [];
        }
        self.processData(self.newData);
    }
}

module.exports.findProdComponent = findProdComponent;
module.exports.findNavComponent = findNavComponent;
module.exports.findTargetComponent = findTargetComponent;
module.exports.colors = colors;
module.exports.updateTitle = updateTitle;
module.exports.parseJson = parseJson;
module.exports.updateFunction = updateFunction;

