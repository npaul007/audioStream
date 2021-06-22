socket = null;
STREAMING = false;
bufferQueue = [];
playbackInterval = null;
playing = false;

const audioPlay = function (blob) {
    const context = new AudioContext();
    const source = context.createBufferSource();

    source.onended = function () {
        playing = false;
    }

    let fileReader = new FileReader();
    
    fileReader.onloadend = () => {
        source.buffer = context.decodeAudioData(fileReader.result);
        source.connect(context.destination);
        source.start();
    }
    
    fileReader.readAsArrayBuffer(blob);
  };

const updateListenBtnStatus = function (bool) {
    if( bool ) {
        document.getElementById('listenBtn').textContent = 'Stop Listening'
    }
    else {
        document.getElementById('listenBtn').textContent = 'Listen';
    }
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
       bufferQueue.push(message.data);
    }

    socket.onerror = function(err) {
        console.log(err.toString());
    }

    socket.onclose = function() {
        console.log('socket closed');
    }
}

const unInitPlaybackInterval = function () {
    if( playbackInterval != null ) {
        clearInterval(playbackInterval);
    }

    playbackInterval = null;
    audioListen.setAttribute('playing',false);
}

const initPlaybackInterval = function () {
    playbackInterval = setInterval(() => {
        if( playing == false && bufferQueue.length > 0 ) {
            audioPlay(bufferQueue.shift());
        }
    }, 100);
}

const stopStream = function () {
    uninitWebSockets();
    unInitPlaybackInterval();
    STREAMING = false;
    bufferQueue = [];
}

const startStream = function () {
    initWebSockets();
    initPlaybackInterval();
    STREAMING = true;
}

const initEventListeners = function() {
    document.getElementById('listenBtn').addEventListener("click",function() {
        if( STREAMING ) {
            stopStream();
            updateListenBtnStatus(false);
        }
        else {
            startStream();
            updateListenBtnStatus(true);
        }
    });
}

window.addEventListener("load",initEventListeners)