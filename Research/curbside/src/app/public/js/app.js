const app = async () => {
    console.log('starting!');

    // extract and compile templates
    const templates = new Map();
    const templateNodes = document.querySelectorAll('div[data-template]');
    templateNodes.forEach(el => {
        const id = el.getAttribute('data-template');
        el.parentElement.removeChild(el);
        el.removeAttribute('data-template');
        const html = el.outerHTML;
        const template = Handlebars.compile(html);
        templates[id] = template;
    });

    function render(model) {
        const root = document.querySelector('#parking-lot');
        root.innerHTML = '';
        const template = templates['parkingSpot'];
        model.forEach((spot, index) => {
            const child = document.createElement('div');
            root.appendChild(child);
            const html = template(spot);
            child.outerHTML = html;
        });
    }

    // wait for the server to send updates
    const socket = io();
    socket.on('update', (model) => {
        console.log(model);
        render(model);
    });
};

document.addEventListener('DOMContentLoaded', app);