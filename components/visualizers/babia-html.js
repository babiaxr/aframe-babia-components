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

                            self.processNodeNoOffset(node, null);

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

    processNodeNoOffset: function (node, firstOffestToDelete) {
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
            box.setAttribute('position', `${offsetX} ${offsetY} 0`);
            box.setAttribute('width', rect.width / 100);
            box.setAttribute('height', rect.height / 100);
            box.setAttribute('depth', 0.1);
            box.setAttribute('color', 'blue'); // You can change the color or set it based on some logic

            el.appendChild(box);

            if (child.children.length > 0) {
                this.processNodeNoOffset(child, firstOffestToDelete);
            }
        }
    },

    update: function () {


    }

});