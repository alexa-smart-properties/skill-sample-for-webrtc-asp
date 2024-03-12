# Skill Calling WebRTC Demo Server

This is a sample server and web app for using network skills for WebRTC integration
on Alexa.

## Requirements

The server must be hosted somewhere accessible to your Skill and Browser and fronted by a load balancer that terminates HTTPS.
Additionally, it must have Node.js 16 or later installed. 
For simplicity a [Node.js Elastic Beanstalk Environment](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html) is a great option. 

## Usage

Select a suitable hosting environment matching the above requirements.

Replace the following locations with your specific details

1. [ALEXA_REFRESH_TOKEN](src/alexa.js) with the value of your refresh token from account linking
2. [ALEXA_CLIENT_ID](src/alexa.js) with your Skill's Client ID
3. [ALEXA_CLIENT_SECRET](src/alexa.js) with your Skill's Client Secret

### Running manually

Setup and start the server

```bash
> npm i
> npm start
```

### Through Elastic Beanstalk

Create a zip of the directory
```bash
> zip ../webrtc_server.zip -r * 
```

Upload the created `webrtc_server.zip` archive to a Node.js Elastic Beanstalk environment. 


### Placing a call

Once everything is deployed, you should now be able to open the WebApp at your server's URL and follow
the instructions to place or receive a call to/from your Alexa devices.

## How it works

The server setups up two different endpoints both on port 8080, one for standard REST HTTP requests accepting events from the skill and another WebSocket endpoint on `/ws` for having 
a bidirectional signaling channel with the browser. Events sent on these channels are
an overloaded form of the standard [RTCSessionDescription](https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription) with the general structure of 

```js
{
    type: "register|offer|answer|ringing|end|error",
    sdp: "<sdp blob>",
    sessionId: "<sessionId from Alexa>",
    target: "<Id of target, ony on offers>",
    source: "<Id of source, only on offers>",
    message: "<status message>"
}
```

### Outbound call flow

![Outbound Call Flow](https://m.media-amazon.com/images/G/01/mobile-apps/dex/ask-smart-properties/CallfromAlexaToDeveloperEndpoint.svg)

### Inbound call flow

![Inbound Call Flow](https://m.media-amazon.com/images/G/01/mobile-apps/dex/ask-smart-properties/CallfromDeveloperEndPoint.svg)