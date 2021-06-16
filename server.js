const express = require('express');
const app = express();
const port = 3000;
const WebSocket = require('ws');
const listeningSockets = [];

const server = app.listen(port || process.env.PORT, function(){
    console.log(`Server listening on port ${port || process.env.PORT}`);
});

app.get('/',function(req,res) {
    res.sendFile(`${__dirname}/client/index.html`);
});

app.get('/listen',function(req,res) {
    res.sendFile(`${__dirname}/client/listen.html`);
});


const listenerId = function() {
    return `listener-${Math.floor(Math.random() * 100000000)}`;
}

const websocketServer = new WebSocket.Server({server:server});
websocketServer.on("connection",(ws,req) => {
    console.log(`Received connection`);

    ws.on('message',(message) => {
        console.log(message);

        if( message == "broadcaster" ) {
            ws.name = "broadcaster";
        }
        else if( message == "listener" ) {
            ws.name = listenerId();
            listeningSockets.push(ws);
        }
        else if( ws.name == "broadcaster" && message != "broadcaster" ) {
            if( listeningSockets.length > 0 ) {
                listeningSockets.forEach(socket => {
                    socket.send(message);
                });
            }
        }
    });

    ws.on('close',() => {
        let sIdx = listeningSockets.findIndex(socket => socket && socket.name == ws.name );
        if( sIdx > -1 ) {
            console.log(`purging socket ${ws.name} since it has been closed`);
            listeningSockets.splice(sIdx,1);
        }
    });

});

app.use(express.static('./client'));
