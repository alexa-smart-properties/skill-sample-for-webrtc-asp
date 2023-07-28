import { getAlexaId, getWebId, setCallStatus } from "./sessionStore.js";
import { sendMessage } from "./websocketHandler.js";

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}
export const peerConnection = new RTCPeerConnection(configuration);

peerConnection.ontrack = (event) => {
    console.log("Handling track event");
    const remoteVideo = document.getElementById("remote_video");
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.load();
    document.getElementById("hangup-button").disabled = false;
    document.getElementById("reoffer-button").disabled = false;
}

peerConnection.oniceconnectionstatechange = (event) => {
    console.log("ICE connection state change, now in: ", peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === "failed") {
        alert("P2P Connection with Alexa failed, please confirm that you're not on VPN/Corp network and try again");
    }
}

let iceTimer = null;
let reofferInprogress;
let candidatesSent = false;
function sendCandidates() {
    setCallStatus("Sending to Alexa");
    if (candidatesSent) {
        return;
    }
    candidatesSent = true;
    const typePrefix = reofferInprogress ? "re" : "";
    sendMessage({
        type: typePrefix + peerConnection.localDescription.type,
        sdp: peerConnection.localDescription.sdp,
        target: getAlexaId(),
        source: getWebId()
    });
    if (iceTimer != null) {
        clearTimeout(iceTimer);
    }
}

export function notifyReofferStarted() {
    reofferInprogress = true;
}

// Chrome likes to get stuck in ICE gathering, let's set a timeout so we don't
// Wait forever
function onIceTimeout() {
    console.log("ICE Gathering Timeout, sending the candiates we have");
    sendCandidates();
}

export function startIceTimer() {
    iceTimer = setTimeout(onIceTimeout, 5000);
}

peerConnection.onicegatheringstatechange = (event) => {
    const connection = event.target;
    console.log("Ice gathering state change: ", event);
    switch(connection.iceGatheringState) {
        case "gathering":
            break;
        case "complete":
            sendCandidates();
            break;
      }
}
