STREAMING = false;
streamObject = null;
socket = null;

const getAudioDevices = function () {
    return new Promise(function(resolve,reject) {
        navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            resolve(devices.filter(d => d && (d.kind == "audioinput" || d.kind == "audiooutput") ));
        })
        .catch(err => {
            reject(err);
        })
    });
}

async function populateAudioDeviceSelect () {
    let devices = await getAudioDevices();
    devices.forEach(device => {
        let option = document.createElement('option');
        option.setAttribute('value',device.deviceId);
        option.textContent = device.label;
        document.getElementById('audioSource').appendChild(option); 
    });
}

const displaySoundLevels = function () {
    let array = new Uint8Array(streamObject.controller.analyzer.frequencyBinCount);
    streamObject.controller.analyzer.getByteFrequencyData(array);

    let values = 0;
    for(let i = 0; i < array.length; i++) {
        values += array[i];
    }

    let avg = values / array.length;
    document.getElementById('audioLevel').value = Math.round(avg);
}

const sendAudioData = function (channelData) {
    let message = {
        buffer:channelData.buffer,
        channel:document.getElementById('broadcastChannel').value
    }
    if( socket ) {
        socket.send(JSON.stringify(message));
        console.log('sent to server',message);
    }
}
const handleAudioData = function (event) {
    sendAudioData(event.inputBuffer.getChannelData(0));
    displaySoundLevels();
}

const showLiveStatus = function(bool) {
    if( bool !== false ) {
        document.getElementById('broadcastStatus').style.display = "block";
        document.querySelector('button[name="goLive"]').textContent = "Stop Broadcast";
    }
    else {
        document.getElementById('broadcastStatus').style.display = "none";    
        document.querySelector('button[name="goLive"]').textContent = "Go Live";
    }
}

const initWebSocketConnection = function () {
    socket = new WebSocket('ws://localhost:3000');

    socket.onopen = function() {
        console.log('Connected to websocket server');
    }

    socket.onmessage = function (message) {
        console.log(message);
    }

    socket.onerror = function(err) {
        console.log(err.toString());
    }

    socket.onclose = function() {
        console.log('socket closed');
    }
}

const unInitWebSocketConnection = function () {
    if( socket !== null ) {
        socket.close();
    }
    socket = null;
}

const startStream = function () {
    STREAMING = true;

    showLiveStatus();
    initWebSocketConnection();

    navigator.mediaDevices.getUserMedia({
        audio:{
            deviceId:document.getElementById('audioSource').querySelector(':checked').value
        }
    })
    .then(stream => {
        console.log(stream);

        let audioContext = new AudioContext();
        let analyzer = audioContext.createAnalyser();
        let microphone = audioContext.createMediaStreamSource(stream);
        let javascriptNode = audioContext.createScriptProcessor(2048,1,1);

        microphone.connect(analyzer);
        analyzer.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.addEventListener('audioprocess',handleAudioData);

        streamObject = stream;

        streamObject.controller = {
            audioContext,
            microphone,
            analyzer,
            javascriptNode
        }

    })
    .catch(error => {
        console.log(error);
    });
}

const stopStream = function () {
    STREAMING = false;

    showLiveStatus(false);
    unInitWebSocketConnection();

    if( streamObject !== null ) {
        streamObject.controller.audioContext.close();
        streamObject.controller.analyzer.disconnect();
        streamObject.controller.microphone.disconnect();
        streamObject.controller.javascriptNode.disconnect();
        streamObject.controller.javascriptNode.removeEventListener('audioprocess',handleAudioData);

        streamObject = null;

        document.getElementById('audioLevel').value = 0;
    }
}

const initEventListeners = function() {
    document.querySelector('button[name="goLive"]').addEventListener("click",function(event){
        if( STREAMING ) {
            stopStream();
        }
        else {
            startStream();
        }
    });
}

const onLoad = function () {
    initEventListeners();
    populateAudioDeviceSelect();
}

window.addEventListener("load",onLoad);