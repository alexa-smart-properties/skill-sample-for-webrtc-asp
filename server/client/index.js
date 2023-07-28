import { getRemoteOffer, getWebId, setAlexaId, setCallStatus, setSessionId, setWebId } from "./sessionStore.js";
import { peerConnection, startIceTimer } from "./webrtc.js";
import { sendMessage } from "./websocketHandler.js";

let stream;
async function setupLocalMedia() {
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    document.getElementById("local_video").srcObject = stream;
}

setupLocalMedia();

async function handleAccept() {
    document.getElementById("ringer").setAttribute("hidden", "true");
    setCallStatus("WebApp processing");
    startIceTimer();
    await peerConnection.setRemoteDescription(getRemoteOffer());
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);
}
window.handleAccept = handleAccept;

function shutdownMedia() {
    const remoteVideo = document.getElementById("remote_video");
    const localVideo = document.getElementById("local_video");

    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    localVideo.srcObject.getTracks().forEach((track) => track.stop());
    peerConnection.close();
    // Clear remote video
    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    remoteVideo.load();
    // Clear local video
    localVideo.removeAttribute("src");
    localVideo.removeAttribute("srcObject");
    localVideo.load();
    document.getElementById("hangup-button").disabled = true;
}

function handleLocalHangup() {
    console.log("Handling local hangup");
    sendMessage({
        type: "end"
    });
    shutdownMedia();
}
window.handleLocalHangup = handleLocalHangup;

function handleRegistration() {
    setWebId(document.getElementById("registration_id").value);
    console.log(`Registering user ${getWebId()}`);
    sendMessage({
        type: "register",
        id: getWebId()
    });
    
    document.getElementById("registration_detail").setAttribute("hidden", "true");
    document.getElementById("call_detail").removeAttribute("hidden");
    document.getElementById("call_detail_buttons").removeAttribute("hidden");
    document.getElementById("call_detail_status").removeAttribute("hidden");
    document.getElementById("inbound_call_detail").removeAttribute("hidden");
}
window.handleRegistration = handleRegistration;

async function handleSendInboundCall() {
    setCallStatus("WebApp processing");
    setAlexaId(document.getElementById("inbound_id").value);
    stream.getTracks().forEach(track => {peerConnection.addTrack(track, stream)});
    setSessionId(`${Math.random() * 1000000}`);
    startIceTimer();
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
}
window.handleSendInboundCall = handleSendInboundCall;
