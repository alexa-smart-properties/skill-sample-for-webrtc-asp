let sessionId;

export function getSessionId() {
    return sessionId;
}

export function setSessionId(aSessionId) {
    sessionId = aSessionId;
}

let webId;
export function getWebId() {
    return webId;
}

export function setWebId(aWebId) {
    webId = aWebId;
}

let remoteOffer;
export function getRemoteOffer() {
    return remoteOffer;
}

export function setRemoteOffer(offer) {
    remoteOffer = offer;
}

let alexaId;
export function getAlexaId() {
    return alexaId;
}

export function setAlexaId(anAlexaId) {
    alexaId = anAlexaId;
}

export function setCallStatus(status) {
    console.log(`Setting call status to ${status}`);
    const element = document.getElementById("call_status");
    element.innerHTML = status;
}
