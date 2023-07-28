import { getSessionId, setCallStatus, setRemoteOffer, setSessionId } from "./sessionStore.js";
import { notifyReofferStarted, peerConnection, startIceTimer } from "./webrtc.js";

let serverHost = window.location.host;
let websocketScheme = window.location.protocol === 'https:' ? "wss" : "ws";
const ws = new WebSocket(`${websocketScheme}://${serverHost}/ws`);

setInterval(() => {
    console.log("Sending ping");
    ws.send(JSON.stringify({type: "ping"}));
}, 30000);

export function sendMessage(message) {
    const stringifiedMessage = JSON.stringify({
        sessionId: getSessionId(),
        type: message.type,
        sdp: message.sdp,
        id: message.id,
        target: message.target,
        source: message.source
    });
    console.log("Sending message: ", stringifiedMessage);
    ws.send(stringifiedMessage);
}

async function handleOffer(message) {
    setRemoteOffer(message);
    setSessionId(message.sessionId ? message.sessionId : "testSessionId");
    document.getElementById("ringer").removeAttribute("hidden");
    setCallStatus("Waiting for User");
    sendMessage({
        type: "ringing"
    });
}

async function handleAnswer(message) {
    peerConnection.setRemoteDescription(message);
}

async function handleReoffer(message) {
    notifyReofferStarted();
    setCallStatus("Handling update from Alexa");
    startIceTimer();
    await peerConnection.setRemoteDescription({
        type: "offer",
        sdp: message.sdp
    });
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    if (peerConnection.iceGatheringState === "complete") {
        sendCandidates();
    }
}

async function handleReanswer(message) {
    await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: message.sdp
    });
}

function handleRemoteHangup() {
    console.log("Handling remote hangup");
    shutdownMedia();
}

function handleServerError(message) {
    alert(message.message);
}

ws.onmessage = (msg) => {
    console.log(`Got message: `, msg);
    const message = JSON.parse(msg.data);
    switch(message.type) {
        case "offer": 
            handleOffer(message);
            break;
        case "answer":
            handleAnswer(message);
            break;
        case "reoffer":
            handleReoffer(message);
            break;
        case "reanswer":
            handleReanswer(message);
            break;
        case "end":
            handleRemoteHangup();
            break;
        case "error":
            handleServerError(message);
            break;
        case "pong":
            break;
        default:
            console.error("Unhandled event type: ", message.type);
    }
}

ws.onerror = (error) => {
    alert("Error communicating with server, please copy logs and share with dev team and then refresh");
    console.error("Websocket error: ", error);
}

ws.onclose = (msg) => {
    alert("Server connection closed unexpectedly, please refresh to continue testing");
    console.error("Websocket connection closed: ", msg);
}