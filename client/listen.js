socket = null;
STREAMING = false;
bufferQueue = new ArrayBuffer();
playbackInterval = null;
playing = false;

const audioPlay = function () {
    const context = new AudioContext();
    const source = context.createBufferSource();
    
    source.onended = function () {
        playing = false;
    }

    let buffer = context.createBuffer(2, context.sampleRate * 3, context.sampleRate);

    let tmp = new Uint8Array(bufferQueue.byteLength);
    tmp.set(bufferQueue,0);

    bufferQueue = new Uint8Array(100);

    // `data` comes from your Websocket, first convert it to Float32Array
    for(let i = 0; i < buffer.numberOfChannels; i++) {
        buffer.getChannelData(i).set(tmp.buffer);
    }

    source.buffer = buffer;
    
    // Then output to speaker for example
    source.connect(context.destination);
    source.start();
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
       let fileReader = new FileReader();

       fileReader.onloadend = () => {
            let tmp = new Uint8Array(bufferQueue.byteLength + fileReader.result.byteLength);
            tmp.set(new Uint8Array(bufferQueue), 0);
            tmp.set(new Uint8Array(fileReader.result), bufferQueue.byteLength);
            bufferQueue = tmp.buffer;
       }
    
        fileReader.readAsArrayBuffer(message.data);
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
        if( playing == false && bufferQueue.byteLength > 0 ) {
            playing = true;
            audioPlay();
        }
    }, 10000);
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