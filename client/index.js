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

const onLoad = function () {
    populateAudioDeviceSelect();
    console.log('hello world')
}

window.addEventListener("load",onLoad);