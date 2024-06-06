AFRAME.registerComponent('babia-html', {
    schema: {
        html: { type: 'string' },
        distanceLevels: { type: 'float', default: 0.7 }
    },

    babiaDiv: null,
    clickedBoxes: new Map(),

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

    processNodeNoOffset: function (node, firstOffestToDelete, childrenLevel) {
        let el = this.el
        const children = node.children;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const rect = child.getBoundingClientRect();

            // Remove the first Y and X offset, since the HTML is rendered below the scene
            if (!firstOffestToDelete) {
                firstOffestToDelete = { x: rect.left / 100, y: rect.top / 100 }
            }

            // Calculate positions, adjusting the center of the box and removing the firstOffset
            const offsetX = rect.right / 100 - (rect.width / 100) / 2 - firstOffestToDelete.x;
            const offsetY = -rect.bottom / 100 + (rect.height / 100) / 2 + firstOffestToDelete.y;

            // Create box
            const box = document.createElement('a-box');
            box.setAttribute('position', `${offsetX} ${offsetY} ${childrenLevel * this.data.distanceLevels}`);
            box.setAttribute('width', rect.width / 100);
            box.setAttribute('height', rect.height / 100);
            box.setAttribute('depth', 0.01);
            box.setAttribute('color', this.colors_grad[childrenLevel]); // You can change the color or set it based on some logic

            // Clickable
            box.classList.add("babiaxraycasterclass")

            // Store the HTML content in the box for later use
            box.setAttribute('html-content', child.outerHTML);

            // Add mouseenter and mouseleave events
            box.addEventListener('mouseenter', () => {
                if (!box.classList.contains('clicked')) {
                    this.showHtmlContent(box, child.outerHTML, 'temp');
                }
            });

            box.addEventListener('mouseleave', () => {
                if (!box.classList.contains('clicked')) {
                    this.removeHtmlContent('temp');
                }
            });

            // Add click event to toggle the plane with the HTML content
            box.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent mouseenter/leave events from firing
                if (box.classList.contains('clicked')) {
                    box.classList.remove('clicked');
                    this.removeHtmlContent('permanent', box);
                } else {
                    box.classList.add('clicked');
                    this.showHtmlContent(box, child.outerHTML, 'permanent');
                }
            });


            el.appendChild(box);

            // Create line to the parent
            if (childrenLevel > 0) {
                let line = document.createElement('a-entity')
                line.setAttribute('line', {
                    start: `${offsetX} ${offsetY} ${childrenLevel * this.data.distanceLevels}`,
                    end: `${offsetX} ${offsetY} ${(childrenLevel * this.data.distanceLevels) - this.data.distanceLevels}`,
                    color: 'yellow'
                })
                el.appendChild(line);
            }
            

            if (child.children.length > 0) {
                let newLevel = childrenLevel + 1;
                this.processNodeNoOffset(child, firstOffestToDelete, newLevel);
            }
        }
    },

    showHtmlContent: function (box, htmlContent, type) {
        // Remove any existing temporary plane
        if (type === 'temp') {
            this.removeHtmlContent('temp');
        }

        // Create the white plane
        const plane = document.createElement('a-plane');
        plane.setAttribute('class', `${type}-plane`);
        let boxposition = box.getAttribute('position')
        plane.setAttribute('position', { x: boxposition.x, y: boxposition.y + 1, z: boxposition.z + 0.2 });
        plane.setAttribute('width', '3'); // Adjust width as needed
        const lines = htmlContent.split('\n').length;
        const lineHeight = 0.15; // Adjust based on font size and desired spacing
        const planeHeight = Math.max(lines * lineHeight, 0.2);
        plane.setAttribute('height', planeHeight); // Adjust height as needed
        plane.setAttribute('color', 'white');

        // Create the text element
        const text = document.createElement('a-text');
        text.setAttribute('value', htmlContent);
        text.setAttribute('color', 'black');
        text.setAttribute('align', 'left');
        text.setAttribute('width', '2.5'); // Adjust text width as needed
        text.setAttribute('position', '-1 0 0.01');

        plane.appendChild(text);
        this.el.appendChild(plane);

        // Store a reference to the plane in the box element for later removal
        if (type === 'permanent') {
            box.permanentPlane = plane;
        }
    },

    removeHtmlContent: function (type, box) {
        if (type === 'temp') {
            const tempPlane = document.querySelector('.temp-plane');
            if (tempPlane) {
                tempPlane.parentNode.removeChild(tempPlane);
            }
        } else if (type === 'permanent' && box) {
            if (box.permanentPlane) {
                box.permanentPlane.parentNode.removeChild(box.permanentPlane);
                box.permanentPlane = null;
            }

            // Remove box from clickedBoxes map
            this.clickedBoxes.delete(box);
        }
    },


    colors_dif: [
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

    colors_grad: [
        "#4B0082", "#800080", "#B22222", "#A0522D", "#CD5C5C", "#8B008B", "#9932CC", "#FF4500",
        "#FF8C00", "#B8860B", "#D2691E", "#DAA520", "#ADFF2F", "#7FFF00", "#32CD32", "#00FF00",
        "#00FA9A", "#40E0D0", "#4682B4", "#1E90FF", "#0000FF", "#4169E1", "#8A2BE2", "#FF00FF",
        "#FF1493", "#FF69B4", "#FF6347", "#FFA07A", "#FFA500", "#FFD700", "#FFFF00", "#FFFACD",
        "#F0E68C", "#E6E6FA", "#F0F8FF", "#E0FFFF", "#AFEEEE", "#ADD8E6", "#87CEFA", "#B0C4DE",
        "#D3D3D3", "#DDA0DD", "#EE82EE", "#F5DEB3", "#FAFAD2", "#FFE4E1", "#FFF0F5", "#F5F5DC",
        "#FFFFE0", "#FFF8DC", "#F8F8FF", "#FFFFFF"
    ],

    update: function () {


    }

});