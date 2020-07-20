const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');

const port = 3000;
var sockets = {};
var game = new Game();

var skip_events = {};

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('dist'));

http.listen(port, () => {
  console.log('listening on port: '+port);
});

io.on('connection', function(socket) {
    socket.on('login', function(input) {
        // only let 2 players join
        if (Object.keys(game.decks).length < 2) {
            console.log(input+" connected!");
            sockets[socket.id] = socket;
            game.addPlayer(socket.id, input);
            skip_events[socket.id] = false;
            socket.emit('init', JSON.stringify(game));
            sendUpdateToPlayers('update', game);
        }
        else {
            socket.emit('server_full');
        }
    });
    socket.on('disconnect', function() {
        console.log(game.decks[socket.id].name +" disconnected");
        delete sockets[socket.id];
        delete skip_events[socket.id];
        game.removePlayer(socket.id);
        sendUpdateToPlayers('update', game);
    });
    socket.on('mouseup', function(input) {
        if (!skip_events[socket.id]) {
            var info = JSON.parse(input);
            game.decks[socket.id].placeCard(info.x, info.y, game.aces);
            let update = game.decks[socket.id].placedCardsUpdate(socket.id, game.aces);
            sendUpdateToPlayers('placed', update);
        }
        skip_events[socket.id] = false;
    });
    socket.on('mousedown', function(input) {
        var info = JSON.parse(input);
        if (!game.decks[socket.id].decideAction(info.x, info.y)) {
            skip_events[socket.id] = true;
            let update = game.decks[socket.id].flippedCardsUpdate(socket.id);
            if (Object.keys(update).length != 0) {
                sendUpdateToPlayers('flip', update);
            }
        }
    });
    socket.on('mousemove', function(input) {
        if (!skip_events[socket.id]) {
            var info = JSON.parse(input);
            game.decks[socket.id].moveCardPos(info.x, info.y);
            let update = game.decks[socket.id].movingCardsUpdate(socket.id);
            sendUpdateToPlayers('moving', update);
        }
    });
});

function sendUpdateToPlayers(type, update) {
    for (var id in sockets) {
        sockets[id].emit(type, JSON.stringify(update));
    }
}