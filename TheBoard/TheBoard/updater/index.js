(function (updater) {
    
    var socketio = require("socket.io");

    updater.init = function (server) {

        var io = socketio.listen(server);
        
        //handshake message "connection"
        io.sockets.on("connection" , function (socket) {

            console.log("Socket was connected");

            //socket.emit("SomeKey", "Message from Server"); //send message to Client, "SomeKey" becomes event to listen on
            
            //socket.on("newNote", function (data) {
            //    socket.broadcast.emit("broadcast note", data.note); //data contains more information
            //});

            socket.on("join category", function (category) {
                socket.join(category);
            });

            socket.on("newNote", function (data) {
                //broadcast to socket clients registered with current category
                socket.broadcast.to(data.category).emit("broadcast note", data.note); 
            });            

        });


    };

})(module.exports);