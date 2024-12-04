AFRAME.registerComponent('babia-html', {
    schema: {
        html: { type: 'string' },
        distanceLevels: { type: 'float', default: 0.7 },
        renderHTML: { type: 'boolean', default: false },
        renderHTMLOnlyLeafs: { type: 'boolean', default: false },
    },

    babiaDiv: null,
    clickedBoxes: new Map(),

    init: function () {
        // let el = this.el;
        const data = this.data;

        // Create an observer to detect the addition of the div to the DOM
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.id === 'babiaHtmlDiv') {
                            console.log('A div with id "babiaHtmlDiv" has been rendered in the DOM');
                            
                            for (let i = 0; i < node.children.length; i++) {
                                this.processNodeNoOffset(node.children[i], null, 0);
                            }

                            // Disconnect the observer since the div has been added
                            this.observer.disconnect();
                        }
                    });
                }
            });
        });

        // Configuring the observer to observe changes to the body of the document
        this.observer.observe(document.body, { childList: true, subtree: true });

        // Insert the HTML in order to render it
        babiaDiv = document.createElement('div');
        babiaDiv.setAttribute('id', 'babiaHtmlDiv');
        babiaDiv.innerHTML = data.html;
        document.body.appendChild(babiaDiv);
    },

    processNodeNoOffset: function (node, firstOffsetToDelete, childrenLevel) {
        const el = this.el;
        const rect = node.getBoundingClientRect();
        const NODE_SCALAR = 0.01;

        // Remove the first Y and X offset, since the HTML is rendered below the scene
        if (!firstOffsetToDelete) {
            firstOffsetToDelete = { x: rect.left * NODE_SCALAR, y: rect.top * NODE_SCALAR }
        }

        // Calculate positions, adjusting the center of the box and removing the firstOffset
        const offsetX = rect.right * NODE_SCALAR - (rect.width * NODE_SCALAR) / 2 - firstOffsetToDelete.x;
        const offsetY = -rect.bottom * NODE_SCALAR + (rect.height * NODE_SCALAR) / 2 + firstOffsetToDelete.y;

        // Create box
        const box = document.createElement('a-box');
        box.setAttribute('position', `${offsetX} ${offsetY} ${childrenLevel * this.data.distanceLevels}`);
        box.setAttribute('width', rect.width * NODE_SCALAR);
        box.setAttribute('height', rect.height * NODE_SCALAR);
        box.setAttribute('depth', 0.01);


        // Make box clickable
        box.classList.add("babiaxraycasterclass")

        // Store the HTML content in the box for later use
        box.setAttribute('html-content', node.outerHTML);

        // Add mouseenter and mouseleave events
        box.addEventListener('mouseenter', () => {
            if (!box.classList.contains('clicked')) {
                this.showHtmlContent(box, node.outerHTML, 'temp');
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
                this.showHtmlContent(box, node.outerHTML, 'permanent');
            }
        });


        // Select if we want to render the HTML content as a plane or a texture, if not, color
        if (this.data.renderHTML && typeof html2canvas !== "undefined") {
            // Render all, or render only the last child
            if (this.data.renderHTMLOnlyLeafs) {
                if (node.children.length == 0) {
                    // Found a leaf node
                    html2canvas(node).then(function (canvas) {
                        box.setAttribute('material', {
                            shader: 'flat',
                            src: canvas.toDataURL()
                        });
                    })
                }else{
                    // Render inner node
                    box.setAttribute('color', this.colors_grad[childrenLevel % this.colors_grad.length]);
                }

            } else {
                // Render node with texture
                html2canvas(node).then(function (canvas) {
                    box.setAttribute('material', {
                        shader: 'flat',
                        src: canvas.toDataURL()
                    });
                })
            }
        } else {
            // If renderHTML is not set, we use the color attribute to color the box
            box.setAttribute('color', this.colors_grad[childrenLevel % this.colors_grad.length]);
        }

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

        for (let i = 0; i < node.children.length; i++) {
            this.processNodeNoOffset(node.children[i], firstOffsetToDelete, childrenLevel + 1);
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

    // Gradient for coloring boxes (depending on depth level in DOM)
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
        let data = this.data
        let oldData = this.previousOldData;

        if (data.html != oldData.html || data.distanceLevels != oldData.distanceLevels) {
            // Disconnect the old observer if it exists
            if (this.observer) {
                this.observer.disconnect();
            }

            // Remove existing boxes and planes
            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }

            // Call init again to reinitialize the component
            this.init();
        }
    }

});