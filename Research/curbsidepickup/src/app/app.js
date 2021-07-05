const express = require('express');
const app = express();
const port = 3000;
app.use(express.static('public'));

const { Model } = require('./model.js');
const model = new Model();
model.intialize();

// socket.io config
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    model.on('update', state => {
        socket.emit('update', state);
    });
});

server.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));