const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');

const port = 3000;
var sockets = {};
var game = new Game();

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('dist'));

http.listen(port, () => {
  console.log('listening on port: '+port);
});

io.on('connection', function(socket) {
    socket.on('login', function(input) {
        // only let 2 players join
        if (game.players.count < 2) {
            console.log(input+" connected!");
            sockets[socket.id] = socket;
            game.addPlayer(socket.id, input);
            // send both players deck info once there are two of them
            if (game.players.count <= 2) {
                for (var id in sockets) {
                    sockets[id].emit('update', JSON.stringify(game));
                }
            }
        }
        else {
            socket.emit('server_full');
        }
    });
    socket.on('disconnect', function() {
        console.log(game.players[socket.id]+" disconnected");
        delete sockets[socket.id];
        game.removePlayer(socket.id);
    });
    socket.on('stack_drag', function(input) {
        var actions = JSON.parse(input);
        console.log("stack drag");
        console.log(actions);
    });
    socket.on('stack_flip', function(input) {
        var actions = JSON.parse(input);
        console.log("stack flip");
        console.log(actions);
    });
    socket.on('hand_drag', function(input) {
        var actions = JSON.parse(input);
        console.log("hand drag");
        console.log(actions);
    });
    socket.on('hand_flip', function() {
        console.log("hand flip");
        if (game.decks[socket.id].hand[0].length !== 0) {
            game.decks[socket.id].dealThree();
        } else {
            game.decks[socket.id].returnToHand();
        }
        for (var id in sockets) {
            sockets[id].emit('update', JSON.stringify(game));
        }
    });
});