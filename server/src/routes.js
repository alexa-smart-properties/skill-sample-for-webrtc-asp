import express from "express";
import { sendToAlexa } from "./alexa.js";
import { getWebAppParticipantForSession, sendToWebApp, setWebAppParticipantForSession } from "./webapp.js";

export const router = express.Router();

function getSourceParticipant(participants) {
    for (const participant of participants) {
        if (participant.isOriginator) {
            return participant.id.value;
        }
    }
}

function getTargetParticipant(participants) {
    for (const participant of participants) {
        if (!participant.isOriginator) {
            return participant.id.value;
        }
    }
}

router.post("/offer", (req, res) => {
    console.log("Got sessionId: ", req.body.sessionID);
    const sessionId = req.body.sessionID;
    console.log(JSON.stringify(req.body));
    const target = getTargetParticipant(req.body.participants);
    const source = getSourceParticipant(req.body.participants);
    console.log(`Target ${target}, source ${source}`);
    setWebAppParticipantForSession(sessionId, target);

    sendToWebApp({
        type: "offer",
        sdp: req.body.sdpoffer,
        sessionId: req.body.sessionID
    }, target);

    res.sendStatus(200);
});

router.post("/ring", (req, res) => {
    sendToWebApp({
        type: "ringing",
        sessionId: req.body.sessionId,
        sdp: req.body.sdp
    }, getWebAppParticipantForSession(req.body.sessionId));
    const ackType = req.body.sdp ? "Alexa.Comms.CallSignaling.CallInProgressAck" : "Alexa.Comms.CallSignaling.CallRingingAck";
    console.log(`Sending ACK ${ackType} based on precense of SDP`);
    sendToAlexa({
        type: ackType,
        sessionId: req.body.sessionId
    }, req.body.sessionId);
    res.sendStatus(200);
});

router.post("/reoffer", (req, res) => {
    sendToWebApp({
        type: "reoffer",
        sdp: req.body.sdp,
        sessionId: req.body.sessionId
    }, getWebAppParticipantForSession(req.body.sessionId));
    res.sendStatus(200);
});

router.post("/answer", (req, res) => {
    console.log("Got alexa answer: ", req.body);
    sendToWebApp({
        type: "answer",
        sdp: req.body.sdp
    }, getWebAppParticipantForSession(req.body.sessionId));
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallAcceptedAck",
        sessionId: req.body.sessionId
    }, req.body.sessionId);
    res.sendStatus(200);
});

router.post("/reanswer", (req, res) => {
    sendToWebApp({
        type: "reanswer",
        sdp: req.body.sdp
    }, getWebAppParticipantForSession(req.body.sessionId));
    sendToAlexa({
        type: "Alexa.Comms.CallSignaling.CallUpdateAck",
        sessionId: req.body.sessionId
    }, req.body.sessionId);
    res.sendStatus(200);
});

// Have skill call this on end
router.post("/end", (req, res) => {
    console.log("Ending call");
    sendToWebApp({
        type: "end"
    }, getWebAppParticipantForSession(req.body.sessionId));
    res.sendStatus(200);
});

router.get("/health", (req, res) => {
    res.sendStatus(200);
});
