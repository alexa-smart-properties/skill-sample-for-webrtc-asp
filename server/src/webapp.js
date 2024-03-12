import { sendToAlexa } from "./alexa.js";

// Map participantId to web socket
const registrations = {};
// Maps sessionId to webApp participantId
const webAppParticipants = {};
// Map Alexa Region
let alexaRegion;

export function getAlexaRegion() {
    return alexaRegion;
}

export function getWebAppParticipantForSession(sessionId) {
    return webAppParticipants[sessionId];
}

export function setWebAppParticipantForSession(sessionId, participantId) {
    webAppParticipants[sessionId] = participantId;
}

export function sendToWebApp(message, targetParticipant) {
    console.log("Doing websocket lookup for ", targetParticipant);
    const targetConnection = registrations[targetParticipant];
    const stringifyedMessage = JSON.stringify(message);
    console.log("Sending message to WebApp: ", message);
    try {
        targetConnection.send(stringifyedMessage);
    } catch(e) {
        console.log("Failed to send to wepapp: ", e);
    }
}

function handleRemoteRegister(message, ws) {
    console.log(`Got registration for ${message.id}`);
    registrations[message.id] = ws;
    alexaRegion = message.alexaRegion;
}

function handleRemoteOffer(message) {
    const sessionId = message.sessionId;
    console.log(`SessionId ${sessionId} for call from ${message.source} to ${message.target}`);
    setWebAppParticipantForSession(sessionId, message.source);

    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.InitiateInboundCall",
        sessionId: sessionId,
        participants: [
            {
                id: {
                    type: "RAW_ADDRESS",
                    value: message.source
                },
                isOriginator: true
            },
            {
                id: {
                    type: "RAW_ADDRESS",
                    value: message.target
                },
                isOriginator: false
            }
        ],
        sdpDetails: {
            type: "OFFER",
            value: message.sdp
        }
    }, sessionId);
}

function handleRemoteRinging(message) {
    console.log("Got remote ringing: ", message);
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallRinging",
        sessionId: message.sessionId
    }, message.sessionId);
}

function handleRemoteAnswer(message) {
    console.log("Got remote answer");
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallAccepted",
        "sessionId": message.sessionId,
        "sdpDetails": {
            "type": "ANSWER",
            "value": message.sdp
        }
    }, message.sessionId);
}

function handleRemoteReoffer(message) {
    console.log("Got remote reoffer");
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallUpdate",
        sessionId: message.sessionId,
        sdpDetails: {
            type: "OFFER",
            value: message.sdp
        }
    }, message.sessionId);
}

function handleRemoteReanswer(message) {
    console.log("Got remote reanswer");
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallUpdateResponse",
        sessionId: message.sessionId,
        sdpDetails: {
            type: "ANSWER",
            value: message.sdp
        }
    }, message.sessionId);
}

function handleRemoteHangup(message) {
    console.log("Got remote hangup: ", message);
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallEnded",
        sessionId: message.sessionId,
        callResult: {
            code: "SUCCESS",
            message: "Call ended by user"
        }
    }, message.sessionId);
}

export function webSocketHandler(ws) {
    console.log("Connected");
    ws.on('error', console.error);
    ws.on('message', (data, isBinary) => {
        const message = JSON.parse(data);
        switch (message.type) {
            case "register":
                handleRemoteRegister(message, ws);
                break;
            case "offer":
                handleRemoteOffer(message);
                break;
            case "ringing":
                handleRemoteRinging(message);
                break;
            case "answer":
                handleRemoteAnswer(message);
                break;
            case "reoffer":
                handleRemoteReoffer(message);
                break;
            case "reanswer":
                handleRemoteReanswer(message);
                break;
            case "end":
                handleRemoteHangup(message);
                break;
            case "ping":
                console.log("Got keep-alive");
                ws.send(JSON.stringify({type: "pong"}));
                break;
            default:
                console.error("Unhandled event type: ", message.type);
        }
    });
}