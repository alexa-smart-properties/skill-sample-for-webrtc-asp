// Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: LicenseRef-.amazon.com.-AmznSL-1.0
// Licensed under the Amazon Software License  http://aws.amazon.com/asl/

// Alexa Video Calling Skill Sample

/*
This sample skill demostrates the webrtc video calling intergation with the Alexa Communcation Services API's and 
Alexa Smart Properties. This demo skill is the base configutations for this type of calling. 
*/

const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');
// http external api call
const axios = require('axios');
const https = require('https');
// To retrieve the CLIENT_ID / CLIENT_SECRET, locate "Alexa Skill Messaging" in the permission tab of your skill in the Alexa Developer Console.
const CLIENT_ID = '__TODO__CHANGE__WITH__YOUR__SKILL_CLIENT__ID__';
const CLIENT_SECRET = '__TODO__CHANGE__WITH__YOUR__SKILL_CLIENT__SECRET__';
// WebRTC Server
const baseUrl = "__TODO__CHANGE__WITH__YOUR__SERVER__URL__";
const config = {
    headers: {
        'Content-Type': 'application/json',
    },
    // to be used only for self-sign certificate
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
};

//=========================================================================================================================================
// Account Linking - Authorization Grant - Get Token to send Events to Alexa Gateway
//=========================================================================================================================================

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
        console.log("----- Handling Alexa.Authorization.Grant  -----");
        const auth_code = handlerInput.requestEnvelope.request.body.grant.code;
        await generateToken(auth_code);

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
        };
    }
}

/**
 * Function to gather a Login With Amazon (LWA) Access Token for a given LWA Security Profile & Refresh Token
 * Note: LWA Access Token are only valid for 60 minutes.
 */
async function generateToken(auth_code) {
    console.log("--- generateToken from LWA ---");
    const lwaConfig = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: auth_code,
        grant_type: "authorization_code",
    }
    let lwaResponse = await axios.post(
        "https://api.amazon.com/auth/o2/token",
        {}, 
        {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            params: lwaConfig
        });
    console.log("LWA Response : " + JSON.stringify(lwaResponse.data));
    return lwaResponse.data.access_token
}

//=========================================================================================================================================
// WebRTC Outbound Calling
//=========================================================================================================================================

/*
 * Alexa Outboud Calling
 * For the outbound call flow please use the following Alexa Handlers. 
 * initateOutBoundCallHandler
 * callRingingAckOutBoundCallHandler
 * callInProgressAckOutBoundCallHandler
 */
const initateOutBoundCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.InitiateOutboundCall';
    },
    handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.InitiateOutboundCall -----");
        const sdpOffer = handlerInput.requestEnvelope.request.sdpDetails.value;
        const sessionID = handlerInput.requestEnvelope.request.sessionId;
        const consentToken = handlerInput.requestEnvelope.context.System.user.permissions.consentToken;
        const participants = handlerInput.requestEnvelope.request.participants;
        // Return the sendOutboundCallOffer and post that to your server URL. 
        sendOutboundCallOffer(sdpOffer, sessionID, consentToken, participants);
        return handlerInput.responseBuilder.getResponse();
    }
};

//Helper function to send the SDP offer and meta data to the other WebRTC infrastructure. 
async function sendOutboundCallOffer(sdpOffer, sessionId, accessToken, participants) {
    try {
        const requestBody = {
            sdpoffer: sdpOffer,
            sessionID: sessionId,
            accessToken: accessToken,
            participants: participants
        };
        await axios.post(baseUrl + "/offer", requestBody, config);
    } catch (error) {
        console.log(error)
        return {};
    }
}

const callRingingAckOutBoundCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallRingingAck';
    },
    handle(handlerInput) {
        console.log("----- Handling CallRingingAck -----");
        return handlerInput.responseBuilder.getResponse();
    }
};

const callInProgressAckOutBoundCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallInProgressAck';
    },
    handle(handlerInput) {
        console.log("----- Handling CallInProgressAck -----");
        return handlerInput.responseBuilder.getResponse();
    }
}

//=========================================================================================================================================
// WebRTC Inbound Calling
//=========================================================================================================================================

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
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallRinging';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallRinging -----");
        await axios.post(baseUrl + "/ring", {
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

const callInProgessInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallInProgress';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallInProgress -----");
        await axios.post(baseUrl + "/ring", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

const callAcceptedInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallAccepted';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallAccepted -----");
        await axios.post(baseUrl + "/answer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

const callUpdatedInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdate';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallUpdate -----");
        await axios.post(baseUrl + "/reoffer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

const callUpdateAckInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdateAck';
    },
    handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallUpdateAck -----");
        return handlerInput.responseBuilder.getResponse();
    }
}

const callUpdateResponseInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallUpdateResponse';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallUpdateResponse -----");
        await axios.post(baseUrl + "/reanswer", {
            sdp: handlerInput.requestEnvelope.request.sdpDetails.value,
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

const callAcceptedAckInboundHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallAcceptedAck';
    },
    handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallAcceptedAck -----");
        return handlerInput.responseBuilder.getResponse();
    }
}

const endCallHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Comms.CallSignaling.CallEnded';
    },
    async handle(handlerInput) {
        console.log("----- Handling Alexa.Comms.CallSignaling.CallEnded -----");
        await axios.post(baseUrl + "/end", {
            sessionId: handlerInput.requestEnvelope.request.sessionId
        }, config);
        return handlerInput.responseBuilder.getResponse();
    }
}

//=========================================================================================================================================
// Custom Skill Handlers
//=========================================================================================================================================

/**
 * Handler to handle modal skill invocation requests sent by Alexa 
 * This type of request is send when the user invokes your skill without providing a specific intent.
 */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log("----- Handling LaunchRequest -----");
        const speakOutput = handlerInput.t('WELCOME_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        console.log("----- Handling HelloWorldIntent -----");
        const speakOutput = handlerInput.t('HELLO_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

/**
 * Handler to handle help requests sent by Alexa within a skill context
 */
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        console.log("----- Handling AMAZON.HelpIntent -----");
        const speakOutput = handlerInput.t('HELP_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

/**
 * Handler to handle stop and cancellation requests sent by Alexa within a skill context
 */
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        console.log("----- Handling AMAZON.CancelIntent or AMAZON.StopIntent -----");
        // set prompt message to provide to guests
        const speakOutput = handlerInput.t('GOODBYE_MSG');
        // use responseBuilder to generate the JSON response
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
}

/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

/**
 * Handler to handle a session close request by Alexa
 */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === `SessionEndedRequest`;
    },
    handle(handlerInput) {
        console.log("----- Handling SessionEndedRequest -----");
        const sessionEndedReason = handlerInput.requestEnvelope.request.reason;
        console.log(`~~~~~~~~~~~~~~~~~~~`);
        console.log(`Session Ended Reason: ${sessionEndedReason}`);
        console.log(`~~~~~~~~~~~~~~~~~~~\n`);
        // log the error (if any) being the reason why the session was ended
        if (handlerInput.requestEnvelope.request.error) {
            console.log(`Session ended with error: ${JSON.stringify(handlerInput.requestEnvelope.request.error)}`);
            /**
             * NOTE: Use this error message to trigger an Amazon CloudWatch Alarm as a monitoring task
             * https://developer.amazon.com/de/blogs/alexa/post/99fb071e-9aaf-481b-b9af-0186c0f712a5/how-to-monitor-custom-alexa-skills-using-amazon-cloudwatch-alarms
             */
        }
    }
}

/**
 * Handler to capture errors within this code execution
 */
const GenericErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log("----- Handling Errors -----");
        // find file and line for error
        const stack = error.stack.split('\n');
        let errorLoc = stack[1].substring(stack[1].lastIndexOf('/') + 1, 900);
        errorLoc = errorLoc.slice(0, -1);
        const file = errorLoc.substring(0, errorLoc.indexOf(':'));
        let line = errorLoc.substring(errorLoc.indexOf(':') + 1, 900);
        line = line.substring(0, line.indexOf(':'));
        // log the error
        console.log("==== ERROR ======");
        console.log("Type : " + error.type);
        console.log("Message : " + error.message);
        console.log("File : " + file);
        console.log("Line : " + line);
        console.log("Stack : " + error.stack);
        // prompt the user to reformulate
        const speakOutput = handlerInput.t('ERROR_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

//=========================================================================================================================================
// INTERCEPTORS
//=========================================================================================================================================

/**
 * Request Interceptor to log the request sent by Alexa
 */
const LoggingRequestInterceptor = {
    process(handlerInput) {
        console.log(`~~~~~~~~~~~~~~~~~~~`);
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        console.log(`~~~~~~~~~~~~~~~~~~~\n`);
    }
}

/**
 * Response Interceptor to log the response made to Alexa
 */
const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`~~~~~~~~~~~~~~~~~~~`);
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
        console.log(`~~~~~~~~~~~~~~~~~~~\n`);
    }
}

/**
 * This request interceptor will bind a translation function 't' to the handlerInput
 */
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};

//=========================================================================================================================================
// SKILL BUILDER
//=========================================================================================================================================

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
        endCallHandler,
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        IntentReflectorHandler,
        SessionEndedRequestHandler)
    .addErrorHandlers(
        GenericErrorHandler)
    .addRequestInterceptors(
        LoggingRequestInterceptor,
        LocalisationRequestInterceptor)
    .addResponseInterceptors(
        LoggingResponseInterceptor)
    .withCustomUserAgent('asp/webrtc/v1.0')
    .lambda();