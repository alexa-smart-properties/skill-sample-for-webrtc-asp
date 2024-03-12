# Build A Video Calling Skill with Alexa Smart Properties
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

This Alexa sample skill is a template for a WebRTC video and audio calling with Alexa Smart Properties.

## Skill Architecture
This networking skill is only the middelware solution for the Alexa Smart Properties WebRTC base calling solution.

The voice interface is configured through the Alexa communication services and not the skills interaction model. 

The purpose of this networking skill is to connect your own WebRTC infrastructure with Alexa Smart Properties in a peer to peer video and audio call. 


## Skill Requirements
This Alexa skill requriements are as followed:

- Your skill must be allowlisted thought Alexa Smart Properties to be able to enable WebRTC calling. To complete this step, please request the WebRTC Add-on in your Alexa Smart Property console.

- Please use this link and follow steps to active this for your ASP account. https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/get-started-calling-api-for-asp.html

- Your skill must have account linking enabled for you to be able to succesfully place an inbound or outbound webrtc. 


## Three Options for Skill Setup
There are a number of different ways for you to setup your skill, depending on your experience and what tools you have available.

 * If this is your first skill, choose the [Alexa-Hosted backend instructions](https://developer.amazon.com/en-US/docs/alexa/hosted-skills/alexa-hosted-skills-create.html) to get started quickly.
 * If you want to manage the backend resources in your own AWS account, you can follow the [AWS-Hosted instructions](https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html).
 * Developers with the ASK Command Line Interface configured may follow the [ASK CLI instructions](https://developer.amazon.com/en-US/docs/alexa/smapi/quick-start-alexa-skills-kit-command-line-interface.html).


### Setting up your skill localy
Setup your WebRTC skill

```bash
> cd skill
> npm i
> npm i axios
```

## Getting you skill ready
In the index.js file of the skill located in Lambda/custom, add your `Alexa CLIENT_ID` and `CLIENT_SECRET` located Alexa Skill Messaging in the permission tab of your skill in the Alexa Developer Console

```js
{
    const CLIENT_ID  = 'ADD Alexa Client Id HERE';
    const CLIENT_SECRET = 'ADD Alexa Client Secret HERE'; 
}
```

After deploying your severside code into the Elestic Beanstalk please the URL in the variable below in the index. js file. For more information about this, please review the server folder's [Demo WebRTC Server Instructions](./server/README.md).

```js
{
   const baseUrl = "ADD DEVELOPER WebRTC Server URL HERE";
}
```

---

## Additional Resources

### Documentation 
* [Onboard and Implement Skill-Based WebRTC Calling for Alexa Smart Properties](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/get-started-calling-api-for-asp.html) - The Offical Alexa Smart Properties WebRTC Documentation
* [Self Service Onboarding API Reference for Alexa Smart Properties](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/self-service-onboarding-api-for-asp.html) - Self Service Onboarding API
* [Service Provider Network Mapping API Reference for Alexa Smart Properties](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/service-provider-network-mapping-api-for-asp.html) - Service Provider Network Mapping API
* [Account Association API Reference for Alexa Smart Properties](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/account-association-api-for-asp.html) - Account Association API
* [Alexa.Comms.CallSignaling Interface](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/alexa-callsignaling-interface-for-asp.html) - Alexa.Comms.CallSignaling Interface
* [About Alexa Smart Properties](https://developer.amazon.com/en-US/docs/alexa/alexa-smart-properties/about-alexa-smart-properties.html) - About Alexa Smart Properties

### Community
* [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html) - Join the conversation!
* [Official Alexa Github](https://github.com/alexa)
* [Official Alexa Samples Github](https://github.com/alexa-samples)