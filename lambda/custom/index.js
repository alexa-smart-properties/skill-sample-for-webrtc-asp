// Copyright 2023-2024 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

// Alexa Video Calling Skill Sample

/**
This sample skill demostrates the webrtc video calling intergation with the Alexa Communcation Services API's and 
Alexa Smart Properties. This demo skill is the base configutations for this type of calling. 
*/

const Alexa = require('ask-sdk-core');
const axios = require('axios');
const https = require('https');
// To reteive the CLIENT / CLIENT_SECRET locate Alexa Skill Messaging in the permission tab of your skill in the Alexa Developer Console.
const CLIENT_ID  = 'ADD Alexa Clinet Id HERE';
const CLIENT_SECRET = 'ADD Alexa Client Secret HERE';

// Server URL - must be HTTPS
const baseUrl = "ADD DEVELOPER WebRTC Server HTTPS URL HERE";
const config = {
    headers : {
        'Content-Type': 'application/json', 
    },
};


const AuthorizationGrantRequestHandler = {
    canHandle(handlerInput) {
        try {
            return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Authorization.Grant');
        }
        catch (error) {
            return false;
        }
    },
    async handle(handlerInput) {
        console.log("----- AuthorizationGrantRequestHandler request  -----");
        const auth_code = handlerInput.requestEnvelope.request.body.grant.code;
        let lwa_token = await getToken(CLIENT_ID, auth_code, 'profile');
        console.log("Exchanged access token with LWA:", lwa_token);

        return {
            "event": {
                "header": {
                    "messageId": `abc-123-def-456-${Date.now()}`,
                    "namespace": "Alexa.Authorization",
                    "name": "AcceptGrant.Response",
                    "payloadVersion": "3"
                },
                "payload": {
                }
            }
        }

    }

}

function getTokenOptions() {

    return {
        hostname: 'api.amazon.com',
        port: 443,
        path: '/auth/O2/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
}

function getTokenQueryParameters(clientId, auth_code, scope) {
    const thescope = `&scope=${scope}`;
    return 'grant_type=authorization_code&client_id=' + clientId + '&client_secret=' + CLIENT_SECRET + '&code=' + auth_code + thescope;
}

function getToken(clientId, auth_code, scope) {
    return new Promise(resolve => {
        const TokenQueryParameters = getTokenQueryParameters(clientId, auth_code, scope);
        const req = https.request(getTokenOptions(TokenQueryParameters.length), (res) => {
            res.setEncoding('utf8');
            let returnData = '';

            res.on('data', (chunk) => {
                returnData += chunk;
            });

            res.on('end', () => {
                //const tokenRequestId = res.headers['x-amzn-requestid'];
                console.log("LWA output:", returnData);
                resolve(JSON.parse(returnData).access_token);
            });
        });
        req.write(TokenQueryParameters);
        req.end();

    });
}

/*
 * Alexa Outboud Calling
 * For the outbound call flow please use the following Alexa Handlers. 
 * initateOutBoundCallHandler
 * callRingingAckOutBoundCallHandler
 * callInProgressAckOutBoundCallHandler
 */
const initateOutBoundCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.InitiateOutboundCall'
    },
    handle(handlerInput) {
        console.log("Handling InitiateOutboundCall");
        const sdpOffer = handlerInput.requestEnvelope.request.sdpDetails.value;
        const sessionID = handlerInput.requestEnvelope.request.sessionId;
        const consentToken = handlerInput.requestEnvelope.context.System.user.permissions.consentToken;
        const participants = handlerInput.requestEnvelope.request.participants;
// Return the sendOutboundCallOffer and post that to your server URL. 
        return sendOutboundCallOffer(sdpOffer, sessionID, consentToken, participants);
    }
};

// Helper fucntion to send the SDP offer and meta data to the other WebRTC infrastructure. 
async function sendOutboundCallOffer(sdpOffer, sessionId, accessToken, participants){
    try {
        const requestBody = {
            sdpoffer: sdpOffer,
            sessionID: sessionId, 
            accessToken: accessToken,
            participants: participants
        };
        const payload = await axios.post(baseUrl + "/offer", requestBody,config)
        return {
            "directives": [
                {
                    "type": "Alexa.Comms.CallSignaling.InitiateOutboundCall",
                    "providerSessionId": sessionId
                }
            ]
        };
    }catch(error) {
        console.log(error)
        return{}
    }
};

const callRingingAckOutBoundCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallRingingAck'
    },
    handle(handlerInput) {
        console.log("Handling CallRingingAck");
        return 
    }
};


const callInProgressAckOutBoundCallHandler = {
    canHandle(handlerInput) {
    
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallInProgressAck'
    },
    handle(handlerInput) {
        console.log("Handling CallInProgressAck");
        return 
    }
};

/*
 * Alexa Inbound Calling
 * For the inbound call flow please use the following Alexa Handlers. 
 * callRingingInboundHandler
 * callInProgessInboundHandler
 * callAcceptedInboundHandler
 * callUpdatedInboundHandler
 * callUpdateAckInboundHandler
 * callUpdateResponseInboundHandler
 * callAcceptedAckInboundHandler
*/
const callRingingInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallRinging'
    },
    async handle(handlerInput) {
        console.log("Handling CallRinging");
        await axios.post(baseUrl + "/ring", {
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return 
    }
};

const callInProgessInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallInProgress'
    },
    async handle(handlerInput) {
        console.log("Handling CallInProgress");
        await axios.post(baseUrl + "/ring", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return 
    }
};

const callAcceptedInboundHandler = {
    canHandle(handlerInput) {
       
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallAccepted'
    },
    async handle(handlerInput) {
        console.log(JSON.stringify(handlerInput.requestEnvelope.request));
        await axios.post(baseUrl + "/answer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return 
    }
};

const callUpdatedInboundHandler = {
    canHandle(handlerInput) {
     
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdate'
    },
    async handle(handlerInput) {
        console.log("Handling CallUpdate");
        await axios.post(baseUrl + "/reoffer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        
        return 
    }
};



const callUpdateAckInboundHandler = {
    canHandle(handlerInput) {
       
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdateAck'
    },
    handle(handlerInput) {
        console.log("Handling CallUpdateAck");
        return 
    }
};

const callUpdateResponseInboundHandler = {
    canHandle(handlerInput) {
     
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdateResponse'
    },
    async handle(handlerInput) {
        console.log("Handling CallUpdateResponse");
        await axios.post(baseUrl + "/reanswer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return 
    }
};


const callAcceptedAckInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallAcceptedAck'
    },
    handle(handlerInput) {
        console.log("Handling CallAcceptedAck");
        return 
    }
};


const endCallHandler = {
    canHandle(handlerInput) {
        const sessionID = handlerInput.requestEnvelope.request.sessionId;
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallEnded'
    },
    async handle(handlerInput) {
        console.log("Handling CallEnded");
        await axios.post(baseUrl + "/end", {
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return 
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        AuthorizationGrantRequestHandler,
        initateOutBoundCallHandler,
        callRingingAckOutBoundCallHandler,
        callInProgressAckOutBoundCallHandler,
        callUpdateAckInboundHandler,
        callRingingInboundHandler,
        callInProgessInboundHandler,
        callAcceptedInboundHandler,
        callUpdatedInboundHandler,
        callUpdateResponseInboundHandler,
        callAcceptedAckInboundHandler,
        endCallHandler)
    .addErrorHandlers()
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
