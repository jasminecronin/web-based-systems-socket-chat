var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var moment = require("moment");

var users = {};
var history = [];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    //users[socket.id]
    var username = "User" + Math.floor(Math.random() * 1000);
    users[socket.id] = {
        name: username,
        color: "#c6ccd8"
    };

    // socket.emit('joined', users[socket.id]);
    socket.emit('joined', users);
    socket.emit('populate', history);
    updateUsers();

    socket.on('chat message', function(msg){
        var momentTimestamp = moment().format("h:mm:ss a");
        var chatMessage = {
            name: users[socket.id].name,
            color: users[socket.id].color,
            text: msg,
            timestamp: momentTimestamp
        };
        history.push(chatMessage);
        if (history.length > 200) history.shift();

        // io.emit('chat message', momentTimestamp.bold() + "\t\t" + msg);
        io.emit('chat message', {
            name: users[socket.id].name,
            color: users[socket.id].color,
            text: msg,
            timestamp: momentTimestamp
        });
        // console.log('message: ', msg);
    });

    socket.on('updateUsername', function(name) {
        users[socket.id].name = name;
        // for (var id in users) {
        //     if (id !== socket.id && users[id].name === name) {
        //         delete users[id];
        //     }
        // }
        updateUsers();
    });

    socket.on('updateColor', function(color) {
        users[socket.id].color = "#" + color;
    });

    socket.on('disconnect', function() {
        // console.log('test', users[socket.id]);
        delete users[socket.id];
        updateUsers();
    });

    function updateUsers() {
        io.emit('update', users);
    }
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});