const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');

const port = 3000;
var sockets = {};
var game = new Game();

var skip_events = false;

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
            sendUpdateToPlayers('init');
        }
        else {
            socket.emit('server_full');
        }
    });
    socket.on('disconnect', function() {
        console.log(game.players[socket.id]+" disconnected");
        delete sockets[socket.id];
        game.removePlayer(socket.id);
        sendUpdateToPlayers('update');
    });
    socket.on('mouseup', function(input) {
        if (!skip_events) {
            console.log("up");
            var info = JSON.parse(input);
            game.placeCard(socket.id, info.x, info.y);
            sendUpdateToPlayers('update');
        }
        skip_events = false;
    });
    socket.on('mousedown', function(input) {
        var info = JSON.parse(input);
        if (!game.decideAction(socket.id, info.x, info.y)) {
            skip_events = true;
        } else {
            console.log("success");
        }
    });
    socket.on('mousemove', function(input) {
        if (!skip_events) {
            console.log('drag');
            var info = JSON.parse(input);
            game.moveCard(socket.id, info.x, info.y);
            sendUpdateToPlayers('update');
        }
    });
});

function sendUpdateToPlayers(type) {
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
        sockets[socket].emit(type, JSON.stringify(msg));
    }
}