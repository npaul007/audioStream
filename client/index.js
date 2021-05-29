STREAMING = false;
streamObject = null;

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

const handleAudioData = function (event) {
    // console.log(event.inputBuffer.getChannelData(0));
    displaySoundLevels();
}

const startStream = function () {
    STREAMING = true;

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

    if( streamObject !== null ) {
        streamObject.controller.audioContext.close();
        streamObject.controller.analyzer.disconnect();
        streamObject.controller.microphone.disconnect();
        streamObject.controller.javascriptNode.disconnect();
        streamObject.controller.javascriptNode.removeEventListener('audioprocess',handleAudioData);

        streamObject = null;
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