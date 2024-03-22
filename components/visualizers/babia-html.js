AFRAME.registerComponent('babia-html', {
    schema: {
        html: { type: 'string' }
    },

    init: function () {
        let el = this.el;
        let data = this.data;

        let babiaDiv = document.createElement('div');
        babiaDiv.setAttribute('id', 'babiaHtmlDiv');
        babiaDiv.innerHTML = data.html;
        document.body.appendChild(babiaDiv);

        // document.addEventListener('DOMContentLoaded', function() {
        //     // Document is ready
        //     console.log('Document is ready!');
        //     // You can start interacting with the DOM here
        // });

        // document.addEventListener('DOMContentLoaded', function () {
        //     // Wait for the DOM content to be loaded
        //     var element = document.getElementById('babiaHtmlDiv');
        //     if (element) {
        //         console.log('Element is ready!');
        //         // Do something with the element
        //     } else {
        //         console.log('Element not found!');
        //     }
        // });
    }

});