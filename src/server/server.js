const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');

const port = 3000;
const sockets = {};
var game = new Game();

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('dist'));

http.listen(port, () => {
  console.log('listening on port: '+port);
});

io.on('connection', function(socket) {
    socket.on('login', function(input) {
        console.log(input+" connected!");
        sockets[socket.id] = socket;
        game.addPlayer(socket.id, input);
        //console.log(JSON.stringify(game.decks[socket.id]));
        socket.emit('init', JSON.stringify(game.decks[socket.id]));
    });
    socket.on('disconnect', function() {
        console.log(game.players[socket.id]+" disconnected");
        delete sockets[socket.id];
        game.removePlayer(socket.id);
    });
});