import axios from "axios";
import { getWebAppParticipantForSession, sendToWebApp } from "./webapp.js";

const ALEXA_REFRESH_TOKEN = "Insert Refresh Token Here";
const ALEXA_CLIENT_ID = "Insert Client Id Here";
const ALEXA_CLIENT_SECRET = "Insert Client Secret Here";

let accessToken;

async function refreshToken() {
    console.log("Refreshing access token with LWA");
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: ALEXA_REFRESH_TOKEN,
        client_id: ALEXA_CLIENT_ID,
        client_secret: ALEXA_CLIENT_SECRET
    });
    try {
        const response = await axios.post("https://api.amazon.com/auth/o2/token", body, 
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    
        accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;
        // Refresh token after 90% token validity
        setTimeout(refreshToken, 1000 * expiresIn * 0.9);
    } catch(e) {
        console.error("Failed to refresh token: ", e);
    }
}
refreshToken();

const signalingEventsURL = "https://api.amazonalexa.com/v1/communications/signaling";
export function sendToAlexa(message, sessionId) {
    axios.post(signalingEventsURL, message, 
    {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        }
    }).catch(e => {
        console.error("Request to Alexa Failed");
        sendToWebApp({
            type: "error",
            message: `Got status ${e.response.status}: ${e.response.data.message}`
        }, getWebAppParticipantForSession(sessionId));
    });
}
