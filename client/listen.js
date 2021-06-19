socket = null;
STREAMING = false;

const updateListenBtnStatus = function () {

}

const uninitWebSockets = function () {
    if( socket !== null ) {
        socket.close();
    }
    socket = null;
}

const initWebSockets = function () {
    socket = new WebSocket('ws://localhost:3000');

    socket.onopen = function() {
        console.log('Connected to websocket server');
        socket.send("listener");    
    }

    socket.onmessage = function (message) {
        console.log(message.data);
    }

    socket.onerror = function(err) {
        console.log(err.toString());
    }

    socket.onclose = function() {
        console.log('socket closed');
    }
}

const stopStream = function () {
    uninitWebSockets();
}

const startStream = function () {
    initWebSockets();
}

const initEventListeners = function() {
    document.getElementById('listenBtn').addEventListener("click",function() {
        if( STREAMING ) {
            stopStream();
        }
        else {
            startStream();
        }
    });
}

window.addEventListener("load",initEventListeners)