AFRAME.registerComponent('babia-html', {
    schema: {
        html: { type: 'string' }
    },

    babiaDiv: null,

    init: function () {
        const self = this
        let el = this.el;
        let data = this.data;

        // Crear un observador para detectar la adición del div al DOM
        let observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function (node) {
                        if (node.id === 'babiaHtmlDiv') {
                            console.log('El div con id "babiaHtmlDiv" ha sido renderizado en el DOM');

                            self.processNodeNoOffset(node, null, 0);

                            observer.disconnect(); // Desconectar el observador si ya no se necesita
                        }
                    });
                }
            });
        });

        // Configuración del observador para observar cambios en el cuerpo del documento
        observer.observe(document.body, { childList: true, subtree: true });

        // Insert the HTML in order to render it
        babiaDiv = document.createElement('div');
        babiaDiv.setAttribute('id', 'babiaHtmlDiv');
        babiaDiv.innerHTML = data.html;
        document.body.appendChild(babiaDiv);


    },

    processNode: function (node, parentEntity, parentOffset) {
        let el = this.el
        const children = node.children;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const rect = child.getBoundingClientRect();

            const offsetX = rect.left / 100 - parentOffset.x;
            const offsetY = -rect.top / 100 - parentOffset.y;

            const box = document.createElement('a-box');
            box.setAttribute('position', `${offsetX} ${offsetY} 0`);
            box.setAttribute('width', rect.width / 100);
            box.setAttribute('height', rect.height / 100);
            box.setAttribute('depth', 0.1);
            box.setAttribute('color', 'blue'); // You can change the color or set it based on some logic

            parentEntity.appendChild(box);

            if (child.children.length > 0) {
                this.processNode(child, box, { x: offsetX, y: offsetY });
            }
        }
    },

    processNodeNoOffset: function (node, firstOffestToDelete, childrenLevel) {
        let el = this.el
        const children = node.children;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const rect = child.getBoundingClientRect();

            // Remove the first Y and X offset, since the HTML is rendered below the scene
            if(!firstOffestToDelete){
                firstOffestToDelete = {x: rect.left / 100, y: rect.top / 100}
            }

            // Calculate positions, adjusting the center of the box and removing the firstOffset
            const offsetX = rect.right / 100 - (rect.width / 100)/2 - firstOffestToDelete.x;
            const offsetY = -rect.bottom / 100 + (rect.height / 100)/2 + firstOffestToDelete.y;

            // Create box
            const box = document.createElement('a-box');
            box.setAttribute('position', `${offsetX} ${offsetY} ${childrenLevel*0.2}`);
            box.setAttribute('width', rect.width / 100);
            box.setAttribute('height', rect.height / 100);
            box.setAttribute('depth', 0.1);
            box.setAttribute('color', this.colors[Math.floor(Math.random() * 100)]); // You can change the color or set it based on some logic

            el.appendChild(box);

            if (child.children.length > 0) {
                let newLevel = childrenLevel + 1;
                this.processNodeNoOffset(child, firstOffestToDelete, newLevel);
            }
        }
    },

    colors: [
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#800000", "#808000",
        "#008000", "#800080", "#008080", "#000080", "#FF4500", "#2E8B57", "#4682B4", "#D2691E",
        "#FF69B4", "#8A2BE2", "#5F9EA0", "#7FFF00", "#DDA0DD", "#B0E0E6", "#FF1493", "#32CD32",
        "#FFD700", "#6A5ACD", "#40E0D0", "#FF6347", "#8B0000", "#9ACD32", "#00CED1", "#9400D3",
        "#ADFF2F", "#F0E68C", "#E9967A", "#8FBC8F", "#483D8B", "#2F4F4F", "#7B68EE", "#6B8E23",
        "#FF7F50", "#BA55D3", "#CD5C5C", "#20B2AA", "#778899", "#4682B4", "#D3D3D3", "#FFB6C1",
        "#FFA07A", "#BDB76B", "#8B008B", "#556B2F", "#9932CC", "#B22222", "#5F9EA0", "#FFDAB9",
        "#ADFF2F", "#E0FFFF", "#7CFC00", "#FF00FF", "#DAA520", "#32CD32", "#FA8072", "#8A2BE2",
        "#7FFFD4", "#B8860B", "#FF4500", "#ADFF2F", "#DB7093", "#F08080", "#FF00FF", "#6495ED",
        "#DC143C", "#00FA9A", "#B0C4DE", "#B03060", "#98FB98", "#6A5ACD", "#708090", "#FFD700",
        "#20B2AA", "#66CDAA", "#7B68EE", "#00FF7F", "#8B0000", "#00FF00", "#F0FFF0", "#DC143C",
        "#FF00FF", "#00BFFF", "#B22222", "#00FFFF", "#FFD700", "#DA70D6", "#F5DEB3", "#F4A460"
    ],

    update: function () {


    }

});