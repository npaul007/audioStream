const express = require('express');
const app = express();
const port = 3000;
const WebSocket = require('ws');

const server = app.listen(port || process.env.PORT, function(){
    console.log(`Server listening on port ${port || process.env.PORT}`);
});

app.get(function(req,res) {
    res.sendFile(`${__dirname}/client/index.html`);
});

const websocketServer = new WebSocket.Server({server:server});
websocketServer.on("connection",(ws,req) => {
    console.log(`Received connection`);
    ws.on('message',(message) => {
        console.log(message)
    });

});

app.use(express.static('./client'));
