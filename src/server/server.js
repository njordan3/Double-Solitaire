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
            sendUpdateToPlayers();
        }
        else {
            socket.emit('server_full');
        }
    });
    socket.on('disconnect', function() {
        console.log(game.players[socket.id]+" disconnected");
        delete sockets[socket.id];
        game.removePlayer(socket.id);
        sendUpdateToPlayers();
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
        sendUpdateToPlayers();
    });
});

function sendUpdateToPlayers() {
    var msg = {};
    // send only the last card of each ace stack
    msg.aces = [];
    for (var i = 0; i < game.aces.length; i++) {
        msg.aces[i] = {};
        msg.aces[i].x = game.aces[i].x;
        msg.aces[i].y = game.aces[i].y;
        msg.aces[i].length = game.aces[i].length;
        if (game.aces[i].length > 0) {
            msg.aces[i].cards = game.aces[i].cards[game.aces[i].length-1];
        }
    }
    for (var socket in sockets) {
        for (var id in sockets) {
            if (socket == id) {
                msg.me = game.decks[id];
                msg.me.name = game.players[id];
            } else {
                msg.enemy = game.decks[id];
                msg.enemy.name = game.players[id];
            }
        }
        sockets[socket].emit('update', JSON.stringify(msg));
    }
}